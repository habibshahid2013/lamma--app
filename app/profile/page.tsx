"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import CreatorProfile from "@/components/main/CreatorProfile";
import UserProfile from "@/components/main/UserProfile";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
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
