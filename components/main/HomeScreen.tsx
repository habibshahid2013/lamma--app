"use client";

import { useState } from "react";
import { Search, User } from "lucide-react";
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 shadow-sm">
        <LammaLogo variant="light" size="icon" />
        <Link href="/search" className="flex-1 flex items-center bg-gray-100 rounded-xl px-4 py-2.5 text-gray-400 text-sm gap-2 hover:bg-gray-200/70 transition-colors">
          <Search className="w-4 h-4 flex-shrink-0" />
          <span>Search scholars, topics...</span>
        </Link>
        <Link href="/profile" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
          <User className="w-5 h-5 text-gray-500" />
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        {/* Featured Banner */}
        <section className="px-4 py-6 mb-2">
          <div className="bg-gold rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-20">
              <img src="/icon.svg" alt="" className="w-40 h-40" />
            </div>
            <h2 className="text-2xl font-bold mb-1 relative z-10 text-teal-deep">
              Welcome to the gathering 🌳
            </h2>
            <p className="text-teal-deep relative z-10 text-sm font-medium opacity-90">
              Discover content that nourishes your soul.
            </p>
          </div>
        </section>
        
        {/* Filter Toggles */}
        <section className="px-4 mb-6 flex justify-end">
            <button 
                onClick={() => setShowHistorical(!showHistorical)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${showHistorical ? 'bg-teal-deep text-white border-teal-deep' : 'bg-white text-gray-500 border-gray-200'}`}
            >
                {showHistorical ? "Hide History" : "Show History 📜"}
            </button>
        </section>

        {/* Sections */}
        <div className="space-y-8">
            {/* For You */}
            <section>
            <div className="flex items-center justify-between px-4 mb-3">
                <h3 className="font-bold text-gray-dark text-lg">For You</h3>
                <Link href="/search" className="text-teal text-sm font-medium">See All →</Link>
            </div>
            <div className="flex overflow-x-auto gap-4 px-4 pb-4 scrollbar-hide snap-x intro-x">
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

             {/* Muslim Voices (Public Figures) */}
             <section className="bg-gradient-to-r from-teal-light/30 to-transparent py-6">
                <div className="flex items-center justify-between px-4 mb-3">
                    <h3 className="font-bold text-teal-deep text-lg flex items-center">
                         Muslim Voices <Star className="w-4 h-4 ml-2 fill-gold text-gold" />
                    </h3>
                    <Link href="/search?category=public_figure" className="text-teal text-sm font-medium">See All →</Link>
                </div>
                <div className="flex overflow-x-auto gap-4 px-4 pb-2 scrollbar-hide snap-x">
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
            <LanguageRow language="Somali" defaultTitle="Speaks Somali" />

            {/* Women Scholars */}
            <WomenScholarsRow />

            {/* Historical / Classical Scholars */}
            {showHistorical && <HistoricalSection />}
            {!showHistorical && <div className="px-4 text-center text-xs text-gray-400 italic">Toggle &quot;Show History&quot; to see classical scholars</div>}
          
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

// Helper icon component for this file
function Star(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}
