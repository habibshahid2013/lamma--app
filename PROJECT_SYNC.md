# PROJECT_SYNC.md - Lamma+ Development Status
## Last Updated: 2026-02-08 (Session 18)

This file is the **source of truth** for syncing between Claude Chat (planning) and Claude Code (implementation).

---

## PROJECT OVERVIEW

**App:** Lamma+ (Islamic Creator Discovery Platform)
**Stack:** Next.js 16.1.5 / React 19 / Tailwind CSS 4 / Firebase / Vercel
**Node:** v24 (.nvmrc)
**Status:** MVP Development — deployed on Vercel
**i18n:** 6 locales (EN, AR, UR, FR, TR, MS) via next-intl
**Database:** 487 creators in Firestore + static seed data
**Search:** Fuse.js fuzzy search with weighted keys
**Analytics:** PostHog (pageviews, custom events, user identification)

### Brand Colors
```
Primary Teal:    #0D7377  (buttons, links)
Deep Teal:       #1D4E5F  (dark text, accents)
Teal Light:      #E6F4F4  (selected states)
Warm Gold:       #F5B820  (featured, premium)
Gold Light:      #FEF9E7  (subtle backgrounds)
Gold Dark:       #D4A01A  (hover states)
```

### Project Location
```
lamma-app/                         # Main Next.js application (this repo)
├── docs/
│   ├── specs/
│   │   ├── lamma-antigravity-prompt.md        # Complete build spec
│   │   ├── Lamma-Brand-Guidelines-GATHERING-TREE.md
│   │   ├── Lamma-Core-Architecture-Principles.md
│   │   └── Lamma-Region-Based-Community-Selection.md
│   ├── CLAUDE_CHAT_BRIEFING.md                # Briefing doc for Claude Chat
│   ├── LAMMA_IMPROVEMENT_PLAN.md              # Improvement roadmap
│   └── LINK_ARCHITECTURE.md                   # Link architecture docs
├── PROJECT_SYNC.md                            # THIS FILE (source of truth)
└── ... (app source code)
```

---

## CURRENT IMPLEMENTATION STATUS

### Screens & Routes (47 Total)

| Route | Status | File Location | Notes |
|-------|--------|---------------|-------|
| `/` | DONE | `app/page.tsx` | Splash/landing |
| `/welcome` | DONE | `app/welcome/` | Tree logo + CTA |
| `/start` | DONE | `app/start/` | Onboarding flow |
| `/home` | DONE | `components/main/HomeScreen.tsx` | Hero, topics grid, featured creators, content types |
| `/discover` | DONE | `app/discover/` | **NEW (Session 15-16)** — Server metadata + `DiscoverClient.tsx` with fuzzy search |
| `/scholars` | DONE | `app/scholars/` | **NEW (Session 15)** — Full filter panel (category/region/language/gender) |
| `/search` | REDIRECT | `app/search/` | Redirects to `/scholars` |
| `/creator/[slug]` | DONE | `app/creator/[slug]/` | Server SEO + client profile with shadcn/ui tabs |
| `/auth/login` | DONE | `app/auth/login/` | Email/Google sign-in + forgot password + i18n |
| `/auth/signup` | DONE | `app/auth/signup/` | Email/Google sign-up + i18n |
| `/following` | DONE | `app/following/` | Following list (no limit) |
| `/saved` | DONE | `app/saved/` | Saved creators |
| `/profile` | DONE | `app/profile/` | User profile |
| `/premium` | DONE | `app/premium/` | Email waitlist (MVP) |
| `/compare` | DONE | `app/compare/` | Side-by-side creator comparison |
| `/collection/historical` | DONE | `app/collection/historical/` | Historical scholars collection |
| `/collection/women-scholars` | DONE | `app/collection/women-scholars/` | Women scholars collection |
| `/about` | DONE | `app/about/` | About page |
| `/offline` | DONE | `app/offline/` | PWA offline fallback |
| `/creator-dashboard` | DONE | `app/creator-dashboard/` | Creator self-service |
| `/admin` | DONE | `app/admin/` | Admin dashboard |
| `/admin/add-creator` | DONE | `app/admin/add-creator/` | Add creator form |
| `/admin/manage-creators` | DONE | `app/admin/manage-creators/` | Edit/manage creators |
| `/admin/data-quality` | DONE | `app/admin/data-quality/` | Data quality audit |
| `/admin/pipeline` | DONE | `app/admin/pipeline/` | Creator enrichment pipeline |
| `/admin/sync` | DONE | `app/admin/sync/` | Firestore sync tool |
| `/sitemap.xml` | DONE | `app/sitemap.ts` | Dynamic sitemap with `/discover` route |
| API routes (15+) | DONE | `app/api/` | Admin, AI, CRUD, Stripe, enrichment |

