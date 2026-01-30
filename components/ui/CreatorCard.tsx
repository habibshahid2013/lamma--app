import { useState } from "react";
import Image from "next/image";
import { Check, Lock, Plus, Star, BadgeCheck, Share2 } from "lucide-react";
import { Button } from "./button";
import { Creator } from "@/lib/types/creator";
import { useRouter } from "next/navigation";
import ShareModal from "./ShareModal";
import { useEngagementContext } from "@/src/hooks/useEngagement";

interface CreatorCardProps extends Partial<Creator> {
  onFollow?: () => void;
  isFollowing?: boolean;
  showUnlock?: boolean;
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
    // New props from the instruction's destructuring example, if they were meant to be added
    // For now, only adding the ones that were explicitly in the instruction's destructuring block
    // and merging with existing props.
    // The instruction's destructuring block was:
    // id, name, category, tier, countryFlag, topics, languages, followers, trending, verified, isHistorical
    // I will add the ones that are not already in the original CreatorCardProps destructuring.
    // 'name', 'category', 'verified', 'isHistorical' are already there.
    // So, adding 'id', 'tier', 'countryFlag', 'topics', 'languages', 'followers', 'trending'.
    tier,
    countryFlag,
    topics,
    languages = [], // Default to empty array
    trending,
  } = props;

  // Prevent card click when clicking share
  const handleShare = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsShareOpen(true);
  };

  const displayName = name || "Unknown Creator";
  const displayCategory = category ? category.replace("_", " ") : "Creator";
  const displayAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D7377&color=fff`;

  const isPublicFigure = category === "public_figure";

  return (
    <div className={`relative flex flex-col items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm w-44 flex-shrink-0 snap-center hover:border-teal/30 transition-all ${isHistorical ? 'bg-amber-50/30' : ''}`}>
      {/* Clickable Area */}
      <div 
        onClick={() => router.push(`/creator/${id}`)}
        className="cursor-pointer w-full flex flex-col items-center"
      >
        <div className="relative mb-3 bg-teal-light/50 p-1 rounded-full">
          <img
            src={displayAvatar}
            alt={displayName}
            className={`w-16 h-16 rounded-full object-cover bg-gray-200 ${isHistorical ? 'sepia-[.3]' : ''}`}
            onError={(e) => {
              // Fallback if image fails
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
            }}
          />
          {verified && !isHistorical && (
            <div className="absolute bottom-0 right-0 bg-teal text-white p-1 rounded-full border-2 border-white">
              <Check className="w-3 h-3" />
            </div>
          )}
          {isPublicFigure && (
            <div className="absolute bottom-0 right-0 bg-gold text-white p-1 rounded-full border-2 border-white">
              <Star className="w-3 h-3 fill-current" />
            </div>
          )}
        </div>

        <h3 className="font-bold text-gray-dark text-sm text-center line-clamp-1 w-full mb-0.5">
          {displayName}
        </h3>
        
        {isHistorical && lifespan ? (
          <p className="text-[10px] text-gray-400 mb-1 font-mono">{lifespan}</p>
        ) : (
          <p className="text-xs text-gray-500 mb-2 text-center capitalize">
              {displayCategory}
          </p>
        )}
        
        {/* Languages (New Feature) */}
        <div className="flex flex-wrap justify-center gap-1 mb-2 px-1">
          {languages?.slice(0, 2).map((lang) => (
            <span key={lang} className="text-[9px] px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-md uppercase tracking-wider border border-gray-100">
              {lang.substring(0, 2)}
            </span>
          ))}
          {(languages?.length || 0) > 2 && (
            <span className="text-[9px] px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-md border border-gray-100">
              +{(languages?.length || 0) - 2}
            </span>
          )}
        </div>

        {note && (
          <p className="text-[10px] text-teal-deep/70 text-center line-clamp-2 mb-3 h-8 leading-tight">
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
              isFollowing ? "bg-teal hover:bg-teal-dark text-white" : "border-teal text-teal hover:bg-teal-light"
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
        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-teal hover:bg-white transition-colors opacity-0 group-hover:opacity-100 z-20"
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
