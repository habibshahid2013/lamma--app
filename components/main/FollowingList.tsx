"use client";

import { ArrowLeft } from "lucide-react";
import BottomNav from "../ui/BottomNav";
import CreatorCard from "../ui/CreatorCard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatorsByIds, useCreators } from "@/hooks/useCreators";
import { useFollow } from "@/hooks/useFollow";

export default function FollowingList() {
  const router = useRouter();
  const { userData, loading: authLoading } = useAuth();
  const { isFollowing, toggleFollow } = useFollow();
  
  // Real Data: Get IDs from user data
  const followingIds = userData?.following || [];
  
  // Fetch Followed Creators
  const { creators: followingCreators, loading: followingLoading } = useCreatorsByIds(followingIds);
  
  // Fetch Suggested Creators (Public Figures + not already following)
  const { creators: publicFigures } = useCreators({ category: 'public_figure', limitCount: 10 });
  const suggestedCreators = publicFigures.filter(c => !isFollowing(c.id)).slice(0, 5);

  const isLoading = authLoading || followingLoading;

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
        <span className="text-teal-deep font-medium">
          Following {followingIds.length} {userData?.subscription.plan === 'free' ? '/ 5' : ''} creators
          {userData?.subscription.plan === 'free' && ' (Free Plan)'}
        </span>
        {userData?.subscription.plan === 'free' && (
          <Link href="/premium" className="text-teal font-bold hover:underline">
            Upgrade →
          </Link>
        )}
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        {isLoading ? (
           <div className="grid grid-cols-2 gap-4 mb-8">
             {[1, 2].map(i => (
               <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
             ))}
           </div>
        ) : followingCreators.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {followingCreators.map(creator => (
              <CreatorCard 
                key={creator.id} 
                {...creator} 
                isFollowing={true} // explicit since we are in following list
                onFollow={() => toggleFollow(creator.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm mb-8">
            You are not following anyone yet.
          </div>
        )}

        <section>
          <h3 className="font-bold text-gray-dark mb-4">Suggested for you</h3>
           <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {suggestedCreators.map(creator => (
               <CreatorCard 
                 key={creator.id} 
                 {...creator} 
                 isFollowing={isFollowing(creator.id)}
                 onFollow={() => toggleFollow(creator.id)}
               />
            ))}
             {/* Locked state example */}
            <CreatorCard
              id="locked"
              name="Exclusive Scholar"
              category="scholar"
              avatar="https://ui-avatars.com/api/?name=Exclusive+Scholar&background=0D7377&color=fff"
              showUnlock={true}
            />
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
