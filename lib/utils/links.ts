/**
 * Link Utilities for Lamma+
 * Handles URL normalization, validation, and platform detection
 */

// ============================================================================
// TYPES
// ============================================================================

export type LinkPlatform =
  | 'spotify'
  | 'youtube'
  | 'audible'
  | 'google_books'
  | 'amazon'
  | 'x'
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'twitch'
  | 'threads'
  | 'patreon'
  | 'podcast'
  | 'website'
  | 'other';

export interface CreatorLink {
  id: string;
  platform: LinkPlatform;
  url: string;
  label?: string;
  priority?: number;
  verified?: boolean;
  metadata?: {
    title?: string;
    image?: string;
    description?: string;
    embedHtml?: string;
  };
  updatedAt: number;
}

export interface PlatformInfo {
  platform: LinkPlatform;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  hoverColor: string;
}

// ============================================================================
// PLATFORM CONFIGURATIONS
// ============================================================================

export const PLATFORM_INFO: Record<LinkPlatform, PlatformInfo> = {
  youtube: {
    platform: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    hoverColor: 'hover:bg-red-500/30',
  },
  spotify: {
    platform: 'spotify',
    name: 'Spotify',
    icon: 'spotify',
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    hoverColor: 'hover:bg-green-500/30',
  },
  x: {
    platform: 'x',
    name: 'X',
    icon: 'x',
    color: 'text-white',
    bgColor: 'bg-slate-700',
    hoverColor: 'hover:bg-slate-600',
  },
  twitter: {
    platform: 'twitter',
    name: 'Twitter',
    icon: 'twitter',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
    hoverColor: 'hover:bg-sky-500/30',
  },
  instagram: {
    platform: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/20',
    hoverColor: 'hover:bg-pink-500/30',
  },
  facebook: {
    platform: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    hoverColor: 'hover:bg-blue-500/30',
  },
  tiktok: {
    platform: 'tiktok',
    name: 'TikTok',
    icon: 'tiktok',
    color: 'text-white',
    bgColor: 'bg-slate-700',
    hoverColor: 'hover:bg-slate-600',
  },
  linkedin: {
    platform: 'linkedin',
    name: 'LinkedIn',
    icon: 'linkedin',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/20',
    hoverColor: 'hover:bg-blue-600/30',
  },
  twitch: {
    platform: 'twitch',
    name: 'Twitch',
    icon: 'twitch',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    hoverColor: 'hover:bg-purple-500/30',
  },
  threads: {
    platform: 'threads',
    name: 'Threads',
    icon: 'threads',
    color: 'text-white',
    bgColor: 'bg-slate-700',
    hoverColor: 'hover:bg-slate-600',
  },
  patreon: {
    platform: 'patreon',
    name: 'Patreon',
    icon: 'patreon',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    hoverColor: 'hover:bg-orange-500/30',
  },
  audible: {
    platform: 'audible',
    name: 'Audible',
    icon: 'headphones',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20',
    hoverColor: 'hover:bg-orange-500/30',
  },
  google_books: {
    platform: 'google_books',
    name: 'Google Books',
    icon: 'book',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    hoverColor: 'hover:bg-blue-400/30',
  },
  amazon: {
    platform: 'amazon',
    name: 'Amazon',
    icon: 'shopping-cart',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/20',
    hoverColor: 'hover:bg-amber-500/30',
  },
  podcast: {
    platform: 'podcast',
    name: 'Podcast',
    icon: 'podcast',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/20',
    hoverColor: 'hover:bg-purple-500/30',
  },
  website: {
    platform: 'website',
    name: 'Website',
    icon: 'globe',
    color: 'text-teal',
    bgColor: 'bg-teal/20',
    hoverColor: 'hover:bg-teal/30',
  },
  other: {
    platform: 'other',
    name: 'Link',
    icon: 'link',
    color: 'text-slate-400',
    bgColor: 'bg-slate-700',
    hoverColor: 'hover:bg-slate-600',
  },
};

