"use client";

import { useEffect, useState } from "react";
import LammaLogo from "../LammaLogo";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const hintTimer = setTimeout(() => setShowHint(true), 800);
    const autoTimer = setTimeout(() => onFinish(), 1500);

    return () => {
      clearTimeout(hintTimer);
      clearTimeout(autoTimer);
    };
  }, [onFinish]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gold text-center p-4 cursor-pointer"
      onClick={onFinish}
    >
      <div className="animate-fade-in-up flex flex-col items-center">
        <LammaLogo variant="gold-bg" size="xl" showTagline />
      </div>

      <div className="absolute bottom-16 flex flex-col items-center gap-3">
        <p
          className={`text-teal-deep/60 text-sm font-medium transition-opacity duration-500 ${
            showHint ? "opacity-100" : "opacity-0"
          }`}
        >
          Tap to continue
        </p>
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-teal/60 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-teal/60 rounded-full animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-teal/60 rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
}
