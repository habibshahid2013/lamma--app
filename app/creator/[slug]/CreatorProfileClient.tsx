// app/creator/[slug]/CreatorProfileClient.tsx
// Client Component — Full creator profile with gold gradient design
// Displays: Bio, YouTube, Podcasts, Books, eBooks, Audiobooks, Courses, Social Links, Topics

'use client';

import { useState } from 'react';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorBySlug } from '@/hooks/useCreators';
import CreatorLinks from '@/components/ui/CreatorLinks';
import ExternalLink, { ExternalLinkButton } from '@/components/ui/ExternalLink';
import LammaLogo from '@/components/LammaLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
// TAB BUTTON
// ============================================================================

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        'px-4 py-3 font-medium transition relative whitespace-nowrap rounded-none',
        active
          ? 'text-gold'
          : 'text-slate-400 hover:text-white hover:bg-transparent'
      )}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
      )}
    </Button>
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

  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [isFollowing, setIsFollowing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [useYoutubeFallback, setUseYoutubeFallback] = useState(false);

  const handleFollow = () => {
    if (!user) {
      alert('Please sign in to follow this creator');
      return;
    }
    setIsFollowing(!isFollowing);
  };

  // ---- Loading State ----
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" />
      </div>
    );
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
          'h-48 md:h-64',
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
          <div className="relative -mt-20 md:-mt-24 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className={cn(
                  'w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-slate-900 bg-slate-800',
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
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
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
                      href={`/explore?category=${category}`}
                      className="px-3 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium hover:bg-gold/30 transition capitalize"
                    >
                      {category.replace('_', ' ')}
                    </Link>
                  )}

                  {country && (
                    <Link
                      href={`/explore?region=${region}`}
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
                  variant={isFollowing ? 'secondary' : 'default'}
                  className={cn(
                    'rounded-full font-semibold',
                    isFollowing
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-gold text-gray-dark hover:bg-gold-dark'
                  )}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-1" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Follow
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600"
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
                href={`/explore?topic=${encodeURIComponent(topic)}`}
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
        <div className="flex gap-1 border-b border-slate-700 overflow-x-auto scrollbar-hide">
          <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')}>
            About
          </TabButton>
          {hasYouTube && (
            <TabButton active={activeTab === 'videos'} onClick={() => setActiveTab('videos')}>
              Videos
            </TabButton>
          )}
          {hasPodcast && (
            <TabButton active={activeTab === 'podcasts'} onClick={() => setActiveTab('podcasts')}>
              Podcast
            </TabButton>
          )}
          {hasBooks && (
            <TabButton active={activeTab === 'books'} onClick={() => setActiveTab('books')}>
              Books ({booksData!.length})
            </TabButton>
          )}
          {hasEbooks && (
            <TabButton active={activeTab === 'ebooks'} onClick={() => setActiveTab('ebooks')}>
              eBooks ({ebooksData!.length})
            </TabButton>
          )}
          {hasAudiobooks && (
            <TabButton active={activeTab === 'audiobooks'} onClick={() => setActiveTab('audiobooks')}>
              Audiobooks ({audiobooksData!.length})
            </TabButton>
          )}
          {hasCourses && (
            <TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}>
              Courses ({coursesData!.length})
            </TabButton>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* TAB CONTENT */}
      {/* ================================================================ */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ---- ABOUT TAB ---- */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            {/* Biography */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">About</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {profile.bio || profile.shortBio || 'No biography available.'}
                </p>
              </div>

              {/* Birth/Location Info */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
                {profile.birthDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Born {new Date(profile.birthDate).toLocaleDateString()}
                  </span>
                )}
                {profile.birthPlace && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Born in {profile.birthPlace}
                  </span>
                )}
                {profile.nationality && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {profile.nationality}
                  </span>
                )}
              </div>

              {/* AI-generated disclaimer */}
              {aiGenerated && (
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-500">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    Some information on this profile was AI-generated on {new Date(aiGenerated.generatedAt).toLocaleDateString()}.
                    Confidence: {aiGenerated.confidence}
                  </p>
                </div>
              )}
            </section>

            {/* YouTube Channel Summary (on About tab) */}
            {hasYouTube && youtubeData && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">YouTube Channel</h2>
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center gap-4 mb-4">
                    {youtubeData.thumbnailUrl && (
                      <img
                        src={youtubeData.thumbnailUrl}
                        alt={youtubeData.channelTitle || 'YouTube channel'}
                        className="w-16 h-16 rounded-full"
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {youtubeData.subscriberCountFormatted || youtubeData.subscriberCount || '-'}
                      </div>
                      <div className="text-sm text-slate-400">Subscribers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {typeof youtubeData.videoCount === 'number'
                          ? youtubeData.videoCount.toLocaleString()
                          : youtubeData.videoCount || '-'}
                      </div>
                      <div className="text-sm text-slate-400">Videos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {youtubeData.viewCount
                          ? `${(Number(youtubeData.viewCount) / 1000000).toFixed(1)}M`
                          : '-'}
                      </div>
                      <div className="text-sm text-slate-400">Total Views</div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ---- VIDEOS TAB ---- */}
        {activeTab === 'videos' && hasYouTube && youtubeData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Latest Videos</h2>
              <ExternalLink
                href={youtubeData.channelUrl}
                className="text-gold hover:underline text-sm"
                showIcon
              >
                View all on YouTube
              </ExternalLink>
            </div>

            {youtubeData.recentVideos && youtubeData.recentVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {youtubeData.recentVideos.map(video => (
                  <ExternalLink
                    key={video.videoId}
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
                    </div>
                    <h3 className="font-medium text-white line-clamp-2 group-hover:text-gold transition">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                      {video.viewCount && (
                        <span>{video.viewCount.toLocaleString()} views</span>
                      )}
                      {video.publishedAt && (
                        <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </ExternalLink>
                ))}
              </div>
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
      </div>

      {/* ================================================================ */}
      {/* FOOTER */}
      {/* ================================================================ */}
      <footer className="bg-slate-800 border-t border-slate-700 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} Lamma+. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
