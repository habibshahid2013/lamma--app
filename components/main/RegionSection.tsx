"use client";

import { useCreators } from "@/src/hooks/useCreators";
import SectionHeader from "../ui/SectionHeader";
import { useRouter } from "next/navigation";
import CreatorCard from "../ui/CreatorCard";

export default function RegionSection() {
  const router = useRouter();

  // Fetching both regions separately for now
  const { creators: americasData, loading: loadingAmericas } = useCreators({ region: 'americas', limitCount: 10 });
  const { creators: europeData, loading: loadingEurope } = useCreators({ region: 'europe', limitCount: 10 });

  const westernCreators = [...americasData, ...europeData]
    .filter(c => !c.isHistorical)
    .sort((a, b) => (b.stats?.followerCount || 0) - (a.stats?.followerCount || 0)) // Simple sort
    .slice(0, 8);

  const loading = loadingAmericas || loadingEurope;

  if (!loading && westernCreators.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader 
        title="Western Scholars" 
        subtitle="Voices from the West"
        emoji="🌎"
        action="Explore Regions"
        href="/search?region=americas,europe"
      />
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x px-4">
        {loading ? (
             // Simple loading skeleton
             [1, 2, 3].map(i => (
               <div key={i} className="w-44 h-56 bg-gray-100 rounded-2xl animate-pulse flex-shrink-0" />
             ))
          ) : (
          westernCreators.map((creator) => (
            <CreatorCard key={creator.id} {...creator} />
          ))
        )}
      </div>
    </section>
  );
}
