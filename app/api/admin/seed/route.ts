// app/api/admin/seed/route.ts
// API endpoint to seed Firestore with creator data
// POST /api/admin/seed - Seeds all creators from static data
// POST /api/admin/seed?action=images - Fetches missing images

import { NextRequest, NextResponse } from 'next/server';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CREATORS } from '@/lib/data/creators';
import { ALL_EXPANSION_PROFILES } from '@/lib/data/profile-expansion';
import { fetchCreatorImage, generatePlaceholderImage } from '@/lib/image-fetcher';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'seed';

    // Seed creators from static data
    if (action === 'seed') {
      return await seedCreators();
    }

    // Fetch missing images
    if (action === 'images') {
      return await fetchMissingImages();
    }

    // Full pipeline: seed + enrich + images
    if (action === 'full') {
      const seedResult = await seedCreatorsInternal();
      const imageResult = await fetchMissingImagesInternal();

      return NextResponse.json({
        success: true,
        action: 'full',
        seed: seedResult,
        images: imageResult,
        durationMs: Date.now() - startTime,
      });
    }

    // Seed expansion profiles (curated additional profiles)
    if (action === 'expansion') {
      const result = await seedExpansionProfilesInternal();
      return NextResponse.json({
        success: true,
        action: 'expansion',
        ...result,
        durationMs: Date.now() - startTime,
      });
    }

    // Full expansion: seed original + expansion + images
    if (action === 'full-expansion') {
      const seedResult = await seedCreatorsInternal();
      const expansionResult = await seedExpansionProfilesInternal();
      const imageResult = await fetchMissingImagesInternal();

      return NextResponse.json({
        success: true,
        action: 'full-expansion',
        seed: seedResult,
        expansion: expansionResult,
        images: imageResult,
        durationMs: Date.now() - startTime,
      });
    }

    return NextResponse.json({
      error: 'Invalid action',
      validActions: ['seed', 'images', 'full', 'expansion', 'full-expansion'],
    }, { status: 400 });

  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

async function seedCreators() {
  const result = await seedCreatorsInternal();
  return NextResponse.json({
    success: true,
    action: 'seed',
    ...result,
  });
}

