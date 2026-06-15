"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Clock, BookOpen, X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import type { Exam } from "@/lib/types";

const examSchema = z.object({
  title: z.string().min(3),
  department_id: z.string().min(1),
  description: z.string().optional(),
  duration_minutes: z.number().min(5).max(360),
  question_count: z.number().min(1).max(200),
  passing_score: z.number().min(1).max(100),
  exam_type: z.enum(["practice", "mock", "previous"]),
  year: z.number().optional(),
});
type ExamForm = z.infer<typeof examSchema>;

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExamForm>({
    resolver: zodResolver(examSchema),
    defaultValues: { duration_minutes: 180, question_count: 100, passing_score: 50, exam_type: "practice" },
  });

  useEffect(() => { loadExams(); }, []);

  async function loadExams() {
    const supabase = createClient();
    const { data } = await supabase.from("exams").select("*").order("created_at", { ascending: false });
    setExams(data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditExam(null);
    reset({ duration_minutes: 180, question_count: 100, passing_score: 50, exam_type: "practice" });
    setShowModal(true);
  }

  function openEdit(exam: Exam) {
    setEditExam(exam);
    reset({
      title: exam.title,
      department_id: exam.department_id,
      description: exam.description,
      duration_minutes: exam.duration_minutes,
      question_count: exam.question_count,
      passing_score: exam.passing_score,
      exam_type: exam.exam_type,
      year: exam.year,
    });
    setShowModal(true);
  }

  const onSubmit = async (data: ExamForm) => {
    setSaving(true);
    try {
      const supabase = createClient();
      if (editExam) {
        await supabase.from("exams").update({ ...data, updated_at: new Date().toISOString() }).eq("id", editExam.id);
        toast.success("Exam updated!");
      } else {
        await supabase.from("exams").insert({ ...data, is_active: true });
        toast.success("Exam created!");
      }
      setShowModal(false);
      loadExams();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
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
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
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
            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{dept?.icon || "📋"}</span>
                    <div>
                      <span className="text-xs text-slate-400">{dept?.name}</span>
                      <div
                        className="text-xs px-2 py-0.5 rounded-full inline-block ml-1"
                        style={{
                          background: exam.exam_type === "mock" ? "rgba(59,130,246,0.2)" : exam.exam_type === "previous" ? "rgba(245,158,11,0.2)" : "rgba(124,58,237,0.2)",
                          color: exam.exam_type === "mock" ? "#60a5fa" : exam.exam_type === "previous" ? "#fbbf24" : "#a78bfa",
                        }}
                      >
                        {exam.exam_type}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(exam.id, exam.is_active)}
                    className="text-sm"
                    style={{ color: exam.is_active ? "#10b981" : "#6b7280" }}
                  >
                    {exam.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>

                <h3 className="text-white font-bold text-sm mb-3 line-clamp-2">{exam.title}</h3>

                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {exam.question_count} Qs</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(exam.duration_minutes)}</span>
                  <span>Pass: {exam.passing_score}%</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(exam)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all hover:bg-white/5"
                    style={{ color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-medium transition-all hover:bg-red-500/10"
                    style={{ color: "#f87171" }}
                  >
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ background: "#13111f", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-black text-xl">{editExam ? "Edit Exam" : "Create Exam"}</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Exam Title</label>
                  <input {...register("title")} placeholder="e.g. Computer Science Exit Exam 2024"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "rgba(255,255,255,0.06)", border: errors.title ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)" }} />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Department</label>
                    <select {...register("department_id")}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <option value="">Select...</option>
                      {DEPARTMENTS.map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.icon} {d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Type</label>
                    <select {...register("exam_type")}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <option value="practice">Practice</option>
                      <option value="mock">Mock</option>
                      <option value="previous">Previous</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Duration (min)</label>
                    <input {...register("duration_minutes", { valueAsNumber: true })} type="number"
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Questions</label>
                    <input {...register("question_count", { valueAsNumber: true })} type="number"
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Pass Score %</label>
                    <input {...register("passing_score", { valueAsNumber: true })} type="number"
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Description (optional)</label>
                  <textarea {...register("description")} rows={3} placeholder="Exam description..."
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl text-slate-300 font-medium text-sm border border-white/10">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editExam ? "Update Exam" : "Create Exam"}
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
