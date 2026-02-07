"use client";

import { useState, useMemo } from "react";
import { Search as SearchIcon, X, ArrowLeft, Settings2, Compass, ArrowUpDown } from "lucide-react";
import BottomNav from "../ui/BottomNav";
import { REGIONS } from "@/lib/data/regions";
import CreatorCard from "../ui/CreatorCard";
import { useRouter, useSearchParams } from "next/navigation";
import FilterPanel from "./FilterPanel";

// Mock Data
const POPULAR_TOPICS = [
  { emoji: "📖", label: "Quran" },
  { emoji: "👨‍👩‍👧", label: "Family" },
  { emoji: "🌱", label: "Growth" },
  { emoji: "⚖️", label: "Fiqh" },
  { emoji: "🏛️", label: "History" },
  { emoji: "✨", label: "Youth" },
];

import { useCreators } from "@/hooks/useCreators";
import { SkeletonCreatorGrid, SkeletonCreatorRow } from "../ui/SkeletonCard";

// Helper to get initial filters from search params
function getInitialFilters(searchParams: URLSearchParams) {
  const category = searchParams.get("category");
  const region = searchParams.get("region");

  const filters = {
    categories: [] as string[],
    regions: [] as string[],
    languages: [] as string[],
    tiers: [] as string[],
    includeHistorical: false,
    gender: "all" as "all" | "male" | "female"
  };

  if (category) {
    filters.categories = [category];
  }

  if (region) {
    const regionData = REGIONS[region as keyof typeof REGIONS];
    if (regionData) {
      filters.regions = [regionData.name];
    }
  }

  return filters;
}

