"use client";

import CreatorCard from "../ui/CreatorCard";
import { CREATORS } from "@/lib/data/creators";
import Link from "next/link";

interface LanguageRowProps {
  language: string;
  defaultTitle?: string;
  emoji?: string;
}

export default function LanguageRow({ language, defaultTitle, emoji = "🗣️" }: LanguageRowProps) {
  // Filter creators who speak this language
  // Prioritize verified and featured creators
  const creators = CREATORS.filter(
    (c) => c.languages.includes(language) && !c.isHistorical
  ).sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));

  if (creators.length === 0) return null;

  return (
    <section className="mb-8 pl-4">
      <div className="flex items-center justify-between pr-4 mb-3">
        <h3 className="font-bold text-gray-dark text-lg flex items-center">
         {emoji} {defaultTitle || `Speaks ${language}`}
        </h3>
        <Link href={`/search?language=${language}`} className="text-teal text-xs font-semibold">See All</Link>
      </div>
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x pr-4">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} {...creator} />
        ))}
      </div>
    </section>
  );
}
