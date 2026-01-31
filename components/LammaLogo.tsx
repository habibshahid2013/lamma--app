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
 * - dark: For dark backgrounds (teal palm, white text, gold +)
 * - light: For light backgrounds (brown palm, dark text, gold +)
 * - gold-bg: For gold backgrounds (teal palm, teal text)
 */
export default function LammaLogo({
  variant = 'dark',
  size = 'md',
  showTagline = false,
  className = '',
}: LammaLogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-3xl' },
    xl: { icon: 64, text: 'text-4xl' },
  };

  const colors = {
    dark: {
      palm: '/palm-teal.svg',
      text: 'text-white',
      plus: 'text-amber-500',
    },
    light: {
      palm: '/palm-brown.svg',
      text: 'text-slate-800',
      plus: 'text-amber-500',
    },
    'gold-bg': {
      palm: '/palm-teal.svg',
      text: 'text-teal-700',
      plus: 'text-teal-700',
    },
  };

  const { icon, text } = sizes[size];
  const { palm, text: textColor, plus } = colors[variant];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-2">
        <Image
          src={palm}
          alt=""
          width={icon}
          height={icon}
          className="object-contain"
        />
        <span className={`font-bold tracking-tight ${text} ${textColor}`}>
          LAMMA<span className={plus}>+</span>
        </span>
      </div>
      {showTagline && (
        <p className={`text-sm mt-1 ${variant === 'gold-bg' ? 'text-teal-700' : 'text-slate-400'}`}>
          Gather in Faith
        </p>
      )}
    </div>
  );
}

// Simple palm icon export
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
