"use client";

import { useState } from "react";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useHistoricalScholars } from "@/src/hooks/useCreators";
import HistoricalScholarCard from "@/components/ui/HistoricalScholarCard";
import BottomNav from "@/components/ui/BottomNav";

export default function HistoricalCollectionPage() {
  const router = useRouter();
  
  const { creators: historicalCreators, loading } = useHistoricalScholars(100);

  // We could add century/era filters here later
  
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF5] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FFFDF5]/90 backdrop-blur-md border-b border-amber-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-6 h-6 text-amber-900" />
          </button>
          <h1 className="font-serif font-bold text-xl text-amber-900">Giants of History</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        {/* Hero Section */}
        <section className="bg-amber-100/50 px-6 py-8 mb-6 border-b border-amber-100">
            <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl opacity-80">🏛️</span>
                <div>
                   <h2 className="text-2xl font-serif font-bold text-amber-900">The Legacy</h2>
                   <p className="text-amber-800 text-sm opacity-80">{historicalCreators.length} classical scholars</p>
                </div>
            </div>
            <p className="text-sm text-amber-900/70 leading-relaxed max-w-md font-serif">
                Explore the lives and works of the scholars who shaped Islamic history and thought.
            </p>
        </section>

        {/* Timeline/Grid */}
        <section className="px-4">
            <div className="grid grid-cols-2 gap-4 pb-8">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                         <div key={i} className="flex justify-center">
                             <div className="w-44 h-64 bg-amber-50/50 rounded-2xl animate-pulse border border-amber-100" />
                         </div>
                    ))
                ) : (
                    historicalCreators.map(creator => (
                         <div key={creator.id} className="flex justify-center">
                            <HistoricalScholarCard {...creator} />
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
