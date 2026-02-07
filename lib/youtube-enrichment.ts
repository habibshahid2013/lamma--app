/**
 * YouTube Enrichment Service
 * Fetches rich content for creators with YouTube channels:
 * - Recent 12 videos
 * - Popular 12 videos (by view count)
 * - Up to 10 playlists
 * - Derived content categories from video titles
 */

const YOUTUBE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// ============================================================================
// TYPES
// ============================================================================

export interface EnrichedVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  duration: string;
  tags?: string[];
}

export interface YouTubePlaylist {
  playlistId: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
  publishedAt: string;
}

export interface YouTubeEnrichmentResult {
  channelId: string;
  channelTitle: string;
  description: string;
  subscriberCount: string;
  subscriberCountRaw: number;
  videoCount: number;
  viewCount: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  recentVideos: EnrichedVideo[];
  popularVideos: EnrichedVideo[];
  playlists: YouTubePlaylist[];
  derivedCategories: string[];
  enrichedAt: string;
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Resolve a YouTube URL or handle to a channel ID
 */
export async function resolveChannelId(youtubeUrl: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) return null;

  // Direct channel ID
  const channelMatch = youtubeUrl.match(/youtube\.com\/channel\/(UC[\w-]+)/);
  if (channelMatch) return channelMatch[1];

  // Handle: @username
  const handleMatch = youtubeUrl.match(/youtube\.com\/@([\w.-]+)/);
  if (handleMatch) {
    const handle = handleMatch[1];
    // Use channels.list with forHandle (newer API)
    try {
      const res = await ytFetch(`channels?part=id&forHandle=${encodeURIComponent(handle)}`);
      if (res.items?.[0]?.id) return res.items[0].id;
    } catch {
      // Fall back to search
    }

    // Fallback: search for channel
    try {
      const res = await ytFetch(`search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&maxResults=1`);
      if (res.items?.[0]?.snippet?.channelId) return res.items[0].snippet.channelId;
    } catch {
      // ignore
    }
  }

  // /user/ format
  const userMatch = youtubeUrl.match(/youtube\.com\/user\/([\w.-]+)/);
  if (userMatch) {
    try {
      const res = await ytFetch(`channels?part=id&forUsername=${encodeURIComponent(userMatch[1])}`);
      if (res.items?.[0]?.id) return res.items[0].id;
    } catch {
      // ignore
    }
  }

