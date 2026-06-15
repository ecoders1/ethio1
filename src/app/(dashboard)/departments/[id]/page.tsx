"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Target, FileText, Download } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { DEPARTMENTS } from "@/lib/constants";

const deptTabs = [
  { id: "practice", label: "Practice Questions", icon: BookOpen, emoji: "📝", color: "from-violet-500 to-purple-600" },
  { id: "mock", label: "Mock Tests", icon: Target, emoji: "🎯", color: "from-blue-500 to-cyan-600" },
  { id: "materials", label: "Study Materials", icon: Download, emoji: "📚", color: "from-emerald-500 to-teal-600" },
  { id: "previous", label: "Previous Exit Exams", icon: FileText, emoji: "📄", color: "from-orange-500 to-amber-600" },
];

interface DeptPageParams { id: string }

export default function DepartmentDetailPage({ params }: { params: Promise<DeptPageParams> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("practice");

  const dept = DEPARTMENTS.find((d) => d.id === id);
  if (!dept) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-slate-400">Department not found</p>
          <Link href="/departments" className="text-purple-400 mt-4 inline-block">← Back to Departments</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar userName="Student" />
      <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            href="/departments"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-purple-400 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Departments
          </Link>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${dept.color}`}>
              {dept.icon}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{dept.name}</h1>
              <p className="text-slate-400 text-sm">{dept.category}</p>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Exams", value: "24", emoji: "📋" },
            { label: "Questions", value: "1,200+", emoji: "❓" },
            { label: "Materials", value: "18", emoji: "📁" },
          ].map((s) => (
            <div
              key={s.label}
              className="p-4 rounded-2xl text-center"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-lg font-black text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {deptTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={
                activeTab === tab.id
                  ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      color: "#94a3b8",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {activeTab === "practice" && (
            <ContentSection
              title="Practice Questions"
              emoji="📝"
              description="Practice with hundreds of questions tailored to your department"
              items={[
                { title: "Chapter 1: Fundamentals", count: "50 questions", badge: "Easy", href: `/exams?dept=${id}&type=practice` },
                { title: "Chapter 2: Advanced Topics", count: "75 questions", badge: "Medium", href: `/exams?dept=${id}&type=practice` },
                { title: "Chapter 3: Final Prep", count: "100 questions", badge: "Hard", href: `/exams?dept=${id}&type=practice` },
              ]}
              deptId={id}
              type="practice"
            />
          )}
          {activeTab === "mock" && (
            <ContentSection
              title="Mock Tests"
              emoji="🎯"
              description="Simulate the real exit exam environment with timed mock tests"
              items={[
                { title: "Mock Exam 2024 #1", count: "100 questions", badge: "3 hours", href: `/exams?dept=${id}&type=mock` },
                { title: "Mock Exam 2024 #2", count: "100 questions", badge: "3 hours", href: `/exams?dept=${id}&type=mock` },
                { title: "Mock Exam 2023 Final", count: "100 questions", badge: "3 hours", href: `/exams?dept=${id}&type=mock` },
              ]}
              deptId={id}
              type="mock"
            />
          )}
          {activeTab === "materials" && (
            <MaterialsSection deptId={id} deptName={dept.name} />
          )}
          {activeTab === "previous" && (
            <ContentSection
              title="Previous Exit Exams"
              emoji="📄"
              description="Practice with actual past exit exam questions"
              items={[
                { title: "Exit Exam 2023", count: "100 questions", badge: "2023", href: `/exams?dept=${id}&type=previous` },
                { title: "Exit Exam 2022", count: "100 questions", badge: "2022", href: `/exams?dept=${id}&type=previous` },
                { title: "Exit Exam 2021", count: "100 questions", badge: "2021", href: `/exams?dept=${id}&type=previous` },
              ]}
              deptId={id}
              type="previous"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

function ContentSection({
  title, emoji, description, items, deptId, type
}: {
  title: string; emoji: string; description: string;
  items: { title: string; count: string; badge: string; href: string }[];
  deptId: string; type: string;
}) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">{emoji} {title}</h2>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Link key={item.title} href={item.href}>
            <div
              className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all hover:border-purple-500/40"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div>
                <h3 className="text-white font-medium text-sm">{item.title}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{item.count}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="px-2 py-1 rounded-lg text-xs font-medium"
                  style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
                >
                  {item.badge}
                </span>
                <Link
                  href={item.href}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
                >
                  Start
                </Link>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link
          href={`/exams?dept=${deptId}&type=${type}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          View All {title}
        </Link>
      </div>
    </div>
  );
}

function MaterialsSection({ deptId, deptName }: { deptId: string; deptName: string }) {
  const materials = [
    { name: `${deptName} Study Guide 2024`, type: "PDF", size: "2.4 MB", emoji: "📕" },
    { name: "Exam Preparation Notes", type: "DOCX", size: "1.1 MB", emoji: "📄" },
    { name: "Important Slides", type: "PPT", size: "5.2 MB", emoji: "📊" },
    { name: "Previous Year Questions", type: "PDF", size: "3.7 MB", emoji: "📋" },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">📚 Study Materials</h2>
        <p className="text-slate-400 text-sm">Download study materials for {deptName}</p>
      </div>
      <div className="space-y-3">
        {materials.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "rgba(124,58,237,0.2)" }}
              >
                {m.emoji}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{m.name}</p>
                <p className="text-slate-500 text-xs">{m.type} · {m.size}</p>
              </div>
            </div>
            <Link
              href={`/materials?dept=${deptId}`}
              className="p-2 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
