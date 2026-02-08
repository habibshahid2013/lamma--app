/**
 * Social Links Discovery Service
 * Discovers social media profiles for creators using FREE sources:
 * 1. YouTube channel description — regex extraction of URLs
 * 2. Wikidata SPARQL — structured social media properties
 *
 * All methods are completely free with generous rate limits.
 */

export interface DiscoveredSocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  website?: string;
  threads?: string;
  patreon?: string;
  spotify?: string;
  source: string;
}

// ============================================================================
// YOUTUBE DESCRIPTION EXTRACTION
// ============================================================================

/**
 * Extract social media URLs from a YouTube channel description.
 * Creators commonly list their social profiles in their channel "About" section.
 */
export function extractSocialLinksFromText(text: string): Partial<DiscoveredSocialLinks> {
  if (!text) return {};

  const links: Partial<DiscoveredSocialLinks> = {};

  // Extract all URLs from the text
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const urls = text.match(urlRegex) || [];

  for (const url of urls) {
    const lower = url.toLowerCase();

    // Twitter/X
    if (!links.twitter && (lower.includes('twitter.com/') || lower.includes('x.com/'))) {
      const handle = url.match(/(?:twitter\.com|x\.com)\/([\w]+)/i);
      if (handle && !['home', 'search', 'explore', 'settings', 'i', 'intent'].includes(handle[1].toLowerCase())) {
        links.twitter = normalizeUrl(url, 'twitter');
      }
    }

    // Instagram
    if (!links.instagram && lower.includes('instagram.com/')) {
      const handle = url.match(/instagram\.com\/([\w.]+)/i);
      if (handle && !['p', 'reel', 'stories', 'explore', 'accounts'].includes(handle[1].toLowerCase())) {
        links.instagram = normalizeUrl(url, 'instagram');
      }
    }

    // Facebook
    if (!links.facebook && (lower.includes('facebook.com/') || lower.includes('fb.com/'))) {
      const handle = url.match(/(?:facebook|fb)\.com\/([\w.]+)/i);
      if (handle && !['sharer', 'share', 'dialog', 'login', 'watch'].includes(handle[1].toLowerCase())) {
        links.facebook = normalizeUrl(url, 'facebook');
      }
    }

    // TikTok
    if (!links.tiktok && lower.includes('tiktok.com/')) {
      const handle = url.match(/tiktok\.com\/@?([\w.]+)/i);
      if (handle) {
        links.tiktok = normalizeUrl(url, 'tiktok');
      }
    }

    // LinkedIn
    if (!links.linkedin && lower.includes('linkedin.com/')) {
      links.linkedin = normalizeUrl(url, 'linkedin');
    }

    // Threads
    if (!links.threads && lower.includes('threads.net/')) {
      links.threads = normalizeUrl(url, 'threads');
    }

    // Patreon
    if (!links.patreon && lower.includes('patreon.com/')) {
      links.patreon = normalizeUrl(url, 'patreon');
    }

    // Spotify (artist or show, not track)
    if (!links.spotify && lower.includes('spotify.com/') && (lower.includes('/artist/') || lower.includes('/show/'))) {
      links.spotify = url;
    }

    // Personal website — grab first non-social URL that looks like a real site
    if (!links.website && !isSocialUrl(lower) && !isKnownPlatformUrl(lower)) {
      links.website = url;
    }
  }

  // Also try to extract handles mentioned as text (e.g., "@username on Instagram")
  const handlePatterns = [
    { pattern: /@([\w.]+)\s+(?:on\s+)?(?:twitter|x\.com)/gi, field: 'twitter' as const },
    { pattern: /@([\w.]+)\s+(?:on\s+)?instagram/gi, field: 'instagram' as const },
    { pattern: /@([\w.]+)\s+(?:on\s+)?tiktok/gi, field: 'tiktok' as const },
    { pattern: /(?:twitter|x\.com)[:\s]+@?([\w.]+)/gi, field: 'twitter' as const },
    { pattern: /instagram[:\s]+@?([\w.]+)/gi, field: 'instagram' as const },
    { pattern: /tiktok[:\s]+@?([\w.]+)/gi, field: 'tiktok' as const },
  ];

  for (const { pattern, field } of handlePatterns) {
    if (links[field]) continue;
    const match = pattern.exec(text);
    if (match?.[1]) {
      const handle = match[1];
      if (field === 'twitter') links.twitter = `https://twitter.com/${handle}`;
      if (field === 'instagram') links.instagram = `https://instagram.com/${handle}`;
      if (field === 'tiktok') links.tiktok = `https://tiktok.com/@${handle}`;
    }
  }

  return links;
}

// ============================================================================
// WIKIDATA SPARQL — Structured Social Media Properties
// ============================================================================

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

/**
 * Query Wikidata for social media handles associated with a person.
 * Uses SPARQL to look up properties like P2002 (Twitter), P2003 (Instagram), etc.
 * Completely free, no auth required.
 */
