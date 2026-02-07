"use client";

import { useState, useEffect } from "react";
import { Bookmark, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEngagementContext } from "@/hooks/useEngagement";

export default function SavedPage() {
  const { user } = useAuth();
  const { trackPageView, state, trackAction } = useEngagementContext();
  const [savedItems, setSavedItems] = useState<any[]>([]);

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  // If user hasn't subscribed or logged in, show CTA
  if (!state.hasSubscribed && !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-6">
            <Bookmark className="h-16 w-16 text-primary" />
          </div>

          <h2 className="text-2xl font-bold mb-3">
            Save Your Favorites
          </h2>

          <p className="text-muted-foreground mb-8 max-w-sm">
            Create a collection of your favorite scholars and content to access anytime.
          </p>

          <Button
            size="lg"
            className="rounded-full px-8 mb-4"
            onClick={() => trackAction('save')}
          >
            Start Saving
          </Button>

          <Link
            href="/auth/signup"
            className="text-sm text-primary font-semibold hover:underline"
          >
            Create an account for full access
          </Link>
        </div>
      </div>
    );
  }

  // Signed in or subscribed - show saved items (empty state for now)
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold mb-8">Saved</h1>

      {savedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="rounded-full bg-muted p-6 mb-6">
            <Heart className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold mb-2">Nothing saved yet</h3>
          <p className="text-muted-foreground max-w-xs mb-6">
            Tap the bookmark icon on any creator profile to save them here.
          </p>
          <Button className="rounded-full" asChild>
            <Link href="/scholars">Explore Scholars</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Saved items would render here */}
        </div>
      )}
    </div>
  );
}
