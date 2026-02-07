"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { PalmIcon } from "@/components/LammaLogo";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  const navLinks = [
    { href: "/home", label: t("home") },
    { href: "/scholars", label: t("scholars") },
    { href: "/about", label: t("about") },
  ];

  // Don't show navbar on onboarding/splash pages
  if (pathname === "/" || pathname === "/start" || pathname === "/welcome") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <PalmIcon variant="white" size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Lamma<span className="text-primary">+</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname === link.href || (link.href === "/scholars" && pathname === "/search")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <Link
            href="/scholars"
            className={cn(
              "flex w-full items-center gap-2 rounded-lg border border-border/50 bg-muted/40 px-3.5 py-2 text-sm text-muted-foreground",
              "transition-all hover:border-primary/30 hover:bg-muted/60"
            )}
          >
            <Search className="h-4 w-4" />
            <span>{t("search")}</span>
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("toggleTheme")}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {user ? (
            <Button variant="ghost" size="icon" aria-label={t("profile")} asChild>
              <Link href="/profile">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button size="sm" className="rounded-full" asChild>
              <Link href="/auth/login">{t("signIn")}</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("toggleTheme")}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("openMenu")}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-lg px-4 py-3 text-base font-medium transition-colors",
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/scholars"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Search className="h-5 w-5" />
                  {t("scholars")}
                </Link>
                {!user && (
                  <Link
                    href="/auth/login"
                    onClick={() => setOpen(false)}
                    className="mt-4 rounded-lg bg-primary px-4 py-3 text-center text-base font-medium text-primary-foreground"
                  >
                    {t("signIn")}
                  </Link>
                )}
                {user && (
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-4 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {t("profile")}
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
