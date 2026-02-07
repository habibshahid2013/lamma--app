"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Don't show footer on onboarding/splash pages
  if (pathname === "/" || pathname === "/start" || pathname === "/welcome") {
    return null;
  }

  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/home" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <span className="text-lg font-bold">
                Lamma<span className="text-primary">+</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Your gateway to Islamic knowledge. Discover, follow, and learn from
              scholars worldwide. Gather in faith.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              &ldquo;Lamma&rdquo; &#x644;&#x645;&#x651; &mdash; Arabic for &ldquo;to gather, to bring together&rdquo;
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/scholars" className="hover:text-primary transition-colors">All Scholars</Link></li>
              <li><Link href="/scholars?topic=Quran" className="hover:text-primary transition-colors">Quran & Tafsir</Link></li>
              <li><Link href="/scholars?topic=Spirituality" className="hover:text-primary transition-colors">Spirituality</Link></li>
              <li><Link href="/scholars?gender=female" className="hover:text-primary transition-colors">Women Scholars</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">Our Mission</Link></li>
              <li><Link href="/about#contribute" className="hover:text-primary transition-colors">Contribute</Link></li>
              <li><Link href="/following" className="hover:text-primary transition-colors">My Following</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Lamma+ 2.0. Built with love for the Ummah.</p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
            <Link href="/about" className="hover:text-primary transition-colors">Privacy</Link>
            <span>&middot;</span>
            <Link href="/about" className="hover:text-primary transition-colors">Terms</Link>
            <span>&middot;</span>
            <Link href="/about" className="hover:text-primary transition-colors">Contribute</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
