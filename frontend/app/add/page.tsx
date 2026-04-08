"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGamification } from "@/providers/gamification-provider";
import * as api from "@/lib/api";
import type { DictionaryResult } from "@/lib/types";

export default function AddWordPage() {
  const queryClient = useQueryClient();
  const { triggerGamification } = useGamification();

  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [context, setContext] = useState("");
  const [bookName, setBookName] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [suggestion, setSuggestion] = useState<DictionaryResult | null>(null);

  // Debounced dictionary lookup
  useEffect(() => {
    if (!word.trim() || word.trim().length < 2) {
      setSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const result = await api.lookupDictionary(word.trim());
        setSuggestion(result);
      } catch {
        setSuggestion(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [word]);

  const addWordMutation = useMutation({
    mutationFn: api.addWord,
    onSuccess: (data) => {
      setError("");
      setSuccess(
        `Added "${data.entry.word}" to ${data.entry.book_name} / ${data.entry.chapter_name}`,
      );

      // Trigger gamification events
      triggerGamification({
        xp_earned: data.xp_earned,
        new_total_xp: data.new_total_xp,
        level_up: data.level_up,
        achievements_unlocked: data.achievements_unlocked,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["dueWords"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["wotd"] });

      // Reset form
      setWord("");
      setMeaning("");
      setSynonyms("");
      setContext("");
      setSuggestion(null);
    },
    onError: (err: Error) => {
      setSuccess("");
      setError(err.message);
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      addWordMutation.mutate({
        word: word.trim(),
        meaning: meaning.trim(),
        synonyms: synonyms.trim(),
        context: context.trim(),
        book_name: bookName.trim(),
        chapter_name: chapterName.trim(),
      });
    },
    [word, meaning, synonyms, context, bookName, chapterName, addWordMutation],
  );

  const applySuggestion = useCallback(() => {
    if (suggestion) {
      if (!meaning) setMeaning(suggestion.meaning);
      if (!synonyms) setSynonyms(suggestion.synonyms);
    }
  }, [suggestion, meaning, synonyms]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Word</h1>
        <p className="text-muted-foreground mt-1">
          Add a new word to your vault
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Word Entry</CardTitle>
          <CardDescription>
            Fill in the details for your new vocabulary word
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="word" className="text-sm font-medium">
                Word *
              </label>
              <Input
                id="word"
                placeholder="e.g. ephemeral"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                required
              />
            </div>

            {/* Dictionary suggestion */}
            {suggestion && (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-primary">
                    📖 Dictionary suggestion
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={applySuggestion}
                  >
                    Apply
                  </Button>
                </div>
                <p className="text-sm">{suggestion.meaning}</p>
                {suggestion.synonyms && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Synonyms: {suggestion.synonyms}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="meaning" className="text-sm font-medium">
                Meaning *
              </label>
              <Textarea
                id="meaning"
                placeholder="Definition of the word"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="synonyms" className="text-sm font-medium">
                Synonyms
              </label>
              <Input
                id="synonyms"
                placeholder="e.g. fleeting, transient, brief"
                value={synonyms}
                onChange={(e) => setSynonyms(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="context" className="text-sm font-medium">
                Context Sentence
              </label>
              <Textarea
                id="context"
                placeholder="A sentence using the word in context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="bookName" className="text-sm font-medium">
                  Book Name *
                </label>
                <Input
                  id="bookName"
                  placeholder="e.g. Sapiens"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="chapterName" className="text-sm font-medium">
                  Chapter Name *
                </label>
                <Input
                  id="chapterName"
                  placeholder="e.g. The Cognitive Revolution"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-accent bg-accent/10 rounded-md px-3 py-2">
                ✅ {success}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={addWordMutation.isPending}
            >
              {addWordMutation.isPending ? "Adding..." : "Add Word"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
