import { discoverProfile, DiscoveredProfile } from './stage1-discovery';
import { verifyProfile } from './stage2-verification';
import { enrichProfile, EnrichedProfile } from './stage3-enrichment';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Runs the full 3-stage profile generation pipeline (API-First)
 */
export async function runProfilePipeline(name: string): Promise<{
    profile: EnrichedProfile;
    firestoreData: any;
    stages: any;
}> {
    console.log(`\n🚀 Pipeline: Processing "${name}" (API-First)`);
    
    // Stage 1: API-First Discovery
    const discovered = await discoverProfile(name);
    
    // Stage 2: Verification (skip YouTube if already verified from API)
    const verified = await verifyProfile(discovered);
    
    // Stage 3: Enrichment
    const enriched = await enrichProfile(verified);
    
    // Convert with API data priority
    const firestoreData = convertToFirestoreFormat(enriched, discovered);
    
    return {
        profile: enriched,
        firestoreData,
        stages: {
            discovery: { 
                success: true, 
                apiYouTube: !!discovered.apiData?.youtube,
                apiBooks: discovered.verifiedBooks?.length || 0,
                perplexityFallback: !!discovered.possibleLinks?.youtube && !discovered.apiData?.youtube,
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

/**
 * Convert to Firestore format - APIs take priority over Perplexity data
 */
function convertToFirestoreFormat(profile: EnrichedProfile, discovered?: DiscoveredProfile) {
  const slug = profile.displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  const creatorId = slug;

  // Build YouTube data - API takes priority
  const youtubeFromApi = discovered?.apiData?.youtube;
  const youtubeVideos = discovered?.apiData?.recentVideos || [];
  
  const youtubeData = youtubeFromApi ? {
    channelId: youtubeFromApi.channelId,
    channelUrl: youtubeFromApi.channelUrl,
    thumbnailUrl: youtubeFromApi.thumbnailUrl,
    subscriberCount: youtubeFromApi.subscriberCount,
    videoCount: youtubeFromApi.videoCount,
    recentVideos: youtubeVideos.map(v => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      publishedAt: v.publishedAt,
    })),
  } : profile.youtube;

  // Build Books data - API takes priority
  const booksFromApi = discovered?.verifiedBooks || [];
  const booksData = booksFromApi.length > 0 
    ? booksFromApi.map(b => ({
        title: b.title,
        authors: b.authors,
        year: b.publishedDate ? parseInt(b.publishedDate.substring(0, 4)) : undefined,
        thumbnail: b.thumbnail,
        amazonUrl: b.amazonUrl,
        isbn: b.isbn,
      }))
    : profile.books;

  // Use YouTube thumbnail as avatar if no other available
  const avatarUrl = profile.avatarUrl || youtubeFromApi?.thumbnailUrl || null;

  return {
    creatorId,
    slug,
    
    profile: {
      name: profile.name,
      displayName: profile.displayName,
      title: profile.title,
      bio: profile.fullBio,
      shortBio: profile.shortBio,
      avatar: avatarUrl,
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
      youtube: youtubeData,
      podcast: profile.podcast,
      books: booksData,
      courses: profile.courses,
      ebooks: profile.ebooks || [],
      audioBooks: profile.audioBooks || [],
    },
    
    stats: {
      followerCount: 0,
      contentCount: youtubeVideos.length + (booksData?.length || 0),
      viewCount: 0,
    },

    isHistorical: profile.isHistorical,
    
    aiGenerated: {
      generatedAt: new Date().toISOString(),
      model: 'api-first-pipeline-v3',
      confidence: profile.confidence,
      confidenceScore: profile.confidenceScore,
      sources: [
        ...(youtubeFromApi ? ['YouTube API'] : []),
        ...(booksFromApi.length > 0 ? ['Google Books API'] : []),
        ...(profile.dataSources || []),
      ],
    },
    
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
