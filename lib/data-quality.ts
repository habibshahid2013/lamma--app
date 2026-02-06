/**
 * Data Quality Audit System
 * Checks all creators for data completeness and validity issues
 */

import { Creator } from './types/creator';

// ============================================================================
// TYPES
// ============================================================================

export interface DataQualityIssue {
  field: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  autoFixable: boolean;
  fixAction?: string; // e.g., 'refetch_avatar', 'update_subscribers', 'remove_invalid_link'
}

export interface CreatorAuditResult {
  creatorId: string;
  name: string;
  score: number; // 0-100
  issues: DataQualityIssue[];
  summary: {
    critical: number;
    warning: number;
    info: number;
    autoFixable: number;
  };
}

export interface AuditReport {
  timestamp: string;
  totalCreators: number;
  averageScore: number;
  scoreDistribution: {
    excellent: number; // 80-100
    good: number;      // 60-79
    fair: number;      // 40-59
    poor: number;      // 0-39
  };
  topIssues: { issue: string; count: number }[];
  creators: CreatorAuditResult[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VALID_YOUTUBE_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/@[\w.-]+$/,
  /^https?:\/\/(www\.)?youtube\.com\/channel\/UC[\w-]+$/,
  /^https?:\/\/(www\.)?youtube\.com\/c\/[\w.-]+$/,
  /^https?:\/\/(www\.)?youtube\.com\/user\/[\w.-]+$/,
];

const VALID_SOCIAL_PATTERNS: Record<string, RegExp> = {
  youtube: /^https?:\/\/(www\.)?youtube\.com\/((@|channel\/|c\/|user\/)[\w.-]+)/,
  twitter: /^https?:\/\/(www\.)?(twitter|x)\.com\/[\w]+/,
  instagram: /^https?:\/\/(www\.)?instagram\.com\/[\w.]+/,
  facebook: /^https?:\/\/(www\.)?facebook\.com\/[\w.]+/,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[\w.]+/,
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[\w-]+/,
  spotify: /^https?:\/\/(open\.)?spotify\.com\/(show|artist)\/[\w]+/,
  website: /^https?:\/\/.+/,
};

const TEMPLATED_PODCAST_PATTERN = /^https?:\/\/feeds\.muslimcentral\.com\//;

// ============================================================================
// AUDIT LOGIC
// ============================================================================

/**
 * Run a full data quality audit on a single creator
 */
export function auditCreator(creator: Creator): CreatorAuditResult {
  const issues: DataQualityIssue[] = [];

  // --- CORE FIELDS ---
  if (!creator.name || creator.name.trim().length === 0) {
    issues.push({ field: 'name', severity: 'critical', message: 'Missing name', autoFixable: false });
  }

  if (!creator.slug || creator.slug.trim().length === 0) {
    issues.push({ field: 'slug', severity: 'critical', message: 'Missing slug', autoFixable: false });
  }

  if (!creator.category) {
    issues.push({ field: 'category', severity: 'critical', message: 'Missing category', autoFixable: false });
  }

  if (!creator.region) {
    issues.push({ field: 'region', severity: 'warning', message: 'Missing region', autoFixable: false });
  }

  if (!creator.country || creator.country.length !== 2) {
    issues.push({ field: 'country', severity: 'warning', message: 'Missing or invalid country code (should be ISO 3166-1 alpha-2)', autoFixable: false });
  }

  if (!creator.languages || creator.languages.length === 0) {
    issues.push({ field: 'languages', severity: 'warning', message: 'No languages listed', autoFixable: false });
  }

  if (!creator.topics || creator.topics.length === 0) {
    issues.push({ field: 'topics', severity: 'warning', message: 'No topics listed', autoFixable: false });
  }

  // --- PROFILE FIELDS ---
  if (!creator.profile?.bio && !creator.profile?.shortBio && !creator.note) {
    issues.push({ field: 'bio', severity: 'warning', message: 'No bio, shortBio, or note', autoFixable: false });
  }

  if (!creator.profile?.avatar) {
    issues.push({
      field: 'profile.avatar',
      severity: 'warning',
      message: 'No avatar image',
      autoFixable: true,
      fixAction: 'refetch_avatar',
    });
  } else if (creator.profile.avatar.includes('ui-avatars.com') || creator.profile.avatar.includes('placeholder')) {
    issues.push({
      field: 'profile.avatar',
      severity: 'info',
      message: 'Using placeholder avatar (not a real photo)',
      autoFixable: true,
      fixAction: 'refetch_avatar',
    });
  }

  // --- SOCIAL LINKS ---
  const socialLinks = creator.socialLinks || {};
  const hasSocialLinks = Object.values(socialLinks).some(v => v && v.trim().length > 0);

  if (!hasSocialLinks) {
    issues.push({ field: 'socialLinks', severity: 'warning', message: 'No social links at all', autoFixable: false });
  }

  // Check YouTube link
  if (!socialLinks.youtube && !creator.isHistorical) {
    issues.push({
      field: 'socialLinks.youtube',
      severity: 'warning',
      message: 'No YouTube link',
      autoFixable: false,
    });
  }

  if (socialLinks.youtube) {
    const isValid = VALID_YOUTUBE_PATTERNS.some(p => p.test(socialLinks.youtube!));
    if (!isValid) {
      issues.push({
        field: 'socialLinks.youtube',
        severity: 'critical',
        message: `Invalid YouTube URL: ${socialLinks.youtube}`,
        autoFixable: false,
      });
    }
  }

  // Validate all social links
  for (const [platform, url] of Object.entries(socialLinks)) {
    if (!url || url.trim().length === 0) continue;

    // Check for templated Muslim Central podcast links on non-scholars
    if (platform === 'podcast' && TEMPLATED_PODCAST_PATTERN.test(url)) {
      // Flag as info — these are auto-generated and may not actually exist
      issues.push({
        field: `socialLinks.podcast`,
        severity: 'info',
        message: `Templated Muslim Central podcast link (may not actually exist): ${url}`,
        autoFixable: false,
      });
    }

    // Validate URL format for known platforms
    const pattern = VALID_SOCIAL_PATTERNS[platform];
    if (pattern && !pattern.test(url) && platform !== 'podcast') {
      issues.push({
        field: `socialLinks.${platform}`,
        severity: 'warning',
        message: `Possibly invalid ${platform} URL: ${url}`,
        autoFixable: true,
        fixAction: 'remove_invalid_link',
      });
    }
  }

  // --- YOUTUBE CONTENT ---
  if (socialLinks.youtube && !creator.content?.youtube?.channelId) {
    issues.push({
      field: 'content.youtube.channelId',
      severity: 'info',
      message: 'Has YouTube link but no channelId resolved',
      autoFixable: true,
      fixAction: 'resolve_youtube_channel',
    });
  }

  if (creator.content?.youtube?.channelId && !creator.content?.youtube?.recentVideos?.length) {
    issues.push({
      field: 'content.youtube.recentVideos',
      severity: 'info',
      message: 'Has channelId but no recent videos fetched',
      autoFixable: true,
      fixAction: 'fetch_youtube_videos',
    });
  }

  if (creator.content?.youtube && !creator.content?.youtube?.subscriberCount) {
    issues.push({
      field: 'content.youtube.subscriberCount',
      severity: 'info',
      message: 'YouTube content exists but no subscriber count',
      autoFixable: true,
      fixAction: 'update_subscribers',
    });
  }

  // --- HISTORICAL CREATORS ---
  if (creator.isHistorical && !creator.lifespan) {
    issues.push({ field: 'lifespan', severity: 'warning', message: 'Historical figure without lifespan dates', autoFixable: false });
  }

  // --- SCORE CALCULATION ---
  const score = calculateScore(creator, issues);

  const summary = {
    critical: issues.filter(i => i.severity === 'critical').length,
    warning: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length,
    autoFixable: issues.filter(i => i.autoFixable).length,
  };

  return {
    creatorId: creator.id,
    name: creator.name,
    score,
    issues,
    summary,
  };
}

/**
 * Calculate a data quality score (0-100) based on field completeness and validity
 */
function calculateScore(creator: Creator, issues: DataQualityIssue[]): number {
  let score = 100;

  // Core fields (mandatory)
  if (!creator.name) score -= 20;
  if (!creator.slug) score -= 20;
  if (!creator.category) score -= 10;
  if (!creator.region) score -= 5;
  if (!creator.country) score -= 5;

  // Profile completeness
  if (!creator.profile?.bio && !creator.profile?.shortBio && !creator.note) score -= 10;
  if (!creator.profile?.avatar) score -= 10;
  else if (creator.profile.avatar.includes('ui-avatars.com')) score -= 5;

  // Social links
  const socialLinks = creator.socialLinks || {};
  const linkCount = Object.values(socialLinks).filter(v => v && v.trim().length > 0).length;
  if (linkCount === 0) score -= 15;
  else if (linkCount === 1) score -= 10;
  else if (linkCount <= 2) score -= 5;

  // YouTube presence (for non-historical)
  if (!creator.isHistorical && !socialLinks.youtube) score -= 5;

  // Content richness
  if (!creator.content?.youtube?.recentVideos?.length && !creator.isHistorical) score -= 5;

  // Deductions for critical issues
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  score -= criticalCount * 10;

  // Only templated podcast link = flag
  const onlyTemplatedPodcast = linkCount === 1 &&
    socialLinks.podcast &&
    TEMPLATED_PODCAST_PATTERN.test(socialLinks.podcast);
  if (onlyTemplatedPodcast) score -= 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Run full audit on all creators and generate a report
 */
export function auditAllCreators(creators: Creator[]): AuditReport {
  const results = creators.map(auditCreator);

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const averageScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

  // Score distribution
  const scoreDistribution = {
    excellent: results.filter(r => r.score >= 80).length,
    good: results.filter(r => r.score >= 60 && r.score < 80).length,
    fair: results.filter(r => r.score >= 40 && r.score < 60).length,
    poor: results.filter(r => r.score < 40).length,
  };

  // Top issues by frequency
  const issueCounts = new Map<string, number>();
  for (const result of results) {
    for (const issue of result.issues) {
      const key = issue.message;
      issueCounts.set(key, (issueCounts.get(key) || 0) + 1);
    }
  }
  const topIssues = Array.from(issueCounts.entries())
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Sort creators by score ascending (worst first)
  results.sort((a, b) => a.score - b.score);

  return {
    timestamp: new Date().toISOString(),
    totalCreators: creators.length,
    averageScore,
    scoreDistribution,
    topIssues,
    creators: results,
  };
}
