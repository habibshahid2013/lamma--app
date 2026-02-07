import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Amiri } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import EngagementWrapper from "@/components/EngagementWrapper";
import PostHogProvider from "@/components/PostHogProvider";
import InstallPrompt from "@/components/ui/InstallPrompt";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-amiri",
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
    default: 'Lamma+ | Discover Islamic Voices & Creators',
    template: '%s | Lamma+',
  },
  description: 'Your gathering place for Islamic knowledge and culture. Discover scholars, educators, podcasters, and creators who inspire your journey.',
  keywords: ['Islamic scholars', 'Islamic education', 'Muslim creators', 'Islamic content', 'faith learning', 'Islamic podcasts', 'Muslim educators'],
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
    title: 'Lamma+ | Discover Islamic Voices & Creators',
    description: 'Your gathering place for Islamic knowledge and culture. Discover scholars, educators, podcasters, and creators.',
    siteName: 'Lamma+',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lamma+ - Discover Islamic Voices & Creators',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lamma+ | Discover Islamic Voices & Creators',
    description: 'Your gathering place for Islamic knowledge and culture. Discover scholars, educators, podcasters, and creators.',
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "ar" || locale === "ur" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={`${inter.variable} ${amiri.variable} font-sans antialiased`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebsiteSchema()) }}
        />
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <EngagementWrapper>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <Suspense fallback={null}>
                  <PostHogProvider>
                    <div className="flex min-h-screen flex-col">
                      <Navbar />
                      <main id="main-content" className="flex-1">{children}</main>
                      <Footer />
                    </div>
                    <InstallPrompt />
                  </PostHogProvider>
                </Suspense>
              </ThemeProvider>
            </EngagementWrapper>
          </AuthProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
