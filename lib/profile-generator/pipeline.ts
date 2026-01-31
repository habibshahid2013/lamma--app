// src/lib/profile-generator/pipeline.ts
// MAIN PIPELINE
// Orchestrates all stages: Discovery → Verification → Enrichment

import { discoverProfile, DiscoveredProfile } from './stage1-discovery';
import { verifyProfile, VerifiedProfile } from './stage2-verification';
import { enrichProfile, EnrichedProfile } from './stage3-enrichment';

export interface GeneratedProfile extends EnrichedProfile {
  // Additional metadata for the complete profile
  generationId: string;
  generatedAt: string;
  processingTime: number;
  stageResults: {
    discovery: { success: boolean; error?: string };
    verification: { success: boolean; linksChecked: number; linksValid: number };
    enrichment: { success: boolean; confidenceImproved: boolean };
  };
}

export interface PipelineProgress {
  stage: 'discovery' | 'verification' | 'enrichment' | 'complete';
  progress: number; // 0-100
  message: string;
  data?: any;
}

export async function generateProfile(
  name: string,
  onProgress?: (progress: PipelineProgress) => void
): Promise<GeneratedProfile> {
  const startTime = Date.now();
  const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`\n🚀 Starting profile generation pipeline for: "${name}"`);
  console.log(`   Generation ID: ${generationId}`);
  console.log('━'.repeat(50));
  
  const stageResults = {
    discovery: { success: false, error: undefined as string | undefined },
    verification: { success: false, linksChecked: 0, linksValid: 0 },
    enrichment: { success: false, confidenceImproved: false },
  };
  
  let discovered: DiscoveredProfile | null = null;
  let verified: VerifiedProfile | null = null;
  let enriched: EnrichedProfile | null = null;
  
  // ========== STAGE 1: DISCOVERY ==========
  onProgress?.({
    stage: 'discovery',
    progress: 10,
    message: 'Searching the web for information...',
  });
  
  try {
    discovered = await discoverProfile(name);
    stageResults.discovery.success = true;
    
    onProgress?.({
      stage: 'discovery',
      progress: 33,
      message: `Found: ${discovered.name || name}`,
      data: { 
        hasYouTube: !!discovered.possibleLinks?.youtube,
        hasPodcast: !!discovered.possibleLinks?.podcast,
        booksFound: discovered.possibleBooks?.length || 0,
      },
    });
  } catch (error) {
    stageResults.discovery.error = String(error);
    console.error('❌ Discovery failed:', error);
    throw new Error(`Discovery stage failed: ${error}`);
  }
  
  // ========== STAGE 2: VERIFICATION ==========
  onProgress?.({
    stage: 'verification',
    progress: 40,
    message: 'Verifying links and fetching real data...',
  });
  
  try {
    verified = await verifyProfile(discovered);
    stageResults.verification = {
      success: true,
      linksChecked: verified.verificationResults.linksChecked,
      linksValid: verified.verificationResults.linksValid,
    };
    
    onProgress?.({
      stage: 'verification',
      progress: 66,
      message: `Verified ${verified.verificationResults.linksValid}/${verified.verificationResults.linksChecked} links`,
      data: {
        youtubeVerified: verified.verificationResults.youtubeVerified,
        podcastVerified: verified.verificationResults.podcastVerified,
        subscriberCount: verified.verifiedLinks.youtube?.subscriberCount,
      },
    });
  } catch (error) {
    console.error('❌ Verification failed:', error);
    // Continue with unverified data
    verified = {
      ...discovered,
      verifiedLinks: {
        website: null,
        youtube: null,
        twitter: null,
        instagram: null,
        facebook: null,
        tiktok: null,
        podcast: null,
        spotify: null,
      },
      verificationResults: {
        linksChecked: 0,
        linksValid: 0,
        linksInvalid: 0,
        youtubeVerified: false,
        podcastVerified: false,
        spotifyVerified: false,
      },
    };
  }
  
  // ========== STAGE 3: ENRICHMENT ==========
  onProgress?.({
    stage: 'enrichment',
    progress: 75,
    message: 'Enriching profile and filling gaps...',
  });
  
  try {
    const initialConfidence = verified.rawConfidence;
    enriched = await enrichProfile(verified);
    stageResults.enrichment = {
      success: true,
      confidenceImproved: enriched.confidence !== initialConfidence,
    };
    
    onProgress?.({
      stage: 'enrichment',
      progress: 95,
      message: `Profile complete! Confidence: ${enriched.confidence}`,
      data: {
        confidence: enriched.confidence,
        confidenceScore: enriched.confidenceScore,
      },
    });
  } catch (error) {
    console.error('❌ Enrichment failed:', error);
    // Use verified data as-is
    enriched = {
      name: verified.name || name,
      displayName: verified.displayName || name,
      title: verified.title || null,
      shortBio: verified.shortBio || 'Islamic scholar and educator.',
      fullBio: verified.fullBio || '',
      category: verified.category || 'scholar',
      tier: 'community',
      gender: verified.gender || 'male',
      region: verified.region || 'americas',
      country: verified.country || 'US',
      countryFlag: verified.countryFlag || '🌍',
      location: verified.location || null,
      languages: verified.languages || ['English'],
      topics: verified.topics || [],
      affiliations: verified.affiliations || [],
      socialLinks: {
        website: verified.verifiedLinks.website?.url || null,
        youtube: verified.verifiedLinks.youtube?.url || null,
        twitter: verified.verifiedLinks.twitter?.url || null,
        instagram: verified.verifiedLinks.instagram?.url || null,
        facebook: verified.verifiedLinks.facebook?.url || null,
        tiktok: verified.verifiedLinks.tiktok?.url || null,
        podcast: verified.verifiedLinks.podcast?.url || null,
        spotify: verified.verifiedLinks.spotify?.url || null, // Added Spotify
      },
      youtube: verified.verifiedLinks.youtube ? {
        channelUrl: verified.verifiedLinks.youtube.url,
        channelId: verified.verifiedLinks.youtube.channelId || null,
        channelName: verified.verifiedLinks.youtube.channelName || null,
        subscriberCount: verified.verifiedLinks.youtube.subscriberCount || null,
        videoCount: verified.verifiedLinks.youtube.videoCount || null,
        avatarUrl: verified.verifiedLinks.youtube.avatarUrl || null,
      } : null,
      podcast: verified.verifiedLinks.podcast ? {
        name: verified.verifiedLinks.podcast.podcastName || null,
        url: verified.verifiedLinks.podcast.url,
        rssUrl: verified.verifiedLinks.podcast.rssUrl || null,
        episodeCount: verified.verifiedLinks.podcast.episodeCount || null,
      } : null,
      books: (verified.possibleBooks || []).map(b => ({
        title: b.title,
        year: b.year || null,
        amazonUrl: b.amazonUrl || null,
        description: null
      })),
      audioBooks: (verified.possibleAudioBooks || []).map(b => ({ // Added Audiobooks logic
        title: b.title,
        url: b.url || null,
        platform: b.platform || null,
        year: null
      })),
      ebooks: (verified.possibleEbooks || []).map(b => ({ // Added E-books logic
        title: b.title,
        url: b.url || null,
        platform: b.platform || null,
        year: null
      })),
      courses: (verified.possibleCourses || []).map(c => ({
        title: c.title,
        platform: c.platform,
        url: c.url || null
      })),
      avatarUrl: verified.possibleImageUrl || null,
      imageSearchQuery: verified.imageSearchQuery || `${name} photo`,
      isHistorical: verified.isHistorical || false,
      lifespan: verified.lifespan || null,
      note: verified.note || null,
      confidence: 'low',
      confidenceScore: 30,
      enrichmentNotes: ['Enrichment failed, using basic data'],
      dataSources: ['perplexity'],
      pipeline: {
        discoveredAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        enrichedAt: new Date().toISOString(),
        stages: ['discovery', 'verification'],
      },
    };
  }
  
  // ========== COMPLETE ==========
  const processingTime = Date.now() - startTime;
  
  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: 'Profile generation complete!',
  });
  
  console.log('━'.repeat(50));
  console.log(`✅ Pipeline complete in ${(processingTime / 1000).toFixed(1)}s`);
  console.log(`   Confidence: ${enriched.confidence} (${enriched.confidenceScore}/100)`);
  console.log(`   YouTube: ${enriched.youtube?.subscriberCount || 'Not found'}`);
  console.log(`   Podcast: ${enriched.podcast?.name || 'Not found'}`);
  console.log(`   Books: ${enriched.books.length}`);
  console.log('');
  
  return {
    ...enriched,
    generationId,
    generatedAt: new Date().toISOString(),
    processingTime,
    stageResults,
  };
}

// ============================================
// BATCH GENERATION
// ============================================

export async function generateProfiles(
  names: string[],
  onProgress?: (index: number, total: number, name: string, result: GeneratedProfile | Error) => void
): Promise<Map<string, GeneratedProfile | Error>> {
  const results = new Map<string, GeneratedProfile | Error>();
  
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    
    // Rate limiting between profiles
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    try {
      const profile = await generateProfile(name);
      results.set(name, profile);
      onProgress?.(i + 1, names.length, name, profile);
    } catch (error) {
      results.set(name, error as Error);
      onProgress?.(i + 1, names.length, name, error as Error);
    }
  }
  
  return results;
}
