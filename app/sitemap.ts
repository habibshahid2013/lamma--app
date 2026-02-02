// app/sitemap.ts
// Dynamic sitemap generation for SEO
// Generates sitemap.xml with all public pages and creator profiles

import { MetadataRoute } from 'next';

// Get base URL with fallbacks for different environments
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://lammaplus.com';
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // Static pages - always included
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/premium`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic creator pages - fetch from Firebase at runtime only
  let creatorPages: MetadataRoute.Sitemap = [];

  // Only fetch creators in production runtime, not during build
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    try {
      // Dynamic import to avoid build-time Firebase initialization issues
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      const creatorsSnapshot = await getDocs(collection(db, 'creators'));
      creatorPages = creatorsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          url: `${baseUrl}/creator/${doc.id}`,
          lastModified: data.updatedAt?.toDate?.() || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });
    } catch (error) {
      console.error('Error fetching creators for sitemap:', error);
      // Continue with static pages only if Firebase fails
    }
  }

  return [...staticPages, ...creatorPages];
}

// Force dynamic rendering for sitemap
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour
