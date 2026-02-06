'use client';

interface LammaLogoProps {
  variant?: 'dark' | 'light' | 'gold-bg';
  size?: 'icon' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

/**
 * Lamma+ Logo Component
 * Brand specifications:
 * - Palm tree integrated with the "L" in "LAMMA+"
 * - Filled solid fronds (leaf shapes), not line strokes
 * - Coconut/date cluster at the crown
 * - Dark variant: Navy background, teal palm, white "AMMA", gold "+"
 * - Light variant: Light background, teal palm, dark text, gold "+"
 * - Gold-bg variant: Gold background, deep teal palm and text
 */
export default function LammaLogo({
  variant = 'dark',
  size = 'md',
  showTagline = false,
  className = '',
}: LammaLogoProps) {
  const sizes = {
    icon: { height: 28, width: 28, tagline: 'text-[10px]' },
    sm: { height: 28, width: 140, tagline: 'text-xs' },
    md: { height: 36, width: 180, tagline: 'text-sm' },
    lg: { height: 48, width: 240, tagline: 'text-base' },
    xl: { height: 64, width: 320, tagline: 'text-lg' },
  };

  // Icon-only mode: render PalmIcon instead of full logo
  if (size === 'icon') {
    const iconColors = {
      dark: 'teal' as const,
      light: 'brown' as const,
      'gold-bg': 'brown' as const,
    };
    return (
      <div className={`flex-shrink-0 ${className}`}>
        <PalmIcon variant={iconColors[variant]} size={28} />
      </div>
    );
  }

  const { height, width, tagline } = sizes[size];

  // Color schemes based on variant
  const colors = {
    dark: {
      palm: '#0D7377',      // Teal palm on dark backgrounds
      text: '#FFFFFF',       // White text
      plus: '#F5B820',       // Gold +
      taglineColor: 'text-white/60',
    },
    light: {
      palm: '#1D4E5F',      // Deep teal palm on light backgrounds
      text: '#1D4E5F',       // Deep teal text
      plus: '#F5B820',       // Gold +
      taglineColor: 'text-slate-500',
    },
    'gold-bg': {
      palm: '#1D4E5F',      // Deep teal palm on gold
      text: '#1D4E5F',       // Deep teal text
      plus: '#1D4E5F',       // Deep teal + on gold bg
      taglineColor: 'text-teal-deep/70',
    },
  };

  const { palm, text, plus, taglineColor } = colors[variant];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 320 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Lamma+"
      >
        {/* Palm Tree - solid filled silhouette integrated as the "L" */}
        <g transform="translate(4, 2)">
          {/* === FRONDS (filled leaf shapes) === */}

          {/* Center frond - straight up */}
          <path d="M22,26 C21,18 21,10 22,2 L26,2 C27,10 27,18 26,26 Z" fill={palm} />

          {/* Upper-left frond */}
          <path d="M23,26 C17,18 11,12 4,6 C8,9 16,17 25,24 Z" fill={palm} />

          {/* Upper-right frond */}
          <path d="M25,26 C31,18 37,12 44,6 C40,9 32,17 23,24 Z" fill={palm} />

          {/* Left frond - more horizontal */}
          <path d="M22,28 C16,26 8,24 0,27 C7,22 15,24 24,27 Z" fill={palm} />

          {/* Right frond - more horizontal */}
          <path d="M26,28 C32,26 40,24 48,27 C41,22 33,24 24,27 Z" fill={palm} />

          {/* Lower-left frond - drooping */}
          <path d="M22,30 C16,33 10,37 3,42 C8,36 14,31 24,29 Z" fill={palm} />

          {/* Lower-right frond - drooping */}
          <path d="M26,30 C32,33 38,37 45,42 C40,36 34,31 24,29 Z" fill={palm} />

          {/* Extra upper-left frond (between center and upper-left) */}
          <path d="M23,25 C19,17 14,10 10,3 C14,7 19,15 25,23 Z" fill={palm} />

          {/* Extra upper-right frond (between center and upper-right) */}
          <path d="M25,25 C29,17 34,10 38,3 C34,7 29,15 23,23 Z" fill={palm} />

          {/* === COCONUTS/DATES at crown === */}
          <circle cx="21" cy="31" r="2.2" fill={palm} />
          <circle cx="27" cy="31" r="2.2" fill={palm} />
          <circle cx="24" cy="33" r="2.2" fill={palm} />
          <circle cx="21" cy="34" r="1.8" fill={palm} />
          <circle cx="27" cy="34" r="1.8" fill={palm} />

          {/* === TRUNK (solid, forms vertical stroke of L) === */}
          <rect x="21" y="32" width="6" height="36" rx="1" fill={palm} />

          {/* === L BASE (horizontal stroke) === */}
          <rect x="18" y="64" width="26" height="6" rx="1" fill={palm} />
        </g>

        {/* AMMA text - positioned after the palm tree L */}
        <text
          x="56"
          y="68"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="50"
          letterSpacing="0.01em"
          fill={text}
        >
          AMMA
        </text>

        {/* + sign */}
        <text
          x="248"
          y="68"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="800"
          fontSize="50"
          fill={plus}
        >
          +
        </text>
      </svg>

      {showTagline && (
        <p className={`${tagline} mt-1 font-medium ${taglineColor}`}>
          Gather in Faith
        </p>
      )}
    </div>
  );
}

