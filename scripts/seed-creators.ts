// scripts/seed-creators.ts
// Seed Firestore with creator data from static file
// Run with: npx ts-node --skip-project scripts/seed-creators.ts
// Or via API: POST /api/admin/seed

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Creator type definition (matches lib/types/creator.ts)
interface Creator {
  id: string;
  slug: string;
  name: string;
  category: string;
  tier: string;
  gender: string;
  region: string;
  country: string;
  countryFlag: string;
  location?: string;
  languages: string[];
  topics: string[];
  verified: boolean;
  verificationLevel: string;
  featured: boolean;
  trending: boolean;
  isHistorical: boolean;
  lifespan?: string;
  note?: string;
  socialLinks?: Record<string, string>;
}

// Import static creator data
import { CREATORS } from '../lib/data/creators';

async function seedCreators() {
  console.log('🌱 Starting Firestore seeding...\n');

  // Initialize Firebase Admin
  if (!getApps().length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      // Fallback to application default credentials
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  }

  const db = getFirestore();
  const creatorsCollection = db.collection('creators');
  const slugsCollection = db.collection('slugs');

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  console.log(`📊 Found ${CREATORS.length} creators to seed\n`);

  for (const creator of CREATORS) {
    try {
      const creatorId = creator.slug || creator.id;
      const docRef = creatorsCollection.doc(creatorId);
      const existing = await docRef.get();

      // Prepare the document data with proper schema
      const creatorData = {
        // Core identifiers
        id: creatorId,
        creatorId: creatorId,
        slug: creator.slug,
        version: 1,

        // Legacy name field (for backward compatibility)
        name: creator.name,

        // Category & Classification
        category: creator.category,
        tier: creator.tier || 'community',
        gender: creator.gender,

        // Location
        region: creator.region,
        country: creator.country,
        countryFlag: creator.countryFlag,
        location: creator.location || null,

        // Content metadata
        languages: creator.languages || [],
        topics: creator.topics || [],

        // Status flags
        verified: creator.verified || false,
        verificationLevel: creator.verificationLevel || 'none',
        featured: creator.featured || false,
        trending: creator.trending || false,
        isHistorical: creator.isHistorical || false,
        lifespan: creator.lifespan || null,
        note: creator.note || null,

        // Profile object (new schema)
        profile: {
          name: creator.name,
          displayName: creator.name,
          avatar: null, // Will be populated by image fetcher
          coverImage: null,
          shortBio: creator.note || '',
          bio: '',
        },

        // Social Links
        socialLinks: creator.socialLinks || {},

        // Stats (will be populated by sync service)
        stats: {
          followerCount: 0,
        },

        // Content (will be populated by sync service)
        content: {},

        // Ownership
        ownership: {
          ownerId: null,
          ownershipStatus: 'unclaimed',
          claimedAt: null,
          claimMethod: null,
        },

        // Timestamps
        createdAt: existing.exists ? existing.data()?.createdAt : new Date(),
        updatedAt: new Date(),

        // Source
        source: 'seed',
      };

      if (existing.exists) {
        // Update existing (preserve some fields)
        const existingData = existing.data();

        // Don't overwrite enriched data
        if (existingData?.content?.youtube?.channelId) {
          creatorData.content = existingData.content;
        }
        if (existingData?.profile?.avatar) {
          creatorData.profile.avatar = existingData.profile.avatar;
        }
        if (existingData?.profile?.bio && existingData.profile.bio.length > 10) {
          creatorData.profile.bio = existingData.profile.bio;
          creatorData.profile.shortBio = existingData.profile.shortBio || creatorData.profile.shortBio;
        }

        await docRef.set(creatorData, { merge: true });
        console.log(`📝 Updated: ${creator.name}`);
        updated++;
      } else {
        // Create new
        await docRef.set(creatorData);
        console.log(`✅ Created: ${creator.name}`);
        created++;
      }

      // Also create/update slug mapping
      await slugsCollection.doc(creatorId).set({
        creatorId: creatorId,
        name: creator.name,
        updatedAt: new Date(),
      }, { merge: true });

    } catch (error) {
      console.error(`❌ Error seeding ${creator.name}:`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 SEEDING COMPLETE');
  console.log('='.repeat(50));
  console.log(`✅ Created: ${created}`);
  console.log(`📝 Updated: ${updated}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📦 Total: ${CREATORS.length}`);
  console.log('='.repeat(50));

  return { created, updated, skipped, errors, total: CREATORS.length };
}

// Run if called directly
seedCreators()
  .then((result) => {
    console.log('\n🎉 Seeding finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

export { seedCreators };
