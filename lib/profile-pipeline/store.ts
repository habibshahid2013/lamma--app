// src/lib/profile-pipeline/store.ts
// Profile Store - Handles Firestore operations with versioning and history

import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { ProfileVersion, ProfileFlag, RefreshSchedule } from './types';
import { AggregatedProfile } from '../api-providers/aggregator';

export class ProfileStore {
  
  // ========================================
  // SAVE PROFILE (with versioning)
  // ========================================
  
  async saveProfile(
    profile: AggregatedProfile,
    flags: ProfileFlag[],
    trigger: ProfileVersion['trigger'] = 'initial_creation',
    createdBy: string = 'system'
  ): Promise<{ creatorId: string; slug: string; version: number; isNew: boolean }> {
    
    const slug = this.generateSlug(profile.displayName);
    const creatorId = slug;
    
    // Check if profile already exists
    const existingDoc = await getDoc(doc(db, 'creators', creatorId));
    const isNew = !existingDoc.exists();
    const currentVersion = existingDoc.exists() ? (existingDoc.data()?.version || 0) : 0;
    const newVersion = currentVersion + 1;
    
    // Prepare the Firestore document
    const firestoreData = this.convertToFirestoreFormat(profile, creatorId, slug, newVersion, flags);
    
    // Save main document
    await setDoc(doc(db, 'creators', creatorId), firestoreData, { merge: true });
    
    // Save slug mapping
    await setDoc(doc(db, 'slugs', slug), { creatorId });
    
    // Save version history
    await this.saveVersion(creatorId, newVersion, firestoreData, trigger, createdBy, existingDoc.data());
    
    // Save/update refresh schedule
    await this.updateRefreshSchedule(creatorId, profile.dataQuality.score);
    
    // Save flags
    if (flags.length > 0) {
      await this.saveFlags(creatorId, flags);
    }
    
    console.log(`💾 Saved profile: ${creatorId} (v${newVersion}, ${isNew ? 'new' : 'updated'})`);
    
    return { creatorId, slug, version: newVersion, isNew };
  }
  
  // ========================================
  // VERSION HISTORY
  // ========================================
  
  private async saveVersion(
    creatorId: string,
    version: number,
    data: any,
    trigger: ProfileVersion['trigger'],
    createdBy: string,
    previousData?: any
  ): Promise<void> {
    const versionId = `${creatorId}_v${version}`;
    
    // Calculate changes from previous version
    const changes = previousData ? this.calculateChanges(previousData, data) : [];
    
    const versionDoc: ProfileVersion = {
      versionId,
      creatorId,
      version,
      trigger,
      data,
      changes,
      confidence: data.dataSource?.quality?.score || 0,
      dataSources: data.dataSource?.sources || [],
      flags: data.flags || [],
      createdAt: new Date().toISOString(),
      createdBy,
    };
    
    await setDoc(doc(db, 'profileVersions', versionId), versionDoc);
  }
  
