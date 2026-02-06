# LAMMA+ Complete Build Prompt for Antigravity
## Faith Content Creator Discovery Platform

---

# 🎯 PROJECT OVERVIEW

**App Name:** Lamma+ (لمّة)
**Meaning:** "Gathering" in Arabic
**Tagline:** "Gather in Faith"

**What it is:** A faith-based content creator discovery platform - think "IMDb for religious scholars and educators." Users discover, follow, and watch content from Islamic scholars and educators. Built to eventually scale to ALL faith traditions.

**Tech Stack:**
- Frontend: Next.js 14+ with App Router
- Styling: Tailwind CSS
- Icons: Lucide React
- Database: Firebase Firestore
- Auth: Firebase Auth
- Hosting: Vercel
- Payments: Stripe (future)

---

# 🌳 BRAND IDENTITY

## Colors
```
Primary Teal:    #0D7377  (buttons, links, primary actions)
Deep Teal:       #1D4E5F  (dark text, accents)
Teal Light:      #E6F4F4  (selected states, light backgrounds)
Warm Gold:       #F5B820  (featured sections, premium, highlights)
Gold Light:      #FEF9E7  (subtle gold backgrounds)
White:           #FFFFFF  (backgrounds)
Off-White:       #FAFAFA  (card backgrounds)
Dark Gray:       #333333  (body text)
```

## Logo
- Tree icon (🌳) representing "The Gathering Tree"
- Wordmark: "LAMMA+" in bold
- Tree symbolizes: roots (tradition), branches (community), leaves (growth)

## Typography
- Font: Inter (Google Fonts)
- Headings: Bold (700)
- Body: Regular (400)

---

# 📱 SCREENS TO BUILD (12 Total)

## ONBOARDING FLOW (7 screens)

