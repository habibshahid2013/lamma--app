/**
 * POST /api/data-quality/fix
 * Auto-fix data quality issues for creators
 *
 * Body: { actions?: string[], creatorIds?: string[] }
 * - actions: which fix types to run (default: all)
 *   - 'refetch_avatar' — re-fetch broken/missing avatars
 *   - 'update_subscribers' — update YouTube subscriber counts
 *   - 'remove_invalid_link' — remove social links that fail validation
 * - creatorIds: limit to specific creators (default: all)
 */

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Creator } from '@/lib/types/creator';
import { auditCreator } from '@/lib/data-quality';
import { fetchCreatorImage } from '@/lib/image-fetcher';
import { getChannelInfo, extractChannelId } from '@/lib/youtube';

const ALL_ACTIONS = ['refetch_avatar', 'update_subscribers', 'remove_invalid_link'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const actions: string[] = body.actions || ALL_ACTIONS;
    const creatorIds: string[] | undefined = body.creatorIds;

    // Get all creators from Firestore
    const snapshot = await getDocs(collection(db, 'creators'));
    if (snapshot.size === 0) {
      return NextResponse.json({ error: 'No creators found in Firestore' }, { status: 404 });
    }

    const results: {
      fixed: number;
      skipped: number;
      errors: number;
      details: Array<{ creatorId: string; name: string; action: string; result: string }>;
    } = { fixed: 0, skipped: 0, errors: 0, details: [] };

    for (const docSnap of snapshot.docs) {
      const creator = { id: docSnap.id, ...docSnap.data() } as Creator;

      // Filter by creatorIds if specified
      if (creatorIds && !creatorIds.includes(creator.id)) continue;

      const audit = auditCreator(creator);
      const fixableIssues = audit.issues.filter(
        i => i.autoFixable && i.fixAction && actions.includes(i.fixAction)
      );

      if (fixableIssues.length === 0) {
        results.skipped++;
        continue;
      }

      for (const issue of fixableIssues) {
        try {
          switch (issue.fixAction) {
            case 'refetch_avatar': {
              const name = creator.profile?.name || creator.name;
              const ytChannelId = creator.content?.youtube?.channelId;
              const image = await fetchCreatorImage(name, ytChannelId);
              if (image) {
                await updateDoc(doc(db, 'creators', docSnap.id), {
                  'profile.avatar': image.url,
                  'profile.avatarSource': image.source,
                  'profile.avatarUpdatedAt': new Date().toISOString(),
                });
                results.fixed++;
                results.details.push({
                  creatorId: creator.id,
                  name: creator.name,
                  action: 'refetch_avatar',
                  result: `Updated avatar from ${image.source}: ${image.url.substring(0, 80)}...`,
                });
              } else {
                results.skipped++;
                results.details.push({
                  creatorId: creator.id,
                  name: creator.name,
                  action: 'refetch_avatar',
                  result: 'No image found from any source',
                });
              }
              break;
            }

            case 'update_subscribers': {
              const ytUrl = creator.socialLinks?.youtube;
              if (!ytUrl) break;

              const channelInfo = await getChannelInfo(ytUrl);
              if (channelInfo) {
                const updates: Record<string, unknown> = {
                  'content.youtube.subscriberCount': channelInfo.subscriberCount,
                  'content.youtube.channelId': channelInfo.id,
                  'content.youtube.channelTitle': channelInfo.title,
                  'content.youtube.videoCount': channelInfo.videoCount,
                  'content.youtube.thumbnailUrl': channelInfo.thumbnail,
                  'stats.youtubeSubscribers': channelInfo.subscriberCount,
                };
                await updateDoc(doc(db, 'creators', docSnap.id), updates);
                results.fixed++;
                results.details.push({
                  creatorId: creator.id,
                  name: creator.name,
                  action: 'update_subscribers',
                  result: `Updated: ${channelInfo.subscriberCount} subscribers, ${channelInfo.videoCount} videos`,
                });
              }
              break;
            }

            case 'remove_invalid_link': {
              // Remove the specific invalid link
              const field = issue.field; // e.g. 'socialLinks.twitter'
              await updateDoc(doc(db, 'creators', docSnap.id), {
                [field]: null,
              });
              results.fixed++;
              results.details.push({
                creatorId: creator.id,
                name: creator.name,
                action: 'remove_invalid_link',
                result: `Removed invalid link at ${field}`,
              });
              break;
            }

            case 'resolve_youtube_channel': {
              const ytUrl = creator.socialLinks?.youtube;
              if (!ytUrl) break;

              const extracted = extractChannelId(ytUrl);
              if (extracted) {
                const channelInfo = await getChannelInfo(ytUrl);
                if (channelInfo) {
                  await updateDoc(doc(db, 'creators', docSnap.id), {
                    'content.youtube.channelId': channelInfo.id,
                    'content.youtube.channelTitle': channelInfo.title,
                    'content.youtube.description': channelInfo.description?.substring(0, 500),
                    'content.youtube.subscriberCount': channelInfo.subscriberCount,
                    'content.youtube.videoCount': channelInfo.videoCount,
                    'content.youtube.thumbnailUrl': channelInfo.thumbnail,
                  });
                  results.fixed++;
                  results.details.push({
                    creatorId: creator.id,
                    name: creator.name,
                    action: 'resolve_youtube_channel',
                    result: `Resolved channelId: ${channelInfo.id} (${channelInfo.title})`,
                  });
                }
              }
              break;
            }
          }

          // Rate limit between API calls
          await new Promise(resolve => setTimeout(resolve, 300));

        } catch (err) {
          results.errors++;
          results.details.push({
            creatorId: creator.id,
            name: creator.name,
            action: issue.fixAction || 'unknown',
            result: `Error: ${String(err)}`,
          });
        }
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error) {
    console.error('Fix error:', error);
    return NextResponse.json(
      { error: 'Failed to run fixes', details: String(error) },
      { status: 500 }
    );
  }
}
