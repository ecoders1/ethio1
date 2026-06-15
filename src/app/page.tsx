"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => router.push("/welcome"), 600);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0f0a1e 0%, #1a0a3e 30%, #0a1628 60%, #060d1f 100%)",
          }}
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
                x: [0, -20, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />

            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), 
                  linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white/20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative"
            >
              <div
                className="w-32 h-32 rounded-3xl flex items-center justify-center animate-pulse-glow"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                  boxShadow:
                    "0 0 60px rgba(124, 58, 237, 0.6), 0 0 120px rgba(59, 130, 246, 0.3)",
                }}
              >
                <span className="text-7xl">🎓</span>
              </div>
              {/* Ring animation */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-purple-400/50"
                animate={{ scale: [1, 1.3], opacity: [0.7, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-3xl border border-blue-400/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.5,
                }}
              />
            </motion.div>

            {/* App name */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center"
            >
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3"
                style={{
                  background: "linear-gradient(135deg, #a78bfa, #60a5fa, #a78bfa)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "gradientShift 3s linear infinite",
                }}
              >
                EXIT EXAM
              </h1>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-widest">
                ETHIOPIA
              </h2>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-lg md:text-xl text-slate-300 font-light tracking-wider text-center"
            >
              Prepare Today, Succeed Tomorrow
            </motion.p>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="w-64 md:w-80"
            >
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #7c3aed, #3b82f6)",
                    width: `${progress}%`,
                    transition: "width 0.05s linear",
                    boxShadow: "0 0 10px rgba(124, 58, 237, 0.8)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-slate-500">Loading...</span>
                <span className="text-xs text-purple-400 font-medium">{progress}%</span>
              </div>
            </motion.div>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex items-center gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-purple-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Bottom text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 text-center"
          >
            <p className="text-slate-600 text-xs">
              Ethiopia&apos;s Premier Exit Exam Platform
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
