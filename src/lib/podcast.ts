export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  publishedAt: string;
  thumbnail?: string;
  link?: string;
}

export interface PodcastInfo {
  title: string;
  description: string;
  author: string;
  thumbnail: string;
  episodeCount: number;
}

export async function getPodcastEpisodes(rssUrl: string): Promise<PodcastEpisode[]> {
  try {
    // Use our internal API route to avoid CORS and parse the feed
    const response = await fetch(`/api/podcast?url=${encodeURIComponent(rssUrl)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch podcast');
    }

    const feed = await response.json();
    
    if (!feed.items) return [];

    return feed.items.map((item: any) => ({
      id: item.guid || item.link || item.title,
      title: item.title,
      description: item.contentSnippet || item.content || '',
      audioUrl: item.enclosure?.url || '',
      duration: item.itunes?.duration || '',
      publishedAt: item.isoDate || item.pubDate,
      thumbnail: item.itunes?.image || feed.image?.url,
      link: item.link
    }));
  } catch (error) {
    console.error('Error in getPodcastEpisodes:', error);
    return [];
  }
}
