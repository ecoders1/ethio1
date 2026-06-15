"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Building2, BookOpen, HelpCircle, BarChart3,
  TrendingUp, Activity, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import type { AdminStats } from "@/lib/types";

const MONTHLY_DATA = [
  { month: "Jan", exams: 120, users: 340 },
  { month: "Feb", exams: 180, users: 420 },
  { month: "Mar", exams: 240, users: 580 },
  { month: "Apr", exams: 310, users: 720 },
  { month: "May", exams: 280, users: 650 },
  { month: "Jun", exams: 400, users: 890 },
];

const DEPT_DATA = [
  { dept: "CS", pass: 78, fail: 22 },
  { dept: "IT", pass: 72, fail: 28 },
  { dept: "Nursing", pass: 85, fail: 15 },
  { dept: "Law", pass: 65, fail: 35 },
  { dept: "Medicine", pass: 80, fail: 20 },
  { dept: "A&F", pass: 70, fail: 30 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total_students: 0, total_departments: 0, total_exams: 0,
    total_questions: 0, total_results: 0, active_users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    const supabase = createClient();
    const [students, departments, exams, questions, results] = await Promise.all([
      supabase.from("users").select("id", { count: "exact" }).eq("role", "student"),
      supabase.from("departments").select("id", { count: "exact" }),
      supabase.from("exams").select("id", { count: "exact" }),
      supabase.from("questions").select("id", { count: "exact" }),
      supabase.from("results").select("id", { count: "exact" }),
    ]);
    setStats({
      total_students: students.count || 0,
      total_departments: departments.count || 22,
      total_exams: exams.count || 0,
      total_questions: questions.count || 0,
      total_results: results.count || 0,
      active_users: Math.floor((students.count || 0) * 0.3),
    });
    setLoading(false);
  }

  const statCards = [
    { label: "Total Students", value: stats.total_students, icon: Users, color: "from-violet-500 to-purple-600", bg: "rgba(124,58,237,0.15)" },
    { label: "Departments", value: stats.total_departments, icon: Building2, color: "from-blue-500 to-cyan-600", bg: "rgba(59,130,246,0.15)" },
    { label: "Total Exams", value: stats.total_exams, icon: BookOpen, color: "from-emerald-500 to-teal-600", bg: "rgba(16,185,129,0.15)" },
    { label: "Questions", value: stats.total_questions, icon: HelpCircle, color: "from-orange-500 to-amber-600", bg: "rgba(245,158,11,0.15)" },
    { label: "Total Results", value: stats.total_results, icon: BarChart3, color: "from-pink-500 to-rose-600", bg: "rgba(236,72,153,0.15)" },
    { label: "Active Users", value: stats.active_users, icon: Activity, color: "from-indigo-500 to-violet-600", bg: "rgba(99,102,241,0.15)" },
  ];

  const tooltipStyle = {
    contentStyle: { background: "#13111f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px" },
  };

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Exit Exam Ethiopia Overview</p>
        </div>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            className="p-4 rounded-2xl relative overflow-hidden"
            style={{ background: s.bg, border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <s.icon className={`w-5 h-5 mb-2 bg-gradient-to-br ${s.color}`}
              style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} />
            <div className="text-2xl font-black text-white">
              {loading ? "..." : s.value.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Users + Exams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-white font-bold text-sm">Monthly Activity</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="examGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="users" stroke="#7c3aed" fill="url(#userGrad)" strokeWidth={2} name="Users" />
              <Area type="monotone" dataKey="exams" stroke="#3b82f6" fill="url(#examGrad)" strokeWidth={2} name="Exams" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-6 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-white font-bold text-sm">Department Pass Rate %</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DEPT_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="dept" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="pass" fill="#10b981" radius={[4, 4, 0, 0]} name="Pass %" />
              <Bar dataKey="fail" fill="#ef4444" radius={[4, 4, 0, 0]} name="Fail %" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-white font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Add Student", href: "/admin/students", emoji: "👤", color: "from-violet-500 to-purple-600" },
            { label: "Create Exam", href: "/admin/exams", emoji: "📋", color: "from-blue-500 to-cyan-600" },
            { label: "Add Questions", href: "/admin/questions", emoji: "❓", color: "from-emerald-500 to-teal-600" },
            { label: "Upload Materials", href: "/admin/materials", emoji: "📁", color: "from-orange-500 to-amber-600" },
            { label: "Send Notification", href: "/admin/notifications", emoji: "🔔", color: "from-pink-500 to-rose-600" },
            { label: "View Results", href: "/admin/results", emoji: "📊", color: "from-indigo-500 to-violet-600" },
            { label: "Issue Certificate", href: "/admin/certificates", emoji: "🏆", color: "from-yellow-500 to-amber-600" },
            { label: "Settings", href: "/admin/settings", emoji: "⚙️", color: "from-slate-500 to-gray-600" },
          ].map((a) => (
            <a key={a.href} href={a.href}>
              <div
                className="p-4 rounded-2xl text-center cursor-pointer transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="text-3xl mb-2">{a.emoji}</div>
                <p className="text-white text-xs font-medium">{a.label}</p>
              </div>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
