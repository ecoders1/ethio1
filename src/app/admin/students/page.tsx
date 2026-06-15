"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, UserX, RefreshCw, Trash2, KeyRound, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { getInitials, formatDate } from "@/lib/utils";
import { DEPARTMENTS } from "@/lib/constants";
import type { User } from "@/lib/types";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadStudents(); }, []);

  async function loadStudents() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("users").select("*").eq("role", "student").order("created_at", { ascending: false });
    setStudents(data || []);
    setLoading(false);
  }

  const handleBlock = async (id: string, blocked: boolean) => {
    const supabase = createClient();
    await supabase.from("users").update({ is_blocked: !blocked }).eq("id", id);
    toast.success(!blocked ? "Student blocked" : "Student unblocked");
    loadStudents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student permanently?")) return;
    const supabase = createClient();
    await supabase.from("users").delete().eq("id", id);
    toast.success("Student deleted");
    loadStudents();
  };

  const handleResetPassword = async (email: string) => {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` });
    toast.success("Password reset email sent");
  };

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(search.toLowerCase())
  );

  const getDept = (id?: string) => DEPARTMENTS.find(d => d.id === id);

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Students</h1>
          <p className="text-slate-400 text-sm">{students.length} total students</p>
        </div>
        <button onClick={loadStudents} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or student ID..."
          className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Student", "Email", "Department", "Joined", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No students found</td></tr>
              ) : (
                filtered.map((s, i) => {
                  const dept = getDept(s.department_id);
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                          >
                            {getInitials(s.full_name || "")}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{s.full_name}</p>
                            <p className="text-slate-500 text-xs">{s.student_id || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{s.email}</td>
                      <td className="px-4 py-3">
                        {dept ? (
                          <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa" }}>
                            {dept.icon} {dept.name}
                          </span>
                        ) : <span className="text-slate-500 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(s.created_at)}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={s.is_blocked
                            ? { background: "rgba(239,68,68,0.15)", color: "#f87171" }
                            : { background: "rgba(16,185,129,0.15)", color: "#34d399" }
                          }
                        >
                          {s.is_blocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => toast("Edit coming soon")} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleBlock(s.id, s.is_blocked)} className="p-1.5 rounded-lg transition-all" title={s.is_blocked ? "Unblock" : "Block"}
                            style={{ color: s.is_blocked ? "#34d399" : "#fbbf24" }}>
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleResetPassword(s.email)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all" title="Reset Password">
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