// ============================================================================
// HOSTNAME PATTERNS FOR PLATFORM DETECTION
// ============================================================================

const PLATFORM_PATTERNS: Array<{ pattern: RegExp; platform: LinkPlatform }> = [
  // YouTube
  { pattern: /^(www\.)?(youtube\.com|youtu\.be)/i, platform: 'youtube' },
  // Spotify
  { pattern: /^(open\.)?spotify\.com/i, platform: 'spotify' },
  // Twitter/X
  { pattern: /^(www\.)?(twitter\.com|x\.com)/i, platform: 'x' },
  // Instagram
  { pattern: /^(www\.)?instagram\.com/i, platform: 'instagram' },
  // Facebook
  { pattern: /^(www\.|m\.)?facebook\.com/i, platform: 'facebook' },
  // TikTok
  { pattern: /^(www\.)?(tiktok\.com|vm\.tiktok\.com)/i, platform: 'tiktok' },
  // LinkedIn
  { pattern: /^(www\.)?linkedin\.com/i, platform: 'linkedin' },
  // Twitch
  { pattern: /^(www\.)?twitch\.tv/i, platform: 'twitch' },
  // Threads
  { pattern: /^(www\.)?threads\.net/i, platform: 'threads' },
  // Patreon
  { pattern: /^(www\.)?patreon\.com/i, platform: 'patreon' },
  // Audible
  { pattern: /^(www\.)?audible\.(com|co\.[a-z]{2})/i, platform: 'audible' },
  // Google Books
  { pattern: /^books\.google\.[a-z.]+/i, platform: 'google_books' },
  // Amazon (various domains)
  { pattern: /^(www\.)?amazon\.(com|co\.[a-z]{2}|[a-z]{2})/i, platform: 'amazon' },
  // Podcast feeds (RSS)
  { pattern: /\.(rss|xml)$/i, platform: 'podcast' },
  { pattern: /feeds?\./i, platform: 'podcast' },
  { pattern: /muslimcentral\.com/i, platform: 'podcast' },
  { pattern: /anchor\.fm/i, platform: 'podcast' },
  { pattern: /podcasts\.apple\.com/i, platform: 'podcast' },
  { pattern: /podcasts\.google\.com/i, platform: 'podcast' },
];

// ============================================================================
// URL VALIDATION & NORMALIZATION
// ============================================================================

/**
 * Normalizes a URL by adding https:// if missing and trimming whitespace
 * Returns null if the URL is invalid or unsafe
 */
export function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;

  // Trim whitespace
  let url = raw.trim();
  if (!url) return null;

  // Block unsafe schemes
  const unsafeSchemes = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase();
  for (const scheme of unsafeSchemes) {
    if (lowerUrl.startsWith(scheme)) return null;
  }

  // Add https:// if no protocol
  if (!url.match(/^https?:\/\//i)) {
    // Check if it starts with a domain-like pattern
    if (url.match(/^[a-zA-Z0-9][-a-zA-Z0-9]*\./)) {
      url = 'https://' + url;
    } else {
      return null; // Doesn't look like a valid URL
    }
  }

  // Upgrade http to https
  if (url.toLowerCase().startsWith('http://')) {
    url = 'https://' + url.slice(7);
  }

  // Validate URL format
  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
}

/**
 * Sanitizes a URL for safe external linking
 * Returns the URL if safe, or null if potentially malicious
 */
export function sanitizeExternalUrl(url: string | null | undefined): string | null {
  const normalized = normalizeUrl(url);
  if (!normalized) return null;

  try {
    const parsed = new URL(normalized);

    // Only allow http/https protocols
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }

    // Block localhost and private IPs (basic check)
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local')
    ) {
      return null;
    }

    return normalized;
  } catch {
    return null;
  }
}

/**
 * Checks if a URL is valid for external linking
 */
