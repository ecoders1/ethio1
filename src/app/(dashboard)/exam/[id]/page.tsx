"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle,
  AlertTriangle, Flag, Maximize2, X
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import type { Exam, Question } from "@/lib/types";

// Demo questions for when DB is empty
const DEMO_QUESTIONS: Question[] = [
  { id: "q1", exam_id: "demo", question_text: "What is the time complexity of binary search?", question_type: "mcq", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct_answer: 1, marks: 1, order_num: 1 },
  { id: "q2", exam_id: "demo", question_text: "Which data structure uses LIFO order?", question_type: "mcq", options: ["Queue", "Stack", "Array", "Linked List"], correct_answer: 1, marks: 1, order_num: 2 },
  { id: "q3", exam_id: "demo", question_text: "A binary tree with n nodes has exactly n-1 edges.", question_type: "true_false", options: ["True", "False"], correct_answer: 0, marks: 1, order_num: 3 },
  { id: "q4", exam_id: "demo", question_text: "Which sorting algorithm has O(n log n) average time complexity?", question_type: "mcq", options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"], correct_answer: 1, marks: 1, order_num: 4 },
  { id: "q5", exam_id: "demo", question_text: "What does SQL stand for?", question_type: "mcq", options: ["Structured Query Language", "Simple Query Language", "Sequential Query Logic", "Standard Query List"], correct_answer: 0, marks: 1, order_num: 5 },
];

interface ExamPageParams { id: string }

export default function ExamPage({ params }: { params: Promise<ExamPageParams> }) {
  const { id } = use(params);
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tabSwitchCount = useRef(0);

  useEffect(() => {
    loadExam();
  }, [id]);

  async function loadExam() {
    const supabase = createClient();
    const { data: examData } = await supabase.from("exams").select("*").eq("id", id).single();

    if (examData) {
      setExam(examData);
      setTimeLeft(examData.duration_minutes * 60);
      const { data: qs } = await supabase.from("questions").select("*").eq("exam_id", id).order("order_num");
      setQuestions(qs && qs.length > 0 ? qs : DEMO_QUESTIONS);
    } else {
      // Demo mode
      const demoExam: Exam = { id, title: "Demo Exam", department_id: "cs", duration_minutes: 30, question_count: 5, passing_score: 50, is_active: true, exam_type: "practice", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setExam(demoExam);
      setTimeLeft(30 * 60);
      setQuestions(DEMO_QUESTIONS);
    }
    setLoading(false);
  }

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && started) {
        tabSwitchCount.current++;
        if (tabSwitchCount.current <= 3) {
          toast.error(`⚠️ Tab switch detected! Warning ${tabSwitchCount.current}/3`);
        } else {
          toast.error("❌ Too many tab switches. Submitting exam.");
          handleSubmit();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [started]);

  // Timer
  useEffect(() => {
    if (started && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let correct = 0;
      questions.forEach((q) => {
        const given = answers[q.id];
        if (given !== undefined && given === q.correct_answer) correct++;
      });

      const total = questions.length;
      const wrong = total - correct - (total - Object.keys(answers).length);
      const percentage = Math.round((correct / total) * 100);
      const passed = percentage >= (exam?.passing_score || 50);
      const timeTaken = (exam?.duration_minutes || 30) * 60 - timeLeft;

      if (user) {
        const { data: result } = await supabase.from("results").insert({
          user_id: user.id,
          exam_id: id,
          total_questions: total,
          correct_answers: correct,
          wrong_answers: wrong,
          score: correct,
          percentage,
          passed,
          time_taken: timeTaken,
          answers,
        }).select().single();

        if (result) {
          router.push(`/results/${result.id}`);
          return;
        }
      }

      // Fallback: go to results with query params
      const params = new URLSearchParams({
        correct: String(correct),
        total: String(total),
        percentage: String(percentage),
        passed: String(passed),
        timeTaken: String(timeTaken),
        examTitle: exam?.title || "Exam",
      });
      router.push(`/results/summary?${params}`);
    } catch (err) {
      console.error(err);
      toast.error("Submission failed. Retrying...");
      setSubmitting(false);
    }
  }, [answers, questions, exam, id, timeLeft, submitting, router]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const timePercent = exam ? (timeLeft / (exam.duration_minutes * 60)) * 100 : 100;
  const answered = Object.keys(answers).length;
  const currentQ = questions[currentIdx];

  // Security: prevent copy/paste/right-click
  const securityProps = {
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    onCopy: (e: React.ClipboardEvent) => e.preventDefault(),
    onCut: (e: React.ClipboardEvent) => e.preventDefault(),
    onPaste: (e: React.ClipboardEvent) => e.preventDefault(),
    className: "no-select",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0814, #0d0a1f)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0a0814, #0d0a1f)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl p-8 text-center"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-black text-white mb-2">{exam?.title}</h1>
          <p className="text-slate-400 text-sm mb-6">Ready to begin?</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Questions", value: questions.length, emoji: "❓" },
              { label: "Duration", value: `${exam?.duration_minutes}m`, emoji: "⏱️" },
              { label: "Pass Score", value: `${exam?.passing_score}%`, emoji: "🎯" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className="text-white font-black text-sm">{s.value}</div>
                <div className="text-slate-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="text-left mb-6 p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-red-300 text-xs font-semibold mb-2">⚠️ Exam Rules:</p>
            <ul className="text-slate-400 text-xs space-y-1">
              <li>• Do not switch tabs or minimize the window</li>
              <li>• No copying or pasting allowed</li>
              <li>• Timer starts when you click Begin</li>
              <li>• Submit before time runs out</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl text-slate-400 font-medium text-sm border border-white/10 hover:bg-white/5 transition-all"
            >
              Go Back
            </button>
            <button
              onClick={() => setStarted(true)}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              Begin Exam
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      {...securityProps}
      className={`min-h-screen flex flex-col ${fullscreen ? "fixed inset-0 z-50" : ""}`}
      style={{ background: "linear-gradient(135deg, #0a0814, #0d0a1f)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-3 flex-shrink-0"
        style={{ background: "rgba(10,8,25,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
          <div className="text-white font-bold text-sm truncate max-w-[160px] md:max-w-xs">{exam?.title}</div>
        </div>

        {/* Timer */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            background: timeLeft < 300 ? "rgba(239,68,68,0.2)" : "rgba(124,58,237,0.2)",
            border: `1px solid ${timeLeft < 300 ? "rgba(239,68,68,0.4)" : "rgba(124,58,237,0.4)"}`,
          }}
        >
          <Clock className={`w-4 h-4 ${timeLeft < 300 ? "text-red-400" : "text-purple-400"}`} />
          <span className={`font-black text-sm ${timeLeft < 300 ? "text-red-300 animate-pulse" : "text-white"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10 flex-shrink-0">
        <div
          className="h-full transition-all duration-1000"
          style={{
            width: `${timePercent}%`,
            background: timeLeft < 300 ? "#ef4444" : "linear-gradient(90deg, #7c3aed, #3b82f6)",
          }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question Navigator (desktop) */}
        <div className="hidden lg:flex flex-col w-56 flex-shrink-0 p-4 overflow-y-auto"
          style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="mb-3">
            <p className="text-xs text-slate-400 font-medium mb-1">Progress</p>
            <p className="text-white font-black text-sm">{answered}/{questions.length} answered</p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(answered / questions.length) * 100}%`, background: "linear-gradient(90deg, #7c3aed, #3b82f6)" }}
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: i === currentIdx
                    ? "linear-gradient(135deg, #7c3aed, #3b82f6)"
                    : answers[q.id] !== undefined
                    ? flagged.has(q.id) ? "rgba(234,179,8,0.3)" : "rgba(16,185,129,0.3)"
                    : "rgba(255,255,255,0.08)",
                  color: i === currentIdx ? "#fff" : answers[q.id] !== undefined ? "#fff" : "#94a3b8",
                  border: flagged.has(q.id) ? "1px solid rgba(234,179,8,0.5)" : "none",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Main Question Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {currentQ && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-2xl mx-auto"
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-lg"
                        style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
                      >
                        Question {currentIdx + 1} of {questions.length}
                      </span>
                      <span
                        className="ml-2 text-xs font-medium px-2 py-1 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
                      >
                        {currentQ.question_type === "true_false" ? "True/False" : "MCQ"}
                      </span>
                    </div>
                    <button
                      onClick={() => setFlagged(prev => {
                        const n = new Set(prev);
                        n.has(currentQ.id) ? n.delete(currentQ.id) : n.add(currentQ.id);
                        return n;
                      })}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        color: flagged.has(currentQ.id) ? "#fbbf24" : "#94a3b8",
                        background: flagged.has(currentQ.id) ? "rgba(234,179,8,0.15)" : "transparent",
                      }}
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question text */}
                  <div
                    className="p-6 rounded-2xl mb-6"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <p className="text-white text-base md:text-lg leading-relaxed font-medium">
                      {currentQ.question_text}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQ.options?.map((option, oi) => {
                      const isSelected = answers[currentQ.id] === oi;
                      return (
                        <motion.button
                          key={oi}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: oi }))}
                          className="w-full text-left p-4 rounded-xl transition-all flex items-center gap-4"
                          style={{
                            background: isSelected ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.05)",
                            border: isSelected ? "2px solid rgba(124,58,237,0.6)" : "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                            style={{
                              background: isSelected ? "linear-gradient(135deg, #7c3aed, #3b82f6)" : "rgba(255,255,255,0.08)",
                              color: isSelected ? "#fff" : "#94a3b8",
                            }}
                          >
                            {isSelected ? <CheckCircle className="w-4 h-4" /> : String.fromCharCode(65 + oi)}
                          </div>
                          <span className={`text-sm ${isSelected ? "text-white font-semibold" : "text-slate-300"}`}>
                            {option}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Navigation */}
          <div
            className="flex items-center justify-between px-4 md:px-8 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(10,8,25,0.8)" }}
          >
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-slate-400 text-sm font-medium">{currentIdx + 1}/{questions.length}</span>
            </div>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
              >
                <CheckCircle className="w-4 h-4" /> Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
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
              className="w-full max-w-sm rounded-3xl p-6 text-center"
              style={{ background: "#13111f", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-white font-black text-xl mb-2">Submit Exam?</h3>
              <p className="text-slate-400 text-sm mb-2">
                You have answered {answered} of {questions.length} questions.
              </p>
              {answered < questions.length && (
                <p className="text-yellow-400 text-xs mb-4">
                  ⚠️ {questions.length - answered} questions unanswered
                </p>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 rounded-xl text-slate-300 font-medium text-sm border border-white/10 hover:bg-white/5"
                >
                  <X className="w-4 h-4 inline mr-1" /> Continue
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-white font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  {submitting ? "Submitting..." : "✅ Submit"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
