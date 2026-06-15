"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/exams", icon: BookOpen, label: "Exams" },
  { href: "/departments", icon: Building2, label: "Departments" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: "rgba(10, 8, 25, 0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-around py-2 px-4 safe-area-bottom">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                active
                  ? "text-purple-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <div className={cn(
                "relative w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                active && "bg-purple-500/20"
              )}>
                <Icon className={cn("w-5 h-5", active && "text-purple-400")} />
                {active && (
                  <span
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.2))",
                    }}
                  />
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
