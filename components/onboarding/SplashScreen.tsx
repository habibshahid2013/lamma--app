"use client";

import { useEffect, useState } from "react";
import LammaLogo from "../LammaLogo";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [showHint, setShowHint] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const hintTimer = setTimeout(() => setShowHint(true), 600);
    const fadeTimer = setTimeout(() => setFadeOut(true), 1200);
    const autoTimer = setTimeout(() => onFinish(), 1500);

    return () => {
      clearTimeout(hintTimer);
      clearTimeout(fadeTimer);
      clearTimeout(autoTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gold via-gold to-gold-dark text-center p-4 cursor-pointer relative overflow-hidden transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      onClick={onFinish}
    >
      {/* Decorative circles */}
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-teal/5 blur-3xl" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[250px] h-[250px] rounded-full bg-teal-deep/5 blur-3xl" />

      <div className="animate-fade-in-up flex flex-col items-center relative z-10">
        <LammaLogo variant="gold-bg" size="xl" showTagline />
      </div>

      <div className="absolute bottom-16 flex flex-col items-center gap-4 z-10">
        <p
          className={`text-teal-deep/50 text-sm font-medium tracking-wide transition-all duration-500 ${
            showHint ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          Tap to continue
        </p>
        <div className="flex space-x-2.5">
          <div className="w-1.5 h-1.5 bg-teal-deep/30 rounded-full animate-pulse"></div>
          <div className="w-1.5 h-1.5 bg-teal-deep/30 rounded-full animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-1.5 h-1.5 bg-teal-deep/30 rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
}
