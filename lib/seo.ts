// lib/seo.ts
// Central SEO configuration for Lamma+
// Used across all pages for consistent metadata

import { Metadata, Viewport } from 'next';

// =============================================================================
// SITE CONFIGURATION
// =============================================================================

export const siteConfig = {
  name: 'Lamma+',
  tagline: 'Gather in Faith',
  description: 'Discover Islamic scholars and educators who inspire your journey. Your gathering place for faith-based content creators.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://lammaplus.com',
  ogImage: '/og-image.png',
  twitterHandle: '@lammaplus',
  locale: 'en_US',
  keywords: [
    'Islamic scholars',
    'Muslim educators',
    'Islamic content',
    'faith creators',
    'Islamic lectures',
    'Quran teachers',
    'Islamic podcasts',
    'Muslim speakers',
    'Islamic education',
    'faith content',
  ],
};

// =============================================================================
// DEFAULT METADATA
// =============================================================================

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/icon.svg',
    },
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    images: [siteConfig.ogImage],
  },
  verification: {
    // Add these when you have the verification codes
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: siteConfig.url,
  },
  category: 'education',
};

// =============================================================================
// VIEWPORT CONFIGURATION
// =============================================================================

export const defaultViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0D7377' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

// =============================================================================
// PAGE-SPECIFIC METADATA GENERATORS
// =============================================================================

interface PageMetadataOptions {
  title: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  path = '',
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`;

  return {
    title,
    description,
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}

// =============================================================================
// CREATOR PAGE METADATA
// =============================================================================

interface CreatorMetadataOptions {
  name: string;
  slug: string;
  category?: string;
  bio?: string;
  avatar?: string;
  region?: string;
  languages?: string[];
}

export function generateCreatorMetadata({
  name,
  slug,
  category = 'Scholar',
  bio,
  avatar,
  region,
  languages,
}: CreatorMetadataOptions): Metadata {
  const title = `${name} - ${category}`;
  const description = bio
    ? bio.substring(0, 160)
    : `Discover ${name}, an Islamic ${category.toLowerCase()}. Follow their content on Lamma+.`;
  const url = `${siteConfig.url}/creator/${slug}`;
  const image = avatar || siteConfig.ogImage;

  // Build keywords
  const keywords = [
    name,
    category,
    'Islamic scholar',
    'Muslim educator',
    ...(languages || []),
    region || '',
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    openGraph: {
      type: 'profile',
      title: `${name} | ${siteConfig.name}`,
      description,
      url,
      images: [
        {
          url: image,
          width: 400,
          height: 400,
          alt: name,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `${name} | ${siteConfig.name}`,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}

// =============================================================================
// STRUCTURED DATA (JSON-LD)
// =============================================================================

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    description: siteConfig.description,
    sameAs: [
      // Add social media URLs when available
      // 'https://twitter.com/lammaplus',
      // 'https://instagram.com/lammaplus',
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateCreatorSchema(creator: {
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  category?: string;
  socialLinks?: Record<string, string>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: creator.name,
    url: `${siteConfig.url}/creator/${creator.slug}`,
    description: creator.bio,
    image: creator.avatar,
    jobTitle: creator.category || 'Scholar',
    sameAs: Object.values(creator.socialLinks || {}).filter(Boolean),
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
