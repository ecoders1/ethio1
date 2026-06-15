"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, ChevronRight, BookOpen, FileText, FlaskConical } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { DEPARTMENTS, DEPARTMENT_CATEGORIES } from "@/lib/constants";

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...DEPARTMENT_CATEGORIES];

  const filtered = DEPARTMENTS.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || d.category === activeCategory;
    return matchSearch && matchCat;
  });

  const grouped = DEPARTMENT_CATEGORIES.reduce((acc, cat) => {
    if (activeCategory !== "All" && cat !== activeCategory) return acc;
    const items = filtered.filter((d) => d.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, typeof DEPARTMENTS>);

  return (
    <div className="min-h-screen">
      <TopBar userName="Student" />

      <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-white mb-1">Departments</h1>
          <p className="text-slate-400 text-sm">Select your department to access exams and study materials</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={
                activeCategory === cat
                  ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      color: "#94a3b8",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Departments by category */}
        {Object.entries(grouped).map(([cat, depts], gi) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + gi * 0.05 }}
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
              {cat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {depts.map((dept, i) => (
                <motion.div
                  key={dept.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + gi * 0.05 + i * 0.03 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="group"
                >
                  <Link href={`/departments/${dept.id}`}>
                    <div
                      className="p-4 rounded-2xl cursor-pointer transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {/* Icon row */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${dept.color}`}
                        >
                          <span className="text-2xl">{dept.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-sm leading-tight">{dept.name}</h3>
                          <p className="text-slate-500 text-xs mt-0.5">{dept.category}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                      </div>

                      {/* Quick links */}
                      <div className="flex gap-2">
                        {[
                          { label: "Practice", icon: BookOpen },
                          { label: "Mock", icon: FlaskConical },
                          { label: "Previous", icon: FileText },
                        ].map(({ label, icon: Icon }) => (
                          <div
                            key={label}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                          >
                            <Icon className="w-3 h-3" />
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-400">No departments found for &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
