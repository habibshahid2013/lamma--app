'use client';

import { useState, useEffect } from 'react';
import { getPodcastEpisodes, PodcastEpisode } from '@/lib/podcast';
import { Button } from '@/components/ui/button';
import { PlayCircle, ExternalLink, Calendar, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/youtube'; // Reuse existing helper

interface PodcastListProps {
  podcastUrl?: string | null;
  creatorName?: string;
}

export function PodcastList({ podcastUrl, creatorName }: PodcastListProps) {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!podcastUrl) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const data = await getPodcastEpisodes(podcastUrl);
        setEpisodes(data);
      } catch (err) {
        setError('Failed to load episodes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [podcastUrl]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse bg-gray-50 p-4 rounded-xl">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!podcastUrl) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
          <PlayCircle className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="font-medium text-gray-900">No podcast linked</h3>
        <p className="text-sm text-gray-500 mt-1">
          {creatorName ? `${creatorName} hasn't linked a podcast yet.` : "This creator hasn't linked a podcast yet."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No episodes found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {episodes.map((episode) => (
        <div 
          key={episode.id}
          className="group bg-white border border-gray-100 hover:border-teal/30 hover:shadow-sm rounded-xl p-4 transition-all"
        >
          <div className="flex gap-4 items-start">
            {/* Thumbnail */}
            <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden group-hover:ring-2 ring-teal/20 transition-all">
              {episode.thumbnail ? (
                <img
                  src={episode.thumbnail}
                  alt={episode.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-teal/10">
                   <PlayCircle className="w-8 h-8 text-teal" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-teal transition-colors text-sm mb-1">
                {episode.title}
              </h3>
              
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatRelativeTime(episode.publishedAt)}
                </span>
                {episode.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {episode.duration}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                   size="sm" 
                   className="h-8 text-xs bg-teal hover:bg-teal-deep text-white rounded-full px-4"
                   onClick={() => window.open(episode.audioUrl || episode.link, '_blank')}
                >
                  <PlayCircle className="w-3 h-3 mr-1.5" />
                  Listen
                </Button>
                
                {episode.link && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full border-gray-200 text-gray-500 hover:text-teal hover:border-teal"
                        onClick={() => window.open(episode.link, '_blank')}
                    >
                        <ExternalLink className="w-3 h-3" />
                    </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
