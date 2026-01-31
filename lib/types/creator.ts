/**
 * Creator Type Definition
 * Matches the Firestore schema created by the profile generation pipeline
 */

export interface Creator {
  // Core identifiers (from pipeline)
  id: string;
  creatorId?: string; // Same as slug in most cases
  slug: string;
  version?: number;

  // Legacy top-level name (for backward compatibility)
  name: string;

  // Category & Classification
  category: CreatorCategory;
  tier: "verified" | "rising" | "new" | "community";
  gender: "male" | "female";

  // Location
  region: CreatorRegion;
  country: string;
  countryFlag: string;
  location?: string;

  // Content metadata
  languages: string[];
  topics: string[];
  affiliations?: string[];

  // Status flags
  verified: boolean;
  verificationLevel: "official" | "community" | "none";
  featured: boolean;
  trending: boolean;
  isHistorical: boolean;
  lifespan?: string;
  note?: string;

  // Legacy avatar field (for backward compatibility)
  avatar?: string;

  // Ownership (for claimed profiles)
  uid?: string; // Firebase user ID who owns this profile
  ownership?: {
    ownerId: string | null;
    ownershipStatus: "unclaimed" | "claimed" | "verified";
    claimedAt: string | null;
    claimMethod: string | null;
  };

  // Verification details
  verification?: {
    level: "official" | "community" | "none";
    verifiedAt: string | null;
    verifiedBy: string | null;
  };

  // Profile Object (New Schema)
  profile?: {
    name: string;
    displayName: string;
    title?: string;
    avatar: string | null;
    coverImage: string | null;
    shortBio: string;
    bio: string;
    birthDate?: string;
    birthPlace?: string;
    nationality?: string;
  };

  // Stats
  stats?: {
    followerCount: number;
    contentCount?: number;
    viewCount?: number;
    youtubeSubscribers?: number | string;
    podcastEpisodes?: number;
    booksPublished?: number;
  };

  // Social Links
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
    youtube?: YouTubeContent;
    podcast?: PodcastContent;
    books?: BookContent[];
    ebooks?: EbookContent[];
    audioBooks?: AudiobookContent[];
    courses?: CourseContent[];
  };

  // AI Generation Metadata
  aiGenerated?: {
    generatedAt: string;
    model?: string;
    confidence: "high" | "medium" | "low";
    confidenceScore?: number;
    notes?: string[];
    sources?: string[];
    imageSearchQuery?: string;
  };

  // Data Source (from pipeline)
  dataSource?: {
    aggregatedAt?: string;
    processingTimeMs?: number;
    sources?: string[];
    quality?: {
      score: number;
      level: "high" | "medium" | "low";
    };
    bioSource?: string;
    imageSource?: string;
  };

  // Meta (from pipeline)
  meta?: {
    activeFlagCount?: number;
    hasUnresolvedFlags?: boolean;
    lastValidated?: string;
  };

  // Timestamps
  createdAt?: Date | string;
  updatedAt?: Date | string;

  // Source identifier
  source?: "automated_pipeline" | "manual" | "claimed";
}

// ============================================================================
// SUB-TYPES
// ============================================================================

export type CreatorCategory =
  | "scholar"
  | "educator"
  | "speaker"
  | "reciter"
  | "author"
  | "activist"
  | "influencer"
  | "public_figure"
  | "youth_leader"
  | "podcaster";

export type CreatorRegion =
  | "americas"
  | "europe"
  | "middle_east"
  | "africa"
  | "south_asia"
  | "southeast_asia"
  | "east_africa"
  | "west_africa"
  | "north_africa";

export interface YouTubeContent {
  channelId?: string;
  channelUrl?: string;
  channelTitle?: string;
  channelName?: string;
  handle?: string;
  description?: string;
  subscriberCount?: string;
  subscriberCountFormatted?: string;
  videoCount?: string | number;
  viewCount?: string;
  thumbnailUrl?: string;
  recentVideos?: Array<{
    videoId: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
    viewCount?: number;
  }>;
}

export interface PodcastContent {
  source?: string;
  podcastId?: string;
  name?: string;
  url?: string;
  podcastUrl?: string;
  rssUrl?: string;
  platform?: string;
  episodeCount?: number;
  imageUrl?: string;
  description?: string;
  publisher?: string;
}

export interface BookContent {
  bookId?: string;
  title: string;
  authors?: string[];
  description?: string;
  thumbnail?: string;
  imageUrl?: string;
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  amazonUrl?: string;
  previewLink?: string;
  isbn?: string;
  year?: number;
  categories?: string[];
}

export interface EbookContent {
  title: string;
  url?: string;
  platform?: string; // Kindle, Apple Books, etc.
  year?: number;
}

export interface AudiobookContent {
  title: string;
  url?: string;
  platform?: string; // Audible, Spotify, etc.
  year?: number;
}

export interface CourseContent {
  title: string;
  platform: string;
  url?: string;
}
