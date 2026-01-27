"use client";

import CreatorCard from "../ui/CreatorCard";
import { CREATORS } from "@/lib/data/creators";
import SectionHeader from "../ui/SectionHeader";
import { REGIONS } from "@/lib/data/regions";
import { useRouter } from "next/navigation";

export default function RegionSection() {
  const router = useRouter();

  // For the home screen, maybe show a featured region? 
  // Or a horizontal list of regions?
  // Plan says "Top Regions" or "Explore by Region".
  // Let's show a "Western Scholars" section for now as an example, 
  // or a row of Region Cards?
  // Implementation Plan Feature 5 says: "New component: RegionSection.tsx".
  // "Display creators from a specific region (e.g. 'Western Scholars', 'Middle Eastern Voices')."

  // Let's do "Western Scholars" (Americas + Europe) as it's a popular category for the target audience.
  
  const westernCreators = CREATORS.filter(
    (c) => (c.region === "americas" || c.region === "europe") && !c.isHistorical
  ).slice(0, 6);

  if (westernCreators.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader 
        title="Western Scholars" 
        subtitle="Voices from the West"
        emoji="🌎"
        action="Explore Regions"
        onAction={() => router.push("/search")} // Or a dedicated regions page if we had one
      />
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x px-4">
        {westernCreators.map((creator) => (
          <CreatorCard key={creator.id} {...creator} />
        ))}
      </div>
    </section>
  );
}
