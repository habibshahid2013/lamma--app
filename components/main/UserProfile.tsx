"use client";

import { useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Settings, Calendar, Shield, Crown, ChevronRight, Bookmark, Heart, Grid } from "lucide-react";
import Button from "../ui/LegacyButton"; // Using LegacyButton as Button for consistency with previous file
import BottomNav from "../ui/BottomNav";
import CreatorCard from "../ui/CreatorCard";
import { useCreatorsByIds } from "@/src/hooks/useCreators";
import { useFollow } from "@/src/hooks/useFollow";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 p-4 shadow-sm">
        <h1 className="font-bold text-xl text-gray-dark text-center">My Profile</h1>
      </header>

      <main className="flex-1 px-4 py-8">
        {/* User Stats Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 flex items-center space-x-4">
          <div className="w-20 h-20 bg-teal-light rounded-full flex items-center justify-center flex-shrink-0">
            {userData.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.displayName} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
                <UserIcon className="w-8 h-8 text-teal" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-dark truncate">{userData.displayName}</h2>
            <p className="text-gray-500 text-sm truncate mb-1">{userData.email}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
               <span>
                 Member since {userData.createdAt?.seconds 
                   ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() 
                   : '2025'}
               </span>
            </div>
            {userData.role === 'admin' && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                Admin
              </span>
            )}
             {userData.role === 'creator' && (
              <span className="inline-block mt-2 ml-2 px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                Creator
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 overflow-x-auto pb-2 mb-6 border-b border-gray-100 no-scrollbar">
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
                 <div className="flex justify-center py-10"><div className="animate-spin h-6 w-6 border-2 border-teal border-t-transparent rounded-full"></div></div>
              ) : followingList.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 place-items-center">
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
                  icon={<Heart className="w-12 h-12 text-gray-300" />}
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
                 <div className="flex justify-center py-10"><div className="animate-spin h-6 w-6 border-2 border-teal border-t-transparent rounded-full"></div></div>
              ) : savedList.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 place-items-center">
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
                  icon={<Bookmark className="w-12 h-12 text-gray-300" />}
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
              <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-50">
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
              </div>

              {/* Admin Dashboard Button - Only for admins */}
              {isAdmin && (
                <Button 
                  variant="primary" 
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl py-3"
                  onClick={() => router.push('/admin')}
                  icon={<Crown className="w-4 h-4 ml-2" />}
                >
                  Admin Dashboard
                </Button>
              )}
              
              {/* Creator Dashboard Button - Only for creators */}
              {(userData.role === 'creator' || isAdmin) && (
                <Button 
                  variant="primary" 
                  className="w-full bg-teal text-white rounded-xl py-3"
                  onClick={() => router.push('/creator-dashboard')}
                  icon={<Grid className="w-4 h-4 ml-2" />}
                >
                  Creator Dashboard
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl py-3"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function TabButton({ active, onClick, label, icon, count }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode, count?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-2 pb-2 whitespace-nowrap transition-colors relative ${
        active ? 'text-teal font-bold' : 'text-gray-400 font-medium hover:text-gray-600'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-teal/10 text-teal' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      )}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal rounded-full" />
      )}
    </button>
  );
}

function SettingsItem({ icon, bg, label }: { icon: React.ReactNode, bg: string, label: string }) {
  return (
    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
         <div className={`${bg} p-2 rounded-lg`}>
            {icon}
         </div>
         <span className="font-medium text-gray-700">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300" />
   </div>
  );
}

function EmptyState({ icon, title, description, actionLabel, onAction }: { icon: React.ReactNode, title: string, description: string, actionLabel: string, onAction: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-gray-200">
      <div className="bg-gray-50 p-4 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-gray-dark font-bold mb-1">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-xs">{description}</p>
      <Button 
        onClick={onAction}
        className="bg-teal text-white px-6 rounded-full"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
