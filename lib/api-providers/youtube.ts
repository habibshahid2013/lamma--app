// src/lib/api-providers/youtube.ts
// YouTube Data API v3 Provider
// Fetches channel info, videos, and statistics

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeChannelData {
  found: boolean;
  channelId: string | null;
  channelUrl: string | null;
  name: string | null;
  handle: string | null;
  description: string | null;
  customUrl: string | null;
  publishedAt: string | null;
  thumbnailUrl: string | null;
  bannerUrl: string | null;
  subscriberCount: number | null;
  subscriberCountFormatted: string | null;
  videoCount: number | null;
  viewCount: number | null;
  country: string | null;
}

export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  viewCountFormatted: string;
  likeCount: number;
}

export class YouTubeProvider {
  
  // Search for a channel by name
  async searchChannel(query: string): Promise<YouTubeChannelData | null> {
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured');
      return null;
    }

    try {
      // Search for channels matching the query
      const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=5&key=${YOUTUBE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        return { found: false, channelId: null, channelUrl: null, name: null, handle: null, description: null, customUrl: null, publishedAt: null, thumbnailUrl: null, bannerUrl: null, subscriberCount: null, subscriberCountFormatted: null, videoCount: null, viewCount: null, country: null };
      }

      // Find best match - prefer exact or close name match
      const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
      let bestMatch = searchData.items[0];
      
      for (const item of searchData.items) {
        const channelName = (item.snippet.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (channelName === normalizedQuery || channelName.includes(normalizedQuery) || normalizedQuery.includes(channelName)) {
          bestMatch = item;
          break;
        }
      }

      const channelId = bestMatch.id.channelId || bestMatch.id;
      
      // Get full channel details
      return await this.getChannelById(channelId);
      
    } catch (error) {
      console.error('YouTube search error:', error);
      return null;
    }
  }

  // Get channel details by ID
  async getChannelById(channelId: string): Promise<YouTubeChannelData | null> {
    if (!YOUTUBE_API_KEY) return null;

    try {
      const url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return { found: false, channelId, channelUrl: null, name: null, handle: null, description: null, customUrl: null, publishedAt: null, thumbnailUrl: null, bannerUrl: null, subscriberCount: null, subscriberCountFormatted: null, videoCount: null, viewCount: null, country: null };
      }

      const channel = data.items[0];
      const stats = channel.statistics || {};
      const snippet = channel.snippet || {};
      const branding = channel.brandingSettings?.image || {};

      const subscriberCount = parseInt(stats.subscriberCount || '0', 10);

      return {
        found: true,
        channelId: channel.id,
        channelUrl: `https://www.youtube.com/channel/${channel.id}`,
        name: snippet.title,
        handle: snippet.customUrl ? `@${snippet.customUrl.replace('@', '')}` : null,
        description: snippet.description?.substring(0, 500) || null,
        customUrl: snippet.customUrl ? `https://www.youtube.com/${snippet.customUrl}` : null,
        publishedAt: snippet.publishedAt,
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || null,
        bannerUrl: branding.bannerExternalUrl || null,
        subscriberCount,
        subscriberCountFormatted: this.formatCount(subscriberCount),
        videoCount: parseInt(stats.videoCount || '0', 10),
        viewCount: parseInt(stats.viewCount || '0', 10),
        country: snippet.country || null,
      };
    } catch (error) {
      console.error('YouTube channel fetch error:', error);
      return null;
    }
  }

  // Get channel by URL
  async getChannelByUrl(url: string): Promise<YouTubeChannelData | null> {
    const channelId = this.extractChannelId(url);
    if (!channelId) return null;

    if (channelId.startsWith('UC')) {
      return await this.getChannelById(channelId);
    }

    // Handle or custom URL - need to search
    return await this.searchChannel(channelId.replace('@', ''));
  }

  // Get recent videos from a channel
  async getChannelVideos(channelId: string, maxResults = 10): Promise<YouTubeVideoData[]> {
    if (!YOUTUBE_API_KEY) return [];

    try {
      // Get uploads playlist ID
      const channelUrl = `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
      const channelResponse = await fetch(channelUrl);
      const channelData = await channelResponse.json();

      const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylistId) return [];

      // Get videos from uploads playlist
      const playlistUrl = `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
      const playlistResponse = await fetch(playlistUrl);
      const playlistData = await playlistResponse.json();

      if (!playlistData.items) return [];

      // Get video statistics
      const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');
      const videosUrl = `${YOUTUBE_API_BASE}/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      const videosResponse = await fetch(videosUrl);
      const videosData = await videosResponse.json();

      const statsMap: Record<string, any> = {};
      videosData.items?.forEach((video: any) => {
        statsMap[video.id] = {
          viewCount: parseInt(video.statistics?.viewCount || '0', 10),
          likeCount: parseInt(video.statistics?.likeCount || '0', 10),
          duration: video.contentDetails?.duration,
        };
      });

      return playlistData.items.map((item: any) => {
        const videoId = item.contentDetails.videoId;
        const stats = statsMap[videoId] || {};

        return {
          videoId,
          title: item.snippet.title,
          description: item.snippet.description?.substring(0, 200) || '',
          thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          publishedAt: item.snippet.publishedAt,
          duration: this.formatDuration(stats.duration || 'PT0S'),
          viewCount: stats.viewCount || 0,
          viewCountFormatted: this.formatCount(stats.viewCount || 0),
          likeCount: stats.likeCount || 0,
        };
      });
    } catch (error) {
      console.error('YouTube videos fetch error:', error);
      return [];
    }
  }

  // Helper: Extract channel ID from various URL formats
  private extractChannelId(url: string): string | null {
    if (!url) return null;

    // Handle: youtube.com/@username
    const handleMatch = url.match(/youtube\.com\/@([^\/\?]+)/);
    if (handleMatch) return '@' + handleMatch[1];

    // Channel ID: youtube.com/channel/UCxxxxx
    const channelMatch = url.match(/youtube\.com\/channel\/([^\/\?]+)/);
    if (channelMatch) return channelMatch[1];

    // User: youtube.com/user/username
    const userMatch = url.match(/youtube\.com\/user\/([^\/\?]+)/);
    if (userMatch) return userMatch[1];

    // Custom: youtube.com/c/channelname
    const customMatch = url.match(/youtube\.com\/c\/([^\/\?]+)/);
    if (customMatch) return customMatch[1];

    return null;
  }

  // Helper: Format large numbers
  private formatCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
  }

  // Helper: Format ISO 8601 duration
  private formatDuration(duration: string): string {
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
}
