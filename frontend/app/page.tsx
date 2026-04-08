"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";

export default function DashboardPage() {
  const wotd = useQuery({
    queryKey: ["wotd"],
    queryFn: api.getWotd,
    retry: false,
  });

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: api.getProfile,
    retry: false,
  });

  const dueWords = useQuery({
    queryKey: ["dueWords"],
    queryFn: () => api.getDueWords(),
    retry: false,
  });

  const isEmpty = profile.data && profile.data.total_words === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your vocabulary RPG headquarters
        </p>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="text-5xl mb-4">📚</span>
            <h2 className="text-xl font-semibold mb-2">Your vault is empty</h2>
            <p className="text-muted-foreground mb-4">
              Add your first word to start your vocabulary journey!
            </p>
            <Link href="/add">
              <Button>Add Your First Word</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Due Review Banner */}
      {dueWords.data && dueWords.data.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="font-semibold">
                  {dueWords.data.length} word
                  {dueWords.data.length !== 1 ? "s" : ""} due for review
                </p>
                <p className="text-sm text-muted-foreground">
                  Keep your streak alive!
                </p>
              </div>
            </div>
            <Link href="/review">
              <Button size="sm">Start Review</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Grid */}
      {profile.data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {profile.data.total_xp}
              </p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-lg font-bold text-secondary-foreground">
                {profile.data.reader_level}
              </p>
              <p className="text-xs text-muted-foreground">Reader Level</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">
                {profile.data.current_streak}
                {profile.data.current_streak >= 2 && " 🔥"}
              </p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{profile.data.total_words}</p>
              <p className="text-xs text-muted-foreground">Words</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{profile.data.total_books}</p>
              <p className="text-xs text-muted-foreground">Books</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Word of the Day */}
      {wotd.data && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <CardTitle className="text-lg">Word of the Day</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="text-2xl font-bold text-primary">
              {wotd.data.word}
            </h3>
            <p className="text-foreground">{wotd.data.meaning}</p>
            {wotd.data.synonyms && (
              <div className="flex flex-wrap gap-1.5">
                {wotd.data.synonyms.split(",").map((s) => (
                  <Badge key={s.trim()} variant="secondary">
                    {s.trim()}
                  </Badge>
                ))}
              </div>
            )}
            {wotd.data.context && (
              <blockquote className="border-l-2 border-primary/30 pl-3 italic text-muted-foreground">
                {wotd.data.context}
              </blockquote>
            )}
            <p className="text-xs text-muted-foreground">
              📖 {wotd.data.book_name} / {wotd.data.chapter_name}
            </p>
          </CardContent>
        </Card>
      )}

      {wotd.isError && !isEmpty && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <span className="text-3xl block mb-2">✨</span>
            <p>No Word of the Day yet. Add some words to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