  private calculateChanges(oldData: any, newData: any): ProfileVersion['changes'] {
    const changes: ProfileVersion['changes'] = [];
    const fieldsToCompare = [
      'profile.name',
      'profile.bio',
      'profile.avatar',
      'socialLinks.youtube',
      'socialLinks.podcast',
      'stats.youtubeSubscribers',
      'content.books',
    ];
    
    for (const fieldPath of fieldsToCompare) {
      const oldValue = this.getNestedValue(oldData, fieldPath);
      const newValue = this.getNestedValue(newData, fieldPath);
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field: fieldPath, oldValue, newValue });
      }
    }
    
    return changes;
  }
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((curr, key) => curr?.[key], obj);
  }
  
  // Get version history for a profile
  async getVersionHistory(creatorId: string, limitCount = 10): Promise<ProfileVersion[]> {
    const q = query(
      collection(db, 'profileVersions'),
      where('creatorId', '==', creatorId),
      orderBy('version', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ProfileVersion);
  }
  
  // Rollback to a previous version
  async rollbackToVersion(creatorId: string, targetVersion: number): Promise<boolean> {
    const versionDoc = await getDoc(doc(db, 'profileVersions', `${creatorId}_v${targetVersion}`));
    
    if (!versionDoc.exists()) {
      console.error(`Version ${targetVersion} not found for ${creatorId}`);
      return false;
    }
    
    const versionData = versionDoc.data() as ProfileVersion;
    
    // Get current version
    const currentDoc = await getDoc(doc(db, 'creators', creatorId));
    const currentVersion = currentDoc.data()?.version || 0;
    
    // Save the rollback as a new version
    const newVersion = currentVersion + 1;
    const rollbackData = {
      ...versionData.data,
      version: newVersion,
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'creators', creatorId), rollbackData);
    await this.saveVersion(creatorId, newVersion, rollbackData, 'manual_update', 'system', currentDoc.data());
    
    console.log(`⏪ Rolled back ${creatorId} from v${currentVersion} to v${targetVersion} (now v${newVersion})`);
    return true;
  }
  
  // ========================================
  // FLAGS MANAGEMENT
  // ========================================
  
  private async saveFlags(creatorId: string, flags: ProfileFlag[]): Promise<void> {
    const flagsRef = collection(db, 'creators', creatorId, 'flags');
    
    for (const flag of flags) {
      await setDoc(doc(flagsRef, flag.id), flag);
    }
    
    // Also update the main document with active flag count
    await updateDoc(doc(db, 'creators', creatorId), {
      'meta.activeFlagCount': increment(flags.length),
      'meta.hasUnresolvedFlags': true,
    });
  }
  
  async getFlags(creatorId: string, includeResolved = false): Promise<ProfileFlag[]> {
    let q = query(collection(db, 'creators', creatorId, 'flags'));
    
    if (!includeResolved) {
      q = query(q, where('resolvedAt', '==', null));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ProfileFlag);
  }
  
  async resolveFlag(creatorId: string, flagId: string, resolvedBy: string): Promise<void> {
    await updateDoc(doc(db, 'creators', creatorId, 'flags', flagId), {
      resolvedAt: new Date().toISOString(),
      resolvedBy,
    });
    
    // Update flag count
    await updateDoc(doc(db, 'creators', creatorId), {
      'meta.activeFlagCount': increment(-1),
    });
    
    // Check if any flags remain
    const remainingFlags = await this.getFlags(creatorId, false);
    if (remainingFlags.length === 0) {
      await updateDoc(doc(db, 'creators', creatorId), {
        'meta.hasUnresolvedFlags': false,
      });
    }
  }
  
  // Get all profiles with flags (for admin dashboard)
  async getProfilesWithFlags(): Promise<{ creatorId: string; name: string; flagCount: number }[]> {
    const q = query(
      collection(db, 'creators'),
      where('meta.hasUnresolvedFlags', '==', true),
      orderBy('meta.activeFlagCount', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      creatorId: doc.id,
      name: doc.data().profile?.name || doc.id,
      flagCount: doc.data().meta?.activeFlagCount || 0,
    }));
  }
  
  // ========================================
  // REFRESH SCHEDULING
  // ========================================
  
  private async updateRefreshSchedule(creatorId: string, confidenceScore: number): Promise<void> {
    // Higher confidence = less frequent refreshes
    // Lower confidence = more frequent refreshes
    const daysUntilRefresh = confidenceScore >= 70 ? 30 : confidenceScore >= 40 ? 14 : 7;
    
    const nextRefresh = new Date();
    nextRefresh.setDate(nextRefresh.getDate() + daysUntilRefresh);
    
    const schedule: RefreshSchedule = {
      creatorId,
      lastRefreshed: new Date().toISOString(),
      nextRefresh: nextRefresh.toISOString(),
      refreshCount: 1, // Will be incremented on subsequent refreshes
      priority: confidenceScore < 40 ? 'high' : confidenceScore < 70 ? 'normal' : 'low',
    };
    
    await setDoc(doc(db, 'refreshSchedules', creatorId), schedule, { merge: true });
    
    // Increment refresh count if already exists
    await updateDoc(doc(db, 'refreshSchedules', creatorId), {
      refreshCount: increment(1),
    }).catch(() => {}); // Ignore if doesn't exist yet
  }
  
  async getProfilesDueForRefresh(limitCount = 50): Promise<string[]> {
    const now = new Date().toISOString();
    
    const q = query(
      collection(db, 'refreshSchedules'),
      where('nextRefresh', '<=', now),
      orderBy('nextRefresh'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.id);
  }
  
  // ========================================
  // HELPER METHODS
  // ========================================
  
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  private convertToFirestoreFormat(
    profile: AggregatedProfile,
    creatorId: string,
    slug: string,
    version: number,
    flags: ProfileFlag[]
  ): any {
    return {
      creatorId,
      slug,
      version,

      ownership: {
        ownerId: null,
        ownershipStatus: 'unclaimed',
        claimedAt: null,
        claimMethod: null,
      },

      verification: {
        level: profile.dataQuality.level === 'high' ? 'community' : 'none',
        verifiedAt: null,
        verifiedBy: null,
      },

      profile: {
        name: profile.name,
        displayName: profile.displayName,
        title: profile.title,
        bio: profile.bio.full,
        shortBio: profile.bio.short || `${profile.displayName} is an Islamic scholar and educator.`,
        avatar: profile.images.primary,
        coverImage: null,
      },

      category: this.inferCategory(profile),
      tier: profile.dataQuality.level === 'high' ? 'verified' : 'rising',
      gender: 'male',

      region: 'americas',
      country: 'US',
      countryFlag: '🇺🇸',
      location: profile.wikipedia.birthPlace || null,

      languages: ['English'],
      topics: this.inferTopics(profile),
      affiliations: [],

      socialLinks: {
        website: profile.knowledgeGraph.url || profile.wikipedia.url || null,
        youtube: profile.youtube.channelUrl,
        twitter: null,
        instagram: null,
        facebook: null,
        tiktok: null,
        linkedin: null,
        twitch: null,
        threads: null,
        patreon: null,
        podcast: profile.podcast.podcastUrl,
        spotify: null,
      },

      content: {
        youtube: profile.youtube.found ? {
          channelId: profile.youtube.channelId,
          channelUrl: profile.youtube.channelUrl,
          channelName: profile.youtube.channelName,
          handle: profile.youtube.handle,
          subscriberCount: profile.youtube.subscriberCount,
          subscriberCountFormatted: profile.youtube.subscriberCountFormatted,
          videoCount: profile.youtube.videoCount,
          thumbnailUrl: profile.youtube.thumbnailUrl,
        } : null,

        podcast: profile.podcast.found ? {
          source: profile.podcast.source,
          podcastId: profile.podcast.podcastId,
          podcastUrl: profile.podcast.podcastUrl,
          name: profile.podcast.podcastName,
          episodeCount: profile.podcast.episodeCount,
          imageUrl: profile.podcast.imageUrl,
          rssUrl: profile.podcast.rssUrl,
        } : null,

        books: profile.books.books.map(book => ({
          bookId: book.bookId,
          title: book.title,
          authors: book.authors,
          publishedDate: book.publishedDate,
          imageUrl: book.imageUrl,
          amazonUrl: book.amazonUrl,
          previewLink: book.previewLink,
        })),

        courses: [],
      },

      stats: {
        followerCount: 0,
        contentCount: profile.youtube.videoCount || 0,
        viewCount: 0,
        youtubeSubscribers: profile.youtube.subscriberCount,
        podcastEpisodes: profile.podcast.episodeCount,
        booksPublished: profile.books.totalBooks,
      },

      featured: false,
      trending: false,
      isHistorical: false,
      lifespan: null,
      note: null,

      dataSource: {
        aggregatedAt: profile.aggregatedAt,
        processingTimeMs: profile.processingTimeMs,
        sources: profile.dataSources,
        quality: profile.dataQuality,
        bioSource: profile.bio.source,
        imageSource: profile.images.primarySource,
      },

      meta: {
        activeFlagCount: flags.length,
        hasUnresolvedFlags: flags.length > 0,
        lastValidated: new Date().toISOString(),
      },

      source: 'automated_pipeline',

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  }
  
  private inferCategory(profile: AggregatedProfile): string {
    const allText = [
      profile.bio.full,
      profile.wikipedia.extract,
      ...(profile.wikipedia.categories || []),
    ].filter(Boolean).join(' ').toLowerCase();

    if (allText.includes('reciter') || allText.includes('qari')) return 'reciter';
    if (allText.includes('imam')) return 'scholar';
    if (allText.includes('mufti')) return 'scholar';
    if (allText.includes('author')) return 'author';
    if (allText.includes('activist')) return 'activist';
    if (allText.includes('educator') || allText.includes('teacher')) return 'educator';
    if (allText.includes('preacher') || allText.includes('speaker')) return 'speaker';
    if (allText.includes('scholar')) return 'scholar';
    
    if (profile.books.totalBooks > 3) return 'author';
    if (profile.youtube.found && (profile.youtube.subscriberCount || 0) > 100000) return 'speaker';
    
    return 'scholar';
  }
  
  private inferTopics(profile: AggregatedProfile): string[] {
    const topics = new Set<string>();
    
    const allText = [
      profile.bio.full,
      profile.wikipedia.extract,
      ...(profile.wikipedia.categories || []),
      ...(profile.books.books.flatMap(b => b.categories || [])),
    ].filter(Boolean).join(' ').toLowerCase();

    const topicKeywords: Record<string, string[]> = {
      'Spirituality': ['spirituality', 'spiritual', 'soul', 'heart'],
      'Quran': ['quran', 'quranic', 'tafsir'],
      'Hadith': ['hadith', 'sunnah', 'prophetic'],
      'Fiqh': ['fiqh', 'jurisprudence', 'sharia'],
      'Seerah': ['seerah', 'prophet', 'muhammad'],
      'Youth': ['youth', 'young', 'teens'],
      'Family': ['family', 'marriage', 'parenting'],
      'Social Justice': ['justice', 'activism', 'civil rights'],
      'Dawah': ['dawah', 'outreach', 'convert'],
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(kw => allText.includes(kw))) {
        topics.add(topic);
      }
    }

    if (topics.size === 0) topics.add('Spirituality');
    return Array.from(topics);
  }
}
