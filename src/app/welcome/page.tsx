"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden dark:bg-[#0a0a14] bg-slate-50 flex flex-col items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 dark:opacity-100 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 20% 30%, rgba(124,58,237,0.2) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(59,130,246,0.2) 0%, transparent 60%)",
          }}
        />
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-64 h-64 opacity-20"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
            filter: "blur(20px)",
          }}
        />
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 w-48 h-48 opacity-20"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            borderRadius: "70% 30% 30% 70% / 70% 70% 30% 30%",
            filter: "blur(20px)",
          }}
        />
      </div>

      {/* Main content — centered */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex justify-center mb-6"
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              boxShadow: "0 0 40px rgba(124,58,237,0.5)",
            }}
          >
            <span className="text-5xl">🎓</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 dark:text-white text-slate-900"
        >
          EXIT EXAM{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ETHIOPIA
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl dark:text-slate-400 text-slate-600 mb-4 font-light tracking-wide"
        >
          Prepare Today, Succeed Tomorrow
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-base dark:text-slate-500 text-slate-500 mb-10"
        >
          Ethiopia&apos;s premier university exit exam preparation platform —
          covering 22+ departments with thousands of practice questions.
        </motion.p>

        {/* Single CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40"
            style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Already have account */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-sm dark:text-slate-500 text-slate-400"
        >
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Sign In
          </Link>
        </motion.p>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 text-center"
      >
        <p className="text-xs dark:text-slate-600 text-slate-400">
          © 2026 Exit Exam Ethiopia. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
