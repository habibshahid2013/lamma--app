'use client';

import React, { useState, useMemo, memo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import ExternalLink from './ExternalLink';
import { Button } from './button';
import { cn } from '@/lib/utils';
import {
  sanitizeExternalUrl,
  detectPlatform,
  getPlatformInfo,
  convertLegacySocialLinks,
  type LinkPlatform,
  type CreatorLink,
} from '@/lib/utils/links';
import {
  Globe,
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  Headphones,
  Book,
  ShoppingCart,
  Link2,
  Podcast,
  Music,
  ChevronDown,
  ChevronUp,
  Twitch,
  Heart,
} from 'lucide-react';

// ============================================================================
// ICON MAP
// ============================================================================

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

// Threads icon component
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.855-.71 2.024-1.122 3.39-1.194 1.06-.056 2.053.043 2.973.293-.06-1.18-.314-2.032-.779-2.613-.533-.667-1.378-1.01-2.508-1.02-1.616.027-2.61.74-3.122 1.299l-1.447-1.412c.907-.93 2.45-1.834 4.646-1.87h.028c1.642.016 2.96.537 3.916 1.55.842.89 1.357 2.126 1.533 3.678.545.168 1.05.378 1.512.632 1.105.607 1.969 1.457 2.498 2.461.737 1.398.886 3.282.397 5.136-.724 2.748-2.593 4.722-5.42 5.717-1.37.483-2.94.728-4.664.728zm-.096-6.789c-1.05.056-1.875.32-2.39.768-.462.401-.668.878-.634 1.46.036.656.357 1.161.928 1.46.588.307 1.378.432 2.22.352 1.262-.121 2.11-.584 2.59-1.418.34-.59.535-1.393.575-2.387-.89-.2-1.87-.29-2.893-.235h-.396z"/>
  </svg>
);

// Patreon icon component
const PatreonIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 .48v23.04h4.22V.48zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.623 8.641 8.623 4.75 0 8.615-3.868 8.615-8.623C24 4.36 20.136.48 15.385.48z"/>
  </svg>
);

const PLATFORM_ICONS: Record<LinkPlatform, React.ComponentType<{ className?: string }>> = {
  website: Globe,
  youtube: Youtube,
  spotify: Music,
  x: XIcon,
  twitter: XIcon,
  instagram: Instagram,
  facebook: Facebook,
  tiktok: TikTokIcon,
  linkedin: Linkedin,
  twitch: Twitch,
  threads: ThreadsIcon,
  patreon: PatreonIcon,
  audible: Headphones,
  google_books: Book,
  amazon: ShoppingCart,
  podcast: Podcast,
  other: Link2,
};

// ============================================================================
// LINK BADGE VARIANTS (CVA)
// ============================================================================

const linkBadgeVariants = cva(
  'inline-flex items-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        pill: 'rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white',
        outline: 'rounded-full border border-slate-600 text-slate-400 hover:border-slate-400 hover:text-white',
        ghost: 'rounded-md text-slate-400 hover:bg-slate-800/50 hover:text-white',
        solid: 'rounded-lg font-medium shadow-sm',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-5 py-2.5 text-base gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'pill',
      size: 'sm',
    },
  }
);

const iconSizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

// ============================================================================
// TYPES
// ============================================================================

