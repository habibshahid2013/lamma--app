// app/creator/[slug]/page.tsx
// Creator Profile Page - Server Component wrapper
// Passes slug to client component which handles all data fetching and rendering

import { Metadata } from 'next';
import CreatorPageClient from './CreatorPageClient';

// Type for page props
interface PageProps {
  params: Promise<{ slug: string }>;
}

// Default metadata (dynamic metadata requires Firebase which causes build issues)
export const metadata: Metadata = {
  title: 'Creator Profile',
  description: 'View creator profile on Lamma+ - Discover Islamic scholars and educators',
};

// Server Component - minimal, just passes slug to client
export default async function CreatorPage({ params }: PageProps) {
  const { slug } = await params;

  return <CreatorPageClient slug={slug} />;
}
