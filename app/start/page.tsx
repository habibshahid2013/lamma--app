"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Heart, Users, MapPin, Search } from 'lucide-react';
import BottomNav from '@/components/ui/BottomNav';

export default function StartPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-40 bg-teal text-white px-4 py-6 shadow-md rounded-b-[2rem]">
        <div className="flex items-center mb-4">
           <button onClick={() => router.back()} className="mr-3 hover:bg-white/20 p-1 rounded-full">
            <ArrowLeft className="w-6 h-6" />
           </button>
           <h1 className="font-bold text-xl">New Muslim Guide</h1>
        </div>
        <p className="opacity-90 leading-relaxed text-sm max-w-xs">
          Welcome to the family! Here are some curated steps to help you begin your journey with confidence.
        </p>
      </header>

      <main className="px-4 py-8 space-y-6">
        
        {/* Step 1: Learn to Pray */}
        <section>
          <div className="flex items-center mb-3">
             <span className="bg-teal text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-2">1</span>
             <h2 className="font-bold text-lg text-gray-dark">The Foundation</h2>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-teal/30 transition-all group" onClick={() => router.push('/search?q=prayer')}>
             <div className="flex justify-between items-center mb-2">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                    <Heart className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-teal bg-teal/10 px-2 py-1 rounded">Essential</span>
             </div>
             <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal transition-colors">How to Pray (Salah)</h3>
             <p className="text-gray-500 text-sm mt-1 mb-3">
                 Step-by-step guides for purification and the five daily prayers.
             </p>
             <span className="text-teal font-medium text-sm flex items-center">
                 Find Guides <Search className="w-4 h-4 ml-1" />
             </span>
          </div>
        </section>

        {/* Step 2: Understand the Quran */}
        <section>
          <div className="flex items-center mb-3">
             <span className="bg-teal text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-2">2</span>
             <h2 className="font-bold text-lg text-gray-dark">Divine Guidance</h2>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-teal/30 transition-all group" onClick={() => router.push('/search?q=quran english')}>
             <div className="flex justify-between items-center mb-2">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                    <BookOpen className="w-6 h-6" />
                </div>
             </div>
             <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal transition-colors">Read the Quran</h3>
             <p className="text-gray-500 text-sm mt-1 mb-3">
                 Clear English translations and Tafsir (explanations) for beginners.
             </p>
             <span className="text-teal font-medium text-sm flex items-center">
                 Start Reading <Search className="w-4 h-4 ml-1" />
             </span>
          </div>
        </section>

        {/* Step 3: Find Community */}
        <section>
          <div className="flex items-center mb-3">
             <span className="bg-teal text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-2">3</span>
             <h2 className="font-bold text-lg text-gray-dark">Connect</h2>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-teal/30 transition-all group" onClick={() => router.push('/search?q=community')}>
             <div className="flex justify-between items-center mb-2">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Users className="w-6 h-6" />
                </div>
             </div>
             <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal transition-colors">Find a Mentor</h3>
             <p className="text-gray-500 text-sm mt-1 mb-3">
                 Connect with local mosques and welcoming communities near you.
             </p>
             <span className="text-teal font-medium text-sm flex items-center">
                 Search Nearby <MapPin className="w-4 h-4 ml-1" />
             </span>
          </div>
        </section>

         {/* Note */}
         <div className="bg-teal/5 border border-teal/20 rounded-xl p-4 text-center mt-6">
            <p className="text-teal-deep text-sm">
                "Take it one step at a time. This is a journey of a lifetime."
            </p>
         </div>

      </main>

      <BottomNav />
    </div>
  );
}
