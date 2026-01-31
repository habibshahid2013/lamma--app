// src/lib/profile-pipeline/sync-service.ts
// Sync Service - Enriches existing profiles with API data
// For profiles that were created manually before the pipeline existed

import { doc, getDoc, getDocs, collection, query, where, limit, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ProfileAggregator, AggregatedProfile } from '../api-providers/aggregator';
import { ProfileValidator } from './validator';
import { ProfileFlag } from './types';

export interface SyncResult {
  creatorId: string;
  name: string;
  success: boolean;
  action: 'enriched' | 'skipped' | 'failed';
  enrichments: string[];
  flags: ProfileFlag[];
  error?: string;
}

export class ProfileSyncService {
  private aggregator: ProfileAggregator;
  private validator: ProfileValidator;

  constructor() {
    this.aggregator = new ProfileAggregator();
    this.validator = new ProfileValidator();
  }

  // Sync a single profile by creatorId
  async syncProfile(creatorId: string): Promise<SyncResult> {
    console.log(`\n🔄 Syncing profile: ${creatorId}`);

    try {
      // Get existing profile from Firestore
      const creatorDoc = await getDoc(doc(db, 'creators', creatorId));
      
      if (!creatorDoc.exists()) {
        return {
          creatorId,
          name: creatorId,
          success: false,
          action: 'failed',
          enrichments: [],
          flags: [],
          error: 'Profile not found in database',
        };
      }

      const existingData = creatorDoc.data();
      const name = existingData.profile?.name || existingData.name || creatorId;

      // Fetch fresh data from APIs
      console.log(`   📡 Fetching API data for "${name}"...`);
      const aggregated = await this.aggregator.aggregateProfile(name);

      if (!aggregated || !aggregated.name) {
        return {
          creatorId,
          name,
          success: false,
          action: 'failed',
          enrichments: [],
          flags: [],
          error: 'Failed to fetch API data',
        };
      }

      // Validate the data
      const { flags } = await this.validator.validate(aggregated);

      // Merge new data with existing (don't overwrite manual edits)
      const enrichments = await this.mergeData(creatorId, existingData, aggregated);

      if (enrichments.length === 0) {
        console.log(`   ⏭️ No new data to add`);
        return {
          creatorId,
          name,
          success: true,
          action: 'skipped',
          enrichments: [],
          flags,
        };
      }

      console.log(`   ✅ Enriched with: ${enrichments.join(', ')}`);
      return {
        creatorId,
        name,
        success: true,
        action: 'enriched',
        enrichments,
        flags,
      };

    } catch (error) {
      console.error(`   ❌ Error:`, error);
      return {
        creatorId,
        name: creatorId,
        success: false,
        action: 'failed',
        enrichments: [],
        flags: [],
        error: String(error),
      };
    }
  }

