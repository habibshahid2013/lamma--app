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
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100/50 px-2 py-1.5 safe-bottom z-50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl relative transition-all duration-300 ${
                active ? 'bg-teal/8' : ''
              }`}
            >
              <div className="relative">
                <item.icon
                  className={`mb-0.5 transition-all duration-300 ${
                    active ? "w-[22px] h-[22px] text-teal" : "w-5 h-5 text-gray-400 stroke-[1.5]"
                  }`}
                />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal rounded-full" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-all duration-300 ${
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
