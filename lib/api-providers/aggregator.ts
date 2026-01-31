// src/lib/api-providers/aggregator.ts
// Profile Aggregator - Combines data from all API sources into one unified profile
// Uses: YouTube, Deezer, Google Books, Knowledge Graph, Wikipedia, Muslim Central

import { YouTubeProvider, YouTubeChannelData, YouTubeVideoData } from './youtube';
import { DeezerProvider, DeezerPodcastData, DeezerEpisodeData, tryMuslimCentralPodcast } from './deezer';
import { GoogleBooksProvider, BookData } from './google-books';
import { KnowledgeGraphProvider, KnowledgeGraphData } from './knowledge-graph';
import { WikipediaProvider, WikipediaData } from './wikipedia';

// ============================================
// AGGREGATED PROFILE TYPE
// ============================================

export interface AggregatedProfile {
  // Core Identity
  name: string;
  displayName: string;
  title: string | null;
  
  // Biographies (from different sources)
  bio: {
    short: string | null;
    full: string | null;
    source: 'wikipedia' | 'knowledge_graph' | 'deezer' | 'youtube' | 'generated';
  };
  
  // Images (ranked by quality)
  images: {
    primary: string | null;
    primarySource: 'knowledge_graph' | 'youtube' | 'deezer' | 'wikipedia' | 'google_books' | null;
    youtube: string | null;
    deezer: string | null;
    wikipedia: string | null;
    knowledgeGraph: string | null;
  };
  
  // YouTube Data (from YouTube API)
  youtube: {
    found: boolean;
    channelId: string | null;
    channelUrl: string | null;
    channelName: string | null;
    handle: string | null;
    subscriberCount: number | null;
    subscriberCountFormatted: string | null;
    videoCount: number | null;
    description: string | null;
    thumbnailUrl: string | null;
    recentVideos: YouTubeVideoData[];
  };
  
  // Podcast Data (from Deezer + Muslim Central)
  podcast: {
    found: boolean;
    source: 'deezer' | 'muslim_central' | null;
    podcastId: number | string | null;
    podcastUrl: string | null;
    podcastName: string | null;
    description: string | null;
    episodeCount: number | null;
    imageUrl: string | null;
    rssUrl: string | null;
    recentEpisodes: DeezerEpisodeData[];
  };
  
  // Books Data (from Google Books API)
  books: {
    found: boolean;
    totalBooks: number;
    books: Array<BookData & { amazonUrl: string }>;
  };
  
  // Knowledge Graph Data
  knowledgeGraph: {
    found: boolean;
    entityId: string | null;
    description: string | null;
    detailedDescription: string | null;
    url: string | null;
    types: string[];
  };
  
  // Wikipedia Data
  wikipedia: {
    found: boolean;
    url: string | null;
    extract: string | null;
    categories: string[];
    birthDate: string | null;
    birthPlace: string | null;
  };
  
  // Aggregated Metadata
  dataSources: string[];
  dataQuality: {
    score: number; // 0-100
    level: 'high' | 'medium' | 'low';
    sourcesFound: number;
    sourcesTotal: number;
    notes: string[];
  };
  
  // Timestamps
  aggregatedAt: string;
  processingTimeMs: number;
}

// ============================================
// AGGREGATOR CLASS
// ============================================

export class ProfileAggregator {
  private youtube: YouTubeProvider;
  private deezer: DeezerProvider;
  private googleBooks: GoogleBooksProvider;
  private knowledgeGraph: KnowledgeGraphProvider;
  private wikipedia: WikipediaProvider;

  constructor() {
    this.youtube = new YouTubeProvider();
    this.deezer = new DeezerProvider();
    this.googleBooks = new GoogleBooksProvider();
    this.knowledgeGraph = new KnowledgeGraphProvider();
    this.wikipedia = new WikipediaProvider();
  }