export function isValidExternalUrl(url: string | null | undefined): boolean {
  return sanitizeExternalUrl(url) !== null;
}

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

/**
 * Detects the platform from a URL
 */
export function detectPlatform(url: string | null | undefined): LinkPlatform {
  const normalized = normalizeUrl(url);
  if (!normalized) return 'other';

  try {
    const parsed = new URL(normalized);
    const hostname = parsed.hostname.toLowerCase();

    for (const { pattern, platform } of PLATFORM_PATTERNS) {
      if (pattern.test(hostname) || pattern.test(parsed.pathname)) {
        return platform;
      }
    }

    return 'website';
  } catch {
    return 'other';
  }
}

/**
 * Gets platform info for a given platform or URL
 */
export function getPlatformInfo(platformOrUrl: LinkPlatform | string): PlatformInfo {
  // Check if it's a known platform
  if (platformOrUrl in PLATFORM_INFO) {
    return PLATFORM_INFO[platformOrUrl as LinkPlatform];
  }

  // Try to detect from URL
  const platform = detectPlatform(platformOrUrl);
  return PLATFORM_INFO[platform];
}

// ============================================================================
// LINK CONVERSION UTILITIES
// ============================================================================

/**
 * Converts legacy socialLinks object to CreatorLink array
 */
export function convertLegacySocialLinks(
  socialLinks: Record<string, string | null | undefined> | null | undefined
): CreatorLink[] {
  if (!socialLinks) return [];

  const links: CreatorLink[] = [];
  let priority = 0;

  // Define the order of platforms
  const platformOrder: Array<{ key: string; platform: LinkPlatform }> = [
    { key: 'website', platform: 'website' },
    { key: 'youtube', platform: 'youtube' },
    { key: 'spotify', platform: 'spotify' },
    { key: 'twitter', platform: 'x' },
    { key: 'instagram', platform: 'instagram' },
    { key: 'facebook', platform: 'facebook' },
    { key: 'tiktok', platform: 'tiktok' },
    { key: 'linkedin', platform: 'linkedin' },
    { key: 'twitch', platform: 'twitch' },
    { key: 'threads', platform: 'threads' },
    { key: 'patreon', platform: 'patreon' },
    { key: 'podcast', platform: 'podcast' },
  ];

  for (const { key, platform } of platformOrder) {
    const url = socialLinks[key];
    const normalizedUrl = normalizeUrl(url);

    if (normalizedUrl) {
      links.push({
        id: `legacy-${key}`,
        platform,
        url: normalizedUrl,
        label: PLATFORM_INFO[platform].name,
        priority: priority++,
        verified: false,
        updatedAt: Date.now(),
      });
    }
  }

  return links;
}

/**
 * Converts CreatorLink array back to legacy socialLinks object
 */
export function convertToLegacySocialLinks(
  links: CreatorLink[]
): Record<string, string> {
  const result: Record<string, string> = {};

  // Map platform back to legacy key names
  const platformToKey: Record<LinkPlatform, string> = {
    website: 'website',
    youtube: 'youtube',
    spotify: 'spotify',
    x: 'twitter',
    twitter: 'twitter',
    instagram: 'instagram',
    facebook: 'facebook',
    tiktok: 'tiktok',
    linkedin: 'linkedin',
    twitch: 'twitch',
    threads: 'threads',
    patreon: 'patreon',
    podcast: 'podcast',
    audible: 'audible',
    google_books: 'google_books',
    amazon: 'amazon',
    other: 'other',
  };

  for (const link of links) {
    const key = platformToKey[link.platform] || link.platform;
    if (link.url && !result[key]) {
      result[key] = link.url;
    }
  }

  return result;
}

// ============================================================================
// UUID GENERATION
// ============================================================================

/**
 * Generates a simple UUID for link IDs
 */
export function generateLinkId(): string {
  return 'link-' + Math.random().toString(36).substring(2, 15);
}
