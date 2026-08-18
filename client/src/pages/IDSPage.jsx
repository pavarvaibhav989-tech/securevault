import { useState, useEffect } from "react";
import { idsService } from "../services/idsService";

const QUARANTINE = [
  { ip: "192.168.1.105", vector: "SQL Injection Attempt",  severity: "critical", ts: "14:32:01 UTC" },
  { ip: "45.33.22.11",   vector: "DDoS SYN Flood",         severity: "high",     ts: "14:30:15 UTC" },
  { ip: "10.0.0.55",     vector: "Unauthorized Port Scan", severity: "medium",   ts: "14:28:44 UTC" },
  { ip: "172.16.254.1",  vector: "Repeated Failed Logins", severity: "low",      ts: "14:15:00 UTC" },
];

const SEV = {
  critical: { cls: "badge-critical-sv", dot: "bg-error",              label: "Critical" },
  high:     { cls: "badge-high-sv",     dot: "bg-secondary-container", label: "High" },
  medium:   { cls: "badge-medium-sv",   dot: "bg-tertiary",            label: "Medium" },
  low:      { cls: "badge-low-sv",      dot: "bg-outline",             label: "Low" },
};

export default function IDSPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    idsService.getLogs().then((r) => setLogs(r.data?.data?.logs || [])).catch(() => {});
  }, []);

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

      {/* Quarantine table */}
      <section className="glass-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-sv-card-highest/30">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-red">gavel</span>Auto-Quarantined IPs
          </h2>
          <button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition-colors">
            Export Log
          </button>
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
              {QUARANTINE.map((q, i) => {
                const s = SEV[q.severity] || SEV.low;
                return (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3 font-mono text-primary text-sm">{q.ip}</td>
                    <td className="px-4 py-3 text-on-surface">{q.vector}</td>
                    <td className="px-4 py-3">
                      <span className={s.cls}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} inline-block`} />{s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sv-muted-fg text-xs">{q.ts}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-sv-muted-fg group-hover:text-primary transition-colors">
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

