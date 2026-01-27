"use client";

import CreatorCard from "../ui/CreatorCard";
import { CREATORS } from "@/lib/data/creators";
import SectionHeader from "../ui/SectionHeader";
import { useRouter } from "next/navigation";

export default function WomenScholarsRow() {
  const router = useRouter();

  // Filter female creators, exclude historical by default for this home section row?
  // Or includes them? The plan says "Filter creators where gender === female". 
  // It positions after Featured section.
  
  const womenCreators = CREATORS.filter(
    (c) => c.gender === "female" && !c.isHistorical && c.category !== "public_figure"
  ).slice(0, 6);

  if (womenCreators.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader 
        title="Women Scholars" 
        subtitle="Inspiring female scholarship & leadership"
        emoji="👩‍🎓"
        action="See All"
        onAction={() => router.push("/collection/women-scholars")}
      />
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x px-4">
        {womenCreators.map((creator) => (
          <CreatorCard key={creator.id} {...creator} />
        ))}
      </div>
    </section>
  );
}
