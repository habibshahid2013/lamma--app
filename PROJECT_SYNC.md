# PROJECT_SYNC.md - Lamma+ Development Status
## Last Updated: 2026-02-06 (Session 9)

This file is the **source of truth** for syncing between Claude Chat (planning) and Claude Code (implementation).

---

## PROJECT OVERVIEW

**App:** Lamma+ (Islamic Scholar Discovery Platform)
**Stack:** Next.js 16.1.5 / React 19 / Tailwind CSS 4 / Firebase / Vercel
**Node:** v24 (.nvmrc)
**Status:** MVP Development — deployed on Vercel

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

### Screens Built (12 Total Required)

| Screen | Status | File Location | Notes |
|--------|--------|---------------|-------|
| Splash Screen | DONE | `components/onboarding/SplashScreen.tsx` | Auto-advance 1.5s, tap-to-skip |
| Welcome Screen | DONE | `components/onboarding/WelcomeScreen.tsx` | Tree logo + CTA |
| Personalize Choice | DONE | `components/onboarding/PersonalizeChoice.tsx` | Two-card selection |
| Region Selection | DONE | `components/onboarding/RegionSelection.tsx` | 8 region cards |
| Country Drill-down | DONE | `components/onboarding/CountryDrilldown.tsx` | Optional, with flags |
| Interests Selection | DONE | `components/onboarding/InterestsSelection.tsx` | Topic pills |
| Suggested Creators | DONE | `components/onboarding/SuggestedCreators.tsx` | Follow buttons |
| Home Screen | DONE | `components/main/HomeScreen.tsx` | Sections + nav |
| Search Screen | DONE | `components/main/SearchScreen.tsx` | Region filters |
| Creator Profile | DONE | `app/creator/[slug]/` | **Reorganized** — see below |
| Following List | DONE | `components/main/FollowingList.tsx` | No follow limit (MVP) |
| Premium Upgrade | DONE | `components/main/PremiumUpgrade.tsx` | Email waitlist (MVP) |

### Creator Profile Architecture (Current — as of commit `a6e01df`)
```
app/creator/[slug]/
├── page.tsx                    # Server component — SEO metadata generation
└── CreatorProfileClient.tsx    # Client component — visual rendering (gold gradient)
```

### Additional Features Built
- Admin dashboard (`/admin`)
- Creator pipeline (`/admin/pipeline`)
- Sync tool (`/admin/sync`)
- Add creator form (`/admin/add-creator`)
- API routes for profile generation
- Email capture modal
- Share modal
- Firebase integration
- Vercel Analytics (`@vercel/analytics`)

### UI Components
- `BottomNav.tsx` - Tab navigation with active indicator bar + backdrop blur
- `CreatorCard.tsx` - Creator display cards with follower count, hover lift, micro-interactions
- `CreatorLinks.tsx` - External link buttons (with platform detection)
- `ExternalLink.tsx` - Safe external link with URL sanitization
- `Badge.tsx` - Status badges
- `Button.tsx` - shadcn/ui button
- `LammaLogo.tsx` - Brand logos (dark/light/gold-bg variants + icon-only mode)
- `ShareModal.tsx` - Social sharing
- `PageTransition.tsx` - Reusable Framer Motion page entrance animation wrapper
- `SkeletonCard.tsx` - Skeleton loading states (SkeletonCreatorCard, Grid, Row, ProfilePage)
- And more in `components/ui/`

---

## ACTIVE PRIORITIES

### Priority 1–5: COMPLETED ✓
- Brand & Visual Polish
- Creator Profile Completeness
- Image Management
- Data & Content (seeding, YouTube, Podcasts)
- SEO & Performance

### Priority 6: Code Quality & Link Fixes — COMPLETED (Session 4)
- [x] Fixed dead `/explore` links → now point to `/search` with query params
- [x] Search page reads `?topic=`, `?category=`, `?region=` query params on mount
- [x] Deleted unused grey card components (`components/creator/` directory)
- [x] Verified image fetcher already implemented (`lib/image-fetcher.ts` + `/api/creators/fetch-images`)
- [x] Build passes locally

