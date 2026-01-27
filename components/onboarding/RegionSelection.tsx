"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { REGIONS } from "@/lib/data/regions";

interface RegionSelectionProps {
  onBack: () => void;
  onNext: (selectedRegions: string[]) => void;
  onSkip: () => void;
}

export default function RegionSelection({ onBack, onNext, onSkip }: RegionSelectionProps) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const toggleRegion = (regionId: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((id) => id !== regionId)
        : [...prev, regionId]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-dark px-4 py-6">
      <button onClick={onBack} className="self-start mb-6">
        <ArrowLeft className="w-6 h-6 text-gray-dark" />
      </button>

      <h2 className="text-2xl font-bold mb-2">
        What region connects to your heritage?
      </h2>
      <p className="text-gray-500 mb-6">Select any that resonate with you</p>

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pb-4 content-start">
        {Object.values(REGIONS).map((region) => {
          const isSelected = selectedRegions.includes(region.id);
          return (
            <button
              key={region.id}
              onClick={() => toggleRegion(region.id)}
              className={`p-6 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center space-y-3 h-40 shadow-sm ${
                isSelected
                  ? "border-teal bg-teal-light"
                  : "border-gray-100 bg-white hover:border-teal/30"
              }`}
            >
              <span className="text-5xl drop-shadow-sm">{region.emoji}</span>
              <span
                className={`font-semibold text-sm ${
                  isSelected ? "text-teal-deep" : "text-gray-dark"
                }`}
              >
                {region.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4 mt-4 pt-4 border-t border-gray-100 bg-white">
        <button
          onClick={() => onNext(selectedRegions)}
          disabled={selectedRegions.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
            selectedRegions.length > 0
              ? "bg-teal text-white shadow-lg hover:bg-teal-deep"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
        <button
          onClick={onSkip}
          className="w-full text-center text-teal font-medium hover:underline py-2"
        >
          Skip - show me everything
        </button>
      </div>
    </div>
  );
}
