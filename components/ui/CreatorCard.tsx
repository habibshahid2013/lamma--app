"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Lock, Plus, Star, BadgeCheck, Share2 } from "lucide-react";
import { Button } from "./button";
import { Creator } from "@/lib/types/creator";
import { useRouter } from "next/navigation";
import ShareModal from "./ShareModal";
import ActionGateModal from "@/components/ActionGateModal";
import { useEngagementContext } from "@/hooks/useEngagement";
import { useFollow } from "@/hooks/useFollow";
import { useAuth } from "@/contexts/AuthContext";

interface CreatorCardProps extends Partial<Creator> {
  onFollow?: () => void;
  isFollowing?: boolean;
  showUnlock?: boolean;
  theme?: 'light' | 'dark';
}

export default function CreatorCard(props: CreatorCardProps) {
  const router = useRouter();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { trackAction, trackInteraction } = useEngagementContext();
  const { user } = useAuth();
  const { isFollowing: isFollowingHook, toggleFollow, loading: followLoading } = useFollow();

  const {
    id,
    name,
    category,
    verified,
    avatar,
    isFollowing: isFollowingProp,
    onFollow: onFollowProp,
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
    stats,
  } = props;

  // Use props if provided (from HomeScreen/FollowingList), otherwise use hook directly
  const following = isFollowingProp !== undefined ? isFollowingProp : (id ? isFollowingHook(id) : false);
  const handleFollowAction = async () => {
    if (!user) {
      setShowAuthGate(true);
      return;
    }
    if (onFollowProp) {
      onFollowProp();
    } else if (id) {
      try {
        await toggleFollow(id);
      } catch {
        // Follow limit errors handled silently on card (shown on profile page)
      }
    }
  };
  
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

  const formatFollowers = (count?: number) => {
    if (!count) return null;
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };
  const followerDisplay = formatFollowers(stats?.followerCount);

  return (
    <div className={`group relative flex flex-col items-center p-3 sm:p-4 rounded-xl border w-40 sm:w-44 flex-shrink-0 snap-center transition-all duration-200 hover:-translate-y-1 ${
        isDark
          ? 'bg-navy-card border-gold/30 shadow-sm hover:shadow-lg hover:shadow-black/20 hover:border-gold/50'
          : `bg-white border-gray-light shadow-sm hover:shadow-md hover:border-teal/30 ${isHistorical ? 'bg-gold-light/50' : ''}`
    }`}>
      {/* Clickable Area */}
      <div 
        onClick={() => router.push(`/creator/${id}`)}
        className="cursor-pointer w-full flex flex-col items-center"
      >
        <div className={`relative mb-3 p-1 rounded-full ${isDark ? 'bg-gold/10' : 'bg-teal-light/50'}`}>
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
            <div className={`absolute bottom-0 right-0 p-1 rounded-full border-2 ${isDark ? 'bg-gold border-navy text-navy' : 'bg-teal text-white border-white'}`}>
              <Check className="w-3 h-3" />
            </div>
          )}
          {isPublicFigure && (
            <div className={`absolute bottom-0 right-0 p-1 rounded-full border-2 ${isDark ? 'bg-gold border-navy text-navy' : 'bg-gold text-teal-deep border-white'}`}>
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
          <p className={`text-xs text-center capitalize ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {displayCategory}
          </p>
        )}

        {followerDisplay && (
          <p className={`text-[10px] mb-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
            {followerDisplay} followers
          </p>
        )}
        {!followerDisplay && !isHistorical && <div className="mb-1" />}
        
        {/* Languages (New Feature) */}
        <div className="flex flex-wrap justify-center gap-1 mb-2 px-1">
          {languages?.slice(0, 2).map((lang) => (
            <span key={lang} className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider border ${
                isDark ? 'bg-navy text-white/60 border-navy-border' : 'bg-gray-offwhite text-gray-500 border-gray-light'
            }`}>
              {lang.substring(0, 2)}
            </span>
          ))}
          {(languages?.length || 0) > 2 && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md border ${
                isDark ? 'bg-navy text-white/60 border-navy-border' : 'bg-gray-offwhite text-gray-500 border-gray-light'
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
            variant={following ? "default" : "outline"}
            size="sm"
            disabled={followLoading}
            className={`w-full text-xs rounded-full h-8 active:scale-95 transition-transform ${
              following
                ? `${isDark ? 'bg-gold hover:bg-gold-dark text-navy' : 'bg-gold hover:bg-gold-dark text-gray-dark'}`
                : `${isDark ? 'border-gold/50 text-gold hover:bg-gold/10' : 'border-teal text-teal hover:bg-teal-light'}`
            }`}
            onClick={(e) => {
              e.stopPropagation();
              trackInteraction('follow_button_click');
              const canProceed = trackAction('follow');
              if (canProceed) handleFollowAction();
            }}
          >
            {following ? (
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
        className={`absolute top-2 right-2 p-2 backdrop-blur-sm rounded-full transition-colors z-20 ${
            isDark ? 'bg-navy/80 text-white/60 hover:text-gold hover:bg-navy' : 'bg-white/80 text-gray-500 hover:text-teal hover:bg-white'
        }`}
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>

      <ShareModal
        creator={props as Creator}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <ActionGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        triggerAction="follow"
      />
    </div>
  );
}
