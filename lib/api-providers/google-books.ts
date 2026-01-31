// src/lib/api-providers/google-books.ts
// Google Books API Provider
// Fetches books, authors, and publication info

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BOOKS_API_BASE = 'https://www.googleapis.com/books/v1';

export interface BookData {
  bookId: string;
  title: string;
  subtitle: string | null;
  authors: string[];
  publisher: string | null;
  publishedDate: string | null;
  description: string | null;
  pageCount: number | null;
  categories: string[];
  averageRating: number | null;
  ratingsCount: number | null;
  imageUrl: string | null;
  previewLink: string | null;
  infoLink: string | null;
  buyLink: string | null;
  isbn10: string | null;
  isbn13: string | null;
  language: string | null;
}

export interface AuthorBooksResult {
  authorName: string;
  totalBooks: number;
  books: BookData[];
}

export class GoogleBooksProvider {

  // Search for books by author name
  async searchBooksByAuthor(authorName: string, maxResults = 20): Promise<AuthorBooksResult> {
    const query = `inauthor:"${authorName}"`;
    
    try {
      let url = `${BOOKS_API_BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance&printType=books`;
      
      if (GOOGLE_API_KEY) {
        url += `&key=${GOOGLE_API_KEY}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!data.items) {
        return { authorName, totalBooks: 0, books: [] };
      }

      // Filter to only books where the author matches
      const normalizedAuthor = authorName.toLowerCase().replace(/[^a-z\s]/g, '');
      
      const books = data.items
        .filter((item: any) => {
          const authors = item.volumeInfo?.authors || [];
          return authors.some((author: string) => {
            const normalizedBookAuthor = author.toLowerCase().replace(/[^a-z\s]/g, '');
            return normalizedBookAuthor.includes(normalizedAuthor) || normalizedAuthor.includes(normalizedBookAuthor);
          });
        })
        .map((item: any) => this.formatBookData(item))
        .filter((book: BookData) => book.title); // Remove items without titles

      // Remove duplicates by title
      const uniqueBooks = this.removeDuplicates(books);

      return {
        authorName,
        totalBooks: uniqueBooks.length,
        books: uniqueBooks,
      };
    } catch (error) {
      console.error('Google Books search error:', error);
      return { authorName, totalBooks: 0, books: [] };
    }
  }

  // Search for a specific book by title and author
  async searchBook(title: string, author?: string): Promise<BookData | null> {
    try {
      let query = `intitle:"${title}"`;
      if (author) {
        query += `+inauthor:"${author}"`;
      }

      let url = `${BOOKS_API_BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=5`;
      
      if (GOOGLE_API_KEY) {
        url += `&key=${GOOGLE_API_KEY}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return null;
      }

      // Find best match
      const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
      let bestMatch = data.items[0];

      for (const item of data.items) {
        const bookTitle = (item.volumeInfo?.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (bookTitle === normalizedTitle || bookTitle.includes(normalizedTitle)) {
          bestMatch = item;
          break;
        }
      }

      return this.formatBookData(bestMatch);
    } catch (error) {
      console.error('Google Books title search error:', error);
      return null;
    }
  }

  // Get book by Google Books ID
  async getBookById(bookId: string): Promise<BookData | null> {
    try {
      let url = `${BOOKS_API_BASE}/volumes/${bookId}`;
      
      if (GOOGLE_API_KEY) {
        url += `?key=${GOOGLE_API_KEY}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) return null;

      const item = await response.json();
      return this.formatBookData(item);
    } catch (error) {
      console.error('Google Books get by ID error:', error);
      return null;
    }
  }

  // Search Islamic/religious books by a person
  async searchIslamicBooksByAuthor(authorName: string): Promise<AuthorBooksResult> {
    // Add Islamic-related terms to improve relevance
    const query = `inauthor:"${authorName}" (islam OR islamic OR muslim OR quran OR hadith OR sunnah OR fiqh OR tafsir OR spirituality)`;
    
    try {
      let url = `${BOOKS_API_BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=20&orderBy=relevance&printType=books`;
      
      if (GOOGLE_API_KEY) {
        url += `&key=${GOOGLE_API_KEY}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!data.items) {
        // Fall back to regular author search
        return this.searchBooksByAuthor(authorName);
      }

      const books = data.items
        .map((item: any) => this.formatBookData(item))
        .filter((book: BookData) => book.title);

      const uniqueBooks = this.removeDuplicates(books);

      return {
        authorName,
        totalBooks: uniqueBooks.length,
        books: uniqueBooks,
      };
    } catch (error) {
      console.error('Google Books Islamic search error:', error);
      return this.searchBooksByAuthor(authorName);
    }
  }

  // Format book data from API response
  private formatBookData(item: any): BookData {
    const volumeInfo = item.volumeInfo || {};
    const saleInfo = item.saleInfo || {};
    const identifiers = volumeInfo.industryIdentifiers || [];

    // Get ISBNs
    const isbn10 = identifiers.find((id: any) => id.type === 'ISBN_10')?.identifier || null;
    const isbn13 = identifiers.find((id: any) => id.type === 'ISBN_13')?.identifier || null;

    // Get image URL (prefer larger images)
    let imageUrl = volumeInfo.imageLinks?.large ||
                   volumeInfo.imageLinks?.medium ||
                   volumeInfo.imageLinks?.small ||
                   volumeInfo.imageLinks?.thumbnail ||
                   null;
    
    // Fix HTTP to HTTPS
    if (imageUrl && imageUrl.startsWith('http:')) {
      imageUrl = imageUrl.replace('http:', 'https:');
    }

    return {
      bookId: item.id,
      title: volumeInfo.title || '',
      subtitle: volumeInfo.subtitle || null,
      authors: volumeInfo.authors || [],
      publisher: volumeInfo.publisher || null,
      publishedDate: volumeInfo.publishedDate || null,
      description: volumeInfo.description?.substring(0, 500) || null,
      pageCount: volumeInfo.pageCount || null,
      categories: volumeInfo.categories || [],
      averageRating: volumeInfo.averageRating || null,
      ratingsCount: volumeInfo.ratingsCount || null,
      imageUrl,
      previewLink: volumeInfo.previewLink || null,
      infoLink: volumeInfo.infoLink || null,
      buyLink: saleInfo.buyLink || null,
      isbn10,
      isbn13,
      language: volumeInfo.language || null,
    };
  }

  // Remove duplicate books by title similarity
  private removeDuplicates(books: BookData[]): BookData[] {
    const seen = new Set<string>();
    return books.filter(book => {
      const normalizedTitle = book.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(normalizedTitle)) {
        return false;
      }
      seen.add(normalizedTitle);
      return true;
    });
  }

  // Generate Amazon search URL for a book
  generateAmazonUrl(book: BookData): string {
    if (book.isbn13) {
      return `https://www.amazon.com/dp/${book.isbn13}`;
    }
    if (book.isbn10) {
      return `https://www.amazon.com/dp/${book.isbn10}`;
    }
    // Fall back to search
    const searchQuery = `${book.title} ${book.authors.join(' ')}`;
    return `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`;
  }
}
