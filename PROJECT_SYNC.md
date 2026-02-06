# PROJECT_SYNC.md - Lamma+ Development Status
## Last Updated: 2026-02-06 (Updated by Claude Code)

This file is the **source of truth** for syncing between Claude Chat (planning) and Claude Code (implementation).

---

## PROJECT OVERVIEW

**App:** Lamma+ (Islamic Scholar Discovery Platform)
**Stack:** Next.js 16.1.5 / React 19 / Tailwind CSS 4 / Firebase / Vercel
**Node:** v24 (.nvmrc)
**Status:** MVP Development — deployed on Vercel

### Brand Colors (CONFIRMED)
```
Primary Teal:    #0D7377  (buttons, links)
Deep Teal:       #1D4E5F  (dark text, accents)
Teal Light:      #E6F4F4  (selected states)
Warm Gold:       #F5B820  (featured, premium)
Gold Light:      #FEF9E7  (subtle backgrounds)
Gold Dark:       #D4A01A  (hover states)

Dark Backgrounds:
Navy:            #0f172a  (slate-900)
Card:            #1e293b  (slate-800)
Border:          #334155  (slate-700)
```

---

## ✅ COMPLETED (2026-02-06 Session)

### 1. Stripe Integration ✅
- Created `/app/api/stripe/create-checkout/route.ts` - Checkout session creation
- Created `/app/api/stripe/webhook/route.ts` - Webhook handler for subscription events
- Created `/app/premium/success/page.tsx` - Success page with confetti
- Created `/app/premium/cancel/page.tsx` - Cancellation page
- Updated `PremiumUpgrade.tsx` with Stripe checkout flow
- Added `stripe` package to dependencies

### 2. Admin Dashboard Redesign ✅
- Complete rewrite of `/app/admin/page.tsx`
- Overview tab with stats grid (creators, users, premium, data quality)
- Data quality issues display with percentage bars
- Quick actions for pipeline execution
- Pipeline progress UI with step tracking
- Creators tab and Claims tab (placeholders)

### 3. Creator Profile UI/UX Enhancements ✅
- Added ShareModal component with copy link + social sharing
- Added QuickInfoCard sidebar component
- Added AffiliationsSection for credentials display
- Added EngagementStatsBar with follower/view counts
- Added PremiumCTABanner for non-premium users
- Two-column layout for About tab
- Better visual hierarchy with icons and colors
- All social links, topics, categories now clickable

### 4. Brand Assets & SEO ✅
- Updated `layout.tsx` with comprehensive metadata
- Added Twitter card and OpenGraph configuration
- Created `/public/og-image.svg` for social sharing
- Created `/public/apple-touch-icon.svg`
- Created `/public/manifest.json` for PWA support
- Created `scripts/generate-assets.ts` for PNG generation
- Added `sharp` for image processing

### 5. Profile Expansion System ✅
- Created `/lib/data/profile-expansion.ts` with 102 curated profiles:
  - West Africa profiles (gap filled)
  - North Africa profiles (gap filled)
  - Youth Leaders (gap filled)
  - Podcasters (gap filled)
  - Additional Reciters
  - Female Scholars & Educators
  - South Asia profiles
  - Southeast Asia profiles
  - BATCH2: Historical scholars (Al-Ghazali, Ibn Taymiyyah), UK dawah
  - BATCH3: Classical scholars (Four Imams, Bukhari, Muslim, Nawawi), more reciters
- Created `/scripts/generate-profiles.ts` - AI-powered bulk generation
- Created `/scripts/seed-expansion.ts` - Curated profile seeding
- Created `/app/api/admin/generate-profiles/route.ts` - API for AI generation

### 6. Database Growth Achieved ✅
- Grew database from **68 → 156 profiles** (+88)
- Image coverage: **98.7%** (154 of 156 have images)
- Added classical scholars (Four Imams, Hadith compilers)
- Added contemporary scholars from all regions

---

## 🔴 ACTIVE PRIORITIES

### Priority 1: RUN PROFILE EXPANSION
```bash
cd /Users/sansanfiles/Downloads/lamma-antigravity-package/lamma-app

# Option A: Seed curated profiles (recommended first)
npm run seed-expansion

# Option B: Generate AI profiles (after curated)
npm run generate-profiles

# Then enrich with images/YouTube data
npm run enrich
npm run fetch-images
```

### Priority 2: DATABASE GROWTH TARGET
- **Current:** 156 profiles (was 68)
- **Target:** 500+ profiles
- **Gap:** ~344 profiles needed
- **Progress:** 31% complete (156/500)

**Expansion strategy:**
1. Run `seed-expansion` to add 40+ curated profiles
2. Run `generate-profiles` to AI-generate more
3. Manual research for top scholars
4. Run enrichment pipeline for images/data

### Priority 3: FIRESTORE CONFIGURATION
Ensure these environment variables are set:
```
FIREBASE_SERVICE_ACCOUNT_KEY=<json-string>
# OR
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...

NEXT_PUBLIC_APP_URL=https://lamma.app
```

---

## 📊 DATABASE SCHEMA

