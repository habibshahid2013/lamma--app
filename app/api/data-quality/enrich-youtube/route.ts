/**
 * POST /api/data-quality/enrich-youtube
 * Enriches creators with YouTube data (videos, playlists, categories)
 *
 * Body: { creatorIds?: string[] }
 * - creatorIds: limit to specific creators (default: all with YouTube links)
 */

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Creator } from '@/lib/types/creator';
import { enrichYouTubeChannel, resolveChannelId } from '@/lib/youtube-enrichment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const creatorIds: string[] | undefined = body.creatorIds;

    // Get all creators from Firestore
    const snapshot = await getDocs(collection(db, 'creators'));
    if (snapshot.size === 0) {
      return NextResponse.json({ error: 'No creators found in Firestore' }, { status: 404 });
    }

    const results = {
      enriched: 0,
      skipped: 0,
      noYoutube: 0,
      errors: 0,
      details: [] as Array<{
        creatorId: string;
        name: string;
        status: string;
        channelId?: string;
        subscriberCount?: string;
        recentVideoCount?: number;
        popularVideoCount?: number;
        playlistCount?: number;
        categories?: string[];
      }>,
    };

    for (const docSnap of snapshot.docs) {
      const creator = { id: docSnap.id, ...docSnap.data() } as Creator;

      // Filter by creatorIds if specified
      if (creatorIds && !creatorIds.includes(creator.id)) continue;

      // Skip historical figures
      if (creator.isHistorical) {
        results.skipped++;
        continue;
      }

      // Need a YouTube URL or existing channelId
      const youtubeUrl = creator.socialLinks?.youtube;
      const existingChannelId = creator.content?.youtube?.channelId;

      if (!youtubeUrl && !existingChannelId) {
        results.noYoutube++;
        results.details.push({
          creatorId: creator.id,
          name: creator.name,
          status: 'no_youtube_link',
        });
        continue;
      }

      try {
        // Resolve channel ID
        let channelId = existingChannelId;
        if (!channelId && youtubeUrl) {
          channelId = await resolveChannelId(youtubeUrl) || undefined;
        }

        if (!channelId) {
          results.errors++;
          results.details.push({
            creatorId: creator.id,
            name: creator.name,
            status: `failed_to_resolve_channel_from: ${youtubeUrl}`,
          });
          continue;
        }

        // Enrich the channel
        const enrichment = await enrichYouTubeChannel(channelId);
        if (!enrichment) {
          results.errors++;
          results.details.push({
            creatorId: creator.id,
            name: creator.name,
            status: `enrichment_returned_null for channelId: ${channelId}`,
          });
          continue;
        }

        // Save to Firestore
        await updateDoc(doc(db, 'creators', docSnap.id), {
          'content.youtube': {
            channelId: enrichment.channelId,
            channelTitle: enrichment.channelTitle,
            channelUrl: `https://www.youtube.com/channel/${enrichment.channelId}`,
            handle: youtubeUrl?.match(/@([\w.-]+)/)?.[1] || null,
            description: enrichment.description.substring(0, 500),
            subscriberCount: enrichment.subscriberCount,
            subscriberCountRaw: enrichment.subscriberCountRaw,
            videoCount: enrichment.videoCount,
            viewCount: enrichment.viewCount,
            thumbnailUrl: enrichment.thumbnailUrl,
            bannerUrl: enrichment.bannerUrl || null,
            recentVideos: enrichment.recentVideos.map(v => ({
              videoId: v.videoId,
              title: v.title,
              thumbnail: v.thumbnail,
              publishedAt: v.publishedAt,
              viewCount: v.viewCount,
              duration: v.duration,
            })),
            popularVideos: enrichment.popularVideos.map(v => ({
              videoId: v.videoId,
              title: v.title,
              thumbnail: v.thumbnail,
              publishedAt: v.publishedAt,
              viewCount: v.viewCount,
              duration: v.duration,
            })),
            playlists: enrichment.playlists.map(p => ({
              playlistId: p.playlistId,
              title: p.title,
              thumbnail: p.thumbnail,
              itemCount: p.itemCount,
            })),
            derivedCategories: enrichment.derivedCategories,
            enrichedAt: enrichment.enrichedAt,
          },
          'stats.youtubeSubscribers': enrichment.subscriberCount,
        });

        results.enriched++;
        results.details.push({
          creatorId: creator.id,
          name: creator.name,
          status: 'enriched',
          channelId: enrichment.channelId,
          subscriberCount: enrichment.subscriberCount,
          recentVideoCount: enrichment.recentVideos.length,
          popularVideoCount: enrichment.popularVideos.length,
          playlistCount: enrichment.playlists.length,
          categories: enrichment.derivedCategories,
        });

        // Rate limit: YouTube API has quotas
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        results.errors++;
        results.details.push({
          creatorId: creator.id,
          name: creator.name,
          status: `error: ${String(err)}`,
        });
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error) {
    console.error('YouTube enrichment error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich YouTube data', details: String(error) },
      { status: 500 }
    );
  }
}
