"use client";

import { useState, useEffect } from "react";
import { Bookmark, Heart, Plus } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
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
      <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm">
          <h1 className="font-bold text-lg text-gray-900">Saved</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="bg-teal/10 p-6 rounded-full mb-6">
            <Bookmark className="w-16 h-16 text-teal" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Save Your Favorites
          </h2>
          
          <p className="text-gray-500 mb-8 max-w-sm">
            Create a collection of your favorite scholars and content to access anytime.
          </p>

          <button
            onClick={() => trackAction('save')}
            className="w-full max-w-xs py-4 bg-teal text-white rounded-xl font-bold text-lg shadow-lg hover:bg-teal-deep transition-colors mb-4"
          >
            Start Saving
          </button>

          <Link 
            href="/auth/signup"
            className="text-teal font-semibold hover:underline"
          >
            Create an account for full access
          </Link>
        </main>

        <BottomNav />
      </div>
    );
  }

  // Signed in or subscribed - show saved items (empty state for now)
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm">
        <h1 className="font-bold text-lg text-gray-900">Saved</h1>
      </header>

      <main className="flex-1 p-4">
        {savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="bg-gray-100 p-6 rounded-full mb-6">
              <Heart className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Nothing saved yet</h3>
            <p className="text-gray-500 max-w-xs mb-6">
              Tap the bookmark icon on any creator profile to save them here.
            </p>
            <Link 
              href="/home"
              className="bg-teal text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-deep transition-colors"
            >
              Explore Scholars
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Saved items would render here */}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
