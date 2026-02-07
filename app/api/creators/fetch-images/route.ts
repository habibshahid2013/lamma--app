// src/app/api/creators/fetch-images/route.ts
// API endpoint to fetch missing images for creators
// Can be called manually or via cron job

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fetchCreatorImage, generatePlaceholderImage } from '@/lib/image-fetcher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { creatorId, fetchAll = false, batchSize = 0, offset = 0 } = body;

    // Single creator update
    if (creatorId && !fetchAll) {
      const result = await updateSingleCreatorImage(creatorId);
      return NextResponse.json(result);
    }

    // Batch update creators missing images
    // Use batchSize > 0 for paginated processing, fetchAll for all at once
    if (fetchAll || batchSize > 0) {
      const result = await updateAllMissingImages(batchSize, offset);
      return NextResponse.json(result);
    }

    return NextResponse.json({
      error: 'Invalid request. Use { fetchAll: true } or { batchSize: 50, offset: 0 }',
    }, { status: 400 });

  } catch (error) {
    console.error('Fetch images error:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

async function updateSingleCreatorImage(creatorId: string) {
  const creatorRef = doc(db, 'creators', creatorId);
  const creatorDoc = await getDocs(query(collection(db, 'creators'), where('creatorId', '==', creatorId)));
  
  if (creatorDoc.empty) {
    return { success: false, error: 'Creator not found' };
  }

  const creator = creatorDoc.docs[0].data();
  const name = creator.profile?.name || creator.profile?.displayName;
  const youtubeChannelId = creator.content?.youtube?.channelId;

  const image = await fetchCreatorImage(name, youtubeChannelId);

  if (image) {
    await updateDoc(doc(db, 'creators', creatorDoc.docs[0].id), {
      'profile.avatar': image.url,
      'profile.avatarSource': image.source,
      'profile.avatarUpdatedAt': new Date().toISOString(),
    });

    return {
      success: true,
      creatorId,
      imageUrl: image.url,
      source: image.source,
    };
  }

  // Use placeholder as fallback
  const placeholder = generatePlaceholderImage(name);
  await updateDoc(doc(db, 'creators', creatorDoc.docs[0].id), {
    'profile.avatar': placeholder,
    'profile.avatarSource': 'generated',
    'profile.avatarUpdatedAt': new Date().toISOString(),
  });

  return {
    success: true,
    creatorId,
    imageUrl: placeholder,
    source: 'generated',
  };
}

async function updateAllMissingImages(batchSize = 0, offset = 0) {
  // Get all creators
  const creatorsSnapshot = await getDocs(collection(db, 'creators'));

  const creatorsNeedingImages: { id: string; name: string; youtubeChannelId?: string }[] = [];

  creatorsSnapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const avatar = data.profile?.avatar;
    const avatarSource = data.profile?.avatarSource;

    // Skip if already has a real image (not placeholder/generated)
    const hasRealAvatar = avatar &&
                          !avatar.includes('ui-avatars.com') &&
                          !avatar.includes('placeholder') &&
                          !avatar.startsWith('/creators/');

    // Also skip if we already attempted and got only a generated image
    const alreadyAttempted = avatarSource === 'generated';

    if (!hasRealAvatar && !alreadyAttempted) {
      creatorsNeedingImages.push({
        id: docSnap.id,
        name: data.profile?.name || data.profile?.displayName,
        youtubeChannelId: data.content?.youtube?.channelId,
      });
    }
  });

  // Apply pagination if batchSize specified
  const totalNeeding = creatorsNeedingImages.length;
  const batch = batchSize > 0
    ? creatorsNeedingImages.slice(offset, offset + batchSize)
    : creatorsNeedingImages;

  console.log(`Found ${totalNeeding} creators needing images, processing ${batch.length} (offset: ${offset})`);

  const results = {
    totalNeedingImages: totalNeeding,
    batchSize: batch.length,
    offset,
    nextOffset: batchSize > 0 ? offset + batchSize : null,
    hasMore: batchSize > 0 ? offset + batchSize < totalNeeding : false,
    updated: 0,
    failed: 0,
    details: [] as any[],
  };

  // Process the batch
  for (const creator of batch) {
    try {
      const image = await fetchCreatorImage(creator.name, creator.youtubeChannelId);

      const imageUrl = image?.url || generatePlaceholderImage(creator.name);
      const source = image?.source || 'generated';

      await updateDoc(doc(db, 'creators', creator.id), {
        'profile.avatar': imageUrl,
        'profile.avatarSource': source,
        'profile.avatarUpdatedAt': new Date().toISOString(),
      });

      results.updated++;
      results.details.push({
        creatorId: creator.id,
        name: creator.name,
        imageUrl: imageUrl.substring(0, 100),
        source,
      });

      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      results.failed++;
      results.details.push({
        creatorId: creator.id,
        name: creator.name,
        error: String(error),
      });
    }
  }

  return results;
}

// GET endpoint to check which creators need images
export async function GET() {
  try {
    const creatorsSnapshot = await getDocs(collection(db, 'creators'));
    
    const stats = {
      total: creatorsSnapshot.size,
      withImages: 0,
      withoutImages: 0,
      withPlaceholders: 0,
      creatorsNeedingImages: [] as string[],
    };

    creatorsSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const avatar = data.profile?.avatar;
      
      if (!avatar) {
        stats.withoutImages++;
        stats.creatorsNeedingImages.push(data.profile?.name);
      } else if (avatar.includes('ui-avatars.com') || avatar.includes('placeholder')) {
        stats.withPlaceholders++;
      } else {
        stats.withImages++;
      }
    });

    return NextResponse.json(stats);

  } catch (error) {
    return NextResponse.json({ error: 'Failed to check images' }, { status: 500 });
  }
}
