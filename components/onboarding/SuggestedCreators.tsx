"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";

// Mock Data
const SUGGESTED_CREATORS = [
  {
    id: "1",
    name: "Dr. Omar Suleiman",
    category: "Scholar",
    verified: true,
    avatar: "https://i.pravatar.cc/150?u=omar", // Placeholder
  },
  {
    id: "2",
    name: "Yasmin Mogahed",
    category: "Educator",
    verified: true,
    avatar: "https://i.pravatar.cc/150?u=yasmin",
  },
  {
    id: "3",
    name: "Mufti Menk",
    category: "Scholar",
    verified: true,
    avatar: "https://i.pravatar.cc/150?u=menk",
  },
  {
    id: "4",
    name: "Nouman Ali Khan",
    category: "Educator",
    verified: true,
    avatar: "https://i.pravatar.cc/150?u=nouman",
  },
];

interface SuggestedCreatorsProps {
  onFinish: () => void;
}

export default function SuggestedCreators({ onFinish }: SuggestedCreatorsProps) {
  const [following, setFollowing] = useState<string[]>([]);

  const toggleFollow = (id: string) => {
    setFollowing((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-dark px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Welcome to the gathering 🌳</h2>
        <p className="text-gray-500">Here are some scholars you might like</p>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pb-4">
        {SUGGESTED_CREATORS.map((creator) => {
          const isFollowing = following.includes(creator.id);
          return (
            <div
              key={creator.id}
              className="flex items-center justify-between p-4 bg-gray-offwhite rounded-2xl border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-12 h-12 rounded-full object-cover bg-gray-200"
                />
                <div>
                  <h3 className="font-bold text-gray-dark text-sm">
                    {creator.name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{creator.category}</span>
                    {creator.verified && (
                      <span className="ml-1 text-teal">✓</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleFollow(creator.id)}
                className={`flex items-center justify-center px-4 py-2.5 rounded-full text-xs font-bold transition-all border min-h-[44px] ${
                  isFollowing
                    ? "bg-transparent border-teal text-teal"
                    : "bg-white border-teal text-teal hover:bg-teal-light"
                }`}
              >
                {isFollowing ? (
                  <>
                    Following <Check className="w-3 h-3 ml-1" />
                  </>
                ) : (
                  <>
                    Follow <Plus className="w-3 h-3 ml-1" />
                  </>
                )}
              </button>
            </div>
          );
        })}
        
        <button className="w-full py-3 text-teal font-medium text-sm hover:underline">
          See more suggestions
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 bg-white">
        <button
          onClick={onFinish}
          className="w-full py-4 bg-teal text-white rounded-xl font-bold text-lg shadow-lg hover:bg-teal-deep transition-colors"
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
}
