"use client";

import { Search, User, TreeDeciduous } from "lucide-react";
import BottomNav from "../ui/BottomNav";
import CreatorCard from "../ui/CreatorCard";

// Mock Data
const FEATURED_CREATORS = [
  {
    id: "1",
    name: "Dr. Omar Suleiman",
    category: "Scholar",
    verified: true,
    avatar: "https://i.pravatar.cc/150?u=omar",
  },
  {
    id: "2",
    name: "Yasmin Mogahed",
    category: "Educator",
    verified: true,
    avatar: "https://i.pravatar.cc/150?u=yasmin",
  },
  {
    id: "3",
    name: "Mufti Menk",
    category: "Scholar",
    verified: true,
    avatar: "https://i.pravatar.cc/150?u=menk",
  },
  {
    id: "4",
    name: "Nouman Ali Khan",
    category: "Educator",
    verified: true,
    avatar: "https://i.pravatar.cc/150?u=nouman",
  },
  {
    id: "5",
    name: "Imam Suhaib Webb",
    category: "Imam",
    verified: true,
    avatar: "https://i.pravatar.cc/150?u=suhaib",
  }
];

const TOPICS = [
  "📖 Quran",
  "📚 Hadith",
  "🌱 Spirituality",
  "👨‍👩‍👧 Family",
  "👥 Youth",
  "🏛️ History",
];

export default function HomeScreen() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TreeDeciduous className="w-6 h-6 text-teal" />
          <span className="font-bold text-teal text-lg">LAMMA+</span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-600 hover:text-teal transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center text-teal font-bold text-xs ring-2 ring-white shadow-sm">
            UA
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        {/* Featured Banner */}
        <section className="px-4 py-6 mb-2">
          <div className="bg-gold rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <TreeDeciduous className="w-40 h-40 text-teal-deep" />
            </div>
            <h2 className="text-2xl font-bold mb-1 relative z-10 text-teal-deep">
              Welcome to the gathering 🌳
            </h2>
            <p className="text-teal-deep relative z-10 text-sm font-medium opacity-90">
              Discover content that nourishes your soul.
            </p>
          </div>
        </section>

        {/* For You Section */}
        <section className="mb-8">
          <div className="px-4 mb-3 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-dark">For You</h3>
            <button className="text-teal text-xs font-semibold">See All</button>
          </div>
          <div className="flex overflow-x-auto px-4 gap-3 pb-2 scrollbar-hide snap-x">
            {FEATURED_CREATORS.map((creator) => (
              <CreatorCard
                key={creator.id}
                {...creator}
                onFollow={() => console.log("Follow", creator.id)}
              />
            ))}
          </div>
        </section>
        
        {/* Browse Topics */}
        <section className="mb-8">
          <div className="px-4 mb-3">
            <h3 className="font-bold text-lg text-gray-dark">Browse Topics</h3>
          </div>
          <div className="flex overflow-x-auto px-4 gap-2 pb-2 scrollbar-hide">
            {TOPICS.map((topic) => (
               <button
                key={topic}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 whitespace-nowrap shadow-sm"
               >
                 {topic}
               </button>
            ))}
          </div>
        </section>

        {/* From Your Region (Mock) */}
        <section className="mb-4">
          <div className="px-4 mb-3 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-dark">From East Africa</h3>
             <button className="text-teal text-xs font-semibold">See All</button>
          </div>
           <div className="flex overflow-x-auto px-4 gap-3 pb-2 scrollbar-hide snap-x">
            {/* Reusing creators for demo */}
            {[...FEATURED_CREATORS].reverse().map((creator) => (
              <CreatorCard
                key={`region-${creator.id}`}
                {...creator}
                onFollow={() => console.log("Follow", creator.id)}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
