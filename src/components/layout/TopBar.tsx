"use client";

import { Bell, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { getInitials } from "@/lib/utils";

interface TopBarProps {
  userName?: string;
  avatarUrl?: string;
  onMenuToggle?: () => void;
}

export function TopBar({ userName = "Student", avatarUrl, onMenuToggle }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [notifCount] = useState(3);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3"
      style={{
        background: "rgba(10, 8, 25, 0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:block">
          <p className="text-xs text-slate-500">Welcome back,</p>
          <p className="font-semibold text-white text-sm">{userName}</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Bell className="w-5 h-5" />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
              {notifCount}
            </span>
          )}
        </button>

        <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center font-bold text-sm text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            getInitials(userName)
          )}
        </div>
      </div>
    </header>
  );
}
