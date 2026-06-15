"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Mail, Phone, Building2, Hash, Edit3, Lock,
  LogOut, Camera, ChevronRight, Award, Download
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { DEPARTMENTS } from "@/lib/constants";
import { getInitials, formatDate } from "@/lib/utils";
import type { User as UserType, ExamResult } from "@/lib/types";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  university: z.string().optional(),
  department_id: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(1, "Required"),
  new_password: z.string().min(8, "Min 8 characters"),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, { message: "Passwords don't match", path: ["confirm_password"] });
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push("/auth/signin"); return; }

    const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single();
    if (profile) {
      setUser(profile);
      profileForm.reset({
        full_name: profile.full_name,
        phone: profile.phone,
        university: profile.university,
        department_id: profile.department_id,
      });
    }

    const { data: examResults } = await supabase
      .from("results")
      .select("*, exams(title)")
      .eq("user_id", authUser.id)
      .order("completed_at", { ascending: false });
    setResults(examResults || []);
  }

  const handleProfileUpdate = async (data: ProfileForm) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      await supabase.from("users").update(data).eq("id", authUser.id);
      toast.success("Profile updated!");
      setEditMode(false);
      loadUser();
    } catch {
      toast.error("Update failed");
    } finally { setLoading(false); }
  };

  const handlePasswordChange = async (data: PasswordForm) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: data.new_password });
      if (error) throw error;
      toast.success("Password changed!");
      passwordForm.reset();
    } catch {
      toast.error("Password change failed");
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/welcome");
  };

  const dept = DEPARTMENTS.find((d) => d.id === user?.department_id);

  return (
    <div className="min-h-screen">
      <TopBar userName={user?.full_name || "Student"} avatarUrl={user?.avatar_url} />
      <div className="px-4 md:px-6 py-6 max-w-3xl mx-auto space-y-6">
        {/* Profile Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-6 rounded-3xl text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.3))",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          <div className="relative inline-block mb-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                getInitials(user?.full_name || "ST")
              )}
            </div>
            <button
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <h2 className="text-xl font-black text-white">{user?.full_name || "Student"}</h2>
          <p className="text-slate-300 text-sm">{user?.email}</p>
          {dept && (
            <span
              className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: "rgba(255,255,255,0.1)", color: "#e2e8f0" }}
            >
              {dept.icon} {dept.name}
            </span>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Exams Taken", value: results.length },
              { label: "Avg Score", value: results.length ? `${Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length)}%` : "—" },
              { label: "Passed", value: results.filter(r => r.passed).length },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="text-lg font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-300">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: "profile", label: "Profile", emoji: "👤" },
            { id: "security", label: "Security", emoji: "🔒" },
            { id: "history", label: "History", emoji: "📋" },
            { id: "certificates", label: "Certificates", emoji: "🏆" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={
                activeTab === tab.id
                  ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === "profile" && (
            <div
              className="rounded-2xl p-6 space-y-4"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold">Personal Information</h3>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={editMode
                    ? { background: "rgba(239,68,68,0.2)", color: "#f87171" }
                    : { background: "rgba(124,58,237,0.2)", color: "#a78bfa" }
                  }
                >
                  <Edit3 className="w-3.5 h-3.5" /> {editMode ? "Cancel" : "Edit"}
                </button>
              </div>

              {editMode ? (
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                  {[
                    { field: "full_name" as const, label: "Full Name", placeholder: "Your name", icon: User },
                    { field: "phone" as const, label: "Phone", placeholder: "+251 9XX XXX XXX", icon: Phone },
                    { field: "university" as const, label: "University", placeholder: "Your university", icon: Building2 },
                  ].map(({ field, label, placeholder, icon: Icon }) => (
                    <div key={field}>
                      <label className="block text-sm text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </label>
                      <input
                        {...profileForm.register(field)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Department
                    </label>
                    <select
                      {...profileForm.register("department_id")}
                      className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: "rgba(20,15,40,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id} className="bg-slate-900">{d.icon} {d.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Full Name", value: user?.full_name, icon: User },
                    { label: "Email", value: user?.email, icon: Mail },
                    { label: "Phone", value: user?.phone || "Not set", icon: Phone },
                    { label: "University", value: user?.university || "Not set", icon: Building2 },
                    { label: "Student ID", value: user?.student_id || "Not set", icon: Hash },
                    { label: "Department", value: dept?.name || user?.department_id || "Not set", icon: Building2 },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3 py-2">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(124,58,237,0.15)" }}
                      >
                        <Icon className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="text-white text-sm font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div
              className="rounded-2xl p-6 space-y-4"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-purple-400" /> Change Password
              </h3>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                {[
                  { field: "current_password" as const, label: "Current Password", placeholder: "Current password" },
                  { field: "new_password" as const, label: "New Password", placeholder: "New password (min 8 chars)" },
                  { field: "confirm_password" as const, label: "Confirm New Password", placeholder: "Repeat new password" },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm text-slate-300 mb-1.5">{label}</label>
                    <input
                      {...passwordForm.register(field)}
                      type="password"
                      placeholder={placeholder}
                      className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                    {passwordForm.formState.errors[field] && (
                      <p className="text-red-400 text-xs mt-1">{passwordForm.formState.errors[field]?.message}</p>
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </form>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h3 className="text-white font-bold mb-4">Exam History</h3>
              {results.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-slate-400 text-sm">No exam history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ background: r.passed ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}
                        >
                          <span className="text-sm">{r.passed ? "✅" : "❌"}</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium truncate max-w-[160px]">
                            {(r as ExamResult & { exams?: { title: string } }).exams?.title || "Exam"}
                          </p>
                          <p className="text-slate-500 text-xs">{formatDate(r.completed_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white text-sm">{r.percentage}%</p>
                        <p className={`text-xs ${r.passed ? "text-emerald-400" : "text-red-400"}`}>
                          {r.passed ? "Passed" : "Failed"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "certificates" && (
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" /> Certificates
              </h3>
              {results.filter(r => r.passed).length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">🏆</div>
                  <p className="text-slate-400 text-sm">Pass an exam to earn certificates</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.filter(r => r.passed).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏅</span>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {(r as ExamResult & { exams?: { title: string } }).exams?.title || "Exam"}
                          </p>
                          <p className="text-yellow-400 text-xs">Score: {r.percentage}%</p>
                        </div>
                      </div>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-yellow-300"
                        style={{ background: "rgba(234,179,8,0.2)" }}
                        onClick={() => toast.success("Certificate download coming soon!")}
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Quick links */}
        <div className="space-y-2">
          {[
            { label: "View All Results", href: "/results", icon: ChevronRight },
            { label: "Browse Exams", href: "/exams", icon: ChevronRight },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between p-4 rounded-xl transition-all hover:bg-white/5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-slate-300 text-sm">{label}</span>
              <Icon className="w-4 h-4 text-slate-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
