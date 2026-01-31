"use client";

import { TreeDeciduous } from "lucide-react";
import Link from "next/link";

interface WelcomeScreenProps {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Illustration Area */}
      <div className="h-[40vh] bg-gradient-to-b from-gold/30 to-gold/10 flex items-center justify-center rounded-b-[40px] mb-8 relative overflow-hidden">
        <TreeDeciduous className="w-32 h-32 text-teal opacity-20" />
      </div>

      <div className="flex-1 px-8 flex flex-col items-center text-center">
        <div className="flex items-center space-x-3 mb-6">
          {/* <TreeDeciduous className="w-10 h-10 text-teal" /> */}
          <img src="/lamma-tree.png" alt="Lamma" className="w-12 h-12 object-contain" />
          <span className="text-3xl font-bold text-teal">LAMMA+</span>
        </div>

        <h2 className="text-3xl font-bold text-gray-dark mb-3">
          Your Gathering Place
        </h2>
        
        <p className="text-gray-500 mb-auto leading-relaxed max-w-xs">
          Discover scholars and educators who inspire your journey
        </p>

        <div className="w-full pb-10 space-y-4">
          <button
            onClick={onNext}
            className="w-full py-4 bg-teal text-white rounded-xl font-bold text-lg shadow-lg hover:bg-teal-deep transition-colors"
          >
            Get Started
          </button>
          
          <Link 
            href="/home" 
            className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-base hover:bg-gray-50 transition-colors text-center block"
          >
            Skip to Browse →
          </Link>
          
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-teal font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