### Creator Profile Architecture
```
app/creator/[slug]/
├── page.tsx                    # Server component — SEO metadata + JSON-LD
└── CreatorProfileClient.tsx    # Client component — shadcn/ui tabs, AnimatedSection scroll reveals
```

### Discover Page Architecture (Session 15-16)
```
app/discover/
├── page.tsx                    # Server component — generateMetadata()
└── DiscoverClient.tsx          # Client component — Fuse.js search, suggestions, filters
```

### Key Features
- **Fuzzy search** — Fuse.js with weighted keys (name 1.0, topics 0.8, category 0.6, bio 0.3)
- **Search suggestions** — Dropdown with top 5 results while typing + search history
- **Search history** — localStorage-backed, max 10 entries
- **6-locale i18n** — English, Arabic, Urdu, French, Turkish, Malay via next-intl
- **RTL support** — Arabic and Urdu layouts
- **Scroll animations** — AnimatedSection (fade+slide) and StaggerGrid (stagger entrance)
- **Content type filtering** — YouTube, Podcast, Books, Courses filters on discover page
- **10 creator categories** — Scholar, Educator, Preacher, Speaker, Reciter, Podcaster, Author, Activist, Entertainer, Personality
- **PostHog analytics** — User ID, profile views, follows, searches, auth events
- **Forgot password** — Firebase Auth password reset flow
- **JSON-LD structured data** — Organization + Website schemas in root layout
- **PWA** — Service worker via @serwist/next, offline page, install prompt
- **Firebase offline persistence** — Firestore local cache + multi-tab support
- **Admin dashboard** — Creator CRUD, data quality audit, enrichment pipeline, sync tools
- **Premium waitlist** — Email collection (Stripe code preserved but unused)

### UI Components
- `AnimatedSection.tsx` — Framer Motion scroll-reveal wrapper (fade + Y-translate)
- `StaggerGrid.tsx` — Staggered entrance animation for grid items
- `CreatorCard.tsx` — Horizontal layout, category color badges, content type icons, hover animations
- `BookList.tsx` — Extracted book cards with covers, metadata, Amazon/preview links
- `CourseList.tsx` — Extracted course cards with platform, links
- `LanguageSwitcher.tsx` — 6-locale dropdown (EN/AR/UR/FR/TR/MS)
- `BottomNav.tsx` — Tab navigation with active indicator bar + backdrop blur
- `CreatorLinks.tsx` — External link buttons (platform detection)
- `ExternalLink.tsx` — Safe external link with URL sanitization
- `ShareModal.tsx` — Social sharing (copy link, Twitter, Facebook, email)
- `PageTransition.tsx` — Framer Motion page entrance animation wrapper
- `SkeletonCard.tsx` — Skeleton loading states with shimmer animation
- `PostHogProvider.tsx` — PostHog pageview tracking + user identification
- `SurpriseMeButton.tsx` — Random creator discovery
- `InstallPrompt.tsx` — PWA install prompt
- And more in `components/ui/`

---

## ACTIVE PRIORITIES

### Priorities 1–14: COMPLETED (Sessions 1-9)
- Brand & Visual Polish, Creator Profile, Image Management, Data & Content, SEO & Performance
- Code Quality & Link Fixes, Production Deployment, Engagement & Following
- Mobile Responsiveness, Data Quality, Database Expansion (487 creators)
- Branding Fix, Premium → Waitlist, CI Fix + UX Modernization

### Priority 15: Data Enrichment Pipeline — EXPANDED (Sessions 10, 17, 18)
- [x] Image enrichment: 401 real images, 180 placeholders
- [x] Wikipedia bio generation: 68 new bios, 49 bad cleared
- [x] YouTube enrichment code optimized: ~5 units/creator (was ~104)
- [x] Admin API security: All 8 routes secured with Firebase Auth (Session 17)
- [x] Queue logging fixed: `arrayUnion` for log appending (Session 17)
- [x] **Multi-source enrichment pipeline** (Session 18):
  - Google Books API: books by author (40K queries/day free)
  - iTunes Search API: podcast discovery (free, no auth)
  - Google Knowledge Graph: bio, image, website (100K req/day free)
  - Social links discovery: YouTube description extraction + Wikidata SPARQL
  - Admin UI: per-source enrichment buttons + combined results display
- [ ] **BLOCKED**: YouTube API quota — run `POST /api/data-quality/enrich-youtube` after reset
- [ ] ~55 creators missing bios (no Wikipedia article)
- [ ] ~5 wrong Wikipedia bios to review

