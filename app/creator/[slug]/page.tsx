// src/app/creator/[slug]/page.tsx
// COMPLETE Creator Profile Page - Shows ALL collected data
// Displays: Bio, YouTube, Podcasts, Books, Social Links, Topics, Region

'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorBySlug } from '@/hooks/useCreators';



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
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-white">
              <span className="text-2xl">🌙</span>
              <span className="text-xl font-bold">Lamma+</span>
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <Link href="/profile" className="text-slate-300 hover:text-white">
                  Profile
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" className="text-slate-300 hover:text-white">Sign In</Link>
                  <Link href="/sign-up" className="px-4 py-2 bg-amber-500 text-slate-900 rounded-full font-medium hover:bg-amber-400">
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
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2.5 rounded-full font-semibold transition ${
                    isFollowing
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                  }`}
                >
                  {isFollowing ? '✓ Following' : '+ Follow'}
                </button>
                
                <button className="p-2.5 bg-slate-700 rounded-full text-slate-300 hover:bg-slate-600 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>

                {!creator.uid && (
                  <Link
                    href={`/claim/${creator.slug}`}
                    className="px-4 py-2.5 bg-slate-700 text-amber-400 rounded-full font-medium hover:bg-slate-600 transition text-sm"
                  >
                    🔓 Claim Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links Bar */}
      {socialLinks && Object.values(socialLinks).some(v => v) && (
        <div className="bg-slate-800/50 border-y border-slate-700">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {socialLinks.website && (
                <SocialLink href={socialLinks.website} icon="website" label="Website" />
              )}
              {socialLinks.youtube && (
                <SocialLink href={socialLinks.youtube} icon="youtube" label="YouTube" />
              )}
              {socialLinks.twitter && (
                <SocialLink href={socialLinks.twitter} icon="twitter" label="Twitter/X" />
              )}
              {socialLinks.instagram && (
                <SocialLink href={socialLinks.instagram} icon="instagram" label="Instagram" />
              )}
              {socialLinks.facebook && (
                <SocialLink href={socialLinks.facebook} icon="facebook" label="Facebook" />
              )}
              {socialLinks.tiktok && (
                <SocialLink href={socialLinks.tiktok} icon="tiktok" label="TikTok" />
              )}
              {socialLinks.linkedin && (
                <SocialLink href={socialLinks.linkedin} icon="linkedin" label="LinkedIn" />
              )}
              {socialLinks.spotify && (
                <SocialLink href={socialLinks.spotify} icon="spotify" label="Spotify" />
              )}
              {socialLinks.podcast && (
                <SocialLink href={socialLinks.podcast} icon="podcast" label="Podcast" />
              )}
            </div>
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
                      <a 
                        href={content.youtube.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-400 text-sm hover:underline"
                      >
                        View on YouTube →
                      </a>
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
              <a 
                href={content.youtube.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline text-sm"
              >
                View all on YouTube →
              </a>
            </div>

            {content.youtube.recentVideos && content.youtube.recentVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.youtube.recentVideos.map(video => (
                  <a
                    key={video.videoId}
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
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
                    <h3 className="font-medium text-white line-clamp-2 group-hover:text-amber-400 transition">
                      {video.title}
                    </h3>
                    {video.viewCount && (
                      <p className="text-sm text-slate-400 mt-1">
                        {video.viewCount.toLocaleString()} views
                      </p>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                <p className="text-slate-400 mb-4">Videos are loaded from YouTube</p>
                <a 
                  href={content.youtube.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#fff"/>
                  </svg>
                  Watch on YouTube
                </a>
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
                  
                  <a
                    href={content.podcast.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-500 transition"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z"/>
                    </svg>
                    Listen Now
                  </a>
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
                          <a
                            href={book.previewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-400 hover:underline"
                          >
                            Preview
                          </a>
                        )}
                        {book.amazonUrl && (
                          <a
                            href={book.amazonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-400 hover:underline"
                          >
                            Amazon
                          </a>
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

// Tab Button Component
function TabButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 font-medium transition relative whitespace-nowrap ${
        active 
          ? 'text-amber-400' 
          : 'text-slate-400 hover:text-white'
      }`}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
      )}
    </button>
  );
}

// Social Link Component
function SocialLink({ 
  href, 
  icon, 
  label 
}: { 
  href: string; 
  icon: string; 
  label: string 
}) {
  // Simple map for icons
  const icons: Record<string, React.ReactNode> = {
    website: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
      </svg>
    ),
    youtube: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    instagram: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    facebook: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    tiktok: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
    spotify: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z"/>
      </svg>
    ),
    podcast: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.2 12.2c0 2.2-1.8 3.3-3.02 2.92-1.2-.38-1.58-1.87-1.58-2.92 0-2.2 1.8-3.3 3.02-2.92 1.2.38 1.58 1.87 1.58 2.92zm-3.2-6.17c-4.42.87-4.45 7.4.03 8.28 4.41-.88 4.41-7.44-.03-8.28zm8.61 6.17c0 5.75-5.07 9.06-9.61 8.5C3.89 20.12 0 15.54 0 12c0-5.75 5.07-9.06 9.61-8.5 5.11.63 9 5.21 9 8.75 0 .37-.24 1.05-.33 1.25H24v-2.5h-5.39z"/>
      </svg>
    )
  };

  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-full text-xs font-medium hover:bg-slate-700 hover:text-white transition"
    >
      {icons[icon]}
      {label}
    </a>
  );
}
