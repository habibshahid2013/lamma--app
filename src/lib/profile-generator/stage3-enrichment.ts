// src/lib/profile-generator/stage3-enrichment.ts
// STAGE 3: ENRICHMENT
// Uses Claude to fill gaps, improve quality, and finalize the profile

import Anthropic from '@anthropic-ai/sdk';
import { VerifiedProfile } from './stage2-verification';

export interface EnrichedProfile {
  // Final, polished data
  name: string;
  displayName: string;
  title: string | null;
  shortBio: string;
  fullBio: string;
  
  category: string;
  tier: 'verified' | 'rising' | 'community';
  gender: string;
  
  region: string;
  country: string;
  countryFlag: string;
  location: string | null;
  
  languages: string[];
  topics: string[];
  affiliations: string[];
  
  // Verified and final links
  socialLinks: {
    website: string | null;
    youtube: string | null;
    twitter: string | null;
    instagram: string | null;
    facebook: string | null;
    tiktok: string | null;
    podcast: string | null;
    spotify: string | null; // Added Spotify
  };
  
  // Rich content data
  youtube: {
    channelUrl: string | null;
    channelId: string | null;
    channelName: string | null;
    subscriberCount: string | null;
    videoCount: string | null;
    avatarUrl: string | null;
  } | null;
  
  podcast: {
    name: string | null;
    url: string | null;
    rssUrl: string | null;
    episodeCount: number | null;
  } | null;

  books: Array<{
    title: string;
    year: number | null;
    amazonUrl: string | null;
    description: string | null;
  }>;

  audioBooks: Array<{ // Added Audiobooks
    title: string;
    url: string | null;
    platform: string | null;
    year: number | null;
  }>;

  ebooks: Array<{ // Added E-books
    title: string;
    url: string | null;
    platform: string | null;
    year: number | null;
  }>;
  
  courses: Array<{
    title: string;
    platform: string;
    url: string | null;
  }>;
  
  // Images
  avatarUrl: string | null;
  imageSearchQuery: string;
  
  // Historical
  isHistorical: boolean;
  lifespan: string | null;
  note: string | null;
  
  // Final metadata
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0-100
  enrichmentNotes: string[];
  dataSources: string[];
  
  // Pipeline metadata
  pipeline: {
    discoveredAt: string;
    verifiedAt: string;
    enrichedAt: string;
    stages: string[];
  };
}

