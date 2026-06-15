"use client";

import { use, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle, XCircle, RotateCcw, Home, Download, Share2,
  Trophy, Target, Clock, BookOpen
} from "lucide-react";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip
} from "recharts";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { ExamResult } from "@/lib/types";

interface ResultsPageParams { id: string }

export default function ResultsPage({ params }: { params: Promise<ResultsPageParams> }) {
  const { id } = use(params);
  const router = useRouter();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadResult();
  }, [id]);

  async function loadResult() {
    const supabase = createClient();
    const { data } = await supabase
      .from("results")
      .select("*, exams(title, department_id, passing_score, duration_minutes, question_count)")
      .eq("id", id)
      .single();

    setResult(data);
    setLoading(false);
  }

  const handleDownloadPDF = async () => {
    toast.success("Preparing PDF download...");
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      if (!printRef.current) return;
      const canvas = await html2canvas(printRef.current, { backgroundColor: "#0a0814", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`result-${id}.pdf`);
    } catch {
      toast.error("PDF download failed");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "My Exit Exam Result", text: `I scored ${result?.percentage}% on my exit exam!`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0814, #0d0a1f)" }}>
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0814, #0d0a1f)" }}>
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-slate-400">Result not found</p>
          <Link href="/dashboard" className="text-purple-400 mt-4 inline-block">← Go Home</Link>
        </div>
      </div>
    );
  }

  const exam = (result as ExamResult & { exams?: { title: string; passing_score: number; duration_minutes: number; question_count: number } }).exams;
  const pieData = [
    { name: "Correct", value: result.correct_answers, color: "#10b981" },
    { name: "Wrong", value: result.wrong_answers, color: "#ef4444" },
    { name: "Unanswered", value: result.total_questions - result.correct_answers - result.wrong_answers, color: "#6b7280" },
  ].filter(d => d.value > 0);

  const radialData = [{ name: "Score", value: result.percentage, fill: result.passed ? "#10b981" : "#ef4444" }];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0814, #0d0a1f)" }}>
      <div className="px-4 md:px-6 py-8 max-w-3xl mx-auto" ref={printRef}>
        {/* Pass / Fail Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-8 text-center mb-6 relative overflow-hidden"
          style={{
            background: result.passed
              ? "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.25))"
              : "linear-gradient(135deg, rgba(239,68,68,0.25), rgba(185,28,28,0.25))",
            border: `1px solid ${result.passed ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="text-7xl mb-4"
          >
            {result.passed ? "🏆" : "💪"}
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-2">
            {result.passed ? "Congratulations!" : "Keep Trying!"}
          </h1>
          <p className="text-slate-300 text-sm mb-4">
            {exam?.title || "Exam"}
          </p>
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold ${result.passed ? "text-emerald-300" : "text-red-300"}`}
            style={{
              background: result.passed ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
              border: `1px solid ${result.passed ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
            }}
          >
            {result.passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {result.passed ? "PASSED" : "NOT PASSED"}
          </div>
        </motion.div>

        {/* Score Gauge + Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4 mb-6"
        >
          {/* Radial Score */}
          <div
            className="p-6 rounded-2xl flex flex-col items-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <h3 className="text-slate-400 text-sm font-medium mb-4">Your Score</h3>
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270} data={radialData}>
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "rgba(255,255,255,0.05)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black" style={{ color: result.passed ? "#10b981" : "#ef4444" }}>
                  {result.percentage}%
                </span>
                <span className="text-slate-400 text-xs">Pass: {exam?.passing_score || 50}%</span>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div
            className="p-6 rounded-2xl flex flex-col items-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <h3 className="text-slate-400 text-sm font-medium mb-4">Answer Breakdown</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#13111f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
                  formatter={(value, name) => [`${value}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs mt-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: "Total Questions", value: result.total_questions, icon: BookOpen, color: "#8b5cf6" },
            { label: "Correct", value: result.correct_answers, icon: CheckCircle, color: "#10b981" },
            { label: "Wrong", value: result.wrong_answers, icon: XCircle, color: "#ef4444" },
            { label: "Time Taken", value: formatTime(result.time_taken), icon: Clock, color: "#3b82f6" },
          ].map((s) => (
            <div
              key={s.label}
              className="p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          <button
            onClick={handleDownloadPDF}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
          >
            <Download className="w-5 h-5 text-purple-400" />
            Download PDF
          </button>
          <button
            onClick={() => window.print()}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)" }}
          >
            <Target className="w-5 h-5 text-blue-400" />
            Print Result
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)" }}
          >
            <Share2 className="w-5 h-5 text-emerald-400" />
            Share
          </button>
          <Link
            href={`/exam/${result.exam_id}`}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "rgba(234,179,8,0.2)", border: "1px solid rgba(234,179,8,0.3)" }}
          >
            <RotateCcw className="w-5 h-5 text-yellow-400" />
            Retake
          </Link>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3"
        >
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition-all"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            href="/exams"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          >
            <BookOpen className="w-4 h-4" /> More Exams
          </Link>
        </motion.div>

        {/* Certificate hint */}
        {result.passed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 rounded-2xl flex items-center gap-3"
            style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)" }}
          >
            <Trophy className="w-8 h-8 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 font-bold text-sm">Certificate Earned! 🎉</p>
              <p className="text-slate-400 text-xs">Visit your profile to download your certificate.</p>
            </div>
            <Link
              href="/profile"
              className="ml-auto flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-yellow-300"
              style={{ background: "rgba(234,179,8,0.2)" }}
            >
              View
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
