// src/lib/api-providers/deezer.ts
// Deezer API Provider
// FREE, NO AUTH REQUIRED - Fetches podcasts, episodes, and audio content

const DEEZER_API_BASE = 'https://api.deezer.com';

export interface DeezerPodcastData {
  found: boolean;
  podcastId: number | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  link: string | null;
  fans: number | null;
  episodeCount: number | null;
}

export interface DeezerEpisodeData {
  episodeId: number;
  title: string;
  description: string;
  releaseDate: string;
  duration: number; // seconds
  durationFormatted: string;
  imageUrl: string | null;
  link: string;
}

export interface DeezerArtistData {
  found: boolean;
  artistId: number | null;
  name: string | null;
  imageUrl: string | null;
  link: string | null;
  fans: number | null;
  albums: number | null;
}

export class DeezerProvider {

  // Search for podcasts by name
  async searchPodcast(query: string): Promise<DeezerPodcastData | null> {
    try {
      const url = `${DEEZER_API_BASE}/search/podcast?q=${encodeURIComponent(query)}&limit=10`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        return { 
          found: false, 
          podcastId: null, 
          title: null, 
          description: null, 
          imageUrl: null, 
          link: null, 
          fans: null,
          episodeCount: null 
        };
      }

      // Find best match
      const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
      let bestMatch = data.data[0];

      for (const podcast of data.data) {
        const podcastTitle = (podcast.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const podcastDesc = (podcast.description || '').toLowerCase();
        
        if (podcastTitle.includes(normalizedQuery) || 
            normalizedQuery.includes(podcastTitle) ||
            podcastDesc.includes(query.toLowerCase())) {
          bestMatch = podcast;
          break;
        }
      }

      return this.formatPodcastData(bestMatch);
    } catch (error) {
      console.error('Deezer podcast search error:', error);
      return null;
    }
  }

