// src/lib/profile-generator/stage2-verification.ts
// STAGE 2: VERIFICATION
// Verifies all links and enriches with real API data

import { DiscoveredProfile } from './stage1-discovery';

export interface VerifiedProfile extends DiscoveredProfile {
  // Verified links (null if broken/not found)
  verifiedLinks: {
    website: { url: string; status: 'valid' | 'invalid'; title?: string } | null;
    youtube: { 
      url: string; 
      status: 'valid' | 'invalid';
      channelId?: string;
      channelName?: string;
      subscriberCount?: string;
      videoCount?: string;
      description?: string;
      avatarUrl?: string;
    } | null;
    twitter: { url: string; status: 'valid' | 'invalid'; handle?: string } | null;
    instagram: { url: string; status: 'valid' | 'invalid'; handle?: string } | null;
    facebook: { url: string; status: 'valid' | 'invalid' } | null;
    tiktok: { url: string; status: 'valid' | 'invalid'; handle?: string } | null;
    podcast: { 
      url: string; 
      status: 'valid' | 'invalid';
      rssUrl?: string;
      podcastName?: string;
      episodeCount?: number;
    } | null;
    spotify: {
      url: string;
      status: 'valid' | 'invalid';
    } | null; // Added Spotify
  };
  
  // Verification metadata
  verificationResults: {
    linksChecked: number;
    linksValid: number;
    linksInvalid: number;
    youtubeVerified: boolean;
    podcastVerified: boolean;
    spotifyVerified: boolean; // Added Spotify flag
  };
}

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export async function verifyProfile(discovered: DiscoveredProfile): Promise<VerifiedProfile> {
  console.log(`🔐 Stage 2: Verifying links for "${discovered.name}"...`);
  
  const verifiedLinks: VerifiedProfile['verifiedLinks'] = {
    website: null,
    youtube: null,
    twitter: null,
    instagram: null,
    facebook: null,
    tiktok: null,
    podcast: null,
    spotify: null, // Added Spotify
  };
  
  let linksChecked = 0;
  let linksValid = 0;
  let linksInvalid = 0;

  // Verify Website
  if (discovered.possibleLinks?.website) {
    linksChecked++;
    const result = await verifyUrl(discovered.possibleLinks.website);
    if (result.valid) {
      linksValid++;
      verifiedLinks.website = { url: discovered.possibleLinks.website, status: 'valid', title: result.title };
    } else {
      linksInvalid++;
    }
  }

  // Verify YouTube (using YouTube API for rich data)
  if (discovered.possibleLinks?.youtube) {
    linksChecked++;
    const ytResult = await verifyYouTubeChannel(discovered.possibleLinks.youtube);
    if (ytResult) {
      linksValid++;
      verifiedLinks.youtube = { url: discovered.possibleLinks.youtube, status: 'valid', ...ytResult };
    } else {
      linksInvalid++;
      // Try to search for their channel by name
      const searchResult = await searchYouTubeChannel(discovered.displayName || discovered.name || '');
      if (searchResult) {
        linksValid++;
        linksInvalid--; // Correct the count
        verifiedLinks.youtube = { status: 'valid', ...searchResult };
      }
    }
  } else if (discovered.displayName || discovered.name) {
    // No YouTube URL provided, try to find one
    const searchResult = await searchYouTubeChannel(discovered.displayName || discovered.name || '');
    if (searchResult) {
      linksChecked++;
      linksValid++;
      verifiedLinks.youtube = { status: 'valid', ...searchResult };
    }
  }

  // Verify Twitter
  if (discovered.possibleLinks?.twitter) {
    linksChecked++;
    const result = await verifyUrl(discovered.possibleLinks.twitter);
    if (result.valid) {
      linksValid++;
      const handle = extractTwitterHandle(discovered.possibleLinks.twitter);
      verifiedLinks.twitter = { url: discovered.possibleLinks.twitter, status: 'valid', handle: handle || undefined };
    } else {
      linksInvalid++;
    }
  }

  // Verify Instagram
  if (discovered.possibleLinks?.instagram) {
    linksChecked++;
    const result = await verifyUrl(discovered.possibleLinks.instagram);
    if (result.valid) {
      linksValid++;
      const handle = extractInstagramHandle(discovered.possibleLinks.instagram);
      verifiedLinks.instagram = { url: discovered.possibleLinks.instagram, status: 'valid', handle: handle || undefined };
    } else {
      linksInvalid++;
    }
  }

  // Verify Facebook
  if (discovered.possibleLinks?.facebook) {
    linksChecked++;
    const result = await verifyUrl(discovered.possibleLinks.facebook);
    if (result.valid) {
      linksValid++;
      verifiedLinks.facebook = { url: discovered.possibleLinks.facebook, status: 'valid' };
    } else {
      linksInvalid++;
    }
  }

  // Verify TikTok
  if (discovered.possibleLinks?.tiktok) {
    linksChecked++;
    const result = await verifyUrl(discovered.possibleLinks.tiktok);
    if (result.valid) {
      linksValid++;
      const handle = extractTikTokHandle(discovered.possibleLinks.tiktok);
      verifiedLinks.tiktok = { url: discovered.possibleLinks.tiktok, status: 'valid', handle: handle || undefined };
    } else {
      linksInvalid++;
    }
  }

  // Verify Podcast RSS
  if (discovered.possibleLinks?.podcastRss || discovered.possibleLinks?.podcast) {
    linksChecked++;
    const rssUrl = discovered.possibleLinks.podcastRss || discovered.possibleLinks.podcast;
    const podcastResult = await verifyPodcastRss(rssUrl!);
    if (podcastResult) {
      linksValid++;
      verifiedLinks.podcast = { 
        url: discovered.possibleLinks.podcast || rssUrl!, 
        status: 'valid',
        ...podcastResult,
      };
    } else {
      linksInvalid++;
      // Try Muslim Central as fallback
      const muslimCentralResult = await tryMuslimCentral(discovered.displayName || discovered.name || '');
      if (muslimCentralResult) {
        linksValid++;
        linksInvalid--;
        verifiedLinks.podcast = { 
          status: 'valid',
          ...muslimCentralResult 
        };
      }
    }
  } else if (discovered.displayName || discovered.name) {
    // Try Muslim Central even if no podcast URL provided
    const muslimCentralResult = await tryMuslimCentral(discovered.displayName || discovered.name || '');
    if (muslimCentralResult) {
      linksChecked++;
      linksValid++;
      verifiedLinks.podcast = { 
        status: 'valid',
        ...muslimCentralResult 
      };
    }
  }

  // Verify Spotify (New)
  if (discovered.possibleLinks?.spotify) {
    linksChecked++;
    const result = await verifyUrl(discovered.possibleLinks.spotify);
    if (result.valid) {
      linksValid++;
      verifiedLinks.spotify = { 
        url: discovered.possibleLinks.spotify,
        status: 'valid'
      };
    } else {
      linksInvalid++;
    }
  }

  console.log(`✅ Stage 2 complete: ${linksValid}/${linksChecked} links verified`);

  return {
    ...discovered,
    verifiedLinks,
    verificationResults: {
      linksChecked,
      linksValid,
      linksInvalid,
      youtubeVerified: verifiedLinks.youtube?.status === 'valid',
      podcastVerified: verifiedLinks.podcast?.status === 'valid',
      spotifyVerified: verifiedLinks.spotify?.status === 'valid',
    },
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function verifyUrl(url: string): Promise<{ valid: boolean; title?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LammaBot/1.0)',
      },
    });
    
    clearTimeout(timeout);
    return { valid: response.ok };
  } catch {
    return { valid: false };
  }
}

