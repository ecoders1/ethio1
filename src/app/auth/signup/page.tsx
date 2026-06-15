"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/constants";

const signupSchema = z
  .object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^[+\d\s-]+$/, "Invalid phone number"),
    university: z.string().min(2, "University name is required"),
    student_id: z.string().min(3, "Student ID is required"),
    department_id: z.string().min(1, "Please select a department"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone,
            university: data.university,
            student_id: data.student_id,
            department_id: data.department_id,
            role: "student",
          },
        },
      });
      if (error) throw error;
      toast.success("Account created! Please check your email to verify.");
      router.push("/auth/signin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0f0a1e 0%, #1a0a3e 30%, #0a1628 60%, #060d1f 100%)",
      }}
    >
      {/* BG orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Card */}
        <div
          className="rounded-3xl p-8 md:p-10"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Back link */}
          <Link
            href="/welcome"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Welcome
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              <span className="text-3xl">🎓</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Create Account</h1>
            <p className="text-slate-400 text-sm">
              Join Ethiopia&apos;s #1 Exit Exam Platform
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  {...register("full_name")}
                  placeholder="Abebe Girma"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: errors.full_name
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                {errors.full_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="student@university.edu.et"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: errors.email
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  {...register("phone")}
                  placeholder="+251 9XX XXX XXX"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: errors.phone
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* University */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  University
                </label>
                <input
                  {...register("university")}
                  placeholder="Addis Ababa University"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: errors.university
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                {errors.university && (
                  <p className="text-red-400 text-xs mt-1">{errors.university.message}</p>
                )}
              </div>

              {/* Student ID */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Student ID
                </label>
                <input
                  {...register("student_id")}
                  placeholder="UGR/XXXX/XX"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: errors.student_id
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                {errors.student_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.student_id.message}</p>
                )}
              </div>

              {/* Department */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Department
                </label>
                <select
                  {...register("department_id")}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
                  style={{
                    background: "rgba(20,15,40,0.9)",
                    border: errors.department_id
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <option value="" className="bg-slate-900">Select Department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id} className="bg-slate-900">
                      {d.icon} {d.name}
                    </option>
                  ))}
                </select>
                {errors.department_id && (
                  <p className="text-red-400 text-xs mt-1">{errors.department_id.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    className="w-full px-4 py-3 pr-10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: errors.password
                        ? "1px solid rgba(239,68,68,0.5)"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register("confirm_password")}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 pr-10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: errors.confirm_password
                        ? "1px solid rgba(239,68,68,0.5)"
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