### Priority 16: i18n Foundation + PWA — COMPLETE (Session 12)
- [x] next-intl installed and configured (cookie-based locale, `i18n/request.ts`)
- [x] English (`messages/en.json`) and Arabic (`messages/ar.json`) locale files with 190+ keys
- [x] PWA support via @serwist/next (service worker, offline page, install prompt)
- [x] PostHog env var support added to Vercel config

### Priority 17: UX Redesign — Scholar Directory to Content Platform — COMPLETE (Session 15)
- [x] Rebranded: "Scholars" → "Creators/Voices" across 40+ i18n keys
- [x] Fixed dark mode: primary-foreground was identical to background (invisible text)
- [x] New `/discover` route replacing `/scholars` (with redirect from `/search`)
- [x] HomeScreen rewrite: hero section, 10-category grid, trending creators, content type browsing
- [x] CreatorCard rewrite: horizontal layout, category color badges, content type icons
- [x] Framer Motion: AnimatedSection scroll-reveals, StaggerGrid stagger animations
- [x] New hooks: `useTrendingCreators`, `useCategoryCount`, `useContentTypeCounts`
- [x] Topics expanded 8→12, categories 6→10

### Priority 18: Platform Enhancement (7 Features) — COMPLETE (Session 16)
- [x] **SEO structured data** — JSON-LD Organization + Website schemas in root layout, updated metadata
- [x] **Fuzzy search** — Fuse.js with weighted keys, search suggestions dropdown, search history
- [x] **Discover page split** — Server component (generateMetadata) + DiscoverClient.tsx
- [x] **Analytics instrumentation** — PostHog user identification, profile/search/follow/auth event tracking
- [x] **Auth UI polish** — Forgot password flow, i18n for login/signup pages
- [x] **Content extraction** — BookList + CourseList components extracted from profile page
- [x] **i18n expansion** — 2→6 locales (EN, AR, UR, FR, TR, MS), LanguageSwitcher dropdown
- [x] **Profile animations** — AnimatedSection on header, social links, topics, all tab content
- [x] **Terminology** — "Scholar" → "Creator" across profile, user profile, SEO

---

## RECENT CHANGES LOG

### 2026-02-08 — Multi-Source Enrichment Pipeline + Social Links (Sessions 17-18)

**Context:** Session 17 secured all admin API routes with Firebase Auth. Session 18 built a comprehensive data enrichment pipeline using free APIs to automatically populate books, podcasts, entity data, and social media links for all 487 creators.

**7 files changed, 1062 insertions.**

**Session 17 — Admin Security:**
1. `lib/firebase-admin.ts` — **NEW** — Firebase Admin SDK with lazy init
2. `lib/admin-auth.ts` — **NEW** — `verifyAdmin()` middleware (token + role check)
3. `lib/admin-fetch.ts` — **NEW** — Client helper auto-attaches auth token
4. All 8 admin API routes secured with `verifyAdmin()`
5. `lib/queue.ts` — Fixed `logQueueMessage()` with `arrayUnion`
6. `app/api/cron/process-queue/route.ts` — Re-enabled auth (cron secret + admin token)

**Session 18 — Multi-Source Enrichment:**
1. `lib/enrichment/google-books.ts` — **NEW** — Google Books API: find books by author (40K queries/day free)
2. `lib/enrichment/itunes-podcast.ts` — **NEW** — iTunes Search API: podcast discovery (free, no auth)
3. `lib/enrichment/knowledge-graph.ts` — **NEW** — Google KG API: bio, image, website (100K req/day free)
4. `lib/enrichment/social-links.ts` — **NEW** — Social links discovery: YouTube description URL extraction + Wikidata SPARQL
5. `app/api/data-quality/enrich-multi/route.ts` — **NEW** — Orchestrator API: iterates creators, calls all sources, updates Firestore
6. `app/admin/data-quality/page.tsx` — Added 5 enrichment buttons (All Sources, Books, Podcasts, Knowledge Graph, Social Links) + results display with source breakdown badges

**Enrichment sources & costs:**
| Source | API | Cost | Rate Limit |
|--------|-----|------|------------|
| Books | Google Books API | $0 | 40K queries/day |
| Podcasts | iTunes Search API | $0 | ~20 req/min |
| Bio/Image/Website | Google Knowledge Graph | $0 | 100K req/day |
| Social Links (YouTube) | YouTube description regex | $0 | Already fetched |
| Social Links (Wikidata) | Wikidata SPARQL | $0 | Generous |

**Commits:** `b5879ab` (Session 17), `804b78c` (Session 18)

**Build:** Passes with 0 errors. 48 routes.

### 2026-02-07 — Platform Enhancement: 7 Features (Session 16)

