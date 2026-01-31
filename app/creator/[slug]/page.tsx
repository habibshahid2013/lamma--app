// src/app/creator/[slug]/page.tsx
// COMPLETE Creator Profile Page - Shows ALL collected data
// Displays: Bio, YouTube, Podcasts, Books, Social Links, Topics, Region

'use client';

import { useState } from 'react';
import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorBySlug } from '@/hooks/useCreators';
import CreatorLinks from '@/components/ui/CreatorLinks';
import ExternalLink, { ExternalLinkButton } from '@/components/ui/ExternalLink';
import LammaLogo from '@/components/LammaLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Share2, UserPlus, UserCheck, Unlock, Youtube, Headphones, Book } from 'lucide-react';



export default function CreatorProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();
  
  // Custom hook handles data fetching logic correctly (including slug lookup)
  const { creator, loading: creatorLoading } = useCreatorBySlug(slug);
  const loading = creatorLoading;
  
  const [activeTab, setActiveTab] = useState<'about' | 'videos' | 'podcasts' | 'books'>('about');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Creator Not Found</h1>
          <p className="text-slate-400 mb-4">The creator you are looking for does not exist.</p>
          <Link href="/" className="text-amber-500 hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  // Safe to access since we returned if !creator
  const { content, socialLinks, topics, category, region, country, countryFlag, languages, stats } = creator;
  
  // Ensure profile exists or use fallbacks from top-level creator props
  const profile = creator.profile || {
    name: creator.name || 'Unknown',
    displayName: creator.name || 'Unknown',
    avatar: creator.avatar || null,
    coverImage: null,
    shortBio: creator.note || '',
    bio: '',
  };
  
  const formattedStats = stats || {
    followerCount: 0,
    followingCount: 0,
    viewCount: 0,
  };

  // Get avatar - fallback to YouTube thumbnail or initials
  // Priority: 1. Profile Avatar, 2. YouTube Thumbnail (if fallback triggered or avatar missing), 3. Initials
  const youtubeAvatar = content?.youtube?.thumbnailUrl;
  const avatarUrl = useYoutubeFallback ? youtubeAvatar : (profile.avatar || youtubeAvatar || null);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
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

      {/* Cover & Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500">
          {profile.coverImage && (
            <img src={profile.coverImage} alt="" className="w-full h-full object-cover opacity-50" />
          )}
        </div>

        {/* Profile Info Overlay */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative -mt-20 md:-mt-24 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden ring-4 ring-slate-900 bg-slate-800">
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
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <span className="text-5xl font-bold text-slate-900">
                        {profile.name[0]}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Verified Badge */}
                {creator.verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                    <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Name & Meta */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {profile.displayName || profile.name}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-400">
                  {/* Category - Clickable */}
                  <Link 
                    href={`/explore?category=${category}`}
                    className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium hover:bg-amber-500/30 transition capitalize"
                  >
                    {category}
                  </Link>
                  
                  {/* Country - Clickable */}
                  {country && (
                    <Link 
                      href={`/explore?region=${region}`}
                      className="flex items-center gap-1 hover:text-amber-400 transition"
                    >
                      <span>{countryFlag}</span>
                      <span>{country}</span>
                    </Link>
                  )}
                  
                  {/* Languages */}
                  {languages && languages.length > 0 && (
                    <span className="text-slate-500">
                      Speaks: {languages.join(', ')}
                    </span>
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  {content?.youtube && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 rounded-full">
                      <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                        <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#fff"/>
                      </svg>
                      <span className="text-sm font-medium text-red-400">
                        {content.youtube.subscriberCount} subscribers
                      </span>
                    </div>
                  )}

                  {content?.podcast && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 rounded-full">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z"/>
                      </svg>
                      <span className="text-sm font-medium text-green-400">
                        {content.podcast.episodeCount} episodes
                      </span>
                    </div>
                  )}

                  {content?.books && content.books.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 rounded-full">
                      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                      </svg>
                      <span className="text-sm font-medium text-amber-400">
                        {content.books.length} books
                      </span>
                    </div>
                  )}

                  {formattedStats.followerCount > 0 && (
                    <span className="text-slate-400 text-sm">
                      {formattedStats.followerCount.toLocaleString()} followers
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

      {/* Social Links Bar */}
      {socialLinks && Object.values(socialLinks).some(v => v) && (
        <div className="bg-navy-card/50 border-y border-navy-border">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <CreatorLinks
              socialLinks={socialLinks}
              maxVisible={9}
              showLabels={true}
              size="sm"
              variant="pill"
              className="justify-center md:justify-start"
            />
          </div>
        </div>
      )}

      {/* Topics */}
      {topics && topics.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => (
              <Link
                key={topic}
                href={`/explore?topic=${encodeURIComponent(topic)}`}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-full text-sm hover:bg-slate-700 hover:text-amber-400 transition border border-slate-700"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="flex gap-1 border-b border-slate-700 overflow-x-auto scrollbar-hide">
          <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')}>
            About
          </TabButton>
          {content?.youtube && (
            <TabButton active={activeTab === 'videos'} onClick={() => setActiveTab('videos')}>
              Videos
            </TabButton>
          )}
          {content?.podcast && (
            <TabButton active={activeTab === 'podcasts'} onClick={() => setActiveTab('podcasts')}>
              Podcast
            </TabButton>
          )}
          {content?.books && content.books.length > 0 && (
            <TabButton active={activeTab === 'books'} onClick={() => setActiveTab('books')}>
              Books ({content.books.length})
            </TabButton>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            {/* Bio */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">About</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {profile.bio || profile.shortBio || 'No biography available.'}
                </p>
              </div>
              
              {/* Additional Info */}
              {(profile.birthPlace || profile.nationality) && (
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
                  {profile.birthPlace && (
                    <span>📍 Born in {profile.birthPlace}</span>
                  )}
                  {profile.nationality && (
                    <span>🌍 {profile.nationality}</span>
                  )}
                </div>
              )}
            </section>

            {/* Quick Stats */}
            {content?.youtube && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">YouTube Channel</h2>
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center gap-4 mb-4">
                    {content.youtube.thumbnailUrl && (
                      <img 
                        src={content.youtube.thumbnailUrl} 
                        alt={content.youtube.channelTitle}
                        className="w-16 h-16 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{content.youtube.channelTitle}</h3>
                      <ExternalLink
                        href={content.youtube.channelUrl}
                        className="text-red-400 text-sm hover:underline"
                      >
                        View on YouTube →
                      </ExternalLink>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {content.youtube.subscriberCount}
                      </div>
                      <div className="text-sm text-slate-400">Subscribers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {content.youtube.videoCount?.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400">Videos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {content.youtube.viewCount ? `${(Number(content.youtube.viewCount) / 1000000).toFixed(1)}M` : '-'}
                      </div>
                      <div className="text-sm text-slate-400">Total Views</div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && content?.youtube && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Latest Videos</h2>
              <ExternalLink
                href={content.youtube.channelUrl}
                className="text-gold hover:underline text-sm"
                showIcon
              >
                View all on YouTube
              </ExternalLink>
            </div>

            {content.youtube.recentVideos && content.youtube.recentVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.youtube.recentVideos.map(video => (
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
                    {video.viewCount && (
                      <p className="text-sm text-slate-400 mt-1">
                        {video.viewCount.toLocaleString()} views
                      </p>
                    )}
                  </ExternalLink>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                <p className="text-slate-400 mb-4">Videos are loaded from YouTube</p>
                <ExternalLinkButton
                  href={content.youtube.channelUrl}
                  className="bg-red-600 text-white hover:bg-red-500 rounded-full"
                >
                  <Youtube className="w-5 h-5 mr-2" />
                  Watch on YouTube
                </ExternalLinkButton>
              </div>
            )}
          </div>
        )}

        {/* Podcasts Tab */}
        {activeTab === 'podcasts' && content?.podcast && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Podcast</h2>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-start gap-6">
                {content.podcast.imageUrl && (
                  <img
                    src={content.podcast.imageUrl}
                    alt={content.podcast.name}
                    className="w-32 h-32 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">{content.podcast.name}</h3>
                  <p className="text-slate-400 text-sm mb-3">{content.podcast.publisher}</p>

                  <p className="text-slate-300 mb-4 line-clamp-3">{content.podcast.description}</p>

                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-green-400 font-medium">
                      {content.podcast.episodeCount} episodes
                    </span>
                    <span className="text-slate-500">on {content.podcast.platform}</span>
                  </div>

                  <ExternalLinkButton
                    href={content.podcast.url}
                    className="bg-green-600 text-white hover:bg-green-500 rounded-full"
                  >
                    <Headphones className="w-5 h-5 mr-2" />
                    Listen Now
                  </ExternalLinkButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && content?.books && content.books.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Books by {profile.displayName}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.books.map(book => (
                <div 
                  key={book.bookId}
                  className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-amber-500/50 transition group"
                >
                  <div className="flex gap-4 p-4">
                    {/* Book Cover */}
                    <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-slate-700">
                      {book.thumbnail ? (
                        <img 
                          src={book.thumbnail}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white line-clamp-2 group-hover:text-amber-400 transition">
                        {book.title}
                      </h3>
                      
                      {book.publishedDate && (
                        <p className="text-sm text-slate-400 mt-1">
                          {new Date(book.publishedDate).getFullYear()}
                        </p>
                      )}
                      
                      {book.description && (
                        <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                          {book.description}
                        </p>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        {book.previewLink && (
                          <ExternalLink
                            href={book.previewLink}
                            className="text-xs text-gold hover:underline"
                          >
                            Preview
                          </ExternalLink>
                        )}
                        {book.amazonUrl && (
                          <ExternalLink
                            href={book.amazonUrl}
                            className="text-xs text-gold hover:underline"
                          >
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
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} Lamma+. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// Tab Button Component using shadcn/ui Button patterns
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
