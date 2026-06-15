"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, Building2, User, Bell, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/exams", icon: BookOpen, label: "Exams" },
  { href: "/departments", icon: Building2, label: "Departments" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/welcome");
  };

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40"
      style={{
        background: "rgba(10, 8, 25, 0.95)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          >
            <span className="text-xl">🎓</span>
          </div>
          <div>
            <div className="font-black text-white text-sm">EXIT EXAM</div>
            <div className="text-purple-400 text-xs">ETHIOPIA</div>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                active
                  ? "text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
                      border: "1px solid rgba(124,58,237,0.3)",
                    }
                  : {}
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="p-3 space-y-1 border-t border-white/10">
        <Link
          href="/profile#notifications"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
        >
          <Bell className="w-5 h-5" />
          Notifications
        </Link>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