### Screen 1: Splash Screen
- Gold (#F5B820) background
- Centered tree icon (🌳) - large
- "LAMMA+" text in teal (#0D7377)
- "Gather in Faith" tagline
- 3 animated loading dots
- Auto-advance after 2.5 seconds

### Screen 2: Welcome Screen
- Top 40%: Illustration placeholder area
- Tree icon + "LAMMA+" logo
- Headline: "Your Gathering Place"
- Subtext: "Discover scholars and educators who inspire your journey"
- "Get Started" button (teal, full width)
- "Already have an account? Sign in" link

### Screen 3: Personalization Choice
- Back arrow top left
- Headline: "How would you like to explore?"
- Two large tappable cards:
  1. 🎯 "Personalize for me" - "Help me find scholars who resonate with my background"
  2. 🌍 "Show me everything" - "I'll browse all creators"
- Selected card: teal border + light teal background
- "You can change this anytime in Settings"
- Continue button

### Screen 4: Region Selection (NOT country checkboxes!)
- Back arrow
- Headline: "What region connects to your heritage?"
- Subtext: "Select any that resonate with you"
- 2-column grid of 8 region cards:
  - 🌍 East Africa
  - 🌍 West Africa
  - 🌍 North Africa
  - 🌙 Middle East
  - 🌏 South Asia
  - 🌏 Southeast Asia
  - 🌎 Americas
  - 🌍 Europe
- Multiple selection allowed
- Selected: teal border + light teal background
- "Continue" button
- "Skip - show me everything" link

### Screen 5: Country Drill-down (Optional)
- Only shows if user selected a region
- Headline: "Want to get more specific?"
- "(Optional)" subtext
- Shows "You selected: [Region Name]"
- 3-column grid of countries WITH FLAGS:
  - East Africa: 🇸🇴 Somalia, 🇪🇹 Ethiopia, 🇪🇷 Eritrea, 🇩🇯 Djibouti, 🇰🇪 Kenya, 🇹🇿 Tanzania, 🇺🇬 Uganda, 🇷🇼 Rwanda
  - West Africa: 🇳🇬 Nigeria, 🇸🇳 Senegal, 🇬🇭 Ghana, 🇲🇱 Mali, 🇳🇪 Niger, 🇬🇳 Guinea, etc.
  - (See full list in documentation)
- "Continue" button
- "Keep it broad - [Region] is fine" link

### Screen 6: Interests Selection
- Back arrow
- "Step 2 of 3" indicator
- Headline: "What topics interest you?"
- Flowing pill/chip buttons:
  - 📖 Quran & Tafsir
  - 📚 Hadith & Sunnah
  - 🌱 Spirituality & Growth
  - 👨‍👩‍👧 Family & Parenting
  - 👥 Youth & Identity
  - 🏛️ History & Heritage
  - ⚖️ Social Issues
  - ✨ New to Faith
- Unselected: white + gray border
- Selected: teal background + white text
- "Continue" button
- "Skip - show me everything" link

### Screen 7: Suggested Creators
- Headline: "Welcome to the gathering 🌳"
- Subtext: "Here are some scholars you might like"
- 4 creator cards with:
  - Avatar (circle)
  - Name
  - Category + verified badge
  - "Follow" button (teal outline, toggles to "Following ✓")
- "See more suggestions" link
- "Start Exploring" button (teal, full width)

---

## MAIN APP SCREENS (5 screens)

### Screen 8: Home Screen
**Header (sticky):**
- Left: 🌳 LAMMA+ logo
- Right: Search icon + Profile avatar

**Content sections:**
1. Featured banner (gold background): "Welcome to the gathering 🌳"
2. "For You" - horizontal scroll of creator cards
3. "From Your Region" - horizontal scroll (only if user selected regions)
4. "Browse Topics" - horizontal scroll of topic pills
5. "Trending" - 2 larger vertical creator cards

**Bottom Navigation (fixed):**
- Home (active), Search, Saved, Following, Profile
- Active = teal filled icon
- Inactive = gray outline icon

### Screen 9: Search Screen
**Header:**
- Back arrow
- Search input with placeholder "Search scholars, topics..."

**Region filter pills (horizontal scroll):**
- "All" (selected default), "East Africa", "West Africa", etc.

**Content:**
- Recent Searches (with X to remove)
- Popular Topics (2x3 grid with emojis)
- Trending Creators (2 cards)

### Screen 10: Creator Profile
**Header:**
- Back arrow left
- Share icon right

**Profile section (centered):**
- Large avatar (80px)
- Name (bold, large)
- "✓ Verified · Scholar"
- 📍 Location
- 🗣️ Languages
- Region badge pill (🌍 East Africa)
- "Following ✓" and "Share" buttons

**About section:**
- Bio text with "Read more" toggle

**Content tabs:**
- Videos | Podcasts | Books
- Active tab: teal underline

**Content list:**
- Thumbnail + title + views + date

**Footer:**
- "Is this info accurate?"
- 👍 Yes / 👎 Report Issue buttons

### Screen 11: Following List
**Header:**
- Back arrow
- Title: "Following"

**Status banner (light teal):**
- "You're following X creators"
- "Free plan: X/5 maximum"
- "Upgrade for unlimited →" link

**Following list:**
- Creator cards with "Following ✓" button

**Suggested section:**
- Creator cards
- If at limit: 🔒 Upgrade button instead of Follow

### Screen 12: Premium Upgrade
**Header:**
- Back arrow only

**Hero (gold background):**
- 🌳 tree icon (large)
- "LAMMA+ Premium"
- "Unlimited access to the gathering"

**Features list:**
- ✓ Follow unlimited creators (You've followed 5/5 free)
- ✓ Ad-free experience
- ✓ Early access to new creators
- ✓ Support faith content creators

**Pricing cards:**
1. Monthly: $4.99/month (selectable)
2. Yearly: $49.99/year with "Best Value" badge + "Save 17%"

**Subscribe button (teal)**

**Footer:**
- "Cancel anytime"
- "Restore purchase" link

---

# 🗄️ DATA MODELS

## User
```typescript
interface User {
  id: string
  email: string
  displayName?: string
  avatar?: string
  regionAffiliations: string[]      // ['east_africa', 'middle_east']
  countryAffiliations?: string[]    // ['SO', 'ET'] - optional ISO codes
  interests: string[]               // ['quran', 'family', 'youth']
  followingIds: string[]            // creator IDs
  isPremium: boolean
  createdAt: Date
  updatedAt: Date
}
```

## Creator
```typescript
interface Creator {
  id: string
  name: string
  category: string                  // 'Scholar', 'Speaker', 'Educator', etc.
  verified: boolean
  verificationLevel: 'community' | 'institutional' | 'official'
  avatar?: string
  location?: string
  languages: string[]
  region: string                    // 'east_africa'
  country?: string                  // 'SO'
  countryFlag?: string             // '🇸🇴'
  bio: string
  socialLinks?: {
    youtube?: string
    spotify?: string
    website?: string
  }
  followerCount: number
  contentCount: number
  createdAt: Date
  updatedAt: Date
}
```

## Content
```typescript
interface Content {
  id: string
  creatorId: string
  title: string
  type: 'video' | 'podcast' | 'book'
  source: {
    platform: 'youtube' | 'spotify' | 'apple_podcasts' | 'other'
    url: string
    externalId?: string
  }
  thumbnail?: string
  duration?: string
  views?: number
  publishedAt: Date
  createdAt: Date
}
```

---

# 🌍 REGIONS & COUNTRIES DATA

```typescript
const REGIONS = {
  east_africa: {
    name: 'East Africa',
    emoji: '🌍',
    countries: [
      { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
      { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
      { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
      { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
      { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
      { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
      { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
      { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
    ]
  },
  west_africa: {
    name: 'West Africa',
    emoji: '🌍',
    countries: [
      { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
      { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
      { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
      { code: 'ML', name: 'Mali', flag: '🇲🇱' },
      { code: 'NE', name: 'Niger', flag: '🇳🇪' },
      { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
      { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
      { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
    ]
  },
  north_africa: {
    name: 'North Africa',
    emoji: '🌍',
    countries: [
      { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
      { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
      { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
      { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
      { code: 'LY', name: 'Libya', flag: '🇱🇾' },
      { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
    ]
  },
  middle_east: {
    name: 'Middle East',
    emoji: '🌙',
    countries: [
      { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
      { code: 'AE', name: 'UAE', flag: '🇦🇪' },
      { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
      { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
      { code: 'SY', name: 'Syria', flag: '🇸🇾' },
      { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
      { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
      { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
    ]
  },
  south_asia: {
    name: 'South Asia',
    emoji: '🌏',
    countries: [
      { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
      { code: 'IN', name: 'India', flag: '🇮🇳' },
      { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
      { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
      { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
    ]
  },
  southeast_asia: {
    name: 'Southeast Asia',
    emoji: '🌏',
    countries: [
      { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
      { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
      { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
      { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
      { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    ]
  },
  americas: {
    name: 'Americas',
    emoji: '🌎',
    countries: [
      { code: 'US', name: 'United States', flag: '🇺🇸' },
      { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    ]
  },
  europe: {
    name: 'Europe',
    emoji: '🌍',
    countries: [
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
      { code: 'FR', name: 'France', flag: '🇫🇷' },
      { code: 'DE', name: 'Germany', flag: '🇩🇪' },
      { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
      { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
      { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    ]
  },
}
```

---

# 💰 BUSINESS MODEL

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Browse, search, follow up to 5 creators |
| **Premium** | $4.99/mo or $49.99/yr | Unlimited follows, ad-free, early access |

---

# 🔑 KEY REQUIREMENTS

1. **Region-based, not ethnic** - Use broad regions (East Africa, Middle East), NOT country/ethnicity checkboxes
2. **Optional personalization** - Users can always skip and browse everything
3. **Flags with countries** - When showing specific countries, always include flag emoji
4. **Faith-agnostic architecture** - Code should use generic terms (creator, not sheikh) for future multi-faith expansion
5. **Mobile-first** - Design for 375px width, responsive up
6. **Warm & welcoming** - Gold + teal palette, tree imagery, "gathering" language

---

# 📁 FOLDER STRUCTURE

```
lamma-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Main app with screen routing
│   ├── globals.css
│   └── (auth)/
│       ├── login/page.tsx
│       └── signup/page.tsx
├── components/
│   ├── onboarding/
│   │   ├── SplashScreen.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── PersonalizeChoice.tsx
│   │   ├── RegionSelection.tsx
│   │   ├── CountryDrilldown.tsx
│   │   ├── InterestsSelection.tsx
│   │   └── SuggestedCreators.tsx
│   ├── main/
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── CreatorProfile.tsx
│   │   ├── FollowingList.tsx
│   │   └── PremiumUpgrade.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── CreatorCard.tsx
│       └── BottomNav.tsx
├── lib/
│   ├── firebase.ts
│   ├── data/
│   │   └── regions.ts
│   └── hooks/
│       └── useAuth.ts
├── tailwind.config.ts
└── package.json
```

---

# 🚀 BUILD ORDER

1. Set up Next.js + Tailwind + brand colors
2. Build all 12 screens (start with onboarding flow)
3. Add screen navigation/routing
4. Add sample data for creators
5. Connect Firebase Auth
6. Connect Firebase Firestore
7. Add state management for follows/preferences
8. Test full user flow

---

# ✅ SUCCESS CRITERIA

- [ ] Splash → Welcome → Personalize → Regions → Interests → Home flow works
- [ ] Can follow/unfollow creators
- [ ] Following limit (5 free) enforced
- [ ] Premium upgrade screen shows
- [ ] Search filters by region
- [ ] Creator profile displays all info
- [ ] Bottom navigation works
- [ ] Mobile-responsive (375px+)
- [ ] Brand colors consistent throughout

---

# 🌳 THE VISION

"In villages across Africa and the Middle East, the tree has always been where people gather - to learn from elders, to share wisdom, to grow together. Lamma+ is that tree for the digital age. A gathering place for seekers of knowledge, no matter where they are."

Build this with warmth, inclusivity, and the feeling of coming home to learn.

---

**This prompt contains everything needed to build the complete Lamma+ MVP.**
