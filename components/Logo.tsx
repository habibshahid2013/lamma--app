'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  linkToHome?: boolean;
  className?: string;
}

export default function Logo({ 
  variant = 'dark', 
  size = 'md', 
  linkToHome = true,
  className = '' 
}: LogoProps) {
  
  const sizes = {
    sm: { height: 24, width: 96 },
    md: { height: 32, width: 128 },
    lg: { height: 40, width: 160 },
  };

  const logoSrc = variant === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';
  const { height, width } = sizes[size];

  const LogoImage = (
    <Image 
      src={logoSrc}
      alt="Lamma+"
      width={width}
      height={height}
      className={className}
      priority
    />
  );

  if (linkToHome) {
    return (
      <Link href="/" className="flex items-center">
        {LogoImage}
      </Link>
    );
  }

  return LogoImage;
}

// Icon-only version (palm tree)
export function LogoIcon({ 
  size = 'md',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  return (
    <Image 
      src="/icon.svg"
      alt="Lamma+"
      width={sizes[size]}
      height={sizes[size]}
      className={className}
    />
  );
}