async function seedCreatorsInternal() {
  console.log('\n🌱 Seeding creators from static data...\n');

  let created = 0;
  let updated = 0;
  let errors = 0;
  const details: any[] = [];

  for (const creator of CREATORS) {
    try {
      const creatorId = creator.slug || creator.id;
      const docRef = doc(db, 'creators', creatorId);
      const existing = await getDoc(docRef);

      // Prepare document data
      const creatorData: any = {
        id: creatorId,
        creatorId: creatorId,
        slug: creator.slug,
        version: 1,
        name: creator.name,
        category: creator.category,
        tier: creator.tier || 'community',
        gender: creator.gender,
        region: creator.region,
        country: creator.country,
        countryFlag: creator.countryFlag,
        location: creator.location || null,
        languages: creator.languages || [],
        topics: creator.topics || [],
        verified: creator.verified || false,
        verificationLevel: creator.verificationLevel || 'none',
        featured: creator.featured || false,
        trending: creator.trending || false,
        isHistorical: creator.isHistorical || false,
        lifespan: creator.lifespan || null,
        note: creator.note || null,
        profile: {
          name: creator.name,
          displayName: creator.name,
          avatar: null,
          coverImage: null,
          shortBio: creator.note || '',
          bio: '',
        },
        socialLinks: creator.socialLinks || {},
        stats: { followerCount: 0 },
        content: {},
        ownership: {
          ownerId: null,
          ownershipStatus: 'unclaimed',
          claimedAt: null,
          claimMethod: null,
        },
        updatedAt: new Date(),
        source: 'seed',
      };

      if (existing.exists()) {
        // Preserve enriched data
        const existingData = existing.data();
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
        if (existingData?.stats?.youtubeSubscribers) {
          creatorData.stats = existingData.stats;
        }

        await setDoc(docRef, creatorData, { merge: true });
        updated++;
        details.push({ id: creatorId, name: creator.name, action: 'updated' });
      } else {
        creatorData.createdAt = new Date();
        await setDoc(docRef, creatorData);
        created++;
        details.push({ id: creatorId, name: creator.name, action: 'created' });
      }

      // Create slug mapping
      await setDoc(doc(db, 'slugs', creatorId), {
        creatorId: creatorId,
        name: creator.name,
        updatedAt: new Date(),
      }, { merge: true });

    } catch (error) {
      console.error(`Error seeding ${creator.name}:`, error);
      errors++;
      details.push({ id: creator.id, name: creator.name, action: 'error', error: String(error) });
    }
  }

  console.log(`\n✅ Seeding complete: ${created} created, ${updated} updated, ${errors} errors`);

  return {
    total: CREATORS.length,
    created,
    updated,
    errors,
    details: details.slice(0, 20), // Limit response size
  };
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

async function seedExpansionProfilesInternal() {
  console.log('\n🌱 Seeding expansion profiles...\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;
  const details: any[] = [];

  for (const profile of ALL_EXPANSION_PROFILES) {
    if (!profile.name) {
      skipped++;
      continue;
    }

    const creatorId = generateSlug(profile.name);

    try {
      const docRef = doc(db, 'creators', creatorId);
      const existing = await getDoc(docRef);

      if (existing.exists()) {
        console.log(`  ⏭️ ${profile.name} (already exists)`);
        skipped++;
        details.push({ id: creatorId, name: profile.name, action: 'skipped' });
        continue;
      }

      const creatorData = {
        id: creatorId,
        creatorId: creatorId,
        slug: creatorId,
        version: 1,
        name: profile.name,
        category: profile.category || 'scholar',
        tier: profile.tier || 'community',
        gender: profile.gender || 'male',
        region: profile.region || 'americas',
        country: profile.country || 'United States',
        countryFlag: profile.countryFlag || '🇺🇸',
        location: null,
        languages: profile.languages || ['English'],
        topics: profile.topics || [],
        verified: profile.verified || false,
        verificationLevel: profile.verificationLevel || 'none',
        featured: profile.featured || false,
        trending: profile.trending || false,
        isHistorical: profile.isHistorical || false,
        lifespan: profile.lifespan || null,
        note: null,
        profile: {
          name: profile.name,
          displayName: profile.name,
          avatar: null,
          coverImage: null,
          shortBio: '',
          bio: '',
        },
        socialLinks: profile.socialLinks || {},
        stats: { followerCount: 0 },
        content: {},
        ownership: {
          ownerId: null,
          ownershipStatus: 'unclaimed',
          claimedAt: null,
          claimMethod: null,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'curated_expansion',
      };

      await setDoc(docRef, creatorData);

      // Create slug mapping
      await setDoc(doc(db, 'slugs', creatorId), {
        creatorId: creatorId,
        name: profile.name,
        updatedAt: new Date(),
      });

      console.log(`  ✅ ${profile.name}`);
      created++;
      details.push({ id: creatorId, name: profile.name, action: 'created' });

    } catch (error) {
      console.error(`  ❌ ${profile.name}:`, error);
      errors++;
      details.push({ id: creatorId, name: profile.name, action: 'error', error: String(error) });
    }
  }

  console.log(`\n✅ Expansion seeding complete: ${created} created, ${skipped} skipped, ${errors} errors`);

  return {
    total: ALL_EXPANSION_PROFILES.length,
    created,
    skipped,
    errors,
    details: details.slice(0, 30),
  };
}

async function fetchMissingImages() {
  const result = await fetchMissingImagesInternal();
  return NextResponse.json({
    success: true,
    action: 'images',
    ...result,
  });
}

async function fetchMissingImagesInternal() {
  console.log('\n🖼️ Fetching missing images...\n');

  const creatorsSnapshot = await getDocs(collection(db, 'creators'));
  const creatorsNeedingImages: { id: string; name: string; youtubeChannelId?: string }[] = [];

  creatorsSnapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const hasAvatar = data.profile?.avatar &&
      !data.profile.avatar.includes('ui-avatars.com') &&
      !data.profile.avatar.includes('placeholder');

    if (!hasAvatar) {
      creatorsNeedingImages.push({
        id: docSnap.id,
        name: data.profile?.name || data.name,
        youtubeChannelId: data.content?.youtube?.channelId,
      });
    }
  });

  console.log(`Found ${creatorsNeedingImages.length} creators needing images`);

  let fetched = 0;
  let placeholder = 0;
  let errors = 0;

  // Process in smaller batches to avoid timeouts
  const batchSize = 10;
  for (let i = 0; i < Math.min(creatorsNeedingImages.length, 50); i++) {
    const creator = creatorsNeedingImages[i];

    try {
      const image = await fetchCreatorImage(creator.name, creator.youtubeChannelId);
      const imageUrl = image?.url || generatePlaceholderImage(creator.name);
      const source = image?.source || 'generated';

      await updateDoc(doc(db, 'creators', creator.id), {
        'profile.avatar': imageUrl,
        'profile.avatarSource': source,
        'profile.avatarUpdatedAt': new Date().toISOString(),
      });

      if (source === 'generated') {
        placeholder++;
      } else {
        fetched++;
      }

      console.log(`  ${source === 'generated' ? '🎭' : '✅'} ${creator.name}: ${source}`);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`  ❌ ${creator.name}:`, error);
      errors++;
    }
  }

  return {
    totalNeedingImages: creatorsNeedingImages.length,
    processed: fetched + placeholder + errors,
    fetched,
    placeholder,
    errors,
  };
}

// GET endpoint to check status
export async function GET() {
  try {
    const creatorsSnapshot = await getDocs(collection(db, 'creators'));

    const stats = {
      totalInFirestore: creatorsSnapshot.size,
      totalInStaticData: CREATORS.length,
      needsSeeding: CREATORS.length > creatorsSnapshot.size,
      withImages: 0,
      withoutImages: 0,
      withYouTube: 0,
      withPodcast: 0,
      withBooks: 0,
    };

    creatorsSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();

      if (data.profile?.avatar && !data.profile.avatar.includes('ui-avatars.com')) {
        stats.withImages++;
      } else {
        stats.withoutImages++;
      }

      if (data.content?.youtube?.channelId) {
        stats.withYouTube++;
      }
      if (data.content?.podcast?.podcastId) {
        stats.withPodcast++;
      }
      if (data.content?.books?.length > 0) {
        stats.withBooks++;
      }
    });

    return NextResponse.json({
      status: 'ok',
      ...stats,
      staticData: {
        original: CREATORS.length,
        expansion: ALL_EXPANSION_PROFILES.length,
        total: CREATORS.length + ALL_EXPANSION_PROFILES.length,
      },
      actions: {
        seed: 'POST /api/admin/seed?action=seed - Seed creators from static data',
        expansion: 'POST /api/admin/seed?action=expansion - Seed expansion profiles (35 curated)',
        images: 'POST /api/admin/seed?action=images - Fetch missing images',
        full: 'POST /api/admin/seed?action=full - Full pipeline (seed + images)',
        'full-expansion': 'POST /api/admin/seed?action=full-expansion - Seed all + expansion + images',
      },
    });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
