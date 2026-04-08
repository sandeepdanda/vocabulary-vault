"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";

export default function BookDetailPage({
  params,
}: {
  params: { name: string };
}) {
  const bookName = decodeURIComponent(params.name);

  const book = useQuery({
    queryKey: ["book", bookName],
    queryFn: () => api.getBookDetails(bookName),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/books">
          <Button variant="ghost" size="sm">
            ← Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{bookName}</h1>
          {book.data && (
            <p className="text-muted-foreground mt-1">
              {book.data.chapter_count} chapter
              {book.data.chapter_count !== 1 ? "s" : ""} ·{" "}
              {book.data.word_count} word{book.data.word_count !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {book.isLoading && (
        <p className="text-muted-foreground">Loading chapters...</p>
      )}

      {book.data && (
        <div className="space-y-3">
          {book.data.chapters.map((chapter) => (
            <Card key={chapter.chapter_number}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Chapter {chapter.chapter_number}: {chapter.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>
                    📝 {chapter.word_count} word
                    {chapter.word_count !== 1 ? "s" : ""}
                  </span>
                  {chapter.earliest_entry && (
                    <span>
                      📅 {chapter.earliest_entry}
                      {chapter.latest_entry &&
                      chapter.latest_entry !== chapter.earliest_entry
                        ? ` – ${chapter.latest_entry}`
                        : ""}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
