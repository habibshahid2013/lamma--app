// src/lib/api-providers/index.ts
// Multi-API Profile Engine - Aggregates data from multiple authoritative sources

export { YouTubeProvider, type YouTubeChannelData, type YouTubeVideoData } from './youtube';
export { DeezerProvider, type DeezerPodcastData, type DeezerEpisodeData, tryMuslimCentralPodcast } from './deezer';
export { GoogleBooksProvider, type BookData } from './google-books';
export { KnowledgeGraphProvider, type KnowledgeGraphData } from './knowledge-graph';
export { WikipediaProvider, type WikipediaData } from './wikipedia';
export { ProfileAggregator, type AggregatedProfile } from './aggregator';
