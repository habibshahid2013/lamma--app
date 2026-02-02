// app/sitemap.ts
// Dynamic sitemap generation for SEO
// Generates sitemap.xml with all public pages and creator profiles

import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { siteConfig } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
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
  ];

  // Dynamic creator pages
  let creatorPages: MetadataRoute.Sitemap = [];

  try {
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
    // Return static pages only if Firebase fails
  }

  return [...staticPages, ...creatorPages];
}
