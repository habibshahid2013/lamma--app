// app/creator/[slug]/CreatorProfileClient.tsx
// Client Component — Full creator profile with gold gradient design
// Displays: Bio, YouTube, Podcasts, Books, eBooks, Audiobooks, Courses, Social Links, Topics

'use client';

import { useState } from 'react';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorBySlug } from '@/hooks/useCreators';
import { useFollow } from '@/hooks/useFollow';
import CreatorLinks from '@/components/ui/CreatorLinks';
import ExternalLink, { ExternalLinkButton } from '@/components/ui/ExternalLink';
import LammaLogo from '@/components/LammaLogo';
import ActionGateModal from '@/components/ActionGateModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SkeletonProfilePage } from '@/components/ui/SkeletonCard';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCreatorSchema, generateBreadcrumbSchema, siteConfig } from '@/lib/seo';
import type { Creator } from '@/lib/types/creator';
import {
  Share2,
  UserPlus,
  UserCheck,
  Unlock,
  Youtube,
  Headphones,
  Book,
  Sparkles,
  TrendingUp,
  Award,
  Star,
  Calendar,
  MapPin,
  Globe,
  BookOpen,
  GraduationCap,
  Smartphone,
  Clock,
  Users,
  Building2,
  Copy,
  Check as CheckIcon,
  Twitter,
  Facebook,
  Mail,
  ChevronRight,
  Shield,
  BadgeCheck,
  Heart,
  Eye,
  Play,
  Bookmark,
  Crown,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'about' | 'videos' | 'podcasts' | 'books' | 'ebooks' | 'audiobooks' | 'courses';

type CreatorTier = Creator['tier'];

// ============================================================================
// BADGE COMPONENTS
// ============================================================================

function TierBadge({ tier }: { tier: CreatorTier }) {
  const config: Record<CreatorTier, { icon: typeof Award; label: string; className: string }> = {
    verified: {
      icon: Award,
      label: 'Verified',
      className: 'bg-gold/20 text-gold border-gold/30',
    },
    rising: {
      icon: TrendingUp,
      label: 'Rising Star',
      className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    new: {
      icon: Sparkles,
      label: 'New Creator',
      className: 'bg-teal/20 text-teal border-teal/30',
    },
    community: {
      icon: Users,
      label: 'Community',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
  };

  const { icon: Icon, label, className } = config[tier];

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
      <Star className="w-3 h-3 fill-current" />
      Featured
    </span>
  );
}

function TrendingBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
      <TrendingUp className="w-3 h-3" />
      Trending
    </span>
  );
}

function HistoricalBadge({ lifespan }: { lifespan?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600/50 text-slate-300 border border-slate-500/30">
      <Clock className="w-3 h-3" />
      {lifespan || 'Historical Figure'}
    </span>
  );
}

function VerificationLevelBadge({ level }: { level: 'official' | 'community' | 'none' }) {
  if (level === 'none') return null;
  if (level === 'official') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
        <Award className="w-3 h-3" />
        Official
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600/50 text-slate-400 border border-slate-500/30">
      Community Verified
    </span>
  );
}

// ============================================================================
// SHARE MODAL
// ============================================================================

