"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, FileText, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { DEPARTMENTS } from "@/lib/constants";
import type { Material } from "@/lib/types";

const FILE_ICONS: Record<string, string> = {
  pdf: "📕", docx: "📄", ppt: "📊", xls: "📗", image: "🖼️", other: "📁"
};

const CAT_LABELS: Record<string, string> = {
  notes: "Notes", books: "Books", slides: "Slides", past_exam: "Past Exam", other: "Other"
};

// Demo materials when DB is empty
const DEMO_MATERIALS: Material[] = [
  { id: "1", title: "Computer Science Exit Exam Guide 2024", department_id: "cs", file_url: "#", file_type: "pdf", file_size: 2400000, category: "notes", download_count: 342, created_at: new Date().toISOString() },
  { id: "2", title: "Data Structures & Algorithms Notes", department_id: "cs", file_url: "#", file_type: "pdf", file_size: 1800000, category: "notes", download_count: 215, created_at: new Date().toISOString() },
  { id: "3", title: "Nursing Clinical Practice Handbook", department_id: "nursing", file_url: "#", file_type: "docx", file_size: 3100000, category: "books", download_count: 189, created_at: new Date().toISOString() },
  { id: "4", title: "Accounting & Finance Exam Prep", department_id: "af", file_url: "#", file_type: "pdf", file_size: 2200000, category: "past_exam", download_count: 267, created_at: new Date().toISOString() },
  { id: "5", title: "Law Exam Questions 2023", department_id: "law", file_url: "#", file_type: "pdf", file_size: 1500000, category: "past_exam", download_count: 145, created_at: new Date().toISOString() },
  { id: "6", title: "Civil Engineering Slides", department_id: "civil", file_url: "#", file_type: "ppt", file_size: 5200000, category: "slides", download_count: 98, created_at: new Date().toISOString() },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("materials").select("*").order("download_count", { ascending: false });
      setMaterials(data && data.length > 0 ? data : DEMO_MATERIALS);
      setLoading(false);
    }
    load();
  }, []);

  const handleDownload = async (material: Material) => {
    if (material.file_url === "#") {
      toast.success("Download will be available soon!");
      return;
    }
    window.open(material.file_url, "_blank");
    // Increment download count
    const supabase = createClient();
    await supabase.from("materials").update({ download_count: material.download_count + 1 }).eq("id", material.id);
    toast.success("Download started!");
  };

  const filtered = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || m.department_id === filterDept;
    const matchCat = filterCat === "all" || m.category === filterCat;
    return matchSearch && matchDept && matchCat;
  });

  const getDept = (id?: string) => id ? DEPARTMENTS.find(d => d.id === id) : null;

  return (
    <div className="min-h-screen">
      <TopBar userName="Student" />
      <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white mb-1">Study Materials</h1>
          <p className="text-slate-400 text-sm">Download notes, books, slides, and past exams</p>
        </motion.div>

        {/* Search + Filter */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search materials..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
            style={showFilter
              ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
              : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }
            }
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
        </motion.div>

        {/* Filters */}
        {showFilter && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {["all", ...Object.keys(CAT_LABELS)].map(c => (
                <button key={c} onClick={() => setFilterCat(c)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={filterCat === c
                    ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                    : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
                  }>
                  {c === "all" ? "All Types" : CAT_LABELS[c]}
                </button>
              ))}
            </div>
            {/* Department filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setFilterDept("all")}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={filterDept === "all"
                  ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
                }>
                All Departments
              </button>
              {DEPARTMENTS.map(d => (
                <button key={d.id} onClick={() => setFilterDept(d.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={filterDept === d.id
                    ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                    : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
                  }>
                  {d.icon} {d.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Materials Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No materials found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((m, i) => {
              const dept = getDept(m.department_id);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "rgba(124,58,237,0.2)" }}
                    >
                      {FILE_ICONS[m.file_type] || "📁"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm line-clamp-2">{m.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {dept && (
                          <span className="text-xs text-purple-400">{dept.icon} {dept.name}</span>
                        )}
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8" }}
                        >
                          {CAT_LABELS[m.category] || m.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{m.file_type.toUpperCase()}</span>
                      <span>{formatFileSize(m.file_size)}</span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" /> {m.download_count}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownload(m)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
