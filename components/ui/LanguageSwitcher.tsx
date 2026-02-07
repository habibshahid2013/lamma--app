"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const LOCALES = [
  { code: "en", label: "English", flag: "EN" },
  { code: "ar", label: "العربية", flag: "AR" },
  { code: "ur", label: "اردو", flag: "UR" },
  { code: "fr", label: "Français", flag: "FR" },
  { code: "tr", label: "Türkçe", flag: "TR" },
  { code: "ms", label: "Melayu", flag: "MS" },
] as const;

function setLocaleCookie(code: string) {
  document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`;
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLocale = (code: string) => {
    setLocaleCookie(code);
    setOpen(false);
    router.refresh();
  };

  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        className="relative"
      >
        <Globe className="h-4 w-4" />
        <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold leading-none">
          {current.flag}
        </span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-xl border border-border/50 bg-card p-1 shadow-lg">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                locale === l.code
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <span className="w-6 text-xs font-bold text-muted-foreground">
                {l.flag}
              </span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