**Context:** Following the Session 15 UX redesign, this session added 7 features: SEO structured data, fuzzy search, analytics, auth UI polish, content extraction, and i18n expansion from 2 to 6 locales.

**24 files changed, 2051 insertions, 605 deletions.**

**Phase 1 — SEO Structured Data:**
1. `app/layout.tsx` — Added JSON-LD `<script>` tags for Organization + Website schemas, updated title to "Discover Islamic Voices & Creators", added RTL for Urdu (`locale === "ar" || locale === "ur"`)
2. `lib/seo.ts` — Changed "Scholar" → "Creator", search URL → `/discover?q=`
3. `app/sitemap.ts` — Added `/discover` route (priority 0.9)
4. `app/discover/page.tsx` — Rewritten as server component with `generateMetadata()` export
5. `app/discover/DiscoverClient.tsx` — **NEW** — All client code moved here (~450 lines)

**Phase 2 — Fuzzy Search (Fuse.js):**
1. `lib/search.ts` — **NEW** — Fuse.js search utility with weighted keys
2. `hooks/useSearchHistory.ts` — **NEW** — localStorage search history (max 10 entries)
3. `app/discover/DiscoverClient.tsx` — Integrated fuzzy search, suggestions dropdown, debounced analytics

**Phase 3 — Analytics Instrumentation:**
1. `components/PostHogProvider.tsx` — Added `posthog.identify(user.uid)` when logged in, `posthog.reset()` on logout
2. `app/creator/[slug]/CreatorProfileClient.tsx` — Track `creator_profile_viewed`, `creator_followed`/`creator_unfollowed`, `share_modal_opened`
3. `app/discover/DiscoverClient.tsx` — Track `search_performed` (debounced 1s) with query, results_count, active filters
4. `app/auth/login/page.tsx` — Track `user_logged_in` with method (email/google)
5. `app/auth/signup/page.tsx` — Track `user_signed_up` with method (email/google)

**Phase 4 — Auth UI Polish:**
1. `app/auth/login/page.tsx` — Wired forgot password button → `resetPassword(email)` from AuthContext, success banner
2. `app/auth/login/page.tsx` + `app/auth/signup/page.tsx` — Added `useTranslations("auth")`, replaced all hardcoded strings
3. `messages/en.json` + `messages/ar.json` — Added `auth` namespace (18 keys each)

**Phase 5 — Content Component Extraction:**
1. `components/content/BookList.tsx` — **NEW** — Extracted from inline profile rendering
2. `components/content/CourseList.tsx` — **NEW** — Extracted from inline profile rendering
3. `app/creator/[slug]/CreatorProfileClient.tsx` — Replaced inline books/courses tabs with component calls, reduced ~50 lines

**Phase 6 — i18n Expansion:**
1. `messages/fr.json` — **NEW** — French (214 keys)
2. `messages/tr.json` — **NEW** — Turkish (214 keys)
3. `messages/ms.json` — **NEW** — Malay (214 keys)
4. `messages/ur.json` — **NEW** — Urdu/Nastaliq (214 keys)
5. `components/ui/LanguageSwitcher.tsx` — Rewritten: toggle → 6-locale dropdown

**Phase 7 — Profile Animations + Terminology:**
1. `app/creator/[slug]/CreatorProfileClient.tsx` — AnimatedSection on header, social links, topics, all 7 tab contents
2. `app/creator/[slug]/page.tsx` — "Scholar" → "Creator" fallback
3. `components/main/UserProfile.tsx` — "Follow scholars" → "Follow creators"

**Dependencies added:** `fuse.js`

**Commit:** `11f55a7` — "Add SEO structured data, fuzzy search, analytics, auth UI, i18n expansion, content extraction"

**Build:** Passes with 0 errors. 47 routes generated.

### 2026-02-07 — UX Redesign: Scholar Directory → Content Platform (Session 15)

**Context:** 62% of creators in the database are non-scholars (podcasters, authors, entertainers, etc.) but the app was branded exclusively as a "scholar directory." This session transformed it into an inclusive content discovery platform.

**Key changes:**
1. **Terminology** — "Scholars" → "Creators/Voices" across 40+ i18n keys (EN + AR)
2. **Dark mode fix** — `primary-foreground` was identical to `background` (invisible white-on-white text). Fixed in CSS variables.
3. **New `/discover` route** — Replaced `/scholars` with full-featured discover page (10 categories, 12 topics, content type filters)
4. **New `/scholars` route** — New page with category/region/language/gender filter panel, quick topic pills
5. **HomeScreen rewrite** — Hero section, category grid (all 10 categories), trending creators, browse by content type (YouTube/Podcast/Books/Courses), Muslim voices, women scholars, historical scholars, "Why Lamma+" section
6. **CreatorCard rewrite** — Horizontal layout, category-specific color badges, content type indicator icons (YouTube/Podcast/Books/Courses), Framer Motion hover
7. **AnimatedSection + StaggerGrid** — New animation components for scroll reveals and staggered grid entrances
8. **New hooks** — `useTrendingCreators`, `useCategoryCount`, `useContentTypeCounts`

