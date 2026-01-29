// src/lib/ai/profile-generator.ts
// AI-Powered Creator Profile Generator
// Generates complete profiles from just a name using Claude + Web Search

import Anthropic from "@anthropic-ai/sdk";
import { searchChannel } from "@/src/lib/youtube";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// TYPES - Matches our existing Creator model
// ============================================

export interface GeneratedProfile {
  // Basic Info
  name: string;
  displayName: string;
  title: string | null; // Dr., Sheikh, Imam, etc.
  shortBio: string; // 140 chars
  fullBio: string;
  
  // Classification
  category: 'scholar' | 'speaker' | 'educator' | 'reciter' | 'author' | 'activist' | 'youth_leader' | 'podcaster' | 'influencer' | 'public_figure';
  tier: 'verified' | 'rising' | 'community';
  gender: 'male' | 'female';
  
  // Location
  region: 'americas' | 'east_africa' | 'west_africa' | 'north_africa' | 'middle_east' | 'south_asia' | 'southeast_asia' | 'europe';
  country: string; // ISO code
  countryFlag: string; // Emoji
  location: string | null; // City, State
  
  // Discovery
  languages: string[];
  topics: string[];
  affiliations: string[];
  
  // Social & Content Links
  socialLinks: {
    website: string | null;
    youtube: string | null;
    twitter: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    linkedin: string | null;
  };
  
  // Content Links
  contentLinks: {
    podcast: {
      name: string | null;
      url: string | null;
      rssUrl: string | null;
      platform: 'apple' | 'spotify' | 'google' | 'other' | null;
    };
    youtube: {
      channelId: string | null;
      channelUrl: string | null;
      subscriberCount: string | null;
      videoCount: string | null;
    };
    books: Array<{
      title: string;
      url: string | null; // Amazon, publisher, etc.
      isbn: string | null;
      year: number | null;
    }>;
    courses: Array<{
      title: string;
      platform: string; // Udemy, own site, etc.
      url: string | null;
    }>;
  };
  
  // Images
  images: {
    profilePhoto: string | null;
    coverPhoto: string | null;
    searchQuery: string; // Best query to find their photo
  };
  
  // Historical (if applicable)
  isHistorical: boolean;
  lifespan: string | null; // "1910-1999"
  
  // Metadata
  confidence: {
    overall: 'high' | 'medium' | 'low';
    notes: string[];
  };
  sources: string[];
}

// ============================================
// MAIN GENERATOR FUNCTION
// ============================================

