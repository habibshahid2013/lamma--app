"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Lock, Plus, Star, BadgeCheck, Share2 } from "lucide-react";
import { Button } from "./button";
import { Creator } from "@/lib/types/creator";
import { useRouter } from "next/navigation";
import ShareModal from "./ShareModal";
import { useEngagementContext } from "@/hooks/useEngagement";

interface CreatorCardProps extends Partial<Creator> {
  onFollow?: () => void;
  isFollowing?: boolean;
  showUnlock?: boolean;
  theme?: 'light' | 'dark';
}

export default function CreatorCard(props: CreatorCardProps) {
  const router = useRouter();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { trackAction, trackInteraction } = useEngagementContext();

  const {
    id,
    name,
    category,
    verified,
    avatar,
    isFollowing,
    onFollow,
    showUnlock = false,
    isHistorical,
    lifespan,
    note,
    tier,
    countryFlag,
    topics,
    languages = [],
    trending,
    theme = 'light',
    content,
  } = props;
  
  const isDark = theme === 'dark';
  
  const displayName = name || "Unknown Creator";
  const displayCategory = category ? category.replace("_", " ") : "Creator";
  const youtubeThumbnail = content?.youtube?.thumbnailUrl;
  const initialImage = avatar || youtubeThumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D7377&color=fff`;
  
  const [imgSrc, setImgSrc] = useState(initialImage);

  // Prevent card click when clicking share
  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsShareOpen(true);
  };

  const isPublicFigure = category === "public_figure";

  return (
    <div className={`group relative flex flex-col items-center p-4 rounded-xl border w-44 flex-shrink-0 snap-center transition-all ${
        isDark 
          ? 'bg-slate-800 border-amber-500/30 shadow-lg shadow-black/20 hover:border-amber-500/50' 
          : `bg-white border-gray-100 shadow-sm hover:border-teal/30 ${isHistorical ? 'bg-amber-50/30' : ''}`
    }`}>
      {/* Clickable Area */}
      <div 
        onClick={() => router.push(`/creator/${id}`)}
        className="cursor-pointer w-full flex flex-col items-center"
      >
        <div className={`relative mb-3 p-1 rounded-full ${isDark ? 'bg-amber-500/10' : 'bg-teal-light/50'}`}>
          <img
            src={imgSrc}
            alt={displayName}
            className={`w-16 h-16 rounded-full object-cover bg-gray-200 ${isHistorical ? 'sepia-[.3]' : ''}`}
            onError={() => {
              // Fallback logic
              if (imgSrc === avatar && youtubeThumbnail) {
                setImgSrc(youtubeThumbnail);
              } else if (imgSrc !== `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`) {
                setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`);
              }
            }}
          />
          {verified && !isHistorical && (
            <div className={`absolute bottom-0 right-0 p-1 rounded-full border-2 ${isDark ? 'bg-amber-500 border-slate-900 text-slate-900' : 'bg-teal text-white border-white'}`}>
              <Check className="w-3 h-3" />
            </div>
          )}
          {isPublicFigure && (
            <div className={`absolute bottom-0 right-0 p-1 rounded-full border-2 ${isDark ? 'bg-amber-500 border-slate-900 text-slate-900' : 'bg-gold text-white border-white'}`}>
              <Star className="w-3 h-3 fill-current" />
            </div>
          )}
        </div>

        <h3 className={`font-bold text-sm text-center line-clamp-1 w-full mb-0.5 ${isDark ? 'text-white' : 'text-gray-dark'}`}>
          {displayName}
        </h3>
        
        {isHistorical && lifespan ? (
          <p className="text-[10px] text-gray-400 mb-1 font-mono">{lifespan}</p>
        ) : (
          <p className={`text-xs mb-2 text-center capitalize ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {displayCategory}
          </p>
        )}
        
        {/* Languages (New Feature) */}
        <div className="flex flex-wrap justify-center gap-1 mb-2 px-1">
          {languages?.slice(0, 2).map((lang) => (
            <span key={lang} className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider border ${
                isDark ? 'bg-slate-800 text-gray-400 border-slate-700' : 'bg-gray-50 text-gray-400 border-gray-100'
            }`}>
              {lang.substring(0, 2)}
            </span>
          ))}
          {(languages?.length || 0) > 2 && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md border ${
                isDark ? 'bg-slate-800 text-gray-400 border-slate-700' : 'bg-gray-50 text-gray-400 border-gray-100'
            }`}>
              +{(languages?.length || 0) - 2}
            </span>
          )}
        </div>

        {note && (
          <p className={`text-[10px] text-center line-clamp-2 mb-3 h-8 leading-tight ${isDark ? 'text-amber-500/70' : 'text-teal-deep/70'}`}>
              {note}
          </p>
        )}

        {!note && <div className="mb-3 h-8" />}
      </div>

      <div className="w-full mt-auto relative z-10">
        {showUnlock ? (
          <Button variant="secondary" size="sm" className="w-full text-xs rounded-full h-8">
            <Lock className="w-3 h-3 mr-1" /> Unlock
          </Button>
        ) : (
          <Button
            variant={isFollowing ? "default" : "outline"} // shadcn uses 'default' for primary
            size="sm"
            className={`w-full text-xs rounded-full h-8 ${
              isFollowing 
                ? `${isDark ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' : 'bg-teal hover:bg-teal-dark text-white'}` 
                : `${isDark ? 'border-amber-500/50 text-amber-500 hover:bg-amber-500/10' : 'border-teal text-teal hover:bg-teal-light'}`
            }`}
            onClick={(e) => {
              e.stopPropagation();
              trackInteraction('follow_button_click');
              // Gate follow action - if not subscribed/logged in, show email capture
              const canProceed = trackAction('follow');
              if (canProceed && onFollow) onFollow();
            }}
          >
            {isFollowing ? (
              <span className="flex items-center justify-center">
                Following <Check className="w-3 h-3 ml-1" />
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Follow <Plus className="w-3 h-3 ml-1" />
              </span>
            )}
          </Button>
        )}
      </div>

      <button 
        onClick={handleShare}
        className={`absolute top-2 right-2 p-1.5 backdrop-blur-sm rounded-full transition-colors z-20 ${
            isDark ? 'bg-slate-800/80 text-gray-400 hover:text-amber-500 hover:bg-slate-800' : 'bg-white/80 text-gray-400 hover:text-teal hover:bg-white'
        }`}
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>

      <ShareModal 
        creator={props as Creator}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
