'use client';

interface LammaLogoProps {
  variant?: 'dark' | 'light' | 'gold-bg';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

/**
 * Lamma+ Logo Component
 * Brand specifications:
 * - Palm tree integrated with the "L" in "LAMMA+"
 * - Dark variant: Navy background, teal palm, white "LAMMA", gold "+"
 * - Light variant: Light background, teal palm, dark text, gold "+"
 * - Gold-bg variant: Gold background, teal palm and text
 */
export default function LammaLogo({
  variant = 'dark',
  size = 'md',
  showTagline = false,
  className = '',
}: LammaLogoProps) {
  const sizes = {
    sm: { height: 28, width: 120, tagline: 'text-xs' },
    md: { height: 36, width: 150, tagline: 'text-sm' },
    lg: { height: 48, width: 200, tagline: 'text-base' },
    xl: { height: 64, width: 260, tagline: 'text-lg' },
  };

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
      palm: '#0D7377',      // Teal palm
      text: '#1e293b',       // Dark text
      plus: '#F5B820',       // Gold +
      taglineColor: 'text-slate-500',
    },
    'gold-bg': {
      palm: '#0D7377',      // Teal palm
      text: '#1D4E5F',       // Deep teal text
      plus: '#1D4E5F',       // Deep teal +
      taglineColor: 'text-teal-deep/70',
    },
  };

  const { palm, text, plus, taglineColor } = colors[variant];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 260 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Lamma+"
      >
        {/* Palm Tree integrated with L - elegant silhouette */}
        <g transform="translate(0, 0)">
          {/* Palm trunk (forms the stem of the L) */}
          <path
            d="M18 58 L18 28"
            stroke={palm}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* L horizontal stroke */}
          <path
            d="M18 58 L38 58"
            stroke={palm}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Palm fronds - left side */}
          <path d="M18 28 Q10 24 4 30" stroke={palm} strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M18 26 Q8 20 2 22" stroke={palm} strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M18 24 Q10 14 4 10" stroke={palm} strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M18 22 Q14 12 10 4" stroke={palm} strokeWidth="3" strokeLinecap="round" fill="none"/>
          {/* Palm fronds - right side */}
          <path d="M18 28 Q26 24 32 30" stroke={palm} strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M18 26 Q28 20 34 22" stroke={palm} strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M18 24 Q26 14 32 10" stroke={palm} strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M18 22 Q22 12 26 4" stroke={palm} strokeWidth="3" strokeLinecap="round" fill="none"/>
          {/* Center frond */}
          <path d="M18 24 Q18 12 18 2" stroke={palm} strokeWidth="3" strokeLinecap="round" fill="none"/>
        </g>

        {/* AMMA text */}
        <text
          x="44"
          y="52"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="700"
          fontSize="38"
          letterSpacing="-0.02em"
          fill={text}
        >
          AMMA
        </text>

        {/* + sign in gold */}
        <text
          x="188"
          y="52"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="700"
          fontSize="38"
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
export function PalmIcon({
  variant = 'teal',
  size = 32,
  className = '',
}: {
  variant?: 'teal' | 'brown' | 'gold';
  size?: number;
  className?: string;
}) {
  const colors = {
    teal: '#0D7377',
    brown: '#78350f',
    gold: '#F5B820',
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
      {/* Elegant palm tree silhouette */}
      {/* Trunk */}
      <path
        d="M50 92 L50 48"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Left fronds */}
      <path d="M50 48 Q36 42 20 52" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M50 45 Q32 35 14 38" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M50 42 Q36 26 18 20" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M50 39 Q42 22 30 10" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      {/* Right fronds */}
      <path d="M50 48 Q64 42 80 52" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M50 45 Q68 35 86 38" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M50 42 Q64 26 82 20" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      <path d="M50 39 Q58 22 70 10" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
      {/* Center frond */}
      <path d="M50 42 Q50 24 50 6" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
