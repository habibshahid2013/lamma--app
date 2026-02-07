// app/creator/[slug]/CreatorProfileClient.tsx
// Client Component -- Creator profile page matching prototype design
// Uses prototype layout: cover gradient, overlapping avatar, shadcn Tabs, pills

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorBySlug } from '@/hooks/useCreators';
import { useFollow } from '@/hooks/useFollow';
import CreatorLinks from '@/components/ui/CreatorLinks';
import ExternalLink, { ExternalLinkButton } from '@/components/ui/ExternalLink';
import AnimatedSection from '@/components/ui/AnimatedSection';
import BookList from '@/components/content/BookList';
import CourseList from '@/components/content/CourseList';
import ActionGateModal from '@/components/ActionGateModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTrack } from '@/hooks/useTrack';
import { generateCreatorSchema, generateBreadcrumbSchema, siteConfig } from '@/lib/seo';
import type { Creator } from '@/lib/types/creator';
import {
  ArrowLeft,
  CheckCircle,
  MapPin,
  Globe,
  Book,
  GraduationCap,
  Users,
  Star,
  TrendingUp,
  Clock,
  ExternalLink as ExternalLinkIcon,
  Share2,
  Youtube,
  Headphones,
  Sparkles,
  Award,
  BookOpen,
  Heart,
  UserPlus,
  UserCheck,
  Unlock,
  Play,
  Smartphone,
  Building2,
  Copy,
  Check as CheckIcon,
  Twitter,
  Facebook,
  Mail,
  ChevronRight,
  Calendar,
} from 'lucide-react';

// ============================================================================
// HELPERS
// ============================================================================

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

// ============================================================================
// SKELETON LOADING STATE
// ============================================================================

function ProfileSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/30 via-primary/20 to-muted">
        <div className="absolute top-4 left-4">
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Profile header */}
        <div className="relative -mt-20 md:-mt-24 pb-6">
          <div className="flex flex-col items-center md:flex-row md:items-end md:gap-6">
            <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-2xl" />
            <div className="mt-4 flex-1 space-y-3 text-center md:mt-0 md:text-left">
              <Skeleton className="h-9 w-56 mx-auto md:mx-0" />
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
            <div className="mt-4 flex gap-2 md:mt-0">
              <Skeleton className="h-10 w-28 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
        {/* Social links */}
        <div className="flex flex-wrap gap-2 pb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        {/* Topics */}
        <div className="flex flex-wrap gap-2 pb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-px w-full mb-6" />
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
        {/* Content */}
        <div className="space-y-6 pb-12">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
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
      color: 'bg-muted text-muted-foreground hover:bg-muted/80',
      href: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl p-6 w-full max-w-sm border shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Share Profile</h3>

        <div className="flex items-center gap-2 p-3 bg-muted rounded-xl mb-4">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-transparent text-sm text-muted-foreground outline-none"
          />
          <button onClick={handleCopy} className="p-2 hover:bg-accent rounded-lg transition">
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

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

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-muted-foreground hover:text-foreground transition text-sm"
        >
          Close
        </button>
      </div>
    </div>
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
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {video.duration}
          </span>
        )}
      </div>
      <h3 className="font-medium line-clamp-2 group-hover:text-primary transition text-sm">
        {video.title}
      </h3>
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        {formattedViews && <span>{formattedViews}</span>}
        {formattedViews && video.publishedAt && <span>-</span>}
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
  const { isFollowing, toggleFollow, loading: followLoading } = useFollow();

  const [imageError, setImageError] = useState(false);
  const [useYoutubeFallback, setUseYoutubeFallback] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);
  const { track } = useTrack();

  useEffect(() => {
    if (creator) {
      track('creator_profile_viewed', {
        creator_id: creator.id,
        creator_name: creator.name,
        category: creator.category,
        has_youtube: !!creator.content?.youtube,
        has_podcast: !!creator.content?.podcast,
      });
    }
  }, [creator?.id]);

  const handleFollow = async () => {
    if (!user) {
      setShowAuthGate(true);
      return;
    }
    try {
      setFollowError(null);
      track(isFollowing(creator!.id) ? 'creator_unfollowed' : 'creator_followed', {
        creator_id: creator!.id,
        creator_name: creator!.name,
      });
      await toggleFollow(creator!.id);
    } catch (err: any) {
      setFollowError(err.message);
    }
  };

  // ---- Loading State ----
  if (loading) {
    return <ProfileSkeleton />;
  }

  // ---- Not Found State ----
  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Creator Not Found</h1>
          <p className="text-muted-foreground mb-4">The creator you are looking for does not exist.</p>
          <Link href="/" className="text-primary hover:underline">Back to Home</Link>
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
    location,
    aiGenerated,
    affiliations,
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

  const displayName = profile.displayName || profile.name;

  // Avatar logic -- try profile avatar, fallback to YouTube thumbnail
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

  // Social links for pills
  const socialEntries = socialLinks
    ? Object.entries(socialLinks).filter(([, url]) => url)
    : [];

  // Determine default tab
  const defaultTab = 'about';

  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <CreatorJsonLd creator={creator} />

      {/* ================================================================ */}
      {/* COVER GRADIENT */}
      {/* ================================================================ */}
      <div
        className={cn(
          'relative h-48 md:h-64',
          isHistorical
            ? 'bg-gradient-to-br from-muted via-muted/80 to-muted/60'
            : 'bg-gradient-to-br from-primary/90 via-primary/70 to-gold/50'
        )}
      >
        <div className="islamic-pattern absolute inset-0 opacity-30" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 rounded-full bg-background/80 backdrop-blur-sm"
            asChild
          >
            <Link href="/explore">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* PROFILE HEADER */}
      {/* ================================================================ */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <AnimatedSection>
        <div className="relative -mt-20 md:-mt-24 pb-6">
          <div className="flex flex-col items-center md:flex-row md:items-end md:gap-6">
            {/* Avatar */}
            <Avatar
              className={cn(
                'h-32 w-32 md:h-40 md:w-40 rounded-2xl ring-4 ring-background',
                isHistorical && 'sepia-[.3]'
              )}
            >
              {avatarUrl && !imageError ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={displayName}
                  className="object-cover"
                  onError={() => {
                    if (!useYoutubeFallback && youtubeAvatar) {
                      setUseYoutubeFallback(true);
                      setImageError(false);
                    } else {
                      setImageError(true);
                    }
                  }}
                />
              ) : null}
              <AvatarFallback
                className={cn(
                  'rounded-2xl text-4xl font-bold',
                  isHistorical
                    ? 'bg-gradient-to-br from-muted to-muted-foreground/20'
                    : 'bg-gradient-to-br from-primary to-gold text-primary-foreground'
                )}
              >
                {profile.name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="mt-4 flex-1 text-center md:mt-0 md:text-left">
              {/* Name + Verified */}
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h1 className="text-3xl font-bold md:text-4xl">
                  {displayName}
                </h1>
                {verified && (
                  <CheckCircle className="h-6 w-6 fill-primary text-primary-foreground" />
                )}
              </div>

              {/* Badges row */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {category && (
                  <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize text-secondary-foreground">
                    {category.replace('_', ' ')}
                  </span>
                )}
                {featured && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-medium text-gold-deep dark:text-gold border-0">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </span>
                )}
                {trending && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive border-0">
                    <TrendingUp className="h-3 w-3" />
                    Trending
                  </span>
                )}
                {isHistorical && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    <Clock className="h-3 w-3" />
                    {lifespan || 'Historical'}
                  </span>
                )}
                {verified && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border-0">
                    <Award className="h-3 w-3" />
                    Verified
                  </span>
                )}
                {tier && tier !== 'verified' && (
                  <span className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-medium border-0',
                    tier === 'rising' && 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                    tier === 'new' && 'bg-teal/10 text-teal',
                    tier === 'community' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                  )}>
                    <Sparkles className="h-3 w-3" />
                    {tier === 'rising' ? 'Rising Star' : tier === 'new' ? 'New Creator' : 'Community'}
                  </span>
                )}
              </div>

              {/* Meta: location, languages */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground md:justify-start">
                {country && (
                  <span className="flex items-center gap-1">
                    <span>{countryFlag}</span>
                    {location || country}
                  </span>
                )}
                {languages && languages.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    {languages.join(', ')}
                  </span>
                )}
                {profile.title && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {profile.title}
                  </span>
                )}
              </div>

              {/* Stats pills */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                {stats?.followerCount && stats.followerCount > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">{formatFollowers(stats.followerCount)}</span>
                    <span className="text-muted-foreground">followers</span>
                  </div>
                )}
                {hasYouTube && youtubeData?.subscriberCount && (
                  <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-sm">
                    <Youtube className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{youtubeData.subscriberCount}</span>
                    <span className="text-muted-foreground">subs</span>
                  </div>
                )}
                {hasCourses && coursesData && (
                  <div className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1.5 text-sm">
                    <GraduationCap className="h-4 w-4 text-gold-deep dark:text-gold" />
                    <span className="font-medium">{coursesData.length}</span>
                    <span className="text-muted-foreground">courses</span>
                  </div>
                )}
                {hasBooks && booksData && (
                  <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm">
                    <Book className="h-4 w-4" />
                    <span className="font-medium">{booksData.length}</span>
                    <span className="text-muted-foreground">books</span>
                  </div>
                )}
                {stats?.booksPublished && stats.booksPublished > 0 && !hasBooks && (
                  <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm">
                    <Book className="h-4 w-4" />
                    <span className="font-medium">{stats.booksPublished}</span>
                    <span className="text-muted-foreground">books</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap items-center gap-2 md:mt-0">
              <Button
                onClick={handleFollow}
                disabled={followLoading}
                className={cn(
                  'gap-2 rounded-full',
                  isFollowing(creator.id)
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : ''
                )}
              >
                {isFollowing(creator.id) ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Following
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    {followLoading ? 'Loading...' : 'Follow'}
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                onClick={() => {
                  track('share_modal_opened', { creator_id: creator!.id });
                  setShowShareModal(true);
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {!creator.uid && (
                <Button
                  variant="outline"
                  className="rounded-full gap-1.5"
                  asChild
                >
                  <Link href={`/claim/${creator.slug}`}>
                    <Unlock className="h-3.5 w-3.5" />
                    Claim
                  </Link>
                </Button>
              )}
            </div>
          </div>
          {followError && (
            <p className="text-destructive text-xs mt-2 text-center md:text-left">{followError}</p>
          )}
        </div>
        </AnimatedSection>

        {/* ================================================================ */}
        {/* SOCIAL LINKS */}
        {/* ================================================================ */}
        {socialEntries.length > 0 && (
          <AnimatedSection delay={0.1}>
          <div className="flex flex-wrap items-center gap-2 pb-6">
            <CreatorLinks
              socialLinks={socialLinks as Record<string, string | null | undefined>}
              maxVisible={12}
              showLabels={true}
              size="sm"
              variant="outline"
              className="justify-center md:justify-start"
            />
          </div>
          </AnimatedSection>
        )}

        {/* ================================================================ */}
        {/* TOPICS */}
        {/* ================================================================ */}
        {topics && topics.length > 0 && (
          <AnimatedSection delay={0.2}>
          <div className="flex flex-wrap gap-2 pb-6">
            {topics.map((topic) => (
              <Link
                key={topic}
                href={`/search?topic=${encodeURIComponent(topic)}`}
              >
                <span className="inline-flex items-center rounded-full border border-border/50 px-2.5 py-0.5 text-xs font-medium cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                  {topic}
                </span>
              </Link>
            ))}
          </div>
          </AnimatedSection>
        )}

        <Separator className="mb-6" />

        {/* ================================================================ */}
        {/* TABS */}
        {/* ================================================================ */}
        <Tabs defaultValue={defaultTab} className="pb-12">
          <TabsList className="mb-6 w-full justify-start bg-transparent border-b border-border/50 rounded-none p-0 h-auto flex-wrap">
            <TabsTrigger
              value="about"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              About
            </TabsTrigger>
            {hasYouTube && (
              <TabsTrigger
                value="youtube"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                YouTube
              </TabsTrigger>
            )}
            {hasPodcast && (
              <TabsTrigger
                value="podcast"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Podcast
              </TabsTrigger>
            )}
            {hasCourses && coursesData && (
              <TabsTrigger
                value="courses"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Courses ({coursesData.length})
              </TabsTrigger>
            )}
            {hasBooks && booksData && (
              <TabsTrigger
                value="books"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Books ({booksData.length})
              </TabsTrigger>
            )}
            {hasEbooks && ebooksData && (
              <TabsTrigger
                value="ebooks"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                eBooks ({ebooksData.length})
              </TabsTrigger>
            )}
            {hasAudiobooks && audiobooksData && (
              <TabsTrigger
                value="audiobooks"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Audiobooks ({audiobooksData.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* ============================================================ */}
          {/* ABOUT TAB */}
          {/* ============================================================ */}
          <TabsContent value="about" className="space-y-8">
            <AnimatedSection>
            {/* Biography */}
            <div>
              <h2 className="mb-4 text-xl font-semibold">Biography</h2>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {profile.bio || profile.shortBio || 'No biography available.'}
              </p>

              {/* Birth/Location details */}
              {(profile.birthDate || profile.birthPlace || profile.nationality) && (
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {profile.birthDate && (
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      Born {new Date(profile.birthDate).toLocaleDateString()}
                    </span>
                  )}
                  {profile.birthPlace && (
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {profile.birthPlace}
                    </span>
                  )}
                  {profile.nationality && (
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      {profile.nationality}
                    </span>
                  )}
                </div>
              )}

              {/* AI-generated disclaimer */}
              {aiGenerated && (
                <div className="mt-4 p-3 bg-muted rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-gold" />
                    <span>
                      Profile enhanced with AI on {new Date(aiGenerated.generatedAt).toLocaleDateString()}
                      {aiGenerated.confidence && (
                        <span className={cn(
                          'ml-2 px-2 py-0.5 rounded-full text-xs',
                          aiGenerated.confidence === 'high' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                          aiGenerated.confidence === 'medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                          'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                        )}>
                          {aiGenerated.confidence} confidence
                        </span>
                      )}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Affiliations */}
            {affiliations && affiliations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Affiliations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {affiliations.map((aff) => (
                      <span
                        key={aff}
                        className="inline-flex items-center rounded-full border border-border/50 px-2.5 py-0.5 text-xs font-medium"
                      >
                        {aff}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* YouTube Channel Summary (on About tab) */}
            {hasYouTube && youtubeData && (
              <Card className="group transition-all hover:border-primary/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold text-base">YouTube Channel</h3>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    {youtubeData.thumbnailUrl && (
                      <img
                        src={youtubeData.thumbnailUrl}
                        alt={youtubeData.channelTitle || 'YouTube channel'}
                        className="w-14 h-14 rounded-full ring-2 ring-red-500/30"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{youtubeData.channelTitle || youtubeData.channelName}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        {youtubeData.subscriberCount && <span>{youtubeData.subscriberCount} subscribers</span>}
                        {youtubeData.videoCount && (
                          <span>
                            {typeof youtubeData.videoCount === 'number'
                              ? youtubeData.videoCount.toLocaleString()
                              : youtubeData.videoCount} videos
                          </span>
                        )}
                        {youtubeData.viewCount && (
                          <span>{(Number(youtubeData.viewCount) / 1_000_000).toFixed(1)}M views</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ExternalLink
                    href={youtubeData.channelUrl}
                    className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:underline"
                    showIcon
                  >
                    View on YouTube
                  </ExternalLink>
                </CardContent>
              </Card>
            )}
            </AnimatedSection>
          </TabsContent>

          {/* ============================================================ */}
          {/* YOUTUBE TAB */}
          {/* ============================================================ */}
          <TabsContent value="youtube" className="space-y-8">
            <AnimatedSection>
            {hasYouTube && youtubeData && (
              <>
                {/* Channel Stats Bar */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      {youtubeData.thumbnailUrl && (
                        <img
                          src={youtubeData.thumbnailUrl}
                          alt={youtubeData.channelTitle || 'YouTube channel'}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{youtubeData.channelTitle || youtubeData.channelName}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-0.5">
                          {youtubeData.subscriberCount && <span>{youtubeData.subscriberCount} subscribers</span>}
                          {youtubeData.videoCount && (
                            <span>
                              {typeof youtubeData.videoCount === 'number'
                                ? youtubeData.videoCount.toLocaleString()
                                : youtubeData.videoCount} videos
                            </span>
                          )}
                          {youtubeData.viewCount && <span>{youtubeData.viewCount} total views</span>}
                        </div>
                      </div>
                      <ExternalLinkButton
                        href={youtubeData.channelUrl}
                        className="flex-shrink-0 bg-red-600 text-white hover:bg-red-500 rounded-full"
                      >
                        <Youtube className="w-4 h-4 mr-1.5" />
                        <span className="hidden sm:inline">Subscribe</span>
                      </ExternalLinkButton>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Categories */}
                {youtubeData.derivedCategories && youtubeData.derivedCategories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Content Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {youtubeData.derivedCategories.map((cat) => (
                        <span
                          key={cat}
                          className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Videos */}
                {youtubeData.recentVideos && youtubeData.recentVideos.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Recent Videos</h3>
                      <ExternalLink href={youtubeData.channelUrl} className="text-primary hover:underline text-sm" showIcon>
                        View all
                      </ExternalLink>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {youtubeData.recentVideos.map((video) => (
                        <VideoCard key={video.videoId} video={video} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground mb-4">Videos are loaded from YouTube</p>
                      <ExternalLinkButton
                        href={youtubeData.channelUrl}
                        className="bg-red-600 text-white hover:bg-red-500 rounded-full"
                      >
                        <Youtube className="w-5 h-5 mr-2" />
                        Watch on YouTube
                      </ExternalLinkButton>
                    </CardContent>
                  </Card>
                )}

                {/* Popular Videos */}
                {youtubeData.popularVideos && youtubeData.popularVideos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Popular Videos</h3>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">All Time</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {youtubeData.popularVideos.map((video) => (
                        <VideoCard key={video.videoId} video={video} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Playlists */}
                {youtubeData.playlists && youtubeData.playlists.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Playlists</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {youtubeData.playlists.map((playlist) => (
                        <ExternalLink
                          key={playlist.playlistId}
                          href={`https://www.youtube.com/playlist?list=${playlist.playlistId}`}
                          className="group"
                        >
                          <Card className="overflow-hidden transition-all hover:border-primary/30">
                            <div className="relative aspect-video bg-muted">
                              {playlist.thumbnail && (
                                <img
                                  src={playlist.thumbnail}
                                  alt={playlist.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                              )}
                              <div className="absolute inset-y-0 right-0 w-1/3 bg-black/70 flex flex-col items-center justify-center">
                                <span className="text-white font-bold text-lg">{playlist.itemCount}</span>
                                <span className="text-gray-300 text-xs">videos</span>
                              </div>
                            </div>
                            <CardContent className="p-3">
                              <h4 className="font-medium line-clamp-2 group-hover:text-primary transition text-sm">
                                {playlist.title}
                              </h4>
                            </CardContent>
                          </Card>
                        </ExternalLink>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            </AnimatedSection>
          </TabsContent>

          {/* ============================================================ */}
          {/* PODCAST TAB */}
          {/* ============================================================ */}
          <TabsContent value="podcast" className="space-y-4">
            <AnimatedSection>
            {hasPodcast && podcastData && (
              <>
                <h2 className="text-xl font-semibold">Podcast</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                      {podcastData.imageUrl && (
                        <img
                          src={podcastData.imageUrl}
                          alt={podcastData.name || 'Podcast'}
                          className="w-32 h-32 rounded-xl object-cover mx-auto sm:mx-0"
                        />
                      )}
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-semibold mb-1">{podcastData.name}</h3>
                        {podcastData.publisher && (
                          <p className="text-muted-foreground text-sm mb-3">{podcastData.publisher}</p>
                        )}
                        {podcastData.description && (
                          <p className="text-muted-foreground mb-4 line-clamp-3">{podcastData.description}</p>
                        )}
                        <div className="flex items-center justify-center sm:justify-start gap-4 mb-4 text-sm">
                          {podcastData.episodeCount && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {podcastData.episodeCount} episodes
                            </span>
                          )}
                          {podcastData.platform && (
                            <span className="text-muted-foreground">on {podcastData.platform}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          <ExternalLinkButton
                            href={podcastData.url || podcastData.podcastUrl}
                            className="bg-green-600 text-white hover:bg-green-500 rounded-full"
                          >
                            <Headphones className="w-4 h-4 mr-2" />
                            Listen Now
                          </ExternalLinkButton>
                          {podcastData.rssUrl && (
                            <ExternalLinkButton
                              href={podcastData.rssUrl}
                              variant="outline"
                              className="rounded-full"
                            >
                              RSS Feed
                            </ExternalLinkButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            </AnimatedSection>
          </TabsContent>

          {/* ============================================================ */}
          {/* COURSES TAB */}
          {/* ============================================================ */}
          <TabsContent value="courses" className="space-y-4">
            <AnimatedSection>
              <CourseList courses={coursesData || []} />
            </AnimatedSection>
          </TabsContent>

          {/* ============================================================ */}
          {/* BOOKS TAB */}
          {/* ============================================================ */}
          <TabsContent value="books" className="space-y-4">
            <AnimatedSection>
              <BookList books={booksData || []} creatorName={displayName} />
            </AnimatedSection>
          </TabsContent>

          {/* ============================================================ */}
          {/* EBOOKS TAB */}
          {/* ============================================================ */}
          <TabsContent value="ebooks" className="space-y-4">
            <AnimatedSection>
            <h2 className="text-xl font-semibold">eBooks</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ebooksData?.map((ebook, idx) => (
                <Card key={idx} className="group transition-all hover:border-primary/30">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="rounded-xl bg-blue-500/10 p-3">
                      <Smartphone className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {ebook.title}
                      </h3>
                      {ebook.platform && (
                        <p className="mt-1 text-sm text-muted-foreground">{ebook.platform}</p>
                      )}
                      {ebook.year && (
                        <p className="text-xs text-muted-foreground mt-1">{ebook.year}</p>
                      )}
                      {ebook.url && (
                        <ExternalLink
                          href={ebook.url}
                          className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          showIcon
                        >
                          Get eBook
                        </ExternalLink>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            </AnimatedSection>
          </TabsContent>

          {/* ============================================================ */}
          {/* AUDIOBOOKS TAB */}
          {/* ============================================================ */}
          <TabsContent value="audiobooks" className="space-y-4">
            <AnimatedSection>
            <h2 className="text-xl font-semibold">Audiobooks</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {audiobooksData?.map((audiobook, idx) => (
                <Card key={idx} className="group transition-all hover:border-primary/30">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="rounded-xl bg-orange-500/10 p-3">
                      <Headphones className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {audiobook.title}
                      </h3>
                      {audiobook.platform && (
                        <p className="mt-1 text-sm text-muted-foreground">{audiobook.platform}</p>
                      )}
                      {audiobook.year && (
                        <p className="text-xs text-muted-foreground mt-1">{audiobook.year}</p>
                      )}
                      {audiobook.url && (
                        <ExternalLink
                          href={audiobook.url}
                          className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          showIcon
                        >
                          Listen
                        </ExternalLink>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            </AnimatedSection>
          </TabsContent>
        </Tabs>
      </div>

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
        creatorName={displayName}
        creatorSlug={creator.slug}
      />
    </div>
  );
}
