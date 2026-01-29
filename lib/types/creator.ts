export interface Creator {
  id: string;
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
  avatar?: string; // Optional for now, assuming external or placeholder
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
    podcast?: string;
    spotify?: string; // Added Spotify
  };
  
  // Extended Content
  content?: {
    youtube?: {
      channelId?: string;
      channelUrl?: string;
      subscriberCount?: string;
      videoCount?: string;
    };
    podcast?: {
      name?: string;
      url?: string;
      rssUrl?: string;
      platform?: string;
    };
    books?: Array<{
      title: string;
      url?: string;
      amazonUrl?: string;
      publisherUrl?: string;
      isbn?: string;
      year?: number;
      description?: string;
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
