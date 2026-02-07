"use client";

import { X } from "lucide-react";
import { REGIONS } from "@/lib/data/regions";
import { motion, AnimatePresence } from "framer-motion";

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
  { id: "scholar", label: "Scholar" },
  { id: "speaker", label: "Speaker" },
  { id: "educator", label: "Educator" },
  { id: "reciter", label: "Reciter" },
  { id: "author", label: "Author" },
  { id: "activist", label: "Activist" },
  { id: "public_figure", label: "Public Figure" },
];

const LANGUAGES = ["English", "Arabic", "Somali", "Urdu", "Indonesian", "French"];
const TIERS = ["verified", "rising"];

export default function FilterPanel({ isOpen, onClose, filters, setFilters, onApply, onClear }: FilterPanelProps) {
  const toggleArrayItem = (field: string, value: string) => {
    const current = filters[field as keyof typeof filters] as string[];
    if (current.includes(value)) {
      setFilters({ ...filters, [field]: current.filter((item) => item !== value) });
    } else {
      setFilters({ ...filters, [field]: [...current, value] });
    }
  };

  const activeCount =
    filters.categories.length +
    filters.regions.length +
    filters.languages.length +
    filters.tiers.length +
    (filters.gender !== "all" ? 1 : 0) +
    (filters.includeHistorical ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[80vh] flex flex-col shadow-[0_-8px_40px_-4px_rgba(0,0,0,0.15)]"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100/80">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-gray-900">Filters</h2>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 bg-teal/10 text-teal text-xs font-bold rounded-full">{activeCount}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={onClear} className="text-sm text-gray-400 font-semibold hover:text-gray-600 transition-colors">
                  Clear all
                </button>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

              {/* Category */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => toggleArrayItem("categories", cat.id)}
                      className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                        filters.categories.includes(cat.id)
                          ? 'bg-teal text-white border-teal shadow-md shadow-teal/20'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Region */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Region</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(REGIONS).map(region => (
                    <button
                      key={region.id}
                      onClick={() => toggleArrayItem("regions", region.name)}
                      className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                        filters.regions.includes(region.name)
                          ? 'bg-teal text-white border-teal shadow-md shadow-teal/20'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {region.emoji} {region.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Language */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Language</h3>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => toggleArrayItem("languages", lang)}
                      className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                        filters.languages.includes(lang)
                          ? 'bg-teal text-white border-teal shadow-md shadow-teal/20'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </section>

              {/* Tier */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tier</h3>
                <div className="flex flex-wrap gap-2">
                  {TIERS.map(tier => (
                    <button
                      key={tier}
                      onClick={() => toggleArrayItem("tiers", tier)}
                      className={`px-3.5 py-2 rounded-full text-sm font-semibold border capitalize transition-all duration-200 ${
                        filters.tiers.includes(tier)
                          ? 'bg-teal text-white border-teal shadow-md shadow-teal/20'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {tier === "verified" ? "Verified" : "Rising"}
                    </button>
                  ))}
                </div>
              </section>

              {/* Gender */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Gender</h3>
                <div className="flex bg-gray-100/80 p-1 rounded-xl">
                  {(["all", "male", "female"] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setFilters({...filters, gender: g})}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-lg capitalize transition-all duration-200 ${
                        filters.gender === g
                          ? 'bg-white shadow-md text-gray-900'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </section>

              {/* Historical */}
              <section>
                <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200/80 rounded-2xl cursor-pointer hover:border-gray-300 transition-all">
                  <input
                    type="checkbox"
                    checked={filters.includeHistorical}
                    onChange={(e) => setFilters({...filters, includeHistorical: e.target.checked})}
                    className="w-5 h-5 text-teal rounded-md focus:ring-teal border-gray-300"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-900">Include Historical Figures</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Show classical scholars in results</p>
                  </div>
                </label>
              </section>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100/80 safe-bottom">
              <button
                onClick={onApply}
                className="w-full bg-gradient-to-r from-teal to-teal-deep text-white font-bold py-3.5 rounded-2xl hover:shadow-lg hover:shadow-teal/20 transition-all active:scale-[0.98] transform"
              >
                Apply Filters
                {activeCount > 0 && ` (${activeCount})`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
