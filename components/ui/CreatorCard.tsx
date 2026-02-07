"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Globe,
  Star,
  TrendingUp,
  Clock,
  Users,
  Plus,
  Check,
  Youtube,
  Podcast,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Creator } from "@/lib/types/creator";
import ShareModal from "./ShareModal";
import ActionGateModal from "@/components/ActionGateModal";
import { useEngagementContext } from "@/hooks/useEngagement";
import { useFollow } from "@/hooks/useFollow";
import { useAuth } from "@/contexts/AuthContext";

interface CreatorCardProps extends Partial<Creator> {
  onFollow?: () => void;
  isFollowing?: boolean;
  showUnlock?: boolean;
  theme?: "light" | "dark";
}

function formatFollowers(count?: number): string | null {
  if (!count) return null;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return count.toString();
}

const categoryColorMap: Record<string, string> = {
  scholar: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  speaker: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  educator: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  reciter: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  author: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  activist: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  influencer: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  public_figure: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  youth_leader: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  podcaster: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function CreatorCard(props: CreatorCardProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { trackAction, trackInteraction } = useEngagementContext();
  const { user } = useAuth();
  const {
    isFollowing: isFollowingHook,
    toggleFollow,
    loading: followLoading,
  } = useFollow();

  const {
    id,
    name,
    slug,
    category,
    verified,
    avatar,
    isFollowing: isFollowingProp,
    onFollow: onFollowProp,
    isHistorical,
    countryFlag,
    country,
    location,
    topics = [],
    languages = [],
    trending,
    featured,
    content,
    stats,
    profile,
  } = props;

  // Use props if provided (from HomeScreen/FollowingList), otherwise use hook directly
  const following =
    isFollowingProp !== undefined
      ? isFollowingProp
      : id
        ? isFollowingHook(id)
        : false;

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

  const displayName = profile?.displayName || name || "Unknown Creator";
  const displayCategory = category ? category.replace("_", " ") : "Creator";
  const shortBio = profile?.shortBio || profile?.bio || "";
  const followerDisplay = formatFollowers(stats?.followerCount);
  const linkSlug = slug || id;

  // Avatar fallback chain: avatar prop -> profile.avatar -> youtube thumbnail -> generated
  const youtubeThumbnail = content?.youtube?.thumbnailUrl;
  const resolvedAvatar =
    avatar ||
    profile?.avatar ||
    youtubeThumbnail ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D7377&color=fff`;

  return (
    <>
      <Link href={`/creator/${linkSlug}`} className="block cursor-pointer">
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Card
            className={cn(
              "group relative overflow-hidden border-border/60 bg-card transition-all duration-300",
              "hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
            )}
          >
          {/* Top gradient accent bar */}
          <div
            className={cn(
              "h-2 w-full",
              isHistorical
                ? "bg-gradient-to-r from-muted-foreground/40 to-muted-foreground/20"
                : "bg-gradient-to-r from-primary via-primary/80 to-gold"
            )}
          />

          <CardContent className="p-5">
            {/* Follow button - top-right */}
            <div className="absolute right-4 top-8 z-10">
              <Button
                variant={following ? "default" : "outline"}
                size="xs"
                disabled={followLoading}
                className={cn(
                  "rounded-full font-semibold transition-all duration-200 active:scale-95",
                  following
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60"
                )}
                aria-label={following ? `Unfollow ${displayName}` : `Follow ${displayName}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  trackInteraction("follow_button_click");
                  const canProceed = trackAction("follow");
                  if (canProceed) handleFollowAction();
                }}
              >
                {following ? (
                  <span className="flex items-center gap-0.5">
                    <Check className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <Plus className="h-3 w-3" />
                  </span>
                )}
              </Button>
            </div>

            <div className="flex gap-4">
              {/* Avatar */}
              <Avatar
                className={cn(
                  "h-16 w-16 rounded-xl ring-2 ring-border",
                  isHistorical && "sepia-[.3]"
                )}
              >
                <AvatarImage
                  src={resolvedAvatar}
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-gold text-lg font-bold text-primary-foreground">
                  {(name || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 pr-12">
                {/* Name & Verification */}
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-base font-semibold transition-colors group-hover:text-primary">
                    {displayName}
                  </h3>
                  {verified && !isHistorical && (
                    <CheckCircle className="h-4 w-4 shrink-0 fill-primary text-primary-foreground" />
                  )}
                </div>

                {/* Category & Location */}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] font-medium capitalize",
                      category && categoryColorMap[category]
                    )}
                  >
                    {displayCategory}
                  </Badge>
                  {country && (
                    <span className="flex items-center gap-0.5">
                      {countryFlag && <span>{countryFlag}</span>}
                      {location || country}
                    </span>
                  )}
                </div>

                {/* Bio */}
                {shortBio && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {shortBio}
                  </p>
                )}
              </div>
            </div>

            {/* Topics */}
            {topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topics.slice(0, 3).map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="text-[11px] font-normal"
                  >
                    {topic}
                  </Badge>
                ))}
                {topics.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-normal"
                  >
                    +{topics.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Content Type Indicators */}
            {(content?.youtube || content?.podcast || (content?.books?.length || 0) > 0 || (content?.courses?.length || 0) > 0) && (
              <div className="mt-2 flex items-center gap-2">
                {content?.youtube && (
                  <Youtube className="h-3.5 w-3.5 text-red-500" aria-label="YouTube" />
                )}
                {content?.podcast && (
                  <Podcast className="h-3.5 w-3.5 text-purple-500" aria-label="Podcast" />
                )}
                {(content?.books?.length || 0) > 0 && (
                  <BookOpen className="h-3.5 w-3.5 text-amber-600" aria-label="Books" />
                )}
                {(content?.courses?.length || 0) > 0 && (
                  <GraduationCap className="h-3.5 w-3.5 text-blue-500" aria-label="Courses" />
                )}
              </div>
            )}

            {/* Bottom Stats & Badges */}
            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {followerDisplay && (
                  <span className="flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted/50">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">{followerDisplay}</span>
                  </span>
                )}
                {languages.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {languages.slice(0, 2).join(", ")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {featured && (
                  <Badge className="border-0 bg-gold/20 text-[10px] text-gold-deep dark:text-gold">
                    <Star className="mr-0.5 h-2.5 w-2.5 fill-current" />
                    Featured
                  </Badge>
                )}
                {trending && (
                  <Badge className="border-0 bg-destructive/10 text-[10px] text-destructive">
                    <TrendingUp className="mr-0.5 h-2.5 w-2.5" />
                    Trending
                  </Badge>
                )}
                {isHistorical && (
                  <Badge variant="secondary" className="text-[10px]">
                    <Clock className="mr-0.5 h-2.5 w-2.5" />
                    Historical
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </Link>

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
    </>
  );
}
