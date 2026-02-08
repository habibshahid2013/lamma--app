/**
 * NewsAPI.org Enrichment Service
 * Searches for news articles about creators.
 * Free tier: 100 requests/day, 80K+ sources.
 */

import type { NewsArticle } from '@/lib/types/creator';

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const NEWSAPI_BASE = 'https://newsapi.org/v2/everything';

/**
 * Clean Islamic titles from name for search
 */
function cleanName(name: string): string {
  return name
    .replace(/^(Sheikh|Shaykh|Shaykha|Ustadh|Ustadha|Ustaz|Ustadz|Maulana|Imam|Mufti|Qari|Dr\.|Br\.|Sr\.)\s+/i, '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim();
}

/**
 * Validate that the article is relevant to the creator
 */
function isRelevantArticle(article: any, targetName: string): boolean {
  const cleanTarget = cleanName(targetName).toLowerCase();
  const targetParts = cleanTarget.split(/\s+/).filter((p: string) => p.length >= 3);

  const title = (article.title || '').toLowerCase();
  const description = (article.description || '').toLowerCase();
  const searchText = `${title} ${description}`;

  // At least 2 name parts must appear in title or description
  const matchCount = targetParts.filter((part: string) => searchText.includes(part)).length;
  return matchCount >= Math.min(2, targetParts.length);
}

/**
 * Search NewsAPI for articles about a creator.
 * Returns up to 5 relevant articles sorted by relevancy.
 */
export async function searchNews(name: string): Promise<NewsArticle[]> {
  if (!NEWSAPI_KEY) return [];

  const cleanedName = cleanName(name);

  try {
    const params = new URLSearchParams({
      q: `"${cleanedName}"`,
      sortBy: 'relevancy',
      pageSize: '10',
      language: 'en',
      apiKey: NEWSAPI_KEY,
    });

    const res = await fetch(`${NEWSAPI_BASE}?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    const articles = data.articles || [];

    const results: NewsArticle[] = [];

    for (const article of articles) {
      if (results.length >= 5) break;
      if (!isRelevantArticle(article, name)) continue;
      if (!article.title || !article.url) continue;
      // Skip "[Removed]" placeholder articles
      if (article.title === '[Removed]') continue;

      results.push({
        title: article.title,
        description: article.description || undefined,
        url: article.url,
        imageUrl: article.urlToImage || undefined,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt || undefined,
      });
    }

    return results;
  } catch (err) {
    console.error(`NewsAPI search error for "${name}":`, err);
    return [];
  }
}
