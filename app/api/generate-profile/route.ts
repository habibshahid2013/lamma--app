// src/app/api/generate-profile/route.ts
// Multi-Stage AI Profile Generator API
// Pipeline: Discovery (Perplexity) → Verification (APIs) → Enrichment (Claude)

import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Import pipeline stages
import { discoverProfile } from '@/lib/profile-generator/stage1-discovery';
import { verifyProfile } from '@/lib/profile-generator/stage2-verification';
import { enrichProfile, EnrichedProfile } from '@/lib/profile-generator/stage3-enrichment';

export async function POST(request: NextRequest) {
  try {
    const { name, saveToDatabase = false } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    console.log(`\n🚀 API: Generating profile for "${name}"`);
    const startTime = Date.now();

    // ========== STAGE 1: DISCOVERY ==========
    console.log('📍 Stage 1: Discovery...');
    const discovered = await discoverProfile(name);

    // ========== STAGE 2: VERIFICATION ==========
    console.log('📍 Stage 2: Verification...');
    const verified = await verifyProfile(discovered);

    // ========== STAGE 3: ENRICHMENT ==========
    console.log('📍 Stage 3: Enrichment...');
    const enriched = await enrichProfile(verified);

    // Convert to Firestore format
    const firestoreData = convertToFirestoreFormat(enriched);

    // Save if requested
    if (saveToDatabase) {
      await saveToFirestore(firestoreData);
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Complete in ${(processingTime / 1000).toFixed(1)}s\n`);

    return NextResponse.json({
      success: true,
      profile: enriched,
      firestoreData,
      saved: saveToDatabase,
      processingTime,
      stages: {
        discovery: { 
          success: true, 
          foundYouTube: !!discovered.possibleLinks?.youtube,
          foundPodcast: !!discovered.possibleLinks?.podcast,
          booksFound: discovered.possibleBooks?.length || 0,
        },
        verification: {
          success: true,
          linksChecked: verified.verificationResults.linksChecked,
          linksValid: verified.verificationResults.linksValid,
          youtubeVerified: verified.verificationResults.youtubeVerified,
          podcastVerified: verified.verificationResults.podcastVerified,
        },
        enrichment: {
          success: true,
          confidence: enriched.confidence,
          confidenceScore: enriched.confidenceScore,
        },
      },
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: String(error), details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Convert enriched profile to Firestore document format
function convertToFirestoreFormat(profile: EnrichedProfile) {
  const slug = profile.displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  const creatorId = slug;

  return {
    creatorId,
    slug,

    ownership: {
      ownerId: null,
      ownershipStatus: 'unclaimed',
      claimedAt: null,
      claimMethod: null,
    },

    verification: {
      level: profile.confidence === 'high' ? 'community' : 'none',
      verifiedAt: null,
      verifiedBy: null,
    },

    profile: {
      name: profile.name,
      displayName: profile.displayName,
      title: profile.title,
      bio: profile.fullBio,
      shortBio: profile.shortBio,
      avatar: profile.avatarUrl,
      coverImage: null,
    },

    category: profile.category,
    tier: profile.tier,
    gender: profile.gender,

    region: profile.region,
    country: profile.country,
    countryFlag: profile.countryFlag,
    location: profile.location,

    languages: profile.languages,
    topics: profile.topics,
    affiliations: profile.affiliations,

    socialLinks: profile.socialLinks,

    content: {
      youtube: profile.youtube,
      podcast: profile.podcast,
      books: profile.books,
      audioBooks: profile.audioBooks, // Added Audiobooks
      ebooks: profile.ebooks, // Added E-books
      courses: profile.courses,
    },

    stats: {
      followerCount: 0,
      contentCount: 0,
      viewCount: 0,
    },

    featured: false,
    trending: false,
    isHistorical: profile.isHistorical,
    lifespan: profile.lifespan,
    note: profile.note,

    aiGenerated: {
      generatedAt: profile.pipeline.enrichedAt,
      model: 'multi-stage-pipeline',
      confidence: profile.confidence,
      confidenceScore: profile.confidenceScore,
      notes: profile.enrichmentNotes,
      sources: profile.dataSources,
      imageSearchQuery: profile.imageSearchQuery,
      pipeline: profile.pipeline,
    },

    source: 'ai_generated',

    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function saveToFirestore(data: any) {
  // Save creator document
  await setDoc(doc(db, 'creators', data.creatorId), data);
  
  // Save slug mapping
  await setDoc(doc(db, 'slugs', data.slug), { creatorId: data.creatorId });
  
  console.log(`💾 Saved to Firestore: ${data.creatorId}`);
}