export default function SearchScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params using lazy initializer
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("topic") || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"relevant" | "az" | "followers">("relevant");

  // Fetch all creators for client-side filtering (efficient for small datasets < 500)
  const { creators: allCreators, loading } = useCreators({ limitCount: 150 });

  // Consolidated Filter State - initialized from URL params
  const [filters, setFilters] = useState(() => getInitialFilters(searchParams));

  const languagesList = ["English", "Arabic", "Somali", "Urdu", "Indonesian"];

  // Quick toggle helpers (sync with consolidated state)
  const toggleLanguage = (lang: string) => {
    const current = filters.languages;
    const updated = current.includes(lang)
        ? current.filter(l => l !== lang)
        : [...current, lang];
    setFilters({ ...filters, languages: updated });
  };

  const toggleGender = () => {
      setFilters({ ...filters, gender: filters.gender === "female" ? "all" : "female" });
  };

  const clearFilters = () => {
      setFilters({
        categories: [],
        regions: [],
        languages: [],
        tiers: [],
        includeHistorical: false,
        gender: "all"
      });
      setSearchTerm("");
  };

  const removeFilterChip = (type: keyof typeof filters, value: string) => {
      if (Array.isArray(filters[type])) {
          setFilters({
              ...filters,
              [type]: (filters[type] as string[]).filter(v => v !== value)
          });
      }
  };

  const filteredCreators = useMemo(() => {
    if (loading) return [];

    const filtered = allCreators.filter(c => {
      const matchesSearch = searchTerm === "" ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.topics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const regionKey = c.region as keyof typeof REGIONS;
      const matchesRegion = filters.regions.length === 0 ||
        (REGIONS[regionKey] && filters.regions.includes(REGIONS[regionKey].name));

      const matchesLanguage = filters.languages.length === 0 ||
        c.languages.some(l => filters.languages.includes(l));

      const matchesCategory = filters.categories.length === 0 ||
         filters.categories.includes(c.category);

      const matchesTier = filters.tiers.length === 0 ||
         filters.tiers.includes(c.tier);

      const matchesGender = filters.gender === "all" || c.gender === filters.gender;

      const isHistoricalMatch = filters.includeHistorical ? true : !c.isHistorical;

      return matchesSearch && matchesRegion && matchesLanguage && matchesCategory && matchesTier && matchesGender && isHistoricalMatch;
    });

    // Sort
    if (sortBy === "az") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "followers") {
      filtered.sort((a, b) => (b.stats?.followerCount || 0) - (a.stats?.followerCount || 0));
    }

    return filtered;
  }, [searchTerm, filters, allCreators, loading, sortBy]);

  const activeFilterCount =
    filters.categories.length +
    filters.regions.length +
    filters.languages.length +
    filters.tiers.length +
    (filters.gender !== "all" ? 1 : 0) +
    (filters.includeHistorical ? 1 : 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100/50 p-4 shadow-[0_1px_12px_-2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center space-x-3 mb-4">
          <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-dark" />
          </button>
          <div className="flex-1 relative">
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scholars, topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100/80 rounded-2xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:bg-white border border-transparent focus:border-teal/20 transition-all"
            />
             <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                    <X className="w-4 h-4 text-gray-400" />
                </button>
                )}
                <button onClick={() => setIsFilterOpen(true)} className="relative p-1">
                    <Settings2 className={`w-5 h-5 transition-colors ${activeFilterCount > 0 ? "text-teal" : "text-gray-400"}`} />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-teal rounded-full border-2 border-white" />
                    )}
                </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Area */}
        {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
                 {filters.categories.map(cat => (
                     <span key={cat} className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-teal to-teal-deep text-white text-xs font-semibold shadow-sm">
                         {cat.replace("_", " ")}
                         <button onClick={() => removeFilterChip("categories", cat)} className="ml-1.5 p-0.5 hover:bg-white/20 rounded-full"><X className="w-3 h-3" /></button>
                     </span>
                 ))}
                 {filters.languages.map(lang => (
                     <span key={lang} className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-teal to-teal-deep text-white text-xs font-semibold shadow-sm">
                         {lang}
                         <button onClick={() => removeFilterChip("languages", lang)} className="ml-1.5 p-0.5 hover:bg-white/20 rounded-full"><X className="w-3 h-3" /></button>
                     </span>
                 ))}
                 {filters.gender !== "all" && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-500 text-white text-xs font-semibold capitalize shadow-sm">
                      {filters.gender}
                      <button onClick={() => setFilters({...filters, gender: "all"})} className="ml-1.5 p-0.5 hover:bg-white/20 rounded-full"><X className="w-3 h-3" /></button>
                  </span>
                 )}
                 {filters.includeHistorical && (
                       <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-sm">
                       History Included
                       <button onClick={() => setFilters({...filters, includeHistorical: false})} className="ml-1.5 p-0.5 hover:bg-white/20 rounded-full"><X className="w-3 h-3" /></button>
                   </span>
                 )}
            </div>
        )}

        {/* Quick Filter Pills (Languages) */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide mb-2">
           {languagesList.map((lang) => {
             const isSelected = filters.languages.includes(lang);
             return (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {lang}
              </button>
             );
           })}
        </div>

        {/* Quick Filter Toggles */}
        <div className="flex gap-2 pb-2">
            <button
                onClick={toggleGender}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${
                    filters.gender === "female"
                    ? "bg-purple-100 text-purple-700 border-purple-200 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
            >
                Women Only
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">

        {/* Results */}
        {(searchTerm || activeFilterCount > 0) ? (
            <section>
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-extrabold text-gray-dark text-lg">{filteredCreators.length} <span className="text-gray-400 font-medium text-base">results</span></h3>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal/20 shadow-sm"
                      >
                        <option value="relevant">Most Relevant</option>
                        <option value="az">A–Z</option>
                        <option value="followers">Most Followed</option>
                      </select>
                      <ArrowUpDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {loading ? (
                    <SkeletonCreatorGrid count={4} />
                ) : filteredCreators.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredCreators.map(creator => (
                            <div key={creator.id} className="flex justify-center">
                                <CreatorCard {...creator} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <Compass className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-semibold text-gray-500 mb-1">No creators found</p>
                        <p className="text-sm text-gray-400 mb-3">Try adjusting your filters</p>
                        <button
                            onClick={clearFilters}
                            className="text-teal font-semibold text-sm hover:underline px-4 py-2 rounded-full bg-teal/5 hover:bg-teal/10 transition-colors"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </section>
        ) : (
            <>
                {/* Default View */}

                {/* Popular Topics */}
                <section className="mb-8">
                <h3 className="font-extrabold text-gray-dark mb-4 text-lg">Popular Topics</h3>
                <div className="grid grid-cols-3 gap-3">
                    {POPULAR_TOPICS.map(topic => (
                    <button
                      key={topic.label}
                      onClick={() => setSearchTerm(topic.label)}
                      className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_-4px_rgba(13,115,119,0.12)] hover:border-teal/20 transition-all duration-300 group"
                    >
                        <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{topic.emoji}</span>
                        <span className="text-xs font-semibold text-gray-600 group-hover:text-teal transition-colors">{topic.label}</span>
                    </button>
                    ))}
                </div>
                </section>

                {/* Trending */}
                <section>
                <h3 className="font-extrabold text-gray-dark mb-4 text-lg">Trending Creators</h3>
                <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                    {loading ? (
                         <SkeletonCreatorRow count={3} />
                    ) : (
                        allCreators.filter(c => c.trending).slice(0, 5).map(creator => (
                        <CreatorCard key={creator.id} {...creator} />
                        ))
                    )}
                </div>
                </section>
            </>
        )}
      </main>

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onApply={() => setIsFilterOpen(false)}
        onClear={clearFilters}
      />

      <BottomNav />
    </div>
  );
}