**Commit:** `30ae4d9` — "UX redesign: scholar directory → content platform"

### 2026-02-07 — i18n Foundation + PWA Support (Session 12)

**Context:** Added internationalization and progressive web app capabilities.

1. **next-intl** — Cookie-based locale switching (`NEXT_LOCALE` cookie), `i18n/request.ts` config
2. **Locale files** — `messages/en.json` (190+ keys), `messages/ar.json` (Arabic translations)
3. **PWA** — `@serwist/next` service worker, `app/sw.ts`, offline page, `InstallPrompt.tsx`
4. **PostHog** — Added env var support in Vercel configuration

**Commit:** `ecd3829` — "Add i18n foundation (EN/AR) + PWA support + PostHog env vars"

### 2026-02-07 — Skills Integration, Firebase Optimization, PostHog Analytics (Session 11)

**Context:** Firebase optimization, React Compiler, PostHog analytics, accessibility improvements.

1. **Firebase offline persistence** — `initializeFirestore()` with `persistentLocalCache` + `persistentMultipleTabManager`
2. **React Compiler** — `reactCompiler: true` in next.config.ts (auto-memoization)
3. **PostHog** — `lib/posthog.ts`, `PostHogProvider.tsx`, `useTrack.ts` hook
4. **Accessibility** — Skip-to-content link, `prefers-reduced-motion`, WCAG touch targets
5. **Navbar** — Desktop search bar, aria-labels
6. **Skeleton shimmer** — CSS `animate-shimmer` overlay

**Commit:** `4c31eda` — "Add Firebase offline persistence, PostHog analytics, accessibility & UX polish"

### Sessions 1-10: See previous change log entries below

<details>
<summary>Click to expand Sessions 1-10 change log</summary>

### 2026-02-06 — Data Enrichment Pipeline (Session 10)
- Image enrichment: 401 real / 180 placeholder / 0 missing
- Wikipedia bio generation: 68 new bios, 49 bad cleared
- YouTube enrichment code optimized (100→1 unit per call)
- Commit: `3570938`

### 2026-02-06 — CI Fix + UX Modernization (Session 9)
- Firebase lazy Proxy-based initialization for CI
- Framer Motion: splash tap-to-skip, filter bottom sheet, skeleton loading, page transitions, card hover lift, animated tab indicators
- Commits: `ab36a8a`, `11f9484`

### 2026-02-06 — Branding, Database Expansion, Premium→Waitlist (Session 8)
- SVG logos: stroke → solid filled paths
- Database: 210→487 creators via 3 batch scripts
- Premium → email waitlist (Stripe code preserved)
- Commits: `39ad040`, `720aa41`, `579f1f0`, `f2b40c3`

### 2026-02-06 — Data Enrichment & Database Expansion (Session 7)
- All 68 creators enriched with bios (100% coverage), YouTube/Twitter/Instagram/website links
- Database: 68→210 creators across 8 regions
- Commits: `4d46bdc`, `8407f88`

### 2026-02-03 — Mobile Responsiveness & Data Quality Audit (Session 6)
- Full 375px viewport audit: card overflow, touch targets, iOS safe areas
- Fixed 3 creator data errors (Boonaa Mohammed, Omar Suleiman, Dave Chappelle)

### 2026-02-03 — Follow System Wiring (Session 5)
- Wired Firestore-backed `useFollow` into CreatorProfileClient + CreatorCard
- ActionGateModal for unauthenticated follow clicks

### 2026-02-03 — Code Quality, Link Fixes & Cleanup (Session 4)
- Fixed dead `/explore` links → `/search`
- Search page reads query params
- Deleted unused `components/creator/` directory

### 2026-02-03 — Creator Profile Reorganization (Session 3)
- Restored gold gradient design from design regression
- Fixed Vercel deployment (branch sync, Node version, missing deps)

### 2026-02-01 — SEO & Performance (Session 2)
- Created `lib/seo.ts`, `app/sitemap.ts`, `public/robots.txt`
- Image optimization, security headers, caching in next.config.ts

### 2026-02-01 — Brand Polish (Session 1)
- Fixed logo SVGs with correct brand colors
- Confirmed tailwind.config.ts has complete brand palette

</details>

---

