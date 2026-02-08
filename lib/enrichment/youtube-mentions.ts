/**
 * YouTube Mentions Enrichment Service
 * Searches YouTube for videos ABOUT a creator (by other channels).
 * Uses YouTube Data API v3 — 100 quota units per search call.
 */

import type { MentionVideo } from '@/lib/types/creator';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YT_SEARCH_BASE = 'https://www.googleapis.com/youtube/v3/search';
const YT_VIDEOS_BASE = 'https://www.googleapis.com/youtube/v3/videos';

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
 * Fetch view counts for a batch of video IDs (costs only 1 quota unit for up to 50 videos).
 */
async function getVideoStats(videoIds: string[]): Promise<Record<string, number>> {
  if (!GOOGLE_API_KEY || videoIds.length === 0) return {};

  try {
    const params = new URLSearchParams({
      part: 'statistics',
      id: videoIds.join(','),
      key: GOOGLE_API_KEY,
    });

    const res = await fetch(`${YT_VIDEOS_BASE}?${params}`);
    if (!res.ok) return {};

    const data = await res.json();
    const stats: Record<string, number> = {};

    for (const item of data.items || []) {
      const views = parseInt(item.statistics?.viewCount || '0', 10);
      stats[item.id] = views;
    }

    return stats;
  } catch {
    return {};
  }
}

/**
 * Search YouTube for videos about a creator by other channels.
 * Excludes videos from the creator's own channel.
 * Returns up to 10 mention videos with view counts.
 */
export async function searchYouTubeMentions(
  name: string,
  ownChannelId?: string,
): Promise<MentionVideo[]> {
  if (!GOOGLE_API_KEY) return [];

  const cleanedName = cleanName(name);

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: `"${cleanedName}"`,
      type: 'video',
      maxResults: '15',
      order: 'relevance',
      relevanceLanguage: 'en',
      key: GOOGLE_API_KEY,
    });

    const res = await fetch(`${YT_SEARCH_BASE}?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    const items = data.items || [];

    // Filter out the creator's own channel
    const filtered = items.filter((item: any) => {
      if (ownChannelId && item.snippet?.channelId === ownChannelId) return false;
      return true;
    });

    if (filtered.length === 0) return [];

    // Get video IDs for stats lookup
    const videoIds = filtered.map((item: any) => item.id?.videoId).filter(Boolean);
    const stats = await getVideoStats(videoIds);

    const results: MentionVideo[] = [];

    for (const item of filtered) {
      if (results.length >= 10) break;
      const videoId = item.id?.videoId;
      if (!videoId) continue;

      results.push({
        videoId,
        title: item.snippet?.title || '',
        channelTitle: item.snippet?.channelTitle || '',
        channelId: item.snippet?.channelId || undefined,
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
        publishedAt: item.snippet?.publishedAt || '',
        viewCount: stats[videoId] || undefined,
      });
    }

    return results;
  } catch (err) {
    console.error(`YouTube mentions search error for "${name}":`, err);
    return [];
  }
}
