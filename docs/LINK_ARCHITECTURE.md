# Link Architecture Documentation

## Overview

This document describes the unified link system architecture for the Lamma+ application. The system provides:

- **Type-safe link handling** with TypeScript
- **URL normalization and sanitization** for security
- **Platform detection** from URLs
- **Legacy data migration** support
- **Consistent UI components** using shadcn/ui

## Directory Structure

```
lib/
└── utils/
    └── links.ts          # Core link utilities and types

components/
└── ui/
    ├── ExternalLink.tsx   # Safe external link component
    └── CreatorLinks.tsx   # Social link collection component
```

---

## Types

### LinkPlatform

Supported social/content platforms:

```typescript
type LinkPlatform =
  | 'spotify' | 'youtube' | 'audible' | 'google_books' | 'amazon'
  | 'x' | 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'linkedin'
  | 'podcast' | 'website' | 'other';
```

### CreatorLink

The unified link data model:

```typescript
interface CreatorLink {
  id: string;                  // Unique identifier
  platform: LinkPlatform;      // Detected or specified platform
  url: string;                 // Full URL
  label?: string;              // Custom display label
  priority?: number;           // Sort order (lower = higher priority)
  verified?: boolean;          // Link verification status
  metadata?: {                 // Optional rich metadata
    title?: string;
    image?: string;
    description?: string;
    embedHtml?: string;
  };
  updatedAt: number;           // Timestamp
}
```

### PlatformInfo

Platform display configuration:

```typescript
interface PlatformInfo {
  name: string;        // Display name
  icon: string;        // Icon identifier
  color: string;       // Text color class
  bgColor: string;     // Background color class
  hoverColor: string;  // Hover color class
  domain: string;      // Primary domain
}
```

---

## Core Utilities

### `normalizeUrl(raw: string | null | undefined): string | null`

Normalizes URLs by:
- Trimming whitespace
- Removing mailto: and tel: protocols
- Adding https:// if missing
- Validating URL format

```typescript
normalizeUrl('youtube.com/@channel')    // 'https://youtube.com/@channel'
normalizeUrl('https://example.com')     // 'https://example.com'
normalizeUrl('javascript:alert(1)')     // null
normalizeUrl('')                        // null
```

### `sanitizeExternalUrl(url: string | null | undefined): string | null`

Security-focused URL validation:
- Normalizes the URL first
- Only allows http/https protocols
- Blocks javascript:, data:, and other dangerous protocols
- Returns null for invalid URLs

```typescript
sanitizeExternalUrl('example.com')      // 'https://example.com'
sanitizeExternalUrl('javascript:...')   // null
sanitizeExternalUrl('data:text/html')   // null
```

### `detectPlatform(url: string | null | undefined): LinkPlatform`

Detects platform from URL domain:

```typescript
detectPlatform('https://youtube.com/@channel')     // 'youtube'
detectPlatform('https://open.spotify.com/show/x')  // 'spotify'
detectPlatform('https://x.com/user')               // 'x'
detectPlatform('https://twitter.com/user')         // 'twitter'
detectPlatform('https://mywebsite.com')            // 'website'
```

### `getPlatformInfo(platform: LinkPlatform): PlatformInfo`

Returns display configuration for a platform:

```typescript
getPlatformInfo('youtube')
// {
//   name: 'YouTube',
//   icon: 'youtube',
//   color: 'text-red-500',
//   bgColor: 'bg-red-500/10',
//   hoverColor: 'hover:bg-red-500/20',
//   domain: 'youtube.com'
// }
```

### `convertLegacySocialLinks(socialLinks): CreatorLink[]`

Converts legacy Firestore socialLinks object to CreatorLink array:

```typescript
// Legacy format from Firestore
const legacy = {
  website: 'https://example.com',
  youtube: 'https://youtube.com/@channel',
  twitter: null,           // Skipped
  instagram: undefined,    // Skipped
};

const links = convertLegacySocialLinks(legacy);
// [
//   { id: 'website', platform: 'website', url: 'https://example.com', ... },
//   { id: 'youtube', platform: 'youtube', url: 'https://youtube.com/@channel', ... }
// ]
```

### `convertToLegacySocialLinks(links: CreatorLink[]): Record<string, string>`

Converts CreatorLink array back to legacy format for Firestore:

```typescript
const links: CreatorLink[] = [
  { id: 'website', platform: 'website', url: 'https://example.com', ... },
  { id: 'youtube', platform: 'youtube', url: 'https://youtube.com/@channel', ... },
];

const legacy = convertToLegacySocialLinks(links);
// { website: 'https://example.com', youtube: 'https://youtube.com/@channel' }
```

---

## UI Components

### ExternalLink

Safe external link component that validates URLs and adds security attributes:

```tsx
import ExternalLink from '@/components/ui/ExternalLink';

// Basic usage
<ExternalLink href="https://example.com">
  Visit Website
</ExternalLink>

// With external link icon
<ExternalLink href={url} showIcon>
  View Profile
</ExternalLink>

// With fallback for invalid URLs
<ExternalLink href={maybeInvalidUrl} fallback={<span>Link unavailable</span>}>
  Click Here
</ExternalLink>
```

**Props:**
- `href` - URL to link to (validated and sanitized)
- `children` - Link content
- `className` - Additional CSS classes
- `showIcon` - Show external link icon (default: false)
- `fallback` - Render when URL is invalid (default: disabled span)
- `onClick` - Click handler

