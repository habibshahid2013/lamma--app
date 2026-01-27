"use client";

import { ArrowLeft, Lock } from "lucide-react";
import BottomNav from "../ui/BottomNav";
import CreatorCard from "../ui/CreatorCard";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { CREATORS } from "@/lib/data/creators";

const FOLLOWING = CREATORS.slice(0, 3);
const SUGGESTED = CREATORS.slice(3, 5);

export default function FollowingList() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-dark" />
        </button>
        <h1 className="font-bold text-xl text-gray-dark">Following</h1>
      </header>

      {/* Status Banner */}
      <div className="bg-teal-light px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-teal-deep font-medium">Following 3/5 creators (Free Plan)</span>
        <Link href="/premium" className="text-teal font-bold hover:underline">
          Upgrade →
        </Link>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          {FOLLOWING.map(creator => (
            <CreatorCard key={creator.id} {...creator} isFollowing={true} />
          ))}
        </div>

        <section>
          <h3 className="font-bold text-gray-dark mb-4">Suggested for you</h3>
           <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {SUGGESTED.map(creator => (
               <CreatorCard key={creator.id} {...creator} />
            ))}
             {/* Locked state example */}
            <CreatorCard
              id="locked"
              name="Exclusive Scholar"
              category="scholar"
              avatar="https://i.pravatar.cc/150?u=locked"
              showUnlock={true}
            />
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
