import { discoverProfile } from './stage1-discovery';
import { verifyProfile } from './stage2-verification';
import { enrichProfile, EnrichedProfile } from './stage3-enrichment';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Runs the full 3-stage profile generation pipeline
 */
export async function runProfilePipeline(name: string): Promise<{
    profile: EnrichedProfile;
    firestoreData: any;
    stages: any;
}> {
    console.log(`\n🚀 Pipeline: Processing "${name}"`);
    
    // Stage 1
    const discovered = await discoverProfile(name);
    
    // Stage 2
    const verified = await verifyProfile(discovered);
    
    // Stage 3
    const enriched = await enrichProfile(verified);
    
    // Convert
    const firestoreData = convertToFirestoreFormat(enriched);
    
    return {
        profile: enriched,
        firestoreData,
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
            },
            enrichment: {
                success: true,
                confidence: enriched.confidence,
                confidenceScore: enriched.confidenceScore,
            },
        }
    };
}

// Helper: Convert to Firestore Format (Aligned with latest Schema)
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
    
    // New Schema Consistency
    profile: {
      name: profile.name,
      displayName: profile.displayName,
      title: profile.title,
      bio: profile.fullBio,
      shortBio: profile.shortBio,
      avatar: profile.avatarUrl,
    },

    category: profile.category,
    tier: profile.tier,
    gender: profile.gender,
    region: profile.region,
    country: profile.country,
    location: profile.location,
    
    languages: profile.languages,
    topics: profile.topics,
    
    socialLinks: profile.socialLinks,
    
    content: {
      youtube: profile.youtube, // Ensure this matches new schema
      podcast: profile.podcast,
      books: profile.books,
      courses: profile.courses,
      ebooks: profile.ebooks || [],
      audioBooks: profile.audioBooks || [],
    },
    
    stats: {
        followerCount: 0,
        contentCount: 0,
    },

    isHistorical: profile.isHistorical,
    
    aiGenerated: {
      generatedAt: new Date().toISOString(),
      model: 'multi-stage-pipeline-v2',
      confidence: profile.confidence,
      confidenceScore: profile.confidenceScore,
      sources: profile.dataSources,
    },
    
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
