"use client";

import { Home, Search, Bookmark, Users, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", icon: Home, href: "/home" },
    { label: "Search", icon: Search, href: "/search" },
    { label: "Saved", icon: Bookmark, href: "/saved" },
    { label: "Following", icon: Users, href: "/following" },
    { label: "Profile", icon: User, href: "/profile" },
  ];

  // Helper to determine if active (simple approach)
  // For standard flows, simple equality check or includes
  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/") return true; // Handle root as home for now if needed, but we likely redirect
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 safe-bottom z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-16 py-1"
            >
              <item.icon
                className={`w-6 h-6 mb-1 ${
                  active ? "text-teal fill-current" : "text-gray-400 stroke-[1.5]"
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-teal" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
