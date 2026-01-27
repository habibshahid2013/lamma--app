"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { REGIONS } from "@/lib/data/regions";

interface CountryDrilldownProps {
  selectedRegionIds: string[];
  onBack: () => void;
  onNext: (selectedCountries: string[]) => void;
}

export default function CountryDrilldown({
  selectedRegionIds,
  onBack,
  onNext,
}: CountryDrilldownProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    );
  };

  const selectedRegionsData = selectedRegionIds
    .map((id) => Object.values(REGIONS).find((r) => r.id === id))
    .filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-dark px-4 py-6">
      <button onClick={onBack} className="self-start mb-6">
        <ArrowLeft className="w-6 h-6 text-gray-dark" />
      </button>

      <h2 className="text-2xl font-bold mb-2">Want to get more specific?</h2>
      <p className="text-gray-500 mb-6">(Optional) Select specific countries</p>

      <div className="flex-1 overflow-y-auto pb-4 space-y-8">
        {selectedRegionsData.map((region) => (
          <div key={region?.id}>
            <h3 className="font-semibold text-lg text-teal mb-3">
              {region?.name} {region?.emoji}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {region?.countries.map((country) => {
                const isSelected = selectedCountries.includes(country.code);
                return (
                  <button
                    key={country.code}
                    onClick={() => toggleCountry(country.code)}
                    className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center space-y-2 h-28 shadow-sm ${
                      isSelected
                        ? "border-teal bg-teal-light"
                        : "border-gray-100 bg-white hover:border-teal/30"
                    }`}
                  >
                    <span className="text-4xl drop-shadow-sm">{country.flag}</span>
                    <span
                      className={`font-medium text-xs truncate w-full px-1 ${
                        isSelected ? "text-teal-deep" : "text-gray-600"
                      }`}
                    >
                      {country.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 mt-4 pt-4 border-t border-gray-100 bg-white">
        <button
          onClick={() => onNext(selectedCountries)}
          className="w-full py-4 bg-teal text-white rounded-xl font-bold text-lg shadow-lg hover:bg-teal-deep transition-colors"
        >
          Continue
        </button>
        <button
          onClick={() => onNext([])}
          className="w-full text-center text-teal font-medium hover:underline py-2"
        >
          Keep it broad - Regions are fine
        </button>
      </div>
    </div>
  );
}
