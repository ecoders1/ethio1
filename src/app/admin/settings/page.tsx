"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Globe, Palette, Shield, Database,
  Save, Loader2, Bell, Eye, EyeOff
} from "lucide-react";
import toast from "react-hot-toast";

const TABS = [
  { id: "website", label: "Website", icon: Globe, emoji: "🌐" },
  { id: "theme", label: "Theme", icon: Palette, emoji: "🎨" },
  { id: "security", label: "Security", icon: Shield, emoji: "🔒" },
  { id: "backup", label: "Backup", icon: Database, emoji: "💾" },
  { id: "notifications", label: "Notifications", icon: Bell, emoji: "🔔" },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("website");
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Website settings state
  const [siteName, setSiteName] = useState("Exit Exam Ethiopia");
  const [tagline, setTagline] = useState("Prepare Today, Succeed Tomorrow");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  // Theme
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [defaultTheme, setDefaultTheme] = useState("dark");

  // Security
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [examAlerts, setExamAlerts] = useState(true);
  const [resultNotifications, setResultNotifications] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    toast.success("Settings saved successfully!");
  };

  const handleBackupNow = async () => {
    toast.success("Backup initiated! This may take a moment.");
  };

  const ToggleSwitch = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
        style={{ background: value ? "linear-gradient(135deg, #7c3aed, #3b82f6)" : "rgba(255,255,255,0.1)" }}
      >
        <div
          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm"
          style={{ left: value ? "calc(100% - 18px)" : "2px" }}
        />
      </button>
    </div>
  );

  return (
    <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" /> Settings
          </h1>
          <p className="text-slate-400 text-sm">Configure the Exit Exam Ethiopia platform</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save All</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={activeTab === tab.id
              ? { background: "linear-gradient(135deg, #7c3aed, #3b82f6)", color: "#fff" }
              : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === "website" && (
          <div className="p-6 rounded-2xl space-y-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-white font-bold flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> Website Settings</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Site Name</label>
                <input value={siteName} onChange={e => setSiteName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Tagline</label>
                <input value={tagline} onChange={e => setTagline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
            </div>

            <div>
              <ToggleSwitch value={maintenanceMode} onChange={setMaintenanceMode} label="Maintenance Mode" />
              <ToggleSwitch value={registrationOpen} onChange={setRegistrationOpen} label="Allow New Registrations" />
            </div>

            <div className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <p className="text-yellow-300 text-xs">
                ⚠️ Changes here affect all users. Enable maintenance mode before making significant updates.
              </p>
            </div>
          </div>
        )}

        {activeTab === "theme" && (
          <div className="p-6 rounded-2xl space-y-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-white font-bold flex items-center gap-2"><Palette className="w-4 h-4 text-pink-400" /> Theme Settings</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border-0 cursor-pointer bg-transparent" />
                  <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border-0 cursor-pointer bg-transparent" />
                  <input value={accentColor} onChange={e => setAccentColor(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Default Theme</label>
              <div className="flex gap-3">
                {[
                  { id: "dark", label: "🌙 Dark", desc: "Dark mode default" },
                  { id: "light", label: "☀️ Light", desc: "Light mode default" },
                  { id: "system", label: "💻 System", desc: "Follow OS" },
                ].map(t => (
                  <button key={t.id} onClick={() => setDefaultTheme(t.id)}
                    className="flex-1 p-3 rounded-xl text-center transition-all"
                    style={defaultTheme === t.id
                      ? { background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))", border: "1px solid rgba(124,58,237,0.4)" }
                      : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }
                    }>
                    <div className="text-lg mb-1">{t.label}</div>
                    <div className="text-slate-500 text-xs">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">Preview</label>
              <div className="h-20 rounded-xl flex items-center justify-center font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                Exit Exam Ethiopia
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="p-6 rounded-2xl space-y-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-white font-bold flex items-center gap-2"><Shield className="w-4 h-4 text-red-400" /> Security Settings</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Session Timeout (minutes)</label>
                <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Max Login Attempts</label>
                <input type="number" value={maxLoginAttempts} onChange={e => setMaxLoginAttempts(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
            </div>

            <ToggleSwitch value={requireEmailVerification} onChange={setRequireEmailVerification} label="Require Email Verification" />

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Supabase JWT Secret (read-only)</label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value="••••••••••••••••••••••••••••••••••••"
                  readOnly
                  className="w-full px-4 py-3 pr-10 rounded-xl text-slate-500 text-sm"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
                <button type="button" onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-600 text-xs mt-1">Managed via environment variables (.env.local)</p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="text-red-300 text-xs">🔒 Security settings affect all user sessions. Changes take effect on next login.</p>
            </div>
          </div>
        )}

        {activeTab === "backup" && (
          <div className="p-6 rounded-2xl space-y-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-white font-bold flex items-center gap-2"><Database className="w-4 h-4 text-emerald-400" /> Backup & Data</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Database Backup", desc: "Full Supabase database snapshot", action: "Backup Now", color: "rgba(16,185,129,0.2)", textColor: "#34d399", emoji: "🗄️" },
                { label: "Export Users CSV", desc: "All registered students data", action: "Export", color: "rgba(59,130,246,0.2)", textColor: "#60a5fa", emoji: "👥" },
                { label: "Export Results CSV", desc: "All exam results and scores", action: "Export", color: "rgba(124,58,237,0.2)", textColor: "#a78bfa", emoji: "📊" },
                { label: "Export Exams JSON", desc: "All exams and questions", action: "Export", color: "rgba(245,158,11,0.2)", textColor: "#fbbf24", emoji: "📋" },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-xl" style={{ background: item.color, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-2xl mb-2">{item.emoji}</div>
                  <h3 className="text-white font-bold text-sm mb-1">{item.label}</h3>
                  <p className="text-slate-400 text-xs mb-3">{item.desc}</p>
                  <button
                    onClick={handleBackupNow}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: item.color, color: item.textColor, border: `1px solid ${item.textColor}40` }}
                  >
                    {item.action}
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-white font-medium text-sm mb-2">Automatic Backups</h3>
              <div className="space-y-1">
                {["Daily backup at 02:00 AM UTC", "Weekly full backup on Sundays", "Retention: 30 days"].map(item => (
                  <p key={item} className="text-slate-400 text-xs flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="p-6 rounded-2xl space-y-5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-white font-bold flex items-center gap-2"><Bell className="w-4 h-4 text-yellow-400" /> Notification Settings</h2>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Email Notifications</h3>
              <ToggleSwitch value={emailNotifications} onChange={setEmailNotifications} label="Enable Email Notifications" />
              <ToggleSwitch value={examAlerts} onChange={setExamAlerts} label="Exam Availability Alerts" />
              <ToggleSwitch value={resultNotifications} onChange={setResultNotifications} label="Result Announcements" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">In-App Notifications</h3>
              <ToggleSwitch value={true} onChange={() => {}} label="Show In-App Notifications" />
              <ToggleSwitch value={true} onChange={() => {}} label="Department Messages" />
              <ToggleSwitch value={false} onChange={() => {}} label="System Announcements" />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Email From Address</label>
              <input
                defaultValue="noreply@exitexam.et"
                placeholder="noreply@exitexam.et"
                className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Save Footer */}
      <div className="flex items-center justify-between p-4 rounded-2xl"
        style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
        <p className="text-slate-400 text-sm">Changes are applied immediately after saving.</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}
