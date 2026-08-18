import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { dashboardService } from "../services/dashboardService";

const MODULES = [
  { path: "/encrypt",  icon: "science",                 label: "Encryption Lab",      desc: "AES, DES, 3DES cipher demos",        color: "#22C55E" },
  { path: "/hash",     icon: "fingerprint",             label: "Hash Generator",      desc: "MD5, SHA-256, Avalanche effect",      color: "#22D3EE" },
  { path: "/rsa",      icon: "history_edu",             label: "Digital Signatures",  desc: "RSA key pair and signing",            color: "#A78BFA" },
  { path: "/chat",     icon: "forum",                   label: "Secure Chat",         desc: "E2E encrypted messaging",             color: "#22C55E" },
  { path: "/firewall", icon: "shield",                  label: "Firewall Simulator",  desc: "Packet filtering and rules",          color: "#22D3EE" },
  { path: "/ids",      icon: "security",                label: "Intrusion Detection", desc: "Real-time threat monitoring",         color: "#F59E0B" },
  { path: "/birthday", icon: "security_update_warning", label: "Birthday Attack",     desc: "Hash collision demonstration",        color: "#EF4444" },
  { path: "/learn",    icon: "school",                  label: "Learning Center",     desc: "IS concepts and references",          color: "#A78BFA" },
];

function CountUp({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  const frame = useRef(null);
  useEffect(() => {
    if (!target || target === 0) { setVal(0); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return <span>{typeof target === "string" ? target : val.toLocaleString()}</span>;
}

export default function DashboardPage() {
  const { user }   = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Intrusion Alerts",  value: stats.cards.totalIntrusionAlerts, icon: "warning",     color: "#EF4444", borderColor: "#EF4444", badge: "Critical" },
        { label: "Threats Blocked",   value: stats.cards.totalThreatsBlocked,  icon: "gpp_bad",     color: "#F59E0B", borderColor: "#F59E0B", badge: "IDS" },
        { label: "Hash Operations",   value: stats.cards.totalHashes,          icon: "fingerprint",  color: "#22D3EE", borderColor: "#22D3EE", badge: "Normal" },
        { label: "Encrypted Files",   value: stats.cards.totalEncryptedFiles,  icon: "lock",         color: "#22C55E", borderColor: "#22C55E", badge: "Normal" },
      ]
    : [
        { label: "Intrusion Alerts",  value: 0, icon: "warning",    color: "#EF4444", borderColor: "#EF4444", badge: "Critical" },
        { label: "Threats Blocked",   value: 0, icon: "gpp_bad",    color: "#F59E0B", borderColor: "#F59E0B", badge: "IDS" },
        { label: "Hash Operations",   value: 0, icon: "fingerprint", color: "#22D3EE", borderColor: "#22D3EE", badge: "Normal" },
        { label: "Encrypted Files",   value: 0, icon: "lock",        color: "#22C55E", borderColor: "#22C55E", badge: "Normal" },
      ];

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Atmospheric glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-[100px]"
          style={{ background: "rgba(239,68,68,0.05)" }} />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full blur-[120px]"
          style={{ background: "rgba(34,197,94,0.04)" }} />
      </div>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
        <div>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-sv-green mb-1">
            // {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display font-bold text-xl text-sv-fg leading-tight">
            Welcome back,{" "}
            <span className="text-sv-green">{user?.name?.split(" ")[0] || "Operator"}</span>
          </h1>
          <p className="text-xs text-sv-muted-fg mt-0.5">Security overview · SecureVault SOC</p>
        </div>

        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-widest"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#22C55E" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sv-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sv-green" />
          </span>
          All Systems Clear
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((s, i) => (
          <div
            key={s.label}
            className="glass-panel p-4 flex flex-col gap-3 relative overflow-hidden"
            style={{ borderLeft: `3px solid ${s.borderColor}40`, animationDelay: `${i * 80}ms` }}
          >
            {/* Subtle corner glow */}
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-[30px] opacity-20"
              style={{ background: s.color }} />

            <div className="flex justify-between items-start relative">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}14`, border: `1px solid ${s.color}30` }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1", color: s.color }}
                >
                  {s.icon}
                </span>
              </div>
              <span
                className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: `${s.borderColor}14`, color: s.borderColor, border: `1px solid ${s.borderColor}30` }}
              >
                {s.badge}
              </span>
            </div>

            <div className="relative">
              <div className="font-display font-bold text-3xl text-sv-fg">
                {loading
                  ? <span className="skeleton-text w-10 h-7 inline-block rounded" />
                  : <CountUp target={s.value} />}
              </div>
              <div className="text-[10px] font-mono font-semibold uppercase text-sv-muted-fg mt-1 tracking-widest">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Security Modules Grid ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "16px" }}>apps</span>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-green">
            Security Modules
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MODULES.map(({ path, icon, label, desc, color }, i) => (
            <Link key={path} to={path}>
              <div
                className="glass-card-hover p-4 flex flex-col gap-3 h-full group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                  style={{ background: `${color}12`, border: `1px solid ${color}28` }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px", fontVariationSettings: "'FILL' 0", color }}
                  >
                    {icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-sv-fg text-xs">{label}</p>
                  <p className="text-[11px] text-sv-muted-fg mt-0.5 leading-relaxed hidden sm:block">{desc}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color }}>
                  <span>Open</span>
                  <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Activity panels ───────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Login activity */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-sv-cyan" style={{ fontSize: "16px" }}>login</span>
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg">
                Login Activity · Last 7 Days
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Successful", value: stats.cards.successfulLogins, color: "#22C55E" },
                { label: "Failed",     value: stats.cards.failedLogins,     color: "#EF4444" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg p-3 text-center"
                  style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}
                >
                  <p className="font-display font-bold text-3xl" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-[10px] font-mono text-sv-muted-fg mt-1 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-xs font-mono"
              style={{ borderTop: "1px solid rgba(46,58,82,0.5)", paddingTop: "0.75rem" }}>
              <span className="text-sv-muted-fg">Total registered users</span>
              <span className="font-bold text-sv-green">{stats.cards.totalUsers}</span>
            </div>
          </div>

          {/* Recent threats */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#EF4444" }}>warning</span>
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg">
                Recent Threats
              </p>
            </div>
            {stats.recentThreats?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-20 gap-2">
                <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                <p className="text-xs font-mono text-sv-muted-fg">No threats detected. All clear!</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {(stats.recentThreats || []).slice(0, 4).map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 animate-pulse" />
                      <span className="text-xs text-sv-fg font-mono truncate">{t.attackType || "Unknown"}</span>
                    </div>
                    <span className="text-[10px] font-mono text-sv-muted-fg flex-shrink-0 ml-2">{t.ipAddress}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── About ────────────────────────────────────────────────── */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-sv-muted-fg" style={{ fontSize: "16px" }}>info</span>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg">About SecureVault</p>
        </div>
        <p className="text-sm text-sv-muted-fg leading-relaxed">
          <strong className="text-sv-fg">SecureVault</strong> is a CY5008 semester project demonstrating the full
          lifecycle of Information Security. Navigate the modules above to explore each concept interactively.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["AES/DES/3DES","SHA-256/MD5","RSA","CAPTCHA","IDS","Firewall","Birthday Attack","E2E Chat"].map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold"
              style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.18)", color: "#22C55E" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
