"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as api from "@/lib/api";
import type { WordResponse } from "@/lib/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WordResponse[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchWords(query.trim());
        setResults(data);
        setSearched(true);
      } catch {
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground mt-1">
          Search your word collection
        </p>
      </div>

      <Input
        placeholder="Search words, meanings, context..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="text-lg h-12"
        autoFocus
      />

      {loading && <p className="text-sm text-muted-foreground">Searching...</p>}

      {!query.trim() && !searched && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-muted-foreground">
              Search your vault by word, meaning, or context
            </p>
          </CardContent>
        </Card>
      )}

      {searched && results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <span className="text-5xl mb-4">🤷</span>
            <p className="text-muted-foreground">
              No words found for &ldquo;{query}&rdquo;
            </p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          {results.map((word) => (
            <Card key={`${word.id}-${word.book_name}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-primary">
                    {word.word}
                  </CardTitle>
                  <Badge variant="outline">
                    Mastery {word.mastery_level}/5
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{word.meaning}</p>
                {word.context && (
                  <blockquote className="border-l-2 border-primary/30 pl-3 text-sm italic text-muted-foreground">
                    {word.context}
                  </blockquote>
                )}
                <p className="text-xs text-muted-foreground">
                  📖 {word.book_name} / {word.chapter_name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