### Priority 7: Production Deployment — IN PROGRESS
- [x] Vercel deployment working (both `main` and `vercel/set-up-vercel-web-analytics-in-m9kl9x` branches synced)
- [x] Vercel Analytics integrated
- [x] Creator profile design restored (gold gradient)
- [ ] Stripe integration for premium subscriptions
- [x] Run image fetcher batch check — all 71 creators already have images, no batch needed
- [x] Review and QA locally — all pages return 200, no server errors

### Priority 8: Engagement & Following System — COMPLETE (Session 5)
- [x] `hooks/useEngagement.tsx` — Track page views, profile views (already existed)
- [x] `EmailCaptureModal.tsx` — Email popup after engagement threshold (already existed)
- [x] `ActionGateModal.tsx` — Gate for Follow/Save when not logged in (already existed)
- [x] `EngagementWrapper.tsx` — Wired into app layout (already existed)
- [x] `hooks/useFollow.ts` — Firestore follow/unfollow with 5-follow free plan limit (already existed)
- [x] `app/api/subscribe/route.ts` — Save emails to Firestore `subscribers` collection (already existed)
- [x] Connect follow button to Firestore `users/{uid}/following` — Wired `useFollow` hook + `ActionGateModal` into `CreatorProfileClient.tsx`
- [x] Wire follow button into `CreatorCard.tsx` — Uses `useFollow` hook internally as fallback, with auth gate for unauthenticated users

### Priority 9: Mobile Responsiveness Audit — COMPLETE (Session 6)
- [x] Creator profile page — cover image, avatar, title, tabs all responsive at 375px
- [x] Home screen — card grid no longer overflows, skeleton loaders match card widths
- [x] Search page — filter chips, language pills, gender toggle all meet 44px touch targets
- [x] Onboarding flow — interest pills and follow buttons meet WCAG touch targets (min-h-[44px])
- [x] Bottom navigation — touch targets adequate, `safe-bottom` CSS class now defined
- [x] iOS safe area — viewport `viewportFit: 'cover'` added to layout.tsx
- [x] Missing CSS utilities — `.safe-bottom` and `.scrollbar-hide` added to globals.css

### Priority 10: Data Quality Audit — COMPLETE (Session 6-7)
- [x] Audited 10 random creators from seed data
- [x] Fixed: Boonaa Mohammed — wrong country/region/language (was SO/east_africa/Somali, now CA/americas/English)
- [x] Fixed: Omar Suleiman — bogus YouTube URL (@yaborhereareany → @OmarSuleiman)
- [x] Fixed: Dave Chappelle — removed fake Muslim Central podcast link
- [x] Enriched all 68 creators with bios (100% coverage, was 28%)
- [x] Added YouTube links for 26 creators (was 1)
- [x] Added Twitter links for 20 creators (was 0)
- [x] Added Instagram links for 28 creators (was 0)
- [x] Added website links for 17 creators (was 0)
- [x] Removed bogus muslimcentral podcast links for non-scholar entertainers/politicians

### Priority 11: Creator Database Expansion — COMPLETE (Session 7-8)
- [x] Expanded database from 68 to 210 creators (+142 new profiles)
- [x] Added creators across all 8 regions with proper distribution
- [x] Created expansion script (`scripts/expand-creators.mjs`) for automated data insertion
- [x] Created enrichment script (`scripts/enrich-creators.mjs`) for batch social link updates
- [x] Expanded from 210 to 487 creators via 3 batch scripts (batch2, batch3, final)
- [x] Build passes, pushed to both branches

### Priority 12: Branding Fix — COMPLETE (Session 8)
- [x] Replaced all stroke-based SVG logos with solid filled palm tree silhouettes
- [x] Updated `palm-brown.svg`, `logo-dark.svg`, `logo-light.svg` to match brand palette
- [x] Fixed `Logo.tsx` aspect ratio to 320x80 (4:1)
- [x] `LammaLogo.tsx` already had correct filled paths from prior session

### Priority 13: Premium → Email Waitlist (MVP) — COMPLETE (Session 8)
- [x] Removed 5-follow free plan limit from `useFollow.ts`
- [x] Simplified FollowingList status banner (no "Free Plan" indicator)
- [x] Converted `PremiumUpgrade.tsx` from Stripe checkout to email collection page
- [x] Emails saved to Firestore `waitlist` collection (with dedup)
- [x] Updated `PremiumCTABanner` in CreatorProfileClient to "Join Waitlist"
- [x] Stripe API routes kept intact but unused
- [x] Admin dashboard updated: "Premium" stat → "Waitlist" counter

