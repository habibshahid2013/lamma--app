"use client";

import { useCreatorsByLanguage } from "@/hooks/useCreators";
import Link from "next/link";
import CreatorCard from "../ui/CreatorCard";

interface LanguageRowProps {
  language: string;
  defaultTitle?: string;
  emoji?: string;
}

export default function LanguageRow({ language, defaultTitle, emoji = "🗣️" }: LanguageRowProps) {
  // Use hook to fetch creators by language
  const { creators, loading } = useCreatorsByLanguage(language);
  
  // Filter non-historical and sort by trending client-side
  const filteredCreators = creators
    .filter((c) => !c.isHistorical)
    .sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));

  if (!loading && filteredCreators.length === 0) return null;

  return (
    <section className="mb-8 pl-4">
      <div className="flex items-center justify-between pr-4 mb-3">
        <h3 className="font-bold text-gray-dark text-lg flex items-center">
         {emoji} {defaultTitle || `Speaks ${language}`}
        </h3>
        <Link href={`/search?language=${language}`} className="text-teal text-xs font-semibold">See All</Link>
      </div>
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x pr-4">
        {loading ? (
           // Simple loading skeleton
           [1, 2, 3].map(i => (
             <div key={i} className="w-44 h-56 bg-gray-100 rounded-2xl animate-pulse flex-shrink-0" />
           ))
        ) : (
          filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} {...creator} />
          ))
        )}
      </div>
    </section>
  );
}
