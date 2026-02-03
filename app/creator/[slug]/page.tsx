// app/creator/[slug]/page.tsx
// Creator Profile Page - Modern shadcn/ui design with AI-clean styling
// Uses modular components: CreatorHeaderCard, CreatorEmbeds, CreatorStats, CreatorContent

'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorBySlug } from '@/hooks/useCreators';
import LammaLogo from '@/components/LammaLogo';
import { cn } from '@/lib/utils';

// Import creator profile components
import {
  CreatorHeaderCard,
  CreatorEmbeds,
  CreatorStats,
  CreatorContent,
} from '@/components/creator';

// Icons
import { Sparkles, Calendar, MapPin, Globe, AlertCircle } from 'lucide-react';

// ============================================================================
// ABOUT SECTION COMPONENT
// ============================================================================

function CreatorAbout({
  bio,
  shortBio,
  birthDate,
  birthPlace,
  nationality,
  aiGenerated,
  isHistorical,
}: {
  bio?: string;
  shortBio?: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  aiGenerated?: {
    generatedAt: string;
    model?: string;
    confidence: 'high' | 'medium' | 'low';
    confidenceScore?: number;
    sources?: string[];
  };
  isHistorical?: boolean;
}) {
  const hasAdditionalInfo = birthDate || birthPlace || nationality;
  const displayBio = bio || shortBio || 'No biography available.';

  return (
    <div className="rounded-2xl border border-white/10 bg-background/60 backdrop-blur p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">About</h2>

      <div className="prose prose-invert max-w-none">
        <p className="text-slate-300 leading-relaxed whitespace-pre-line">
          {displayBio}
        </p>
      </div>

      {hasAdditionalInfo && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2 border-t border-white/5">
          {birthDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Born {new Date(birthDate).toLocaleDateString()}
            </span>
          )}
          {birthPlace && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {birthPlace}
            </span>
          )}
          {nationality && (
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              {nationality}
            </span>
          )}
        </div>
      )}

      {/* AI Generated Disclaimer */}
      {aiGenerated && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            Some information was AI-generated on {new Date(aiGenerated.generatedAt).toLocaleDateString()}.
            {aiGenerated.confidenceScore && (
              <span className="ml-1">
                Confidence: {aiGenerated.confidence} ({aiGenerated.confidenceScore}%)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function CreatorProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();

  const { creator, loading } = useCreatorBySlug(slug);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    if (!user) {
      alert('Please sign in to follow this creator');
      return;
    }
    setIsFollowing(!isFollowing);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: creator?.profile?.displayName || creator?.name || 'Creator Profile',
          text: creator?.profile?.shortBio || `Check out this creator on Lamma+`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!creator) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Creator Not Found</h1>
          <p className="text-slate-400 mb-6">
            The creator you are looking for does not exist or may have been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gold text-gray-dark rounded-full font-medium hover:bg-gold-dark transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Extract profile data with full typing
  const profile = creator.profile ?? {
    name: creator.name,
    displayName: creator.name,
    avatar: creator.avatar ?? null,
    coverImage: null,
    shortBio: creator.note || '',
    bio: '',
    birthDate: undefined,
    birthPlace: undefined,
    nationality: undefined,
  };

  // Safely access optional profile fields
  const birthDate = creator.profile?.birthDate;
  const birthPlace = creator.profile?.birthPlace;
  const nationality = creator.profile?.nationality;

  // Get content data
  const youtubeData = creator.content?.youtube;
  const podcastData = creator.content?.podcast;
  const booksData = creator.content?.books || [];
  const ebooksData = creator.content?.ebooks || [];
  const audiobooksData = creator.content?.audioBooks || [];
  const coursesData = creator.content?.courses || [];

  // Check if we have media content
  const hasMedia = youtubeData || podcastData || creator.socialLinks?.spotify || creator.socialLinks?.twitch;
  const hasContent = booksData.length > 0 || ebooksData.length > 0 || audiobooksData.length > 0 || coursesData.length > 0;

  return (
    <div className={cn('min-h-screen bg-slate-900', creator.isHistorical && 'sepia-[.03]')}>
      {/* Header */}
      <header className="bg-navy-card/80 backdrop-blur border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
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
                  <Link href="/auth/login" className="text-white/70 hover:text-white transition">
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 bg-gold text-gray-dark rounded-full font-medium hover:bg-gold-dark transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header Card - Profile Info, Social Links */}
        <CreatorHeaderCard
          creator={creator}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onShare={handleShare}
        />

        {/* Stats */}
        <CreatorStats creator={creator} />

        {/* About Section */}
        <CreatorAbout
          bio={profile.bio}
          shortBio={profile.shortBio}
          birthDate={birthDate}
          birthPlace={birthPlace}
          nationality={nationality}
          aiGenerated={creator.aiGenerated}
          isHistorical={creator.isHistorical}
        />

        {/* Media Embeds (YouTube, Podcast, Spotify, Twitch) */}
        {hasMedia && (
          <CreatorEmbeds
            youtube={youtubeData}
            podcast={podcastData}
            spotifyUrl={creator.socialLinks?.spotify}
            twitchUrl={creator.socialLinks?.twitch}
          />
        )}

        {/* Content Library (Books, eBooks, Audiobooks, Courses) */}
        {hasContent && (
          <CreatorContent
            books={booksData}
            ebooks={ebooksData}
            audiobooks={audiobooksData}
            courses={coursesData}
            creatorName={profile.displayName || profile.name}
          />
        )}

        {/* Languages */}
        {creator.languages && creator.languages.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-background/60 backdrop-blur p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {creator.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm border border-slate-700"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-white/5 py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Lamma+. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link href="/explore" className="hover:text-gold transition">
              Explore Creators
            </Link>
            <span>|</span>
            <Link href="/about" className="hover:text-gold transition">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