### Priority 14: CI Fix + UX Modernization — COMPLETE (Session 9)

**CI Fix:**
- [x] Fixed GitHub Actions build failure — Firebase `auth/invalid-api-key` error caused by empty env secrets
- [x] Rewrote `lib/firebase.ts` with lazy Proxy-based initialization (defers Firebase init from import-time to first property access)
- [x] Build passes both with and without Firebase env vars

**UX Modernization (framer-motion added):**
- [x] Splash screen — reduced auto-advance from 2.5s→1.5s, added tap-to-skip, "Tap to continue" hint
- [x] Filter panel — converted from full-screen modal to bottom sheet (slide-up spring animation, backdrop blur, drag handle)
- [x] Page transitions — new `PageTransition.tsx` wrapper (Framer Motion fade + Y-translate)
- [x] Skeleton loading — new `SkeletonCard.tsx` with 4 skeleton variants (card, grid, row, profile page)
- [x] Creator cards — added follower count display, hover lift (`-translate-y-1`), improved shadows, `active:scale-95` on follow button
- [x] HomeScreen header — replaced icon-only header with tappable search bar + compact palm icon logo
- [x] "See All" CTAs — added to "For You" and "Muslim Voices" home sections
- [x] BottomNav — added teal indicator bar on active tab, smooth transitions, backdrop blur
- [x] Creator Profile — replaced spinner with `SkeletonProfilePage`, added animated tab indicator (`layoutId`), tab content fade transitions (`AnimatePresence`)
- [x] Search — added sort dropdown (Relevant / A-Z / Most Followed), improved empty state (compass icon), replaced loading rectangles with skeleton components
- [x] LammaLogo — added `icon` size variant (renders PalmIcon only, used in compact header)

---

## RECENT CHANGES LOG

### 2026-02-06 — CI Fix + UX Modernization (Session 9)

**Context:** GitHub Actions CI was failing on every push because Firebase env secrets were not configured. Additionally, the UX felt dated — splash screen forced a 2.5s wait, filter panel took over full screen, loading states used basic spinners, and transitions were abrupt.

**CI Fix:**
1. **Root cause:** `lib/firebase.ts` eagerly called `initializeApp()` at import time. In CI, `NEXT_PUBLIC_FIREBASE_*` secrets were empty strings, causing `auth/invalid-api-key` during `next build`.
2. **First attempt (failed):** Made exports conditionally undefined (`Firestore | undefined`). Caused TypeScript errors in 20+ consumer files that expect non-optional types.
3. **Final fix:** Used JavaScript `Proxy` pattern for lazy initialization. Exports remain typed as `Firestore`, `Auth`, etc. (non-optional). Actual Firebase init is deferred to first property access at runtime. Build succeeds with empty env vars (CI) and real vars (.env.local).

**UX Modernization:**

*New dependency added: `framer-motion`*

| File | Changes |
|------|---------|
| `lib/firebase.ts` | Lazy Proxy-based initialization for CI compatibility |
| `components/onboarding/SplashScreen.tsx` | 1.5s auto-advance, tap-to-skip, hint text |
| `components/main/FilterPanel.tsx` | Bottom sheet with spring animation, backdrop blur, drag handle |
| `components/ui/PageTransition.tsx` | **NEW** — Reusable Framer Motion page transition wrapper |
| `components/ui/SkeletonCard.tsx` | **NEW** — 4 skeleton components matching real content shapes |
| `components/ui/CreatorCard.tsx` | Follower count badge, hover lift, shadow improvements, active:scale-95 |
| `components/main/HomeScreen.tsx` | Search bar header, "See All" CTAs, skeleton loading states |
| `components/ui/BottomNav.tsx` | Active indicator bar, size transitions, backdrop blur |
| `app/creator/[slug]/CreatorProfileClient.tsx` | SkeletonProfilePage, animated tab indicator (layoutId), AnimatePresence tab content transitions |
| `components/main/SearchScreen.tsx` | Sort dropdown (Relevant/A-Z/Followers), improved empty state, skeleton loading |
| `components/LammaLogo.tsx` | Added `icon` size variant (compact palm tree only) |

**Build:** Passes with 0 errors. All 43 routes generate successfully.

