"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";

export default function BooksPage() {
  const books = useQuery({
    queryKey: ["books"],
    queryFn: api.getBooks,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Books</h1>
        <p className="text-muted-foreground mt-1">Your book library</p>
      </div>

      {books.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-lg h-28" />
          ))}
        </div>
      )}

      {books.isError && (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load books</p>
          <button onClick={() => books.refetch()} className="text-primary underline">Try again</button>
        </div>
      )}

      {books.data && books.data.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12">
            <span className="text-5xl mb-4">📚</span>
            <h2 className="text-xl font-semibold mb-2">No books yet</h2>
            <p className="text-muted-foreground mb-4">
              Add your first word to create a book!
            </p>
            <Link href="/add">
              <Button>Add a Word</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {books.data && books.data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.data.map((book) => (
            <Link
              key={book.name}
              href={`/books/${encodeURIComponent(book.name)}`}
            >
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{book.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      📖 {book.chapter_count} chapter
                      {book.chapter_count !== 1 ? "s" : ""}
                    </span>
                    <span>
                      📝 {book.word_count} word
                      {book.word_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