  // Search podcasts by person name (finds shows they host or are featured in)
  async searchPodcastsByPerson(personName: string): Promise<DeezerPodcastData[]> {
    try {
      const url = `${DEEZER_API_BASE}/search/podcast?q=${encodeURIComponent(personName)}&limit=15`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!data.data) return [];

      // Filter to podcasts that seem related to the person
      const normalizedName = personName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      return data.data
        .filter((podcast: any) => {
          const title = (podcast.title || '').toLowerCase();
          const description = (podcast.description || '').toLowerCase();
          
          return title.includes(personName.toLowerCase()) ||
                 description.includes(personName.toLowerCase()) ||
                 title.includes(normalizedName);
        })
        .map((podcast: any) => this.formatPodcastData(podcast));
    } catch (error) {
      console.error('Deezer person search error:', error);
      return [];
    }
  }

  // Get podcast by ID
  async getPodcastById(podcastId: number): Promise<DeezerPodcastData | null> {
    try {
      const url = `${DEEZER_API_BASE}/podcast/${podcastId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        return { 
          found: false, 
          podcastId, 
          title: null, 
          description: null, 
          imageUrl: null, 
          link: null, 
          fans: null,
          episodeCount: null 
        };
      }

      const podcast = await response.json();
      
      if (podcast.error) {
        return { 
          found: false, 
          podcastId, 
          title: null, 
          description: null, 
          imageUrl: null, 
          link: null, 
          fans: null,
          episodeCount: null 
        };
      }

      return this.formatPodcastData(podcast);
    } catch (error) {
      console.error('Deezer podcast fetch error:', error);
      return null;
    }
  }

  // Get podcast episodes
  async getPodcastEpisodes(podcastId: number, limit = 10): Promise<DeezerEpisodeData[]> {
    try {
      const url = `${DEEZER_API_BASE}/podcast/${podcastId}/episodes?limit=${limit}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!data.data) return [];

      return data.data.map((episode: any) => ({
        episodeId: episode.id,
        title: episode.title,
        description: episode.description?.substring(0, 300) || '',
        releaseDate: episode.release_date,
        duration: episode.duration,
        durationFormatted: this.formatDuration(episode.duration),
        imageUrl: episode.picture_medium || episode.picture || null,
        link: episode.link || `https://www.deezer.com/episode/${episode.id}`,
      }));
    } catch (error) {
      console.error('Deezer episodes fetch error:', error);
      return [];
    }
  }

  // Search for an artist (for audiobooks/spoken word)
  async searchArtist(query: string): Promise<DeezerArtistData | null> {
    try {
      const url = `${DEEZER_API_BASE}/search/artist?q=${encodeURIComponent(query)}&limit=5`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        return { 
          found: false, 
          artistId: null, 
          name: null, 
          imageUrl: null, 
          link: null, 
          fans: null, 
          albums: null 
        };
      }

      // Find best match
      const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
      let bestMatch = data.data[0];

      for (const artist of data.data) {
        const artistName = (artist.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (artistName === normalizedQuery || artistName.includes(normalizedQuery)) {
          bestMatch = artist;
          break;
        }
      }

      return {
        found: true,
        artistId: bestMatch.id,
        name: bestMatch.name,
        imageUrl: bestMatch.picture_medium || bestMatch.picture || null,
        link: bestMatch.link,
        fans: bestMatch.nb_fan || null,
        albums: bestMatch.nb_album || null,
      };
    } catch (error) {
      console.error('Deezer artist search error:', error);
      return null;
    }
  }

  // Search for audiobooks/spoken word content
  async searchAudioContent(query: string): Promise<any[]> {
    try {
      // Search in the "spoken word" category
      const url = `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query + ' spoken word audiobook')}&limit=10`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!data.data) return [];

      return data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        artist: item.artist?.name,
        album: item.album?.title,
        duration: item.duration,
        durationFormatted: this.formatDuration(item.duration),
        imageUrl: item.album?.cover_medium || null,
        link: item.link,
        preview: item.preview, // 30-second preview URL
      }));
    } catch (error) {
      console.error('Deezer audio search error:', error);
      return [];
    }
  }

  // Get radio/podcast recommendations based on a genre
  async getIslamicContent(): Promise<DeezerPodcastData[]> {
    try {
      // Search for Islamic/Muslim content
      const searches = ['islamic', 'muslim', 'quran', 'islam'];
      const allResults: DeezerPodcastData[] = [];

      for (const term of searches) {
        const url = `${DEEZER_API_BASE}/search/podcast?q=${term}&limit=5`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.data) {
          allResults.push(...data.data.map((p: any) => this.formatPodcastData(p)));
        }
      }

      // Remove duplicates by ID
      const seen = new Set<number>();
      return allResults.filter(podcast => {
        if (podcast.podcastId && seen.has(podcast.podcastId)) return false;
        if (podcast.podcastId) seen.add(podcast.podcastId);
        return true;
      });
    } catch (error) {
      console.error('Deezer Islamic content error:', error);
      return [];
    }
  }

  // Format podcast data
  private formatPodcastData(podcast: any): DeezerPodcastData {
    return {
      found: true,
      podcastId: podcast.id,
      title: podcast.title,
      description: podcast.description?.substring(0, 500) || null,
      imageUrl: podcast.picture_medium || podcast.picture_big || podcast.picture || null,
      link: podcast.link || `https://www.deezer.com/podcast/${podcast.id}`,
      fans: podcast.fans || null,
      episodeCount: podcast.nb_episode || null,
    };
  }

  // Helper: Format duration from seconds
  private formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

// Also try Muslim Central RSS as fallback for Islamic podcasts
export async function tryMuslimCentralPodcast(name: string): Promise<{
  found: boolean;
  url: string | null;
  rssUrl: string | null;
  name: string | null;
} | null> {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  const rssUrl = `https://feeds.muslimcentral.com/${slug}`;

  try {
    const response = await fetch(rssUrl, {
      method: 'HEAD',
    });

    if (response.ok) {
      return {
        found: true,
        url: `https://muslimcentral.com/audio/${slug}`,
        rssUrl,
        name: `${name} - Muslim Central`,
      };
    }
  } catch {
    // RSS not found
  }

  return {
    found: false,
    url: null,
    rssUrl: null,
    name: null,
  };
}
