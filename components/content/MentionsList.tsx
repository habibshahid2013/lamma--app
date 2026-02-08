'use client';

import type { MentionVideo } from '@/lib/types/creator';
import ExternalLink from '@/components/ui/ExternalLink';
import { Users } from 'lucide-react';

interface MentionsListProps {
  videos: MentionVideo[];
  creatorName: string;
}

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  return `${views} views`;
}

export default function MentionsList({ videos, creatorName }: MentionsListProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>No mention videos found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Mentions</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Videos about {creatorName} by other channels
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {videos.map((video) => (
          <ExternalLink
            key={video.videoId}
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
            </div>
            <h3 className="font-medium line-clamp-2 group-hover:text-primary transition text-sm">
              {video.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">{video.channelTitle}</span>
              {video.viewCount != null && (
                <>
                  <span>-</span>
                  <span>{formatViews(video.viewCount)}</span>
                </>
              )}
              {video.publishedAt && (
                <>
                  <span>-</span>
                  <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </ExternalLink>
        ))}
      </div>
    </div>
  );
}
