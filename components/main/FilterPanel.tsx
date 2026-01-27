"use client";

import { X } from "lucide-react";
import { REGIONS } from "@/lib/data/regions";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    categories: string[];
    regions: string[];
    languages: string[];
    tiers: string[];
    includeHistorical: boolean;
    gender: "all" | "male" | "female";
  };
  setFilters: (filters: any) => void;
  onApply: () => void;
  onClear: () => void;
}

const CATEGORIES = [
  { id: "scholar", label: "📚 Scholar" },
  { id: "speaker", label: "🎤 Speaker" },
  { id: "educator", label: "👨‍🏫 Educator" },
  { id: "reciter", label: "🎙️ Reciter" },
  { id: "author", label: "📖 Author" },
  { id: "activist", label: "✊ Activist" },
  { id: "public_figure", label: "⭐ Public Figure" },
];

const LANGUAGES = ["English", "Arabic", "Somali", "Urdu", "Indonesian", "French"];
const TIERS = ["verified", "rising"];

export default function FilterPanel({ isOpen, onClose, filters, setFilters, onApply, onClear }: FilterPanelProps) {
  if (!isOpen) return null;

  const toggleArrayItem = (field: string, value: string) => {
    const current = filters[field as keyof typeof filters] as string[];
    if (current.includes(value)) {
      setFilters({ ...filters, [field]: current.filter((item) => item !== value) });
    } else {
      setFilters({ ...filters, [field]: [...current, value] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-dark">Filters</h2>
        <div className="flex items-center gap-4">
            <button onClick={onClear} className="text-sm text-gray-500 font-medium">Clear</button>
            <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Category */}
        <section>
            <h3 className="text-sm font-bold text-gray-dark mb-3">Category</h3>
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => toggleArrayItem("categories", cat.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            filters.categories.includes(cat.id)
                            ? 'bg-teal-light text-teal-deep border-teal'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </section>

        {/* Region */}
        <section>
            <h3 className="text-sm font-bold text-gray-dark mb-3">Region</h3>
            <div className="flex flex-wrap gap-2">
                {Object.values(REGIONS).map(region => (
                    <button
                        key={region.id}
                        onClick={() => toggleArrayItem("regions", region.name)} // Using name to match SearchScreen logic
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            filters.regions.includes(region.name)
                            ? 'bg-teal-light text-teal-deep border-teal'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                    >
                        {region.emoji} {region.name}
                    </button>
                ))}
            </div>
        </section>

        {/* Language */}
        <section>
            <h3 className="text-sm font-bold text-gray-dark mb-3">Language</h3>
            <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                    <button
                        key={lang}
                        onClick={() => toggleArrayItem("languages", lang)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            filters.languages.includes(lang)
                            ? 'bg-teal-light text-teal-deep border-teal'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                    >
                        {lang}
                    </button>
                ))}
            </div>
        </section>

         {/* Tier */}
         <section>
            <h3 className="text-sm font-bold text-gray-dark mb-3">Tier</h3>
            <div className="flex flex-wrap gap-2">
                {TIERS.map(tier => (
                    <button
                        key={tier}
                        onClick={() => toggleArrayItem("tiers", tier)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border capitalize transition-colors ${
                            filters.tiers.includes(tier)
                            ? 'bg-teal-light text-teal-deep border-teal'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                    >
                        {tier === "verified" ? "⭐ Verified" : "🚀 Rising"}
                    </button>
                ))}
            </div>
        </section>

        {/* Gender */}
        <section>
            <h3 className="text-sm font-bold text-gray-dark mb-3">Gender</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
                {(["all", "male", "female"] as const).map(g => (
                    <button
                        key={g}
                        onClick={() => setFilters({...filters, gender: g})}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                            filters.gender === g
                            ? 'bg-white shadow-sm text-gray-900'
                            : 'text-gray-500'
                        }`}
                    >
                        {g}
                    </button>
                ))}
            </div>
        </section>

        {/* Options */}
        <section>
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-xl cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={filters.includeHistorical}
                    onChange={(e) => setFilters({...filters, includeHistorical: e.target.checked})}
                    className="w-5 h-5 text-teal rounded focus:ring-teal"
                />
                <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">Include Historical Figures</h4>
                    <p className="text-xs text-gray-500">Show classical scholars in results</p>
                </div>
            </label>
        </section>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button 
            onClick={onApply}
            className="w-full bg-teal text-white font-bold py-3 rounded-xl hover:bg-teal-deep transition-colors"
        >
            Apply Filters
        </button>
      </div>
    </div>
  );
}
