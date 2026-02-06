# Lamma+ (Gather in Faith)

Lamma+ is a mobile-first content creator discovery platform designed for the faith community. It connects users with 487+ scholars, educators, and content creators in a warm, welcoming environment.

**Live Demo:** [https://lamma-app.vercel.app](https://lamma-app.vercel.app)

## Features

- **Onboarding Flow**: Personalized region and interest selection, splash screen with tap-to-skip, suggested creators
- **Discovery**: Smart search with category/region/language/tier filtering, sort by relevance/name/followers, topic deep dives, "Surprise Me" random discovery
- **Home**: Curated rows (For You, Muslim Voices, Women Scholars, Historical Figures, Regional Voices) with "See All" navigation
- **Creator Profiles**: Detailed profiles with tabs (About, Videos, Podcasts, Books, eBooks, Audiobooks, Courses), animated tab transitions, skeleton loading
- **Compare**: Side-by-side scholar comparison tool
- **Collections**: Dedicated spaces for Women Scholars and Giants of History
- **Following**: Firestore-backed follow system with auth gate for unauthenticated users
- **Premium**: Email waitlist collection (Stripe integration preserved for future use)
- **Admin**: Dashboard with data seeding, creator pipeline, sync tools, data quality audit

## Tech Stack

- **Framework**: Next.js 16.1.5 (App Router) / React 19
- **Styling**: Tailwind CSS v4 (Mobile-first design)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Animations**: Framer Motion (page transitions, bottom sheet, tab animations)
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)
- **Deployment**: Vercel (with Analytics)
- **CI/CD**: GitHub Actions (lint, build, TypeScript check)

## Brand Identity

- **Primary Colors**: Teal (`#0D7377`) & Gold (`#F5B820`)
- **Deep Teal**: `#1D4E5F` (dark text, accents)
- **Typography**: Clean, accessible Sans Serif (Inter)
- **Aesthetic**: Warm, premium, and welcoming

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**: Copy `.env.local.example` to `.env.local` and fill in Firebase credentials

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Application**: Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/                          # Next.js App Router pages
  creator/[slug]/             # Dynamic creator profiles (server + client components)
  admin/                      # Admin dashboard and tools
  api/                        # API routes (AI, Stripe, seeding, etc.)
components/
  onboarding/                 # 7 onboarding screens
  main/                       # Core screens (Home, Search, Following, Premium)
  ui/                         # Reusable UI (CreatorCard, BottomNav, SkeletonCard, PageTransition, etc.)
hooks/                        # Custom hooks (useCreators, useFollow, useEngagement)
contexts/                     # React contexts (AuthContext)
lib/
  firebase.ts                 # Firebase config (lazy Proxy initialization)
  data/creators.ts            # Static seed data (487 creators)
  seo.ts                      # SEO configuration
  types/                      # TypeScript type definitions
scripts/                      # Data seeding and enrichment scripts
docs/                         # Specifications and architecture docs
PROJECT_SYNC.md               # Development status (source of truth)
```

## Development Notes

- **Node.js 24** (see `.nvmrc`)
- **Firebase lazy init**: `lib/firebase.ts` uses Proxy pattern to defer initialization, allowing builds without env vars (important for CI)
- **Dual branch deployment**: Push to both `main` and `vercel/set-up-vercel-web-analytics-in-m9kl9x`
- See `PROJECT_SYNC.md` for detailed session-by-session development history
