"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen, Target, BarChart3, Trophy, TrendingUp,
  ChevronRight, Play, Download, ClipboardList, Zap
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { getInitials } from "@/lib/utils";
import type { User } from "@/lib/types";

const statCards = [
  { label: "Exams Completed", key: "exams_completed", icon: Trophy, color: "from-violet-500 to-purple-600", emoji: "🏆" },
  { label: "Exams Remaining", key: "exams_remaining", icon: BookOpen, color: "from-blue-500 to-cyan-600", emoji: "📚" },
  { label: "Average Score", key: "avg_score", icon: BarChart3, color: "from-emerald-500 to-teal-600", emoji: "📊", suffix: "%" },
  { label: "Practice Progress", key: "practice_progress", icon: TrendingUp, color: "from-orange-500 to-amber-600", emoji: "📈", suffix: "%" },
];

const quickActions = [
  { label: "Start Practice", href: "/exams?type=practice", icon: Play, color: "from-violet-500 to-purple-600", emoji: "▶️" },
  { label: "Take Mock Exam", href: "/exams?type=mock", icon: Target, color: "from-blue-500 to-indigo-600", emoji: "🎯" },
  { label: "Download Materials", href: "/materials", icon: Download, color: "from-emerald-500 to-teal-600", emoji: "📥" },
  { label: "View Results", href: "/results", icon: ClipboardList, color: "from-orange-500 to-amber-600", emoji: "📋" },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    exams_completed: 0,
    exams_remaining: 0,
    avg_score: 0,
    practice_progress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentResults, setRecentResults] = useState<{
    id: string; exam_title: string; score: number; percentage: number; passed: boolean; completed_at: string;
  }[]>([]);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      // Guest mode — no auth required, just stop loading
      if (!authUser) {
        setLoading(false);
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profile) setUser(profile);

      // Get exam results for stats
      const { data: results } = await supabase
        .from("results")
        .select("*, exams(title, department_id)")
        .eq("user_id", authUser.id)
        .order("completed_at", { ascending: false })
        .limit(5);

      if (results && results.length > 0) {
        const avgScore = Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length);
        setStats({
          exams_completed: results.length,
          exams_remaining: Math.max(0, 10 - results.length),
          avg_score: avgScore,
          practice_progress: Math.min(100, results.length * 10),
        });
        setRecentResults(results.map(r => ({
          id: r.id,
          exam_title: r.exams?.title || "Exam",
          score: r.score,
          percentage: r.percentage,
          passed: r.passed,
          completed_at: r.completed_at,
        })));
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const userName = user?.full_name || "Guest";
  const department = user?.department_id || "All Departments";

  return (
    <div className="min-h-screen">
      <TopBar userName={userName} avatarUrl={user?.avatar_url} />

      <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-8">
        {/* Guest banner */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}
          >
            <div>
              <p className="text-white font-bold text-sm">Sign in to save your progress</p>
              <p className="text-slate-400 text-xs">Track results, earn certificates, and more</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href="/auth/signin"
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-white border border-white/20 hover:bg-white/10 transition-all">
                Sign In
              </Link>
              <Link href="/auth/signup"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                Sign Up
              </Link>
            </div>
          </motion.div>
        )}

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          >
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={userName} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              getInitials(userName)
            )}
          </div>
          <div>
            <p className="text-slate-400 text-sm">Good {getTimeOfDay()},</p>
            <h1 className="text-2xl font-black text-white">{userName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}
              >
                🏛️ {department}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className={`absolute inset-0 opacity-10 bg-gradient-to-br ${card.color}`}
              />
              <div className="relative z-10">
                <p className="text-slate-400 text-xs mb-2">{card.label}</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-white">
                    {loading ? "—" : stats[card.key as keyof typeof stats]}
                  </span>
                  {card.suffix && <span className="text-slate-400 text-sm mb-1">{card.suffix}</span>}
                </div>
                <div className="text-2xl mt-1">{card.emoji}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <Link key={action.href} href={action.href}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="p-4 rounded-2xl text-center cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-gradient-to-br ${action.color}`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white text-sm font-medium">{action.label}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" /> Recent Results
            </h2>
            <Link href="/results" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentResults.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="text-5xl mb-4">📝</div>
              <p className="text-slate-400 mb-4">No exams taken yet. Start practicing!</p>
              <Link
                href="/exams"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                Browse Exams <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result, i) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: result.passed ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)" }}
                    >
                      <span className="text-lg">{result.passed ? "✅" : "❌"}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{result.exam_title}</p>
                      <p className="text-slate-500 text-xs">{new Date(result.completed_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-lg font-black"
                      style={{ color: result.passed ? "#10b981" : "#ef4444" }}
                    >
                      {result.percentage}%
                    </p>
                    <p className={`text-xs font-medium ${result.passed ? "text-emerald-400" : "text-red-400"}`}>
                      {result.passed ? "Passed" : "Failed"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Motivational Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.3))",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Keep pushing forward! 🚀</h3>
              <p className="text-slate-300 text-sm">Every practice session brings you closer to success.</p>
            </div>
            <Link
              href="/exams"
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white ml-4"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              Start Now
            </Link>
          </div>
        </motion.div>

        {/* PDF Study Materials */}
        <PdfMaterials />
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

// PDF Materials section shown on dashboard
function PdfMaterials() {
  const [materials, setMaterials] = useState<{ id: string; title: string; file_url: string; file_type: string; category: string; department_id?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<{ title: string; file_url: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("materials")
        .select("id, title, file_url, file_type, category, department_id")
        .order("created_at", { ascending: false })
        .limit(6);
      setMaterials(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (!loading && materials.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          📚 Study Materials
        </h2>
        <Link href="/materials" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {materials.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }}
              className="p-4 rounded-2xl cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onClick={() => {
                if (m.file_type === "pdf" && m.file_url !== "#") setViewing({ title: m.title, file_url: m.file_url });
                else if (m.file_url !== "#") window.open(m.file_url, "_blank");
              }}>
              <div className="text-2xl mb-2">{m.file_type === "pdf" ? "📕" : m.file_type === "docx" ? "📄" : "📁"}</div>
              <p className="text-white text-xs font-bold line-clamp-2 mb-1">{m.title}</p>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                {m.file_type.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Inline PDF Viewer */}
      {viewing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "rgba(0,0,0,0.95)" }}>
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: "rgba(10,8,25,0.95)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-white font-bold text-sm truncate">{viewing.title}</p>
            <div className="flex gap-2">
              <a href={viewing.file_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white"
                style={{ background: "rgba(124,58,237,0.3)" }}>
                Open Tab
              </a>
              <button onClick={() => setViewing(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
                ✕
              </button>
            </div>
          </div>
          <div className="flex-1">
            <iframe src={`${viewing.file_url}#toolbar=1`} className="w-full h-full" title={viewing.title} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
