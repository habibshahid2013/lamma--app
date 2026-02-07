"use client";

import CreatorCard from "../ui/CreatorCard";
import { useWomenScholars } from "@/hooks/useCreators";
import SectionHeader from "../ui/SectionHeader";
import { useRouter } from "next/navigation";

export default function WomenVoicesRow() {
  const router = useRouter();

  const { creators, loading } = useWomenScholars(20);

  // Include all female creators (not just scholars)
  const womenCreators = creators.filter(
    (c) => !c.isHistorical
  ).slice(0, 8);

  if (!loading && womenCreators.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader
        title="Women in the Community"
        subtitle="Inspiring women across every field"
        emoji="👩‍🎓"
        action="See All"
        href="/discover?gender=female"
      />
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x px-4">
        {loading ? (
             [1, 2, 3].map(i => (
               <div key={i} className="w-44 h-56 bg-gray-100 rounded-2xl animate-pulse flex-shrink-0" />
             ))
          ) : (
          womenCreators.map((creator) => (
            <CreatorCard key={creator.id} {...creator} />
          ))
        )}
      </div>
    </section>
  );
}