  // /c/ custom format — use search
  const customMatch = youtubeUrl.match(/youtube\.com\/c\/([\w.-]+)/);
  if (customMatch) {
    try {
      const res = await ytFetch(`search?part=snippet&type=channel&q=${encodeURIComponent(customMatch[1])}&maxResults=1`);
      if (res.items?.[0]?.snippet?.channelId) return res.items[0].snippet.channelId;
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Full YouTube enrichment for a channel
 */
export async function enrichYouTubeChannel(
  channelId: string
): Promise<YouTubeEnrichmentResult | null> {
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key not configured');
    return null;
  }

  try {
    // Step 1: Get channel details
    const channelData = await ytFetch(
      `channels?part=snippet,statistics,contentDetails,brandingSettings&id=${channelId}`
    );
    const channel = channelData.items?.[0];
    if (!channel) return null;

    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
    const subscriberCountRaw = parseInt(channel.statistics.subscriberCount || '0', 10);

    // Step 2: Fetch recent videos, popular videos, and playlists in parallel
    const [recentVideos, popularVideos, playlists] = await Promise.all([
      fetchRecentVideos(uploadsPlaylistId, 12),
      fetchPopularVideos(uploadsPlaylistId, 12),
      fetchPlaylists(channelId, 10),
    ]);

    // Step 3: Derive content categories from video titles
    const allTitles = [...recentVideos, ...popularVideos].map(v => v.title);
    const derivedCategories = deriveCategories(allTitles);

    return {
      channelId: channel.id,
      channelTitle: channel.snippet.title,
      description: channel.snippet.description || '',
      subscriberCount: formatCount(channel.statistics.subscriberCount),
      subscriberCountRaw,
      videoCount: parseInt(channel.statistics.videoCount || '0', 10),
      viewCount: formatCount(channel.statistics.viewCount),
      thumbnailUrl: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.medium?.url || '',
      bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl,
      recentVideos,
      popularVideos,
      playlists,
      derivedCategories,
      enrichedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error enriching channel ${channelId}:`, error);
    return null;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

async function fetchRecentVideos(uploadsPlaylistId: string, maxResults: number): Promise<EnrichedVideo[]> {
  if (!uploadsPlaylistId) return [];

  try {
    const playlistData = await ytFetch(
      `playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}`
    );
    if (!playlistData.items?.length) return [];

    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');
    return enrichVideoIds(videoIds, playlistData.items);
  } catch {
    return [];
  }
}

async function fetchPopularVideos(uploadsPlaylistId: string, maxResults: number): Promise<EnrichedVideo[]> {
  // Instead of search.list (100 units!), fetch recent uploads and sort by views.
  // This costs only 2 units vs 101 units for the old search+videos approach.
  try {
    if (!uploadsPlaylistId) return [];

    // Get last 50 uploads (max allowed in one call)
    const playlistData = await ytFetch(
      `playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`
    );
    if (!playlistData.items?.length) return [];

    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');

    // Get full video details including stats
    const videosData = await ytFetch(
      `videos?part=snippet,statistics,contentDetails&id=${videoIds}`
    );
    if (!videosData.items?.length) return [];

    // Sort by view count descending and take top N
    return videosData.items
      .sort((a: any, b: any) =>
        parseInt(b.statistics.viewCount || '0', 10) - parseInt(a.statistics.viewCount || '0', 10)
      )
      .slice(0, maxResults)
      .map((video: any) => ({
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description?.substring(0, 200) || '',
        thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url || '',
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount || '0', 10),
        likeCount: parseInt(video.statistics.likeCount || '0', 10),
        commentCount: parseInt(video.statistics.commentCount || '0', 10),
        duration: formatDuration(video.contentDetails.duration || 'PT0S'),
        tags: video.snippet.tags?.slice(0, 10),
      }));
  } catch {
    return [];
  }
}

async function fetchPlaylists(channelId: string, maxResults: number): Promise<YouTubePlaylist[]> {
  try {
    const data = await ytFetch(
      `playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=${maxResults}`
    );
    if (!data.items?.length) return [];

    return data.items.map((item: any) => ({
      playlistId: item.id,
      title: item.snippet.title,
      description: item.snippet.description?.substring(0, 200) || '',
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
      itemCount: item.contentDetails.itemCount || 0,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch {
    return [];
  }
}

async function enrichVideoIds(videoIds: string, playlistItems: any[]): Promise<EnrichedVideo[]> {
  try {
    const videosData = await ytFetch(
      `videos?part=statistics,contentDetails&id=${videoIds}`
    );

    const statsMap: Record<string, any> = {};
    videosData.items?.forEach((video: any) => {
      statsMap[video.id] = {
        viewCount: parseInt(video.statistics.viewCount || '0', 10),
        likeCount: parseInt(video.statistics.likeCount || '0', 10),
        commentCount: parseInt(video.statistics.commentCount || '0', 10),
        duration: video.contentDetails.duration,
      };
    });

    return playlistItems.map((item: any) => {
      const videoId = item.contentDetails.videoId;
      const stats = statsMap[videoId] || {};

      return {
        videoId,
        title: item.snippet.title,
        description: item.snippet.description?.substring(0, 200) || '',
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        publishedAt: item.snippet.publishedAt || item.contentDetails?.videoPublishedAt,
        viewCount: stats.viewCount || 0,
        likeCount: stats.likeCount,
        commentCount: stats.commentCount,
        duration: formatDuration(stats.duration || 'PT0S'),
      };
    });
  } catch {
    return [];
  }
}

/**
 * Derive content categories from video titles using keyword matching
 */
function deriveCategories(titles: string[]): string[] {
  const categoryKeywords: Record<string, string[]> = {
    'Quran & Tafsir': ['quran', 'tafsir', 'surah', 'ayah', 'juz', 'recitation', 'tilawah'],
    'Hadith': ['hadith', 'sunnah', 'sahih', 'bukhari', 'muslim', 'narration'],
    'Fiqh': ['fiqh', 'fatwa', 'ruling', 'halal', 'haram', 'permissible', 'wudu', 'salah', 'prayer', 'zakat', 'fasting', 'hajj'],
    'Seerah': ['seerah', 'prophet muhammad', 'prophetic', 'biography of the prophet'],
    'Spirituality': ['heart', 'soul', 'tawakkul', 'patience', 'sabr', 'dhikr', 'dua', 'supplication', 'spiritual', 'purification'],
    'Aqeedah': ['aqeedah', 'creed', 'belief', 'tawhid', 'monotheism', 'shirk'],
    'History': ['history', 'ottoman', 'caliphate', 'islamic history', 'civilization', 'golden age', 'sahaba', 'companion'],
    'Youth & Family': ['youth', 'teen', 'family', 'marriage', 'parenting', 'children', 'kids', 'young'],
    'Dawah': ['dawah', 'convert', 'revert', 'non-muslim', 'christian', 'atheist', 'debate'],
    'Current Affairs': ['palestine', 'gaza', 'ummah', 'muslim world', 'politics', 'news', 'genocide', 'oppression'],
    'Ramadan': ['ramadan', 'iftar', 'suhoor', 'taraweeh', 'eid', 'laylatul qadr'],
    'Q&A': ['q&a', 'question', 'answer', 'ask', 'fatwa'],
    'Motivation': ['motivat', 'inspir', 'success', 'mindset', 'productive', 'habit'],
    'Podcast/Interview': ['podcast', 'interview', 'conversation', 'episode', 'ep.', 'guest'],
  };

  const categoryCounts = new Map<string, number>();

  const allText = titles.join(' ').toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let count = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}`, 'gi');
      const matches = allText.match(regex);
      if (matches) count += matches.length;
    }
    if (count > 0) {
      categoryCounts.set(category, count);
    }
  }

  // Return top categories sorted by frequency
  return Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat);
}

// ============================================================================
// UTILITY
// ============================================================================

async function ytFetch(path: string): Promise<any> {
  const separator = path.includes('?') ? '&' : '?';
  const url = `${YOUTUBE_API_BASE}/${path}${separator}key=${YOUTUBE_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`YouTube API error ${response.status}: ${errorText}`);
  }
  return response.json();
}

function formatCount(count: string): string {
  const num = parseInt(count, 10);
  if (isNaN(num)) return '0';
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

function formatDuration(duration: string): string {
  if (!duration) return '0:00';
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const seconds = match[3] ? parseInt(match[3], 10) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