## KNOWN ISSUES

### Active Issues

1. **Vercel branch situation** — Both `main` and `vercel/set-up-vercel-web-analytics-in-m9kl9x` must stay synced. Any push to `main` should also be pushed to the Vercel branch.
2. **YouTube enrichment blocked** — API quota was exhausted. Run `POST /api/data-quality/enrich-youtube { batchSize: 50 }` after daily reset (midnight Pacific). Code optimized to ~5 units/creator.
3. **~55 creators missing bios** — No Wikipedia article found. Options: manual entry via `/admin/manage-creators`, Anthropic API when credits restored, or accept as-is.
4. **~5 wrong Wikipedia bios** — Adam Saleh, Ali Dawah, Abdessalam Yassine, AbdelRahman Murphy, Bilal Rauf/Muhammad. Need manual review/correction.
5. **Anthropic API credits exhausted** — Bio generation via `lib/ai/anthropic.ts` will fail until credits topped up.
6. **Firestore seeding** — 487 creators in static data need to be seeded to Firestore via admin dashboard "Seed Data" button or `POST /api/admin/seed?action=seed`.
7. **Stripe env vars** — When ready to enable premium, set `STRIPE_SECRET_KEY`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_YEARLY_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` in Vercel.
8. **GitHub Actions secrets** — Firebase env vars need to be configured in repo settings for CI.
9. **GOOGLE_API_KEY on Vercel** — Must verify this env var is set for server-side enrichment APIs.
10. **PostHog env vars** — `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` need to be set in Vercel.
11. **Navbar logo icon** — Currently uses a star SVG instead of the brand palm tree. Should use PalmIcon from `LammaLogo.tsx`.
12. **Urdu font** — No Noto Nastaliq Urdu font loaded yet. Urdu locale works but uses default font instead of proper Nastaliq script rendering.
13. **i18n translation quality** — New locale files (FR, TR, MS, UR) were machine-generated. May need native speaker review for accuracy.

### Resolved Issues
- ~~Creator images~~ — RESOLVED (Session 10): 401 real images, 180 placeholders
- ~~Premium flow~~ — RESOLVED (Session 8): Email waitlist
- ~~Following system~~ — RESOLVED (Session 5): Firestore-backed
- ~~Mobile responsiveness~~ — RESOLVED (Session 6): 375px audit
- ~~Data quality~~ — RESOLVED (Session 7): 100% bio coverage
- ~~Database expansion~~ — RESOLVED (Session 8): 487 creators
- ~~Branding/Logo~~ — RESOLVED (Session 8): Solid filled paths
- ~~CI build failure~~ — RESOLVED (Session 9): Firebase lazy init
- ~~Dark mode~~ — RESOLVED (Session 15): Fixed primary-foreground
- ~~Scholar-only branding~~ — RESOLVED (Session 15): Inclusive "Creators" terminology
- ~~No fuzzy search~~ — RESOLVED (Session 16): Fuse.js with weighted keys
- ~~2 locales only~~ — RESOLVED (Session 16): 6 locales

---

## FILE STRUCTURE (Key Files)

```
lamma-app/
├── app/
│   ├── layout.tsx              # Root layout: SEO, JSON-LD, PostHog, i18n, RTL, skip-link
│   ├── page.tsx                # Landing/splash
│   ├── sitemap.ts              # Dynamic sitemap (includes /discover)
│   ├── sw.ts                   # PWA service worker (Serwist)
│   ├── globals.css             # Tailwind v4, animations, accessibility
│   ├── home/page.tsx           # Main home screen
│   ├── discover/
│   │   ├── page.tsx            # Server component — generateMetadata()
│   │   └── DiscoverClient.tsx  # Client — Fuse.js search, suggestions, filters
│   ├── scholars/page.tsx       # Full filter panel (category/region/language/gender)
│   ├── search/page.tsx         # Redirects to /scholars
│   ├── creator/[slug]/
│   │   ├── page.tsx            # Server component — SEO metadata + JSON-LD
│   │   └── CreatorProfileClient.tsx  # Client — shadcn/ui tabs, AnimatedSection
│   ├── auth/
│   │   ├── login/page.tsx      # Email/Google login + forgot password + i18n
│   │   └── signup/page.tsx     # Email/Google signup + i18n
│   ├── following/page.tsx      # Following list
│   ├── saved/page.tsx          # Saved creators
│   ├── profile/page.tsx        # User profile
│   ├── premium/page.tsx        # Email waitlist (MVP)
│   ├── compare/page.tsx        # Side-by-side comparison
│   ├── collection/             # Curated collections (historical, women-scholars)
│   ├── about/page.tsx          # About page
│   ├── offline/page.tsx        # PWA offline fallback
│   ├── admin/                  # Admin tools (dashboard, add-creator, manage, pipeline, sync)
│   └── api/                    # API routes (admin, AI, CRUD, Stripe, enrichment)
├── components/
│   ├── onboarding/             # 7 onboarding screens
│   ├── main/
│   │   ├── HomeScreen.tsx      # Hero, categories, trending, content types, collections
│   │   ├── UserProfile.tsx     # User profile with followed/saved creators
│   │   ├── FollowingList.tsx   # Following list
│   │   ├── PremiumUpgrade.tsx  # Email waitlist
│   │   └── FilterPanel.tsx     # Bottom sheet filter panel
│   ├── ui/
│   │   ├── AnimatedSection.tsx # Framer Motion scroll-reveal
│   │   ├── StaggerGrid.tsx     # Staggered grid entrance
│   │   ├── CreatorCard.tsx     # Horizontal card with category colors + content icons
│   │   ├── LanguageSwitcher.tsx# 6-locale dropdown
│   │   ├── CreatorLinks.tsx    # Social link badges
│   │   ├── ExternalLink.tsx    # Safe external links
│   │   ├── ShareModal.tsx      # Social sharing modal
│   │   ├── PageTransition.tsx  # Page entrance animation
│   │   ├── SkeletonCard.tsx    # Skeleton loading with shimmer
│   │   ├── BottomNav.tsx       # Tab navigation
│   │   ├── InstallPrompt.tsx   # PWA install prompt
│   │   └── button.tsx, card.tsx, tabs.tsx, ...  # shadcn/ui primitives
│   ├── content/
│   │   ├── BookList.tsx        # Book cards (covers, metadata, Amazon links)
│   │   ├── CourseList.tsx      # Course cards (platform, links)
│   │   ├── VideoList.tsx       # YouTube video grid
│   │   └── PodcastList.tsx     # Podcast display
│   ├── claim/                  # Profile claiming workflow
│   ├── PostHogProvider.tsx     # Pageview tracking + user identification
│   ├── LammaLogo.tsx          # Brand logo (dark/light/gold/icon variants)
│   ├── ActionGateModal.tsx     # Auth gate for follow/save
│   ├── EmailCaptureModal.tsx   # Email popup
│   ├── EngagementWrapper.tsx   # Engagement tracking wrapper
│   ├── navbar.tsx              # Desktop search bar + mobile menu
│   └── footer.tsx              # Footer links
├── hooks/
│   ├── useCreators.ts          # Firestore hooks (useCreatorBySlug, useCreators, etc.)
│   ├── useFollow.ts            # Firestore follow/unfollow
│   ├── useSaved.ts             # Firestore save/unsave
│   ├── useTrack.ts             # PostHog custom event tracking
│   ├── useSearchHistory.ts     # localStorage search history
│   ├── useEngagement.tsx       # Page view / session tracking
│   ├── useAI.ts                # AI feature hooks
│   └── useYouTube.ts           # YouTube data hooks
├── contexts/
│   └── AuthContext.tsx          # Firebase auth (login, signup, Google, resetPassword)
├── lib/
│   ├── firebase.ts             # Firebase config (offline persistence + multi-tab)
│   ├── posthog.ts              # PostHog client initialization
│   ├── search.ts               # Fuse.js fuzzy search utility
│   ├── seo.ts                  # SEO config (JSON-LD, metadata generators)
│   ├── utils.ts                # General utilities (cn, etc.)
│   ├── cache.ts                # Cache utilities
│   ├── queue.ts                # Background queue
│   ├── types/creator.ts        # Creator type definitions
│   ├── utils/links.ts          # URL sanitization, platform detection
│   ├── data/creators.ts        # Static seed data (487 creators)
│   ├── image-fetcher.ts        # Auto-fetch creator images (YT → Wikipedia → KG)
│   ├── youtube.ts              # YouTube API integration
│   ├── youtube-enrichment.ts   # YouTube channel enrichment (optimized: 5 units/creator)
│   ├── data-quality.ts         # Creator data audit functions
│   ├── ai/anthropic.ts         # Anthropic API for bio generation
│   ├── podcast.ts              # Podcast API integration
│   ├── api-clients/            # External API client wrappers
│   ├── api-providers/          # API provider configurations
│   └── profile-generator/      # AI profile generation
│       └── profile-pipeline/   # Multi-step enrichment pipeline
├── i18n/
│   └── request.ts              # next-intl config (cookie-based locale detection)
├── messages/
│   ├── en.json                 # English (214 keys)
│   ├── ar.json                 # Arabic (214 keys)
│   ├── ur.json                 # Urdu (214 keys)
│   ├── fr.json                 # French (214 keys)
│   ├── tr.json                 # Turkish (214 keys)
│   └── ms.json                 # Malay (214 keys)
├── public/
│   ├── robots.txt              # SEO robots file
│   ├── palm-teal.svg           # Brand palm tree icon (teal)
│   ├── palm-brown.svg          # Brand palm tree icon (brown)
│   ├── favicon.svg, icon.svg   # Favicons
│   └── sw.js                   # Generated service worker
├── scripts/
│   ├── seed-creators.ts        # CLI seeding script
│   ├── generate-assets.ts      # Favicon/icon generation from SVGs
│   ├── enrich-creators.mjs     # Batch social link enrichment
│   ├── expand-creators.mjs     # Automated creator expansion by region
│   └── expand-creators-batch*.mjs  # Batch expansion scripts
├── docs/
│   ├── specs/                  # Original build specifications
│   ├── CLAUDE_CHAT_BRIEFING.md
│   ├── LAMMA_IMPROVEMENT_PLAN.md
│   └── LINK_ARCHITECTURE.md
├── PROJECT_SYNC.md             # Source of truth for dev status
├── .nvmrc                      # Node 24
├── next.config.ts              # React Compiler, Turbopack, image optimization, security headers
├── tailwind.config.ts          # Brand colors (OKLCH tokens)
└── package.json                # Dependencies (no engines field)
```

---

## CONTEXT FOR CLAUDE CODE

When starting a session, read this file first to understand:
1. What's already built (don't rebuild existing features)
2. Current priorities (what to work on)
3. Recent changes (what just happened)
4. Known issues (what needs fixing)

### Quick Commands
```bash
cd /Users/sansanfiles/Downloads/lamma-antigravity-package/lamma-app
npm run dev          # Start dev server (port 3000)
npm run build        # Production build (Turbopack)
npm run lint         # Run ESLint (React Compiler rules)
```

### Environment
- Node.js 24 (see .nvmrc)
- Firebase project configured in `.env.local`
- Vercel deployment configured (pushes to both `main` and `vercel/set-up-vercel-web-analytics-in-m9kl9x`)
- React Compiler enabled (`reactCompiler: true` in next.config.ts)
- ESLint enforces React Compiler rules (no setState in effects, no mutable external vars)

### Git Push Checklist
When pushing changes:
```bash
git push origin main
git push origin main:vercel/set-up-vercel-web-analytics-in-m9kl9x
```

### Key Patterns
- **i18n**: Use `useTranslations("namespace")` in client components. Add keys to all 6 locale files.
- **Analytics**: Use `useTrack()` hook → `track("event_name", { ...props })`. PostHog identifies users automatically.
- **Search**: `createSearchIndex(creators)` → `searchCreators(index, query)` via Fuse.js.
- **Animations**: Wrap sections in `<AnimatedSection delay={0.1}>` for scroll reveals.
- **External links**: Always use `<ExternalLink>` component (sanitizes URLs).
- **RTL**: Arabic and Urdu are RTL. Check `locale === "ar" || locale === "ur"` for direction.

---

## HANDOFF NOTES

### From Claude Chat to Claude Code:
```
Read PROJECT_SYNC.md in the repo root first. It has:
- Current status of all features
- Active priorities
- Recent changes
- Known issues

