// app/creator/[slug]/page.tsx
// Server Component — handles SEO metadata generation
// The visual rendering is handled by CreatorProfileClient (client component)

import { Metadata } from 'next';
import { generateCreatorMetadata } from '@/lib/seo';
import CreatorProfileClient from './CreatorProfileClient';

// ============================================================================
// SEO METADATA (runs server-side)
// ============================================================================

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Dynamic import to avoid bundling Firebase in server component edge cases
    const { getDoc, doc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');

    const slugDoc = await getDoc(doc(db, 'slugs', slug));
    if (!slugDoc.exists()) {
      return { title: 'Creator Not Found' };
    }

    const creatorId = slugDoc.data().creatorId;
    const creatorDoc = await getDoc(doc(db, 'creators', creatorId));

    if (!creatorDoc.exists()) {
      return { title: 'Creator Not Found' };
    }

    const data = creatorDoc.data();
    const name = data.profile?.displayName || data.profile?.name || data.name || 'Unknown Creator';
    const bio = data.profile?.shortBio || data.profile?.bio || '';
    const avatar = data.profile?.avatar || data.avatar || undefined;
    const category = data.category || 'Scholar';
    const region = data.region || undefined;
    const languages = data.languages || [];

    return generateCreatorMetadata({
      name,
      slug,
      category,
      bio,
      avatar,
      region,
      languages,
    });
  } catch (error) {
    console.error('Error generating creator metadata:', error);
    return { title: 'Creator Profile' };
  }
}

// ============================================================================
// PAGE COMPONENT (server component renders client)
// ============================================================================

export default async function CreatorPage({ params }: PageProps) {
  const { slug } = await params;
  return <CreatorProfileClient slug={slug} />;
}