### 2026-02-06 — Branding, Database Expansion, Premium→Waitlist (Session 8)

**Context:** Continuation of Session 7. Fixed branding, expanded to 487 creators, and converted premium paywall to email waitlist for MVP.

**Branding Fix:**
1. **SVG Logos** — All SVG files (`palm-brown.svg`, `logo-dark.svg`, `logo-light.svg`) were stroke-based outlines. Replaced with solid filled palm tree silhouettes matching brand palette images.
2. **Logo.tsx** — Fixed aspect ratio from 260x64 to 320x80 (4:1 ratio).
3. **Brand colors used:** Primary Teal `#0D7377`, Deep Teal `#1D4E5F`, Warm Gold `#F5B820`.

**Database Expansion (210 → 487 creators):**
1. Created and ran 3 batch scripts: `expand-creators-batch2.mjs` (+149), `expand-creators-batch3.mjs` (+69), `expand-creators-final.mjs` (+59)
2. Final distribution: Americas 106, Europe 71, Middle East 70, South Asia 69, Southeast Asia 52, North Africa 43, West Africa 39, East Africa 32, Africa 5
3. Gender split: ~86% male / 14% female
4. Scripts handle dedup by checking existing IDs

**Premium → Email Waitlist (MVP):**
1. **useFollow.ts** — Removed 5-follow free plan limit. `followLimit` set to `Infinity`.
2. **FollowingList.tsx** — Simplified status banner (just "Following X creators", no "/ 5" or "Upgrade →").
3. **PremiumUpgrade.tsx** — Completely rewritten from Stripe checkout to email collection form. Saves to Firestore `waitlist` collection with dedup.
4. **CreatorProfileClient.tsx** — `PremiumCTABanner` now says "Premium Coming Soon" / "Join Waitlist" instead of "Go Premium".
5. **Admin dashboard** — Replaced "Premium" stat card with "Waitlist" counter.
6. **Stripe code kept intact** — API routes (`/api/stripe/create-checkout`, `/api/stripe/webhook`), success/cancel pages all preserved but unused.

**Commits:**
- `39ad040` — Fix branding: replace stroke-based SVGs with filled palm tree silhouettes
- `720aa41` — Expand creator database from 210 to 487 profiles
- `579f1f0` — Disable premium paywall for MVP, replace with email waitlist
- `f2b40c3` — Update admin dashboard: replace Premium stat with Waitlist counter

### 2026-02-06 — Data Enrichment & Database Expansion (Session 7)

**Context:** Creator data had systemic quality issues (no bios, no social links, bogus podcast links). Goal is 500 creator profiles. Started with 68, now at 210.

**Data Enrichment (68 existing creators):**
1. **Bios** — Added `note` field for all 68 creators (was 19/68 = 28%, now 68/68 = 100%)
2. **YouTube** — Added links for 26 creators (was 1)
3. **Twitter** — Added links for 20 creators (was 0)
4. **Instagram** — Added links for 28 creators (was 0)
5. **Website** — Added links for 17 creators (was 0)
6. **Bogus links removed** — Removed fake `feeds.muslimcentral.com` podcast links from 11 non-scholar creators (entertainers, politicians, athletes)
7. **Enrichment script** — Created `scripts/enrich-creators.mjs` for programmatic batch updates

**Database Expansion (68 → 210 creators):**
Added 142 new creator profiles across all regions:
- West Africa (25): Nigeria, Ghana, Senegal, Mali, Gambia
- North Africa (21): Egypt, Morocco, Tunisia, Algeria, Libya
- South Asia (37): India, Pakistan, Bangladesh, Sri Lanka
- Southeast Asia (22): Indonesia, Malaysia, Philippines, Singapore
- Middle East (29): Saudi Arabia, UAE, Kuwait, Jordan, Palestine, Turkey
- East Africa (14): Somalia, Kenya, Tanzania, Ethiopia
- Europe (19): UK, France, Germany, Netherlands, Sweden, Bosnia
- Americas (43): USA, Canada

**Regional distribution after expansion:**
- Americas: 43 (20%), South Asia: 37 (18%), Middle East: 29 (14%)
- West Africa: 25 (12%), Southeast Asia: 22 (10%), North Africa: 21 (10%)
- Europe: 19 (9%), East Africa: 14 (7%)

