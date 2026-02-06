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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[75vh] flex flex-col shadow-2xl"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <div className="flex items-center gap-4">
                <button onClick={onClear} className="text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors">
                  Clear all
                </button>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Category */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => toggleArrayItem("categories", cat.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                        filters.categories.includes(cat.id)
                          ? 'bg-teal text-white border-teal shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Region */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Region</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.values(REGIONS).map(region => (
                    <button
                      key={region.id}
                      onClick={() => toggleArrayItem("regions", region.name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                        filters.regions.includes(region.name)
                          ? 'bg-teal text-white border-teal shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {region.emoji} {region.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Language */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Language</h3>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => toggleArrayItem("languages", lang)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                        filters.languages.includes(lang)
                          ? 'bg-teal text-white border-teal shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </section>

              {/* Tier */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Tier</h3>
                <div className="flex flex-wrap gap-2">
                  {TIERS.map(tier => (
                    <button
                      key={tier}
                      onClick={() => toggleArrayItem("tiers", tier)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border capitalize transition-all duration-150 ${
                        filters.tiers.includes(tier)
                          ? 'bg-teal text-white border-teal shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {tier === "verified" ? "Verified" : "Rising"}
                    </button>
                  ))}
                </div>
              </section>

              {/* Gender */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Gender</h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {(["all", "male", "female"] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setFilters({...filters, gender: g})}
                      className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all duration-150 ${
                        filters.gender === g
                          ? 'bg-white shadow-sm text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </section>

              {/* Historical */}
              <section>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors">
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
            <div className="px-5 py-4 border-t border-gray-100 safe-bottom">
              <button
                onClick={onApply}
                className="w-full bg-teal text-white font-semibold py-3 rounded-xl hover:bg-teal-deep transition-colors active:scale-[0.98] transform"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
