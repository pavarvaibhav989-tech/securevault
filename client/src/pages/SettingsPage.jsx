import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  
  // Theme & Appearance
  const [theme, setTheme] = useState(localStorage.getItem("sv_theme") || "obsidian");
  
  // Security & SOC Controls
  const [autoLockTimeout, setAutoLockTimeout] = useState("15");
  const [enable2FA, setEnable2FA] = useState(true);
  const [threatSounds, setThreatSounds] = useState(false);
  const [strictFirewall, setStrictFirewall] = useState(true);
  
  // Notification Preferences
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyIDS, setNotifyIDS] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(false);

  // API Integration
  const [apiKey, setApiKey] = useState("sv_sec_live_9f83a04b12c847d0e91");
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://siem.internal.corp/events/soc");
  
  // Danger Zone
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem("sv_theme", theme);
    toast.success("Security preferences updated successfully!");
  };

  const handleGenerateKey = () => {
    const newKey = "sv_sec_live_" + Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    setApiKey(newKey);
    toast.success("New API Token generated!");
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    toast.success("API Key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleClearCache = () => {
    sessionStorage.clear();
    toast.success("Simulation cache and temporary buffers cleared");
  };

  const handleRevokeSessions = () => {
    toast.success("All other active SOC sessions revoked");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    toast.success("Account removal initiated");
    setShowDeleteModal(false);
    logout();
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl animate-fade-in pb-12">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-sv-green mb-1">
          // Platform Configuration
        </p>
        <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
          <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>
            settings
          </span>
          System Settings
        </h1>
        <p className="text-sm text-sv-muted-fg mt-0.5">
          Configure interface appearance, SOC notification policies, API tokens, and platform controls.
        </p>
      </div>

      <form onSubmit={handleSavePreferences} className="flex flex-col gap-6">
        {/* Appearance / Theme */}
        <section className="glass-panel p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "18px" }}>palette</span>
            <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
              SOC Theme & Display
            </h2>
          </div>
          <p className="text-xs text-sv-muted-fg mb-4">
            Choose high-contrast dark visual matrix for cybersecurity and operation room operations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "obsidian", name: "Obsidian Cyber", desc: "Emerald accents on dark slate", border: "rgba(34,197,94,0.4)" },
              { id: "cobalt",   name: "Cobalt Sentinel", desc: "Cyan & blue cold defense",   border: "rgba(56,189,248,0.4)" },
              { id: "stealth",  name: "Matrix Terminal", desc: "Monochrome pure terminal",    border: "rgba(148,163,184,0.4)" },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5"
                style={{
                  background: theme === t.id ? "rgba(34,197,94,0.08)" : "rgba(15,23,42,0.6)",
                  borderColor: theme === t.id ? t.border : "rgba(46,58,82,0.6)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-xs text-sv-fg">{t.name}</span>
                  {theme === t.id && (
                    <span className="material-symbols-outlined text-sv-green text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-sv-muted-fg">{t.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Security Policies */}
        <section className="glass-panel p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "18px" }}>verified_user</span>
            <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
              Security & Defense Policies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">
                Session Auto-Lock Inactivity
              </label>
              <select
                value={autoLockTimeout}
                onChange={(e) => setAutoLockTimeout(e.target.value)}
                className="input-sv"
              >
                <option value="5">5 Minutes (Ultra Secure)</option>
                <option value="15">15 Minutes (Recommended)</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="never">Never (Testing only)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">
                SIEM Webhook Endpoint
              </label>
              <input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://siem.corp/webhook"
                className="input-sv font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {[
              {
                id: "2fa",
                label: "Enforce Multi-Factor Authentication (MFA/OTP)",
                desc: "Require 6-digit email OTP verification on all new logins.",
                val: enable2FA,
                set: setEnable2FA,
              },
              {
                id: "strict_fw",
                label: "Strict Packet Inspection Default",
                desc: "Automatically block suspicious ICMP bursts and SYN flood sequences.",
                val: strictFirewall,
                set: setStrictFirewall,
              },
              {
                id: "threat_sounds",
                label: "Audio Warning on Critical Threat Alerts",
                desc: "Emit an audible frequency pulse when high-severity IDS events trigger.",
                val: threatSounds,
                set: setThreatSounds,
              },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.02]"
                style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(46,58,82,0.5)" }}
              >
                <input
                  type="checkbox"
                  checked={item.val}
                  onChange={(e) => item.set(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded accent-sv-green cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-sv-fg">{item.label}</p>
                  <p className="text-[11px] text-sv-muted-fg mt-0.5">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="glass-panel p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "18px" }}>notifications</span>
            <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
              Alert Subscriptions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {
                label: "Critical Security Advisories & IDS Breaches",
                desc: "Immediate dispatch for brute force spikes, port sweeps, and SQLi attempts.",
                val: notifyIDS,
                set: setNotifyIDS,
              },
              {
                label: "Login from New IP or Unrecognized Device",
                desc: "Send an email alert immediately whenever an account session initiates elsewhere.",
                val: notifyEmail,
                set: setNotifyEmail,
              },
              {
                label: "Weekly SOC Summary Digest",
                desc: "Condensed telemetry report covering blocked attacks and firewall statistics.",
                val: notifyDigest,
                set: setNotifyDigest,
              },
            ].map((n, i) => (
              <label
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.02]"
                style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(46,58,82,0.5)" }}
              >
                <input
                  type="checkbox"
                  checked={n.val}
                  onChange={(e) => n.set(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded accent-sv-green cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-sv-fg">{n.label}</p>
                  <p className="text-[11px] text-sv-muted-fg mt-0.5">{n.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* API Tokens & Integration */}
        <section className="glass-panel p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "18px" }}>key</span>
              <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
                API Tokens for SOC Automation
              </h2>
            </div>
            <button
              type="button"
              onClick={handleGenerateKey}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-sv-green border border-sv-green/30 hover:bg-sv-green/10 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Roll Token
            </button>
          </div>

          <p className="text-xs text-sv-muted-fg">
            Use this bearer token to query the SecureVault IDS and Firewall APIs from command-line scripts or CI/CD pipelines.
          </p>

          <div
            className="flex items-center justify-between px-3.5 py-2.5 rounded-lg font-mono text-xs"
            style={{ background: "rgba(8,15,30,0.8)", border: "1px solid rgba(34,197,94,0.25)" }}
          >
            <span className="text-sv-fg truncate select-all">{apiKey}</span>
            <button
              type="button"
              onClick={handleCopyKey}
              className="ml-3 px-2.5 py-1 rounded bg-sv-card text-sv-muted-fg hover:text-sv-fg hover:bg-white/10 transition-all flex items-center gap-1 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-xs">
                {copiedKey ? "check" : "content_copy"}
              </span>
              {copiedKey ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary px-6 py-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">save</span>
            Save Settings
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <section
        className="glass-panel p-5 sm:p-6 flex flex-col gap-4"
        style={{ borderColor: "rgba(239,68,68,0.3)" }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sv-red" style={{ fontSize: "18px" }}>warning</span>
          <h2 className="font-display font-semibold text-sm text-sv-red uppercase tracking-wider">
            Danger Zone
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleClearCache}
            className="p-3.5 rounded-xl border border-sv-border/70 hover:border-sv-border-hi bg-sv-card text-left transition-all flex flex-col gap-1"
          >
            <span className="text-xs font-bold text-sv-fg flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-sv-muted-fg">cleaning_services</span>
              Clear Simulator Cache
            </span>
            <span className="text-[11px] text-sv-muted-fg">Flush local simulation data and memory logs.</span>
          </button>

          <button
            type="button"
            onClick={handleRevokeSessions}
            className="p-3.5 rounded-xl border border-amber-500/30 hover:border-amber-500/60 bg-sv-card text-left transition-all flex flex-col gap-1"
          >
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-amber-400">lock_clock</span>
              Revoke All Sessions
            </span>
            <span className="text-[11px] text-sv-muted-fg">Invalidate all existing session tokens.</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="p-3.5 rounded-xl border border-sv-red/40 hover:border-sv-red bg-sv-red/10 text-left transition-all flex flex-col gap-1"
          >
            <span className="text-xs font-bold text-sv-red flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-sv-red">delete_forever</span>
              Delete Account
            </span>
            <span className="text-[11px] text-sv-muted-fg">Permanently eradicate your account credentials.</span>
          </button>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="glass-panel p-6 max-w-md w-full flex flex-col gap-4 animate-scale-up"
            style={{ borderColor: "rgba(239,68,68,0.5)" }}
          >
            <div className="flex items-center gap-2.5 text-sv-red">
              <span className="material-symbols-outlined text-2xl">error</span>
              <h3 className="font-display font-bold text-base">Permanent Account Deletion</h3>
            </div>
            <p className="text-xs text-sv-muted-fg leading-relaxed">
              This action is <strong className="text-sv-red">irreversible</strong>. All personal encryption keys, stored simulation logs, and chat records will be purged immediately.
            </p>
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1">
                Type <span className="text-sv-red font-bold">DELETE</span> to confirm:
              </label>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="input-sv font-mono text-center text-sm uppercase"
              />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-sv-muted-fg hover:text-sv-fg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE"}
                className="px-4 py-2 rounded-lg bg-sv-red text-white text-xs font-bold uppercase tracking-wider hover:bg-red-600 disabled:opacity-40 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