Then work on: [SPECIFIC TASK HERE]
```

### From Claude Code to Claude Chat:
After implementation, update this file with:
1. What was changed (files, features)
2. Any new issues discovered
3. What's ready for next steps

---

## DOCUMENTATION REFERENCES

| Document | Purpose |
|----------|---------|
| `lamma-antigravity-prompt.md` | Complete build specification |
| `Lamma-Brand-Guidelines-GATHERING-TREE.md` | Brand identity, colors, logo usage |
| `Lamma-Core-Architecture-Principles.md` | Technical architecture |
| `Lamma-Region-Based-Community-Selection.md` | Region/country data structure |
| `CLAUDE_CHAT_BRIEFING.md` | Technical briefing on profile issues |

---

## SYNC CHECKLIST

Before switching between Claude Chat and Claude Code:

- [x] This file is up to date
- [x] Recent changes are logged
- [x] Active priorities are current
- [x] Known issues are documented
- [x] Git status is clean (committed and pushed)

---

*Last sync by: Claude Code (Session 16)*
*Last sync date: 2026-02-07*
*Next action: Review machine-translated locale files (FR/TR/MS/UR) with native speakers, add Noto Nastaliq Urdu font, run YouTube enrichment after API quota reset, fix ~5 wrong Wikipedia bios, set PostHog/GOOGLE_API_KEY env vars in Vercel*