**Scripts added:**
- `scripts/enrich-creators.mjs` — Batch social link enrichment for existing creators
- `scripts/expand-creators.mjs` — Automated insertion of new creator profiles by region

**Files changed:**
- `lib/data/creators.ts` — Expanded from 2108 lines to ~5000+ lines (68 → 210 creators)
- `scripts/enrich-creators.mjs` — New enrichment script
- `scripts/expand-creators.mjs` — New expansion script

**Build:** Passes locally with no errors. Pushed to both branches.

**Commits:**
- `4d46bdc` — Enrich all 68 creators with bios, YouTube, and social links
- `8407f88` — Expand creator database from 68 to 210 profiles

### 2026-02-03 — Mobile Responsiveness & Data Quality Audit (Session 6)

**Context:** MVP is feature complete. Two parallel audits were performed: (1) Mobile responsiveness at 375px viewport width, and (2) Data quality check on 10 random creators from seed data.

**Mobile Responsiveness Fixes:**
1. **CreatorCard.tsx** — Card width `w-44` caused overflow at 375px (2 cards + gap + padding = 400px > 375px). Changed to `w-40 sm:w-44`. Share button touch target increased (`p-1.5` → `p-2`). Card padding reduced on mobile (`p-3 sm:p-4`).
2. **CreatorProfileClient.tsx** — Cover image `h-48` → `h-36 sm:h-48` (was 51% of viewport). Avatar `w-32` → `w-24 sm:w-32`. Overlap `-mt-20` → `-mt-14 sm:-mt-20`. Title `text-3xl` → `text-2xl sm:text-3xl`. Tab navigation: added `snap-x snap-mandatory -mx-4 px-4` for horizontal scroll snap.
3. **SearchScreen.tsx** — Filter chips: `text-[10px]` → `text-xs`, X buttons `w-3` → `w-3.5` with padding. Language pills: `py-1.5 text-[10px]` → `py-2 text-xs`. Results grid: `gap-4` → `gap-3`.
4. **SuggestedCreators.tsx** — Follow button: `py-2` → `py-2.5` with `min-h-[44px]` for WCAG touch targets.
5. **InterestsSelection.tsx** — Pill buttons: `px-6 py-3` → `px-5 py-3.5` with `min-h-[44px]`.
6. **globals.css** — Added `.safe-bottom` (iOS safe area inset) and `.scrollbar-hide` utility classes that were used but never defined.
7. **layout.tsx** — Added `Viewport` export with `viewportFit: 'cover'` for iOS safe area support.
8. **HomeScreen.tsx** — Skeleton loader widths updated to match responsive cards (`w-44` → `w-40 sm:w-44`).

**Data Quality Fixes:**
1. **Boonaa Mohammed** — Wrong region/country/language. He's Canadian (Ethiopian descent), not Somali. Fixed: region `east_africa` → `americas`, country `SO` → `CA`, flag 🇸🇴 → 🇨🇦, removed `Somali` from languages.
2. **Omar Suleiman** — YouTube URL was bogus (`@yaborhereareany`). Fixed to `@OmarSuleiman`.
3. **Dave Chappelle** — Had fake Muslim Central podcast link (Muslim Central hosts Islamic lectures, not comedy). Removed link, updated note.

**Systemic Data Issues Found (not fixed — needs future batch):**
- Most creators only have auto-generated `feeds.muslimcentral.com/{slug}` podcast links
- 8/10 creators have no bio/note field
- Only 1/10 creators had a YouTube socialLinks entry (and it was wrong)

**Files changed:**
- `components/ui/CreatorCard.tsx` — Responsive widths, touch targets
- `app/creator/[slug]/CreatorProfileClient.tsx` — Responsive cover, avatar, tabs
- `components/main/SearchScreen.tsx` — Touch targets, filter chips
- `components/main/HomeScreen.tsx` — Skeleton loader widths
- `components/onboarding/SuggestedCreators.tsx` — Touch targets
- `components/onboarding/InterestsSelection.tsx` — Touch targets
- `app/globals.css` — Added safe-bottom and scrollbar-hide
- `app/layout.tsx` — Added Viewport export
- `lib/data/creators.ts` — Fixed 3 creator data errors

**Build:** Passes locally with no errors.

### 2026-02-03 — Follow System Wiring (Session 5)

