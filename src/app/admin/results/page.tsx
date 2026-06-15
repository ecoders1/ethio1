"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, RefreshCw, Trophy, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Result {
  id: string;
  user_id: string;
  exam_id: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score: number;
  percentage: number;
  passed: boolean;
  time_taken: number;
  completed_at: string;
  users?: { full_name: string; email: string; department_id?: string };
  exams?: { title: string; department_id: string };
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => { loadResults(); }, []);

  async function loadResults() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("results")
      .select("*, users(full_name, email, department_id), exams(title, department_id)")
      .order("completed_at", { ascending: false })
      .limit(200);
    setResults(data || []);
    setLoading(false);
  }

  const filtered = results.filter(r => {
    const name = r.users?.full_name?.toLowerCase() || "";
    const title = r.exams?.title?.toLowerCase() || "";
    const matchSearch = name.includes(search.toLowerCase()) || title.includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || (filterStatus === "passed" ? r.passed : !r.passed);
    return matchSearch && matchStatus;
  });

  const passRate = results.length > 0
    ? Math.round((results.filter(r => r.passed).length / results.length) * 100)
    : 0;

  const avgScore = results.length > 0
    ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length)
    : 0;

  // Dept pass rate data for chart
  const deptStats = DEPARTMENTS.slice(0, 8).map(d => {
    const deptResults = results.filter(r => r.exams?.department_id === d.id);
    const pass = deptResults.filter(r => r.passed).length;
    return {
      dept: d.name.split(" ")[0],
      pass: deptResults.length ? Math.round((pass / deptResults.length) * 100) : 0,
      total: deptResults.length,
    };
  }).filter(d => d.total > 0);

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Exam", "Score", "Percentage", "Status", "Date"];
    const rows = filtered.map(r => [
      r.users?.full_name || "",
      r.users?.email || "",
      r.exams?.title || "",
      r.score,
      r.percentage + "%",
      r.passed ? "Passed" : "Failed",
      formatDate(r.completed_at),
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "results.csv";
    a.click();
    toast.success("Exported as CSV!");
  };

  const tooltipStyle = {
    contentStyle: { background: "#13111f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px" },
  };

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Results Management</h1>
          <p className="text-slate-400 text-sm">{results.length} total results</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadResults}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Results", value: results.length, emoji: "📊", color: "rgba(124,58,237,0.15)" },
          { label: "Pass Rate", value: `${passRate}%`, emoji: "✅", color: "rgba(16,185,129,0.15)" },
          { label: "Avg Score", value: `${avgScore}%`, emoji: "📈", color: "rgba(59,130,246,0.15)" },
          { label: "Top Students", value: results.filter(r => r.percentage >= 80).length, emoji: "🏆", color: "rgba(245,158,11,0.15)" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl" style={{ background: s.color, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Department Pass Rate Chart */}
      {deptStats.length > 0 && (
        <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-white font-bold text-sm">Department Pass Rate (%)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="dept" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="pass" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Pass %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student or exam..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>
        {["all", "passed", "failed"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
            style={filterStatus === s
              ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
              : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
            }>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Student", "Exam", "Score", "Status", "Time", "Date"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No results found</td></tr>
              ) : (
                filtered.map((r, i) => (
                  <motion.tr key={r.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{r.users?.full_name || "Unknown"}</p>
                        <p className="text-slate-500 text-xs">{r.users?.email || ""}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm max-w-[200px]">
                      <p className="truncate">{r.exams?.title || "Exam"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-black text-sm" style={{ color: r.passed ? "#10b981" : "#ef4444" }}>
                        {r.percentage}%
                      </span>
                      <p className="text-slate-500 text-xs">{r.correct_answers}/{r.total_questions}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={r.passed
                          ? { background: "rgba(16,185,129,0.15)", color: "#34d399" }
                          : { background: "rgba(239,68,68,0.15)", color: "#f87171" }
                        }
                      >
                        {r.passed ? "✅ Passed" : "❌ Failed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {Math.floor(r.time_taken / 60)}m {r.time_taken % 60}s
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(r.completed_at)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Students */}
      {results.length > 0 && (
        <div>
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" /> Top Students
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {results
              .sort((a, b) => b.percentage - a.percentage)
              .slice(0, 3)
              .map((r, i) => (
                <div key={r.id} className="p-4 rounded-2xl flex items-center gap-3"
                  style={{
                    background: i === 0 ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.05)",
                    border: i === 0 ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  }}>
                  <div className="text-2xl">{["🥇", "🥈", "🥉"][i]}</div>
                  <div>
                    <p className="text-white font-bold text-sm">{r.users?.full_name || "Student"}</p>
                    <p className="text-slate-400 text-xs">{r.exams?.title || "Exam"}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-black text-white">{r.percentage}%</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
