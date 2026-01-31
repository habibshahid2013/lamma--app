// src/lib/image-fetcher.ts
// Auto-fetch creator images from multiple sources
// Priority: YouTube thumbnail > Knowledge Graph > Wikipedia > Google Search

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

interface ImageResult {
  url: string;
  source: 'youtube' | 'knowledge_graph' | 'wikipedia' | 'google_search' | 'generated';
  width?: number;
  height?: number;
}

/**
 * Fetch creator image from multiple sources
 * Tries each source in order until one succeeds
 */
export async function fetchCreatorImage(
  name: string,
  existingYoutubeChannelId?: string
): Promise<ImageResult | null> {
  
  // 1. Try YouTube channel thumbnail (if we have channel ID)
  if (existingYoutubeChannelId) {
    const ytImage = await fetchYouTubeThumbnail(existingYoutubeChannelId);
    if (ytImage) return ytImage;
  }

  // 2. Try Knowledge Graph (Google's verified entity images)
  const kgImage = await fetchKnowledgeGraphImage(name);
  if (kgImage) return kgImage;

  // 3. Try Wikipedia
  const wikiImage = await fetchWikipediaImage(name);
  if (wikiImage) return wikiImage;

  // 4. Try YouTube search (find their channel)
  const ytSearchImage = await searchYouTubeForImage(name);
  if (ytSearchImage) return ytSearchImage;

  // 5. Return null - will use initials fallback
  return null;
}

/**
 * Fetch YouTube channel thumbnail
 */
async function fetchYouTubeThumbnail(channelId: string): Promise<ImageResult | null> {
  if (!GOOGLE_API_KEY) return null;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${GOOGLE_API_KEY}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const channel = data.items?.[0];
    
    if (channel?.snippet?.thumbnails?.high?.url) {
      return {
        url: channel.snippet.thumbnails.high.url,
        source: 'youtube',
        width: 800,
        height: 800,
      };
    }
  } catch (error) {
    console.error('YouTube thumbnail fetch error:', error);
  }
  
  return null;
}

/**
 * Fetch image from Google Knowledge Graph
 */
async function fetchKnowledgeGraphImage(name: string): Promise<ImageResult | null> {
  if (!GOOGLE_API_KEY) return null;

  try {
    const query = encodeURIComponent(`${name} islamic scholar`);
    const response = await fetch(
      `https://kgsearch.googleapis.com/v1/entities:search?query=${query}&key=${GOOGLE_API_KEY}&limit=1&types=Person`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const entity = data.itemListElement?.[0]?.result;
    
    if (entity?.image?.contentUrl) {
      return {
        url: entity.image.contentUrl,
        source: 'knowledge_graph',
      };
    }
  } catch (error) {
    console.error('Knowledge Graph fetch error:', error);
  }
  
  return null;
}

/**
 * Fetch image from Wikipedia
 */
async function fetchWikipediaImage(name: string): Promise<ImageResult | null> {
  try {
    // First, search for the person
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) return null;
    
    const searchData = await searchResponse.json();
    const pageTitle = searchData.query?.search?.[0]?.title;
    
    if (!pageTitle) return null;

    // Get the page image
    const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) return null;
    
    const imageData = await imageResponse.json();
    const pages = imageData.query?.pages;
    const page = Object.values(pages)[0] as any;
    
    if (page?.thumbnail?.source) {
      return {
        url: page.thumbnail.source,
        source: 'wikipedia',
        width: page.thumbnail.width,
        height: page.thumbnail.height,
      };
    }
  } catch (error) {
    console.error('Wikipedia fetch error:', error);
  }
  
  return null;
}

/**
 * Search YouTube for the person's channel and get thumbnail
 */
async function searchYouTubeForImage(name: string): Promise<ImageResult | null> {
  if (!GOOGLE_API_KEY) return null;

  try {
    const query = encodeURIComponent(name);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=channel&maxResults=1&key=${GOOGLE_API_KEY}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const channel = data.items?.[0];
    
    if (channel?.snippet?.thumbnails?.high?.url) {
      return {
        url: channel.snippet.thumbnails.high.url,
        source: 'youtube',
        width: 800,
        height: 800,
      };
    }
  } catch (error) {
    console.error('YouTube search error:', error);
  }
  
  return null;
}

/**
 * Batch fetch images for multiple creators
 * Use this to update all creators missing images
 */
export async function batchFetchImages(
  creators: { name: string; creatorId: string; youtubeChannelId?: string }[]
): Promise<Map<string, ImageResult | null>> {
  const results = new Map<string, ImageResult | null>();
  
  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  
  for (let i = 0; i < creators.length; i += batchSize) {
    const batch = creators.slice(i, i + batchSize);
    
    const promises = batch.map(async (creator) => {
      const image = await fetchCreatorImage(creator.name, creator.youtubeChannelId);
      return { creatorId: creator.creatorId, image };
    });
    
    const batchResults = await Promise.all(promises);
    
    for (const result of batchResults) {
      results.set(result.creatorId, result.image);
    }
    
    // Small delay between batches
    if (i + batchSize < creators.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

/**
 * Generate a placeholder image URL using UI Avatars service
 * This is a fallback that always works
 */
export function generatePlaceholderImage(name: string): string {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  // Use UI Avatars service for consistent placeholder images
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=f59e0b&color=0f172a&bold=true&format=svg`;
}
