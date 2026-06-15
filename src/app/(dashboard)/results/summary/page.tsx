"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, XCircle, Home, BookOpen } from "lucide-react";

function SummaryContent() {
  const sp = useSearchParams();
  const correct = Number(sp.get("correct") || 0);
  const total = Number(sp.get("total") || 0);
  const percentage = Number(sp.get("percentage") || 0);
  const passed = sp.get("passed") === "true";
  const examTitle = sp.get("examTitle") || "Exam";

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0a0814, #0d0a1f)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div
          className="rounded-3xl p-8 text-center"
          style={{
            background: passed ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${passed ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}
        >
          <div className="text-6xl mb-4">{passed ? "🏆" : "💪"}</div>
          <h1 className="text-2xl font-black text-white mb-2">{passed ? "Congratulations!" : "Keep Trying!"}</h1>
          <p className="text-slate-400 text-sm mb-6">{examTitle}</p>

          <div className="text-6xl font-black mb-2" style={{ color: passed ? "#10b981" : "#ef4444" }}>
            {percentage}%
          </div>

          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 ${passed ? "text-emerald-300" : "text-red-300"}`}
            style={{ background: passed ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)" }}
          >
            {passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {passed ? "PASSED" : "NOT PASSED"}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.1)" }}>
              <div className="text-2xl font-black text-emerald-400">{correct}</div>
              <div className="text-xs text-slate-400">Correct</div>
            </div>
            <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)" }}>
              <div className="text-2xl font-black text-red-400">{total - correct}</div>
              <div className="text-xs text-slate-400">Wrong</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-slate-300 border border-white/10">
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link href="/exams" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              <BookOpen className="w-4 h-4" /> More Exams
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResultsSummaryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <SummaryContent />
    </Suspense>
  );
}
