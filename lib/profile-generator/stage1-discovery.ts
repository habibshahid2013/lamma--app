// src/lib/profile-generator/stage1-discovery.ts
// STAGE 1: DISCOVERY
// Uses Perplexity to find initial information about a person

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
  
  // Links (UNVERIFIED - may be broken)
  possibleLinks: {
    website: string | null;
    youtube: string | null;
    twitter: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    podcast: string | null;
    podcastRss: string | null;
    spotify: string | null;
  };
  
  // Content (UNVERIFIED)
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
  discoverySource: 'perplexity';
  rawConfidence: string;
  discoveryNotes: string[];
}

export async function discoverProfile(name: string): Promise<DiscoveredProfile> {
  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
  
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  console.log(`🔍 Stage 1: Discovering profile for "${name}"...`);

  const prompt = `Research this person thoroughly: "${name}"

This person is likely an Islamic scholar, speaker, educator, or Muslim public figure.

Search the web and return a JSON object with ALL information you can find. Include URLs even if you're not 100% sure - we will verify them separately.

Return ONLY valid JSON (no markdown):

{
  "name": "Full name with any titles (Dr., Sheikh, etc.)",
  "displayName": "How they're commonly known",
  "title": "Title like Dr., Sheikh, Imam, Ustadh, Ustadha, or null",
  "shortBio": "One sentence, max 140 chars",
  "fullBio": "2-3 paragraphs about them",
  
  "category": "scholar|speaker|educator|reciter|author|activist|public_figure",
  "gender": "male|female",
  
  "region": "americas|middle_east|south_asia|southeast_asia|east_africa|west_africa|north_africa|europe",
  "country": "ISO 2-letter code",
  "countryFlag": "flag emoji",
  "location": "City, Country or null",
  
  "languages": ["languages they speak"],
  "topics": ["topics they cover"],
  "affiliations": ["organizations"],
  
  "possibleLinks": {
    "website": "URL or null",
    "youtube": "YouTube channel URL or null",
    "twitter": "Twitter URL or null",
    "instagram": "Instagram URL or null",
    "facebook": "Facebook URL or null",
    "tiktok": "TikTok URL or null",
    "podcast": "Podcast page URL or null",
    "podcastRss": "RSS feed URL or null - check muslimcentral.com/audio/[name]",
    "spotify": "Spotify Artist or Show URL"
  },
  
  "possibleBooks": [
    {"title": "Book name", "year": 2020, "amazonUrl": "URL or null"}
  ],

  "possibleAudioBooks": [
    {"title": "Audiobook Title", "platform": "Audible|Spotify|etc", "url": "URL or null"}
  ],

  "possibleEbooks": [
    {"title": "E-book Title", "platform": "Kindle|Apple Books|etc", "url": "URL or null"}
  ],
  
  "possibleCourses": [
    {"title": "Course name", "platform": "Platform", "url": "URL or null"}
  ],
  
  "possibleImageUrl": "Direct image URL if found, or null",
  "imageSearchQuery": "Best Google search to find their photo",
  
  "isHistorical": false,
  "lifespan": "YYYY-YYYY if deceased, else null",
  "note": "Special note if public figure, else null",
  
  "rawConfidence": "high|medium|low",
  "discoveryNotes": ["notes about what you found or couldn't find"]
}

IMPORTANT:
- Include any YouTube channel you find - we'll verify it
- For podcasts, check Muslim Central (muslimcentral.com) - format: muslimcentral.com/audio/firstname-lastname
- Check for Spotify profiles (Artist or Podcast)
- Look for Audiobooks on Audible/Spotify and E-books on Kindle/Apple Books
- Include book titles even without Amazon links
- Be thorough - include everything you find`;

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
          {
            role: 'system',
            content: 'You are a research assistant. Return only valid JSON, no markdown or explanation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
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

    const discovered = JSON.parse(content);
    
    console.log(`✅ Stage 1 complete: Found ${discovered.possibleLinks?.youtube ? 'YouTube' : 'no YouTube'}, ${discovered.possibleBooks?.length || 0} books`);
    
    return {
      ...discovered,
      discoverySource: 'perplexity',
    };

  } catch (error) {
    console.error('Stage 1 Discovery error:', error);
    throw error;
  }
}
