// components/creator/CreatorContent.tsx
// Content display for Books, eBooks, Audiobooks, and Courses
// Uses shadcn/ui with modern card-based layout

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sanitizeExternalUrl } from '@/lib/utils/links';
import type { BookContent, EbookContent, AudiobookContent, CourseContent } from '@/lib/types/creator';
import {
  Book,
  Smartphone,
  Headphones,
  GraduationCap,
  ExternalLink,
  ShoppingCart,
  Calendar,
  Users,
  FileText,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface CreatorContentProps {
  books?: BookContent[];
  ebooks?: EbookContent[];
  audiobooks?: AudiobookContent[];
  courses?: CourseContent[];
  creatorName?: string;
  className?: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function BookCard({ book }: { book: BookContent }) {
  const thumbnailUrl = book.thumbnail || book.imageUrl;

  return (
    <div className="group flex gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      {/* Book Cover */}
      <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <Book className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white line-clamp-2 group-hover:text-gold transition">
          {book.title}
        </h4>

        {book.authors && book.authors.length > 0 && (
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {book.authors.join(', ')}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
          {(book.publishedDate || book.year) && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {book.year || (book.publishedDate && new Date(book.publishedDate).getFullYear())}
            </span>
          )}
          {book.publisher && (
            <span>{book.publisher}</span>
          )}
          {book.pageCount && (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {book.pageCount} pages
            </span>
          )}
        </div>

        {book.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {book.description}
          </p>
        )}

        {/* Categories */}
        {book.categories && book.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {book.categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded text-xs"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-2 mt-3">
          {book.previewLink && (
            <a
              href={sanitizeExternalUrl(book.previewLink) || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm" className="h-7 text-xs text-gold hover:text-gold">
                <ExternalLink className="w-3 h-3 mr-1" />
                Preview
              </Button>
            </a>
          )}
          {book.amazonUrl && (
            <a
              href={sanitizeExternalUrl(book.amazonUrl) || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-400 hover:text-amber-300">
                <ShoppingCart className="w-3 h-3 mr-1" />
                Amazon
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function EbookCard({ ebook }: { ebook: EbookContent }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
        <Smartphone className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white">{ebook.title}</h4>
        {ebook.platform && (
          <p className="text-sm text-muted-foreground mt-1">{ebook.platform}</p>
        )}
        {ebook.year && (
          <p className="text-xs text-muted-foreground mt-1">{ebook.year}</p>
        )}
        {ebook.url && (
          <a
            href={sanitizeExternalUrl(ebook.url) || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gold hover:underline mt-2 inline-flex items-center gap-1"
          >
            Get eBook
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function AudiobookCard({ audiobook }: { audiobook: AudiobookContent }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className="p-2 bg-orange-500/20 rounded-lg flex-shrink-0">
        <Headphones className="w-5 h-5 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white">{audiobook.title}</h4>
        {audiobook.platform && (
          <p className="text-sm text-muted-foreground mt-1">{audiobook.platform}</p>
        )}
        {audiobook.year && (
          <p className="text-xs text-muted-foreground mt-1">{audiobook.year}</p>
        )}
        {audiobook.url && (
          <a
            href={sanitizeExternalUrl(audiobook.url) || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gold hover:underline mt-2 inline-flex items-center gap-1"
          >
            Listen
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: CourseContent }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className="p-3 bg-blue-500/20 rounded-xl flex-shrink-0">
        <GraduationCap className="w-6 h-6 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-lg">{course.title}</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Platform: {course.platform}
        </p>
        {course.url && (
          <a
            href={sanitizeExternalUrl(course.url) || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block"
          >
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gold/30 text-gold hover:bg-gold/10 gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              View Course
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CreatorContent({
  books = [],
  ebooks = [],
  audiobooks = [],
  courses = [],
  creatorName = 'Creator',
  className,
}: CreatorContentProps) {
  const hasBooks = books.length > 0;
  const hasEbooks = ebooks.length > 0;
  const hasAudiobooks = audiobooks.length > 0;
  const hasCourses = courses.length > 0;

  const tabs = [
    hasBooks && { key: 'books', label: `Books (${books.length})`, icon: Book },
    hasEbooks && { key: 'ebooks', label: `eBooks (${ebooks.length})`, icon: Smartphone },
    hasAudiobooks && { key: 'audiobooks', label: `Audiobooks (${audiobooks.length})`, icon: Headphones },
    hasCourses && { key: 'courses', label: `Courses (${courses.length})`, icon: GraduationCap },
  ].filter(Boolean) as Array<{ key: string; label: string; icon: React.ComponentType<{ className?: string }> }>;

  if (tabs.length === 0) {
    return null;
  }

  return (
    <Card className={cn(
      'border-white/10 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40',
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Content Library</CardTitle>
        <span className="px-2 py-1 text-xs rounded-full bg-amber-500/10 text-amber-400">
          {books.length + ebooks.length + audiobooks.length + courses.length} items
        </span>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={tabs[0].key}>
          <TabsList className={cn(
            'grid w-full bg-white/[0.03]',
            tabs.length === 1 && 'grid-cols-1',
            tabs.length === 2 && 'grid-cols-2',
            tabs.length === 3 && 'grid-cols-3',
            tabs.length >= 4 && 'grid-cols-4'
          )}>
            {tabs.map(({ key, label, icon: Icon }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="gap-2 text-xs data-[state=active]:bg-white/10"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Books Tab */}
          {hasBooks && (
            <TabsContent value="books" className="mt-4">
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-3">
                  {books.map((book, index) => (
                    <BookCard key={book.bookId || `book-${index}`} book={book} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {/* eBooks Tab */}
          {hasEbooks && (
            <TabsContent value="ebooks" className="mt-4">
              <ScrollArea className="h-[400px] pr-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  {ebooks.map((ebook, index) => (
                    <EbookCard key={`ebook-${index}`} ebook={ebook} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Audiobooks Tab */}
          {hasAudiobooks && (
            <TabsContent value="audiobooks" className="mt-4">
              <ScrollArea className="h-[400px] pr-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  {audiobooks.map((audiobook, index) => (
                    <AudiobookCard key={`audiobook-${index}`} audiobook={audiobook} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Courses Tab */}
          {hasCourses && (
            <TabsContent value="courses" className="mt-4">
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-3">
                  {courses.map((course, index) => (
                    <CourseCard key={`course-${index}`} course={course} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default CreatorContent;