**Context:** Continuing from Session 4. The engagement and following system components all existed but the creator profile's follow button was using local `useState` instead of the Firestore-backed `useFollow` hook.

**Changes made:**
1. **Wired `useFollow` hook** into `CreatorProfileClient.tsx` — replaced local `useState` toggle with Firestore-backed `isFollowing(creator.id)`, `toggleFollow`, and `followLoading` state
2. **Added `ActionGateModal`** to creator profile — unauthenticated users clicking Follow see auth gate modal (sign up / sign in prompt)
3. **Follow error handling** — displays error message if follow fails (e.g., hitting 5-follow free plan limit)
4. **Disabled state** — follow button shows loading state while Firestore operation is in progress
5. **Wired `useFollow` into `CreatorCard.tsx`** — card uses `useFollow` hook internally as fallback when `isFollowing`/`onFollow` props aren't provided. Call sites that already pass these props (HomeScreen, FollowingList) continue working unchanged. Call sites that didn't (SearchScreen, WomenScholarsRow, LanguageRow, RegionSection, compare, collections) now automatically get Firestore-backed follow behavior.
6. **Added `ActionGateModal` to `CreatorCard.tsx`** — auth gate for unauthenticated follow clicks on any card
7. **Image fetcher check** — all 71 creators already have images, no batch update needed
8. **QA check** — all pages return 200 with no server errors (home, search, following, premium, creator profiles, collections, compare, search with query params)

**Files changed:**
- `app/creator/[slug]/CreatorProfileClient.tsx` — Added `useFollow` hook, `ActionGateModal`, auth-gated follow handler
- `components/ui/CreatorCard.tsx` — Added `useFollow` + `useAuth` hooks as internal fallback, `ActionGateModal`, `handleFollowAction` with auth check

**Build:** Passes locally with no errors.

### 2026-02-03 — Code Quality, Link Fixes & Cleanup (Session 4)

**Context:** Claude Chat created task docs in `~/Downloads/Update/` folder (`CLAUDE_CODE_TASKS.md` and `PROJECT_SYNC_UPDATED.md`). After auditing the codebase against these tasks, most features listed as "missing" were actually already implemented. The real issues found and fixed were:

**Issues found and fixed:**
1. **Dead `/explore` links** — Creator profile had clickable topics, categories, and regions linking to `/explore?...` but no `/explore` route exists. Fixed to `/search?...`
2. **Search page didn't read query params** — Added `useSearchParams()` + `useEffect` to `SearchScreen.tsx` so it pre-populates search term (from `?topic=`) and filters (from `?category=` and `?region=`) on mount
3. **Suspense boundary needed** — Wrapped SearchScreen in `<Suspense>` in `app/search/page.tsx` (required by Next.js for `useSearchParams`)
4. **Unused components deleted** — Removed `components/creator/` directory (5 files: `CreatorHeaderCard.tsx`, `CreatorStats.tsx`, `CreatorEmbeds.tsx`, `CreatorContent.tsx`, `index.ts`)

**What was already working (contrary to task doc expectations):**
- Social links bar — already rendered via `<CreatorLinks>` component
- YouTube section — already has About tab summary + Videos tab with recent videos grid
- Podcast section — already renders with image, episode count, listen button
- Books section — already renders with thumbnails, descriptions, preview links
- eBooks, Audiobooks, Courses tabs — all already implemented
- Image fetcher — `lib/image-fetcher.ts` and `/api/creators/fetch-images/route.ts` already existed

**Files changed:**
- `app/creator/[slug]/CreatorProfileClient.tsx` — `/explore` → `/search` links
- `components/main/SearchScreen.tsx` — Added query param reading
- `app/search/page.tsx` — Added Suspense boundary

**Files deleted:**
- `components/creator/CreatorHeaderCard.tsx`
- `components/creator/CreatorStats.tsx`
- `components/creator/CreatorEmbeds.tsx`
- `components/creator/CreatorContent.tsx`
- `components/creator/index.ts`

**Build:** Passes locally with no errors.

### 2026-02-03 — Creator Profile Reorganization (Session 3)

**Context:** The creator profile had a major design regression. Commit `de54fd9` introduced a shadcn/ui Card-based redesign that made the profile look washed out with grey overlays. The user wanted the original gold gradient design from commit `cc35b14` restored — but properly organized, not just copy-pasted.

