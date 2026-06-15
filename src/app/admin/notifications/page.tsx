"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Bell, X, Loader2, Send, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Notification } from "@/lib/types";

const schema = z.object({
  title: z.string().min(2, "Title required"),
  message: z.string().min(5, "Message required"),
  type: z.enum(["exam_alert", "result", "department", "general"]),
  target: z.enum(["all", "specific"]),
  user_id: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const TYPE_COLORS: Record<string, { bg: string; color: string; emoji: string }> = {
  exam_alert: { bg: "rgba(239,68,68,0.15)", color: "#f87171", emoji: "🚨" },
  result: { bg: "rgba(16,185,129,0.15)", color: "#34d399", emoji: "📊" },
  department: { bg: "rgba(59,130,246,0.15)", color: "#60a5fa", emoji: "🏛️" },
  general: { bg: "rgba(124,58,237,0.15)", color: "#a78bfa", emoji: "📢" },
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { type: "general", target: "all" },
  });

  const watchedTarget = watch("target");

  useEffect(() => { loadNotifications(); }, []);

  async function loadNotifications() {
    const supabase = createClient();
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
    setNotifications(data || []);
    setLoading(false);
  }

  const onSubmit = async (data: Form) => {
    setSending(true);
    try {
      const supabase = createClient();
      await supabase.from("notifications").insert({
        title: data.title,
        message: data.message,
        type: data.type,
        user_id: data.target === "specific" ? data.user_id : null,
        is_read: false,
      });
      toast.success("Notification sent!");
      setShowModal(false);
      reset();
      loadNotifications();
    } catch { toast.error("Failed to send notification"); }
    finally { setSending(false); }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("notifications").delete().eq("id", id);
    toast.success("Deleted");
    loadNotifications();
  };

  const filtered = notifications.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Notifications</h1>
          <p className="text-slate-400 text-sm">{notifications.length} notifications sent</p>
        </div>
        <button
          onClick={() => { reset(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          <Plus className="w-4 h-4" /> Send Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { type: "exam_alert", label: "Exam Alerts" },
          { type: "result", label: "Results" },
          { type: "department", label: "Department" },
          { type: "general", label: "General" },
        ].map(({ type, label }) => {
          const count = notifications.filter(n => n.type === type).length;
          const style = TYPE_COLORS[type];
          return (
            <div key={type} className="p-4 rounded-2xl" style={{ background: style.bg, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-2xl mb-1">{style.emoji}</div>
              <div className="text-xl font-black text-white">{count}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notifications..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No notifications yet</p>
          </div>
        ) : (
          filtered.map((n, i) => {
            const style = TYPE_COLORS[n.type] || TYPE_COLORS.general;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 rounded-2xl flex items-start gap-3"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: style.bg }}
                >
                  {style.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white font-bold text-sm">{n.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: style.bg, color: style.color }}>
                      {n.type.replace("_", " ")}
                    </span>
                    <span className="text-xs text-slate-500">
                      {n.user_id ? "Specific user" : "All users"}
                    </span>
                    <span className="text-xs text-slate-600">{formatDate(n.created_at)}</span>
                  </div>
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
                  <Send className="w-5 h-5 text-purple-400" /> Send Notification
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Title</label>
                  <input {...register("title")} placeholder="Notification title"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "rgba(255,255,255,0.06)", border: errors.title ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)" }} />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Message</label>
                  <textarea {...register("message")} rows={3} placeholder="Write your notification message..."
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: errors.message ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)" }} />
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Type</label>
                    <select {...register("type")}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <option value="general" className="bg-slate-900">📢 General</option>
                      <option value="exam_alert" className="bg-slate-900">🚨 Exam Alert</option>
                      <option value="result" className="bg-slate-900">📊 Result</option>
                      <option value="department" className="bg-slate-900">🏛️ Department</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Target</label>
                    <select {...register("target")}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <option value="all" className="bg-slate-900">All Users</option>
                      <option value="specific" className="bg-slate-900">Specific User</option>
                    </select>
                  </div>
                </div>

                {watchedTarget === "specific" && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">User ID</label>
                    <input {...register("user_id")} placeholder="User UUID..."
                      className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl text-slate-300 font-medium text-sm border border-white/10">
                    Cancel
                  </button>
                  <button type="submit" disabled={sending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                    {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send</>}
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
