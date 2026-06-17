"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Loader2, Upload, Download, Search, FileText, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/constants";
import type { Material } from "@/lib/types";

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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [category, setCategory] = useState<"notes" | "books" | "slides" | "past_exam" | "other">("past_exam");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => { loadMaterials(); }, []);

  async function loadMaterials() {
    const supabase = createClient();
    const { data } = await supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false });
    setMaterials(data || []);
    setLoading(false);
  }

  function getFileType(file: File): "pdf" | "docx" | "ppt" | "xls" | "image" | "other" {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) return "pdf";
    if (name.endsWith(".docx") || name.endsWith(".doc")) return "docx";
    if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "ppt";
    if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "xls";
    if (name.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "image";
    return "other";
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      toast.error("Please select a file and enter a title");
      return;
    }
    setUploading(true);
    setUploadProgress(0);

    try {
      const supabase = createClient();

      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `materials/${fileName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from("materials")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // Bucket may not exist — store as URL from public link
        throw new Error(`Storage error: ${uploadError.message}. Make sure the 'materials' bucket exists in Supabase Storage.`);
      }

      setUploadProgress(70);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("materials")
        .getPublicUrl(filePath);

      // Save to materials table
      await supabase.from("materials").insert({
        title,
        department_id: departmentId || null,
        file_url: publicUrl,
        file_type: getFileType(selectedFile),
        file_size: selectedFile.size,
        category,
        download_count: 0,
      });

      setUploadProgress(100);
      toast.success("File uploaded successfully!");
      setShowModal(false);
      resetForm();
      loadMaterials();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  function resetForm() {
    setTitle("");
    setDepartmentId("");
    setCategory("past_exam");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("Delete this material?")) return;
    const supabase = createClient();

    // Try to delete from storage
    try {
      const urlParts = fileUrl.split("/materials/");
      if (urlParts.length > 1) {
        await supabase.storage.from("materials").remove([`materials/${urlParts[1]}`]);
      }
    } catch { /* ignore storage delete errors */ }

    await supabase.from("materials").delete().eq("id", id);
    toast.success("Deleted");
    loadMaterials();
  };

  const filtered = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || m.category === filterCat;
    return matchSearch && matchCat;
  });

  function formatSize(bytes: number) {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const getDept = (id?: string) => id ? DEPARTMENTS.find(d => d.id === id) : null;

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Study Materials</h1>
          <p className="text-slate-400 text-sm">{materials.length} files uploaded</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          <Plus className="w-4 h-4" /> Upload File
        </button>
      </div>

      {/* Supabase Storage setup notice */}
      <div className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <p className="text-yellow-300 text-xs font-semibold mb-1">⚠️ Storage Setup Required</p>
        <p className="text-slate-400 text-xs">
          Make sure you&apos;ve created a public bucket named <code className="text-yellow-300">materials</code> in{" "}
          <strong>Supabase → Storage → New Bucket → Name: materials → Public: ON</strong>
        </p>
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
            <button key={c} onClick={() => setFilterCat(c)}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={filterCat === c
                ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
              }>
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
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">No materials yet</p>
          <button onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
            Upload First File
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => {
            const dept = getDept(m.department_id);
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "rgba(124,58,237,0.2)" }}>
                    {FILE_ICONS[m.file_type] || "📁"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{m.title}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {m.file_type.toUpperCase()} · {CAT_LABELS[m.category]} · {formatSize(m.file_size)}
                    </p>
                    {dept && <p className="text-purple-400 text-xs mt-0.5">{dept.icon} {dept.name}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Download className="w-3 h-3" /> {m.download_count} downloads
                  </div>
                  <div className="flex gap-1">
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/15 transition-all" title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    <a href={m.file_url} download
                      className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/15 transition-all" title="Download">
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button onClick={() => handleDelete(m.id, m.file_url)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-3xl p-6"
              style={{ background: "#13111f", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-black text-xl flex items-center gap-2">
                  <Upload className="w-5 h-5 text-orange-400" /> Upload Material
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File Drop Zone */}
                <div
                  className="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-purple-500/50"
                  style={{ borderColor: selectedFile ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.15)", background: selectedFile ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {selectedFile ? (
                    <div>
                      <div className="text-4xl mb-2">{FILE_ICONS[getFileType(selectedFile)]}</div>
                      <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-slate-400 text-xs mt-1">{formatSize(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-300 text-sm font-medium">Click to select file</p>
                      <p className="text-slate-500 text-xs mt-1">PDF, DOCX, PPT, XLS, Images</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. CS Exit Exam 2023 PDF"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value as typeof category)}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {Object.entries(CAT_LABELS).map(([k, v]) => (
                        <option key={k} value={k} className="bg-slate-900">{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Department</label>
                    <select value={departmentId} onChange={e => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <option value="" className="bg-slate-900">All Depts</option>
                      {DEPARTMENTS.map(d => (
                        <option key={d.id} value={d.id} className="bg-slate-900">{d.icon} {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%`, background: "linear-gradient(90deg, #7c3aed, #3b82f6)" }} />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl text-slate-300 font-medium text-sm border border-white/10">
                    Cancel
                  </button>
                  <button onClick={handleUpload} disabled={uploading || !selectedFile}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                    {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