**Issues encountered and fixed:**
1. **Design regression** — Reverted from grey card layout back to teal-to-gold gradient
2. **TypeScript errors** — `TierBadge` only accepted 3 tiers but type had 4 (`community` was added)
3. **VerificationLevelBadge** — didn't handle `'none'` value, would crash
4. **Vercel deploying wrong branch** — was building from `vercel/set-up-vercel-web-analytics-in-m9kl9x` instead of `main`
5. **Node version mismatch** — `engines` field in package.json forced Node 20 when Vercel had Node 24
6. **Non-existent packages in optimizePackageImports** — `@radix-ui/react-icons` and `framer-motion` not installed
7. **Missing `@vercel/analytics`** — was imported but not installed

**Final solution (commit `a6e01df`):**
- `page.tsx` — Server component for SEO metadata (fetches from Firestore, generates Open Graph/Twitter cards)
- `CreatorProfileClient.tsx` — Client component with the gold gradient design, all type issues fixed
- Both branches synced to same commit
- Build passes locally and on Vercel

**See `CLAUDE_CHAT_BRIEFING.md` for full technical details.**

### 2026-02-01 — SEO & Performance (Session 2)
- Created `lib/seo.ts`, `app/sitemap.ts`, `public/robots.txt`
- Updated `next.config.ts` with image optimization, security headers, caching
- Created data seeding system

### 2026-02-01 — Brand Polish (Session 1)
- Fixed logo SVGs with correct brand colors
- Confirmed tailwind.config.ts has complete brand palette

---

## KNOWN ISSUES

