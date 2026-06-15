"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type Form = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error, data: authData } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
      if (error) throw error;

      // Check role from public.users table (more reliable than JWT metadata)
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      const role = profile?.role || authData.user?.user_metadata?.role;
      if (role !== "admin" && role !== "super_admin") {
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin credentials required.");
      }
      toast.success("Welcome, Admin!");
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #060410 0%, #0a0814 50%, #060d1f 100%)" }}
    >
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div
          className="rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
          }}
        >
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-black text-white mb-1">Admin Login</h1>
            <p className="text-slate-400 text-sm">Exit Exam Ethiopia Administration</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Admin Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="admin@exitexam.et"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: errors.email ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  placeholder="Admin password"
                  className="w-full px-4 py-3 pr-10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: errors.password ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In as Admin"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
