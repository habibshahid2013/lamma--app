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

  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/") return true;
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-2 safe-bottom z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-16 py-1 relative"
            >
              {active && (
                <div className="absolute -top-2 w-6 h-0.5 bg-teal rounded-full" />
              )}
              <item.icon
                className={`mb-1 transition-all duration-200 ${
                  active ? "w-6 h-6 text-teal" : "w-5 h-5 text-gray-400 stroke-[1.5]"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
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
