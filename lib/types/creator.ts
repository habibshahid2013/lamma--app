export interface Creator {
  id: string;
  slug: string;
  name: string;
  category: "scholar" | "educator" | "speaker" | "reciter" | "author" | "activist" | "influencer" | "public_figure";
  tier: "verified" | "rising" | "new";
  gender: "male" | "female";
  region: "americas" | "europe" | "middle_east" | "africa" | "south_asia" | "southeast_asia" | "east_africa";
  country: string;
  countryFlag: string;
  location?: string;
  languages: string[];
  topics: string[];
  verified: boolean;
  verificationLevel: "official" | "community";
  featured: boolean;
  trending: boolean;
  isHistorical: boolean;
  lifespan?: string;
  note?: string;
  avatar?: string; 
  
  // Profile Object (New Schema)
  profile?: {
    name: string;
    displayName: string;
    avatar: string | null;
    coverImage: string | null;
    shortBio: string;
    bio: string;
    birthDate?: string;
    birthPlace?: string;
    nationality?: string;
  };

  stats?: {
    followerCount: number;
    contentCount?: number;
    viewCount?: number;
    youtubeSubscribers?: string;
  };
  socialLinks?: {
    website?: string;
    youtube?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    linkedin?: string;
    twitch?: string;
    threads?: string;
    patreon?: string;
    podcast?: string;
    spotify?: string;
  };
  
  // Extended Content
  content?: {
    youtube?: {
      channelId?: string;
      channelUrl?: string;
      channelTitle?: string;
      description?: string;
      subscriberCount?: string;
      videoCount?: string;
      viewCount?: string;
      thumbnailUrl?: string;
      recentVideos?: Array<{
        videoId: string;
        title: string;
        thumbnail: string;
        publishedAt: string;
        viewCount?: number;
      }>;
    };
    podcast?: {
      name?: string;
      url?: string;
      rssUrl?: string;
      platform?: string;
      episodeCount?: number;
      imageUrl?: string;
      description?: string;
      publisher?: string;
    };
    books?: Array<{
      bookId?: string;
      title: string;
      authors?: string[];
      description?: string;
      thumbnail?: string;
      publishedDate?: string;
      publisher?: string;
      pageCount?: number;
      amazonUrl?: string;
      previewLink?: string;
      isbn?: string;
      year?: number;
      categories?: string[];
    }>;
    ebooks?: Array<{
      title: string;
      url?: string;
      platform?: string; // Kindle, Apple Books, etc.
      year?: number;
    }>;
    audioBooks?: Array<{ // Added Audiobooks
      title: string;
      url?: string;
      platform?: string; // Audible, Spotify, etc.
      year?: number;
    }>;
    courses?: Array<{
      title: string;
      platform: string;
      url?: string;
    }>;
  };

  // AI Generation Metadata
  aiGenerated?: {
    generatedAt: string;
    model?: string;
    confidence: "high" | "medium" | "low";
    notes?: string[];
    sources?: string[];
    imageSearchQuery?: string;
  };
}
