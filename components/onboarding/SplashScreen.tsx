"use client";

import { useEffect } from "react";
import LammaLogo from "../LammaLogo";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-400 text-center p-4">
      <div className="animate-fade-in-up flex flex-col items-center">
        <LammaLogo variant="gold-bg" size="xl" showTagline />
      </div>
      
      <div className="absolute bottom-16 flex space-x-2">
        <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
