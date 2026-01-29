"use client";

import { useEffect } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import CreatorProfile from "@/components/main/CreatorProfile";
import UserProfile from "@/components/main/UserProfile";

export default function ProfilePage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
      </div>
    );
  }

  if (!user) return null; // Redirecting

  // If user is a creator, show CreatorProfile (eventually this should be dynamic)
  // For now, if they have the role 'creator', we might show the Creator Dashboard link or their public profile
  // But per request "Sign Out" is priority, so let's stick to UserProfile which handles general account stuff
  // and maybe link to their creator page if they are one.
  // Actually, let's keep it simple: Everyone sees UserProfile which has "Sign Out".
  
  return <UserProfile />;
}
