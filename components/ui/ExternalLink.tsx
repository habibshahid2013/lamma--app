'use client';

import React from 'react';
import { sanitizeExternalUrl } from '@/lib/utils/links';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ExternalLinkProps {
  href: string | null | undefined;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  fallback?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

interface ExternalLinkButtonProps extends Omit<ButtonProps, 'asChild'> {
  href: string | null | undefined;
  children: React.ReactNode;
  showIcon?: boolean;
  fallback?: React.ReactNode;
}

// ============================================================================
// EXTERNAL LINK (BASE)
// ============================================================================

/**
 * Safe external link component that:
 * - Validates and sanitizes URLs
 * - Always opens in new tab with security attributes
 * - Shows disabled state for invalid URLs
 * - Prevents XSS via javascript: URLs
 */
export default function ExternalLink({
  href,
  children,
  className = '',
  showIcon = false,
  fallback = null,
  onClick,
}: ExternalLinkProps) {
  const safeUrl = sanitizeExternalUrl(href);

  // If URL is invalid, show disabled state or fallback
  if (!safeUrl) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <span
        className={cn('cursor-not-allowed opacity-50', className)}
        title="Invalid or unavailable link"
      >
        {children}
      </span>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
      {showIcon && (
        <ExternalLinkIcon className="inline-block ml-1 w-3 h-3 opacity-60" />
      )}
    </a>
  );
}

// ============================================================================
// EXTERNAL LINK BUTTON (shadcn/ui styled)
// ============================================================================

/**
 * External link styled as a shadcn/ui Button
 * Uses the Button component with asChild to render as an anchor
 */
export function ExternalLinkButton({
  href,
  children,
  showIcon = false,
  fallback = null,
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ExternalLinkButtonProps) {
  const safeUrl = sanitizeExternalUrl(href);

  // If URL is invalid, show disabled button or fallback
  if (!safeUrl) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
        {...props}
      >
        {children}
        {showIcon && <ExternalLinkIcon className="ml-1.5 h-3 w-3" />}
      </Button>
    );
  }

  return (
    <Button variant={variant} size={size} className={className} asChild {...props}>
      <a href={safeUrl} target="_blank" rel="noopener noreferrer">
        {children}
        {showIcon && <ExternalLinkIcon className="ml-1.5 h-3 w-3" />}
      </a>
    </Button>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to get a safe external URL
 */
export function useSafeUrl(url: string | null | undefined): string | null {
  return React.useMemo(() => sanitizeExternalUrl(url), [url]);
}
