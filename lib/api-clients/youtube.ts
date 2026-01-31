/**
 * YouTube Data API v3 Client
 * Direct API calls for accurate channel/video data
 */

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeChannel {
  channelId: string;
  channelUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  viewCount?: number;
}

/**
 * Search for a YouTube channel by name
 */
export async function searchChannel(query: string): Promise<YouTubeChannel | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn('⚠️ YouTube API key not configured');
    return null;
  }

  try {
    // Search for channels
    const searchUrl = `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=5&key=${YOUTUBE_API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items?.length) return null;

    // Find best match (simple heuristic: first result)
    const channelId = searchData.items[0].id.channelId;

    // Get full channel details
    return await getChannelById(channelId);
  } catch (error) {
    console.error('YouTube search error:', error);
    return null;
  }
}

/**
 * Get channel details by ID
 */
export async function getChannelById(channelId: string): Promise<YouTubeChannel | null> {
  if (!YOUTUBE_API_KEY) return null;

  try {
    const url = `${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items?.length) return null;

    const channel = data.items[0];
    return {
      channelId: channel.id,
      channelUrl: `https://www.youtube.com/channel/${channel.id}`,
      title: channel.snippet.title,
      description: channel.snippet.description?.substring(0, 300) || '',
      thumbnailUrl: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
      subscriberCount: formatCount(channel.statistics.subscriberCount),
      videoCount: channel.statistics.videoCount,
      viewCount: channel.statistics.viewCount,
    };
  } catch (error) {
    console.error('YouTube channel fetch error:', error);
    return null;
  }
}

/**
 * Get recent videos from a channel
 */
export async function getRecentVideos(channelId: string, maxResults = 5): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];

  try {
    // Get uploads playlist
    const channelUrl = `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const channelRes = await fetch(channelUrl);
    const channelData = await channelRes.json();

    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) return [];

    // Get recent videos from uploads playlist
    const playlistUrl = `${BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    const playlistRes = await fetch(playlistUrl);
    const playlistData = await playlistRes.json();

    return (playlistData.items || []).map((item: any) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('YouTube videos fetch error:', error);
    return [];
  }
}

function formatCount(count: string): string {
  const num = parseInt(count, 10);
  if (isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\\.0$/, '') + 'K';
  return num.toString();
}