export async function generateCreatorProfile(name: string): Promise<GeneratedProfile> {
  console.log(`🤖 Generating profile for: ${name}`);
  
  const prompt = `You are an expert researcher specializing in Islamic scholars, speakers, and content creators. Research this person thoroughly and return accurate, structured data.

PERSON TO RESEARCH: ${name}

IMPORTANT INSTRUCTIONS:
1. Search the web for current, accurate information about this person
2. Find their official social media accounts (YouTube, Twitter, Instagram)
3. Find any podcasts they host or regularly appear on
4. Find books they have authored
5. Determine their primary language(s) and region
6. Be accurate - if you're not sure about something, mark it as null
7. For YouTube, find their OFFICIAL channel URL (not fan channels)
8. For podcasts, try to find the RSS feed URL if possible

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):

{
  "name": "Full name with honorifics (e.g., Dr. Omar Suleiman)",
  "displayName": "How they're commonly known (e.g., Omar Suleiman)",
  "title": "Their title if applicable (Dr., Sheikh, Imam, Ustadh, Ustadha) or null",
  "shortBio": "One sentence, max 140 characters",
  "fullBio": "2-3 paragraphs about their background, work, and impact",
  
  "category": "One of: scholar, speaker, educator, reciter, author, activist, youth_leader, podcaster, influencer, public_figure",
  "tier": "verified if well-known, rising if emerging, community if local",
  "gender": "male or female",
  
  "region": "One of: americas, east_africa, west_africa, north_africa, middle_east, south_asia, southeast_asia, europe",
  "country": "Two-letter ISO country code (US, UK, SA, etc.)",
  "countryFlag": "Country flag emoji",
  "location": "City, State/Country or null if unknown",
  
  "languages": ["Array of languages they speak/teach in"],
  "topics": ["Array of topics they cover - e.g., Spirituality, Quran, Youth, Family, Fiqh, Social Justice, Seerah, Dawah"],
  "affiliations": ["Organizations they're affiliated with"],
  
  "socialLinks": {
    "website": "Official website URL or null",
    "youtube": "YouTube channel URL or null",
    "twitter": "Twitter/X profile URL or null",
    "instagram": "Instagram profile URL or null",
    "facebook": "Facebook page URL or null",
    "tiktok": "TikTok profile URL or null",
    "linkedin": "LinkedIn profile URL or null"
  },
  
  "contentLinks": {
    "podcast": {
      "name": "Name of their podcast or null",
      "url": "Main podcast page URL or null",
      "rssUrl": "RSS feed URL if found or null",
      "platform": "Primary platform: apple, spotify, google, other, or null"
    },
    "youtube": {
      "channelId": "YouTube channel ID (UCxxxxxxx) or null",
      "channelUrl": "Full YouTube channel URL or null",
      "subscriberCount": "Approximate subscriber count (e.g., '1.7M') or null",
      "videoCount": "Approximate video count or null"
    },
    "books": [
      {
        "title": "Book title",
        "url": "Amazon or publisher URL",
        "isbn": "ISBN if known or null",
        "year": "Publication year as number or null"
      }
    ],
    "courses": [
      {
        "title": "Course name",
        "platform": "Platform name (e.g., AlMaghrib, Bayyinah, Udemy)",
        "url": "Course URL or null"
      }
    ]
  },
  
  "images": {
    "profilePhoto": "Direct URL to a good profile photo if found, or null",
    "coverPhoto": "URL to a cover/banner image if found, or null",
    "searchQuery": "Best Google Images search query to find their official photo"
  },
  
  "isHistorical": false,
  "lifespan": null,
  
  "confidence": {
    "overall": "high, medium, or low based on how much you found",
    "notes": ["Array of notes about data quality, e.g., 'Could not verify Twitter account', 'Multiple YouTube channels found']"
  },
  "sources": ["Array of main sources/websites you found information from"]
}

SPECIAL CASES:
- If this is a historical figure (deceased), set isHistorical: true and lifespan: "YYYY-YYYY"
- If this is a public figure (actor, athlete, politician) who happens to be Muslim, use category: "public_figure"
- If they primarily do Quran recitation, use category: "reciter"
- For books array, include up to 5 most notable books
- For courses array, include up to 3 most notable courses

Return ONLY the JSON object, nothing else.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text content
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON from response
    let jsonStr = textContent.text.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    const profile: GeneratedProfile = JSON.parse(jsonStr);
    
    // ============================================
    // VERIFY WITH YOUTUBE API
    // ============================================
    try {
      console.log(`🔍 Searching YouTube for verified channel: ${name}`);
      const youtubeData = await searchChannel(name);
      
      if (youtubeData) {
        console.log(`✅ Found verified YouTube channel: ${youtubeData.title}`);
        
        // Overwrite AI guesses with real data
        profile.contentLinks.youtube = {
          channelId: youtubeData.id,
          channelUrl: `https://www.youtube.com/channel/${youtubeData.id}`,
          subscriberCount: youtubeData.subscriberCount,
          videoCount: youtubeData.videoCount,
        };
        
        // Update social link
        profile.socialLinks.youtube = `https://www.youtube.com/channel/${youtubeData.id}`;
        
        // If image is missing, use YouTube thumbnail
        if (!profile.images.profilePhoto) {
          profile.images.profilePhoto = youtubeData.thumbnail;
        }

        profile.confidence.notes.push(`Verified YouTube stats via API: ${youtubeData.subscriberCount} subscribers`);
      } else {
        console.log(`⚠️ No verified YouTube channel found for: ${name}`);
      }
    } catch (ytError) {
      console.error("Error fetching YouTube verification:", ytError);
      // Don't fail the whole generation if YouTube fails, just skip verification
    }
    
    console.log(`✅ Profile generated for: ${profile.name}`);
    return profile;
    
  } catch (error) {
    console.error("Error generating profile:", error);
    throw error;
  }
}

