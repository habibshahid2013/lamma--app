/**
 * iTunes/Apple Podcasts Discovery Service
 * Searches for podcasts by scholar name using iTunes Search API (FREE — no auth required)
 */

import { PodcastContent } from '@/lib/types/creator';

interface iTunesResult {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl600?: string;
  artworkUrl100?: string;
  feedUrl?: string;
  collectionViewUrl?: string;
  trackCount: number;
  primaryGenreName?: string;
  genres?: string[];
}

/**
 * Clean Islamic titles/honorifics from name for search
 */
function cleanName(name: string): string {
  return name
    .replace(/^(Sheikh|Shaykh|Shaykha|Ustadh|Ustadha|Ustaz|Ustadz|Maulana|Imam|Mufti|Qari|Dr\.|Br\.|Sr\.)\s+/i, '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim();
}

/**
 * Check if a podcast is likely by/about the target person
 */
function isPodcastRelevant(result: iTunesResult, targetName: string): boolean {
  const cleanTarget = cleanName(targetName).toLowerCase();
  const targetParts = cleanTarget.split(/\s+/).filter(p => p.length >= 3);

  const searchText = `${result.collectionName} ${result.artistName}`.toLowerCase();
  const matchCount = targetParts.filter(part => searchText.includes(part)).length;

  // Require at least 2 name parts to match (or all parts if only 1-2)
  return matchCount >= Math.min(2, targetParts.length);
}

/**
 * Search iTunes for podcasts by a given scholar name
 */
export async function searchPodcastsByName(name: string): Promise<PodcastContent[]> {
  const cleanedName = cleanName(name);

  try {
    const params = new URLSearchParams({
      term: cleanedName,
      entity: 'podcast',
      limit: '10',
    });

    const res = await fetch(`https://itunes.apple.com/search?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    const results: iTunesResult[] = data.results || [];

    const podcasts: PodcastContent[] = [];

    for (const result of results) {
      if (!isPodcastRelevant(result, name)) continue;

      podcasts.push({
        source: 'itunes',
        podcastId: String(result.collectionId),
        name: result.collectionName,
        url: result.collectionViewUrl,
        rssUrl: result.feedUrl,
        platform: 'Apple Podcasts',
        episodeCount: result.trackCount,
        imageUrl: result.artworkUrl600 || result.artworkUrl100,
        publisher: result.artistName,
      });
    }

    return podcasts;
  } catch (err) {
    console.error(`iTunes podcast search error for "${name}":`, err);
    return [];
  }
}
