"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Settings, Calendar, Shield, Crown, ChevronRight, Bookmark, Heart, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import CreatorCard from "../ui/CreatorCard";
import { useCreatorsByIds } from "@/hooks/useCreators";
import { useFollow } from "@/hooks/useFollow";

export default function UserProfile() {
  const { userData, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'following' | 'saved' | 'settings'>('following');

  // Use hooks to get toggle functions for the cards
  const { toggleFollow } = useFollow();
  // We'll need useSaved for the saved tab items eventually

  const { creators: followingList, loading: followingLoading } = useCreatorsByIds(userData?.following || []);
  // Assuming 'saved' currently contains creator IDs for the MVP
  const { creators: savedList, loading: savedLoading } = useCreatorsByIds(userData?.saved || []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  const isAdmin = userData?.role === 'admin';

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* User Stats Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                {userData.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt={userData.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                    <UserIcon className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground truncate">{userData.displayName}</h2>
                <p className="text-muted-foreground text-sm truncate mb-1">{userData.email}</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                   <span>
                     Member since {userData.createdAt?.seconds
                       ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString()
                       : '2025'}
                   </span>
                </div>
                {userData.role === 'admin' && (
                  <Badge className="mt-2 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                    Admin
                  </Badge>
                )}
                 {userData.role === 'creator' && (
                  <Badge className="mt-2 ml-2 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                    Creator
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-6 overflow-x-auto pb-2 mb-6 border-b border-border/50 no-scrollbar">
          <TabButton
            active={activeTab === 'following'}
            onClick={() => setActiveTab('following')}
            label="Following"
            icon={<Heart className="w-4 h-4" />}
            count={userData.followingCount}
          />
          <TabButton
            active={activeTab === 'saved'}
            onClick={() => setActiveTab('saved')}
            label="Saved"
            icon={<Bookmark className="w-4 h-4" />}
            count={userData.saved?.length || 0}
          />
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            label="Settings"
            icon={<Settings className="w-4 h-4" />}
          />
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'following' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {followingLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-xl" />
                  ))}
                </div>
              ) : followingList.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {followingList.map(creator => (
                    <CreatorCard
                      key={creator.id}
                      {...creator}
                      isFollowing={true}
                      onFollow={() => toggleFollow(creator.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Heart className="w-12 h-12 text-muted-foreground/30" />}
                  title="No followers yet"
                  description="Follow scholars to see them here and get updates."
                  actionLabel="Discover Scholars"
                  onAction={() => router.push('/home')}
                />
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               {savedLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-xl" />
                  ))}
                </div>
              ) : savedList.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {savedList.map(creator => (
                    // Reusing CreatorCard for saved creators.
                    // If saving content (videos), we'd need a different card here.
                    <CreatorCard
                      key={creator.id}
                      {...creator}
                      // For saved tab, we might want to show if we follow them too?
                      // The card handles its own 'follow' state check internally if passed or we can verify.
                      // But for now, let's just show standard card.
                      isFollowing={userData.following.includes(creator.id!)}
                      onFollow={() => toggleFollow(creator.id!)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Bookmark className="w-12 h-12 text-muted-foreground/30" />}
                  title="Nothing saved"
                  description="Save scholars to quickly access them later."
                  actionLabel="Start Exploring"
                  onAction={() => router.push('/home')}
                />
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0 divide-y divide-border/50">
                   <SettingsItem
                      icon={<Settings className="w-5 h-5 text-orange-600" />}
                      bg="bg-orange-100"
                      label="Account Settings"
                   />
                   <SettingsItem
                      icon={<Shield className="w-5 h-5 text-blue-600" />}
                      bg="bg-blue-100"
                      label="Privacy & Security"
                   />
                   <SettingsItem
                      icon={<Calendar className="w-5 h-5 text-purple-600" />}
                      bg="bg-purple-100"
                      label={`Subscription: ${userData.subscription?.plan === 'premium' ? 'Premium' : 'Free'}`}
                   />
                </CardContent>
              </Card>

              {/* Admin Dashboard Button - Only for admins */}
              {isAdmin && (
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl py-3"
                  onClick={() => router.push('/admin')}
                >
                  Admin Dashboard
                  <Crown className="w-4 h-4 ml-2" />
                </Button>
              )}

              {/* Creator Dashboard Button - Only for creators */}
              {(userData.role === 'creator' || isAdmin) && (
                <Button
                  className="w-full rounded-xl py-3"
                  onClick={() => router.push('/creator-dashboard')}
                >
                  Creator Dashboard
                  <Grid className="w-4 h-4 ml-2" />
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function TabButton({ active, onClick, label, icon, count }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode, count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 pb-2 whitespace-nowrap transition-colors relative ${
        active ? 'text-primary font-bold' : 'text-muted-foreground font-medium hover:text-foreground'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
          {count}
        </span>
      )}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
      )}
    </button>
  );
}

function SettingsItem({ icon, bg, label }: { icon: React.ReactNode, bg: string, label: string }) {
  return (
    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted transition-colors">
      <div className="flex items-center space-x-3">
         <div className={`${bg} p-2 rounded-lg`}>
            {icon}
         </div>
         <span className="font-medium text-foreground">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
   </div>
  );
}

function EmptyState({ icon, title, description, actionLabel, onAction }: { icon: React.ReactNode, title: string, description: string, actionLabel: string, onAction: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card rounded-xl border border-dashed border-border">
      <div className="bg-muted p-4 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-foreground font-bold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">{description}</p>
      <Button
        onClick={onAction}
        className="rounded-full"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
