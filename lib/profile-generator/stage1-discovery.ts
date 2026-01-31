// src/lib/profile-generator/stage1-discovery.ts
// STAGE 1: DISCOVERY (API-First Approach)
// Uses direct APIs for data, Perplexity for bio/context

import { searchChannel, getRecentVideos, YouTubeChannel, YouTubeVideo } from '@/lib/api-clients/youtube';
import { searchBooksByAuthor, BookResult } from '@/lib/api-clients/google-books';
import { getOrFetch } from '@/lib/cache';

export interface DiscoveredProfile {
  // Basic info (may be incomplete)
  name: string | null;
  displayName: string | null;
  title: string | null;
  shortBio: string | null;
  fullBio: string | null;
  
  // Classification (may need correction)
  category: string | null;
  gender: string | null;
  
  // Location
  region: string | null;
  country: string | null;
  countryFlag: string | null;
  location: string | null;
  
  // Arrays
  languages: string[];
  topics: string[];
  affiliations: string[];
  
  // Links (from APIs - VERIFIED)
  apiData: {
    youtube: YouTubeChannel | null;
    recentVideos: YouTubeVideo[];
  };

  // Links (from Perplexity - UNVERIFIED)
  possibleLinks: {
    website: string | null;
    youtube: string | null;
    twitter: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    linkedin: string | null;
    twitch: string | null;
    threads: string | null;
    patreon: string | null;
    podcast: string | null;
    podcastRss: string | null;
    spotify: string | null;
  };
  
  // Content - VERIFIED from Google Books API
  verifiedBooks: BookResult[];

  // Content - UNVERIFIED from Perplexity
  possibleBooks: Array<{
    title: string;
    year?: number;
    amazonUrl?: string;
  }>;

  possibleAudioBooks: Array<{
    title: string;
    platform: string;
    url?: string;
  }>;

  possibleEbooks: Array<{
    title: string;
    platform: string;
    url?: string;
  }>;
  
  possibleCourses: Array<{
    title: string;
    platform: string;
    url?: string;
  }>;
  
  // Image
  possibleImageUrl: string | null;
  imageSearchQuery: string | null;
  
  // Historical
  isHistorical: boolean;
  lifespan: string | null;
  note: string | null;
  
  // Meta
  discoverySource: 'api-first' | 'perplexity';
  rawConfidence: string;
  discoveryNotes: string[];
}

/**
 * API-First Discovery Pipeline
 * 1. Query YouTube API directly for channel
 * 2. Query Google Books API directly for books
 * 3. Use Perplexity for bio/context/social links
 * 4. Merge all data
 */
export async function discoverProfile(name: string): Promise<DiscoveredProfile> {
  console.log(`🔍 Stage 1: Discovering profile for "${name}" (API-First)...`);
  
  const notes: string[] = [];

  // STEP 1: Direct API calls (parallel for speed)
  const [youtubeData, booksData, perplexityData] = await Promise.all([
    discoverYouTube(name, notes),
    discoverBooks(name, notes),
    discoverFromPerplexity(name),
  ]);

  // STEP 2: Merge data (APIs take priority)
  const merged: DiscoveredProfile = {
    // Bio/context from Perplexity
    name: perplexityData.name ?? null,
    displayName: perplexityData.displayName ?? null,
    title: perplexityData.title ?? null,
    shortBio: perplexityData.shortBio ?? null,
    fullBio: perplexityData.fullBio ?? null,
    category: perplexityData.category ?? null,
    gender: perplexityData.gender ?? null,
    region: perplexityData.region ?? null,
    country: perplexityData.country ?? null,
    countryFlag: perplexityData.countryFlag ?? null,
    location: perplexityData.location ?? null,
    languages: perplexityData.languages || [],
    topics: perplexityData.topics || [],
    affiliations: perplexityData.affiliations || [],

    // VERIFIED data from APIs
    apiData: {
      youtube: youtubeData.channel,
      recentVideos: youtubeData.videos,
    },
    verifiedBooks: booksData,

    // UNVERIFIED data from Perplexity
    possibleLinks: perplexityData.possibleLinks ?? {
      website: null, youtube: null, twitter: null, instagram: null,
      facebook: null, tiktok: null, linkedin: null, twitch: null,
      threads: null, patreon: null, podcast: null, podcastRss: null, spotify: null,
    },
    possibleBooks: perplexityData.possibleBooks || [],
    possibleAudioBooks: perplexityData.possibleAudioBooks || [],
    possibleEbooks: perplexityData.possibleEbooks || [],
    possibleCourses: perplexityData.possibleCourses || [],

    // Image
    possibleImageUrl: youtubeData.channel?.thumbnailUrl ?? perplexityData.possibleImageUrl ?? null,
    imageSearchQuery: perplexityData.imageSearchQuery ?? null,

    // Historical
    isHistorical: perplexityData.isHistorical || false,
    lifespan: perplexityData.lifespan ?? null,
    note: perplexityData.note ?? null,

    // Meta
    discoverySource: 'api-first',
    rawConfidence: youtubeData.channel ? 'high' : perplexityData.rawConfidence || 'medium',
    discoveryNotes: [
      ...notes,
      ...(perplexityData.discoveryNotes || []),
    ],
  };

  console.log(`✅ Stage 1 complete: YouTube ${youtubeData.channel ? '✓' : '✗'}, Books: ${booksData.length}, Videos: ${youtubeData.videos.length}`);

  return merged;
}