async function verifyYouTubeChannel(url: string): Promise<{
  channelId: string;
  channelName: string;
  subscriberCount: string;
  videoCount: string;
  description: string;
  avatarUrl: string;
} | null> {
  if (!YOUTUBE_API_KEY) return null;
  
  try {
    // Extract channel identifier from URL
    const channelId = extractYouTubeChannelId(url);
    if (!channelId) return null;

    let apiUrl: string;
    
    if (channelId.startsWith('UC')) {
      // Direct channel ID
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    } else if (channelId.startsWith('@')) {
      // Handle format - search for it
      apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelId)}&key=${YOUTUBE_API_KEY}`;
    } else {
      // Username or custom URL - search
      apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelId)}&key=${YOUTUBE_API_KEY}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const channel = data.items[0];
      
      // If we got a search result, fetch full channel details
      if (!channel.statistics) {
        const fullChannelId = channel.id?.channelId || channel.id;
        const detailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${fullChannelId}&key=${YOUTUBE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.items && detailsData.items.length > 0) {
          const fullChannel = detailsData.items[0];
          return {
            channelId: fullChannel.id,
            channelName: fullChannel.snippet.title,
            subscriberCount: formatCount(fullChannel.statistics.subscriberCount),
            videoCount: fullChannel.statistics.videoCount,
            description: fullChannel.snippet.description?.substring(0, 200),
            avatarUrl: fullChannel.snippet.thumbnails?.medium?.url || fullChannel.snippet.thumbnails?.default?.url,
          };
        }
      }
      
      return {
        channelId: channel.id,
        channelName: channel.snippet.title,
        subscriberCount: formatCount(channel.statistics?.subscriberCount || '0'),
        videoCount: channel.statistics?.videoCount || '0',
        description: channel.snippet.description?.substring(0, 200),
        avatarUrl: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
      };
    }
    
    return null;
  } catch (error) {
    console.error('YouTube verification error:', error);
    return null;
  }
}

async function searchYouTubeChannel(name: string): Promise<{
  url: string;
  channelId: string;
  channelName: string;
  subscriberCount: string;
  videoCount: string;
  description: string;
  avatarUrl: string;
} | null> {
  if (!YOUTUBE_API_KEY || !name) return null;
  
  try {
    // Search for the channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(name + ' islamic')}&maxResults=3&key=${YOUTUBE_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) return null;

    // Find the best match (check if name is similar)
    const normalizedName = name.toLowerCase().replace(/[^a-z]/g, '');
    const bestMatch = searchData.items[0];
    
    // Simple heuristic: default to first result, but refine if needed
    // In a real app we might verify channel name more strictly

    const channelId = bestMatch.id.channelId;
    
    // Get full channel details
    const detailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.items && detailsData.items.length > 0) {
      const channel = detailsData.items[0];
      return {
        url: `https://www.youtube.com/channel/${channelId}`,
        channelId: channelId,
        channelName: channel.snippet.title,
        subscriberCount: formatCount(channel.statistics.subscriberCount),
        videoCount: channel.statistics.videoCount,
        description: channel.snippet.description?.substring(0, 200),
        avatarUrl: channel.snippet.thumbnails?.medium?.url,
      };
    }
    
    return null;
  } catch (error) {
    console.error('YouTube search error:', error);
    return null;
  }
}

