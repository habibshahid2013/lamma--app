import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import EngagementWrapper from "@/components/EngagementWrapper";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://lamma.app'),
  title: {
    default: 'Lamma+ | Discover Islamic Scholars',
    template: '%s | Lamma+',
  },
  description: 'Your gateway to Islamic knowledge. Discover, follow, and learn from scholars worldwide.',
  keywords: ['Islamic scholars', 'Islamic education', 'Muslim scholars', 'Islamic content', 'faith learning'],
  authors: [{ name: 'Lamma+' }],
  creator: 'Lamma+',
  publisher: 'Lamma+',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Lamma+ | Discover Islamic Scholars',
    description: 'Your gateway to Islamic knowledge. Discover, follow, and learn from scholars worldwide.',
    siteName: 'Lamma+',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lamma+ - Discover Islamic Scholars',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lamma+ | Discover Islamic Scholars',
    description: 'Your gateway to Islamic knowledge. Discover, follow, and learn from scholars worldwide.',
    images: ['/og-image.png'],
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`} suppressHydrationWarning>
        <AuthProvider>
          <EngagementWrapper>
            {children}
          </EngagementWrapper>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
