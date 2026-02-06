# LAMMA+ Core Architecture Principles
## Faith-Agnostic, Bias-Free, Scalable Design

---

# 🎯 THE VISION

## Three-Phase Growth

```
PHASE 1 (MVP)          PHASE 2 (Growth)        PHASE 3 (Scale)
─────────────────      ─────────────────       ─────────────────
Islamic Content        ALL Muslims             ALL Faith Traditions
• Launch focus on      • Global Muslim         • Christian
  African diaspora       community             • Jewish
• ALL Muslims          • All languages         • Buddhist
  welcome from         • All backgrounds       • Hindu
  day one                                      • Sikh
                                               • And more...
```

## Core Principle

> **The platform is built for ALL people of faith. The MVP focuses on Islamic content with intentional outreach to African diaspora communities - but the architecture NEVER assumes or hardcodes any single faith tradition.**

---

# 🏗️ ARCHITECTURE PRINCIPLES

## 1. Faith-Agnostic Data Models

### ❌ WRONG (Hardcoded)
```typescript
interface Creator {
  islamicSchool: 'hanafi' | 'maliki' | 'shafii' | 'hanbali';
  mosque: string;
  quranReciter: boolean;
}
```

### ✅ CORRECT (Agnostic)
```typescript
interface Creator {
  faithTradition: string;           // "Islam", "Christianity", "Judaism", etc.
  denomination?: string;            // "Sunni", "Catholic", "Orthodox", etc.
  school?: string;                  // "Hanafi", "Jesuit", "Reform", etc.
  affiliatedInstitutions?: string[]; // Mosques, Churches, Temples, etc.
  specializations?: string[];       // Flexible array
}
```

---

## 2. Flexible Category System

### ❌ WRONG (Islamic-only)
```typescript
const categories = [
  'Quran & Tafsir',
  'Hadith',
  'Fiqh',
  'Seerah',
];
```

### ✅ CORRECT (Expandable)
```typescript
interface Category {
  id: string;
  name: string;
  faithTradition: string | null;  // null = universal
  parentCategory?: string;
  translations: Record<string, string>;
}

// Example data
const categories = [
  // Universal categories
  { id: 'scripture', name: 'Sacred Texts', faithTradition: null },
  { id: 'spirituality', name: 'Spirituality', faithTradition: null },
  { id: 'family', name: 'Family & Parenting', faithTradition: null },
  
  // Islamic categories (Phase 1)
  { id: 'quran', name: 'Quran & Tafsir', faithTradition: 'islam', parentCategory: 'scripture' },
  { id: 'hadith', name: 'Hadith', faithTradition: 'islam' },
  { id: 'fiqh', name: 'Fiqh', faithTradition: 'islam' },
  
  // Future: Christian categories (Phase 3)
  { id: 'bible', name: 'Bible Study', faithTradition: 'christianity', parentCategory: 'scripture' },
  { id: 'theology', name: 'Theology', faithTradition: 'christianity' },
  
  // Future: Jewish categories (Phase 3)
  { id: 'torah', name: 'Torah Study', faithTradition: 'judaism', parentCategory: 'scripture' },
];
```

---

## 3. Inclusive User Model

### ❌ WRONG (Assumes Muslim)
```typescript
interface User {
  madhab: string;
  prayerReminders: boolean;
}
```

### ✅ CORRECT (Universal)
```typescript
interface User {
  // Core identity (optional, user-controlled)
  faithTradition?: string;          // Optional - user can skip
  denomination?: string;            // Optional
  communityAffiliations?: string[]; // Optional - "Somali", "Nigerian", etc.
  
  // Preferences (universal)
  preferredLanguages: string[];
  contentPreferences: string[];     // Category IDs
  
  // Personalization (optional)
  enableCommunityFeatures: boolean; // User opts in
}
```

---

## 4. Verification System (Faith-Agnostic)

### ✅ CORRECT
```typescript
interface Verification {
  level: 'community' | 'institutional' | 'official';
  
  // Flexible credentials
  credentials: {
    type: string;           // "ijazah", "ordination", "rabbinical", "degree"
    institution: string;
    verifiedBy?: string;
    verifiedAt?: Date;
  }[];
  
  // Community verification (universal)
  communityEndorsements: number;
  institutionalEndorsement?: string;
}
```

---

## 5. Content Model (Platform-Agnostic)

### ✅ CORRECT
```typescript
interface Content {
  id: string;
  creatorId: string;
  
  // Source (supports any platform)
  source: {
    platform: 'youtube' | 'spotify' | 'apple_podcasts' | 'soundcloud' | 'vimeo' | 'custom';
    externalId: string;
    url: string;
  };
  
  // Flexible metadata
  title: string;
  description?: string;
  categories: string[];       // References category IDs
  tags: string[];             // Freeform tags
  language: string;
  
  // No faith-specific fields here - that comes from creator + categories
}
```

---

# 🎨 UX PRINCIPLES

## 1. Inclusive by Default

| Principle | Implementation |
|-----------|----------------|
| **No required faith selection** | Community/faith is always optional |
| **Universal onboarding** | Works for any user, personalization is additive |
| **Diverse imagery** | Show multiple backgrounds, not just one |
| **Neutral language** | "Scholars & Educators" not just "Islamic Scholars" |

