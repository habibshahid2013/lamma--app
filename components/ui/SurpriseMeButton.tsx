"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { CREATORS } from "@/lib/data/creators";

export default function SurpriseMeButton() {
  const router = useRouter();

  const handleSurprise = () => {
    const random = CREATORS[Math.floor(Math.random() * CREATORS.length)];
    router.push(`/creator/${random.id}`);
  };

  return (
    <button
      onClick={handleSurprise}
      className="fixed bottom-24 right-4 z-30 bg-gradient-to-tr from-teal to-teal-light text-white p-3 rounded-full shadow-lg shadow-teal/30 hover:scale-105 active:scale-95 transition-all group"
    >
      <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      <span className="sr-only">Surprise Me</span>
    </button>
  );
}
