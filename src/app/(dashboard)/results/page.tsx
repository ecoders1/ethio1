"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, ChevronRight, Trophy, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { formatDate } from "@/lib/utils";
import type { ExamResult } from "@/lib/types";

interface ResultWithExam extends ExamResult {
  exams?: { title: string; department_id: string };
}

export default function ResultsListPage() {
  const router = useRouter();
  const [results, setResults] = useState<ResultWithExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "passed" | "failed">("all");

  useEffect(() => {
    async function loadResults() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/signin"); return; }

      const { data } = await supabase
        .from("results")
        .select("*, exams(title, department_id)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      setResults(data || []);
      setLoading(false);
    }
    loadResults();
  }, [router]);

  const filtered = results.filter(r => {
    if (filter === "passed") return r.passed;
    if (filter === "failed") return !r.passed;
    return true;
  });

  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length)
    : 0;

  return (
    <div className="min-h-screen">
      <TopBar userName="Student" />
      <div className="px-4 md:px-6 py-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white mb-1">My Results</h1>
          <p className="text-slate-400 text-sm">{results.length} exams completed</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Total Exams", value: results.length, emoji: "📋", color: "rgba(124,58,237,0.15)" },
            { label: "Passed", value: results.filter(r => r.passed).length, emoji: "✅", color: "rgba(16,185,129,0.15)" },
            { label: "Avg Score", value: `${avgScore}%`, emoji: "📊", color: "rgba(59,130,246,0.15)" },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl text-center"
              style={{ background: s.color, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["all", "passed", "failed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
              style={filter === f
                ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">
              {filter === "all" ? "No exam results yet" : `No ${filter} results`}
            </p>
            {filter === "all" && (
              <Link
                href="/exams"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                <BookOpen className="w-4 h-4" /> Browse Exams
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/results/${result.id}`}>
                  <div
                    className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:border-purple-500/40"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: result.passed ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)" }}
                    >
                      {result.passed ? "✅" : "❌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">
                        {result.exams?.title || "Exam"}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {result.correct_answers}/{result.total_questions} correct · {formatDate(result.completed_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p
                          className="font-black text-lg"
                          style={{ color: result.passed ? "#10b981" : "#ef4444" }}
                        >
                          {result.percentage}%
                        </p>
                        <p className={`text-xs font-medium ${result.passed ? "text-emerald-400" : "text-red-400"}`}>
                          {result.passed ? "Passed" : "Failed"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                </Link>
                {result.passed && (
                  <div className="flex items-center gap-2 px-4 py-2 -mt-1 rounded-b-xl"
                    style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.1)", borderTop: "none" }}>
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-yellow-400 text-xs">Certificate earned</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
