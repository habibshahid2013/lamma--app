/**
 * Google Books API Client
 * Search and fetch book metadata
 */

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const BASE_URL = 'https://www.googleapis.com/books/v1';

export interface BookResult {
  bookId: string;
  title: string;
  authors: string[];
  description: string | null;
  thumbnail: string | null;
  publishedDate: string | null;
  publisher: string | null;
  pageCount: number | null;
  previewLink: string | null;
  amazonUrl: string | null; // Constructed from ISBN
  isbn: string | null;
  categories: string[];
}

/**
 * Search for books by author name
 */
export async function searchBooksByAuthor(authorName: string, maxResults = 10): Promise<BookResult[]> {
  try {
    const query = `inauthor:${authorName}`;
    let url = `${BASE_URL}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance`;
    
    if (GOOGLE_BOOKS_API_KEY) {
      url += `&key=${GOOGLE_BOOKS_API_KEY}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items?.length) return [];

    return data.items.map((item: any) => parseBookItem(item));
  } catch (error) {
    console.error('Google Books search error:', error);
    return [];
  }
}

/**
 * Search for books by title
 */
export async function searchBooksByTitle(title: string): Promise<BookResult | null> {
  try {
    let url = `${BASE_URL}/volumes?q=intitle:${encodeURIComponent(title)}&maxResults=1`;
    
    if (GOOGLE_BOOKS_API_KEY) {
      url += `&key=${GOOGLE_BOOKS_API_KEY}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.items?.length) return null;

    return parseBookItem(data.items[0]);
  } catch (error) {
    console.error('Google Books title search error:', error);
    return null;
  }
}

function parseBookItem(item: any): BookResult {
  const info = item.volumeInfo || {};
  const isbn = info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier 
            || info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier;

  return {
    bookId: item.id,
    title: info.title || 'Unknown Title',
    authors: info.authors || [],
    description: info.description?.substring(0, 500) || null,
    thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
    publishedDate: info.publishedDate || null,
    publisher: info.publisher || null,
    pageCount: info.pageCount || null,
    previewLink: info.previewLink || null,
    amazonUrl: isbn ? `https://www.amazon.com/dp/${isbn}` : null,
    isbn: isbn || null,
    categories: info.categories || [],
  };
}
