'use client';

import type { NewsArticle } from '@/lib/types/creator';
import ExternalLink from '@/components/ui/ExternalLink';
import { Newspaper } from 'lucide-react';

interface NewsListProps {
  articles: NewsArticle[];
}

export default function NewsList({ articles }: NewsListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>No news articles found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">In the News</h2>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {articles.map((article, idx) => (
          <ExternalLink key={idx} href={article.url} className="group">
            <div className="flex gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all bg-card">
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-2 group-hover:text-primary transition text-sm">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/70">{article.source}</span>
                  {article.publishedAt && (
                    <>
                      <span>-</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </ExternalLink>
        ))}
      </div>
    </div>
  );
}
