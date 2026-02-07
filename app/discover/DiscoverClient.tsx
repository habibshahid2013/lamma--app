"use client";

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreatorCard from "@/components/ui/CreatorCard";
import { useCreators } from "@/hooks/useCreators";
import { Search, X, SlidersHorizontal, Users, Clock, Trash2 } from "lucide-react";
import { SkeletonCreatorGrid } from "@/components/ui/SkeletonCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import StaggerGrid, { StaggerItem } from "@/components/ui/StaggerGrid";
import { createSearchIndex, searchCreators } from "@/lib/search";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useTrack } from "@/hooks/useTrack";
import type { Creator } from "@/lib/types/creator";

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
  { value: "activist", label: "Activist" },
  { value: "influencer", label: "Influencer" },
  { value: "youth_leader", label: "Youth Leader" },
  { value: "public_figure", label: "Public Figure" },
];

const contentTypeOptions = [
  { value: "all", label: "All" },
  { value: "youtube", label: "YouTube" },
  { value: "podcast", label: "Podcasts" },
  { value: "books", label: "Books" },
  { value: "courses", label: "Courses" },
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
  { id: "community", name: "Community" },
  { id: "dawah", name: "Dawah" },
  { id: "youth", name: "Youth" },
  { id: "education", name: "Education" },
  { id: "leadership", name: "Leadership" },
  { id: "history", name: "History" },
  { id: "family", name: "Family" },
  { id: "spirituality", name: "Spirituality" },
  { id: "women", name: "Women" },
];

// ---------------------------------------------------------------------------
// Helper: match a creator's region key against sub-regions
// ---------------------------------------------------------------------------
function regionMatches(creatorRegion: string, selectedRegion: string): boolean {
  if (selectedRegion === "All") return true;
  if (creatorRegion === selectedRegion) return true;

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

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";
  const initialGender = searchParams.get("gender") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialContent = searchParams.get("content") || "all";

  // ---- state ----
  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedContentType, setSelectedContentType] = useState(initialContent);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState(initialGender);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ---- hooks ----
  const { creators: allCreators, loading } = useCreators({ limitCount: 600 });
  const { history, addToHistory, clearHistory } = useSearchHistory();
  const { track } = useTrack();

  // ---- fuzzy search index ----
  const searchIndex = useMemo(
    () => (allCreators.length > 0 ? createSearchIndex(allCreators) : null),
    [allCreators]
  );

  // ---- suggestions (top 5 fuzzy matches) ----
  const suggestions = useMemo(() => {
    if (!searchIndex || query.length < 2) return [];
    return searchCreators(searchIndex, query).slice(0, 5);
  }, [searchIndex, query]);

  // ---- close suggestions on outside click ----
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ---- derived: filter creators ----
  const filteredCreators = useMemo(() => {
    if (loading) return [];

    // Start with fuzzy search results or full list
    let results: Creator[];
    if (query && searchIndex) {
      results = searchCreators(searchIndex, query);
    } else {
      results = allCreators;
    }

    return results.filter((c) => {
      // Category
      if (selectedCategory !== "all" && c.category !== selectedCategory)
        return false;

      // Content type
      if (selectedContentType !== "all") {
        if (selectedContentType === "youtube" && !c.content?.youtube) return false;
        if (selectedContentType === "podcast" && !c.content?.podcast) return false;
        if (selectedContentType === "books" && !(c.content?.books?.length)) return false;
        if (selectedContentType === "courses" && !(c.content?.courses?.length)) return false;
      }

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
    selectedContentType,
    selectedTopic,
    genderFilter,
    allCreators,
    loading,
    searchIndex,
  ]);

  // ---- track search (debounced 1s) ----
  useEffect(() => {
    if (query.length < 2) return;
    const timer = setTimeout(() => {
      addToHistory(query);
      track("search_performed", {
        query,
        results_count: filteredCreators.length,
        filters: {
          category: selectedCategory,
          region: selectedRegion,
          language: selectedLanguage,
          contentType: selectedContentType,
        },
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [query, filteredCreators.length, selectedCategory, selectedRegion, selectedLanguage, selectedContentType, addToHistory, track]);

  const clearFilters = () => {
    setQuery("");
    setSelectedRegion("All");
    setSelectedLanguage("All");
    setSelectedCategory("all");
    setSelectedContentType("all");
    setSelectedTopic("");
    setGenderFilter("");
  };

  const hasActiveFilters =
    query ||
    selectedRegion !== "All" ||
    selectedLanguage !== "All" ||
    selectedCategory !== "all" ||
    selectedContentType !== "all" ||
    selectedTopic ||
    genderFilter;

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    setShowSuggestions(false);
    addToHistory(name);
  };

  const handleHistoryClick = (term: string) => {
    setQuery(term);
    setShowSuggestions(false);
  };

  // ---- render ----
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page Header */}
      <AnimatedSection className="mb-8">
        <h1 className="text-3xl font-bold">Discover Creators</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and filter creators across every category
        </p>
      </AnimatedSection>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div ref={searchRef} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, topic, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
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

          {/* Search Suggestions / History Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border/50 bg-card shadow-lg">
              {query.length >= 2 && suggestions.length > 0 ? (
                <div className="p-2">
                  <p className="mb-1 px-2 text-xs font-medium text-muted-foreground">
                    Suggestions
                  </p>
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSuggestionClick(s.name)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
                    >
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{s.name}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        {s.category}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : !query && history.length > 0 ? (
                <div className="p-2">
                  <div className="mb-1 flex items-center justify-between px-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Recent Searches
                    </p>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {history.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleHistoryClick(term)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

            {/* Content Type */}
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Content Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {contentTypeOptions.map((ct) => (
                  <Badge
                    key={ct.value}
                    variant={
                      selectedContentType === ct.value ? "default" : "secondary"
                    }
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedContentType(ct.value)}
                  >
                    {ct.label}
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
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
        <Users className="h-4 w-4" />
        {loading ? (
          <span>Loading creators...</span>
        ) : (
          <span>
            {filteredCreators.length} creator
            {filteredCreators.length !== 1 ? "s" : ""} found
          </span>
        )}
      </div>

      {/* Creator Grid */}
      {loading ? (
        <SkeletonCreatorGrid count={6} />
      ) : filteredCreators.length > 0 ? (
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCreators.map((creator) => (
            <StaggerItem key={creator.id} className="flex justify-center">
              <CreatorCard {...creator} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">No creators found</h3>
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
// Exported client component with Suspense wrapper
// ---------------------------------------------------------------------------

export default function DiscoverClient() {
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
      <DiscoverContent />
    </Suspense>
  );
}
