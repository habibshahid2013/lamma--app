"use client";

import { useRouter } from "next/navigation";
import { Scroll, Heart, Globe, Book, Users, Scale, History, Sparkles } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";

const TOPICS = [
  { id: "spirituality", label: "Spirituality", icon: Heart, color: "bg-pink-100 text-pink-600" },
  { id: "quran", label: "Quran", icon: Book, color: "bg-teal-light text-teal-deep" },
  { id: "history", label: "History", icon: History, color: "bg-amber-100 text-amber-700" },
  { id: "family", label: "Family", icon: Users, color: "bg-blue-100 text-blue-600" },
  { id: "fiqh", label: "Fiqh", icon: Scale, color: "bg-purple-100 text-purple-600" },
  { id: "social_justice", label: "Justice", icon: Globe, color: "bg-green-100 text-green-600" },
  { id: "youth", label: "Youth", icon: Sparkles, color: "bg-orange-100 text-orange-600" },
  { id: "seerah", label: "Seerah", icon: Scroll, color: "bg-indigo-100 text-indigo-600" },
];

export default function TopicSection() {
  const router = useRouter();

  return (
    <section className="mb-8 px-4">
       <SectionHeader 
        title="Explore Topics" 
        action="See All"
        href="/search"
      />
      <div className="grid grid-cols-4 gap-3">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => router.push(`/search?q=${topic.label}`)} // Simple search redirection
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${topic.color}`}>
                <topic.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{topic.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