// ============================================
// CONVERT TO FIRESTORE FORMAT
// ============================================

export function convertToFirestoreCreator(
  profile: GeneratedProfile,
  existingId?: string
): Record<string, any> {
  const slug = profile.displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  const creatorId = existingId || `creator_${slug}`;

  return {
    creatorId,
    slug,

    // Ownership (default to unclaimed)
    ownership: {
      ownerId: null,
      ownershipStatus: "unclaimed",
      claimedAt: null,
      claimMethod: null,
    },

    // Verification
    verification: {
      level: profile.confidence.overall === "high" ? "community" : "none",
      verifiedAt: null,
      verifiedBy: null,
      verificationMethod: null,
    },

    // Profile
    profile: {
      name: profile.name,
      displayName: profile.displayName,
      title: profile.title,
      bio: profile.fullBio,
      shortBio: profile.shortBio,
      avatar: profile.images.profilePhoto,
      coverImage: profile.images.coverPhoto,
    },

    // Classification
    category: profile.category,
    tier: profile.tier,
    gender: profile.gender,

    // Location
    region: profile.region,
    country: profile.country,
    countryFlag: profile.countryFlag,
    location: profile.location,

    // Discovery
    languages: profile.languages,
    topics: profile.topics,
    affiliations: profile.affiliations,

    // Social Links
    socialLinks: {
      website: profile.socialLinks.website,
      youtube: profile.contentLinks.youtube.channelUrl || profile.socialLinks.youtube,
      twitter: profile.socialLinks.twitter,
      instagram: profile.socialLinks.instagram,
      facebook: profile.socialLinks.facebook,
      tiktok: profile.socialLinks.tiktok,
      linkedin: profile.socialLinks.linkedin,
      podcast: profile.contentLinks.podcast.rssUrl || profile.contentLinks.podcast.url,
    },

    // Content (extended data)
    content: {
      youtube: profile.contentLinks.youtube,
      podcast: profile.contentLinks.podcast,
      books: profile.contentLinks.books,
      courses: profile.contentLinks.courses,
    },

    // Stats (will be updated by the app)
    stats: {
      followerCount: 0,
      contentCount: 0,
      viewCount: 0,
      youtubeSubscribers: profile.contentLinks.youtube.subscriberCount,
    },

    // Flags
    featured: false,
    trending: false,
    isHistorical: profile.isHistorical,
    lifespan: profile.lifespan,

    // AI Generation metadata
    aiGenerated: {
      generatedAt: new Date().toISOString(),
      confidence: profile.confidence.overall,
      notes: profile.confidence.notes,
      sources: profile.sources,
      imageSearchQuery: profile.images.searchQuery,
    },

    // Source
    source: "ai_generated",

    // Search terms for Firestore queries
    searchTerms: generateSearchTerms(profile.name, profile.displayName),

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Helper to generate search terms
function generateSearchTerms(name: string, displayName: string): string[] {
  const terms = new Set<string>();
  
  // Add full names lowercase
  terms.add(name.toLowerCase());
  terms.add(displayName.toLowerCase());
  
  // Add individual words
  const words = `${name} ${displayName}`.toLowerCase().split(/\s+/);
  words.forEach(word => {
    terms.add(word);
    // Add prefixes for autocomplete
    for (let i = 2; i <= word.length; i++) {
      terms.add(word.substring(0, i));
    }
  });
  
  return Array.from(terms);
}
