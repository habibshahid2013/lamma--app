"use client";

import { Card, CardContent } from "@/components/ui/card";
import ExternalLink from "@/components/ui/ExternalLink";
import { Book } from "lucide-react";
import type { BookContent } from "@/lib/types/creator";

interface BookListProps {
  books: BookContent[];
  creatorName?: string;
}

export default function BookList({ books, creatorName }: BookListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {creatorName ? `Books by ${creatorName}` : "Books"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book, i) => (
          <Card
            key={book.bookId || i}
            className="group transition-all hover:border-primary/30"
          >
            <CardContent className="flex items-start gap-4 p-5">
              {book.thumbnail || book.imageUrl ? (
                <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={book.thumbnail || book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-gold/10 p-3">
                  <Book className="h-6 w-6 text-gold-deep dark:text-gold" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                  {book.title}
                </h3>
                {book.authors && book.authors.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    by {book.authors.join(", ")}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                  {book.publishedDate && (
                    <span>
                      {new Date(book.publishedDate).getFullYear()}
                    </span>
                  )}
                  {book.year && !book.publishedDate && (
                    <span>{book.year}</span>
                  )}
                  {book.publisher && <span>{book.publisher}</span>}
                  {book.pageCount && <span>{book.pageCount} pages</span>}
                </div>
                {book.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {book.description}
                  </p>
                )}
                {book.categories && book.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {book.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 mt-3">
                  {book.previewLink && (
                    <ExternalLink
                      href={book.previewLink}
                      className="text-xs text-primary hover:underline"
                    >
                      Preview
                    </ExternalLink>
                  )}
                  {book.amazonUrl && (
                    <ExternalLink
                      href={book.amazonUrl}
                      className="text-xs text-primary hover:underline"
                    >
                      Amazon
                    </ExternalLink>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
