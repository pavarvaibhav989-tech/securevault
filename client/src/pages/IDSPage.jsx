import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { idsService } from "../services/idsService";

const SEV = {
  critical: { cls: "badge-critical-sv", dot: "bg-error",              label: "Critical", color: "#EF4444" },
  high:     { cls: "badge-high-sv",     dot: "bg-secondary-container", label: "High",     color: "#F97316" },
  medium:   { cls: "badge-medium-sv",   dot: "bg-tertiary",            label: "Medium",   color: "#FACC15" },
  low:      { cls: "badge-low-sv",      dot: "bg-outline",             label: "Low",      color: "#94A3B8" },
};

const REFRESH_MS = 10000;

export default function IDSPage() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sevFilter, setSevFilter] = useState("all");
  const [countdown, setCountdown] = useState(REFRESH_MS / 1000);
  const timerRef = useRef(null);
  const countRef = useRef(null);

  const fetchLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await idsService.getLogs();
      setLogs(r.data?.data?.logs || []);
    } catch { /* silent fail */ }
    finally { if (!silent) setLoading(false); }
  };

  const clearLogs = async () => {
    try {
      await idsService.clearLogs?.();
      setLogs([]);
      toast.success("Logs cleared");
    } catch { toast.error("Could not clear logs"); }
  };

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 10s
    timerRef.current = setInterval(() => fetchLogs(true), REFRESH_MS);
    // Countdown
    countRef.current = setInterval(() =>
      setCountdown((c) => (c <= 1 ? REFRESH_MS / 1000 : c - 1)), 1000);
    return () => {
      clearInterval(timerRef.current);
      clearInterval(countRef.current);
    };
  }, []);

  const filtered = sevFilter === "all" ? logs : logs.filter((l) => l.severity === sevFilter);


  const statCards = [
    { label: "Active Breaches",    value: 14,      color: "text-sv-red",              border: "border-l-error",              icon: "warning",    badge: "Critical", badgeCls: "bg-error-container/20 text-sv-red" },
    { label: "Suspicious Nodes",   value: 42,      color: "text-secondary-container",border: "border-l-secondary-container",icon: "error",      badge: "High",     badgeCls: "bg-secondary-container/20 text-secondary" },
    { label: "Anomalous Packets",  value: 156,     color: "text-sv-green",           border: "border-l-tertiary",           icon: "info",       badge: "Medium",   badgeCls: "bg-tertiary/20 text-tertiary" },
    { label: "Packets Scanned/Hr", value: "8.4M",  color: "text-outline",            border: "border-l-outline",            icon: "radar",      badge: "Monitor",  badgeCls: "bg-surface-variant text-sv-muted-fg" },
  ];

  return (
    <div className="flex flex-col gap-5 relative">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[100px]" style={{ background: "rgba(93,0,10,0.15)" }} />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-sv-fg">Intrusion Detection System</h1>
          <p className="text-sm text-sv-muted-fg mt-1">Real-time threat monitoring and network anomaly analysis.</p>
        </div>
        <div className="flex items-center gap-3 bg-sv-card-high px-4 py-2 rounded-lg border border-outline-variant/30">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-error" />
          </span>
          <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Status: DEFCON 3</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`glass-panel p-5 flex flex-col gap-3 border-l-4 ${s.border}`}>
            <div className="flex justify-between items-start">
              <span className={`material-symbols-outlined text-3xl ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${s.badgeCls}`}>{s.badge}</span>
            </div>
            <div>
              <div className="font-display font-bold text-4xl text-on-surface">{s.value}</div>
              <div className="text-xs font-semibold uppercase text-sv-muted-fg mt-1 tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Threat map + entity graph */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-8 glass-panel overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-sv-card-highest/30">
            <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">public</span>
              Global Threat Vector Map
            </h2>
            <span className="flex items-center gap-1.5 text-xs font-bold text-tertiary">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />LIVE
            </span>
          </div>
          <div className="flex-1 relative bg-[#02050f] p-4 min-h-[280px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#4d8eff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div
              className="relative w-full max-w-2xl aspect-video rounded-lg border border-outline/10 flex items-center justify-center overflow-hidden"
              style={{ background: "linear-gradient(135deg, #060e20 0%, #171f33 100%)" }}
            >
              <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-error rounded-full pulse-danger" />
              <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-secondary-container rounded-full blur-sm" />
              <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-error rounded-full opacity-50 blur-md" />
              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-tertiary rounded-full pulse-danger" />
              <div className="z-10 flex flex-col items-center gap-2 text-sv-muted-fg/40">
                <span className="material-symbols-outlined text-5xl">map</span>
                <span className="text-xs font-semibold uppercase tracking-wider">Geospatial Threat Visualization Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 glass-panel overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-white/5 bg-sv-card-highest/30">
            <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">hub</span>
              Entity Relationships
            </h2>
          </div>
          <div className="flex-1 p-5 relative flex flex-col justify-center items-center bg-sv-card/50 min-h-[280px]">
            <div className="relative w-full h-44">
              {/* Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center glow-active z-10">
                <span className="material-symbols-outlined text-primary text-sm">router</span>
              </div>
              {/* Malicious */}
              <div className="absolute top-4 left-4 w-8 h-8 rounded-full border-2 border-error bg-error/20 flex items-center justify-center pulse-danger z-10">
                <span className="material-symbols-outlined text-sv-red text-xs">bug_report</span>
              </div>
              <div className="absolute top-[28px] left-[32px] w-24 h-0.5 bg-gradient-to-r from-error to-primary/50 origin-left rotate-[35deg]" />
              {/* Suspicious */}
              <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full border-2 border-secondary bg-secondary/10 flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-secondary text-xs">vpn_key</span>
              </div>
              <div className="absolute top-1/2 left-1/2 w-20 h-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 origin-left rotate-[35deg]" />
            </div>
            <p className="text-center text-xs text-sv-muted-fg mt-2">Cluster Alpha-7: anomalous lateral movement detected.</p>
          </div>
        </div>
      </div>

      {/* Quarantine / Live Logs table */}
      <section className="glass-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-sv-card-highest/30">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-red">gavel</span>
            Live Threat Log
            {logs.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/25">{logs.length}</span>
            )}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Severity filter */}
            {["all", "critical", "high", "medium", "low"].map((f) => (
              <button
                key={f}
                onClick={() => setSevFilter(f)}
                className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold capitalize transition-all"
                style={{
                  background: sevFilter === f ? 'rgba(34,197,94,0.12)' : 'transparent',
                  border: `1px solid ${sevFilter === f ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  color: sevFilter === f ? '#22C55E' : '#64748B',
                }}
              >{f}</button>
            ))}
            {/* Countdown */}
            <span className="text-[11px] font-mono text-slate-500 ml-1">
              ↻ {countdown}s
            </span>
            {/* Clear logs */}
            <button
              onClick={clearLogs}
              className="flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-mono font-semibold transition-all"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}
            >
              <span className="material-symbols-outlined text-[14px]">delete_sweep</span>Clear
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-sv-card/50 text-xs font-bold uppercase text-sv-muted-fg tracking-wider">
                {["IP Address", "Attack Vector", "Severity", "Timestamp", "Action"].map((h) => (
                  <th key={h} className={`px-4 py-3 ${h === "Action" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sv-muted-fg">
                  <span className="w-4 h-4 border-2 border-sv-green/30 border-t-sv-green rounded-full animate-spin inline-block mr-2" />
                  Loading threat data…
                </td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center">
                  <span className="material-symbols-outlined text-4xl text-sv-green/30 block mb-2">verified_user</span>
                  <span className="text-sv-muted-fg text-sm">{logs.length === 0 ? "No threats detected — system is clean." : "No threats match the selected filter."}</span>
                </td></tr>
              )}
              {!loading && filtered.map((q, i) => {
                const s = SEV[q.severity] || SEV.low;
                const ts = q.createdAt ? new Date(q.createdAt).toLocaleTimeString() : q.timestamp || "—";
                return (
                  <tr key={q._id || i} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3 font-mono text-sv-green text-sm">{q.ip || q.sourceIp || "—"}</td>
                    <td className="px-4 py-3 text-on-surface">{q.vector || q.type || q.message || "Unknown"}</td>
                    <td className="px-4 py-3">
                      <span className={s.cls}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} inline-block`} />{s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sv-muted-fg text-xs font-mono">{ts}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-sv-muted-fg group-hover:text-sv-green transition-colors">
                        <span className="material-symbols-outlined text-xl">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

