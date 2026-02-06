/**
 * Seed Expansion Profiles to Firestore
 *
 * Run with: npm run seed-expansion
 *
 * This seeds the curated profile-expansion.ts data to Firestore
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { ALL_EXPANSION_PROFILES, EXPANSION_STATS } from '../lib/data/profile-expansion.js';

dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin (uses GOOGLE_APPLICATION_CREDENTIALS or project ID)
if (!getApps().length) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

// Helper: Generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function seedProfiles() {
  console.log('='.repeat(60));
  console.log('LAMMA+ EXPANSION PROFILE SEEDING');
  console.log('='.repeat(60));
  console.log('');

  // Show stats
  console.log('📊 Expansion Data Stats:');
  console.log(`   Total profiles: ${EXPANSION_STATS.total}`);
  console.log('');
  console.log('   By Category:');
  Object.entries(EXPANSION_STATS.byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`     ${cat}: ${count}`);
    });
  console.log('');
  console.log('   By Region:');
  Object.entries(EXPANSION_STATS.byRegion)
    .sort((a, b) => b[1] - a[1])
    .forEach(([reg, count]) => {
      console.log(`     ${reg}: ${count}`);
    });
  console.log('');

  // Seed profiles
  let added = 0;
  let skipped = 0;
  let failed = 0;

  console.log('🌱 Seeding profiles...');
  console.log('');

  for (const profile of ALL_EXPANSION_PROFILES) {
    if (!profile.name) {
      console.log(`  ⚠️ Skipping profile with no name`);
      skipped++;
      continue;
    }

    const slug = generateSlug(profile.name);

    // Check if already exists
    const existing = await db.collection('creators').doc(slug).get();
    if (existing.exists) {
      console.log(`  ⏭️ ${profile.name} (already exists)`);
      skipped++;
      continue;
    }

    // Build full creator document
    const creator = {
      id: slug,
      slug,
      name: profile.name,
      category: profile.category || 'scholar',
      tier: profile.tier || 'community',
      gender: profile.gender || 'male',
      region: profile.region || 'americas',
      country: profile.country || 'United States',
      countryFlag: profile.countryFlag || '🇺🇸',
      languages: profile.languages || ['English'],
      topics: profile.topics || [],
      verified: profile.verified || false,
      verificationLevel: profile.verificationLevel || 'none',
      featured: profile.featured || false,
      trending: profile.trending || false,
      isHistorical: profile.isHistorical || false,
      lifespan: profile.lifespan || null,
      profile: {
        name: profile.name,
        displayName: profile.name,
        avatar: null,
        coverImage: null,
        shortBio: '',
        bio: '',
      },
      socialLinks: profile.socialLinks || {},
      content: {},
      stats: {
        followerCount: 0,
        contentCount: 0,
        viewCount: 0,
      },
      source: 'curated_expansion',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    try {
      await db.collection('creators').doc(slug).set(creator);
      await db.collection('slugs').doc(slug).set({ creatorId: slug });
      console.log(`  ✅ ${profile.name}`);
      added++;
    } catch (error) {
      console.log(`  ❌ ${profile.name}: ${error}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`  ✅ Added:   ${added}`);
  console.log(`  ⏭️ Skipped: ${skipped}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log('');

  if (added > 0) {
    console.log('📌 Next steps:');
    console.log('  1. Run enrichment: npm run enrich');
    console.log('  2. Fetch images:   npm run fetch-images');
    console.log('');
  }

  // Get new total
  const totalSnapshot = await db.collection('creators').get();
  console.log(`📊 Total profiles in database: ${totalSnapshot.size}`);
}

seedProfiles().catch(console.error);
