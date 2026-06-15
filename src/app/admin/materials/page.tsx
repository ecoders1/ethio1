"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Loader2, FileText, Upload, Download, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/constants";
import type { Material } from "@/lib/types";

const schema = z.object({
  title: z.string().min(2),
  department_id: z.string().optional(),
  file_url: z.string().url("Must be a valid URL"),
  file_type: z.enum(["pdf", "docx", "ppt", "xls", "image", "other"]),
  category: z.enum(["notes", "books", "slides", "past_exam", "other"]),
});
type Form = z.infer<typeof schema>;

const FILE_ICONS: Record<string, string> = {
  pdf: "📕", docx: "📄", ppt: "📊", xls: "📗", image: "🖼️", other: "📁"
};

const CAT_LABELS: Record<string, string> = {
  notes: "Notes", books: "Books", slides: "Slides", past_exam: "Past Exam", other: "Other"
};

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { file_type: "pdf", category: "notes" },
  });

  useEffect(() => { loadMaterials(); }, []);

  async function loadMaterials() {
    const supabase = createClient();
    const { data } = await supabase.from("materials").select("*").order("created_at", { ascending: false });
    setMaterials(data || []);
    setLoading(false);
  }

  const onSubmit = async (data: Form) => {
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("materials").insert({
        ...data,
        file_size: 0,
        download_count: 0,
      });
      toast.success("Material added!");
      setShowModal(false);
      reset();
      loadMaterials();
    } catch { toast.error("Failed to add material"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    const supabase = createClient();
    await supabase.from("materials").delete().eq("id", id);
    toast.success("Deleted");
    loadMaterials();
  };

  const filtered = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || m.category === filterCat;
    return matchSearch && matchCat;
  });

  const getDept = (id?: string) => id ? DEPARTMENTS.find(d => d.id === id) : null;

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">File Materials</h1>
          <p className="text-slate-400 text-sm">{materials.length} materials uploaded</p>
        </div>
        <button
          onClick={() => { reset(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          <Plus className="w-4 h-4" /> Add Material
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search materials..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["all", "notes", "books", "slides", "past_exam", "other"].map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={filterCat === c
                ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {c === "all" ? "All" : CAT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📁</div>
          <p className="text-slate-400 mb-4">No materials yet</p>
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            Upload First Material
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => {
            const dept = getDept(m.department_id);
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
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
                    <h3 className="text-white font-bold text-sm truncate">{m.title}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {m.file_type.toUpperCase()} · {CAT_LABELS[m.category]}
                    </p>
                    {dept && (
                      <p className="text-purple-400 text-xs mt-0.5">{dept.icon} {dept.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Download className="w-3 h-3" />
                    {m.download_count} downloads
                  </div>
                  <div className="flex gap-1">
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/15">
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-3xl p-6"
              style={{ background: "#13111f", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-black text-xl flex items-center gap-2">
                  <Upload className="w-5 h-5 text-orange-400" /> Add Material
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Title</label>
                  <input {...register("title")} placeholder="e.g. CS Study Guide 2024"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "rgba(255,255,255,0.06)", border: errors.title ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)" }} />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">File URL</label>
                  <input {...register("file_url")} placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "rgba(255,255,255,0.06)", border: errors.file_url ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)" }} />
                  {errors.file_url && <p className="text-red-400 text-xs mt-1">{errors.file_url.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">File Type</label>
                    <select {...register("file_type")}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {["pdf", "docx", "ppt", "xls", "image", "other"].map(t => <option key={t} value={t} className="bg-slate-900">{t.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Category</label>
                    <select {...register("category")}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Department (optional)</label>
                  <select {...register("department_id")}
                    className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                    style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <option value="" className="bg-slate-900">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.icon} {d.name}</option>)}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl text-slate-300 font-medium text-sm border border-white/10">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : "Add Material"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
