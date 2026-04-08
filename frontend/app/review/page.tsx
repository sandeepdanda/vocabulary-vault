"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGamification } from "@/providers/gamification-provider";
import * as api from "@/lib/api";
import type {
  WordResponse,
  ReviewAnswerResponse,
  ReviewSessionSummary,
} from "@/lib/types";

type ReviewState = "loading" | "reviewing" | "feedback" | "summary" | "empty";

export default function ReviewPage() {
  const queryClient = useQueryClient();
  const { triggerGamification } = useGamification();

  const [reviewState, setReviewState] = useState<ReviewState>("loading");
  const [words, setWords] = useState<WordResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<ReviewAnswerResponse | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [masteredWords, setMasteredWords] = useState<string[]>([]);
  const [summary, setSummary] = useState<ReviewSessionSummary | null>(null);
  const [answerError, setAnswerError] = useState(false);
  const [completeError, setCompleteError] = useState(false);

  const dueQuery = useQuery({
    queryKey: ["dueWordsReview"],
    queryFn: () => api.getDueWords(),
    retry: false,
  });

  useEffect(() => {
    if (dueQuery.data) {
      if (dueQuery.data.length === 0) {
        setReviewState("empty");
      } else {
        setWords(dueQuery.data);
        setReviewState("reviewing");
      }
    }
  }, [dueQuery.data]);

  const answerMutation = useMutation({
    mutationFn: ({ wordId, answer }: { wordId: number; answer: string }) =>
      api.submitAnswer(wordId, answer),
    onSuccess: (data) => {
      setAnswerError(false);
      setFeedback(data);
      if (data.correct) {
        setCorrectCount((c) => c + 1);
      }
      if (data.new_mastery >= 5) {
        setMasteredWords((prev) => [...prev, data.correct_word]);
      }
      setReviewState("feedback");
    },
    onError: () => {
      setAnswerError(true);
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => api.completeReview(correctCount, words.length),
    onSuccess: (data) => {
      setCompleteError(false);
      setSummary(data);
      setReviewState("summary");

      triggerGamification({
        xp_earned: data.xp_earned,
        new_total_xp: data.new_total_xp,
        level_up: data.level_up,
        achievements_unlocked: data.achievements_unlocked,
      });

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dueWords"] });
    },
    onError: () => {
      setCompleteError(true);
    },
  });

  const currentWord = words[currentIndex];

  const getPrompt = useCallback((word: WordResponse) => {
    if (
      word.context &&
      word.context.toLowerCase().includes(word.word.toLowerCase())
    ) {
      // Replace the word with blanks in the context
      const regex = new RegExp(`\\b${word.word}\\b`, "gi");
      return {
        type: "context" as const,
        text: word.context.replace(regex, "_____"),
        source: `${word.book_name} / ${word.chapter_name}`,
      };
    }
    return {
      type: "meaning" as const,
      text: word.meaning,
      source: `${word.book_name} / ${word.chapter_name}`,
    };
  }, []);

  const handleSubmitAnswer = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentWord || !answer.trim()) return;
      answerMutation.mutate({
        wordId: currentWord.id,
        answer: answer.trim(),
      });
    },
    [currentWord, answer, answerMutation],
  );

  const handleSkip = useCallback(() => {
    if (!currentWord) return;
    answerMutation.mutate({ wordId: currentWord.id, answer: "" });
  }, [currentWord, answerMutation]);

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= words.length) {
      // Session complete
      completeMutation.mutate();
    } else {
      setCurrentIndex(nextIndex);
      setAnswer("");
      setFeedback(null);
      setReviewState("reviewing");
    }
  }, [currentIndex, words.length, completeMutation]);

  useEffect(() => {
    if (reviewState !== "feedback") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reviewState, handleNext]);

  if (reviewState === "loading" || dueQuery.isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Review</h1>
        <div className="animate-pulse bg-muted rounded-lg h-8 w-full" />
        <div className="animate-pulse bg-muted rounded-lg h-56" />
      </div>
    );
  }

  if (reviewState === "empty") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Review</h1>
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <span className="text-5xl mb-4">🎉</span>
            <h2 className="text-xl font-semibold mb-2">No words due!</h2>
            <p className="text-muted-foreground">
              All caught up. Check back tomorrow for your next review session.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reviewState === "summary" && summary) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Review Complete!</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Session Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <span className="text-5xl block mb-4">
                {summary.correct_count === summary.total_count ? "🏆" : "📊"}
              </span>
              <p className="text-4xl font-bold">
                {summary.correct_count}/{summary.total_count}
              </p>
              <p className="text-muted-foreground mt-1">correct answers</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-2xl font-bold text-primary">
                  +{summary.xp_earned} XP
                </p>
                <p className="text-xs text-muted-foreground">earned</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-4">
                <p className="text-2xl font-bold">
                  {summary.streak}
                  {summary.streak >= 2 && " 🔥"}
                </p>
                <p className="text-xs text-muted-foreground">day streak</p>
              </div>
            </div>

            {masteredWords.length > 0 && (
              <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4 text-center">
                <span className="text-2xl">⭐</span>
                <p className="font-semibold mt-1">Word Mastered!</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {masteredWords.map((w) => (
                    <Badge key={w} variant="secondary">
                      {w}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.achievements_unlocked.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-center">
                  Achievements Unlocked!
                </p>
                {summary.achievements_unlocked.map((a) => (
                  <div
                    key={a.key}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reviewing or feedback state
  const prompt = currentWord ? getPrompt(currentWord) : null;

  if (completeError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Review Complete!</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Session Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold">
                {correctCount}/{words.length}
              </p>
              <p className="text-muted-foreground mt-1">correct answers</p>
            </div>
            <p className="text-sm text-destructive text-center">
              Could not save your session to the server.
            </p>
            <Button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Review</h1>
        <span className="text-sm text-muted-foreground font-medium">
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      <Progress value={currentIndex + 1} max={words.length} />

      {currentWord && prompt && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {prompt.type === "context"
                  ? "Fill in the blank"
                  : "Name the word"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                📖 {prompt.source}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed">
              {prompt.type === "context" ? (
                <span className="italic">&ldquo;{prompt.text}&rdquo;</span>
              ) : (
                <span>{prompt.text}</span>
              )}
            </p>

            {reviewState === "reviewing" && (
              <form onSubmit={handleSubmitAnswer} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your answer..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    autoFocus
                    disabled={answerMutation.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={!answer.trim() || answerMutation.isPending}
                  >
                    Submit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={answerMutation.isPending}
                  >
                    I don&apos;t know
                  </Button>
                </div>
                {answerError && (
                  <p className="text-sm text-destructive">
                    Failed to submit answer.{" "}
                    <button
                      type="submit"
                      className="underline hover:no-underline"
                    >
                      Retry
                    </button>
                  </p>
                )}
              </form>
            )}

            {reviewState === "feedback" && feedback && (
              <div className="space-y-3">
                <div
                  className={`rounded-lg p-4 ${
                    feedback.correct
                      ? "bg-green-500/10 border border-green-500/30"
                      : "bg-destructive/10 border border-destructive/30"
                  }`}
                >
                  <p className="font-semibold">
                    {feedback.correct ? "✅ Correct!" : "❌ Incorrect"}
                  </p>
                  <p className="text-sm mt-1">
                    The word is:{" "}
                    <span className="font-bold">{feedback.correct_word}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mastery: Level {feedback.new_mastery}/5
                  </p>
                </div>
                <Button onClick={handleNext} className="w-full">
                  {currentIndex + 1 >= words.length
                    ? "Finish Session"
                    : "Next Word"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
