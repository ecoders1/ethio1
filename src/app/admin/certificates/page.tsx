"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Download, Search, RefreshCw, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Certificate } from "@/lib/types";

interface CertWithRelations extends Certificate {
  users?: { full_name: string; email: string };
  exams?: { title: string; department_id: string };
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => { loadCertificates(); }, []);

  async function loadCertificates() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("certificates")
      .select("*, users(full_name, email), exams(title, department_id)")
      .order("issued_at", { ascending: false });
    setCertificates(data || []);
    setLoading(false);
  }

  const handleGenerateMissing = async () => {
    setGenerating(true);
    try {
      const supabase = createClient();
      // Fetch all passed results that don't have certificates
      const { data: passedResults } = await supabase
        .from("results")
        .select("id, user_id, exam_id, percentage")
        .eq("passed", true);

      if (!passedResults || passedResults.length === 0) {
        toast("No eligible results found");
        setGenerating(false);
        return;
      }

      const existingCertExamUserPairs = new Set(
        certificates.map(c => `${c.user_id}:${c.exam_id}`)
      );

      const newCerts = passedResults
        .filter(r => !existingCertExamUserPairs.has(`${r.user_id}:${r.exam_id}`))
        .map(r => ({
          user_id: r.user_id,
          exam_id: r.exam_id,
          certificate_number: `EEE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          score: r.percentage,
          issued_at: new Date().toISOString(),
        }));

      if (newCerts.length === 0) {
        toast("All certificates already generated!");
        setGenerating(false);
        return;
      }

      await supabase.from("certificates").insert(newCerts);
      toast.success(`Generated ${newCerts.length} certificates!`);
      loadCertificates();
    } catch (err) {
      toast.error("Failed to generate certificates");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (cert: CertWithRelations) => {
    // Simple text-based certificate download
    const content = `
EXIT EXAM ETHIOPIA
CERTIFICATE OF COMPLETION
===================================
Certificate Number: ${cert.certificate_number}
Student Name: ${cert.users?.full_name || "Student"}
Exam: ${cert.exams?.title || "Exit Exam"}
Score: ${cert.score}%
Issued Date: ${formatDate(cert.issued_at)}
===================================
This certificate is issued to confirm successful completion.
    `.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${cert.certificate_number}.txt`;
    a.click();
    toast.success("Certificate downloaded!");
  };

  const filtered = certificates.filter(c =>
    (c.users?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.certificate_number || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Certificates</h1>
          <p className="text-slate-400 text-sm">{certificates.length} issued certificates</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadCertificates}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/5">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleGenerateMissing}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
          >
            {generating ? "Generating..." : "🎓 Generate Missing"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Certificates", value: certificates.length, emoji: "🏆", color: "rgba(245,158,11,0.15)" },
          { label: "This Month", value: certificates.filter(c => new Date(c.issued_at).getMonth() === new Date().getMonth()).length, emoji: "📅", color: "rgba(124,58,237,0.15)" },
          { label: "Verified", value: certificates.length, emoji: "✅", color: "rgba(16,185,129,0.15)" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl" style={{ background: s.color, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by student name or certificate number..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No certificates found</p>
          <p className="text-slate-500 text-sm">Certificates are auto-generated when students pass exams</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-5 rounded-2xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,191,36,0.05))",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 text-8xl opacity-5">🏆</div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: "rgba(245,158,11,0.2)" }}>
                      🏅
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{cert.users?.full_name || "Student"}</p>
                      <p className="text-slate-400 text-xs">{cert.users?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                </div>

                <p className="text-yellow-300 text-sm font-medium mb-1">{cert.exams?.title || "Exit Exam"}</p>
                <p className="text-slate-500 text-xs mb-1">Score: <span className="text-white font-bold">{cert.score}%</span></p>
                <p className="text-slate-600 text-xs font-mono">{cert.certificate_number}</p>
                <p className="text-slate-500 text-xs mt-1">Issued: {formatDate(cert.issued_at)}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleDownload(cert)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-yellow-300"
                    style={{ background: "rgba(245,158,11,0.2)" }}
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(cert.certificate_number); toast.success("Certificate number copied!"); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-white/10"
                  >
                    Copy ID
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
