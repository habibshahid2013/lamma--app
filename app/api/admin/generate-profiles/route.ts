// app/api/admin/generate-profiles/route.ts
// API endpoint to generate Islamic scholar profiles using Claude AI
// POST /api/admin/generate-profiles - Generate profiles for a category/region

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  collection,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CreatorCategory, CreatorRegion } from '@/lib/types/creator';
import { verifyAdmin } from '@/lib/admin-auth';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Valid categories and regions
const VALID_CATEGORIES: CreatorCategory[] = [
  'scholar',
  'educator',
  'speaker',
  'reciter',
  'author',
  'activist',
  'influencer',
  'public_figure',
  'youth_leader',
  'podcaster',
];

const VALID_REGIONS: CreatorRegion[] = [
  'americas',
  'europe',
  'middle_east',
  'africa',
  'south_asia',
  'southeast_asia',
  'east_africa',
  'west_africa',
  'north_africa',
];

// Region to country mapping for context
const REGION_CONTEXT: Record<string, { countries: string[]; languages: string[] }> = {
  americas: {
    countries: ['United States', 'Canada', 'Jamaica', 'Trinidad and Tobago'],
    languages: ['English', 'Spanish', 'Arabic'],
  },
  europe: {
    countries: ['United Kingdom', 'France', 'Germany', 'Netherlands', 'Sweden', 'Bosnia'],
    languages: ['English', 'Arabic', 'French', 'German', 'Bosnian'],
  },
  middle_east: {
    countries: ['Saudi Arabia', 'UAE', 'Kuwait', 'Jordan', 'Palestine', 'Syria', 'Yemen'],
    languages: ['Arabic', 'English'],
  },
  africa: {
    countries: ['South Africa', 'Kenya', 'Tanzania', 'Nigeria', 'Egypt'],
    languages: ['English', 'Arabic', 'Swahili', 'French'],
  },
  south_asia: {
    countries: ['Pakistan', 'India', 'Bangladesh', 'Sri Lanka'],
    languages: ['Urdu', 'Hindi', 'Arabic', 'English', 'Bengali'],
  },
  southeast_asia: {
    countries: ['Indonesia', 'Malaysia', 'Singapore', 'Philippines', 'Australia'],
    languages: ['Indonesian', 'Malay', 'Arabic', 'English'],
  },
  east_africa: {
    countries: ['Kenya', 'Tanzania', 'Ethiopia', 'Somalia', 'South Africa'],
    languages: ['Swahili', 'Arabic', 'English', 'Somali', 'Amharic'],
  },
  west_africa: {
    countries: ['Nigeria', 'Senegal', 'Ghana', 'Mali', 'Guinea'],
    languages: ['Arabic', 'Hausa', 'Wolof', 'English', 'French'],
  },
  north_africa: {
    countries: ['Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya'],
    languages: ['Arabic', 'French', 'English', 'Berber'],
  },
};

// Category descriptions for better AI prompting
const CATEGORY_CONTEXT: Record<string, string> = {
  scholar: 'Islamic scholars with formal religious education (ijazah), known for teaching fiqh, hadith, aqeedah, or tafsir',
  educator: 'Teachers and instructors who focus on Islamic education, often running institutes or online courses',
  speaker: 'Public speakers, khateebs, and conference presenters known for dawah and motivational content',
  reciter: 'Quran reciters (qurra) known for beautiful recitation and tajweed',
  author: 'Writers and authors of Islamic books, articles, or scholarly works',
  activist: 'Community activists working on Muslim civil rights, social justice, or humanitarian causes',
  influencer: 'Social media personalities creating Islamic content for Muslim audiences',
  public_figure: 'Well-known Muslims in public life (academics, researchers, media personalities)',
  youth_leader: 'Youth directors, camp counselors, and leaders focused on Muslim youth development',
  podcaster: 'Hosts of Islamic podcasts or regular audio/video content series',
};

interface GeneratedProfile {
  name: string;
  category: CreatorCategory;
  gender: 'male' | 'female';
  region: CreatorRegion;
  country: string;
  countryFlag: string;
  languages: string[];
  topics: string[];
  shortBio: string;
  isHistorical: boolean;
  lifespan?: string;
  socialLinks: {
    youtube?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
    podcast?: string;
  };
  verificationNotes: string;
}

