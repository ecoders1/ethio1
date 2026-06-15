"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Filter, Clock, BookOpen, ChevronRight, Play } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/constants";
import type { Exam } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Suspense } from "react";

const examTypes = [
  { id: "all", label: "All Exams", emoji: "📚" },
  { id: "practice", label: "Practice", emoji: "📝" },
  { id: "mock", label: "Mock Exams", emoji: "🎯" },
  { id: "previous", label: "Previous", emoji: "📄" },
];

function ExamsContent() {
  const searchParams = useSearchParams();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState(searchParams.get("type") || "all");
  const [activeDept, setActiveDept] = useState(searchParams.get("dept") || "all");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    async function loadExams() {
      const supabase = createClient();
      let query = supabase.from("exams").select("*, departments(name, icon, color)").eq("is_active", true);
      if (activeType !== "all") query = query.eq("exam_type", activeType);
      if (activeDept !== "all") query = query.eq("department_id", activeDept);
      const { data } = await query.order("created_at", { ascending: false });
      setExams(data || []);
      setLoading(false);
    }
    loadExams();
  }, [activeType, activeDept]);

  // Demo exams for display when DB is empty
  const demoExams: Exam[] = [
    { id: "demo-1", title: "Computer Science Exit Exam 2023", department_id: "cs", duration_minutes: 180, question_count: 100, passing_score: 50, is_active: true, exam_type: "previous", year: 2023, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "demo-2", title: "CS Mock Exam #1", department_id: "cs", duration_minutes: 180, question_count: 100, passing_score: 50, is_active: true, exam_type: "mock", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "demo-3", title: "CS Practice - Data Structures", department_id: "cs", duration_minutes: 60, question_count: 40, passing_score: 50, is_active: true, exam_type: "practice", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "demo-4", title: "Nursing Exit Exam 2023", department_id: "nursing", duration_minutes: 180, question_count: 100, passing_score: 50, is_active: true, exam_type: "previous", year: 2023, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "demo-5", title: "Accounting Mock Exam", department_id: "af", duration_minutes: 180, question_count: 100, passing_score: 50, is_active: true, exam_type: "mock", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "demo-6", title: "Law Practice Questions", department_id: "law", duration_minutes: 90, question_count: 60, passing_score: 50, is_active: true, exam_type: "practice", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

  const displayExams = exams.length > 0 ? exams : demoExams;
  const filteredExams = displayExams.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === "all" || e.exam_type === activeType;
    const matchDept = activeDept === "all" || e.department_id === activeDept;
    return matchSearch && matchType && matchDept;
  });

  const getDept = (id: string) => DEPARTMENTS.find((d) => d.id === id);

  const typeColors = {
    practice: "from-violet-500 to-purple-600",
    mock: "from-blue-500 to-cyan-600",
    previous: "from-orange-500 to-amber-600",
  };

  return (
    <div className="min-h-screen">
      <TopBar userName="Student" />
      <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white mb-1">Exams</h1>
          <p className="text-slate-400 text-sm">Find and take practice, mock, or previous exit exams</p>
        </motion.div>

        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: showFilter ? "linear-gradient(135deg, #7c3aed, #3b82f6)" : "rgba(255,255,255,0.06)",
              color: showFilter ? "#fff" : "#94a3b8",
              border: showFilter ? "none" : "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
        </motion.div>

        {/* Dept filter dropdown */}
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 flex-wrap pb-2">
              <button
                onClick={() => setActiveDept("all")}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={activeDept === "all"
                  ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                All Departments
              </button>
              {DEPARTMENTS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDept(d.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={activeDept === d.id
                    ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                    : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  {d.icon} {d.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {examTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={
                activeType === t.id
                  ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Exam List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-400">No exams found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredExams.map((exam, i) => {
              const dept = getDept(exam.department_id);
              const typeColor = typeColors[exam.exam_type as keyof typeof typeColors] || "from-slate-500 to-gray-600";
              return (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="group p-5 rounded-2xl cursor-pointer transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${dept?.color || "from-purple-500 to-blue-500"}`}>
                        {dept?.icon || "📚"}
                      </div>
                      <div>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
                        >
                          {dept?.name || exam.department_id}
                        </span>
                        <div className={`mt-1 text-xs font-medium px-2 py-0.5 rounded-full inline-block bg-gradient-to-r ${typeColor} text-white`}>
                          {exam.exam_type}
                        </div>
                      </div>
                    </div>
                    {exam.year && (
                      <span className="text-xs text-slate-500 font-medium">{exam.year}</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white mb-3 text-sm leading-tight">{exam.title}</h3>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {exam.question_count} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {formatDuration(exam.duration_minutes)}
                    </span>
                    <span className="flex items-center gap-1">
                      🏆 Pass: {exam.passing_score}%
                    </span>
                  </div>

                  {/* Start button */}
                  <Link
                    href={`/exam/${exam.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/20"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                  >
                    <Play className="w-4 h-4" /> Start Exam
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExamsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <ExamsContent />
    </Suspense>
  );
}