  // Main method: Aggregate profile from all sources
  async aggregateProfile(name: string): Promise<AggregatedProfile> {
    const startTime = Date.now();
    console.log(`\n🔄 Aggregating profile data for: "${name}"`);
    console.log('━'.repeat(50));

    const dataSources: string[] = [];
    const notes: string[] = [];

    // Run all API calls in parallel for speed
    console.log('📡 Fetching from all APIs in parallel...');
    
    const [
      youtubeData,
      podcastData,
      booksData,
      kgData,
      wikiData,
    ] = await Promise.all([
      this.fetchYouTube(name).catch(err => { notes.push(`YouTube error: ${err.message}`); return null; }),
      this.fetchPodcast(name).catch(err => { notes.push(`Podcast error: ${err.message}`); return null; }),
      this.fetchBooks(name).catch(err => { notes.push(`Google Books error: ${err.message}`); return null; }),
      this.fetchKnowledgeGraph(name).catch(err => { notes.push(`Knowledge Graph error: ${err.message}`); return null; }),
      this.fetchWikipedia(name).catch(err => { notes.push(`Wikipedia error: ${err.message}`); return null; }),
    ]);

    // Track data sources
    if (youtubeData?.found) dataSources.push('youtube');
    if (podcastData?.found) dataSources.push(podcastData.source || 'podcast');
    if (booksData && booksData.totalBooks > 0) dataSources.push('google_books');
    if (kgData?.found) dataSources.push('knowledge_graph');
    if (wikiData?.found) dataSources.push('wikipedia');

    // Determine best bio
    const bio = this.selectBestBio(wikiData, kgData, youtubeData, podcastData);

    // Determine best image
    const images = this.selectBestImages(kgData, youtubeData, podcastData, wikiData);

    // Calculate data quality score
    const dataQuality = this.calculateDataQuality(dataSources, notes);

    const processingTimeMs = Date.now() - startTime;

    console.log('━'.repeat(50));
    console.log(`✅ Aggregation complete in ${processingTimeMs}ms`);
    console.log(`   Sources found: ${dataSources.join(', ') || 'none'}`);
    console.log(`   Data quality: ${dataQuality.level} (${dataQuality.score}/100)`);
    console.log('');

    return {
      name,
      displayName: kgData?.name || wikiData?.title || name,
      title: this.inferTitle(name, wikiData, kgData),

      bio,

      images,

      youtube: {
        found: youtubeData?.found || false,
        channelId: youtubeData?.channelId || null,
        channelUrl: youtubeData?.channelUrl || null,
        channelName: youtubeData?.name || null,
        handle: youtubeData?.handle || null,
        subscriberCount: youtubeData?.subscriberCount || null,
        subscriberCountFormatted: youtubeData?.subscriberCountFormatted || null,
        videoCount: youtubeData?.videoCount || null,
        description: youtubeData?.description || null,
        thumbnailUrl: youtubeData?.thumbnailUrl || null,
        recentVideos: youtubeData?.recentVideos || [],
      },

      podcast: {
        found: podcastData?.found || false,
        source: podcastData?.source || null,
        podcastId: podcastData?.podcastId || null,
        podcastUrl: podcastData?.podcastUrl || null,
        podcastName: podcastData?.podcastName || null,
        description: podcastData?.description || null,
        episodeCount: podcastData?.episodeCount || null,
        imageUrl: podcastData?.imageUrl || null,
        rssUrl: podcastData?.rssUrl || null,
        recentEpisodes: podcastData?.recentEpisodes || [],
      },

      books: {
        found: (booksData?.totalBooks || 0) > 0,
        totalBooks: booksData?.totalBooks || 0,
        books: booksData?.books?.map(book => ({
          ...book,
          amazonUrl: this.googleBooks.generateAmazonUrl(book),
        })) || [],
      },

      knowledgeGraph: {
        found: kgData?.found || false,
        entityId: kgData?.entityId || null,
        description: kgData?.description || null,
        detailedDescription: kgData?.detailedDescription || null,
        url: kgData?.url || null,
        types: kgData?.type || [],
      },

      wikipedia: {
        found: wikiData?.found || false,
        url: wikiData?.url || null,
        extract: wikiData?.extract || null,
        categories: wikiData?.categories || [],
        birthDate: wikiData?.birthDate || null,
        birthPlace: wikiData?.birthPlace || null,
      },

      dataSources,
      dataQuality,

      aggregatedAt: new Date().toISOString(),
      processingTimeMs,
    };
  }

  // ============================================
  // INDIVIDUAL API FETCHERS
  // ============================================

