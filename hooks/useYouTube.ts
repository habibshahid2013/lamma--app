import { useState, useEffect } from 'react';
import { getChannelVideos, getChannelInfo, YouTubeVideo, YouTubeChannel } from '@/lib/youtube';

export function useYouTubeChannel(youtubeUrl: string | null | undefined) {
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!youtubeUrl) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [channelData, videosData] = await Promise.all([
          getChannelInfo(youtubeUrl),
          getChannelVideos(youtubeUrl, 10),
        ]);

        setChannel(channelData);
        setVideos(videosData);
      } catch (err) {
        setError('Failed to load YouTube data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [youtubeUrl]);

  return { channel, videos, loading, error };
}
