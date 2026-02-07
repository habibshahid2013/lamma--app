"use client";

import { useHistoricalScholars } from "@/hooks/useCreators";
import CreatorCard from "@/components/ui/CreatorCard";
import { SkeletonCreatorGrid } from "@/components/ui/SkeletonCard";

export default function HistoricalCollectionPage() {
  const { creators: historicalCreators, loading } = useHistoricalScholars(100);

  // We could add century/era filters here later

  return (
    <>
      {/* Hero Section */}
      <section className="islamic-pattern relative px-6 py-8 mb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-4xl opacity-80">🏛️</span>
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">The Legacy</h2>
            <p className="text-muted-foreground text-sm opacity-80">{historicalCreators.length} classical scholars</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md font-serif">
          Explore the lives and works of the scholars who shaped Islamic history and thought.
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Timeline/Grid */}
        <section>
          {loading ? (
            <SkeletonCreatorGrid count={4} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-8">
              {historicalCreators.map(creator => (
                <CreatorCard key={creator.id} {...creator} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
