"use client";

import Link from "next/link";
import LammaLogo, { PalmIcon } from "../LammaLogo";

interface WelcomeScreenProps {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Top Illustration Area */}
      <div className="h-[40vh] bg-gradient-to-b from-amber-500/20 to-slate-900 flex items-center justify-center rounded-b-[40px] mb-8 relative overflow-hidden">
        <PalmIcon variant="teal" size={120} className="opacity-30" />
      </div>

      <div className="flex-1 px-8 flex flex-col items-center text-center">
        <LammaLogo variant="dark" size="lg" className="mb-6" />

        <h2 className="text-3xl font-bold text-white mb-3">
          Your Gathering Place
        </h2>
        
        <p className="text-slate-400 mb-auto leading-relaxed max-w-xs">
          Discover scholars and educators who inspire your journey
        </p>

        <div className="w-full pb-10 space-y-4">
          <button
            onClick={onNext}
            className="w-full py-4 bg-amber-500 text-slate-900 rounded-xl font-bold text-lg shadow-lg hover:bg-amber-400 transition-colors"
          >
            Get Started
          </button>
          
          <Link 
            href="/home" 
            className="w-full py-3 border-2 border-slate-700 text-slate-300 rounded-xl font-semibold text-base hover:bg-slate-800 transition-colors text-center block"
          >
            Skip to Browse →
          </Link>
          
          <p className="text-slate-500 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-teal-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
