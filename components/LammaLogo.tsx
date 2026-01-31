'use client';

import Image from 'next/image';

interface LammaLogoProps {
  variant?: 'dark' | 'light' | 'gold-bg';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

/**
 * Lamma+ Logo Component
 * Based on official brand images:
 * - dark: Navy background with teal palm, white "LAMMA", gold "+"
 * - light: Cream background with brown palm, brown "Lamma", gold "+"
 * - gold-bg: Gold background with teal palm, teal text
 */
export default function LammaLogo({
  variant = 'dark',
  size = 'md',
  showTagline = false,
  className = '',
}: LammaLogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 32, text: 'text-2xl', gap: 'gap-2' },
    lg: { icon: 48, text: 'text-3xl', gap: 'gap-2.5' },
    xl: { icon: 64, text: 'text-4xl', gap: 'gap-3' },
  };

  const colors = {
    dark: {
      palm: '/palm-teal.svg',
      text: 'text-white',
      plus: 'text-gold', // Gold + on dark background
    },
    light: {
      palm: '/palm-brown.svg',
      text: 'text-amber-900', // Dark brown text
      plus: 'text-gold', // Gold +
    },
    'gold-bg': {
      palm: '/palm-teal.svg',
      text: 'text-teal-deep',
      plus: 'text-teal-deep',
    },
  };

  const { icon, text, gap } = sizes[size];
  const { palm, text: textColor, plus } = colors[variant];

  // Use title case "Lamma" for light variant (as shown in brand image top-right)
  const logoText = variant === 'light' ? 'Lamma' : 'LAMMA';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`flex items-center ${gap}`}>
        <Image
          src={palm}
          alt="Lamma+ palm tree logo"
          width={icon}
          height={icon}
          className="object-contain"
          priority
        />
        <span className={`font-bold tracking-tight ${text} ${textColor}`}>
          {logoText}<span className={plus}>+</span>
        </span>
      </div>
      {showTagline && (
        <p className={`text-sm mt-1 ${
          variant === 'gold-bg' ? 'text-teal-deep' :
          variant === 'light' ? 'text-amber-800/70' :
          'text-white/60'
        }`}>
          Gather in Faith
        </p>
      )}
    </div>
  );
}

// Simple palm icon export for decorative use
export function PalmIcon({
  variant = 'teal',
  size = 32,
  className = '',
}: {
  variant?: 'teal' | 'brown';
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={variant === 'teal' ? '/palm-teal.svg' : '/palm-brown.svg'}
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}
