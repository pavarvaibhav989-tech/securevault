import { useState, useEffect, useRef } from "react";
import { firewallService } from "../services/firewallService";
import toast from "react-hot-toast";

const DEMO_LOGS = [
  { ts:"14:02:45", src:"192.168.1.104", dst:"10.0.0.50", proto:"TCP:443", rule:"#R-01", action:"allow" },
  { ts:"14:02:44", src:"203.0.113.42",  dst:"10.0.0.50", proto:"TCP:22",  rule:"#R-04", action:"deny"  },
  { ts:"14:02:42", src:"192.168.1.18",  dst:"10.0.0.50", proto:"TCP:80",  rule:"#R-02", action:"allow" },
  { ts:"14:02:39", src:"198.51.100.7",  dst:"10.0.0.50", proto:"UDP:53",  rule:"DEFAULT", action:"deny" },
  { ts:"14:02:35", src:"10.0.0.12",     dst:"10.0.0.50", proto:"ICMP",    rule:"#R-03", action:"allow" },
];

export default function FirewallPage() {
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState(DEMO_LOGS);
  const [form, setForm] = useState({ sourceIp: "", destinationIp: "10.0.0.50", protocol: "TCP", port: "", action: "allow" });
  const [loading, setLoading] = useState(false);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    firewallService.getRules().then((r) => setRules(r.data?.data?.rules || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!dropZoneRef.current) return;
      const el = document.createElement("div");
      el.style.cssText = "position:absolute;inset:0;background:rgba(255,180,171,0.15);border-radius:8px;opacity:0;transition:opacity 0.2s;pointer-events:none;";
      dropZoneRef.current.appendChild(el);
      requestAnimationFrame(() => { el.style.opacity = "1"; });
      setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }, 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const setAction = (a) => setForm((f) => ({ ...f, action: a }));

  const addRule = async () => {
    if (!form.sourceIp || !form.port) { toast.error("Fill in Source IP and Port"); return; }
    setLoading(true);
    try {
      await firewallService.addRule(form);
      const newLog = {
        ts: new Date().toLocaleTimeString("en-US", { hour12: false }).slice(0, 8),
        src: form.sourceIp, dst: form.destinationIp,
        proto: `${form.protocol}:${form.port}`, rule: "NEW", action: form.action,
      };
      setLogs((l) => [newLog, ...l.slice(0, 9)]);
      toast.success(`Rule added: ${form.action.toUpperCase()}`);
    } catch { toast.error("Failed to add rule"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Traffic Flow Visualization */}
      <section className="glass-panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(173,198,255,0.04) 0%, transparent 70%)" }} />
        <h2 className="font-display font-semibold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">network_check</span>
          Traffic Flow Visualizer
        </h2>

        <div className="relative w-full flex items-center justify-between max-w-3xl mx-auto my-4">
          {/* Internet node */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-sv-card-highest border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">public</span>
            </div>
            <span className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider">Internet</span>
          </div>

          {/* Flow line left */}
          <div className="flex-1 h-px bg-outline-variant/30 relative mx-4 overflow-visible">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 packet-good" />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 packet-bad" style={{ animationDelay: "1.2s" }} />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 packet-good" style={{ animationDelay: "2.1s" }} />
          </div>

          {/* Firewall node */}
          <div className="flex flex-col items-center gap-2 z-10">
            <div
              className="w-20 h-28 rounded-xl bg-sv-card border border-primary/30 flex items-center justify-center firewall-node-glow relative overflow-hidden"
              ref={dropZoneRef}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Firewall</span>
          </div>

          {/* Flow line right */}
          <div className="flex-1 h-px bg-outline-variant/30 relative mx-4 overflow-visible">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 packet-good" style={{ animationDelay: "1.5s" }} />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 packet-good" style={{ animationDelay: "3.6s" }} />
          </div>

          {/* Server node */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-xl bg-sv-card-highest border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-2xl">dns</span>
            </div>
            <span className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider">Server</span>
          </div>
        </div>

        <div className="flex gap-5 mt-4 justify-center">
          <div className="flex items-center gap-2 text-xs text-sv-muted-fg">
            <div className="w-3 h-3 rounded-full bg-tertiary shadow-glow-green" />Allowed
          </div>
          <div className="flex items-center gap-2 text-xs text-sv-muted-fg">
            <div className="w-3 h-3 rounded-full bg-error" style={{ boxShadow: "0 0 8px #ffb4ab" }} />Dropped
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Rule Builder */}
        <section className="glass-panel p-5 lg:col-span-1 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">rule</span>Rule Builder
          </h2>

          <div>
            <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Source IP</label>
            <input name="sourceIp" value={form.sourceIp} onChange={handle} placeholder="e.g. 192.168.1.0" className="input-sv" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Destination IP</label>
            <input name="destinationIp" value={form.destinationIp} onChange={handle} className="input-sv" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Protocol</label>
              <select name="protocol" value={form.protocol} onChange={handle} className="input-sv">
                {["TCP", "UDP", "ICMP", "ANY"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Port</label>
              <input name="port" value={form.port} onChange={handle} placeholder="443" className="input-sv" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-2">Action</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAction("allow")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all border ${form.action === "allow" ? "bg-tertiary/20 border-tertiary/50 text-tertiary" : "bg-sv-card border-outline-variant/30 text-sv-muted-fg hover:bg-white/5"}`}
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>ALLOW
              </button>
              <button
                onClick={() => setAction("deny")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-all border ${form.action === "deny" ? "bg-error/20 border-error/50 text-sv-red" : "bg-sv-card border-outline-variant/30 text-sv-muted-fg hover:bg-white/5"}`}
              >
                <span className="material-symbols-outlined text-sm">block</span>DROP
              </button>
            </div>
          </div>

          <button
            onClick={addRule}
            disabled={loading}
            className="mt-auto w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #adc6ff, #03b5d3)" }}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {loading ? "Adding..." : "Add Rule"}
          </button>
        </section>

        {/* Live Logs */}
        <section className="glass-panel p-5 lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">list_alt</span>Live Traffic Logs
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-tertiary/10 border border-tertiary/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="text-xs font-bold text-tertiary">LIVE</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-white/5 rounded-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-sv-card-highest/50 border-b border-white/5 text-xs font-bold uppercase text-sv-muted-fg">
                  {["Timestamp", "Source", "Destination", "Proto:Port", "Rule", "Action"].map((h) => (
                    <th key={h} className={`px-3 py-2.5 font-semibold ${h === "Action" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {logs.map((log, i) => (
                  <tr key={i} className={`hover:bg-white/5 transition-colors ${log.action === "deny" ? "bg-error/5" : ""}`}>
                    <td className="px-3 py-2.5 text-outline text-xs">{log.ts}</td>
                    <td className={`px-3 py-2.5 font-mono text-xs ${log.action === "deny" ? "text-sv-red" : ""}`}>{log.src}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">{log.dst}</td>
                    <td className="px-3 py-2.5 text-xs">{log.proto}</td>
                    <td className="px-3 py-2.5 text-xs text-primary">{log.rule}</td>
                    <td className="px-3 py-2.5 text-right">
                      {log.action === "allow" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary/10 text-tertiary text-xs">
                          <span className="material-symbols-outlined text-[12px]">check</span>Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error/10 text-sv-red text-xs">
                          <span className="material-symbols-outlined text-[12px]">block</span>Dropped
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

