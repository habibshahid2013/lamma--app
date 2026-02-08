/**
 * POST /api/data-quality/enrich-multi
 * Multi-source enrichment: books, podcasts, knowledge graph, social links, news, YouTube mentions
 *
 * Body: {
 *   sources?: ('books' | 'podcast' | 'knowledge_graph' | 'social_links' | 'news' | 'youtube_mentions' | 'all')[],
 *   creatorIds?: string[],
 *   batchLimit?: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Creator } from '@/lib/types/creator';
import { searchBooksByAuthor } from '@/lib/enrichment/google-books';
import { searchPodcastsByName } from '@/lib/enrichment/itunes-podcast';
import { searchKnowledgeGraph } from '@/lib/enrichment/knowledge-graph';
import { discoverSocialLinks } from '@/lib/enrichment/social-links';
import { searchNews } from '@/lib/enrichment/newsapi';
import { searchYouTubeMentions } from '@/lib/enrichment/youtube-mentions';
import { verifyAdmin } from '@/lib/admin-auth';

const ALL_SOURCES = ['books', 'podcast', 'knowledge_graph', 'social_links', 'news', 'youtube_mentions'] as const;

interface EnrichDetail {
  creatorId: string;
  name: string;
  source: string;
  status: string;
  data?: string;
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdmin(request);
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json().catch(() => ({}));
    const sources: string[] = body.sources?.includes('all')
      ? [...ALL_SOURCES]
      : (body.sources || [...ALL_SOURCES]);
    const creatorIds: string[] | undefined = body.creatorIds;
    const batchLimit: number = body.batchLimit || 50;

    const snapshot = await getDocs(collection(db, 'creators'));
    if (snapshot.size === 0) {
      return NextResponse.json({ error: 'No creators found' }, { status: 404 });
    }

    const results = {
      enriched: 0,
      skipped: 0,
      errors: 0,
      details: [] as EnrichDetail[],
      sourceBreakdown: { books: 0, podcast: 0, knowledge_graph: 0, social_links: 0, news: 0, youtube_mentions: 0 },
    };

    let processed = 0;

    for (const docSnap of snapshot.docs) {
      if (processed >= batchLimit) break;

      const creator = { id: docSnap.id, ...docSnap.data() } as Creator;
      if (creatorIds && !creatorIds.includes(creator.id)) continue;

      const updates: Record<string, unknown> = {};
      let enrichedSomething = false;

      // ================================================================
      // GOOGLE BOOKS: Find books by author
      // ================================================================
      if (sources.includes('books')) {
        const existingBooks = creator.content?.books || [];
        if (existingBooks.length === 0) {
          try {
            const books = await searchBooksByAuthor(creator.name);
            if (books.length > 0) {
              updates['content.books'] = books;
              updates['stats.booksPublished'] = books.length;
              enrichedSomething = true;
              results.sourceBreakdown.books++;
              results.details.push({
                creatorId: creator.id,
                name: creator.name,
                source: 'books',
                status: 'enriched',
                data: `Found ${books.length} books: ${books.map(b => b.title).join(', ').substring(0, 100)}`,
              });
            }
            await delay(200);
          } catch (err) {
            results.details.push({
              creatorId: creator.id,
              name: creator.name,
              source: 'books',
              status: `error: ${String(err)}`,
            });
          }
        }
      }

      // ================================================================
      // ITUNES PODCAST: Find podcasts
      // ================================================================
      if (sources.includes('podcast')) {
        const existingPodcast = creator.content?.podcast;
        const hasRealPodcast = existingPodcast?.podcastId || existingPodcast?.rssUrl;
        if (!hasRealPodcast) {
          try {
            const podcasts = await searchPodcastsByName(creator.name);
            if (podcasts.length > 0) {
              // Use the first (most relevant) match
              updates['content.podcast'] = podcasts[0];
              updates['stats.podcastEpisodes'] = podcasts[0].episodeCount;
              enrichedSomething = true;
              results.sourceBreakdown.podcast++;
              results.details.push({
                creatorId: creator.id,
                name: creator.name,
                source: 'podcast',
                status: 'enriched',
                data: `Found: "${podcasts[0].name}" (${podcasts[0].episodeCount} episodes)`,
              });
            }
            await delay(3100); // iTunes rate limit: ~20/min
          } catch (err) {
            results.details.push({
              creatorId: creator.id,
              name: creator.name,
              source: 'podcast',
              status: `error: ${String(err)}`,
            });
          }
        }
      }

      // ================================================================
      // KNOWLEDGE GRAPH: Get entity data (bio, image, website)
      // ================================================================
      if (sources.includes('knowledge_graph')) {
        const hasBio = creator.profile?.bio;
        const hasAvatar = creator.profile?.avatar && !creator.profile.avatar.includes('ui-avatars');
        if (!hasBio || !hasAvatar) {
          try {
            const entity = await searchKnowledgeGraph(creator.name);
            if (entity) {
              if (!hasBio && entity.detailedDescription) {
                updates['profile.bio'] = entity.detailedDescription;
                updates['profile.bioSource'] = 'knowledge_graph';
              }
              if (!hasBio && !entity.detailedDescription && entity.description) {
                updates['profile.shortBio'] = entity.description;
              }
              if (!hasAvatar && entity.imageUrl) {
                updates['profile.avatar'] = entity.imageUrl;
                updates['profile.avatarSource'] = 'knowledge_graph';
              }
              if (entity.url && !creator.socialLinks?.website) {
                updates['socialLinks.website'] = entity.url;
              }
              if (Object.keys(updates).some(k => k.startsWith('profile.'))) {
                enrichedSomething = true;
                results.sourceBreakdown.knowledge_graph++;
                results.details.push({
                  creatorId: creator.id,
                  name: creator.name,
                  source: 'knowledge_graph',
                  status: 'enriched',
                  data: `Entity: "${entity.name}" — ${entity.description || 'no description'}`,
                });
              }
            }
            await delay(100); // KG is very generous, minimal delay
          } catch (err) {
            results.details.push({
              creatorId: creator.id,
              name: creator.name,
              source: 'knowledge_graph',
              status: `error: ${String(err)}`,
            });
          }
        }
      }

      // ================================================================
      // SOCIAL LINKS: Discover from YouTube desc + Wikidata
      // ================================================================
      if (sources.includes('social_links')) {
        const existingLinks = creator.socialLinks || {};
        const missingLinks = ['twitter', 'instagram', 'facebook', 'tiktok', 'linkedin'].filter(
          k => !existingLinks[k as keyof typeof existingLinks]
        );

        if (missingLinks.length > 0) {
          try {
            const ytDesc = creator.content?.youtube?.description || '';
            const { links: discovered, sources: linkSources } = await discoverSocialLinks(
              creator.name,
              ytDesc,
              existingLinks as Record<string, string | undefined>,
            );

            let foundCount = 0;
            const foundPlatforms: string[] = [];

            for (const [key, value] of Object.entries(discovered)) {
              if (key === 'source' || !value) continue;
              if (!existingLinks[key as keyof typeof existingLinks]) {
                updates[`socialLinks.${key}`] = value;
                foundCount++;
                foundPlatforms.push(key);
              }
            }

            if (foundCount > 0) {
              enrichedSomething = true;
              results.sourceBreakdown.social_links++;
              results.details.push({
                creatorId: creator.id,
                name: creator.name,
                source: 'social_links',
                status: 'enriched',
                data: `Found ${foundCount} links (${foundPlatforms.join(', ')}) via ${linkSources.join('+')}`,
              });
            }
            await delay(500); // Wikidata courtesy delay
          } catch (err) {
            results.details.push({
              creatorId: creator.id,
              name: creator.name,
              source: 'social_links',
              status: `error: ${String(err)}`,
            });
          }
        }
      }

      // ================================================================
      // NEWS ARTICLES: Find articles about the creator
      // ================================================================
      if (sources.includes('news')) {
        const existingNews = creator.content?.news || [];
        if (existingNews.length === 0) {
          try {
            const articles = await searchNews(creator.name);
            if (articles.length > 0) {
              updates['content.news'] = articles;
              enrichedSomething = true;
              results.sourceBreakdown.news++;
              results.details.push({
                creatorId: creator.id,
                name: creator.name,
                source: 'news',
                status: 'enriched',
                data: `Found ${articles.length} articles: ${articles.map(a => a.source).join(', ')}`,
              });
            }
            await delay(200);
          } catch (err) {
            results.details.push({
              creatorId: creator.id,
              name: creator.name,
              source: 'news',
              status: `error: ${String(err)}`,
            });
          }
        }
      }

      // ================================================================
      // YOUTUBE MENTIONS: Find videos about the creator by others
      // ================================================================
      if (sources.includes('youtube_mentions')) {
        const existingMentions = creator.content?.mentions || [];
        if (existingMentions.length === 0 && !creator.isHistorical) {
          try {
            const mentions = await searchYouTubeMentions(
              creator.name,
              creator.content?.youtube?.channelId,
            );
            if (mentions.length > 0) {
              updates['content.mentions'] = mentions;
              enrichedSomething = true;
              results.sourceBreakdown.youtube_mentions++;
              results.details.push({
                creatorId: creator.id,
                name: creator.name,
                source: 'youtube_mentions',
                status: 'enriched',
                data: `Found ${mentions.length} mention videos by ${[...new Set(mentions.map(m => m.channelTitle))].slice(0, 3).join(', ')}`,
              });
            }
            await delay(1500); // Quota preservation — 100 units per search
          } catch (err) {
            results.details.push({
              creatorId: creator.id,
              name: creator.name,
              source: 'youtube_mentions',
              status: `error: ${String(err)}`,
            });
          }
        }
      }

      // ================================================================
      // APPLY UPDATES
      // ================================================================
      if (enrichedSomething && Object.keys(updates).length > 0) {
        updates['dataSource.aggregatedAt'] = new Date().toISOString();
        try {
          await updateDoc(doc(db, 'creators', docSnap.id), updates);
          results.enriched++;
        } catch (err) {
          results.errors++;
          results.details.push({
            creatorId: creator.id,
            name: creator.name,
            source: 'firestore_update',
            status: `error: ${String(err)}`,
          });
        }
      } else {
        results.skipped++;
      }

      processed++;
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      sourcesRequested: sources,
      creatorsProcessed: processed,
      ...results,
    });
  } catch (error) {
    console.error('Multi-source enrichment error:', error);
    return NextResponse.json(
      { error: 'Failed to run enrichment', details: String(error) },
      { status: 500 }
    );
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
