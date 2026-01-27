"use client";

import { useState } from "react";
import { Search as SearchIcon, X, ArrowLeft } from "lucide-react";
import BottomNav from "../ui/BottomNav";
import { REGIONS } from "@/lib/data/regions";
import CreatorCard from "../ui/CreatorCard";
import { useRouter } from "next/navigation";

// Mock Data
const TRENDING_CREATORS = [
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
];

const POPULAR_TOPICS = [
  "📖 Quran", "👨‍👩‍👧 Family", "🌱 Growth",
  "⚖️ Fiqh", "🏛️ History", "✨ Youth"
];

export default function SearchScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");

  const regionsList = ["All", ...Object.values(REGIONS).map(r => r.name)];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6 text-gray-dark" />
          </button>
          <div className="flex-1 relative">
            <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scholars, topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Region Filter Pills */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
          {regionsList.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedRegion === region
                  ? "bg-teal text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {/* Recent Searches (Mock) */}
        {!searchTerm && (
          <section className="mb-8">
            <h3 className="font-bold text-gray-dark mb-3">Recent</h3>
            <div className="flex flex-wrap gap-2">
              {["Tafsir Al-Fatiha", "Marriage advice"].map((term) => (
                <div key={term} className="flex items-center bg-white px-3 py-2 rounded-lg border border-gray-100 text-sm text-gray-600">
                  <span className="mr-2">{term}</span>
                  <X className="w-3 h-3 text-gray-400 cursor-pointer" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular Topics */}
        <section className="mb-8">
          <h3 className="font-bold text-gray-dark mb-3">Popular Topics</h3>
          <div className="grid grid-cols-2 gap-3">
             {POPULAR_TOPICS.map(topic => (
               <div key={topic} className="bg-white p-4 rounded-xl border border-gray-100 text-center font-medium shadow-sm hover:border-teal transition-colors cursor-pointer">
                 {topic}
               </div>
             ))}
          </div>
        </section>

        {/* Trending */}
        <section>
          <h3 className="font-bold text-gray-dark mb-3">Trending Creators</h3>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {TRENDING_CREATORS.map(creator => (
               <CreatorCard key={creator.id} {...creator} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