// Helper to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Country to flag emoji mapping
const COUNTRY_FLAGS: Record<string, string> = {
  'United States': '🇺🇸',
  'Canada': '🇨🇦',
  'United Kingdom': '🇬🇧',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪',
  'Bosnia': '🇧🇦',
  'Saudi Arabia': '🇸🇦',
  'UAE': '🇦🇪',
  'Kuwait': '🇰🇼',
  'Jordan': '🇯🇴',
  'Palestine': '🇵🇸',
  'Syria': '🇸🇾',
  'Yemen': '🇾🇪',
  'Egypt': '🇪🇬',
  'Morocco': '🇲🇦',
  'Algeria': '🇩🇿',
  'Tunisia': '🇹🇳',
  'Libya': '🇱🇾',
  'South Africa': '🇿🇦',
  'Kenya': '🇰🇪',
  'Tanzania': '🇹🇿',
  'Nigeria': '🇳🇬',
  'Senegal': '🇸🇳',
  'Ghana': '🇬🇭',
  'Mali': '🇲🇱',
  'Guinea': '🇬🇳',
  'Ethiopia': '🇪🇹',
  'Somalia': '🇸🇴',
  'Pakistan': '🇵🇰',
  'India': '🇮🇳',
  'Bangladesh': '🇧🇩',
  'Sri Lanka': '🇱🇰',
  'Indonesia': '🇮🇩',
  'Malaysia': '🇲🇾',
  'Singapore': '🇸🇬',
  'Philippines': '🇵🇭',
  'Australia': '🇦🇺',
  'Jamaica': '🇯🇲',
  'Trinidad and Tobago': '🇹🇹',
  'Zimbabwe': '🇿🇼',
};

