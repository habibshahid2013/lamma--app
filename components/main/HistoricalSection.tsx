"use client";

import HistoricalScholarCard from "../ui/HistoricalScholarCard";
import { CREATORS } from "@/lib/data/creators";
import SectionHeader from "../ui/SectionHeader";
import { useRouter } from "next/navigation";

export default function HistoricalSection() {
  const router = useRouter();
  
  const historicalCreators = CREATORS.filter(
    (c) => c.isHistorical
  ).slice(0, 5);

  if (historicalCreators.length === 0) return null;

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
        {historicalCreators.map((creator) => (
          <HistoricalScholarCard key={creator.id} {...creator} />
        ))}
      </div>
    </section>
  );
}
