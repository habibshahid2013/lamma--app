// src/app/api/creators/fetch-images/route.ts
// API endpoint to fetch missing images for creators
// Can be called manually or via cron job

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fetchCreatorImage, generatePlaceholderImage } from '@/lib/image-fetcher';

export async function POST(request: NextRequest) {
  try {
    const { creatorId, fetchAll = false } = await request.json();

    // Single creator update
    if (creatorId && !fetchAll) {
      const result = await updateSingleCreatorImage(creatorId);
      return NextResponse.json(result);
    }

    // Batch update all creators missing images
    if (fetchAll) {
      const result = await updateAllMissingImages();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

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

async function updateAllMissingImages() {
  // Get all creators
  const creatorsSnapshot = await getDocs(collection(db, 'creators'));
  
  const creatorsNeedingImages: { id: string; name: string; youtubeChannelId?: string }[] = [];
  
  creatorsSnapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const hasAvatar = data.profile?.avatar && 
                      !data.profile.avatar.includes('ui-avatars.com') &&
                      !data.profile.avatar.includes('placeholder') &&
                      !data.profile.avatar.startsWith('/creators/');
    
    if (!hasAvatar) {
      creatorsNeedingImages.push({
        id: docSnap.id,
        name: data.profile?.name || data.profile?.displayName,
        youtubeChannelId: data.content?.youtube?.channelId,
      });
    }
  });

  console.log(`Found ${creatorsNeedingImages.length} creators needing images`);

  const results = {
    total: creatorsNeedingImages.length,
    updated: 0,
    failed: 0,
    details: [] as any[],
  };

  // Process each creator
  for (const creator of creatorsNeedingImages) {
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
        imageUrl,
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