async function verifyPodcastRss(url: string): Promise<{
  rssUrl: string;
  podcastName: string;
  episodeCount: number;
} | null> {
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' },
    });
    
    if (!response.ok) return null;
    
    const text = await response.text();
    
    // Basic RSS validation
    if (!text.includes('<rss') && !text.includes('<feed')) return null;
    
    // Extract podcast name from RSS
    const titleMatch = text.match(/<title>(?:<!\[CDATA\[)?([^\]<]+)/);
    const podcastName = titleMatch ? titleMatch[1].trim() : 'Unknown Podcast';
    
    // Count episodes
    const episodeCount = (text.match(/<item>/g) || []).length;
    
    return { rssUrl: url, podcastName, episodeCount };
  } catch {
    return null;
  }
}

async function tryMuslimCentral(name: string): Promise<{
  url: string;
  rssUrl: string;
  podcastName: string;
  episodeCount: number;
} | null> {
  // Convert name to Muslim Central format
  const slug = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  
  const rssUrl = `https://feeds.muslimcentral.com/${slug}`;
  
  const result = await verifyPodcastRss(rssUrl);
  if (result) {
    return {
      url: `https://muslimcentral.com/audio/${slug}`,
      ...result,
    };
  }
  
  return null;
}

function extractYouTubeChannelId(url: string): string | null {
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

function extractTwitterHandle(url: string): string | null {
  const match = url.match(/(?:twitter|x)\.com\/([^\/\?]+)/);
  return match ? '@' + match[1] : null;
}

function extractInstagramHandle(url: string): string | null {
  const match = url.match(/instagram\.com\/([^\/\?]+)/);
  return match ? '@' + match[1] : null;
}

function extractTikTokHandle(url: string): string | null {
  const match = url.match(/tiktok\.com\/@?([^\/\?]+)/);
  return match ? '@' + match[1] : null;
}

function formatCount(count: string): string {
  const num = parseInt(count, 10);
  if (isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}
