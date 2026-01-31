// components/creator/CreatorStats.tsx
// Statistics display component with modern AI-clean styling
// Shows YouTube subscribers, podcast episodes, books, etc.

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Creator } from '@/lib/types/creator';
import {
  Youtube,
  Headphones,
  Book,
  GraduationCap,
  Users,
  Eye,
  Play,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export interface CreatorStatsProps {
  creator: Creator;
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatNumber(num: number | string | undefined): string {
  if (!num) return '0';
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return '0';

  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }
  return n.toLocaleString();
}

function parseSubscriberCount(count: string | number | undefined): number {
  if (!count) return 0;
  if (typeof count === 'number') return count;

  // Handle formatted strings like "1.2M" or "500K"
  const match = count.match(/^([\d.]+)\s*([KMB])?$/i);
  if (match) {
    const num = parseFloat(match[1]);
    const suffix = (match[2] || '').toUpperCase();
    switch (suffix) {
      case 'K':
        return num * 1000;
      case 'M':
        return num * 1000000;
      case 'B':
        return num * 1000000000;
      default:
        return num;
    }
  }

  return parseInt(count, 10) || 0;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CreatorStats({ creator, className }: CreatorStatsProps) {
  const stats: StatItem[] = [];

  // YouTube subscribers
  const youtubeSubCount = creator.content?.youtube?.subscriberCount ||
    creator.content?.youtube?.subscriberCountFormatted ||
    creator.stats?.youtubeSubscribers;

  if (youtubeSubCount) {
    const numericCount = parseSubscriberCount(youtubeSubCount);
    stats.push({
      label: 'Subscribers',
      value: formatNumber(numericCount),
      icon: Youtube,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    });
  }

  // Video count
  const videoCount = creator.content?.youtube?.videoCount;
  if (videoCount) {
    stats.push({
      label: 'Videos',
      value: formatNumber(videoCount),
      icon: Play,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    });
  }

  // Podcast episodes
  const episodeCount = creator.content?.podcast?.episodeCount ||
    creator.stats?.podcastEpisodes;
  if (episodeCount) {
    stats.push({
      label: 'Episodes',
      value: formatNumber(episodeCount),
      icon: Headphones,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    });
  }

  // Books
  const booksCount = creator.content?.books?.length ||
    creator.stats?.booksPublished;
  if (booksCount) {
    stats.push({
      label: 'Books',
      value: formatNumber(booksCount),
      icon: Book,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    });
  }

  // Courses
  const coursesCount = creator.content?.courses?.length;
  if (coursesCount) {
    stats.push({
      label: 'Courses',
      value: formatNumber(coursesCount),
      icon: GraduationCap,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    });
  }

  // Followers (if available)
  const followerCount = creator.stats?.followerCount;
  if (followerCount && followerCount > 0) {
    stats.push({
      label: 'Followers',
      value: formatNumber(followerCount),
      icon: Users,
      color: 'text-teal',
      bgColor: 'bg-teal/10',
    });
  }

  // Total views (if available)
  const viewCount = creator.stats?.viewCount ||
    (creator.content?.youtube?.viewCount ? parseInt(creator.content.youtube.viewCount, 10) : 0);
  if (viewCount && viewCount > 0) {
    stats.push({
      label: 'Total Views',
      value: formatNumber(viewCount),
      icon: Eye,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    });
  }

  if (stats.length === 0) {
    return null;
  }

  return (
    <Card className={cn(
      'border-white/10 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40',
      className
    )}>
      <CardContent className="p-4">
        <div className={cn(
          'grid gap-4',
          stats.length === 1 && 'grid-cols-1',
          stats.length === 2 && 'grid-cols-2',
          stats.length === 3 && 'grid-cols-3',
          stats.length >= 4 && 'grid-cols-2 sm:grid-cols-4'
        )}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                  stat.bgColor
                )}>
                  <Icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatorStats;