1. **Creator images** — Some profiles may show fallback avatar (first-letter gradient) instead of actual photo. Image fetcher exists at `/api/creators/fetch-images` — needs batch run on production to populate missing avatars.
2. ~~**Premium flow**~~ — **RESOLVED (Session 8)**: Stripe integration code kept intact but disabled for MVP. Premium page converted to email waitlist collection. Follow limits removed.
3. ~~**`components/creator/` directory**~~ — **RESOLVED (Session 4)**: Old grey card components deleted.
4. **Vercel branch situation** — Both `main` and `vercel/set-up-vercel-web-analytics-in-m9kl9x` must stay synced. Any push to `main` should also be pushed to the Vercel branch.
5. ~~**Following system**~~ — **RESOLVED (Session 5)**: Follow button on creator profile and all CreatorCards now use Firestore-backed `useFollow` hook with auth gate for unauthenticated users.
6. ~~**Engagement tracking**~~ — **RESOLVED (Session 4/5)**: `EngagementWrapper` already wired into app layout with page view tracking, session timing, and email capture modal.
7. ~~**Mobile responsiveness**~~ — **RESOLVED (Session 6)**: Full audit at 375px viewport. Fixed card overflow, touch targets, iOS safe areas, tab scrolling, and missing CSS utilities.
8. ~~**Data quality — systemic**~~ — **RESOLVED (Session 7)**: All 68 original creators now have bios (100% coverage). YouTube, Twitter, Instagram, website links added where available. Bogus podcast links removed from non-scholars.
9. ~~**Database expansion**~~ — **RESOLVED (Session 8)**: Expanded from 210 to 487 creators across 9 regions, 10 categories.
10. ~~**Branding/Logo**~~ — **RESOLVED (Session 8)**: All SVG logos now use solid filled paths matching brand palette images.
11. **Stripe env vars** — When ready to enable premium, set `STRIPE_SECRET_KEY`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_YEARLY_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` in Vercel.
12. **Firestore seeding** — 487 creators in static data need to be seeded to Firestore via admin dashboard "Seed Data" button or `POST /api/admin/seed?action=seed`.
13. **GitHub Actions secrets** — Firebase env vars need to be configured in repo settings (`github.com/habibshahid2013/lamma--app/settings/secrets/actions`) for CI to run Firebase-dependent tests. The lazy Proxy fix allows builds without secrets, but runtime features still need real keys.
14. ~~**CI build failure**~~ — **RESOLVED (Session 9)**: Firebase lazy initialization via Proxy pattern. Build passes with or without env vars.

---

## FILE STRUCTURE (Key Files)

```
lamma-app/
├── app/
│   ├── layout.tsx            # Root layout with SEO + Vercel Analytics
│   ├── page.tsx              # Landing/splash
│   ├── sitemap.ts            # Dynamic sitemap from Firestore
│   ├── home/page.tsx         # Main home screen
│   ├── search/page.tsx       # Search page
│   ├── creator/[slug]/
│   │   ├── page.tsx          # Server component — SEO metadata
│   │   └── CreatorProfileClient.tsx  # Client component — gold gradient UI
│   ├── following/page.tsx    # Following list
│   ├── premium/page.tsx      # Premium upgrade
│   ├── admin/                # Admin tools
│   └── api/                  # API routes
│       └── admin/seed/route.ts  # Data seeding API
├── components/
│   ├── onboarding/           # 7 onboarding screens
│   ├── main/                 # Main app screens
│   ├── ui/                   # Reusable UI components
│   │   ├── CreatorLinks.tsx  # Social link badges (platform detection)
│   │   ├── ExternalLink.tsx  # Safe external links
│   │   ├── PageTransition.tsx # Framer Motion page transition wrapper
│   │   ├── SkeletonCard.tsx  # Skeleton loading components (Card, Grid, Row, Profile)
│   │   └── button.tsx        # shadcn/ui button
│   ├── content/              # Video/podcast lists
│   ├── claim/                # Profile claiming
│   └── LammaLogo.tsx         # Brand logo component
├── hooks/
│   └── useCreators.ts        # Firestore hooks (useCreatorBySlug, useCreators, etc.)
├── contexts/
│   └── AuthContext.tsx        # Firebase auth context
├── lib/
│   ├── firebase.ts           # Firebase config
│   ├── seo.ts                # Central SEO configuration
│   ├── types/creator.ts      # Creator type definitions
│   ├── utils/links.ts        # URL sanitization, platform detection
│   ├── data/creators.ts      # Static seed data (487 creators)
│   ├── image-fetcher.ts      # Auto-fetch creator images
│   ├── youtube.ts            # YouTube API integration
│   └── podcast.ts            # Podcast API integration
├── public/
│   ├── robots.txt            # SEO robots file
│   ├── palm-teal.svg         # Brand palm tree icon (teal)
│   ├── palm-brown.svg        # Brand palm tree icon (brown)
│   ├── favicon.svg
│   └── icon.svg
├── scripts/
│   ├── seed-creators.ts      # CLI seeding script
│   ├── enrich-creators.mjs   # Batch social link enrichment
│   ├── expand-creators.mjs   # Automated creator expansion by region
│   ├── expand-creators-batch2.mjs  # Batch 2 expansion (210→359)
│   ├── expand-creators-batch3.mjs  # Batch 3 expansion (359→428)
│   └── expand-creators-final.mjs   # Final expansion (428→487)
├── docs/
│   ├── specs/                # Original build specifications
│   ├── CLAUDE_CHAT_BRIEFING.md
│   ├── LAMMA_IMPROVEMENT_PLAN.md
│   └── LINK_ARCHITECTURE.md
├── PROJECT_SYNC.md           # Source of truth for dev status
├── .nvmrc                    # Node 24
├── next.config.ts            # Performance optimizations
├── tailwind.config.ts        # Brand colors
└── package.json              # Dependencies (no engines field)
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
npm run build        # Production build
npm run lint         # Run linter
```

### Environment
- Node.js 24 (see .nvmrc)
- Firebase project configured in `.env.local`
- Vercel deployment configured (pushes to both `main` and `vercel/set-up-vercel-web-analytics-in-m9kl9x`)

### Git Push Checklist
When pushing changes:
```bash
git push origin main
git push origin main:vercel/set-up-vercel-web-analytics-in-m9kl9x
```

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
| `CLAUDE_CHAT_BRIEFING.md` | Technical briefing on profile issues for Claude Chat |

---

## SYNC CHECKLIST

Before switching between Claude Chat and Claude Code:

- [x] This file is up to date
- [x] Recent changes are logged
- [x] Active priorities are current
- [x] Known issues are documented
- [x] Git status is clean (committed and pushed)

---

*Last sync by: Claude Code (Session 9)*
*Last sync date: 2026-02-06*
*Next action: Configure GitHub Actions Firebase secrets, seed 487 creators to Firestore, run image fetcher, production QA*