### Collection: `creators`
```typescript
{
  id: string;
  slug: string;
  name: string;
  category: "scholar" | "educator" | "speaker" | "reciter" | "author" |
            "activist" | "youth_leader" | "podcaster" | "influencer" | "public_figure";
  tier: "verified" | "rising" | "new" | "community";
  gender: "male" | "female";
  region: "americas" | "europe" | "middle_east" | "south_asia" |
          "southeast_asia" | "east_africa" | "west_africa" | "north_africa";
  country: string;
  countryFlag: string;
  languages: string[];
  topics: string[];
  affiliations?: string[];
  verified: boolean;
  verificationLevel: "official" | "community" | "none";
  featured: boolean;
  trending: boolean;
  isHistorical: boolean;
  lifespan?: string;

  profile?: {
    name: string;
    displayName: string;
    title?: string;
    avatar: string | null;
    coverImage: string | null;
    shortBio: string;
    bio: string;
  };

  content?: {
    youtube?: { channelId, channelUrl, subscriberCount, videoCount, ... };
    podcast?: { name, url, episodeCount, ... };
    books?: Array<{ title, thumbnail, authors, ... }>;
  };

  socialLinks?: {
    website?, youtube?, twitter?, instagram?, facebook?, tiktok?, ...
  };

  stats?: { followerCount, contentCount, viewCount };
  aiGenerated?: { generatedAt, model, confidence, confidenceScore };
  source: "automated_pipeline" | "manual" | "claimed" | "curated_expansion";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 📁 FILE STRUCTURE (Updated)

```
lamma-app/
├── app/
│   ├── layout.tsx              # Root layout + metadata + analytics
│   ├── page.tsx                # Landing/splash
│   ├── sitemap.ts              # Dynamic sitemap
│   ├── home/page.tsx           # Main home screen
│   ├── search/page.tsx         # Search page
│   ├── creator/[slug]/
│   │   ├── page.tsx            # Server component — SEO
│   │   └── CreatorProfileClient.tsx  # Client — enhanced UI
│   ├── premium/
│   │   ├── page.tsx            # Premium upgrade
│   │   ├── success/page.tsx    # ✅ NEW: Stripe success
│   │   └── cancel/page.tsx     # ✅ NEW: Stripe cancel
│   ├── admin/
│   │   └── page.tsx            # ✅ REDESIGNED: Admin dashboard
│   └── api/
│       ├── admin/seed/route.ts
│       ├── stripe/             # ✅ NEW
│       │   ├── create-checkout/route.ts
│       │   └── webhook/route.ts
│       └── profile-pipeline/route.ts
├── components/
│   ├── main/
│   │   └── PremiumUpgrade.tsx  # ✅ UPDATED: Stripe integration
│   ├── ui/
│   │   ├── CreatorLinks.tsx
│   │   ├── ExternalLink.tsx
│   │   └── button.tsx
│   ├── LammaLogo.tsx
│   ├── ActionGateModal.tsx
│   └── EngagementWrapper.tsx
├── hooks/
│   ├── useCreators.ts
│   ├── useFollow.ts
│   └── useAI.ts
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── firebase.ts
│   ├── seo.ts
│   ├── utils.ts
│   ├── types/creator.ts
│   ├── data/
│   │   ├── creators.ts          # Original 68 profiles
│   │   └── profile-expansion.ts # ✅ NEW: 40+ curated profiles
│   ├── ai/anthropic.ts
│   └── profile-pipeline/
├── scripts/
│   ├── enrich-creators.ts
│   ├── fetch-images.ts
│   ├── sync-content.ts
│   ├── generate-assets.ts       # ✅ NEW: PNG generation
│   ├── generate-profiles.ts     # ✅ NEW: AI profile generation
│   └── seed-expansion.ts        # ✅ NEW: Curated seeding
├── public/
│   ├── favicon.svg
│   ├── og-image.svg             # ✅ NEW
│   ├── apple-touch-icon.svg     # ✅ NEW
│   ├── manifest.json            # ✅ NEW
│   ├── robots.txt
│   └── lamma-tree.png
├── package.json                 # ✅ UPDATED: new scripts
└── .env.local                   # Environment variables
```

---

## 🔧 QUICK COMMANDS

```bash
cd /Users/sansanfiles/Downloads/lamma-antigravity-package/lamma-app

# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run lint             # Run linter

# Data Management
npm run seed-expansion   # Add curated profiles
npm run generate-profiles # AI-generate profiles
npm run enrich           # Enrich with YouTube/podcast data
npm run fetch-images     # Fetch creator images

# Assets
npm run generate-assets  # Convert SVG to PNG

# After changes - push to both branches
git add .
git commit -m "Description"
git push origin main
git push origin main:vercel/set-up-vercel-web-analytics-in-m9kl9x
```

---

## 🎯 NEXT SESSION PRIORITIES

1. **Run profile expansion** - Execute seed-expansion and generate-profiles
2. **Test Stripe integration** - Verify checkout flow works in test mode
3. **Verify admin dashboard** - Test all tabs and quick actions
4. **Run enrichment** - Fetch images and YouTube data for new profiles
5. **QA creator profiles** - Test that all data renders correctly

---

*Last sync: 2026-02-06*
*Updated by: Claude Code (Opus 4.5)*
*Session: Database grown from 68 → 156 profiles (88 added, 31% of 500 target)*
