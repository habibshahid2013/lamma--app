"use client";

import { useState } from "react";
import { Search, User, ChevronRight, Sparkles } from "lucide-react";
import LammaLogo from "@/components/LammaLogo";
import BottomNav from "../ui/BottomNav";
import CreatorCard from "../ui/CreatorCard";
import LanguageRow from "./LanguageRow";
import WomenScholarsRow from "./WomenScholarsRow";
import HistoricalSection from "./HistoricalSection";
import RegionSection from "./RegionSection";
import TopicSection from "./TopicSection";
import SurpriseMeButton from "../ui/SurpriseMeButton";
import Link from "next/link";
import { useCreators, useFeaturedCreators } from "@/hooks/useCreators";
import { useFollow } from "@/hooks/useFollow";
import { SkeletonCreatorRow } from "../ui/SkeletonCard";

export default function HomeScreen() {
  // Filters
  const [showHistorical, setShowHistorical] = useState(false);

  // Hooks
  const { isFollowing, toggleFollow } = useFollow();
  const { creators: featuredData, loading: loadingFeatured } = useFeaturedCreators(20);
  const { creators: publicFiguresData, loading: loadingPublic } = useCreators({ category: 'public_figure', limitCount: 10 });

  // Derived filtered lists
  const featuredCreators = featuredData
      .filter(c => !c.isHistorical && c.category !== 'public_figure')
      .slice(0, 10);

  const publicFigures = publicFiguresData;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header - Glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 border-b border-gray-100/50 shadow-[0_1px_12px_-2px_rgba(0,0,0,0.06)]">
        <LammaLogo variant="light" size="icon" />
        <Link href="/search" className="flex-1 flex items-center bg-gray-100/80 rounded-2xl px-4 py-2.5 text-gray-400 text-sm gap-2 hover:bg-gray-200/60 transition-all duration-300 border border-gray-200/50">
          <Search className="w-4 h-4 flex-shrink-0" />
          <span>Search scholars, topics...</span>
        </Link>
        <Link href="/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-teal/10 to-gold/10 flex items-center justify-center border border-teal/20 flex-shrink-0 hover:scale-105 transition-transform">
          <User className="w-5 h-5 text-teal" />
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        {/* Hero Banner - Full-width gradient with mesh pattern */}
        <section className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-teal-deep via-teal to-teal-deep gradient-animate px-5 pt-8 pb-10 relative">
            {/* Decorative mesh overlay */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gold/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-light/30 to-transparent rounded-full blur-2xl translate-y-1/4 -translate-x-1/4" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-gold/90 text-xs font-semibold uppercase tracking-widest">Discover</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">
                Welcome to<br />the gathering
              </h2>
              <p className="text-white/70 text-sm font-medium max-w-[260px]">
                Discover scholars and content that nourishes your soul.
              </p>
            </div>

            {/* Wave separator */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                <path d="M0 60V20C240 0 480 40 720 30C960 20 1200 0 1440 20V60H0Z" fill="#f9fafb"/>
              </svg>
            </div>
          </div>
        </section>

        {/* Filter Toggles */}
        <section className="px-4 mb-4 -mt-1 flex justify-end">
            <button
                onClick={() => setShowHistorical(!showHistorical)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-300 ${showHistorical ? 'bg-teal-deep text-white border-teal-deep shadow-md shadow-teal-deep/20' : 'bg-white text-gray-500 border-gray-200 hover:border-teal/30'}`}
            >
                {showHistorical ? "Hide History" : "Show History"}
            </button>
        </section>

        {/* Sections */}
        <div className="space-y-2">
            {/* For You - Dark themed section */}
            <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 -mx-0">
              <div className="flex items-center justify-between px-5 mb-4">
                <div>
                  <h3 className="font-extrabold text-white text-xl">For You</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Personalized picks</p>
                </div>
                <Link href="/search" className="flex items-center gap-1 text-gold text-sm font-semibold hover:gap-2 transition-all">
                  See All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex overflow-x-auto gap-4 px-5 pb-4 scrollbar-hide snap-x">
                {loadingFeatured ? (
                    <SkeletonCreatorRow count={3} />
                ) : (
                    featuredCreators.map(creator => (
                    <CreatorCard
                      key={creator.id}
                      {...creator}
                      theme="dark"
                      isFollowing={isFollowing(creator.id)}
                      onFollow={() => toggleFollow(creator.id)}
                    />
                    ))
                )}
              </div>
            </section>

             {/* Muslim Voices (Public Figures) - Teal gradient section */}
             <section className="bg-gradient-to-br from-teal-light/40 via-white to-gold-light/30 py-8">
                <div className="flex items-center justify-between px-5 mb-4">
                    <div>
                      <h3 className="font-extrabold text-teal-deep text-xl flex items-center">
                           Muslim Voices
                           <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold/20 text-gold-dark uppercase tracking-wider">Featured</span>
                      </h3>
                      <p className="text-teal-deep/50 text-xs mt-0.5">Public figures & leaders</p>
                    </div>
                    <Link href="/search?category=public_figure" className="flex items-center gap-1 text-teal text-sm font-semibold hover:gap-2 transition-all">
                      See All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="flex overflow-x-auto gap-4 px-5 pb-2 scrollbar-hide snap-x">
                    {loadingPublic ? (
                        <SkeletonCreatorRow count={3} />
                    ) : (
                        publicFigures.map(creator => (
                        <CreatorCard
                          key={creator.id}
                          {...creator}
                          isFollowing={isFollowing(creator.id)}
                          onFollow={() => toggleFollow(creator.id)}
                        />
                        ))
                    )}
                </div>
            </section>

            {/* "Speaks Somali" for Minneapolis Launch */}
            <div className="py-2">
              <LanguageRow language="Somali" defaultTitle="Speaks Somali" />
            </div>

            {/* Women Scholars */}
            <WomenScholarsRow />

            {/* Historical / Classical Scholars */}
            {showHistorical && <HistoricalSection />}
            {!showHistorical && <div className="px-4 py-4 text-center text-xs text-gray-400 italic">Toggle &quot;Show History&quot; to see classical scholars</div>}

            {/* Regional Collections */}
            <RegionSection />

            {/* Topics */}
            <TopicSection />
        </div>
      </main>

      <SurpriseMeButton />
      <BottomNav />
    </div>
  );
}