// Palm tree icon only - for decorative use
// Uses filled shapes matching the brand palm tree design
export function PalmIcon({
  variant = 'teal',
  size = 32,
  className = '',
}: {
  variant?: 'teal' | 'brown' | 'gold' | 'white';
  size?: number;
  className?: string;
}) {
  const colors = {
    teal: '#0D7377',
    brown: '#1D4E5F',
    gold: '#F5B820',
    white: '#FFFFFF',
  };

  const color = colors[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Filled palm tree silhouette matching brand design */}

      {/* === FRONDS (filled leaf shapes) === */}

      {/* Center frond */}
      <path d="M48,42 C46,30 46,18 48,4 L52,4 C54,18 54,30 52,42 Z" fill={color} />

      {/* Upper-left frond */}
      <path d="M48,42 C38,30 28,20 16,10 C22,16 34,28 52,40 Z" fill={color} />

      {/* Upper-right frond */}
      <path d="M52,42 C62,30 72,20 84,10 C78,16 66,28 48,40 Z" fill={color} />

      {/* Left frond */}
      <path d="M47,46 C34,42 20,40 6,46 C18,38 32,40 51,45 Z" fill={color} />

      {/* Right frond */}
      <path d="M53,46 C66,42 80,40 94,46 C82,38 68,40 49,45 Z" fill={color} />

      {/* Lower-left frond */}
      <path d="M47,48 C36,54 24,60 12,68 C20,60 32,52 51,47 Z" fill={color} />

      {/* Lower-right frond */}
      <path d="M53,48 C64,54 76,60 88,68 C80,60 68,52 49,47 Z" fill={color} />

      {/* Extra upper-left */}
      <path d="M48,40 C40,28 32,18 22,6 C28,14 38,26 52,38 Z" fill={color} />

      {/* Extra upper-right */}
      <path d="M52,40 C60,28 68,18 78,6 C72,14 62,26 48,38 Z" fill={color} />

      {/* === COCONUTS/DATES === */}
      <circle cx="44" cy="50" r="4" fill={color} />
      <circle cx="56" cy="50" r="4" fill={color} />
      <circle cx="50" cy="54" r="4" fill={color} />
      <circle cx="44" cy="55" r="3" fill={color} />
      <circle cx="56" cy="55" r="3" fill={color} />

      {/* === TRUNK === */}
      <rect x="46" y="50" width="8" height="46" rx="2" fill={color} />
    </svg>
  );
}
