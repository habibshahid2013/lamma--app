"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { TreeDeciduous, Star, Search, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
            <TreeDeciduous className="w-8 h-8 text-teal" />
            <span className="font-bold text-xl text-teal-deep tracking-tight">LAMMA+</span>
        </div>
        <Link href="/auth/login" className="text-gray-600 font-medium hover:text-teal transition-colors">
            Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20 mt-10">
        
        <div className="mb-8 relative">
           <div className="absolute inset-0 bg-teal/20 blur-3xl rounded-full opacity-50"></div>
           <div className="relative bg-gradient-to-br from-teal-light to-white p-6 rounded-[2rem] border border-teal/10 shadow-xl rotate-3">
              <TreeDeciduous className="w-20 h-20 text-teal-deep" />
           </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-dark mb-4 leading-tight">
          Find Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-emerald-500">
             Spiritual Gathering
          </span>
        </h1>
        
        <p className="text-lg text-gray-500 max-w-md mb-10 leading-relaxed">
          Connect with authentic scholars, discover heart-centered content, and join a community dedicated to growth.
        </p>

        <div className="w-full max-w-sm space-y-4">
          <button 
            onClick={() => router.push('/auth/signup')}
            className="w-full bg-teal text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal/20 hover:bg-teal-deep hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Create Free Account
          </button>
          
          <button 
             onClick={() => router.push('/home')}
             className="w-full bg-gray-50 text-gray-700 py-4 rounded-xl font-bold text-lg border border-gray-100 hover:bg-white hover:border-gray-200 transition-all flex items-center justify-center group"
          >
             Browse As Guest 
             <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 grid grid-cols-3 gap-8">
           <div className="flex flex-col items-center">
              <div className="bg-amber-100 p-3 rounded-full mb-2 text-amber-600">
                 <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Verified</span>
           </div>
           <div className="flex flex-col items-center">
              <div className="bg-rose-100 p-3 rounded-full mb-2 text-rose-500">
                 <Star className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Premium</span>
           </div>
           <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-3 rounded-full mb-2 text-blue-500">
                 <Search className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Curated</span>
           </div>
        </div>

      </main>
      
      <footer className="p-6 text-center text-gray-300 text-sm">
        &copy; {new Date().getFullYear()} Lamma App. All rights reserved.
      </footer>
    </div>
  );
}