export async function searchWikidataSocialLinks(name: string): Promise<Partial<DiscoveredSocialLinks>> {
  const cleanedName = cleanName(name);

  // SPARQL query: find person by label, retrieve social media properties
  const query = `
SELECT ?item ?itemLabel ?twitter ?instagram ?facebook ?tiktok ?linkedin ?website ?threads WHERE {
  ?item rdfs:label "${cleanedName}"@en .
  ?item wdt:P31 wd:Q5 .
  OPTIONAL { ?item wdt:P2002 ?twitter . }
  OPTIONAL { ?item wdt:P2003 ?instagram . }
  OPTIONAL { ?item wdt:P2013 ?facebook . }
  OPTIONAL { ?item wdt:P7085 ?tiktok . }
  OPTIONAL { ?item wdt:P6634 ?linkedin . }
  OPTIONAL { ?item wdt:P856 ?website . }
  OPTIONAL { ?item wdt:P11892 ?threads . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 5
`;

  try {
    const res = await fetch(`${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'LammaPlus/1.0 (https://lammaplus.com; contact@lammaplus.com)',
      },
    });

    if (!res.ok) return {};

    const data = await res.json();
    const bindings = data.results?.bindings || [];

    if (bindings.length === 0) return {};

    // Use the first matching result
    const result = bindings[0];
    const links: Partial<DiscoveredSocialLinks> = {};

    if (result.twitter?.value) {
      links.twitter = `https://twitter.com/${result.twitter.value}`;
    }
    if (result.instagram?.value) {
      links.instagram = `https://instagram.com/${result.instagram.value}`;
    }
    if (result.facebook?.value) {
      links.facebook = `https://facebook.com/${result.facebook.value}`;
    }
    if (result.tiktok?.value) {
      links.tiktok = `https://tiktok.com/@${result.tiktok.value}`;
    }
    if (result.linkedin?.value) {
      links.linkedin = `https://linkedin.com/in/${result.linkedin.value}`;
    }
    if (result.website?.value) {
      links.website = result.website.value;
    }
    if (result.threads?.value) {
      links.threads = `https://threads.net/@${result.threads.value}`;
    }

    return links;
  } catch (err) {
    console.error(`Wikidata SPARQL error for "${name}":`, err);
    return {};
  }
}

// ============================================================================
// COMBINED DISCOVERY
// ============================================================================

/**
 * Discover social media links for a creator using all free sources.
 * Priority: existing links > YouTube description > Wikidata
 */
export async function discoverSocialLinks(
  name: string,
  youtubeDescription?: string,
  existingLinks?: Record<string, string | undefined>,
): Promise<{ links: Partial<DiscoveredSocialLinks>; sources: string[] }> {
  const discovered: Partial<DiscoveredSocialLinks> = {};
  const sources: string[] = [];

  // Source 1: Extract from YouTube channel description
  if (youtubeDescription) {
    const ytLinks = extractSocialLinksFromText(youtubeDescription);
    mergeLinks(discovered, ytLinks, existingLinks);
    if (Object.keys(ytLinks).length > 0) sources.push('youtube_description');
  }

  // Source 2: Wikidata SPARQL
  try {
    const wdLinks = await searchWikidataSocialLinks(name);
    mergeLinks(discovered, wdLinks, existingLinks);
    if (Object.keys(wdLinks).length > 0) sources.push('wikidata');
  } catch {
    // Wikidata is best-effort
  }

  return { links: discovered, sources };
}

// ============================================================================
// HELPERS
// ============================================================================

function cleanName(name: string): string {
  return name
    .replace(/^(Sheikh|Shaykh|Shaykha|Ustadh|Ustadha|Ustaz|Ustadz|Maulana|Imam|Mufti|Qari|Dr\.|Br\.|Sr\.)\s+/i, '')
    .replace(/\s*\(.*?\)\s*/g, '')
    .trim();
}

function normalizeUrl(url: string, platform: string): string {
  // Strip tracking params and normalize
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/+$/, '');

    switch (platform) {
      case 'twitter': {
        const handle = path.split('/').filter(Boolean)[0];
        return handle ? `https://twitter.com/${handle}` : url;
      }
      case 'instagram': {
        const handle = path.split('/').filter(Boolean)[0];
        return handle ? `https://instagram.com/${handle}` : url;
      }
      case 'facebook': {
        const handle = path.split('/').filter(Boolean)[0];
        return handle ? `https://facebook.com/${handle}` : url;
      }
      case 'tiktok': {
        const handle = path.split('/').filter(Boolean)[0];
        return handle ? `https://tiktok.com/${handle.startsWith('@') ? handle : '@' + handle}` : url;
      }
      case 'linkedin':
        return `${u.origin}${path}`;
      case 'threads': {
        const handle = path.split('/').filter(Boolean)[0];
        return handle ? `https://threads.net/${handle.startsWith('@') ? handle : '@' + handle}` : url;
      }
      case 'patreon': {
        const handle = path.split('/').filter(Boolean)[0];
        return handle ? `https://patreon.com/${handle}` : url;
      }
      default:
        return `${u.origin}${path}`;
    }
  } catch {
    return url;
  }
}

function isSocialUrl(url: string): boolean {
  const socialDomains = [
    'twitter.com', 'x.com', 'instagram.com', 'facebook.com', 'fb.com',
    'tiktok.com', 'linkedin.com', 'threads.net', 'patreon.com',
    'spotify.com', 'youtube.com', 'youtu.be',
  ];
  return socialDomains.some(d => url.includes(d));
}

function isKnownPlatformUrl(url: string): boolean {
  const platforms = [
    'google.com', 'apple.com', 'amazon.com', 'soundcloud.com',
    'linktr.ee', 'bit.ly', 'goo.gl', 't.co', 'amzn.to',
  ];
  return platforms.some(d => url.includes(d));
}

/**
 * Merge newly discovered links into the result, skipping fields that already exist.
 */
function mergeLinks(
  target: Partial<DiscoveredSocialLinks>,
  newLinks: Partial<DiscoveredSocialLinks>,
  existing?: Record<string, string | undefined>,
) {
  const fields = ['twitter', 'instagram', 'facebook', 'tiktok', 'linkedin', 'website', 'threads', 'patreon', 'spotify'] as const;
  for (const field of fields) {
    if (!target[field] && !existing?.[field] && newLinks[field]) {
      target[field] = newLinks[field];
    }
  }
}
