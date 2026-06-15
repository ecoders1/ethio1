"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { STATS } from "@/lib/constants";

export default function WelcomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden dark:bg-[#0a0a14] bg-slate-50">
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

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              <span className="text-xl">🎓</span>
            </div>
            <span className="font-bold text-lg dark:text-white text-slate-800">
              Exit Exam Ethiopia
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="px-4 py-2 rounded-xl text-sm font-medium dark:text-slate-300 text-slate-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/25"
              style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
            >
              Get Started
            </Link>
          </div>
        </motion.div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
              style={{
                background: "rgba(124, 58, 237, 0.1)",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                color: "#a78bfa",
              }}
            >
              <Trophy className="w-4 h-4" />
              Ethiopia&apos;s #1 Exit Exam Platform
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 dark:text-white text-slate-900">
              Welcome to{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Ethiopia Exit Exam
              </span>{" "}
              Preparation Platform
            </h1>

            <p className="text-lg dark:text-slate-400 text-slate-600 mb-8 leading-relaxed">
              Master your university exit exam with thousands of practice questions,
              timed mock exams, and detailed performance analytics — covering all
              22+ departments.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/auth/signup"
                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30"
                style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/signin"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold dark:text-white text-slate-800 dark:border-white/10 border-slate-200 border hover:dark:bg-white/5 hover:bg-slate-100 transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Right: Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="glass-card rounded-3xl p-8 text-center dark:bg-white/5 bg-white shadow-xl"
              >
                <div className="text-8xl mb-4">👨‍🎓</div>
                <div className="text-6xl mb-4">👩‍🎓</div>
                <p className="dark:text-slate-300 text-slate-600 font-medium">
                  Join 50,000+ students preparing for success
                </p>
              </motion.div>

              <motion.div
                animate={{ x: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -left-6 glass-card rounded-2xl p-4 dark:bg-purple-900/40 bg-white shadow-lg border dark:border-purple-700/30 border-purple-100"
              >
                <div className="text-2xl mb-1">📊</div>
                <p className="text-xs dark:text-purple-300 text-purple-700 font-semibold">Track Progress</p>
                <p className="text-xs dark:text-slate-400 text-slate-500">Real-time analytics</p>
              </motion.div>

              <motion.div
                animate={{ x: [5, -5, 5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -right-6 glass-card rounded-2xl p-4 dark:bg-blue-900/40 bg-white shadow-lg border dark:border-blue-700/30 border-blue-100"
              >
                <div className="text-2xl mb-1">🏆</div>
                <p className="text-xs dark:text-blue-300 text-blue-700 font-semibold">94% Pass Rate</p>
                <p className="text-xs dark:text-slate-400 text-slate-500">Among our students</p>
              </motion.div>

              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/2 -right-8 glass-card rounded-2xl p-4 dark:bg-emerald-900/40 bg-white shadow-lg border dark:border-emerald-700/30 border-emerald-100"
              >
                <div className="text-2xl mb-1">✅</div>
                <p className="text-xs dark:text-emerald-300 text-emerald-700 font-semibold">100K+ Questions</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="text-center p-6 rounded-2xl dark:bg-white/5 bg-white shadow-sm border dark:border-white/10 border-slate-100"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-black dark:text-white text-slate-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm dark:text-slate-400 text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center py-6 border-t dark:border-white/10 border-slate-100"
        >
          <p className="text-sm dark:text-slate-500 text-slate-400">
            © 2026 Exit Exam Ethiopia. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
