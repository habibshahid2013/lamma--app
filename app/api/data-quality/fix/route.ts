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
import { verifyAdmin } from '@/lib/admin-auth';
const ALL_ACTIONS = ['refetch_avatar', 'update_subscribers', 'remove_invalid_link', 'generate_bio'];

/**
 * Fetch a short bio from Wikipedia (free, no API key needed).
 * Tries exact name first, then with "Islamic" qualifier.
 * Validates relevance to avoid wrong-person matches.
 */
async function fetchWikipediaBio(name: string): Promise<string | null> {
  // Clean name: remove common prefixes/suffixes for search
  const cleanName = name
    .replace(/^(Sheikh|Shaykh|Shaykha|Ustadh|Ustadha|Ustaz|Ustadz|Maulana|Imam|Mufti|Qari|Dr\.|Br\.|Sr\.)\s+/i, '')
    .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheticals
    .trim();

  // Try searches in order: exact clean name, then with Islamic qualifier
  const queries = [cleanName, `${cleanName} Islamic scholar`];

  for (const searchQuery of queries) {
    try {
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`
      );
      if (!searchRes.ok) continue;
      const searchData = await searchRes.json();
      const results = searchData.query?.search || [];

      for (const result of results.slice(0, 3)) {
        const extractRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(result.title)}&prop=extracts&exintro=true&explaintext=true&exsentences=4&format=json&origin=*`
        );
        if (!extractRes.ok) continue;
        const extractData = await extractRes.json();
        const pages = extractData.query?.pages;
        const page = Object.values(pages)[0] as any;
        const extract = page?.extract;
        if (!extract || extract.length < 50) continue;

        const lowerExtract = extract.toLowerCase();

        // Name matching: split into parts, check for fuzzy matches
        const nameParts = cleanName.toLowerCase()
          .replace(/-/g, ' ').split(/\s+/)
          .filter((p: string) => p.length >= 3);
        const matchedParts = nameParts.filter((part: string) => lowerExtract.includes(part));

        // Require at least one name part to match
        if (matchedParts.length === 0) continue;

        // Islamic/religious keyword check
        const islamicKeywords = ['islam', 'muslim', 'scholar', 'imam', 'sheikh', 'mufti', 'quran', 'mosque', 'preacher', 'dawah', 'cleric', 'theologian', 'reciter', 'hafiz', 'qari', 'ustaz', 'ustadh', 'maulana', 'shaykh', 'sufi', 'jurisprud', 'sunni', 'shia', 'hanafi', 'shafi', 'hanbali', 'maliki', 'hadith', 'fatwa', 'fiqh'];
        const topicMatch = islamicKeywords.some(kw => lowerExtract.includes(kw));

        // Person check
        const personIndicators = ['born', 'was a', 'is a', 'is an', 'known as', 'also known', 'died', 'lived'];
        const isPerson = personIndicators.some(p => lowerExtract.includes(p));

        // Accept if: name matches + (topic match OR person with 2+ name parts)
        if (topicMatch && isPerson && matchedParts.length >= 1) {
          return extract.substring(0, 500).replace(/\n/g, ' ').trim();
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json().catch(() => ({}));
    const actions: string[] = body.actions || ALL_ACTIONS;
    const creatorIds: string[] | undefined = body.creatorIds;
    const overwriteExisting: boolean = body.overwriteExisting || false;

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

    // Special handling for generate_bio: find creators missing bios directly
    if (actions.includes('generate_bio')) {
      let bioCount = 0;
      const batchLimit = body.batchLimit || 70; // Process up to 70 bios per request
      for (const docSnap of snapshot.docs) {
        if (bioCount >= batchLimit) break;
        const creator = { id: docSnap.id, ...docSnap.data() } as Creator;
        if (creatorIds && !creatorIds.includes(creator.id)) continue;

        const hasBio = creator.profile?.bio || creator.profile?.shortBio;
        const bioSource = (creator.profile as any)?.bioSource;
        // Skip if bio exists, unless overwriting Wikipedia-sourced bios
        if (hasBio && !(overwriteExisting && bioSource === 'wikipedia')) continue;

        try {
          const bio = await fetchWikipediaBio(creator.name);
          if (bio) {
            await updateDoc(doc(db, 'creators', docSnap.id), {
              'profile.bio': bio,
              'profile.bioSource': 'wikipedia',
              'profile.bioGeneratedAt': new Date().toISOString(),
            });
            results.fixed++;
            bioCount++;
            results.details.push({
              creatorId: creator.id,
              name: creator.name,
              action: 'generate_bio',
              result: bio.substring(0, 100) + '...',
            });
          } else {
            // If overwriting, clear the bad bio
            if (overwriteExisting && ((creator.profile as any)?.bioSource === 'wikipedia')) {
              await updateDoc(doc(db, 'creators', docSnap.id), {
                'profile.bio': null,
                'profile.bioSource': null,
                'profile.bioGeneratedAt': null,
              });
              results.fixed++;
              results.details.push({
                creatorId: creator.id,
                name: creator.name,
                action: 'generate_bio',
                result: 'Cleared bad Wikipedia bio (no valid match found)',
              });
            } else {
              results.skipped++;
              results.details.push({
                creatorId: creator.id,
                name: creator.name,
                action: 'generate_bio',
                result: 'No Wikipedia article found',
              });
            }
          }
          // Rate limit between API calls
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          results.errors++;
          results.details.push({
            creatorId: creator.id,
            name: creator.name,
            action: 'generate_bio',
            result: `Error: ${String(err)}`,
          });
        }
      }

      // If only generate_bio was requested, return early
      if (actions.length === 1) {
        return NextResponse.json({ timestamp: new Date().toISOString(), ...results });
      }
    }

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