### ExternalLinkButton

External link styled as a shadcn/ui Button:

```tsx
import { ExternalLinkButton } from '@/components/ui/ExternalLink';

<ExternalLinkButton href={url} variant="default">
  Watch on YouTube
</ExternalLinkButton>

<ExternalLinkButton href={url} variant="outline" size="sm">
  Learn More
</ExternalLinkButton>
```

**Props:** Inherits all ButtonProps from shadcn/ui plus ExternalLink props.

### CreatorLinks

Renders a collection of social/content links:

```tsx
import CreatorLinks from '@/components/ui/CreatorLinks';

// Using legacy socialLinks object
<CreatorLinks
  socialLinks={creator.socialLinks}
  maxVisible={6}
  showLabels={true}
  size="sm"
  variant="pill"
/>

// Using CreatorLink array
<CreatorLinks
  links={creatorLinks}
  maxVisible={9}
  variant="outline"
/>
```

**Props:**
- `socialLinks` - Legacy Firestore object
- `links` - CreatorLink array (takes precedence)
- `maxVisible` - Show N links, then "+X more" button (default: 6)
- `showLabels` - Show text labels (default: true)
- `size` - "sm" | "md" | "lg"
- `variant` - "pill" | "outline" | "ghost" | "solid"
- `className` - Additional CSS classes

### SocialLink

Individual social link component (for backward compatibility):

```tsx
import { SocialLink } from '@/components/ui/CreatorLinks';

<SocialLink
  href={youtubeUrl}
  platform="youtube"
  label="YouTube Channel"
  size="md"
/>
```

### IconLink

Icon-only social link for compact displays:

```tsx
import { IconLink } from '@/components/ui/CreatorLinks';

<IconLink href={twitterUrl} platform="x" size="md" />
```

---

## Security Features

### XSS Prevention

- All URLs are validated through `sanitizeExternalUrl()`
- `javascript:`, `data:`, `vbscript:` protocols are blocked
- Only `http://` and `https://` URLs are allowed

### External Link Security

All external links include:
- `target="_blank"` - Opens in new tab
- `rel="noopener noreferrer"` - Prevents tabnapping

### Invalid URL Handling

Invalid URLs gracefully degrade:
- ExternalLink shows disabled span or custom fallback
- CreatorLinks filters out invalid links
- No broken links or errors in the UI

---

## Data Migration

The system supports both legacy and new data formats:

### Legacy Format (Firestore)

```typescript
// creators/{id}
{
  socialLinks: {
    website: "https://example.com",
    youtube: "https://youtube.com/@channel",
    twitter: null,
    instagram: "",
  }
}
```

### New Format

```typescript
// creators/{id}
{
  links: [
    {
      id: "link-1",
      platform: "youtube",
      url: "https://youtube.com/@channel",
      label: "Main Channel",
      priority: 0,
      verified: true,
      updatedAt: 1706140800000
    },
    // ...more links
  ]
}
```

### Migration Strategy

1. Components accept both formats (`socialLinks` and `links`)
2. If `links` is provided, use it directly
3. If only `socialLinks`, convert using `convertLegacySocialLinks()`
4. Future writes should use the new `links` format

---

## Usage Examples

### Creator Profile Page

```tsx
import CreatorLinks from '@/components/ui/CreatorLinks';
import ExternalLink, { ExternalLinkButton } from '@/components/ui/ExternalLink';

export default function CreatorProfile({ creator }) {
  return (
    <div>
      {/* Social Links Bar */}
      <CreatorLinks
        socialLinks={creator.socialLinks}
        links={creator.links}
        maxVisible={9}
        showLabels={true}
      />

      {/* YouTube Section */}
      {creator.content?.youtube && (
        <div>
          <ExternalLink
            href={creator.content.youtube.channelUrl}
            className="text-red-400 hover:underline"
          >
            View Channel
          </ExternalLink>

          <ExternalLinkButton
            href={creator.content.youtube.channelUrl}
            className="bg-red-600 text-white"
          >
            Subscribe on YouTube
          </ExternalLinkButton>
        </div>
      )}
    </div>
  );
}
```

### Creator Card

```tsx
import { IconLink } from '@/components/ui/CreatorLinks';

export default function CreatorCard({ creator }) {
  return (
    <div>
      <div className="flex gap-1">
        {creator.socialLinks?.youtube && (
          <IconLink href={creator.socialLinks.youtube} platform="youtube" size="sm" />
        )}
        {creator.socialLinks?.twitter && (
          <IconLink href={creator.socialLinks.twitter} platform="x" size="sm" />
        )}
      </div>
    </div>
  );
}
```

---

## Best Practices

1. **Always use ExternalLink/ExternalLinkButton** for external URLs
2. **Never use raw `<a>` tags** for external links
3. **Use CreatorLinks** for displaying social link collections
4. **Prefer `links` array** over `socialLinks` object for new data
5. **Handle null/undefined URLs** - components gracefully handle these
6. **Use appropriate variants** - "pill" for badges, "outline" for minimal, "solid" for prominent

---

## Changelog

### v1.0.0 (2025-01-31)

- Initial implementation of unified link system
- Created `lib/utils/links.ts` with core utilities
- Created `ExternalLink` and `ExternalLinkButton` components
- Created `CreatorLinks`, `SocialLink`, and `IconLink` components
- Integrated shadcn/ui styling with CVA variants
- Added XSS protection and URL sanitization
- Added legacy data format support
