"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, MapPin, Globe, BookOpen, Star, Check } from "lucide-react";
import { CATEGORIES } from "@/lib/data/creators"; // Assuming this is where CATEGORIES is exported, or I'll define a map if not
import Button from "@/components/ui/LegacyButton";
import { useState } from "react";
import ShareModal from "@/components/ui/ShareModal";

import { useCreatorBySlug } from "@/src/hooks/useCreators";
import { useFollow } from "@/src/hooks/useFollow";
import ClaimProfileButton from "@/components/claim/ClaimProfileButton";
import { VideoList } from "@/components/content/VideoList";
import { PodcastList } from "@/components/content/PodcastList";

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"videos" | "podcasts" | "books">("videos");
  const { isFollowing, toggleFollow } = useFollow();
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollow = async () => {
    if (!creator) return;
    setFollowLoading(true);
    try {
      await toggleFollow(creator.creatorId);
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      alert("Please sign in to follow creators.");
    } finally {
      setFollowLoading(false);
    }
  };
  
  // Unwrap params.id safely if it's an array
  const slug = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { creator, loading } = useCreatorBySlug(slug as string);

  if (loading) {
     return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-teal animate-pulse font-medium">Loading gathering...</div>
        </div>
     );
  }

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Creator Not Found</h1>
        <p className="text-muted-foreground mb-4">We couldn't find the scholar you're looking for.</p>
        <Button onClick={() => router.push("/home")}>Return Home</Button>
      </div>
    );
  }

  const isPublicFigure = creator.category === "public_figure";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Image / Pattern */}
      <div className="h-32 bg-teal relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setIsShareOpen(true)}
          className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4 -mt-16 relative z-10">
        <div className="flex flex-col items-center">
          <div className="relative">
             <img
              src={creator.avatar || `https://i.pravatar.cc/150?u=${creator.name}`}
              alt={creator.name}
              className={`w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-gray-200 ${creator.isHistorical ? 'sepia-[.3]' : ''}`}
            />
            {creator.verified && !creator.isHistorical && (
              <div className="absolute bottom-2 right-2 bg-teal text-white p-1.5 rounded-full border-4 border-white">
                <Check className="w-4 h-4" />
              </div>
            )}
             {isPublicFigure && (
                <div className="absolute bottom-2 right-2 bg-gold text-white p-1.5 rounded-full border-4 border-white">
                  <Star className="w-4 h-4 fill-current" />
                </div>
              )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mt-3 text-center">{creator.name}</h1>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 mb-4">
             {creator.countryFlag}
             <span className="capitalize">{creator.category.replace("_", " ")}</span>
             {creator.lifespan && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{creator.lifespan}</span>}
          </div>

          {creator.note && (
             <p className="text-center text-gray-600 max-w-xs text-sm mb-6 italic">
              "{creator.note}"
             </p>
          )}

          <div className="flex gap-3 w-full max-w-xs mb-6">
             <Button 
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex-1 rounded-full py-2.5 ${
                  isFollowing(creator.creatorId) 
                    ? "bg-white text-teal border border-teal hover:bg-gray-50" 
                    : "bg-teal text-white hover:bg-teal-dark"
                }`}
             >
               {followLoading ? "..." : isFollowing(creator.creatorId) ? "Following" : "Follow"}
             </Button>
             <Button variant="outline" className="flex-1 border-teal text-teal hover:bg-teal-light rounded-full py-2.5">
               Message
             </Button>
          </div>
          
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-teal">
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Languages</span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {creator.languages.map(lang => (
                        <span key={lang} className="text-xs bg-gray-50 px-2 py-1 rounded-md text-gray-600">{lang}</span>
                    ))}
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-gold">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Region</span>
                </div>
                <p className="text-sm text-gray-700 font-medium">
                    {creator.region?.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </p>
            </div>
            
          
            <div className="col-span-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                 <div className="flex items-center gap-2 mb-2 text-purple-600">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Topics</span>
                </div>
                <div className="flex flex-wrap gap-2">
                     {creator.topics.map(topic => (
                        <span key={topic} className="text-xs border border-purple-100 text-purple-700 px-2 py-1 rounded-full">{topic}</span>
                    ))}
                </div>
            </div>

            {/* Stats / Socials Placeholder if missing */}
            {(creator.stats || creator.socialLinks) && (
               <div className="col-span-2 bg-gray-50 p-4 rounded-xl flex justify-between items-center text-sm">
                  {creator.stats?.followerCount && (
                     <div className="text-center">
                        <span className="block font-bold text-lg text-gray-900">{creator.stats.followerCount.toLocaleString()}</span>
                        <span className="text-gray-500 text-xs uppercase">Followers</span>
                     </div>
                  )}
                  {creator.socialLinks && (
                     <div className="flex gap-4">
                        {/* Icons would go here, currently handled by ShareModal but good to visualize presence */}
                     </div>
                  )}
               </div>
            )}
          </div>
          
          {/* Claim Profile Section */}
          <div className="w-full max-w-md mt-6 mb-4">
              <ClaimProfileButton 
                  creatorId={creator.creatorId} 
                  creatorName={creator.name} 
                  isOwned={!!creator.uid} 
              />
          </div>

          {/* Content Tabs */}
          <div className="w-full max-w-md mt-6 border-b border-gray-100 mb-4">
              <div className="flex space-x-6 justify-center">
                {(["videos", "podcasts", "books"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-bold capitalize transition-colors relative ${
                      activeTab === tab ? "text-teal" : "text-gray-400"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
          </div>

          {/* Content List */}
          <div className="w-full max-w-md pb-8">
            {activeTab === "videos" ? (
               <VideoList 
                  youtubeUrl={creator.socialLinks?.youtube} 
                  creatorName={creator.name} 
                  maxResults={10} 
               />
            ) : activeTab === "podcasts" ? (
               <PodcastList 
                  podcastUrl={creator.socialLinks?.podcast} 
                  creatorName={creator.name} 
               />
            ) : (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                    <p className="text-gray-500">Coming soon</p>
                </div>
            )}
          </div>
        </div>
      </div>
      
      <ShareModal 
        creator={creator}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
