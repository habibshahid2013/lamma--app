const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  channelTitle: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: string;
  videoCount: string;
}

// Get channel ID from various YouTube URL formats
export function extractChannelId(url: string): { type: 'channel' | 'user' | 'handle'; value: string } | null {
  if (!url) return null;
  
  // Handle: youtube.com/@username
  const handleMatch = url.match(/youtube\.com\/@([^\/\?]+)/);
  if (handleMatch) return { type: 'handle', value: handleMatch[1] };
  
  // Channel ID: youtube.com/channel/UCxxxxx
  const channelMatch = url.match(/youtube\.com\/channel\/([^\/\?]+)/);
  if (channelMatch) return { type: 'channel', value: channelMatch[1] };
  
  // User: youtube.com/user/username
  const userMatch = url.match(/youtube\.com\/user\/([^\/\?]+)/);
  if (userMatch) return { type: 'user', value: userMatch[1] };
  
  // Custom URL: youtube.com/c/channelname
  const customMatch = url.match(/youtube\.com\/c\/([^\/\?]+)/);
  if (customMatch) return { type: 'handle', value: customMatch[1] };
  
  return null;
}

// Resolve handle/user to channel ID
async function resolveChannelId(type: 'channel' | 'user' | 'handle', value: string): Promise<string | null> {
  if (type === 'channel') return value;
  
  try {
    let url = `${YOUTUBE_API_BASE}/`;
    
    if (type === 'handle') {
      url += `search?part=snippet&type=channel&q=${encodeURIComponent(value)}&key=${YOUTUBE_API_KEY}`;
    } else if (type === 'user') {
      url += `channels?part=snippet&forUsername=${encodeURIComponent(value)}&key=${YOUTUBE_API_KEY}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (type === 'handle' && data.items?.[0]) {
      return data.items[0].snippet.channelId;
    } else if (type === 'user' && data.items?.[0]) {
      return data.items[0].id;
    }
  } catch (error) {
    console.error('Error resolving channel ID:', error);
  }
  
  return null;
}

// Get channel info
export async function getChannelInfo(youtubeUrl: string): Promise<YouTubeChannel | null> {
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key not configured');
    return null;
  }
  
  const extracted = extractChannelId(youtubeUrl);
  if (!extracted) return null;
  
  const channelId = await resolveChannelId(extracted.type, extracted.value);
  if (!channelId) return null;
  
  try {
    const url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items?.[0]) return null;
    
    const channel = data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url,
      subscriberCount: formatCount(channel.statistics.subscriberCount),
      videoCount: channel.statistics.videoCount,
    };
  } catch (error) {
    console.error('Error fetching channel info:', error);
    return null;
  }
}

// Search for a channel by name
export async function searchChannel(query: string): Promise<YouTubeChannel | null> {
  if (!YOUTUBE_API_KEY) return null;

  try {
    const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=1&key=${YOUTUBE_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.items?.[0]) return null;

    const channelId = searchData.items[0].snippet.channelId;
    
    // Fetch full details including statistics
    const url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items?.[0]) return null;
    
    const channel = data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url,
      subscriberCount: formatCount(channel.statistics.subscriberCount),
      videoCount: channel.statistics.videoCount,
    };
  } catch (error) {
    console.error('Error searching channel:', error);
    return null;
  }
}

// Get recent videos from a channel
export async function getChannelVideos(youtubeUrl: string, maxResults = 10): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key not configured');
    return [];
  }
  
  const extracted = extractChannelId(youtubeUrl);
  if (!extracted) return [];
  
  const channelId = await resolveChannelId(extracted.type, extracted.value);
  if (!channelId) return [];
  
  try {
    // First, get the uploads playlist ID
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
    
    // Get video IDs for statistics
    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');
    
    // Get video statistics and duration
    const videosUrl = `${YOUTUBE_API_BASE}/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();
    
    // Create a map of video stats
    const statsMap: Record<string, any> = {};
    videosData.items?.forEach((video: any) => {
      statsMap[video.id] = {
        viewCount: video.statistics.viewCount,
        duration: video.contentDetails.duration,
      };
    });
    
    // Combine data
    return playlistData.items.map((item: any) => {
      const videoId = item.contentDetails.videoId;
      const stats = statsMap[videoId] || {};
      
      return {
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        viewCount: formatCount(stats.viewCount || '0'),
        duration: formatDuration(stats.duration || 'PT0S'),
        channelTitle: item.snippet.channelTitle,
      };
    });
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return [];
  }
}

// Search videos by query (for creators without channel links)
export async function searchVideos(query: string, maxResults = 10): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];
  
  try {
    const url = `${YOUTUBE_API_BASE}/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.items) return [];
    
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    
    // Get statistics
    const videosUrl = `${YOUTUBE_API_BASE}/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();
    
    const statsMap: Record<string, any> = {};
    videosData.items?.forEach((video: any) => {
      statsMap[video.id] = {
        viewCount: video.statistics.viewCount,
        duration: video.contentDetails.duration,
      };
    });
    
    return data.items.map((item: any) => {
      const videoId = item.id.videoId;
      const stats = statsMap[videoId] || {};
      
      return {
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url,
        publishedAt: item.snippet.publishedAt,
        viewCount: formatCount(stats.viewCount || '0'),
        duration: formatDuration(stats.duration || 'PT0S'),
        channelTitle: item.snippet.channelTitle,
      };
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    return [];
  }
}

// Format view count (1234567 -> "1.2M")
function formatCount(count: string): string {
  const num = parseInt(count, 10);
  if (isNaN(num)) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// Format duration (PT1H2M3S -> "1:02:03")
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

// Format relative time (2024-01-15T... -> "2 weeks ago")
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}
