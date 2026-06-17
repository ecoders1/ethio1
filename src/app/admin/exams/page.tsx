"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Clock, BookOpen, X, Loader2, Upload, FileText, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import type { Exam } from "@/lib/types";

const EXAM_TYPES = [
  { value: "previous", label: "Previous Exit Exam", emoji: "📄" },
  { value: "mock", label: "Mock Exam", emoji: "🎯" },
  { value: "practice", label: "Practice Questions", emoji: "📝" },
];

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("cs");
  const [examType, setExamType] = useState<"previous" | "mock" | "practice">("previous");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [questionCount, setQuestionCount] = useState(100);
  const [passingScore, setPassingScore] = useState(50);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => { loadExams(); }, []);

  async function loadExams() {
    const supabase = createClient();
    const { data } = await supabase.from("exams").select("*").order("created_at", { ascending: false });
    setExams(data || []);
    setLoading(false);
  }

  function resetForm() {
    setTitle(""); setDepartmentId("cs"); setExamType("previous");
    setYear(new Date().getFullYear()); setDurationMinutes(180);
    setQuestionCount(100); setPassingScore(50); setDescription("");
    setSelectedFile(null); setFileUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openCreate() {
    setEditExam(null);
    resetForm();
    setShowModal(true);
  }

  function openEdit(exam: Exam) {
    setEditExam(exam);
    setTitle(exam.title);
    setDepartmentId(exam.department_id);
    setExamType(exam.exam_type);
    setYear(exam.year || new Date().getFullYear());
    setDurationMinutes(exam.duration_minutes);
    setQuestionCount(exam.question_count);
    setPassingScore(exam.passing_score);
    setDescription(exam.description || "");
    setFileUrl("");
    setSelectedFile(null);
    setShowModal(true);
  }

  function getFileType(file: File): string {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) return "pdf";
    if (name.endsWith(".docx") || name.endsWith(".doc")) return "docx";
    if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "ppt";
    if (name.endsWith(".xls") || name.endsWith(".xlsx")) return "xls";
    return "other";
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      setTitle(nameWithoutExt);
    }
  };

  async function uploadFile(file: File): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const fileName = `exams/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    setUploadProgress(20);
    const { error } = await supabase.storage.from("materials").upload(fileName, file, { upsert: false });
    if (error) throw new Error(`File upload failed: ${error.message}`);
    setUploadProgress(70);
    const { data: { publicUrl } } = supabase.storage.from("materials").getPublicUrl(fileName);
    return publicUrl;
  }

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Please enter an exam title"); return; }
    if (!departmentId) { toast.error("Please select a department"); return; }
    setSaving(true);
    setUploadProgress(0);
    try {
      const supabase = createClient();
      let uploadedUrl = fileUrl;

      // Upload file if selected
      if (selectedFile) {
        uploadedUrl = await uploadFile(selectedFile);
        // Also save to materials table so users can download
        await supabase.from("materials").insert({
          title: `${title} - Exam File`,
          department_id: departmentId,
          file_url: uploadedUrl,
          file_type: getFileType(selectedFile),
          file_size: selectedFile.size,
          category: examType === "previous" ? "past_exam" : examType === "mock" ? "notes" : "notes",
          download_count: 0,
        });
      }

      setUploadProgress(85);

      const payload = {
        title: title.trim(),
        department_id: departmentId,
        description: description || `${title} - ${examType} exam${year ? ` (${year})` : ""}`,
        duration_minutes: durationMinutes,
        question_count: questionCount,
        passing_score: passingScore,
        exam_type: examType,
        year: year || null,
        is_active: true,
      };

      if (editExam) {
        await supabase.from("exams").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editExam.id);
        toast.success("Exam updated!");
      } else {
        await supabase.from("exams").insert(payload);
        toast.success(selectedFile ? "Exam created with file!" : "Exam created!");
      }

      setUploadProgress(100);
      setShowModal(false);
      resetForm();
      loadExams();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save exam");
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from("exams").update({ is_active: !current }).eq("id", id);
    loadExams();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exam?")) return;
    const supabase = createClient();
    await supabase.from("exams").delete().eq("id", id);
    toast.success("Exam deleted");
    loadExams();
  };

  const getDept = (id: string) => DEPARTMENTS.find(d => d.id === id);

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Exams</h1>
          <p className="text-slate-400 text-sm">{exams.length} total exams</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))
        ) : exams.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-400 mb-4">No exams yet</p>
            <button onClick={openCreate} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              Create First Exam
            </button>
          </div>
        ) : (
          exams.map((exam, i) => {
            const dept = getDept(exam.department_id);
            const typeColors = { mock: "#60a5fa", previous: "#fbbf24", practice: "#a78bfa" };
            const typeBg = { mock: "rgba(59,130,246,0.2)", previous: "rgba(245,158,11,0.2)", practice: "rgba(124,58,237,0.2)" };
            return (
              <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{dept?.icon || "📋"}</span>
                    <div>
                      <span className="text-xs text-slate-400">{dept?.name}</span>
                      <div className="text-xs px-2 py-0.5 rounded-full inline-block ml-1 mt-0.5"
                        style={{ background: typeBg[exam.exam_type], color: typeColors[exam.exam_type] }}>
                        {EXAM_TYPES.find(t => t.value === exam.exam_type)?.emoji} {exam.exam_type}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleToggle(exam.id, exam.is_active)}
                    style={{ color: exam.is_active ? "#10b981" : "#6b7280" }}>
                    {exam.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>
                <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{exam.title}</h3>
                {exam.year && <p className="text-slate-500 text-xs mb-2">Year: {exam.year}</p>}
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {exam.question_count} Qs</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(exam.duration_minutes)}</span>
                  <span>Pass: {exam.passing_score}%</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(exam)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium"
                    style={{ color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(exam.id)}
                    className="flex items-center justify-center py-2 px-3 rounded-lg text-xs"
                    style={{ color: "#f87171" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-lg rounded-3xl p-6 max-h-[92vh] overflow-y-auto"
              style={{ background: "#13111f", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-black text-xl">{editExam ? "Edit Exam" : "Create Exam"}</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Exam Title */}
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Exam Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Computer Science Exit Exam 2023"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>

                {/* Department + Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Department *</label>
                    <select value={departmentId} onChange={e => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {DEPARTMENTS.map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.icon} {d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Exam Type *</label>
                    <select value={examType} onChange={e => setExamType(e.target.value as typeof examType)}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {EXAM_TYPES.map(t => <option key={t.value} value={t.value} className="bg-slate-900">{t.emoji} {t.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Year</label>
                  <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                    placeholder="e.g. 2023"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>

                {/* Duration / Questions / Pass */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Duration (min)</label>
                    <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Questions</label>
                    <input type="number" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Pass Score %</label>
                    <input type="number" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                </div>

                {/* Upload Exam File */}
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">
                    Upload Exam File <span className="text-slate-500 text-xs">(PDF, DOCX, PPT, XLS — optional)</span>
                  </label>
                  <div
                    className="relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all hover:border-purple-500/50"
                    style={{
                      borderColor: selectedFile ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.15)",
                      background: selectedFile ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)"
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      className="hidden" onChange={handleFileChange} />
                    {selectedFile ? (
                      <div className="flex items-center gap-3 justify-center">
                        <FileText className="w-6 h-6 text-purple-400" />
                        <div className="text-left">
                          <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-slate-500 text-xs">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                        </div>
                        <button type="button" onClick={e => { e.stopPropagation(); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value=""; }}
                          className="ml-auto text-slate-500 hover:text-red-400">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">Click to upload exam file</p>
                        <p className="text-slate-600 text-xs mt-1">PDF, DOCX, PPT, XLS supported</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Description (optional)</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    rows={2} placeholder="Brief description..."
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>

                {/* Upload Progress */}
                {saving && uploadProgress > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{selectedFile ? "Uploading file..." : "Saving..."}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%`, background: "linear-gradient(90deg, #7c3aed, #3b82f6)" }} />
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl text-slate-300 font-medium text-sm border border-white/10">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editExam ? "Update Exam" : "Create Exam"}
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
