"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";

const INTERESTS = [
  "📖 Quran & Tafsir",
  "📚 Hadith & Sunnah",
  "🌱 Spirituality & Growth",
  "👨‍👩‍👧 Family & Parenting",
  "👥 Youth & Identity",
  "🏛️ History & Heritage",
  "⚖️ Social Issues",
  "✨ New to Faith",
];

interface InterestsSelectionProps {
  onBack: () => void;
  onNext: (interests: string[]) => void;
  onSkip: () => void;
}

export default function InterestsSelection({
  onBack,
  onNext,
  onSkip,
}: InterestsSelectionProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-dark px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack}>
          <ArrowLeft className="w-6 h-6 text-gray-dark" />
        </button>
        <span className="text-sm font-medium text-gray-400">Step 2 of 3</span>
        <div className="w-6" /> {/* Spacer */}
      </div>

      <h2 className="text-2xl font-bold mb-8">What topics interest you?</h2>

      <div className="flex flex-wrap gap-3 flex-1 content-start">
        {INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest);
          return (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-5 py-3.5 rounded-full border-2 transition-all font-semibold text-sm min-h-[44px] ${
                isSelected
                  ? "bg-teal border-teal text-white shadow-md"
                  : "bg-white border-gray-100 text-gray-600 hover:border-teal/50"
              }`}
            >
              {interest}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 mt-8">
        <button
          onClick={() => onNext(selectedInterests)}
          disabled={selectedInterests.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
            selectedInterests.length > 0
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
