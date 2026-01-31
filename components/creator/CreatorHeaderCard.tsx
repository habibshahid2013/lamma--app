// components/creator/CreatorHeaderCard.tsx
// Centered Creator Card with Social Icons + Link List
// Uses shadcn/ui for modern, clean design with Lamma+ branding

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { sanitizeExternalUrl, detectPlatform, type LinkPlatform } from '@/lib/utils/links';
import type { Creator } from '@/lib/types/creator';
import {
  Globe,
  Youtube,
  Music,
  Linkedin,
  Facebook,
  Instagram,
  Headphones,
  Link as LinkIcon,
  ExternalLink,
  Share2,
  UserPlus,
  UserCheck,
  Unlock,
  Award,
  TrendingUp,
  Sparkles,
  Star,
  Clock,
  MapPin,
  Twitch,
} from 'lucide-react';

// ============================================================================
// CUSTOM ICONS
// ============================================================================

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.855-.71 2.024-1.122 3.39-1.194 1.06-.056 2.053.043 2.973.293-.06-1.18-.314-2.032-.779-2.613-.533-.667-1.378-1.01-2.508-1.02-1.616.027-2.61.74-3.122 1.299l-1.447-1.412c.907-.93 2.45-1.834 4.646-1.87h.028c1.642.016 2.96.537 3.916 1.55.842.89 1.357 2.126 1.533 3.678.545.168 1.05.378 1.512.632 1.105.607 1.969 1.457 2.498 2.461.737 1.398.886 3.282.397 5.136-.724 2.748-2.593 4.722-5.42 5.717-1.37.483-2.94.728-4.664.728zm-.096-6.789c-1.05.056-1.875.32-2.39.768-.462.401-.668.878-.634 1.46.036.656.357 1.161.928 1.46.588.307 1.378.432 2.22.352 1.262-.121 2.11-.584 2.59-1.418.34-.59.535-1.393.575-2.387-.89-.2-1.87-.29-2.893-.235h-.396z"/>
  </svg>
);

const PatreonIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 .48v23.04h4.22V.48zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.623 8.641 8.623 4.75 0 8.615-3.868 8.615-8.623C24 4.36 20.136.48 15.385.48z"/>
  </svg>
);

// ============================================================================
// PLATFORM ICON MAP
// ============================================================================

const PLATFORM_ICON: Record<LinkPlatform, React.ComponentType<{ className?: string }>> = {
  website: Globe,
  youtube: Youtube,
  spotify: Music,
  x: XIcon,
  twitter: XIcon,
  instagram: Instagram,
  facebook: Facebook,
  tiktok: TikTokIcon,
  linkedin: Linkedin,
  twitch: Twitch,
  threads: ThreadsIcon,
  patreon: PatreonIcon,
  audible: Headphones,
  google_books: LinkIcon,
  amazon: LinkIcon,
  podcast: Headphones,
  other: LinkIcon,
};

// ============================================================================
// TYPES
// ============================================================================

export interface CreatorLink {
  id: string;
  platform: LinkPlatform;
  label?: string;
  url: string;
}

