"use client";

import { MapPin, BookOpen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Creator } from "@/lib/types/creator";

export default function HistoricalScholarCard(props: Creator) {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push(`/creator/${props.id}`)}
      className="w-[140px] flex-shrink-0 bg-[#FFFDF5] border border-amber-200 rounded-xl overflow-hidden shadow-sm active:scale-95 transition-transform"
    >
        <div className="h-24 bg-amber-100 relative items-center justify-center flex">
             {/* If no image, show calligraphy placeholder or generic */}
             <span className="text-4xl opacity-50">📜</span>
        </div>
        <div className="p-3">
            <h3 className="font-serif font-bold text-amber-900 text-sm mb-1 line-clamp-1">{props.name}</h3>
            {props.lifespan && (
                <p className="text-[10px] text-amber-700/60 font-medium mb-2">{props.lifespan}</p>
            )}
            
            <div className="flex items-center gap-1 text-[10px] text-amber-800/70 mb-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{props.country}</span>
            </div>
             <div className="flex items-center gap-1 text-[10px] text-amber-800/70">
                <BookOpen className="w-3 h-3" />
                <span className="truncate"> Classical Scholar</span>
            </div>
        </div>
    </div>
  );
}
