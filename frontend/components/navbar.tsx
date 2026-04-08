"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  RotateCcw,
  BookOpen,
  BarChart3,
  Trophy,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add", label: "Add Word", icon: PlusCircle },
  { href: "/search", label: "Search", icon: Search },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Mobile bottom bar shows a subset of 5 items
const mobileItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/add", label: "Add", icon: PlusCircle },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
          <span className="text-xl">📖</span>
          <span className="font-bold text-lg text-foreground">
            Vocabulary Vault
          </span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card">
        <div className="flex justify-around py-2">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
