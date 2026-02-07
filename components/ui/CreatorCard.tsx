"use client";

import { useState } from "react";
import { Check, Lock, Plus, Star, Share2 } from "lucide-react";
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
    <div className={`group relative flex flex-col items-center p-3.5 sm:p-4 rounded-2xl border w-[168px] sm:w-48 flex-shrink-0 snap-center transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700/50 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-gold/30'
          : `bg-white border-gray-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_-8px_rgba(13,115,119,0.15)] hover:-translate-y-1.5 ${isHistorical ? 'bg-gradient-to-b from-amber-50/50 to-white' : ''}`
    }`}>
      {/* Trending indicator */}
      {trending && (
        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider z-10 ${
          isDark ? 'bg-gold text-gray-dark' : 'bg-gradient-to-r from-teal to-teal-deep text-white'
        }`}>
          Trending
        </div>
      )}

      {/* Share button */}
      <button
        onClick={handleShare}
        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 ${
            isDark ? 'bg-slate-700/80 text-white/60 hover:text-gold hover:bg-slate-600' : 'bg-gray-100/80 text-gray-400 hover:text-teal hover:bg-white'
        }`}
      >
        <Share2 className="w-3 h-3" />
      </button>

      {/* Clickable Area */}
      <div
        onClick={() => router.push(`/creator/${id}`)}
        className="cursor-pointer w-full flex flex-col items-center"
      >
        {/* Avatar with ring */}
        <div className={`relative mb-3 rounded-full ${
          isDark
            ? 'p-[2px] bg-gradient-to-br from-gold/60 to-teal/60'
            : `p-[2px] ${isHistorical ? 'bg-gradient-to-br from-amber-300/60 to-slate-400/60' : 'bg-gradient-to-br from-teal/40 to-gold/40'}`
        }`}>
          <div className="rounded-full p-0.5 bg-white dark:bg-slate-900">
            <img
              src={imgSrc}
              alt={displayName}
              className={`w-[72px] h-[72px] rounded-full object-cover bg-gray-200 ${isHistorical ? 'sepia-[.3]' : ''}`}
              onError={() => {
                if (imgSrc === avatar && youtubeThumbnail) {
                  setImgSrc(youtubeThumbnail);
                } else if (imgSrc !== `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`) {
                  setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`);
                }
              }}
            />
          </div>
          {verified && !isHistorical && (
            <div className={`absolute bottom-0 right-0 p-1 rounded-full border-2 ${isDark ? 'bg-gold border-slate-900 text-slate-900' : 'bg-teal text-white border-white'}`}>
              <Check className="w-3 h-3" />
            </div>
          )}
          {isPublicFigure && (
            <div className={`absolute bottom-0 right-0 p-1 rounded-full border-2 ${isDark ? 'bg-gold border-slate-900 text-slate-900' : 'bg-gold text-teal-deep border-white'}`}>
              <Star className="w-3 h-3 fill-current" />
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className={`font-bold text-sm text-center line-clamp-1 w-full mb-0.5 ${isDark ? 'text-white' : 'text-gray-dark'}`}>
          {displayName}
        </h3>

        {/* Category / Lifespan */}
        {isHistorical && lifespan ? (
          <p className="text-[10px] text-gray-400 mb-1 font-mono">{lifespan}</p>
        ) : (
          <p className={`text-xs text-center capitalize ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
              {displayCategory}
          </p>
        )}

        {/* Follower count */}
        {followerDisplay && (
          <p className={`text-[10px] font-medium mb-1.5 ${isDark ? 'text-gold/60' : 'text-teal/60'}`}>
            {followerDisplay} followers
          </p>
        )}
        {!followerDisplay && !isHistorical && <div className="mb-1.5" />}

        {/* Languages */}
        <div className="flex flex-wrap justify-center gap-1 mb-2.5 px-1">
          {languages?.slice(0, 2).map((lang) => (
            <span key={lang} className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-medium ${
                isDark ? 'bg-slate-700/80 text-slate-300 border border-slate-600/50' : 'bg-gray-50 text-gray-500 border border-gray-200/80'
            }`}>
              {lang.substring(0, 2)}
            </span>
          ))}
          {(languages?.length || 0) > 2 && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${
                isDark ? 'bg-slate-700/80 text-slate-300 border border-slate-600/50' : 'bg-gray-50 text-gray-500 border border-gray-200/80'
            }`}>
              +{(languages?.length || 0) - 2}
            </span>
          )}
        </div>

        {/* Note */}
        {note && (
          <p className={`text-[10px] text-center line-clamp-2 mb-3 h-8 leading-tight ${isDark ? 'text-amber-500/60' : 'text-teal-deep/60'}`}>
              {note}
          </p>
        )}
        {!note && <div className="mb-3 h-8" />}
      </div>

      {/* Follow Button */}
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
            className={`w-full text-xs rounded-full h-9 font-semibold active:scale-95 transition-all duration-200 ${
              following
                ? `${isDark ? 'bg-gold hover:bg-gold-dark text-gray-dark shadow-sm shadow-gold/20' : 'bg-gradient-to-r from-gold to-gold-dark text-gray-dark shadow-sm shadow-gold/20'}`
                : `${isDark ? 'border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60' : 'border-teal/40 text-teal hover:bg-teal/5 hover:border-teal/60'}`
            }`}
            onClick={(e) => {
              e.stopPropagation();
              trackInteraction('follow_button_click');
              const canProceed = trackAction('follow');
              if (canProceed) handleFollowAction();
            }}
          >
            {following ? (
              <span className="flex items-center justify-center gap-1">
                Following <Check className="w-3 h-3" />
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1">
                Follow <Plus className="w-3 h-3" />
              </span>
            )}
          </Button>
        )}
      </div>

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
