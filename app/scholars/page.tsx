"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreatorCard from "@/components/ui/CreatorCard";
import { useCreators } from "@/hooks/useCreators";
import { REGIONS } from "@/lib/data/regions";
import { Search, X, SlidersHorizontal, GraduationCap } from "lucide-react";
import { SkeletonCreatorGrid } from "@/components/ui/SkeletonCard";

// ---------------------------------------------------------------------------
// Filter option definitions
// ---------------------------------------------------------------------------

const categories = [
  { value: "all", label: "All" },
  { value: "scholar", label: "Scholar" },
  { value: "educator", label: "Educator" },
  { value: "speaker", label: "Speaker" },
  { value: "reciter", label: "Reciter" },
  { value: "author", label: "Author" },
  { value: "podcaster", label: "Podcaster" },
];

const regionOptions = [
  { value: "All", label: "All" },
  { value: "americas", label: "Americas" },
  { value: "europe", label: "Europe" },
  { value: "middle_east", label: "Middle East" },
  { value: "africa", label: "Africa" },
  { value: "south_asia", label: "South Asia" },
  { value: "southeast_asia", label: "Southeast Asia" },
];

const languageOptions = [
  "All",
  "English",
  "Arabic",
  "Urdu",
  "Spanish",
  "French",
  "Somali",
  "Turkish",
];

const quickTopics = [
  { id: "quran", name: "Quran" },
  { id: "fiqh", name: "Fiqh" },
  { id: "seerah", name: "Seerah" },
  { id: "tafsir", name: "Tafsir" },
  { id: "history", name: "History" },
  { id: "family", name: "Family" },
];

// ---------------------------------------------------------------------------
// Helper: match a creator's region key against the REGIONS lookup so that
// sub-regions like "east_africa" still match the broader "africa" filter.
// ---------------------------------------------------------------------------
function regionMatches(creatorRegion: string, selectedRegion: string): boolean {
  if (selectedRegion === "All") return true;
  if (creatorRegion === selectedRegion) return true;

  // Map sub-region keys that fall under the broader "africa" umbrella
  if (selectedRegion === "africa") {
    return ["africa", "east_africa", "west_africa", "north_africa"].includes(
      creatorRegion
    );
  }

  return false;
}

// ---------------------------------------------------------------------------
// Main content component (requires Suspense boundary for useSearchParams)
// ---------------------------------------------------------------------------

function ScholarsContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";
  const initialGender = searchParams.get("gender") || "";

  // ---- state ----
  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState(initialGender);

  // ---- data ----
  const { creators: allCreators, loading } = useCreators({ limitCount: 150 });

  // ---- derived ----
  const filteredCreators = useMemo(() => {
    if (loading) return [];

    return allCreators.filter((c) => {
      // Text search
      if (query) {
        const q = query.toLowerCase();
        const matchesQuery =
          c.name.toLowerCase().includes(q) ||
          (c.profile?.shortBio || c.profile?.bio || "").toLowerCase().includes(q) ||
          c.topics?.some((t: string) => t.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Category
      if (selectedCategory !== "all" && c.category !== selectedCategory)
        return false;

      // Region
      if (!regionMatches(c.region, selectedRegion)) return false;

      // Language
      if (
        selectedLanguage !== "All" &&
        !c.languages?.includes(selectedLanguage)
      )
        return false;

      // Topic pill
      if (selectedTopic) {
        const topicMatch = c.topics?.some((t: string) =>
          t.toLowerCase().includes(selectedTopic.toLowerCase())
        );
        if (!topicMatch) return false;
      }

      // Gender
      if (genderFilter && c.gender !== genderFilter) return false;

      return true;
    });
  }, [
    query,
    selectedRegion,
    selectedLanguage,
    selectedCategory,
    selectedTopic,
    genderFilter,
    allCreators,
    loading,
  ]);

  const clearFilters = () => {
    setQuery("");
    setSelectedRegion("All");
    setSelectedLanguage("All");
    setSelectedCategory("all");
    setSelectedTopic("");
    setGenderFilter("");
  };

  const hasActiveFilters =
    query ||
    selectedRegion !== "All" ||
    selectedLanguage !== "All" ||
    selectedCategory !== "all" ||
    selectedTopic ||
    genderFilter;

  // ---- render ----
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Discover Scholars</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and filter from our collection of Islamic scholars worldwide
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search scholars by name, topic, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          className="gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="mb-6 rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Category */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Badge
                    key={cat.value}
                    variant={
                      selectedCategory === cat.value ? "default" : "secondary"
                    }
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedCategory(cat.value)}
                  >
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Region */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Region
              </label>
              <div className="flex flex-wrap gap-1.5">
                {regionOptions.map((region) => (
                  <Badge
                    key={region.value}
                    variant={
                      selectedRegion === region.value ? "default" : "secondary"
                    }
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedRegion(region.value)}
                  >
                    {region.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Language
              </label>
              <div className="flex flex-wrap gap-1.5">
                {languageOptions.map((lang) => (
                  <Badge
                    key={lang}
                    variant={
                      selectedLanguage === lang ? "default" : "secondary"
                    }
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Gender
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(["", "male", "female"] as const).map((g) => (
                  <Badge
                    key={g}
                    variant={genderFilter === g ? "default" : "secondary"}
                    className="cursor-pointer text-xs"
                    onClick={() => setGenderFilter(g)}
                  >
                    {g === "" ? "All" : g === "male" ? "Male" : "Female"}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Active topic chip inside filter panel */}
          {selectedTopic && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Topic:</span>
              <Badge className="gap-1">
                {selectedTopic}
                <button onClick={() => setSelectedTopic("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Quick Topic Pills */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {quickTopics.map((topic) => (
          <Badge
            key={topic.id}
            variant={selectedTopic === topic.name ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() =>
              setSelectedTopic(selectedTopic === topic.name ? "" : topic.name)
            }
          >
            {topic.name}
          </Badge>
        ))}
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <GraduationCap className="h-4 w-4" />
        {loading ? (
          <span>Loading scholars...</span>
        ) : (
          <span>
            {filteredCreators.length} scholar
            {filteredCreators.length !== 1 ? "s" : ""} found
          </span>
        )}
      </div>

      {/* Scholar Grid */}
      {loading ? (
        <SkeletonCreatorGrid count={6} />
      ) : filteredCreators.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map((creator) => (
            <div key={creator.id} className="flex justify-center">
              <CreatorCard {...creator} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">No scholars found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export with Suspense wrapper (required for useSearchParams)
// ---------------------------------------------------------------------------

export default function ScholarsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-8">
            <div className="h-9 w-64 animate-pulse rounded-lg bg-muted" />
            <div className="mt-2 h-5 w-96 animate-pulse rounded-lg bg-muted" />
          </div>
          <SkeletonCreatorGrid count={6} />
        </div>
      }
    >
      <ScholarsContent />
    </Suspense>
  );
}
