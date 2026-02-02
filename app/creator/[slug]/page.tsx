// app/creator/[slug]/page.tsx
// Creator Profile Page - Server Component with Dynamic SEO
// Fetches creator data for metadata generation, then renders client component

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateCreatorMetadata, generateCreatorSchema, siteConfig } from '@/lib/seo';
import CreatorPageClient from './CreatorPageClient';

// Type for page props
interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fetch creator data (used by both metadata and page)
async function getCreator(slug: string) {
  try {
    const creatorDoc = await getDoc(doc(db, 'creators', slug));
    if (!creatorDoc.exists()) {
      return null;
    }
    return { id: creatorDoc.id, ...creatorDoc.data() };
  } catch (error) {
    console.error('Error fetching creator:', error);
    return null;
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const creator = await getCreator(slug);

  if (!creator) {
    return {
      title: 'Creator Not Found',
      description: 'The creator you are looking for does not exist.',
    };
  }

  const name = creator.profile?.displayName || creator.name || slug;
  const bio = creator.profile?.bio || creator.profile?.shortBio || creator.note;
  const avatar = creator.profile?.avatar || creator.avatar;

  return generateCreatorMetadata({
    name,
    slug,
    category: creator.category,
    bio,
    avatar,
    region: creator.region,
    languages: creator.languages,
  });
}

// Server Component
export default async function CreatorPage({ params }: PageProps) {
  const { slug } = await params;

  // Validate slug exists
  if (!slug) {
    notFound();
  }

  // Get creator for structured data (client component will refetch for reactivity)
  const creator = await getCreator(slug);

  // Generate JSON-LD structured data
  const jsonLd = creator
    ? generateCreatorSchema({
        name: creator.profile?.displayName || creator.name || slug,
        slug,
        bio: creator.profile?.bio || creator.profile?.shortBio,
        avatar: creator.profile?.avatar || creator.avatar,
        category: creator.category,
        socialLinks: creator.socialLinks,
      })
    : null;

  return (
    <>
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Client Component handles all interactive UI */}
      <CreatorPageClient slug={slug} />
    </>
  );
}

// Enable static generation for known creators (optional optimization)
// export async function generateStaticParams() {
//   // Could fetch all creator slugs for static generation
//   // const creators = await getAllCreatorSlugs();
//   // return creators.map((slug) => ({ slug }));
//   return [];
// }
