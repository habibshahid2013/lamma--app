"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const toggleLocale = () => {
    const next = locale === "en" ? "ar" : "en";
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      aria-label={locale === "en" ? "Switch to Arabic" : "Switch to English"}
      className="relative"
    >
      <Globe className="h-4 w-4" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold leading-none">
        {locale === "en" ? "AR" : "EN"}
      </span>
    </Button>
  );
}
