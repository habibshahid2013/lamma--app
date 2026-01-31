"use client";

import { useState } from "react";
import { ArrowLeft, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWomenScholars } from "@/hooks/useCreators";
import CreatorCard from "@/components/ui/CreatorCard";
import BottomNav from "@/components/ui/BottomNav";

export default function WomenScholarsPage() {
  const router = useRouter();
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
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-dark" />
          </button>
          <h1 className="font-bold text-xl text-gray-dark">Women Scholars</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        {/* Hero Section */}
        <section className="bg-teal-deep text-white px-6 py-8 mb-6">
            <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl">👩‍🎓</span>
                <div>
                   <h2 className="text-2xl font-bold">Women Scholars</h2>
                   <p className="text-teal-light text-sm opacity-90">{womenCreators.length} scholars</p>
                </div>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed max-w-md">
                Discover inspiring women in Islamic scholarship, education, and community leadership from around the world.
            </p>
        </section>

        {/* Filters */}
        <section className="px-4 mb-6">
             <div className="flex items-center gap-2 mb-3">
                <Filter className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter by Region</span>
             </div>
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {regions.map(region => (
                    <button
                        key={region}
                        onClick={() => setFilterRegion(region)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                            filterRegion === region 
                            ? 'bg-teal text-white' 
                            : 'bg-white border border-gray-200 text-gray-600'
                        }`}
                    >
                        {region.replace("_", " ")}
                    </button>
                ))}
             </div>
        </section>

        {/* Grid */}
        <section className="px-4">
            <div className="grid grid-cols-2 gap-4 pb-8">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                         <div key={i} className="flex justify-center">
                             <div className="w-44 h-64 bg-gray-100 rounded-2xl animate-pulse" />
                         </div>
                    ))
                ) : (
                    filteredCreators.map(creator => (
                         <div key={creator.id} className="flex justify-center">
                            <CreatorCard {...creator} />
                         </div>
                    ))
                )}
            </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