async function generateProfilesWithClaude(
  category: CreatorCategory,
  region: CreatorRegion,
  count: number
): Promise<GeneratedProfile[]> {
  const regionInfo = REGION_CONTEXT[region];
  const categoryDesc = CATEGORY_CONTEXT[category];

  const prompt = `You are researching real, verifiable Islamic scholars, educators, and content creators. I need you to find ${count} REAL Muslim ${category}s from the ${region.replace('_', ' ')} region.

IMPORTANT REQUIREMENTS:
1. These must be REAL, VERIFIABLE public figures - not fictional
2. They should be currently active (unless historical figures are appropriate for the category)
3. Include their REAL social media handles if they have public accounts
4. Focus on well-known figures who have a public presence
5. Ensure diversity in countries within the region: ${regionInfo.countries.join(', ')}
6. Common languages in this region: ${regionInfo.languages.join(', ')}

Category context: ${categoryDesc}

For each person, provide:
1. Full name (as commonly known)
2. Gender (male/female)
3. Country of origin or residence
4. Languages they speak/teach in
5. Their main topics/specializations (3-5 topics)
6. A short bio (1-2 sentences describing who they are)
7. Whether they are historical (deceased) - if so, include lifespan (e.g., "1920-2010")
8. Their REAL social media handles:
   - YouTube channel URL (if they have one)
   - Twitter/X handle (if they have one)
   - Instagram handle (if they have one)
   - Official website (if they have one)
   - Podcast URL (if they have one)
9. Verification notes: How can someone verify this person is real? (e.g., "Featured speaker at ISNA conventions", "Author of 'Book Title' published by X", "Imam at X Mosque")

Return the data as a JSON array with this exact structure:
[
  {
    "name": "Full Name",
    "gender": "male" or "female",
    "country": "Country Name",
    "languages": ["Language1", "Language2"],
    "topics": ["Topic1", "Topic2", "Topic3"],
    "shortBio": "Short biography",
    "isHistorical": false,
    "lifespan": null or "1920-2010",
    "socialLinks": {
      "youtube": "https://youtube.com/@handle" or null,
      "twitter": "https://twitter.com/handle" or null,
      "instagram": "https://instagram.com/handle" or null,
      "website": "https://example.com" or null,
      "podcast": "https://podcasts.apple.com/..." or null
    },
    "verificationNotes": "How to verify this person is real"
  }
]

Only return the JSON array, no other text. Ensure the JSON is valid.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text content from response
  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response');
  }

  // Parse JSON from response
  let profiles: any[];
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    profiles = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Failed to parse Claude response:', textContent.text);
    throw new Error(`Failed to parse Claude response: ${e}`);
  }

  // Transform and validate profiles
  return profiles.map((p: any) => ({
    name: p.name,
    category,
    gender: p.gender === 'female' ? 'female' : 'male',
    region,
    country: p.country,
    countryFlag: COUNTRY_FLAGS[p.country] || '🌍',
    languages: Array.isArray(p.languages) ? p.languages : ['English'],
    topics: Array.isArray(p.topics) ? p.topics : [],
    shortBio: p.shortBio || '',
    isHistorical: p.isHistorical === true,
    lifespan: p.lifespan || undefined,
    socialLinks: {
      youtube: p.socialLinks?.youtube || undefined,
      twitter: p.socialLinks?.twitter || undefined,
      instagram: p.socialLinks?.instagram || undefined,
      website: p.socialLinks?.website || undefined,
      podcast: p.socialLinks?.podcast || undefined,
    },
    verificationNotes: p.verificationNotes || '',
  }));
}

async function saveProfilesToFirestore(profiles: GeneratedProfile[]): Promise<{
  created: number;
  skipped: number;
  errors: number;
  details: any[];
}> {
  let created = 0;
  let skipped = 0;
  let errors = 0;
  const details: any[] = [];

  for (const profile of profiles) {
    const creatorId = generateSlug(profile.name);

    try {
      const docRef = doc(db, 'creators', creatorId);
      const existing = await getDoc(docRef);

      if (existing.exists()) {
        console.log(`  Skipped: ${profile.name} (already exists)`);
        skipped++;
        details.push({ id: creatorId, name: profile.name, action: 'skipped' });
        continue;
      }

      // Clean social links (remove undefined/null values)
      const cleanSocialLinks: Record<string, string> = {};
      Object.entries(profile.socialLinks).forEach(([key, value]) => {
        if (value) {
          cleanSocialLinks[key] = value;
        }
      });

      const creatorData = {
        id: creatorId,
        creatorId: creatorId,
        slug: creatorId,
        version: 1,
        name: profile.name,
        category: profile.category,
        tier: 'community' as const,
        gender: profile.gender,
        region: profile.region,
        country: profile.country,
        countryFlag: profile.countryFlag,
        location: null,
        languages: profile.languages,
        topics: profile.topics,
        verified: false,
        verificationLevel: 'none' as const,
        featured: false,
        trending: false,
        isHistorical: profile.isHistorical,
        lifespan: profile.lifespan || null,
        note: null,
        profile: {
          name: profile.name,
          displayName: profile.name,
          avatar: null,
          coverImage: null,
          shortBio: profile.shortBio,
          bio: '',
        },
        socialLinks: cleanSocialLinks,
        stats: { followerCount: 0 },
        content: {},
        ownership: {
          ownerId: null,
          ownershipStatus: 'unclaimed' as const,
          claimedAt: null,
          claimMethod: null,
        },
        aiGenerated: {
          generatedAt: new Date().toISOString(),
          model: 'claude-sonnet-4-5-20250514',
          confidence: 'medium' as const,
          notes: [profile.verificationNotes],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'ai_generated',
      };

      await setDoc(docRef, creatorData);

      // Create slug mapping
      await setDoc(doc(db, 'slugs', creatorId), {
        creatorId: creatorId,
        name: profile.name,
        updatedAt: new Date(),
      });

      console.log(`  Created: ${profile.name}`);
      created++;
      details.push({
        id: creatorId,
        name: profile.name,
        action: 'created',
        category: profile.category,
        region: profile.region,
        country: profile.country,
      });
    } catch (error) {
      console.error(`  Error: ${profile.name}:`, error);
      errors++;
      details.push({
        id: creatorId,
        name: profile.name,
        action: 'error',
        error: String(error),
      });
    }
  }

  return { created, skipped, errors, details };
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (!authResult.authorized) return authResult.response;

  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();
    const { category, region, count = 5 } = body;

    // Validate inputs
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: 'Invalid category',
          validCategories: VALID_CATEGORIES,
        },
        { status: 400 }
      );
    }

    if (!region || !VALID_REGIONS.includes(region)) {
      return NextResponse.json(
        {
          error: 'Invalid region',
          validRegions: VALID_REGIONS,
        },
        { status: 400 }
      );
    }

    if (count < 1 || count > 20) {
      return NextResponse.json(
        {
          error: 'Count must be between 1 and 20',
        },
        { status: 400 }
      );
    }

    console.log(`\nGenerating ${count} ${category} profiles for ${region}...\n`);

    // Generate profiles using Claude
    const generatedProfiles = await generateProfilesWithClaude(
      category as CreatorCategory,
      region as CreatorRegion,
      count
    );

    console.log(`Generated ${generatedProfiles.length} profiles from Claude`);

    // Save to Firestore
    const saveResult = await saveProfilesToFirestore(generatedProfiles);

    return NextResponse.json({
      success: true,
      category,
      region,
      requestedCount: count,
      generatedCount: generatedProfiles.length,
      ...saveResult,
      durationMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Generate profiles API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to show usage info
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/admin/generate-profiles',
    description: 'Generate Islamic scholar profiles using Claude AI',
    parameters: {
      category: {
        type: 'string',
        required: true,
        values: VALID_CATEGORIES,
        description: 'The type of creator to generate',
      },
      region: {
        type: 'string',
        required: true,
        values: VALID_REGIONS,
        description: 'The geographic region to focus on',
      },
      count: {
        type: 'number',
        required: false,
        default: 5,
        min: 1,
        max: 20,
        description: 'Number of profiles to generate',
      },
    },
    example: {
      category: 'youth_leader',
      region: 'west_africa',
      count: 5,
    },
    categoryDescriptions: CATEGORY_CONTEXT,
    regionInfo: REGION_CONTEXT,
  });
}