  // Merge new API data with existing profile (only fill gaps)
  private async mergeData(
    creatorId: string,
    existing: any,
    aggregated: AggregatedProfile
  ): Promise<string[]> {
    const updates: Partial<any> = {};
    const enrichments: string[] = [];

    // Merge YouTube data (if not already present)
    if (aggregated.youtube.found && !existing.content?.youtube?.channelId) {
      updates['content.youtube'] = {
        channelId: aggregated.youtube.channelId,
        channelUrl: aggregated.youtube.channelUrl,
        channelName: aggregated.youtube.channelName,
        handle: aggregated.youtube.handle,
        subscriberCount: aggregated.youtube.subscriberCount,
        subscriberCountFormatted: aggregated.youtube.subscriberCountFormatted,
        videoCount: aggregated.youtube.videoCount,
        thumbnailUrl: aggregated.youtube.thumbnailUrl,
      };
      updates['socialLinks.youtube'] = aggregated.youtube.channelUrl;
      updates['stats.youtubeSubscribers'] = aggregated.youtube.subscriberCount;
      enrichments.push('youtube');
    }

    // Merge podcast data (if not already present)
    if (aggregated.podcast.found && !existing.content?.podcast?.podcastId) {
      updates['content.podcast'] = {
        source: aggregated.podcast.source,
        podcastId: aggregated.podcast.podcastId,
        podcastUrl: aggregated.podcast.podcastUrl,
        name: aggregated.podcast.podcastName,
        episodeCount: aggregated.podcast.episodeCount,
        imageUrl: aggregated.podcast.imageUrl,
        rssUrl: aggregated.podcast.rssUrl,
      };
      updates['socialLinks.podcast'] = aggregated.podcast.podcastUrl || aggregated.podcast.rssUrl;
      updates['stats.podcastEpisodes'] = aggregated.podcast.episodeCount;
      enrichments.push('podcast');
    }

    // Merge books data (if no books exist)
    if (aggregated.books.found && (!existing.content?.books || existing.content.books.length === 0)) {
      updates['content.books'] = aggregated.books.books.map(book => ({
        bookId: book.bookId,
        title: book.title,
        authors: book.authors,
        publishedDate: book.publishedDate,
        imageUrl: book.imageUrl,
        amazonUrl: book.amazonUrl,
        previewLink: book.previewLink,
      }));
      updates['stats.booksPublished'] = aggregated.books.totalBooks;
      enrichments.push(`books (${aggregated.books.totalBooks})`);
    }

    // Merge avatar (if not present)
    if (aggregated.images.primary && !existing.profile?.avatar) {
      updates['profile.avatar'] = aggregated.images.primary;
      enrichments.push('avatar');
    }

    // Merge bio (if not present or too short)
    if (aggregated.bio.full && (!existing.profile?.bio || existing.profile.bio.length < 100)) {
      updates['profile.bio'] = aggregated.bio.full;
      updates['profile.shortBio'] = aggregated.bio.short || aggregated.bio.full.substring(0, 150) + '...';
      enrichments.push('bio');
    }

    // Add data source metadata
    if (enrichments.length > 0) {
      updates['dataSource'] = {
        enrichedAt: new Date().toISOString(),
        sources: aggregated.dataSources,
        quality: aggregated.dataQuality,
      };
      updates['updatedAt'] = new Date();
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, 'creators', creatorId), updates);
    }

    return enrichments;
  }

  // Sync multiple profiles
  async syncBatch(creatorIds: string[]): Promise<{
    summary: { total: number; enriched: number; skipped: number; failed: number };
    results: SyncResult[];
  }> {
    const results: SyncResult[] = [];

    for (let i = 0; i < creatorIds.length; i++) {
      const creatorId = creatorIds[i];
      console.log(`\n📦 Sync [${i + 1}/${creatorIds.length}]: ${creatorId}`);

      // Rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const result = await this.syncProfile(creatorId);
      results.push(result);
    }

    const enriched = results.filter(r => r.action === 'enriched').length;
    const skipped = results.filter(r => r.action === 'skipped').length;
    const failed = results.filter(r => r.action === 'failed').length;

    return {
      summary: {
        total: creatorIds.length,
        enriched,
        skipped,
        failed,
      },
      results,
    };
  }

  // Get all profiles that need syncing (missing API data)
  async getProfilesToSync(limitCount = 50): Promise<string[]> {
    // Get profiles without YouTube data (most common missing data)
    const q = query(
      collection(db, 'creators'),
      where('content.youtube.channelId', '==', null),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.id);
  }

  // Get all profile IDs
  async getAllProfileIds(): Promise<string[]> {
    const snapshot = await getDocs(collection(db, 'creators'));
    return snapshot.docs.map(doc => doc.id);
  }

  /**
   * Refresh YouTube stats for a profile using direct API (cached)
   */
  async refreshYouTubeStats(creatorId: string): Promise<{
    success: boolean;
    updated: boolean;
    newStats?: { subscriberCount: string; videoCount: string };
    error?: string;
  }> {
    try {
      const creatorDoc = await getDoc(doc(db, 'creators', creatorId));
      if (!creatorDoc.exists()) {
        return { success: false, updated: false, error: 'Profile not found' };
      }

      const existing = creatorDoc.data();
      const channelId = existing.content?.youtube?.channelId;

      if (!channelId) {
        return { success: false, updated: false, error: 'No YouTube channel' };
      }

      // Import dynamically to avoid circular deps
      const { getChannelById } = await import('@/lib/api-clients/youtube');
      const freshData = await getChannelById(channelId);

      if (!freshData) {
        return { success: false, updated: false, error: 'Failed to fetch YouTube data' };
      }

      // Update stats
      await updateDoc(doc(db, 'creators', creatorId), {
        'content.youtube.subscriberCount': freshData.subscriberCount,
        'content.youtube.videoCount': freshData.videoCount,
        'content.youtube.thumbnailUrl': freshData.thumbnailUrl,
        'stats.youtubeSubscribers': parseInt(freshData.viewCount) || 0,
        'updatedAt': new Date(),
      });

      return {
        success: true,
        updated: true,
        newStats: {
          subscriberCount: freshData.subscriberCount,
          videoCount: freshData.videoCount,
        },
      };
    } catch (error) {
      return { success: false, updated: false, error: String(error) };
    }
  }
}
