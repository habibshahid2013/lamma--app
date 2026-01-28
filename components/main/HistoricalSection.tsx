"use client";

import HistoricalScholarCard from "../ui/HistoricalScholarCard";
import { useHistoricalScholars } from "@/src/hooks/useCreators";
import SectionHeader from "../ui/SectionHeader";
import { useRouter } from "next/navigation";

export default function HistoricalSection() {
  const router = useRouter();
  
  const { creators: historicalCreators, loading } = useHistoricalScholars(5);

  if (!loading && historicalCreators.length === 0) return null;

  return (
    <section className="bg-amber-50 py-6 border-y border-amber-100 mb-8 -mx-4 px-4">
      <SectionHeader 
        title="Giants of History" 
        subtitle="Classical scholars & legacy"
        emoji="🏛️"
        action="See Library"
        href="/collection/historical"
      />
      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide snap-x">
        {loading ? (
             // Simple loading skeleton
             [1, 2, 3].map(i => (
               <div key={i} className="w-44 h-56 bg-white/50 rounded-2xl animate-pulse flex-shrink-0 border border-amber-100" />
             ))
          ) : (
          historicalCreators.map((creator) => (
            <HistoricalScholarCard key={creator.id} {...creator} />
          ))
        )}
      </div>
    </section>
  );
}