export async function enrichProfile(verified: VerifiedProfile): Promise<EnrichedProfile> {
  console.log(`✨ Stage 3: Enriching profile for "${verified.name}"...`);
  
  // Check if we have an Anthropic key for enrichment
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  
  // Calculate confidence score based on verification results
  let confidenceScore = 50; // Base score
  
  if (verified.verificationResults.youtubeVerified) confidenceScore += 15;
  if (verified.verificationResults.podcastVerified) confidenceScore += 10;
  if (verified.verifiedLinks.website?.status === 'valid') confidenceScore += 10;
  if (verified.verifiedLinks.twitter?.status === 'valid') confidenceScore += 5;
  if (verified.verifiedLinks.instagram?.status === 'valid') confidenceScore += 5;
  if (verified.possibleBooks && verified.possibleBooks.length > 0) confidenceScore += 5;
  
  // Penalize for missing data
  if (!verified.fullBio) confidenceScore -= 10;
  if (!verified.region) confidenceScore -= 5;
  if (verified.verificationResults.linksInvalid > 2) confidenceScore -= 10;
  
  confidenceScore = Math.max(0, Math.min(100, confidenceScore));
  
  const confidence: 'high' | 'medium' | 'low' = 
    confidenceScore >= 70 ? 'high' : 
    confidenceScore >= 40 ? 'medium' : 'low';
  
  // If we have Claude API, use it to polish the bio and fill gaps
  let enrichedBio = verified.fullBio || '';
  let enrichedShortBio = verified.shortBio || '';
  let enrichmentNotes: string[] = [...(verified.discoveryNotes || [])];
  
  if (ANTHROPIC_API_KEY && (confidence === 'low' || !verified.fullBio || verified.fullBio.length < 100)) {
    try {
      const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
      
      const enrichmentPrompt = `I have gathered data about an Islamic scholar/speaker. Please help improve and fill gaps.

CURRENT DATA:
Name: ${verified.name}
Title: ${verified.title || 'Unknown'}
Current Bio: ${verified.fullBio || 'Missing'}
Category: ${verified.category || 'Unknown'}
Affiliations: ${verified.affiliations?.join(', ') || 'Unknown'}
Topics: ${verified.topics?.join(', ') || 'Unknown'}

VERIFIED INFO:
- YouTube: ${verified.verifiedLinks.youtube?.channelName || 'Not found'} (${verified.verifiedLinks.youtube?.subscriberCount || 'N/A'} subscribers)
- Podcast: ${verified.verifiedLinks.podcast?.podcastName || 'Not found'}
- Books: ${verified.possibleBooks?.map(b => b.title).join(', ') || 'None found'}

TASK:
1. Write an improved, professional bio (2-3 paragraphs) based on what we know
2. Write a compelling short bio (max 140 characters)
3. Suggest any corrections to the data

Return JSON only:
{
  "improvedBio": "2-3 paragraph professional bio",
  "improvedShortBio": "Max 140 chars",
  "suggestedCategory": "scholar|speaker|educator|etc if current seems wrong",
  "suggestedTopics": ["any additional topics based on their work"],
  "notes": ["any observations or suggestions"]
}`;

      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Using Haiku for cost efficiency
        max_tokens: 1500,
        messages: [{ role: 'user', content: enrichmentPrompt }],
      });

      const textContent = response.content.find(block => block.type === 'text');
      if (textContent && textContent.type === 'text') {
        let jsonStr = textContent.text.trim();
        if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
        }
        
        const enriched = JSON.parse(jsonStr);
        
        if (enriched.improvedBio) enrichedBio = enriched.improvedBio;
        if (enriched.improvedShortBio) enrichedShortBio = enriched.improvedShortBio;
        if (enriched.notes) enrichmentNotes.push(...enriched.notes);
        
        // Merge suggested topics
        if (enriched.suggestedTopics && Array.isArray(enriched.suggestedTopics)) {
          const currentTopics = new Set(verified.topics || []);
          enriched.suggestedTopics.forEach((t: string) => currentTopics.add(t));
          verified.topics = Array.from(currentTopics);
        }
      }
    } catch (error) {
      console.warn('Claude enrichment failed, using original data:', error);
      enrichmentNotes.push('Claude enrichment unavailable, using original bio');
    }
  }
  
  // Build final enriched profile
  const enrichedProfile: EnrichedProfile = {
    name: verified.name || verified.displayName || 'Unknown',
    displayName: verified.displayName || verified.name || 'Unknown',
    title: verified.title || null,
    shortBio: enrichedShortBio || `${verified.category || 'Islamic'} scholar and educator.`,
    fullBio: enrichedBio || `${verified.name} is a respected figure in the Muslim community.`,
    
    category: verified.category || 'scholar',
    tier: confidence === 'high' ? 'verified' : confidence === 'medium' ? 'rising' : 'community',
    gender: verified.gender || 'male',
    
    region: verified.region || 'americas',
    country: verified.country || 'US',
    countryFlag: verified.countryFlag || '🌍',
    location: verified.location || null,
    
    languages: verified.languages?.length ? verified.languages : ['English'],
    topics: verified.topics?.length ? verified.topics : ['Spirituality'],
    affiliations: verified.affiliations || [],
    
    socialLinks: {
      website: verified.verifiedLinks.website?.status === 'valid' ? verified.verifiedLinks.website.url : null,
      youtube: verified.verifiedLinks.youtube?.status === 'valid' ? verified.verifiedLinks.youtube.url : null,
      twitter: verified.verifiedLinks.twitter?.status === 'valid' ? verified.verifiedLinks.twitter.url : null,
      instagram: verified.verifiedLinks.instagram?.status === 'valid' ? verified.verifiedLinks.instagram.url : null,
      facebook: verified.verifiedLinks.facebook?.status === 'valid' ? verified.verifiedLinks.facebook.url : null,
      tiktok: verified.verifiedLinks.tiktok?.status === 'valid' ? verified.verifiedLinks.tiktok.url : null,
      podcast: verified.verifiedLinks.podcast?.status === 'valid' ? verified.verifiedLinks.podcast.rssUrl || verified.verifiedLinks.podcast.url : null,
      spotify: verified.verifiedLinks.spotify?.status === 'valid' ? verified.verifiedLinks.spotify.url : null, // Added Spotify
    },
    
    youtube: verified.verifiedLinks.youtube?.status === 'valid' ? {
      channelUrl: verified.verifiedLinks.youtube.url,
      channelId: verified.verifiedLinks.youtube.channelId || null,
      channelName: verified.verifiedLinks.youtube.channelName || null,
      subscriberCount: verified.verifiedLinks.youtube.subscriberCount || null,
      videoCount: verified.verifiedLinks.youtube.videoCount || null,
      avatarUrl: verified.verifiedLinks.youtube.avatarUrl || null,
    } : null,
    
    podcast: verified.verifiedLinks.podcast?.status === 'valid' ? {
      name: verified.verifiedLinks.podcast.podcastName || null,
      url: verified.verifiedLinks.podcast.url,
      rssUrl: verified.verifiedLinks.podcast.rssUrl || null,
      episodeCount: verified.verifiedLinks.podcast.episodeCount || null,
    } : null,
    
    books: (verified.possibleBooks || []).map(book => ({
      title: book.title,
      year: book.year || null,
      amazonUrl: book.amazonUrl || null,
      description: null,
    })),

    audioBooks: (verified.possibleAudioBooks || []).map(book => ({ // Added Audiobooks logic
      title: book.title,
      url: book.url || null,
      platform: book.platform || null,
      year: null
    })),

    ebooks: (verified.possibleEbooks || []).map(book => ({ // Added E-books logic
      title: book.title,
      url: book.url || null,
      platform: book.platform || null,
      year: null
    })),
    
    courses: (verified.possibleCourses || []).map(course => ({
      title: course.title,
      platform: course.platform,
      url: course.url || null,
    })),
    
    // Use YouTube avatar if available, otherwise use discovered image
    avatarUrl: verified.verifiedLinks.youtube?.avatarUrl || verified.possibleImageUrl || null,
    imageSearchQuery: verified.imageSearchQuery || `${verified.name} islamic scholar photo`,
    
    isHistorical: verified.isHistorical || false,
    lifespan: verified.lifespan || null,
    note: verified.note || null,
    
    confidence,
    confidenceScore,
    enrichmentNotes,
    dataSources: ['perplexity', 'youtube-api', verified.verifiedLinks.podcast ? 'rss' : null].filter(Boolean) as string[],
    
    pipeline: {
      discoveredAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      enrichedAt: new Date().toISOString(),
      stages: ['discovery', 'verification', 'enrichment'],
    },
  };
  
  console.log(`✅ Stage 3 complete: Confidence ${confidence} (${confidenceScore}/100)`);
  
  return enrichedProfile;
}
