"use client";

import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Settings, Calendar, Shield, Crown } from "lucide-react";
import Button from "../ui/LegacyButton";
import BottomNav from "../ui/BottomNav";

export default function UserProfile() {
  const { userData, logout } = useAuth();
  const router = useRouter();

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
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-teal-light rounded-full flex items-center justify-center mb-4">
            {userData.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.displayName} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
                <UserIcon className="w-10 h-10 text-teal" />
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-dark">{userData.displayName}</h2>
          <p className="text-gray-500 text-sm mb-4">{userData.email}</p>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-semibold uppercase tracking-wide">
             {userData.role}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                   <div className="bg-orange-100 p-2 rounded-lg">
                      <Settings className="w-5 h-5 text-orange-600" />
                   </div>
                   <span className="font-medium text-gray-700">Account Settings</span>
                </div>
             </div>
             <div className="p-4 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                   <div className="bg-blue-100 p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                   </div>
                   <span className="font-medium text-gray-700">Privacy & Security</span>
                </div>
             </div>
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                   <div className="bg-purple-100 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                   </div>
                   <span className="font-medium text-gray-700">Subscription: {userData.subscription?.plan === 'premium' ? 'Premium' : 'Free'}</span>
                </div>
             </div>
          </div>

          {/* Admin Dashboard Button - Only for admins */}
          {isAdmin && (
            <Button 
              variant="primary" 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              onClick={() => router.push('/admin')}
              icon={<Crown className="w-4 h-4" />}
            >
              Admin Dashboard
            </Button>
          )}

          <Button 
            variant="outline" 
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            onClick={handleLogout}
            icon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
