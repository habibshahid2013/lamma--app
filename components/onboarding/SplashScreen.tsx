"use client";

import { useEffect, useState } from "react";
import { TreeDeciduous } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gold text-center p-4">
      <div className="animate-fade-in-up flex flex-col items-center">
        <TreeDeciduous className="w-32 h-32 text-teal mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-teal tracking-tight mb-2">LAMMA+</h1>
        <p className="text-teal-deep text-lg font-medium">Gather in Faith</p>
      </div>
      
      <div className="absolute bottom-16 flex space-x-2">
        <div className="w-3 h-3 bg-teal rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-teal rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-teal rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
