"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { PalmIcon } from "@/components/LammaLogo";

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations("footer");

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
                <PalmIcon variant="white" size={16} />
              </div>
              <span className="text-lg font-bold">
                Lamma<span className="text-primary">+</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {t("tagline")}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              &ldquo;Lamma&rdquo; {t("lammaArabic")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("explore")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/scholars" className="hover:text-primary transition-colors">{t("allScholars")}</Link></li>
              <li><Link href="/scholars?topic=Quran" className="hover:text-primary transition-colors">{t("quranTafsir")}</Link></li>
              <li><Link href="/scholars?topic=Spirituality" className="hover:text-primary transition-colors">{t("spirituality")}</Link></li>
              <li><Link href="/scholars?gender=female" className="hover:text-primary transition-colors">{t("womenScholars")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("about")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">{t("ourMission")}</Link></li>
              <li><Link href="/about#contribute" className="hover:text-primary transition-colors">{t("contribute")}</Link></li>
              <li><Link href="/following" className="hover:text-primary transition-colors">{t("myFollowing")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
            <Link href="/about" className="hover:text-primary transition-colors">{t("privacy")}</Link>
            <span>&middot;</span>
            <Link href="/about" className="hover:text-primary transition-colors">{t("terms")}</Link>
            <span>&middot;</span>
            <Link href="/about" className="hover:text-primary transition-colors">{t("contribute")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