interface CreatorLinksProps extends VariantProps<typeof linkBadgeVariants> {
  /** Legacy socialLinks object from Firestore */
  socialLinks?: Record<string, string | null | undefined> | null;
  /** New CreatorLink array (takes precedence if provided) */
  links?: CreatorLink[];
  /** Maximum number of links to show initially */
  maxVisible?: number;
  /** Show labels alongside icons */
  showLabels?: boolean;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

function CreatorLinksComponent({
  socialLinks,
  links: providedLinks,
  maxVisible = 6,
  showLabels = true,
  size = 'sm',
  variant = 'pill',
  className = '',
}: CreatorLinksProps) {
  const [showAll, setShowAll] = useState(false);

  // Memoize link processing to prevent unnecessary recalculations
  const sortedLinks = useMemo(() => {
    // Convert legacy socialLinks to CreatorLink array if needed
    const links = providedLinks || convertLegacySocialLinks(socialLinks);

    // Filter out invalid links and sort by priority
    return links
      .filter((link) => sanitizeExternalUrl(link.url))
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }, [providedLinks, socialLinks]);

  if (sortedLinks.length === 0) {
    return null;
  }

  // Determine which links to show
  const visibleLinks = showAll ? sortedLinks : sortedLinks.slice(0, maxVisible);
  const hiddenCount = sortedLinks.length - maxVisible;

  const iconSize = iconSizeMap[size || 'sm'];

  // Render a single link
  const renderLink = (link: CreatorLink) => {
    const Icon = PLATFORM_ICONS[link.platform] || Link2;
    const info = getPlatformInfo(link.platform);
    const label = link.label || info.name;

    return (
      <ExternalLink
        key={link.id}
        href={link.url}
        className={cn(
          linkBadgeVariants({ variant, size }),
          variant === 'solid' && `${info.bgColor} ${info.color} ${info.hoverColor}`
        )}
        fallback={null}
      >
        <Icon className={iconSize} />
        {showLabels && <span>{label}</span>}
      </ExternalLink>
    );
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {visibleLinks.map(renderLink)}

      {!showAll && hiddenCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="rounded-full text-slate-400 hover:text-white gap-1"
        >
          +{hiddenCount} more
          <ChevronDown className="w-3 h-3" />
        </Button>
      )}

      {showAll && hiddenCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(false)}
          className="rounded-full text-slate-400 hover:text-white gap-1"
        >
          Show less
          <ChevronUp className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
const CreatorLinks = memo(CreatorLinksComponent);
export default CreatorLinks;

// ============================================================================
// SINGLE SOCIAL LINK (for backward compatibility)
// ============================================================================

interface SocialLinkProps extends VariantProps<typeof linkBadgeVariants> {
  href: string | null | undefined;
  icon?: string;
  platform?: LinkPlatform;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

function SocialLinkComponent({
  href,
  icon,
  platform: providedPlatform,
  label,
  size = 'sm',
  variant = 'pill',
  showLabel = true,
  className = '',
}: SocialLinkProps) {
  // Memoize platform detection
  const { Icon, displayLabel, iconSize } = useMemo(() => {
    const platform = providedPlatform || (icon as LinkPlatform) || detectPlatform(href);
    const info = getPlatformInfo(platform);
    return {
      Icon: PLATFORM_ICONS[platform] || Link2,
      displayLabel: label || info.name,
      iconSize: iconSizeMap[size || 'sm'],
    };
  }, [providedPlatform, icon, href, label, size]);

  return (
    <ExternalLink
      href={href}
      className={cn(
        linkBadgeVariants({ variant, size }),
        className
      )}
      fallback={null}
    >
      <Icon className={iconSize} />
      {showLabel && <span>{displayLabel}</span>}
    </ExternalLink>
  );
}

export const SocialLink = memo(SocialLinkComponent);

// ============================================================================
// ICON-ONLY LINK (for compact displays)
// ============================================================================

interface IconLinkProps {
  href: string | null | undefined;
  platform?: LinkPlatform;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

function IconLinkComponent({
  href,
  platform: providedPlatform,
  size = 'md',
  className = '',
}: IconLinkProps) {
  // Memoize platform detection
  const { Icon, platformName } = useMemo(() => {
    const platform = providedPlatform || detectPlatform(href);
    const info = getPlatformInfo(platform);
    return {
      Icon: PLATFORM_ICONS[platform] || Link2,
      platformName: info.name,
    };
  }, [providedPlatform, href]);

  const iconSize = iconSizeMap[size];

  return (
    <ExternalLink
      href={href}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200',
        'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white',
        'focus:outline-none focus:ring-2 focus:ring-teal/50 focus:ring-offset-2 focus:ring-offset-slate-900',
        sizeClasses[size],
        className
      )}
      fallback={null}
    >
      <Icon className={iconSize} />
      <span className="sr-only">{platformName}</span>
    </ExternalLink>
  );
}

export const IconLink = memo(IconLinkComponent);
