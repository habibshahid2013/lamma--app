/**
 * Bulk Profile Generation Script
 * Uses Claude AI to research and generate Islamic scholar profiles
 *
 * Run with: npm run generate-profiles
 *
 * This script will:
 * 1. Analyze current database gaps (categories, regions)
 * 2. Research scholars for missing categories
 * 3. Generate properly formatted creator objects
 * 4. Save to Firestore with validation
 */

import Anthropic from '@anthropic-ai/sdk';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json', 'utf8')
  );
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();
const anthropic = new Anthropic();

// Types
interface CreatorRegion {
  id: string;
  label: string;
  countries: { code: string; name: string; flag: string }[];
}

interface GeneratedProfile {
  name: string;
  category: string;
  region: string;
  country: string;
  countryFlag: string;
  gender: 'male' | 'female';
  languages: string[];
  topics: string[];
  shortBio: string;
  socialLinks: {
    youtube?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
    facebook?: string;
    tiktok?: string;
  };
  tier: 'verified' | 'rising' | 'new' | 'community';
  isHistorical: boolean;
  lifespan?: string;
}

// Regions with countries
const REGIONS: CreatorRegion[] = [
  {
    id: 'americas',
    label: 'Americas',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦' },
      { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
      { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
      { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    ],
  },
  {
    id: 'europe',
    label: 'Europe',
    countries: [
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
      { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
      { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
      { code: 'ES', name: 'Spain', flag: '🇪🇸' },
      { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    ],
  },
  {
    id: 'middle_east',
    label: 'Middle East',
    countries: [
      { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
      { code: 'AE', name: 'UAE', flag: '🇦🇪' },
      { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
      { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
      { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
      { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
      { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
      { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
    ],
  },
  {
    id: 'south_asia',
    label: 'South Asia',
    countries: [
      { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
      { code: 'IN', name: 'India', flag: '🇮🇳' },
      { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
      { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
    ],
  },
  {
    id: 'southeast_asia',
    label: 'Southeast Asia',
    countries: [
      { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
      { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
      { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
      { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
      { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
    ],
  },
  {
    id: 'east_africa',
    label: 'East Africa',
    countries: [
      { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
      { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
      { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
      { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
      { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
    ],
  },
  {
    id: 'west_africa',
    label: 'West Africa',
    countries: [
      { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
      { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
      { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
      { code: 'ML', name: 'Mali', flag: '🇲🇱' },
      { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
      { code: 'NE', name: 'Niger', flag: '🇳🇪' },
      { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
    ],
  },
  {
    id: 'north_africa',
    label: 'North Africa',
    countries: [
      { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
      { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
      { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
      { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
      { code: 'LY', name: 'Libya', flag: '🇱🇾' },
      { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
    ],
  },
];

const CATEGORIES = [
  'scholar',
  'educator',
  'speaker',
  'reciter',
  'author',
  'activist',
  'youth_leader',
  'podcaster',
  'influencer',
  'public_figure',
];

// Helper: Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Analyze current database gaps
async function analyzeGaps(): Promise<{ categories: Record<string, number>; regions: Record<string, number>; total: number }> {
  const snapshot = await db.collection('creators').get();

  const categories: Record<string, number> = {};
  const regions: Record<string, number> = {};

  CATEGORIES.forEach(cat => categories[cat] = 0);
  REGIONS.forEach(reg => regions[reg.id] = 0);

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.category && categories[data.category] !== undefined) {
      categories[data.category]++;
    }
    if (data.region && regions[data.region] !== undefined) {
      regions[data.region]++;
    }
  });

  return { categories, regions, total: snapshot.size };
}

// Generate profiles using Claude AI
async function generateProfilesForGap(
  targetCategory: string,
  targetRegion: string,
  count: number,
  existingNames: Set<string>
): Promise<GeneratedProfile[]> {
  const region = REGIONS.find(r => r.id === targetRegion);
  if (!region) return [];

  const prompt = `You are helping build a database of Islamic scholars, educators, and content creators for an educational app called Lamma+.

Generate ${count} real, verifiable profiles of Muslim ${targetCategory.replace('_', ' ')}s from ${region.label}.

IMPORTANT RULES:
1. Use ONLY real, publicly known figures - NO fictional people
2. Include their REAL social media handles if they have them
3. Focus on people who are active and have online presence
4. Include both established figures and rising voices
5. Be diverse in countries within the region

For each person, provide:
- Full name (real name)
- Country (must be from: ${region.countries.map(c => c.name).join(', ')})
- Gender (male/female)
- Languages they speak/teach in
- Topics they're known for (3-5 topics)
- A short bio (2-3 sentences)
- Social media links (YouTube channel URL, Twitter handle, Instagram, website) - only include if you're confident they exist
- Tier: "verified" (well-known, 100K+ followers), "rising" (growing, 10K-100K), "new" (under 10K), "community" (local)
- Is historical: true/false (true for deceased scholars)
- Lifespan if historical (e.g., "1920-2000")

AVOID these names that already exist: ${Array.from(existingNames).slice(0, 50).join(', ')}

Respond in JSON format as an array:
[
  {
    "name": "Full Name",
    "country": "Country Name",
    "countryCode": "XX",
    "gender": "male|female",
    "languages": ["English", "Arabic"],
    "topics": ["Fiqh", "Spirituality"],
    "shortBio": "2-3 sentence bio...",
    "socialLinks": {
      "youtube": "https://youtube.com/@channelname",
      "twitter": "@handle",
      "instagram": "@handle",
      "website": "https://website.com"
    },
    "tier": "verified|rising|new|community",
    "isHistorical": false,
    "lifespan": null
  }
]

Only respond with valid JSON array, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return [];

    // Parse JSON response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const profiles = JSON.parse(jsonMatch[0]);

    // Map to our format
    return profiles.map((p: any) => {
      const country = region.countries.find(
        c => c.name.toLowerCase() === p.country?.toLowerCase() || c.code === p.countryCode
      );

      return {
        name: p.name,
        category: targetCategory,
        region: targetRegion,
        country: country?.name || p.country,
        countryFlag: country?.flag || '🌍',
        gender: p.gender || 'male',
        languages: p.languages || ['English'],
        topics: p.topics || [],
        shortBio: p.shortBio || '',
        socialLinks: {
          youtube: p.socialLinks?.youtube,
          twitter: p.socialLinks?.twitter?.replace('@', 'https://twitter.com/'),
          instagram: p.socialLinks?.instagram?.replace('@', 'https://instagram.com/'),
          website: p.socialLinks?.website,
          facebook: p.socialLinks?.facebook,
          tiktok: p.socialLinks?.tiktok,
        },
        tier: p.tier || 'community',
        isHistorical: p.isHistorical || false,
        lifespan: p.lifespan,
      };
    });
  } catch (error) {
    console.error('Error generating profiles:', error);
    return [];
  }
}

// Save profile to Firestore
async function saveProfile(profile: GeneratedProfile): Promise<boolean> {
  const slug = generateSlug(profile.name);

  // Check if already exists
  const existing = await db.collection('creators').doc(slug).get();
  if (existing.exists) {
    console.log(`  Skipping ${profile.name} - already exists`);
    return false;
  }

  const creator = {
    id: slug,
    slug,
    name: profile.name,
    category: profile.category,
    tier: profile.tier,
    gender: profile.gender,
    region: profile.region,
    country: profile.country,
    countryFlag: profile.countryFlag,
    languages: profile.languages,
    topics: profile.topics,
    verified: profile.tier === 'verified',
    verificationLevel: profile.tier === 'verified' ? 'community' : 'none',
    featured: false,
    trending: false,
    isHistorical: profile.isHistorical,
    lifespan: profile.lifespan,
    profile: {
      name: profile.name,
      displayName: profile.name,
      avatar: null,
      coverImage: null,
      shortBio: profile.shortBio,
      bio: profile.shortBio,
    },
    socialLinks: Object.fromEntries(
      Object.entries(profile.socialLinks).filter(([_, v]) => v)
    ),
    content: {},
    stats: {
      followerCount: 0,
      contentCount: 0,
      viewCount: 0,
    },
    aiGenerated: {
      generatedAt: new Date().toISOString(),
      model: 'claude-sonnet-4',
      confidence: 'medium',
      confidenceScore: 65,
    },
    source: 'automated_pipeline',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    await db.collection('creators').doc(slug).set(creator);
    await db.collection('slugs').doc(slug).set({ creatorId: slug });
    console.log(`  ✓ Added: ${profile.name}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to add ${profile.name}:`, error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('LAMMA+ BULK PROFILE GENERATION');
  console.log('='.repeat(60));
  console.log('');

  // Step 1: Analyze current gaps
  console.log('📊 Analyzing current database...');
  const { categories, regions, total } = await analyzeGaps();

  console.log(`\nCurrent total: ${total} profiles`);
  console.log('\nBy Category:');
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const bar = '█'.repeat(Math.min(count, 30));
      console.log(`  ${cat.padEnd(15)} ${String(count).padStart(3)} ${bar}`);
    });

  console.log('\nBy Region:');
  Object.entries(regions)
    .sort((a, b) => b[1] - a[1])
    .forEach(([reg, count]) => {
      const bar = '█'.repeat(Math.min(count, 30));
      console.log(`  ${reg.padEnd(15)} ${String(count).padStart(3)} ${bar}`);
    });

  // Step 2: Calculate targets for 500 profiles
  const TARGET_TOTAL = 500;
  const needed = TARGET_TOTAL - total;

  if (needed <= 0) {
    console.log(`\n✅ Already have ${total} profiles (target: ${TARGET_TOTAL})`);
    return;
  }

  console.log(`\n🎯 Need ${needed} more profiles to reach ${TARGET_TOTAL}`);

  // Step 3: Get existing names to avoid duplicates
  const existingSnapshot = await db.collection('creators').get();
  const existingNames = new Set(existingSnapshot.docs.map(d => d.data().name?.toLowerCase()));

  // Step 4: Prioritize gaps
  // Focus on underrepresented categories and regions
  const categoryPriority = Object.entries(categories)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([cat]) => cat);

  const regionPriority = Object.entries(regions)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 4)
    .map(([reg]) => reg);

  console.log(`\nPriority categories: ${categoryPriority.join(', ')}`);
  console.log(`Priority regions: ${regionPriority.join(', ')}`);

  // Step 5: Generate profiles
  let added = 0;
  const batchSize = 5; // Profiles per API call
  const maxPerCategoryRegion = Math.ceil(needed / (categoryPriority.length * regionPriority.length));

  console.log('\n' + '='.repeat(60));
  console.log('GENERATING PROFILES');
  console.log('='.repeat(60));

  for (const category of categoryPriority) {
    for (const region of regionPriority) {
      if (added >= needed) break;

      console.log(`\n📝 Generating ${batchSize} ${category}s from ${region}...`);

      const profiles = await generateProfilesForGap(
        category,
        region,
        batchSize,
        existingNames
      );

      for (const profile of profiles) {
        if (added >= needed) break;

        const success = await saveProfile(profile);
        if (success) {
          added++;
          existingNames.add(profile.name.toLowerCase());
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 500));
      }

      // Longer pause between batches
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Step 6: Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nProfiles added: ${added}`);
  console.log(`New total: ${total + added}`);
  console.log(`Target: ${TARGET_TOTAL}`);
  console.log(`Remaining: ${Math.max(0, TARGET_TOTAL - total - added)}`);

  if (added > 0) {
    console.log('\n✅ Run enrichment pipeline to fetch images and social data:');
    console.log('   npm run enrich');
    console.log('   npm run fetch-images');
  }
}

main().catch(console.error);
