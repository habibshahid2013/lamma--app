"use client";

import { useState } from "react";
import { ArrowLeft, Target, Globe } from "lucide-react";

interface PersonalizeChoiceProps {
  onBack: () => void;
  onNext: (choice: "personalize" | "all") => void;
}

export default function PersonalizeChoice({ onBack, onNext }: PersonalizeChoiceProps) {
  const [selected, setSelected] = useState<"personalize" | "all" | null>(null);

  const handleNext = () => {
    if (selected) {
      onNext(selected);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-dark px-4 py-6">
      <button onClick={onBack} className="self-start mb-6">
        <ArrowLeft className="w-6 h-6 text-gray-dark" />
      </button>

      <h2 className="text-2xl font-bold mb-8">How would you like to explore?</h2>

      <div className="space-y-4 flex-1">
        <button
          onClick={() => setSelected("personalize")}
          className={`w-full p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
            selected === "personalize"
              ? "border-teal bg-teal-light"
              : "border-gray-100 bg-gray-offwhite"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <Target className={`w-6 h-6 ${selected === 'personalize' ? 'text-teal' : 'text-gray-400'}`} />
            </div>
            {selected === "personalize" && (
              <div className="w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-xs">✓</div>
            )}
          </div>
          <h3 className="font-bold text-lg mb-1">Personalize for me</h3>
          <p className="text-gray-500 text-sm">
            Help me find scholars who resonate with my background
          </p>
        </button>

        <button
          onClick={() => setSelected("all")}
          className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
            selected === "all"
              ? "border-teal bg-teal-light"
              : "border-gray-100 bg-gray-offwhite"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <Globe className={`w-6 h-6 ${selected === 'all' ? 'text-teal' : 'text-gray-400'}`} />
            </div>
            {selected === "all" && (
              <div className="w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-xs">✓</div>
            )}
          </div>
          <h3 className="font-bold text-lg mb-1">Show me everything</h3>
          <p className="text-gray-500 text-sm">I&apos;ll browse all creators</p>
        </button>
      </div>

      <div className="space-y-4 mt-8">
        <p className="text-center text-xs text-gray-400">
          You can change this anytime in Settings
        </p>
        <button
          onClick={handleNext}
          disabled={!selected}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
            selected
              ? "bg-teal text-white shadow-lg hover:bg-teal-deep"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