/**
 * Direct YouTube API search with caching
 */
async function discoverYouTube(
  name: string, 
  notes: string[]
): Promise<{ channel: YouTubeChannel | null; videos: YouTubeVideo[] }> {
  try {
    // Try cached first
    const cacheKey = `youtube:search:${name.toLowerCase().replace(/\s+/g, '-')}`;
    const channel = await getOrFetch(cacheKey, async () => {
      return await searchChannel(`${name} islamic`);
    }, 7 * 24 * 60 * 60 * 1000); // 7 day cache

    if (!channel) {
      notes.push('YouTube: No channel found via API');
      return { channel: null, videos: [] };
    }

    // Get recent videos
    const videos = await getRecentVideos(channel.channelId, 5);
    notes.push(`YouTube: Found "${channel.title}" (${channel.subscriberCount} subscribers)`);

    return { channel, videos };
  } catch (error) {
    notes.push(`YouTube: API error - ${error}`);
    return { channel: null, videos: [] };
  }
}

/**
 * Direct Google Books API search with caching
 */
async function discoverBooks(name: string, notes: string[]): Promise<BookResult[]> {
  try {
    const cacheKey = `books:author:${name.toLowerCase().replace(/\s+/g, '-')}`;
    const books = await getOrFetch(cacheKey, async () => {
      return await searchBooksByAuthor(name, 10);
    }, 30 * 24 * 60 * 60 * 1000); // 30 day cache

    if (!books || books.length === 0) {
      notes.push('Books: No books found via Google Books API');
      return [];
    }

    notes.push(`Books: Found ${books.length} books via Google Books API`);
    return books;
  } catch (error) {
    notes.push(`Books: API error - ${error}`);
    return [];
  }
}

/**
 * Perplexity for bio/context/social links (things APIs can't provide)
 */
async function discoverFromPerplexity(name: string): Promise<Partial<DiscoveredProfile>> {
  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
  
  if (!PERPLEXITY_API_KEY) {
    console.warn('⚠️ PERPLEXITY_API_KEY not configured, using minimal data');
    return {
      name,
      displayName: name,
      discoveryNotes: ['Perplexity unavailable - using name only'],
    };
  }

  // Streamlined prompt - focus on bio/context, NOT YouTube/Books (we have APIs for those)
  const prompt = `Research this Islamic scholar/speaker: "${name}"

Return ONLY valid JSON (no markdown):

{
  "name": "Full name with titles (Dr., Sheikh, etc.)",
  "displayName": "How they're commonly known",
  "title": "Title like Dr., Sheikh, Imam, Ustadh, or null",
  "shortBio": "One sentence, max 140 chars",
  "fullBio": "2-3 paragraphs about their background and work",
  
  "category": "scholar|speaker|educator|reciter|author|activist|public_figure",
  "gender": "male|female",
  
  "region": "americas|middle_east|south_asia|southeast_asia|east_africa|west_africa|north_africa|europe",
  "country": "ISO 2-letter code",
  "countryFlag": "flag emoji",
  "location": "City, Country or null",
  
  "languages": ["languages"],
  "topics": ["topics they cover"],
  "affiliations": ["organizations"],
  
  "possibleLinks": {
    "website": "URL or null",
    "twitter": "URL or null (x.com or twitter.com)",
    "instagram": "URL or null",
    "facebook": "URL or null",
    "tiktok": "URL or null",
    "linkedin": "URL or null (linkedin.com/in/...)",
    "twitch": "URL or null (twitch.tv/...)",
    "threads": "URL or null (threads.net/@...)",
    "patreon": "URL or null (patreon.com/...)",
    "podcast": "URL or null",
    "podcastRss": "muslimcentral.com/audio/[name] format or null",
    "spotify": "URL or null"
  },
  
  "possibleAudioBooks": [{"title": "Title", "platform": "Audible", "url": "URL"}],
  "possibleEbooks": [{"title": "Title", "platform": "Kindle", "url": "URL"}],
  "possibleCourses": [{"title": "Course", "platform": "Platform", "url": "URL"}],
  
  "imageSearchQuery": "Best search to find their photo",
  "isHistorical": false,
  "lifespan": "YYYY-YYYY if deceased, else null",
  "note": "Special note if public figure, else null",
  
  "rawConfidence": "high|medium|low",
  "discoveryNotes": ["notes about findings"]
}

NOTE: Skip YouTube and books - we get those from APIs. Focus on bio/social/courses.`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: 'Return only valid JSON, no markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content?.trim();
    
    // Clean markdown if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Perplexity error:', error);
    return {
      name,
      displayName: name,
      discoveryNotes: [`Perplexity error: ${error}`],
    };
  }
}