  private async fetchYouTube(name: string): Promise<(YouTubeChannelData & { recentVideos: YouTubeVideoData[] }) | null> {
    console.log('  📺 Searching YouTube...');
    
    const channel = await this.youtube.searchChannel(name);
    if (!channel?.found || !channel.channelId) {
      console.log('     ❌ YouTube channel not found');
      return null;
    }

    console.log(`     ✅ Found: ${channel.name} (${channel.subscriberCountFormatted} subscribers)`);

    // Get recent videos
    const videos = await this.youtube.getChannelVideos(channel.channelId, 5);
    console.log(`     📹 Fetched ${videos.length} recent videos`);

    return { ...channel, recentVideos: videos };
  }

  private async fetchPodcast(name: string): Promise<{
    found: boolean;
    source: 'deezer' | 'muslim_central' | null;
    podcastId: number | string | null;
    podcastUrl: string | null;
    podcastName: string | null;
    description: string | null;
    episodeCount: number | null;
    imageUrl: string | null;
    rssUrl: string | null;
    recentEpisodes: DeezerEpisodeData[];
  } | null> {
    console.log('  🎙️ Searching for podcasts...');
    
    // Try Muslim Central first (better for Islamic scholars)
    console.log('     🕌 Checking Muslim Central...');
    const muslimCentral = await tryMuslimCentralPodcast(name);
    
    if (muslimCentral?.found) {
      console.log(`     ✅ Found on Muslim Central: ${muslimCentral.name}`);
      return {
        found: true,
        source: 'muslim_central',
        podcastId: muslimCentral.rssUrl,
        podcastUrl: muslimCentral.url,
        podcastName: muslimCentral.name,
        description: `Islamic lectures and content by ${name}`,
        episodeCount: null, // Would need to parse RSS to get count
        imageUrl: null,
        rssUrl: muslimCentral.rssUrl,
        recentEpisodes: [],
      };
    }
    
    // Try Deezer
    console.log('     🎵 Searching Deezer...');
    const podcasts = await this.deezer.searchPodcastsByPerson(name);
    
    if (podcasts && podcasts.length > 0) {
      const podcast = podcasts[0];
      console.log(`     ✅ Found on Deezer: ${podcast.title} (${podcast.episodeCount || '?'} episodes)`);
      
      // Get episodes if we have a podcast ID
      let episodes: DeezerEpisodeData[] = [];
      if (podcast.podcastId) {
        episodes = await this.deezer.getPodcastEpisodes(podcast.podcastId, 5);
        console.log(`     🎙️ Fetched ${episodes.length} recent episodes`);
      }
      
      return {
        found: true,
        source: 'deezer',
        podcastId: podcast.podcastId,
        podcastUrl: podcast.link,
        podcastName: podcast.title,
        description: podcast.description,
        episodeCount: podcast.episodeCount,
        imageUrl: podcast.imageUrl,
        rssUrl: null,
        recentEpisodes: episodes,
      };
    }
    
    console.log('     ❌ No podcasts found');
    return {
      found: false,
      source: null,
      podcastId: null,
      podcastUrl: null,
      podcastName: null,
      description: null,
      episodeCount: null,
      imageUrl: null,
      rssUrl: null,
      recentEpisodes: [],
    };
  }

  private async fetchBooks(name: string): Promise<{ totalBooks: number; books: BookData[] } | null> {
    console.log('  📚 Searching Google Books...');
    
    const result = await this.googleBooks.searchIslamicBooksByAuthor(name);
    
    if (result.totalBooks === 0) {
      console.log('     ❌ No books found');
      return result;
    }

    console.log(`     ✅ Found ${result.totalBooks} books`);
    return result;
  }

  private async fetchKnowledgeGraph(name: string): Promise<KnowledgeGraphData | null> {
    console.log('  🧠 Searching Knowledge Graph...');
    
    const result = await this.knowledgeGraph.searchPerson(name);
    
    if (!result?.found) {
      console.log('     ❌ Not found in Knowledge Graph');
      return result;
    }

    console.log(`     ✅ Found: ${result.name} (score: ${result.score?.toFixed(0)})`);
    return result;
  }

  private async fetchWikipedia(name: string): Promise<WikipediaData | null> {
    console.log('  📖 Searching Wikipedia...');
    
    const result = await this.wikipedia.searchPerson(name);
    
    if (!result?.found) {
      console.log('     ❌ No Wikipedia article found');
      return result;
    }

    console.log(`     ✅ Found: ${result.title}`);
    return result;
  }