export interface CreatorHeaderCardProps {
  creator: Creator;
  isFollowing?: boolean;
  onFollow?: () => void;
  onShare?: () => void;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function ExternalAnchor({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const safe = sanitizeExternalUrl(href);
  if (!safe) return null;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

function TierBadge({ tier }: { tier: 'verified' | 'rising' | 'new' | 'community' }) {
  const config = {
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
      label: 'New',
      className: 'bg-teal/20 text-teal border-teal/30',
    },
    community: {
      icon: Star,
      label: 'Community',
      className: 'bg-slate-600/50 text-slate-400 border-slate-500/30',
    },
  };

  const { icon: Icon, label, className } = config[tier] || config.community;

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CreatorHeaderCard({
  creator,
  isFollowing = false,
  onFollow,
  onShare,
}: CreatorHeaderCardProps) {
  // Extract profile data with fallbacks
  const profile = creator.profile || {
    name: creator.name || 'Unknown',
    displayName: creator.name || 'Unknown',
    avatar: creator.avatar || null,
    coverImage: null,
    shortBio: creator.note || '',
    bio: '',
  };

  // Get avatar URL from various sources
  const avatarUrl = profile.avatar || creator.avatar || creator.content?.youtube?.thumbnailUrl || null;

  // Convert socialLinks to array format
  const socialLinksArray: CreatorLink[] = [];
  const fullLinksArray: CreatorLink[] = [];

  if (creator.socialLinks) {
    const entries = Object.entries(creator.socialLinks).filter(([, url]) => url);

    // First 6 go to social icon row
    entries.forEach(([platform, url], index) => {
      if (url) {
        const link: CreatorLink = {
          id: `social-${platform}`,
          platform: platform as LinkPlatform,
          label: platform.charAt(0).toUpperCase() + platform.slice(1),
          url: url as string,
        };

        if (index < 6) {
          socialLinksArray.push(link);
        }
        fullLinksArray.push(link);
      }
    });
  }

  // Topics as tags
  const tags = creator.topics || [];

  return (
    <Card className="relative overflow-hidden border-white/10 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      {/* Subtle glow effect - using Lamma+ colors */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal/30 via-gold/20 to-teal/30 blur-3xl" />

      <CardHeader className="relative flex flex-col items-center text-center gap-4 pt-10">
        {/* Avatar */}
        <Avatar className={cn(
          'h-24 w-24 ring-2 ring-white/10',
          creator.isHistorical && 'sepia-[.3]'
        )}>
          <AvatarImage src={avatarUrl || undefined} alt={profile.displayName || profile.name} />
          <AvatarFallback className="bg-gradient-to-br from-gold to-teal text-slate-900 text-2xl font-bold">
            {(profile.displayName || profile.name || '?').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Verified badge overlay */}
        {creator.verified && (
          <div className="absolute top-[4.5rem] left-1/2 translate-x-6 w-6 h-6 bg-gold rounded-full flex items-center justify-center ring-2 ring-slate-900">
            <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
        )}

        {/* Name & Handle */}
        <div className="space-y-1">
          <div className="text-2xl font-semibold tracking-tight text-white">
            {profile.displayName || profile.name}
          </div>
          {creator.slug && (
            <div className="text-sm text-muted-foreground">@{creator.slug}</div>
          )}
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {creator.tier && <TierBadge tier={creator.tier} />}

          {creator.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}

          {creator.trending && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          )}

          {creator.isHistorical && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600/50 text-slate-300 border border-slate-500/30">
              <Clock className="w-3 h-3" />
              {creator.lifespan || 'Historical'}
            </span>
          )}
        </div>

        {/* Bio */}
        {(profile.shortBio || profile.bio) && (
          <p className="max-w-[52ch] text-sm text-muted-foreground">
            {profile.shortBio || profile.bio}
          </p>
        )}

        {/* Category & Location */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {creator.category && (
            <Link
              href={`/explore?category=${creator.category}`}
              className="px-3 py-1 bg-gold/20 text-gold rounded-full font-medium hover:bg-gold/30 transition capitalize"
            >
              {creator.category.replace('_', ' ')}
            </Link>
          )}

          {creator.country && (
            <Link
              href={`/explore?region=${creator.region}`}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 transition text-muted-foreground"
            >
              <span>{creator.countryFlag}</span>
              <span>{creator.country}</span>
            </Link>
          )}

          {creator.location && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {creator.location}
            </span>
          )}
        </div>

        {/* Tags/Topics */}
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {tags.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                href={`/explore?topic=${encodeURIComponent(tag)}`}
                className="px-2 py-1 bg-slate-800 text-slate-300 rounded-full text-xs hover:bg-slate-700 hover:text-gold transition border border-slate-700"
              >
                {tag}
              </Link>
            ))}
            {tags.length > 5 && (
              <span className="px-2 py-1 text-slate-500 text-xs">
                +{tags.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Primary Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Button
            onClick={onFollow}
            className={cn(
              'gap-2 rounded-full',
              isFollowing
                ? 'bg-slate-700 text-white hover:bg-slate-600'
                : 'bg-gold text-gray-dark hover:bg-gold-dark'
            )}
          >
            {isFollowing ? (
              <>
                <UserCheck className="h-4 w-4" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Follow
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={onShare}
            className="rounded-full border border-white/10 hover:bg-white/5"
          >
            <Share2 className="h-4 w-4" />
          </Button>

          {!creator.uid && (
            <Button
              variant="secondary"
              className="rounded-full border border-gold/30 text-gold hover:bg-gold/10"
              asChild
            >
              <Link href={`/claim/${creator.slug}`}>
                <Unlock className="w-4 h-4 mr-1" />
                Claim Profile
              </Link>
            </Button>
          )}
        </div>

        {/* Social Icon Row */}
        {socialLinksArray.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {socialLinksArray.map((link) => {
              const Icon = PLATFORM_ICON[link.platform] || LinkIcon;
              return (
                <ExternalAnchor
                  key={link.id}
                  href={link.url}
                  className="inline-flex"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full border border-white/10 hover:bg-white/5 h-9 w-9"
                    aria-label={link.label || link.platform}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </ExternalAnchor>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="relative pb-8">
        <Separator className="my-5 bg-white/10" />

        {/* Full Link List */}
        {fullLinksArray.length > 0 ? (
          <ScrollArea className="h-[180px] pr-2">
            <div className="space-y-2">
              {fullLinksArray.map((link) => {
                const Icon = PLATFORM_ICON[link.platform] || LinkIcon;
                return (
                  <ExternalAnchor key={link.id} href={link.url}>
                    <div className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.02]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white capitalize">
                            {link.label || link.platform.replace('_', ' ')}
                          </div>
                          <div className="truncate text-xs text-muted-foreground max-w-[200px]">
                            {link.url}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground flex-shrink-0" />
                    </div>
                  </ExternalAnchor>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No links available yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CreatorHeaderCard;
