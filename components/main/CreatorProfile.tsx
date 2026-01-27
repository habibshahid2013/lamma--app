"use client";

import { useState } from "react";
import { ArrowLeft, Share2, MapPin, Globe, PlayCircle, BookOpen, Mic } from "lucide-react";
import BottomNav from "../ui/BottomNav";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";

// Mock Data
const CREATOR = {
  id: "1",
  name: "Dr. Omar Suleiman",
  category: "Scholar",
  verified: true,
  avatar: "https://i.pravatar.cc/150?u=omar",
  location: "Dallas, TX",
  languages: ["English", "Arabic"],
  region: "North America",
  bio: "Founder and President of the Yaqeen Institute for Islamic Research, and an Adjunct Professor of Islamic Studies.",
  stats: {
    followers: "1.2M",
    videos: 145,
    podcasts: 23,
    books: 4
  }
};

const CONTENT = [
  { id: 1, title: "The Meaning of Life", type: "video", views: "125K", date: "2 days ago", duration: "14:20" },
  { id: 2, title: "Angels in your presence", type: "video", views: "89K", date: "5 days ago", duration: "22:10" },
  { id: 3, title: "Why we pray", type: "video", views: "210K", date: "1 week ago", duration: "18:45" },
];

export default function CreatorProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"videos" | "podcasts" | "books">("videos");
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6 text-gray-dark" />
        </button>
        <button>
          <Share2 className="w-6 h-6 text-gray-dark" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Profile Info */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <img
              src={CREATOR.avatar}
              alt={CREATOR.name}
              className="w-24 h-24 rounded-full object-cover bg-gray-200 border-4 border-white shadow-sm"
            />
            {CREATOR.verified && (
              <div className="absolute bottom-0 right-0 bg-teal text-white p-1.5 rounded-full border-2 border-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-dark mb-1">{CREATOR.name}</h1>
          <div className="flex items-center text-sm text-gray-500 mb-3 space-x-3">
             <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {CREATOR.location}</span>
             <span className="flex items-center"><Globe className="w-3 h-3 mr-1" /> {CREATOR.languages.join(", ")}</span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed max-w-sm mb-6">
            {CREATOR.bio}
          </p>

          <div className="flex gap-3 w-full max-w-xs">
            <Button
              variant={isFollowing ? "outline" : "primary"}
              className="flex-1"
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button variant="secondary" className="px-4">
               Donating
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
           <div className="bg-gray-50 p-3 rounded-xl text-center">
             <div className="font-bold text-teal text-lg bg-teal-light w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1">
               <PlayCircle className="w-4 h-4" />
             </div>
             <span className="text-xs text-gray-500">{CREATOR.stats.videos} Videos</span>
           </div>
           <div className="bg-gray-50 p-3 rounded-xl text-center">
             <div className="font-bold text-teal text-lg bg-teal-light w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1">
               <Mic className="w-4 h-4" />
             </div>
             <span className="text-xs text-gray-500">{CREATOR.stats.podcasts} Audios</span>
           </div>
           <div className="bg-gray-50 p-3 rounded-xl text-center">
             <div className="font-bold text-teal text-lg bg-teal-light w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1">
               <BookOpen className="w-4 h-4" />
             </div>
             <span className="text-xs text-gray-500">{CREATOR.stats.books} Books</span>
           </div>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-gray-100 mb-4">
          <div className="flex space-x-6">
            {(["videos", "podcasts", "books"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold capitalize transition-colors relative ${
                  activeTab === tab ? "text-teal" : "text-gray-400"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-4">
           {CONTENT.map((item) => (
             <div key={item.id} className="flex gap-3">
               <div className="w-28 h-16 bg-gray-200 rounded-lg relative flex-shrink-0">
                 <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                   {item.duration}
                 </span>
               </div>
               <div className="flex-1">
                 <h3 className="text-sm font-bold text-gray-dark line-clamp-2 mb-1">{item.title}</h3>
                 <div className="text-xs text-gray-400">
                   {item.views} views • {item.date}
                 </div>
               </div>
             </div>
           ))}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