## 2. Personalization as Enhancement

```
DEFAULT EXPERIENCE (Everyone)
├── Browse all creators
├── Search all content
├── Follow anyone
└── Full functionality

PERSONALIZED EXPERIENCE (Opt-in)
├── "From Your Community" section
├── Filtered recommendations
├── Language preferences
└── Community-specific features
```

## 3. Community Features are Additive

### ❌ WRONG
- Requiring community selection
- Hiding content based on background
- Assuming user's faith

### ✅ CORRECT
- Community selection is optional
- All content visible to all users
- "From Your Community" is an ADDITIONAL section, not a filter
- Users can change/remove community preferences anytime

---

# 📊 DATABASE DESIGN PRINCIPLES

## 1. No Hardcoded Enums for Faith

### ❌ WRONG
```sql
faith_tradition ENUM('islam', 'christianity', 'judaism')
```

### ✅ CORRECT
```sql
faith_tradition VARCHAR(50) -- Flexible string
-- Or reference a faith_traditions collection
```

## 2. Separate Configuration from Code

```typescript
// config/faithTraditions.ts
// This is CONFIG, not hardcoded logic

export const FAITH_TRADITIONS = {
  islam: {
    id: 'islam',
    name: 'Islam',
    denominations: ['sunni', 'shia', 'ibadi', 'sufi'],
    schools: ['hanafi', 'maliki', 'shafii', 'hanbali', 'jafari'],
    enabled: true,  // Phase 1
  },
  christianity: {
    id: 'christianity',
    name: 'Christianity',
    denominations: ['catholic', 'protestant', 'orthodox', 'evangelical'],
    schools: [],
    enabled: false, // Phase 3
  },
  judaism: {
    id: 'judaism',
    name: 'Judaism',
    denominations: ['orthodox', 'conservative', 'reform', 'reconstructionist'],
    schools: [],
    enabled: false, // Phase 3
  },
  // Easy to add more...
};
```

## 3. Feature Flags for Faith-Specific Features

```typescript
// Controlled via config, not hardcoded
const FEATURE_FLAGS = {
  islamic_content: true,      // Phase 1: ON
  christian_content: false,   // Phase 3: OFF for now
  jewish_content: false,      // Phase 3: OFF for now
  buddhist_content: false,    // Future
  
  community_features: true,   // African diaspora focus
  prayer_times: false,        // Islamic-specific, optional future feature
};
```

---

# 🌍 LANGUAGE & LOCALIZATION

## Principle: Separate Content Languages from Faith

| Language | Faith Traditions Served |
|----------|------------------------|
| English | ALL |
| Arabic | Islam (primarily), Christianity (Middle East), Judaism |
| French | Islam (West Africa, North Africa), Christianity (Africa) |
| German | Islam (Turkey diaspora), Christianity, Judaism |
| Somali | Islam (primarily) |
| Spanish | Christianity (primarily), Islam |
| Hebrew | Judaism (primarily) |

**Languages are NOT tied to faith - they're tied to users.**

---

# ✅ CHECKLIST FOR ALL DOCUMENTATION

Every document should pass these checks:

- [ ] Does NOT assume user is Muslim
- [ ] Does NOT hardcode Islamic terminology in code
- [ ] Uses flexible/configurable category systems
- [ ] Community features are optional/additive
- [ ] Can scale to other faith traditions without rewrites
- [ ] Imagery represents diversity
- [ ] Language is inclusive ("creators" not "sheikhs" in code)

---

# 📝 TERMINOLOGY GUIDE

## In Code/Database (Always Agnostic)

| Use This | Not This |
|----------|----------|
| `creator` | `sheikh`, `imam`, `scholar` |
| `faithTradition` | `religion`, `islamicSchool` |
| `institution` | `mosque`, `masjid` |
| `credential` | `ijazah` |
| `sacredText` | `quran` |
| `category` | `islamicCategory` |

## In UI (Context-Dependent)

| Context | Term |
|---------|------|
| General/Code | "Creator", "Educator", "Scholar" |
| Islamic Context | "Sheikh", "Ustadh", "Imam" (display only) |
| Christian Context | "Pastor", "Reverend", "Father" (future) |
| Jewish Context | "Rabbi" (future) |

**The UI can display faith-specific terms based on context, but the underlying code remains agnostic.**

---

# 🎯 SUMMARY

## The Lamma+ Promise:

1. **BUILT FOR ALL** - Architecture supports any faith tradition
2. **LAUNCHING WITH FOCUS** - MVP targets Islamic content, African diaspora outreach
3. **WELCOMING EVERYONE** - All Muslims welcome from day one
4. **SCALING INFINITELY** - Can add Christianity, Judaism, Buddhism, etc. without rewrites
5. **NO BIAS IN CODE** - Faith-specific content is CONFIG, not hardcoded logic

---

## Quick Reference

| Layer | Approach |
|-------|----------|
| **Database** | Agnostic schemas, flexible fields |
| **Backend** | Config-driven, feature flags |
| **Frontend** | Inclusive defaults, optional personalization |
| **Content** | Categorized by faith tradition, not assumed |
| **UX** | Universal onboarding, additive community features |
| **Marketing** | Phase 1 targets African diaspora, welcomes all |

---

**This document should be referenced when creating or updating ANY other documentation to ensure consistency.**
