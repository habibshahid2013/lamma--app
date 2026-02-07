"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CreatorCard from "../ui/CreatorCard";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatorsByIds, useCreators } from "@/hooks/useCreators";
import { useFollow } from "@/hooks/useFollow";
import { Users, Search, Heart } from "lucide-react";

export default function FollowingList() {
  const { userData, loading: authLoading } = useAuth();
  const { isFollowing, toggleFollow } = useFollow();

  // Real Data: Get IDs from user data
  const followingIds = userData?.following || [];

  // Fetch Followed Creators
  const { creators: followingCreators, loading: followingLoading } = useCreatorsByIds(followingIds);

  // Fetch Suggested Creators (Public Figures + not already following)
  const { creators: publicFigures } = useCreators({ category: 'public_figure', limitCount: 10 });
  const suggestedCreators = publicFigures.filter(c => !isFollowing(c.id)).slice(0, 6);

  const isLoading = authLoading || followingLoading;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Following</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Following {followingIds.length} scholar{followingIds.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : followingCreators.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {followingCreators.map(creator => (
            <CreatorCard
              key={creator.id}
              {...creator}
              isFollowing={true}
              onFollow={() => toggleFollow(creator.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 bg-card p-12 text-center mb-12">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">No one followed yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Start following scholars to see them here.</p>
          <Button variant="outline" className="mt-4 rounded-full" asChild>
            <Link href="/scholars">Explore Scholars</Link>
          </Button>
        </div>
      )}

      {/* Suggested Section */}
      {suggestedCreators.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Suggested for You</h2>
              <p className="mt-1 text-sm text-muted-foreground">Discover more scholars</p>
            </div>
            <Button variant="outline" className="rounded-full gap-2" asChild>
              <Link href="/scholars"><Search className="h-4 w-4" />Browse All</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestedCreators.map(creator => (
              <CreatorCard
                key={creator.id}
                {...creator}
                isFollowing={isFollowing(creator.id)}
                onFollow={() => toggleFollow(creator.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
