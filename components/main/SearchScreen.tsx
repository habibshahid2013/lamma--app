"use client";

import { useState, useMemo } from "react";
import { Search as SearchIcon, X, ArrowLeft, Settings2 } from "lucide-react";
import BottomNav from "../ui/BottomNav";
import { REGIONS } from "@/lib/data/regions";
import CreatorCard from "../ui/CreatorCard";
import { useRouter, useSearchParams } from "next/navigation";
import FilterPanel from "./FilterPanel";

// Mock Data
const POPULAR_TOPICS = [
  "📖 Quran", "👨‍👩‍👧 Family", "🌱 Growth",
  "⚖️ Fiqh", "🏛️ History", "✨ Youth"
];

import { useCreators } from "@/hooks/useCreators";

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
    
    return allCreators.filter(c => {
      const matchesSearch = searchTerm === "" || 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.topics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Region Filter
      // Note: region in Firestore is a string key (e.g. "americas"), need to map if filter uses names.
      // The filter logic uses REGIONS[c.region].name. 
      // c.region from Firestore should be "americas", "europe" etc.
      // Type safe check:
      const regionKey = c.region as keyof typeof REGIONS;
      const matchesRegion = filters.regions.length === 0 || 
        (REGIONS[regionKey] && filters.regions.includes(REGIONS[regionKey].name));

      // Language Filter
      const matchesLanguage = filters.languages.length === 0 || 
        c.languages.some(l => filters.languages.includes(l));

      // Category Filter
      const matchesCategory = filters.categories.length === 0 || 
         filters.categories.includes(c.category);

      // Tier Filter
      const matchesTier = filters.tiers.length === 0 ||
         filters.tiers.includes(c.tier);

      // Gender Filter
      const matchesGender = filters.gender === "all" || c.gender === filters.gender;

      // Historical Filter
      // Default behavior: Exclude historical unless 'includeHistorical' is true OR specifically filtering for them
      const isHistoricalMatch = filters.includeHistorical ? true : !c.isHistorical;
      
      return matchesSearch && matchesRegion && matchesLanguage && matchesCategory && matchesTier && matchesGender && isHistoricalMatch;
    });
  }, [searchTerm, filters, allCreators, loading]);

  const activeFilterCount = 
    filters.categories.length + 
    filters.regions.length + 
    filters.languages.length + 
    filters.tiers.length + 
    (filters.gender !== "all" ? 1 : 0) +
    (filters.includeHistorical ? 1 : 0);

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
              className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal/20"
            />
             <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                    <X className="w-4 h-4 text-gray-400" />
                </button>
                )}
                <button onClick={() => setIsFilterOpen(true)} className="relative">
                    <Settings2 className={`w-5 h-5 ${activeFilterCount > 0 ? "text-teal" : "text-gray-400"}`} />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal rounded-full border border-white" />
                    )}
                </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Area */}
        {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
                 {/* Categories */}
                 {filters.categories.map(cat => (
                     <span key={cat} className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-teal text-white text-xs font-medium">
                         {cat.replace("_", " ")}
                         <button onClick={() => removeFilterChip("categories", cat)} className="ml-1.5 p-0.5"><X className="w-3.5 h-3.5" /></button>
                     </span>
                 ))}
                 {/* Languages */}
                 {filters.languages.map(lang => (
                     <span key={lang} className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-teal text-white text-xs font-medium">
                         {lang}
                         <button onClick={() => removeFilterChip("languages", lang)} className="ml-1.5 p-0.5"><X className="w-3.5 h-3.5" /></button>
                     </span>
                 ))}
                 {/* Gender */}
                 {filters.gender !== "all" && (
                      <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-teal text-white text-xs font-medium capitalize">
                      {filters.gender}
                      <button onClick={() => setFilters({...filters, gender: "all"})} className="ml-1.5 p-0.5"><X className="w-3.5 h-3.5" /></button>
                  </span>
                 )}
                 {/* Historical */}
                 {filters.includeHistorical && (
                       <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-medium capitalize">
                       History Included
                       <button onClick={() => setFilters({...filters, includeHistorical: false})} className="ml-1.5 p-0.5"><X className="w-3.5 h-3.5" /></button>
                   </span>
                 )}
            </div>
        )}

        {/* Quick Filter Pills (Languages) - Only show if not fully filtered? Or always logic? */}
        {/* We keep the horizontal scrollers for quick access but sync them with main state */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide mb-2">
           {languagesList.map((lang) => {
             const isSelected = filters.languages.includes(lang);
             return (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  isSelected
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-500 border-gray-200"
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
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-colors border ${
                    filters.gender === "female"
                    ? "bg-purple-100 text-purple-700 border-purple-200"
                    : "bg-gray-50 text-gray-500 border-gray-100"
                }`}
            >
                👩‍🎓 Women Only
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        
        {/* Results */}
        {(searchTerm || activeFilterCount > 0) ? (
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-dark">{filteredCreators.length} Results</h3>
                </div>
                
                {filteredCreators.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredCreators.map(creator => (
                            <div key={creator.id} className="flex justify-center">
                                <CreatorCard {...creator} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <p>No creators found matching your filters.</p>
                        <button 
                            onClick={clearFilters}
                            className="text-teal font-medium mt-2 text-sm"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </section>
        ) : (
            <>
                {/* Default View */}
                
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
                    {loading ? (
                         [1, 2, 3].map(i => (
                             <div key={i} className="w-40 sm:w-44 h-56 bg-gray-100 rounded-2xl animate-pulse flex-shrink-0" />
                         ))
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
