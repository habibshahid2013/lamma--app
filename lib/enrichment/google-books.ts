/**
 * Google Books Enrichment Service
 * Searches for books by author name using Google Books API (FREE — 40K queries/day)
 */

import { BookContent } from '@/lib/types/creator';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
    previewLink?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

/**
 * Clean Islamic titles/honorifics from name for better search matching
 */
function cleanAuthorName(name: string): string {
  return name
    .replace(/^(Sheikh|Shaykh|Shaykha|Ustadh|Ustadha|Ustaz|Ustadz|Maulana|Imam|Mufti|Qari|Dr\.|Br\.|Sr\.)\s+/i, '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim();
}

/**
 * Check if an author list likely matches the target person
 */
function authorMatches(bookAuthors: string[], targetName: string): boolean {
  const cleanTarget = cleanAuthorName(targetName).toLowerCase();
  const targetParts = cleanTarget.split(/\s+/).filter(p => p.length >= 3);

  return bookAuthors.some(author => {
    const lowerAuthor = author.toLowerCase();
    const matchCount = targetParts.filter(part => lowerAuthor.includes(part)).length;
    return matchCount >= Math.min(2, targetParts.length);
  });
}

/**
 * Search Google Books for books by a given author
 */
export async function searchBooksByAuthor(authorName: string): Promise<BookContent[]> {
  const cleanName = cleanAuthorName(authorName);

  const params = new URLSearchParams({
    q: `inauthor:"${cleanName}"`,
    maxResults: '20',
    printType: 'books',
    orderBy: 'relevance',
  });
  if (GOOGLE_API_KEY) params.set('key', GOOGLE_API_KEY);

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    const items: GoogleBooksVolume[] = data.items || [];

    const books: BookContent[] = [];
    const seenTitles = new Set<string>();

    for (const item of items) {
      const info = item.volumeInfo;
      if (!info.title || !info.authors) continue;

      // Verify author match
      if (!authorMatches(info.authors, authorName)) continue;

      // Dedupe by normalized title
      const normalizedTitle = info.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenTitles.has(normalizedTitle)) continue;
      seenTitles.add(normalizedTitle);

      // Extract ISBN
      const isbn = info.industryIdentifiers?.find(
        id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )?.identifier;

      books.push({
        title: info.title,
        authors: info.authors,
        description: info.description?.substring(0, 300),
        thumbnail: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail,
        publishedDate: info.publishedDate,
        publisher: info.publisher,
        pageCount: info.pageCount,
        previewLink: info.previewLink,
        isbn,
        year: info.publishedDate ? parseInt(info.publishedDate.substring(0, 4)) : undefined,
        categories: info.categories,
      });
    }

    return books.slice(0, 10); // Cap at 10 books
  } catch (err) {
    console.error(`Google Books search error for "${authorName}":`, err);
    return [];
  }
}
