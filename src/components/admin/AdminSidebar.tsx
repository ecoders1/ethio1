"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, BookOpen, HelpCircle,
  FileText, BarChart3, Bell, Award, Settings, LogOut, ShieldCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/students", icon: Users, label: "Students" },
  { href: "/admin/departments", icon: Building2, label: "Departments" },
  { href: "/admin/exams", icon: BookOpen, label: "Exams" },
  { href: "/admin/questions", icon: HelpCircle, label: "Question Bank" },
  { href: "/admin/materials", icon: FileText, label: "Materials" },
  { href: "/admin/results", icon: BarChart3, label: "Results" },
  { href: "/admin/notifications", icon: Bell, label: "Notifications" },
  { href: "/admin/certificates", icon: Award, label: "Certificates" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/auth/signin");
  };

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40"
      style={{
        background: "rgba(6, 4, 16, 0.97)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="p-5 pb-4">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          >
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-black text-white text-xs">ADMIN PANEL</div>
            <div className="text-purple-400 text-xs">Exit Exam Ethiopia</div>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium",
                active ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.15))",
                      border: "1px solid rgba(124,58,237,0.25)",
                    }
                  : {}
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
