'use client';

import { useState, useEffect } from 'react';
import { getChannelVideos, searchVideos, formatRelativeTime, YouTubeVideo } from '@/lib/youtube';

interface VideoListProps {
  youtubeUrl?: string | null;
  creatorName?: string;
  maxResults?: number;
  subscriberCount?: string;
}

export function VideoList({ youtubeUrl, creatorName, maxResults = 10, subscriberCount }: VideoListProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let fetchedVideos: YouTubeVideo[] = [];
        
        if (youtubeUrl) {
          // Fetch from their channel
          fetchedVideos = await getChannelVideos(youtubeUrl, maxResults);
        } else if (creatorName) {
          // Search for videos about them
          fetchedVideos = await searchVideos(creatorName, maxResults);
        }
        
        setVideos(fetchedVideos);
      } catch (err) {
        setError('Failed to load videos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [youtubeUrl, creatorName, maxResults]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-40 h-24 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No videos found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriberCount && (
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            YouTube Channel
          </span>
          <span>{subscriberCount} Subscribers</span>
        </div>
      )}
      {videos.map((video) => (
        <a
          key={video.id}
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-4 group hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
        >
          {/* Thumbnail */}
          <div className="relative w-40 h-24 flex-shrink-0">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover rounded-lg"
            />
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
              {video.duration}
            </span>
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
              {video.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {video.viewCount} views • {formatRelativeTime(video.publishedAt)}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
