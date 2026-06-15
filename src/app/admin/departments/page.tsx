"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, Loader2, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2),
  icon: z.string().min(1),
  category: z.string().min(1),
  color: z.string().min(1),
  description: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const CATEGORIES = ["Technology", "Health Sciences", "Business", "Engineering", "Natural Sciences", "Social Sciences"];
const ICONS = ["💻", "🖥️", "⚙️", "📊", "🔒", "📈", "🏥", "👶", "💊", "⚕️", "🌍", "💰", "📉", "📋", "📣", "🏢", "🏗️", "⚡", "🏛️", "🌾", "⚖️"];

interface Dept {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState<Dept | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { icon: "📚", category: "Technology", color: "from-violet-500 to-purple-600" },
  });

  useEffect(() => { loadDepartments(); }, []);

  async function loadDepartments() {
    const supabase = createClient();
    const { data } = await supabase.from("departments").select("*").order("name");
    // If DB empty, show seeded data
    if (!data || data.length === 0) {
      setDepartments(DEPARTMENTS.map((d, i) => ({
        ...d,
        is_active: true,
        created_at: new Date().toISOString(),
      })));
    } else {
      setDepartments(data);
    }
    setLoading(false);
  }

  function openCreate() {
    setEditDept(null);
    reset({ icon: "📚", category: "Technology", color: "from-violet-500 to-purple-600" });
    setShowModal(true);
  }

  function openEdit(dept: Dept) {
    setEditDept(dept);
    reset({ name: dept.name, icon: dept.icon, category: dept.category, color: dept.color, description: dept.description });
    setShowModal(true);
  }

  const onSubmit = async (data: Form) => {
    setSaving(true);
    try {
      const supabase = createClient();
      if (editDept) {
        await supabase.from("departments").update({ ...data }).eq("id", editDept.id);
        toast.success("Department updated!");
      } else {
        await supabase.from("departments").insert({ ...data, is_active: true });
        toast.success("Department created!");
      }
      setShowModal(false);
      loadDepartments();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    const supabase = createClient();
    await supabase.from("departments").delete().eq("id", id);
    toast.success("Deleted");
    loadDepartments();
  };

  const handleToggle = async (id: string, active: boolean) => {
    const supabase = createClient();
    await supabase.from("departments").update({ is_active: !active }).eq("id", id);
    loadDepartments();
  };

  return (
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Departments</h1>
          <p className="text-slate-400 text-sm">{departments.length} departments</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))
        ) : (
          departments.map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 rounded-2xl relative"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${dept.color}`}>
                  {dept.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{dept.name}</h3>
                  <p className="text-slate-500 text-xs">{dept.category}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleToggle(dept.id, dept.is_active)}
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={dept.is_active
                    ? { background: "rgba(16,185,129,0.15)", color: "#34d399" }
                    : { background: "rgba(239,68,68,0.15)", color: "#f87171" }
                  }
                >
                  {dept.is_active ? "Active" : "Inactive"}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/15">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(dept.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-3xl p-6"
              style={{ background: "#13111f", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-black text-xl flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  {editDept ? "Edit Department" : "Add Department"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Name</label>
                  <input {...register("name")} placeholder="e.g. Computer Science"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "rgba(255,255,255,0.06)", border: errors.name ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)" }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Icon</label>
                    <select {...register("icon")}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {ICONS.map(ic => <option key={ic} value={ic} className="bg-slate-900">{ic}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Category</label>
                    <select {...register("category")}
                      className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Color</label>
                  <select {...register("color")}
                    className="w-full px-3 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {[
                      "from-violet-500 to-purple-600",
                      "from-blue-500 to-cyan-600",
                      "from-emerald-500 to-teal-600",
                      "from-orange-500 to-amber-600",
                      "from-pink-500 to-rose-600",
                      "from-indigo-500 to-blue-600",
                      "from-red-500 to-rose-600",
                      "from-yellow-500 to-amber-600",
                    ].map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Description</label>
                  <textarea {...register("description")} rows={2} placeholder="Optional description..."
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
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editDept ? "Update" : "Create"}
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
