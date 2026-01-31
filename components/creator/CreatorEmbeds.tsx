// components/creator/CreatorEmbeds.tsx
// Embedded Media Section for YouTube, Spotify, and Twitch
// Uses shadcn/ui with AspectRatio for responsive embeds

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sanitizeExternalUrl } from '@/lib/utils/links';
import {
  Youtube,
  Music,
  Twitch,
  Play,
  ExternalLink,
  Headphones,
} from 'lucide-react';
import type { YouTubeContent, PodcastContent } from '@/lib/types/creator';

// ============================================================================
// TYPES
// ============================================================================

export interface CreatorEmbedsProps {
  youtube?: YouTubeContent | null;
  podcast?: PodcastContent | null;
  spotifyUrl?: string | null;
  twitchUrl?: string | null;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getYouTubeEmbedUrl(content: YouTubeContent): string | null {
  // If we have recent videos, embed the first one
  if (content.recentVideos && content.recentVideos.length > 0) {
    return `https://www.youtube.com/embed/${content.recentVideos[0].videoId}`;
  }
  // Otherwise, try to embed the channel
  if (content.channelId) {
    return `https://www.youtube.com/embed?listType=user_uploads&list=${content.channelId}`;
  }
  return null;
}

function getSpotifyEmbedUrl(url: string): string | null {
  // Convert Spotify URLs to embed format
  // https://open.spotify.com/show/xxx → https://open.spotify.com/embed/show/xxx
  const safeUrl = sanitizeExternalUrl(url);
  if (!safeUrl) return null;

  try {
    const parsed = new URL(safeUrl);
    if (parsed.hostname.includes('spotify.com')) {
      // Check if it's already an embed URL
      if (parsed.pathname.startsWith('/embed/')) {
        return safeUrl;
      }
      // Convert to embed
      return `https://open.spotify.com/embed${parsed.pathname}`;
    }
  } catch {
    return null;
  }
  return null;
}

function getTwitchEmbedUrl(url: string, parent: string = 'localhost'): string | null {
  const safeUrl = sanitizeExternalUrl(url);
  if (!safeUrl) return null;

  try {
    const parsed = new URL(safeUrl);
    if (parsed.hostname.includes('twitch.tv')) {
      const channel = parsed.pathname.replace('/', '');
      if (channel) {
        return `https://player.twitch.tv/?channel=${channel}&parent=${parent}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function EmbedFrame({
  src,
  title,
  ratio = 16 / 9,
}: {
  src: string;
  title: string;
  ratio?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      <AspectRatio ratio={ratio}>
        <iframe
          src={src}
          title={title}
          className="h-full w-full"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </AspectRatio>
    </div>
  );
}

function VideoCard({
  videoId,
  title,
  thumbnail,
  publishedAt,
  viewCount,
  isFirst = false,
}: {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt?: string;
  viewCount?: number;
  isFirst?: boolean;
}) {
  const safeUrl = sanitizeExternalUrl(`https://www.youtube.com/watch?v=${videoId}`);

  return (
    <a
      href={safeUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group block',
        isFirst ? 'col-span-2' : ''
      )}
    >
      <div className="relative rounded-xl overflow-hidden bg-slate-800 mb-3">
        <AspectRatio ratio={16 / 9}>
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
            </div>
          </div>
        </AspectRatio>
      </div>
      <h4 className={cn(
        'font-medium text-white group-hover:text-gold transition',
        isFirst ? 'text-base line-clamp-2' : 'text-sm line-clamp-2'
      )}>
        {title}
      </h4>
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        {viewCount && <span>{viewCount.toLocaleString()} views</span>}
        {publishedAt && <span>{new Date(publishedAt).toLocaleDateString()}</span>}
      </div>
    </a>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CreatorEmbeds({
  youtube,
  podcast,
  spotifyUrl,
  twitchUrl,
  className,
}: CreatorEmbedsProps) {
  const hasYouTube = !!youtube;
  const hasPodcast = !!podcast;
  const hasSpotify = !!spotifyUrl;
  const hasTwitch = !!twitchUrl;

  // Get embed URLs
  const youtubeEmbedUrl = youtube ? getYouTubeEmbedUrl(youtube) : null;
  const spotifyEmbedUrl = spotifyUrl ? getSpotifyEmbedUrl(spotifyUrl) : null;
  const twitchEmbedUrl = twitchUrl ? getTwitchEmbedUrl(twitchUrl, typeof window !== 'undefined' ? window.location.hostname : 'localhost') : null;

  // Determine which tabs are available
  const availableTabs = [
    hasYouTube && { key: 'youtube', label: 'YouTube', icon: Youtube },
    hasPodcast && { key: 'podcast', label: 'Podcast', icon: Headphones },
    hasSpotify && { key: 'spotify', label: 'Spotify', icon: Music },
    hasTwitch && { key: 'twitch', label: 'Twitch', icon: Twitch },
  ].filter(Boolean) as Array<{ key: string; label: string; icon: React.ComponentType<{ className?: string }> }>;

  if (availableTabs.length === 0) {
    return null;
  }

  return (
    <Card className={cn(
      'border-white/10 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40',
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Featured Content</CardTitle>
        <span className="px-2 py-1 text-xs rounded-full bg-white/5 text-muted-foreground">
          Media
        </span>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={availableTabs[0].key}>
          <TabsList className={cn(
            'grid w-full bg-white/[0.03]',
            `grid-cols-${Math.min(availableTabs.length, 4)}`
          )}>
            {availableTabs.map(({ key, label, icon: Icon }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="gap-2 data-[state=active]:bg-white/10"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* YouTube Tab */}
          {hasYouTube && (
            <TabsContent value="youtube" className="mt-4 space-y-4">
              {/* Channel Info */}
              {youtube.channelTitle && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {youtube.thumbnailUrl && (
                      <img
                        src={youtube.thumbnailUrl}
                        alt={youtube.channelTitle}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-white">{youtube.channelTitle || youtube.channelName}</h3>
                      {youtube.subscriberCount && (
                        <p className="text-xs text-muted-foreground">
                          {youtube.subscriberCountFormatted || youtube.subscriberCount} subscribers
                        </p>
                      )}
                    </div>
                  </div>
                  {youtube.channelUrl && (
                    <a
                      href={sanitizeExternalUrl(youtube.channelUrl) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm" className="gap-2 text-red-400 hover:text-red-300">
                        <ExternalLink className="h-3 w-3" />
                        View Channel
                      </Button>
                    </a>
                  )}
                </div>
              )}

              {/* Video Grid or Single Embed */}
              {youtube.recentVideos && youtube.recentVideos.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {youtube.recentVideos.slice(0, 4).map((video, index) => (
                    <VideoCard
                      key={video.videoId}
                      videoId={video.videoId}
                      title={video.title}
                      thumbnail={video.thumbnail}
                      publishedAt={video.publishedAt}
                      viewCount={video.viewCount}
                      isFirst={index === 0}
                    />
                  ))}
                </div>
              ) : youtubeEmbedUrl ? (
                <EmbedFrame src={youtubeEmbedUrl} title="YouTube" />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Youtube className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No videos available</p>
                  {youtube.channelUrl && (
                    <a
                      href={sanitizeExternalUrl(youtube.channelUrl) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline text-sm mt-2 inline-block"
                    >
                      Visit Channel
                    </a>
                  )}
                </div>
              )}
            </TabsContent>
          )}

          {/* Podcast Tab */}
          {hasPodcast && podcast && (
            <TabsContent value="podcast" className="mt-4">
              <div className="flex flex-col sm:flex-row items-start gap-6 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                {podcast.imageUrl && (
                  <img
                    src={podcast.imageUrl}
                    alt={podcast.name || 'Podcast'}
                    className="w-24 h-24 rounded-xl object-cover mx-auto sm:mx-0"
                  />
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-white">{podcast.name}</h3>
                  {podcast.episodeCount && (
                    <p className="text-sm text-green-400 mt-1">
                      {podcast.episodeCount} episodes
                    </p>
                  )}
                  {podcast.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {podcast.description}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                    {(podcast.url || podcast.podcastUrl) && (
                      <a
                        href={sanitizeExternalUrl(podcast.url || podcast.podcastUrl!) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="gap-2 bg-green-600 hover:bg-green-500 rounded-full">
                          <Headphones className="h-4 w-4" />
                          Listen Now
                        </Button>
                      </a>
                    )}
                    {podcast.rssUrl && (
                      <a
                        href={sanitizeExternalUrl(podcast.rssUrl) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="rounded-full border-white/20">
                          RSS Feed
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Spotify Tab */}
          {hasSpotify && spotifyEmbedUrl && (
            <TabsContent value="spotify" className="mt-4">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                <AspectRatio ratio={16 / 6}>
                  <iframe
                    src={spotifyEmbedUrl}
                    title="Spotify"
                    className="h-full w-full"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </AspectRatio>
              </div>
            </TabsContent>
          )}

          {/* Twitch Tab */}
          {hasTwitch && twitchEmbedUrl && (
            <TabsContent value="twitch" className="mt-4 space-y-2">
              <EmbedFrame src={twitchEmbedUrl} title="Twitch" />
              <p className="text-xs text-muted-foreground">
                Stream may not be live. Visit Twitch for full experience.
              </p>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default CreatorEmbeds;