  // ============================================
  // DATA SELECTION HELPERS
  // ============================================

  private selectBestBio(
    wiki: WikipediaData | null,
    kg: KnowledgeGraphData | null,
    yt: any,
    podcast: any
  ): AggregatedProfile['bio'] {
    // Priority: Wikipedia > Knowledge Graph > YouTube > Deezer
    
    if (wiki?.extract && wiki.extract.length > 100) {
      return {
        short: wiki.extract.substring(0, 150) + '...',
        full: wiki.fullExtract || wiki.extract,
        source: 'wikipedia',
      };
    }

    if (kg?.detailedDescription) {
      return {
        short: kg.description || null,
        full: kg.detailedDescription,
        source: 'knowledge_graph',
      };
    }

    if (yt?.description && yt.description.length > 50) {
      return {
        short: yt.description.substring(0, 150) + '...',
        full: yt.description,
        source: 'youtube',
      };
    }

    if (podcast?.description) {
      return {
        short: podcast.description.substring(0, 150) + '...',
        full: podcast.description,
        source: 'deezer',
      };
    }

    return {
      short: null,
      full: null,
      source: 'generated',
    };
  }

  private selectBestImages(
    kg: KnowledgeGraphData | null,
    yt: any,
    podcast: any,
    wiki: WikipediaData | null
  ): AggregatedProfile['images'] {
    // Priority for primary: Knowledge Graph > Wikipedia > YouTube > Deezer
    let primary: string | null = null;
    let primarySource: AggregatedProfile['images']['primarySource'] = null;

    if (kg?.imageUrl) {
      primary = kg.imageUrl;
      primarySource = 'knowledge_graph';
    } else if (wiki?.imageUrl) {
      primary = wiki.imageUrl;
      primarySource = 'wikipedia';
    } else if (yt?.thumbnailUrl) {
      primary = yt.thumbnailUrl;
      primarySource = 'youtube';
    } else if (podcast?.imageUrl) {
      primary = podcast.imageUrl;
      primarySource = 'deezer';
    }

    return {
      primary,
      primarySource,
      youtube: yt?.thumbnailUrl || null,
      deezer: podcast?.imageUrl || null,
      wikipedia: wiki?.imageUrl || null,
      knowledgeGraph: kg?.imageUrl || null,
    };
  }

  private inferTitle(name: string, wiki: WikipediaData | null, kg: KnowledgeGraphData | null): string | null {
    // Check if name already includes title
    const titlePatterns = ['Dr.', 'Dr', 'Sheikh', 'Shaykh', 'Imam', 'Mufti', 'Ustadh', 'Ustadha', 'Shaikh'];
    
    for (const title of titlePatterns) {
      if (name.toLowerCase().includes(title.toLowerCase())) {
        return title;
      }
    }

    // Check Wikipedia categories for clues
    if (wiki?.categories) {
      for (const cat of wiki.categories) {
        if (cat.toLowerCase().includes('imam')) return 'Imam';
        if (cat.toLowerCase().includes('mufti')) return 'Mufti';
        if (cat.toLowerCase().includes('sheikh')) return 'Sheikh';
      }
    }

    return null;
  }

  private calculateDataQuality(sources: string[], notes: string[]): AggregatedProfile['dataQuality'] {
    const sourcesTotal = 5; // YouTube, Podcast, Books, KG, Wikipedia
    const sourcesFound = sources.length;
    
    // Base score on sources found
    let score = (sourcesFound / sourcesTotal) * 60;
    
    // Bonus for key sources
    if (sources.includes('youtube')) score += 15;
    if (sources.includes('wikipedia')) score += 10;
    if (sources.includes('knowledge_graph')) score += 10;
    if (sources.includes('muslim_central') || sources.includes('deezer')) score += 5;

    score = Math.min(100, Math.round(score));

    const level: 'high' | 'medium' | 'low' = 
      score >= 70 ? 'high' :
      score >= 40 ? 'medium' : 'low';

    return {
      score,
      level,
      sourcesFound,
      sourcesTotal,
      notes,
    };
  }
}
