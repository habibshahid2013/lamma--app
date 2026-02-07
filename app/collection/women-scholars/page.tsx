"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { useWomenScholars } from "@/hooks/useCreators";
import CreatorCard from "@/components/ui/CreatorCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkeletonCreatorGrid } from "@/components/ui/SkeletonCard";

export default function WomenScholarsPage() {
  const [filterRegion, setFilterRegion] = useState("All");

  const { creators, loading } = useWomenScholars(100);

  const womenCreators = creators.filter(
    (c) => !c.isHistorical && c.category !== "public_figure"
  );

  const filteredCreators = filterRegion === "All"
    ? womenCreators
    : womenCreators.filter(c => c.region === filterRegion);

  const regions = ["All", ...Array.from(new Set(womenCreators.map(c => c.region)))];

  return (
    <>
      {/* Hero Section */}
      <section className="islamic-pattern relative px-6 py-8 mb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-4xl">👩‍🎓</span>
          <div>
            <h2 className="text-2xl font-bold">Women Scholars</h2>
            <p className="text-primary/60 text-sm opacity-90">{womenCreators.length} scholars</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
          Discover inspiring women in Islamic scholarship, education, and community leadership from around the world.
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Filters */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filter by Region</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {regions.map(region => (
              <Badge
                key={region}
                variant={filterRegion === region ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setFilterRegion(region)}
              >
                {region.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section>
          {loading ? (
            <SkeletonCreatorGrid count={4} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-8">
              {filteredCreators.map(creator => (
                <CreatorCard key={creator.id} {...creator} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
