"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, Loader2, HelpCircle, Search, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { Question, Exam } from "@/lib/types";

const schema = z.object({
  exam_id: z.string().min(1, "Select an exam"),
  question_text: z.string().min(5, "Question too short"),
  question_type: z.enum(["mcq", "true_false"]),
  option_a: z.string().optional(),
  option_b: z.string().optional(),
  option_c: z.string().optional(),
  option_d: z.string().optional(),
  correct_answer: z.string().min(0),
  explanation: z.string().optional(),
  marks: z.number().min(1).max(10),
});
type Form = z.infer<typeof schema>;

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterExam, setFilterExam] = useState("all");
  const [questionType, setQuestionType] = useState<"mcq" | "true_false">("mcq");

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { question_type: "mcq", marks: 1 },
  });

  const watchedType = watch("question_type");

  useEffect(() => {
    loadData();
  }, [filterExam]);

  async function loadData() {
    const supabase = createClient();
    const [examsRes, questionsRes] = await Promise.all([
      supabase.from("exams").select("id, title, department_id").order("title"),
      filterExam === "all"
        ? supabase.from("questions").select("*").order("order_num")
        : supabase.from("questions").select("*").eq("exam_id", filterExam).order("order_num"),
    ]);
    setExams(examsRes.data || []);
    setQuestions(questionsRes.data || []);
    setLoading(false);
  }

  function openCreate() {
    setEditQ(null);
    reset({ question_type: "mcq", marks: 1 });
    setQuestionType("mcq");
    setShowModal(true);
  }

  function openEdit(q: Question) {
    setEditQ(q);
    const opts = q.options || [];
    reset({
      exam_id: q.exam_id,
      question_text: q.question_text,
      question_type: q.question_type,
      option_a: opts[0] || "",
      option_b: opts[1] || "",
      option_c: opts[2] || "",
      option_d: opts[3] || "",
      correct_answer: String(q.correct_answer),
      explanation: q.explanation || "",
      marks: q.marks,
    });
    setQuestionType(q.question_type);
    setShowModal(true);
  }

  const onSubmit = async (data: Form) => {
    setSaving(true);
    try {
      const supabase = createClient();
      const options = data.question_type === "true_false"
        ? ["True", "False"]
        : [data.option_a, data.option_b, data.option_c, data.option_d].filter(Boolean) as string[];

      const payload = {
        exam_id: data.exam_id,
        question_text: data.question_text,
        question_type: data.question_type,
        options,
        correct_answer: Number(data.correct_answer),
        explanation: data.explanation,
        marks: data.marks,
        order_num: editQ?.order_num || questions.length + 1,
      };

      if (editQ) {
        await supabase.from("questions").update(payload).eq("id", editQ.id);
        toast.success("Question updated!");
      } else {
        await supabase.from("questions").insert(payload);
        toast.success("Question created!");
      }
      setShowModal(false);
      loadData();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    const supabase = createClient();
    await supabase.from("questions").delete().eq("id", id);
    toast.success("Question deleted");
    loadData();
  };

  const filtered = questions.filter(q =>
    q.question_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Question Bank</h1>
          <p className="text-slate-400 text-sm">{questions.length} questions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toast.success("CSV/Excel import coming soon!")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5"
          >
            <Upload className="w-4 h-4" /> Import
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>
        <select
          value={filterExam}
          onChange={e => setFilterExam(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <option value="all" className="bg-slate-900">All Exams</option>
          {exams.map(e => <option key={e.id} value={e.id} className="bg-slate-900">{e.title}</option>)}
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">❓</div>
            <p className="text-slate-400 mb-4">No questions yet</p>
            <button onClick={openCreate} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
              Add First Question
            </button>
          </div>
        ) : (
          filtered.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-2xl flex items-start gap-4"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                {q.order_num}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium line-clamp-2">{q.question_text}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: q.question_type === "mcq" ? "rgba(124,58,237,0.2)" : "rgba(59,130,246,0.2)", color: q.question_type === "mcq" ? "#a78bfa" : "#60a5fa" }}
                  >
                    {q.question_type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">{q.marks} mark{q.marks !== 1 ? "s" : ""}</span>
                  {q.options && <span className="text-xs text-slate-500">{q.options.length} options</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/15">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

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
              className="w-full max-w-xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ background: "#13111f", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-black text-xl flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  {editQ ? "Edit Question" : "Add Question"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Exam</label>
                  <select {...register("exam_id")}
                    className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "rgba(20,15,40,0.9)", border: errors.exam_id ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)" }}>
                    <option value="" className="bg-slate-900">Select Exam...</option>
                    {exams.map(e => <option key={e.id} value={e.id} className="bg-slate-900">{e.title}</option>)}
                  </select>
                  {errors.exam_id && <p className="text-red-400 text-xs mt-1">{errors.exam_id.message}</p>}
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Question Type</label>
                  <div className="flex gap-2">
                    {[{ id: "mcq", label: "Multiple Choice" }, { id: "true_false", label: "True / False" }].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => { setValue("question_type", t.id as "mcq" | "true_false"); setQuestionType(t.id as "mcq" | "true_false"); }}
                        className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                        style={watchedType === t.id
                          ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                          : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
                        }
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Question Text</label>
                  <textarea {...register("question_text")} rows={3} placeholder="Enter the question..."
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: errors.question_text ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)" }} />
                  {errors.question_text && <p className="text-red-400 text-xs mt-1">{errors.question_text.message}</p>}
                </div>

                {watchedType === "mcq" && (
                  <div className="space-y-2">
                    <label className="block text-sm text-slate-300">Options</label>
                    {["A", "B", "C", "D"].map((letter, idx) => (
                      <div key={letter} className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
                        >
                          {letter}
                        </span>
                        <input
                          {...register(`option_${letter.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d")}
                          placeholder={`Option ${letter}`}
                          className="flex-1 px-3 py-2 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Correct Answer (index)</label>
                    {watchedType === "true_false" ? (
                      <select {...register("correct_answer")}
                        className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                        style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <option value="0" className="bg-slate-900">True (0)</option>
                        <option value="1" className="bg-slate-900">False (1)</option>
                      </select>
                    ) : (
                      <select {...register("correct_answer")}
                        className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                        style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <option value="0" className="bg-slate-900">A (0)</option>
                        <option value="1" className="bg-slate-900">B (1)</option>
                        <option value="2" className="bg-slate-900">C (2)</option>
                        <option value="3" className="bg-slate-900">D (3)</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Marks</label>
                    <input {...register("marks", { valueAsNumber: true })} type="number" min="1" max="10"
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Explanation (optional)</label>
                  <textarea {...register("explanation")} rows={2} placeholder="Explain the correct answer..."
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
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editQ ? "Update" : "Add Question"}
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