function ShareModal({
  isOpen,
  onClose,
  creatorName,
  creatorSlug,
}: {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  creatorSlug: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/creator/${creatorSlug}` : '';
  const shareText = `Check out ${creatorName} on Lamma+`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-slate-500/20 text-slate-300 hover:bg-slate-500/30',
      href: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Share Profile</h3>

        {/* Copy Link */}
        <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl mb-4">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-transparent text-sm text-slate-300 outline-none"
          />
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="flex gap-3 justify-center">
          {shareOptions.map((option) => (
            <a
              key={option.name}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn('p-3 rounded-xl transition', option.color)}
              title={`Share on ${option.name}`}
            >
              <option.icon className="w-5 h-5" />
            </a>
          ))}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-slate-400 hover:text-white transition text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// QUICK INFO CARD (Sidebar-style key info)
// ============================================================================

function QuickInfoCard({ creator }: { creator: Creator }) {
  const { profile, stats, affiliations, languages, category, tier, verified, dataSource } = creator;

  const infoItems = [
    { label: 'Category', value: category?.replace('_', ' '), icon: BadgeCheck },
    { label: 'Languages', value: languages?.join(', '), icon: Globe },
    { label: 'Tier', value: tier, icon: Shield },
    { label: 'Followers', value: stats?.followerCount?.toLocaleString(), icon: Users },
    { label: 'Content', value: stats?.contentCount?.toLocaleString(), icon: Play },
  ].filter(item => item.value);

  return (
    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Quick Info</h3>
      <div className="space-y-3">
        {infoItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-400 text-sm">
              <item.icon className="w-4 h-4" />
              {item.label}
            </span>
            <span className="text-white text-sm font-medium capitalize">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Data Quality Score */}
      {dataSource?.quality && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">Profile Completeness</span>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              dataSource.quality.level === 'high' ? 'bg-green-500/20 text-green-400' :
              dataSource.quality.level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            )}>
              {dataSource.quality.score}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                dataSource.quality.level === 'high' ? 'bg-green-500' :
                dataSource.quality.level === 'medium' ? 'bg-yellow-500' :
                'bg-red-500'
              )}
              style={{ width: `${dataSource.quality.score}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// AFFILIATIONS/CREDENTIALS SECTION
// ============================================================================

function AffiliationsSection({ affiliations, profile }: { affiliations?: string[]; profile?: Creator['profile'] }) {
  if (!affiliations?.length && !profile?.title) return null;

  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
        <Building2 className="w-4 h-4 text-gold" />
        Credentials & Affiliations
      </h3>
      <div className="space-y-2">
        {profile?.title && (
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="p-2 bg-gold/20 rounded-lg">
              <GraduationCap className="w-4 h-4 text-gold" />
            </div>
            <span className="text-white font-medium">{profile.title}</span>
          </div>
        )}
        {affiliations?.map((affiliation, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
          >
            <div className="p-2 bg-teal/20 rounded-lg">
              <Building2 className="w-4 h-4 text-teal" />
            </div>
            <span className="text-white">{affiliation}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// ENGAGEMENT STATS BAR
// ============================================================================

function EngagementStatsBar({ stats, youtubeData }: { stats?: Creator['stats']; youtubeData?: NonNullable<Creator['content']>['youtube'] }) {
  const items = [
    {
      label: 'Followers',
      value: stats?.followerCount,
      icon: Heart,
      color: 'text-pink-400',
    },
    {
      label: 'Views',
      value: youtubeData?.viewCount ? parseInt(youtubeData.viewCount.replace(/,/g, '')) : stats?.viewCount,
      icon: Eye,
      color: 'text-blue-400',
      format: 'compact',
    },
    {
      label: 'Videos',
      value: youtubeData?.videoCount,
      icon: Play,
      color: 'text-red-400',
    },
    {
      label: 'Books',
      value: stats?.booksPublished,
      icon: Book,
      color: 'text-amber-400',
    },
  ].filter(item => {
    if (!item.value) return false;
    const numValue = typeof item.value === 'string' ? parseInt(item.value.replace(/,/g, '')) : item.value;
    return numValue > 0;
  });

  if (items.length === 0) return null;

  const formatValue = (value: number | string | undefined, format?: string) => {
    const num = typeof value === 'string' ? parseInt(value.replace(/,/g, '')) : value;
    if (!num) return '0';
    if (format === 'compact') {
      if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
      if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
      if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-slate-800/60 rounded-xl p-4 text-center border border-slate-700/50 hover:border-slate-600 transition"
        >
          <item.icon className={cn('w-5 h-5 mx-auto mb-2', item.color)} />
          <div className="text-xl font-bold text-white">{formatValue(item.value, item.format)}</div>
          <div className="text-xs text-slate-400">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// PREMIUM CTA BANNER
// ============================================================================

function PremiumCTABanner() {
  return (
    <div className="bg-gradient-to-r from-gold/20 via-teal/20 to-gold/20 rounded-xl p-6 border border-gold/30 my-8">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="p-3 bg-gold/20 rounded-full">
          <Crown className="w-8 h-8 text-gold" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white mb-1">Premium Coming Soon</h3>
          <p className="text-slate-400 text-sm">
            Join the waitlist for early access to premium features and exclusive scholar content.
          </p>
        </div>
        <Link
          href="/premium"
          className="px-6 py-3 bg-gradient-to-r from-gold to-gold-dark text-gray-dark font-semibold rounded-full hover:shadow-lg hover:shadow-gold/20 transition whitespace-nowrap"
        >
          Join Waitlist
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// TAB BUTTON
// ============================================================================

function TabButton({
  children,
  active,
  onClick,
  tabId,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tabId: string;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        'px-4 py-3 font-medium transition relative whitespace-nowrap rounded-none snap-start',
        active
          ? 'text-gold'
          : 'text-slate-400 hover:text-white hover:bg-transparent'
      )}
    >
      {children}
      {active && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </Button>
  );
}

// ============================================================================
// VIDEO CARD
// ============================================================================

function VideoCard({ video }: { video: { videoId: string; title: string; thumbnail: string; publishedAt: string; viewCount?: number; duration?: string } }) {
  const formattedViews = video.viewCount
    ? video.viewCount >= 1_000_000
      ? `${(video.viewCount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`
      : video.viewCount >= 1_000
        ? `${(video.viewCount / 1_000).toFixed(1).replace(/\.0$/, '')}K views`
        : `${video.viewCount} views`
    : null;

  return (
    <ExternalLink
      href={`https://www.youtube.com/watch?v=${video.videoId}`}
      className="group"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 mb-3">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {video.duration}
          </span>
        )}
      </div>
      <h3 className="font-medium text-white line-clamp-2 group-hover:text-gold transition text-sm">
        {video.title}
      </h3>
      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
        {formattedViews && <span>{formattedViews}</span>}
        {formattedViews && video.publishedAt && <span>·</span>}
        {video.publishedAt && (
          <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
        )}
      </div>
    </ExternalLink>
  );
}

// ============================================================================
// STRUCTURED DATA (JSON-LD for SEO)
// ============================================================================

function CreatorJsonLd({ creator }: { creator: Creator }) {
  const schema = generateCreatorSchema({
    name: creator.profile?.displayName || creator.name,
    slug: creator.slug,
    bio: creator.profile?.shortBio || creator.profile?.bio,
    avatar: creator.profile?.avatar || creator.avatar || undefined,
    category: creator.category,
    socialLinks: creator.socialLinks as Record<string, string | undefined> | undefined,
  });

  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Creators', url: `${siteConfig.url}/explore` },
    { name: creator.profile?.displayName || creator.name, url: `${siteConfig.url}/creator/${creator.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreatorProfileClient({ slug }: { slug: string }) {
  const { user } = useAuth();
  const { creator, loading } = useCreatorBySlug(slug);
  const { isFollowing, toggleFollow, loading: followLoading, followingCount, followLimit } = useFollow();

  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [imageError, setImageError] = useState(false);
  const [useYoutubeFallback, setUseYoutubeFallback] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);

  const handleFollow = async () => {
    if (!user) {
      setShowAuthGate(true);
      return;
    }
    try {
      setFollowError(null);
      await toggleFollow(creator!.id);
    } catch (err: any) {
      setFollowError(err.message);
    }
  };

  // ---- Loading State ----
  if (loading) {
    return <SkeletonProfilePage />;
  }

  // ---- Not Found State ----
  if (!creator) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Creator Not Found</h1>
          <p className="text-slate-400 mb-4">The creator you are looking for does not exist.</p>
          <Link href="/" className="text-gold hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  // ---- Destructure Creator Data ----
  const {
    content,
    socialLinks,
    topics,
    category,
    region,
    country,
    countryFlag,
    languages,
    stats,
    tier,
    featured,
    trending,
    isHistorical,
    lifespan,
    verified,
    verificationLevel,
    location,
    aiGenerated,
    affiliations,
    dataSource,
  } = creator;

  // Profile with safe fallbacks
  const profile = creator.profile || {
    name: creator.name || 'Unknown',
    displayName: creator.name || 'Unknown',
    avatar: creator.avatar || null,
    coverImage: null,
    shortBio: creator.note || '',
    bio: '',
    birthDate: undefined,
    birthPlace: undefined,
    nationality: undefined,
  };

  const formattedStats = stats || {
    followerCount: 0,
    contentCount: 0,
    viewCount: 0,
  };

  // Avatar logic — try profile avatar, fallback to YouTube thumbnail
  const youtubeAvatar = content?.youtube?.thumbnailUrl;
  const avatarUrl = useYoutubeFallback ? youtubeAvatar : (profile.avatar || youtubeAvatar || null);

  // Content section references
  const youtubeData = content?.youtube;
  const podcastData = content?.podcast;
  const booksData = content?.books;
  const ebooksData = content?.ebooks;
  const audiobooksData = content?.audioBooks;
  const coursesData = content?.courses;

  // Content availability flags
  const hasYouTube = !!youtubeData;
  const hasPodcast = !!podcastData;
  const hasBooks = booksData && booksData.length > 0;
  const hasEbooks = ebooksData && ebooksData.length > 0;
  const hasAudiobooks = audiobooksData && audiobooksData.length > 0;
  const hasCourses = coursesData && coursesData.length > 0;

  return (
    <div className={cn('min-h-screen bg-slate-900', isHistorical && 'sepia-[.05]')}>
      {/* JSON-LD Structured Data */}
      <CreatorJsonLd creator={creator} />

      {/* ================================================================ */}
      {/* HEADER NAV */}
      {/* ================================================================ */}
      <header className="bg-navy-card border-b border-navy-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <LammaLogo variant="dark" size="sm" />
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <Link href="/profile" className="text-white/70 hover:text-white transition">
                  Profile
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-white/70 hover:text-white transition">Sign In</Link>
                  <Link href="/auth/signup" className="px-4 py-2 bg-gold text-gray-dark rounded-full font-medium hover:bg-gold-dark transition">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* COVER & PROFILE HEADER (Teal-to-Gold Gradient) */}
      {/* ================================================================ */}
      <div className="relative">
        {/* Cover Gradient */}
        <div className={cn(
          'h-36 sm:h-48 md:h-64',
          isHistorical
            ? 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700'
            : 'bg-gradient-to-r from-teal-deep via-teal to-gold/70'
        )}>
          {profile.coverImage && (
            <img src={profile.coverImage} alt="" className="w-full h-full object-cover opacity-50" />
          )}
        </div>

        {/* Profile Info */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative -mt-14 sm:-mt-20 md:-mt-24 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className={cn(
                  'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-slate-900 bg-slate-800',
                  isHistorical && 'sepia-[.3]'
                )}>
                  {avatarUrl && !imageError ? (
                    <img
                      src={avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      onError={() => {
                        if (!useYoutubeFallback && youtubeAvatar) {
                          setUseYoutubeFallback(true);
                          setImageError(false);
                        } else {
                          setImageError(true);
                        }
                      }}
                    />
                  ) : (
                    <div className={cn(
                      'w-full h-full flex items-center justify-center',
                      isHistorical
                        ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                        : 'bg-gradient-to-br from-gold to-teal'
                    )}>
                      <span className="text-5xl font-bold text-slate-900">
                        {profile.name?.[0] || '?'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Verified checkmark on avatar corner */}
                {verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gold rounded-full flex items-center justify-center ring-2 ring-slate-900">
                    <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Name, Badges, Meta */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  {profile.displayName || profile.name}
                </h1>

                {/* Badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                  {tier && <TierBadge tier={tier} />}
                  {featured && <FeaturedBadge />}
                  {trending && <TrendingBadge />}
                  {isHistorical && <HistoricalBadge lifespan={lifespan} />}
                  {verificationLevel && verificationLevel !== 'none' && (
                    <VerificationLevelBadge level={verificationLevel} />
                  )}
                </div>

                {/* Category, Location, Languages */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-400">
                  {category && (
                    <Link
                      href={`/search?category=${category}`}
                      className="px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium hover:bg-gold/30 transition capitalize"
                    >
                      {category.replace('_', ' ')}
                    </Link>
                  )}

                  {country && (
                    <Link
                      href={`/search?region=${region}`}
                      className="flex items-center gap-1 hover:text-gold transition"
                    >
                      <span>{countryFlag}</span>
                      <span>{country}</span>
                    </Link>
                  )}

                  {location && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3 h-3" />
                      {location}
                    </span>
                  )}

                  {languages && languages.length > 0 && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Globe className="w-3 h-3" />
                      {languages.join(', ')}
                    </span>
                  )}
                </div>

                {/* Content Stats Row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  {hasYouTube && youtubeData?.subscriberCount && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 rounded-full">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-400">
                        {youtubeData.subscriberCount} subscribers
                      </span>
                    </div>
                  )}

                  {hasPodcast && podcastData?.episodeCount && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 rounded-full">
                      <Headphones className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-400">
                        {podcastData.episodeCount} episodes
                      </span>
                    </div>
                  )}

                  {hasBooks && booksData && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 rounded-full">
                      <Book className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-400">
                        {booksData.length} books
                      </span>
                    </div>
                  )}

                  {hasCourses && coursesData && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 rounded-full">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-400">
                        {coursesData.length} courses
                      </span>
                    </div>
                  )}

                  {formattedStats.followerCount > 0 && (
                    <span className="text-slate-400 text-sm">
                      {formattedStats.followerCount.toLocaleString()} followers
                    </span>
                  )}

                  {formattedStats.viewCount && formattedStats.viewCount > 0 && (
                    <span className="text-slate-400 text-sm">
                      {(formattedStats.viewCount / 1000000).toFixed(1)}M total views
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 md:mt-0">
                <Button
                  onClick={handleFollow}
                  disabled={followLoading}
                  variant={isFollowing(creator.id) ? 'secondary' : 'default'}
                  className={cn(
                    'rounded-full font-semibold',
                    isFollowing(creator.id)
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-gold text-gray-dark hover:bg-gold-dark'
                  )}
                >
                  {isFollowing(creator.id) ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-1" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      {followLoading ? 'Loading...' : 'Follow'}
                    </>
                  )}
                </Button>
                {followError && (
                  <p className="text-red-400 text-xs mt-1">{followError}</p>
                )}

                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="w-5 h-5" />
                </Button>

                {!creator.uid && (
                  <Button
                    variant="secondary"
                    className="rounded-full bg-slate-700 text-gold hover:bg-slate-600"
                    asChild
                  >
                    <Link href={`/claim/${creator.slug}`}>
                      <Unlock className="w-4 h-4 mr-1" />
                      Claim Profile
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SOCIAL LINKS BAR */}
      {/* ================================================================ */}
      {socialLinks && Object.values(socialLinks).some(v => v) && (
        <div className="bg-navy-card/50 border-y border-navy-border">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <CreatorLinks
              socialLinks={socialLinks}
              maxVisible={12}
              showLabels={true}
              size="sm"
              variant="pill"
              className="justify-center md:justify-start"
            />
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TOPICS */}
      {/* ================================================================ */}
      {topics && topics.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => (
              <Link
                key={topic}
                href={`/search?topic=${encodeURIComponent(topic)}`}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-full text-sm hover:bg-slate-700 hover:text-gold transition border border-slate-700"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB NAVIGATION */}
      {/* ================================================================ */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="flex gap-1 border-b border-slate-700 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
          <TabButton tabId="about" active={activeTab === 'about'} onClick={() => setActiveTab('about')}>
            About
          </TabButton>
          {hasYouTube && (
            <TabButton tabId="videos" active={activeTab === 'videos'} onClick={() => setActiveTab('videos')}>
              Videos
            </TabButton>
          )}
          {hasPodcast && (
            <TabButton tabId="podcasts" active={activeTab === 'podcasts'} onClick={() => setActiveTab('podcasts')}>
              Podcast
            </TabButton>
          )}
          {hasBooks && (
            <TabButton tabId="books" active={activeTab === 'books'} onClick={() => setActiveTab('books')}>
              Books ({booksData!.length})
            </TabButton>
          )}
          {hasEbooks && (
            <TabButton tabId="ebooks" active={activeTab === 'ebooks'} onClick={() => setActiveTab('ebooks')}>
              eBooks ({ebooksData!.length})
            </TabButton>
          )}
          {hasAudiobooks && (
            <TabButton tabId="audiobooks" active={activeTab === 'audiobooks'} onClick={() => setActiveTab('audiobooks')}>
              Audiobooks ({audiobooksData!.length})
            </TabButton>
          )}
          {hasCourses && (
            <TabButton tabId="courses" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}>
              Courses ({coursesData!.length})
            </TabButton>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* TAB CONTENT */}
      {/* ================================================================ */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >

        {/* ---- ABOUT TAB ---- */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Engagement Stats */}
              <EngagementStatsBar stats={stats} youtubeData={youtubeData} />

              {/* Biography */}
              <section className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gold" />
                  About
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line text-base">
                    {profile.bio || profile.shortBio || 'No biography available.'}
                  </p>
                </div>

                {/* Birth/Location Info */}
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
                  {profile.birthDate && (
                    <span className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                      <Calendar className="w-4 h-4 text-teal" />
                      Born {new Date(profile.birthDate).toLocaleDateString()}
                    </span>
                  )}
                  {profile.birthPlace && (
                    <span className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                      <MapPin className="w-4 h-4 text-teal" />
                      {profile.birthPlace}
                    </span>
                  )}
                  {profile.nationality && (
                    <span className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
                      <Globe className="w-4 h-4 text-teal" />
                      {profile.nationality}
                    </span>
                  )}
                </div>

                {/* AI-generated disclaimer */}
                {aiGenerated && (
                  <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-gold" />
                      <span>
                        Profile enhanced with AI on {new Date(aiGenerated.generatedAt).toLocaleDateString()}
                        {aiGenerated.confidence && (
                          <span className={cn(
                            'ml-2 px-2 py-0.5 rounded-full',
                            aiGenerated.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                            aiGenerated.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-orange-500/20 text-orange-400'
                          )}>
                            {aiGenerated.confidence} confidence
                          </span>
                        )}
                      </span>
                    </p>
                  </div>
                )}
              </section>

              {/* Affiliations & Credentials */}
              <AffiliationsSection affiliations={affiliations} profile={profile} />

              {/* YouTube Channel Summary (on About tab) */}
              {hasYouTube && youtubeData && (
                <section>
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    YouTube Channel
                  </h2>
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-red-500/30 transition">
                    <div className="flex items-center gap-4 mb-4">
                      {youtubeData.thumbnailUrl && (
                        <img
                          src={youtubeData.thumbnailUrl}
                          alt={youtubeData.channelTitle || 'YouTube channel'}
                          className="w-16 h-16 rounded-full ring-2 ring-red-500/30"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{youtubeData.channelTitle || youtubeData.channelName}</h3>
                        {youtubeData.description && (
                          <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                            {youtubeData.description}
                          </p>
                        )}
                        <ExternalLink
                          href={youtubeData.channelUrl}
                          className="text-red-400 text-sm hover:underline inline-flex items-center gap-1 mt-1"
                          showIcon
                        >
                          View on YouTube
                        </ExternalLink>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-xl font-bold text-white">
                          {youtubeData.subscriberCountFormatted || youtubeData.subscriberCount || '-'}
                        </div>
                        <div className="text-xs text-slate-400">Subscribers</div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-xl font-bold text-white">
                          {typeof youtubeData.videoCount === 'number'
                            ? youtubeData.videoCount.toLocaleString()
                            : youtubeData.videoCount || '-'}
                        </div>
                        <div className="text-xs text-slate-400">Videos</div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-xl font-bold text-white">
                          {youtubeData.viewCount
                            ? `${(Number(youtubeData.viewCount) / 1000000).toFixed(1)}M`
                            : '-'}
                        </div>
                        <div className="text-xs text-slate-400">Total Views</div>
                      </div>
                    </div>

                    {/* Quick action to view videos tab */}
                    <button
                      onClick={() => setActiveTab('videos')}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition text-sm font-medium"
                    >
                      <Play className="w-4 h-4" />
                      Watch Latest Videos
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </section>
              )}

              {/* Premium CTA for non-premium users */}
              {!user && <PremiumCTABanner />}
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              <QuickInfoCard creator={creator} />

              {/* Follow CTA Card */}
              {!isFollowing(creator.id) && (
                <div className="bg-gradient-to-br from-teal/20 to-gold/20 rounded-xl p-5 border border-teal/30">
                  <h4 className="font-semibold text-white mb-2">Stay Updated</h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Follow {profile.displayName || profile.name} to get notified about new content.
                  </p>
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className="w-full bg-teal hover:bg-teal-deep text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                </div>
              )}

              {/* Bookmark Card */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Bookmark className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">Save for Later</h4>
                    <p className="text-xs text-slate-400">Bookmark this profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---- VIDEOS TAB ---- */}
        {activeTab === 'videos' && hasYouTube && youtubeData && (
          <div className="space-y-8">

            {/* Channel Stats Bar */}
            <section className="bg-slate-800/60 rounded-xl p-5 border border-slate-700">
              <div className="flex items-center gap-4 mb-4">
                {youtubeData.thumbnailUrl && (
                  <img
                    src={youtubeData.thumbnailUrl}
                    alt={youtubeData.channelTitle || 'YouTube channel'}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{youtubeData.channelTitle || youtubeData.channelName}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mt-0.5">
                    {youtubeData.subscriberCount && <span>{youtubeData.subscriberCount} subscribers</span>}
                    {youtubeData.videoCount && <span>{typeof youtubeData.videoCount === 'number' ? youtubeData.videoCount.toLocaleString() : youtubeData.videoCount} videos</span>}
                    {youtubeData.viewCount && <span>{youtubeData.viewCount} total views</span>}
                  </div>
                </div>
                <ExternalLink
                  href={youtubeData.channelUrl}
                  className="flex-shrink-0 bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-red-500 transition inline-flex items-center gap-1.5"
                >
                  <Youtube className="w-4 h-4" />
                  <span className="hidden sm:inline">Subscribe</span>
                </ExternalLink>
              </div>
            </section>

            {/* Content Categories (from enrichment) */}
            {youtubeData.derivedCategories && youtubeData.derivedCategories.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Content Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {youtubeData.derivedCategories.map(category => (
                    <span
                      key={category}
                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-teal/10 text-teal border border-teal/20"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Videos */}
            {youtubeData.recentVideos && youtubeData.recentVideos.length > 0 ? (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Videos</h3>
                  <ExternalLink
                    href={youtubeData.channelUrl}
                    className="text-gold hover:underline text-sm"
                    showIcon
                  >
                    View all
                  </ExternalLink>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {youtubeData.recentVideos.map(video => (
                    <VideoCard key={video.videoId} video={video} />
                  ))}
                </div>
              </section>
            ) : (
              <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                <p className="text-slate-400 mb-4">Videos are loaded from YouTube</p>
                <ExternalLinkButton
                  href={youtubeData.channelUrl}
                  className="bg-red-600 text-white hover:bg-red-500 rounded-full"
                >
                  <Youtube className="w-5 h-5 mr-2" />
                  Watch on YouTube
                </ExternalLinkButton>
              </div>
            )}

            {/* Popular Videos (All Time) */}
            {youtubeData.popularVideos && youtubeData.popularVideos.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Popular Videos</h3>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">All Time</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {youtubeData.popularVideos.map(video => (
                    <VideoCard key={video.videoId} video={video} />
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            {youtubeData.playlists && youtubeData.playlists.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4">Playlists</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {youtubeData.playlists.map(playlist => (
                    <ExternalLink
                      key={playlist.playlistId}
                      href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`}
                      className="group bg-slate-800/60 rounded-xl overflow-hidden border border-slate-700 hover:border-gold/40 transition"
                    >
                      <div className="relative aspect-video bg-slate-700">
                        {playlist.thumbnail && (
                          <img
                            src={playlist.thumbnail}
                            alt={playlist.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        )}
                        <div className="absolute inset-y-0 right-0 w-1/3 bg-black/70 flex flex-col items-center justify-center">
                          <span className="text-white font-bold text-lg">{playlist.itemCount}</span>
                          <span className="text-slate-300 text-xs">videos</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-white line-clamp-2 group-hover:text-gold transition text-sm">
                          {playlist.title}
                        </h4>
                      </div>
                    </ExternalLink>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ---- PODCASTS TAB ---- */}
        {activeTab === 'podcasts' && hasPodcast && podcastData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Podcast</h2>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {podcastData.imageUrl && (
                  <img
                    src={podcastData.imageUrl}
                    alt={podcastData.name || 'Podcast'}
                    className="w-32 h-32 rounded-xl object-cover mx-auto sm:mx-0"
                  />
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-white mb-1">{podcastData.name}</h3>
                  {podcastData.publisher && (
                    <p className="text-slate-400 text-sm mb-3">{podcastData.publisher}</p>
                  )}

                  {podcastData.description && (
                    <p className="text-slate-300 mb-4 line-clamp-3">{podcastData.description}</p>
                  )}

                  <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                    {podcastData.episodeCount && (
                      <span className="text-green-400 font-medium">
                        {podcastData.episodeCount} episodes
                      </span>
                    )}
                    {podcastData.platform && (
                      <span className="text-slate-500">on {podcastData.platform}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <ExternalLinkButton
                      href={podcastData.url || podcastData.podcastUrl}
                      className="bg-green-600 text-white hover:bg-green-500 rounded-full"
                    >
                      <Headphones className="w-5 h-5 mr-2" />
                      Listen Now
                    </ExternalLinkButton>

                    {podcastData.rssUrl && (
                      <ExternalLinkButton
                        href={podcastData.rssUrl}
                        variant="outline"
                        className="rounded-full border-slate-600 text-slate-300 hover:text-white"
                      >
                        RSS Feed
                      </ExternalLinkButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---- BOOKS TAB ---- */}
        {activeTab === 'books' && hasBooks && booksData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Books by {profile.displayName || profile.name}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {booksData.map(book => (
                <div
                  key={book.bookId || book.title}
                  className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-gold/50 transition group"
                >
                  <div className="flex gap-4 p-4">
                    <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-slate-700">
                      {(book.thumbnail || book.imageUrl) ? (
                        <img
                          src={book.thumbnail || book.imageUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Book className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white line-clamp-2 group-hover:text-gold transition">
                        {book.title}
                      </h3>

                      {book.authors && book.authors.length > 0 && (
                        <p className="text-sm text-slate-400 mt-0.5">
                          by {book.authors.join(', ')}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                        {book.publishedDate && (
                          <span>{new Date(book.publishedDate).getFullYear()}</span>
                        )}
                        {book.publisher && <span>{book.publisher}</span>}
                        {book.pageCount && <span>{book.pageCount} pages</span>}
                      </div>

                      {book.description && (
                        <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                          {book.description}
                        </p>
                      )}

                      {book.categories && book.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {book.categories.slice(0, 2).map(cat => (
                            <span key={cat} className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        {book.previewLink && (
                          <ExternalLink href={book.previewLink} className="text-xs text-gold hover:underline">
                            Preview
                          </ExternalLink>
                        )}
                        {book.amazonUrl && (
                          <ExternalLink href={book.amazonUrl} className="text-xs text-gold hover:underline">
                            Amazon
                          </ExternalLink>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- EBOOKS TAB ---- */}
        {activeTab === 'ebooks' && hasEbooks && ebooksData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">eBooks</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ebooksData.map((ebook, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-gold/50 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{ebook.title}</h3>
                      {ebook.platform && (
                        <p className="text-sm text-slate-400 mt-1">{ebook.platform}</p>
                      )}
                      {ebook.year && (
                        <p className="text-xs text-slate-500 mt-1">{ebook.year}</p>
                      )}
                      {ebook.url && (
                        <ExternalLink
                          href={ebook.url}
                          className="text-sm text-gold hover:underline mt-2 inline-block"
                        >
                          Get eBook
                        </ExternalLink>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- AUDIOBOOKS TAB ---- */}
        {activeTab === 'audiobooks' && hasAudiobooks && audiobooksData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Audiobooks</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {audiobooksData.map((audiobook, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-gold/50 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Headphones className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{audiobook.title}</h3>
                      {audiobook.platform && (
                        <p className="text-sm text-slate-400 mt-1">{audiobook.platform}</p>
                      )}
                      {audiobook.year && (
                        <p className="text-xs text-slate-500 mt-1">{audiobook.year}</p>
                      )}
                      {audiobook.url && (
                        <ExternalLink
                          href={audiobook.url}
                          className="text-sm text-gold hover:underline mt-2 inline-block"
                        >
                          Listen
                        </ExternalLink>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- COURSES TAB ---- */}
        {activeTab === 'courses' && hasCourses && coursesData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Courses</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {coursesData.map((course, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-gold/50 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <GraduationCap className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">{course.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">Platform: {course.platform}</p>
                      {course.url && (
                        <ExternalLinkButton
                          href={course.url}
                          variant="outline"
                          size="sm"
                          className="mt-4 rounded-full border-gold/50 text-gold hover:bg-gold/10"
                        >
                          <BookOpen className="w-4 h-4 mr-1" />
                          View Course
                        </ExternalLinkButton>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </motion.div>
        </AnimatePresence>
      </div>

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="bg-slate-800 border-t border-slate-700 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Lamma+. All rights reserved.
        </div>
      </footer>

      {/* Auth Gate Modal for unauthenticated follow */}
      <ActionGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        triggerAction="follow"
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        creatorName={profile.displayName || profile.name}
        creatorSlug={creator.slug}
      />
    </div>
  );
}
