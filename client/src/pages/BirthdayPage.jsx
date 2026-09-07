import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { hashService } from "../services/hashService";

export default function BirthdayPage() {
  const [algo, setAlgo] = useState("MD5");
  const [bitSpace, setBitSpace] = useState(16); // 16-bit collision space for instant demo
  const [sampleSize, setSampleSize] = useState(600);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Theoretical probability calculation based on the Birthday Paradox:
  // P ≈ 1 - e^(-(k^2) / (2 * N)) where N = 2^bitSpace and k = sampleSize
  const theoreticalProb = useMemo(() => {
    const N = Math.pow(2, bitSpace);
    const exponent = -Math.pow(sampleSize, 2) / (2 * N);
    const p = 1 - Math.exp(exponent);
    return Math.max(0, Math.min(1, p));
  }, [bitSpace, sampleSize]);

  // Generate SVG curve points for probability graph
  const curvePoints = useMemo(() => {
    const N = Math.pow(2, bitSpace);
    const points = [];
    const maxK = Math.min(Math.round(Math.sqrt(N) * 2.5), 10000);
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const k = (i / steps) * maxK;
      const p = 1 - Math.exp(-Math.pow(k, 2) / (2 * N));
      const x = (i / steps) * 360 + 20; // SVG x
      const y = 140 - p * 120; // SVG y (inverted)
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  }, [bitSpace]);

  // Current sample position on curve
  const currentPoint = useMemo(() => {
    const N = Math.pow(2, bitSpace);
    const maxK = Math.min(Math.round(Math.sqrt(N) * 2.5), 10000);
    const ratio = Math.min(sampleSize / maxK, 1);
    const x = ratio * 360 + 20;
    const y = 140 - theoreticalProb * 120;
    return { x, y };
  }, [sampleSize, bitSpace, theoreticalProb]);

  // Run collision attack
  const runAttack = async () => {
    setLoading(true);
    setProgress(15);
    setResult(null);

    // Progress animation
    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 15 : p));
    }, 120);

    try {
      // First try backend service
      let backendSuccess = false;
      try {
        const { data } = await hashService.birthdayAttack({ algorithm: algo, sampleSize });
        if (data && data.data) {
          setResult(data.data);
          backendSuccess = true;
        }
      } catch {
        // Fallback to client-side fast simulation
      }

      if (!backendSuccess) {
        // Fast client-side collision simulator based on selected bitSpace
        const seenHashes = new Map();
        let collisionPair = null;
        const mask = (1 << bitSpace) - 1;

        for (let i = 0; i < sampleSize; i++) {
          const msg = `sv_msg_entropy_${i}_${Date.now().toString(36)}`;
          // Fast deterministic hash function simulating truncated digest
          let h = 0x811c9dc5;
          for (let j = 0; j < msg.length; j++) {
            h ^= msg.charCodeAt(j);
            h = Math.imul(h, 0x01000193);
          }
          const truncatedHash = (h & mask).toString(16).padStart(Math.ceil(bitSpace / 4), "0");

          if (seenHashes.has(truncatedHash)) {
            collisionPair = {
              messageA: seenHashes.get(truncatedHash),
              messageB: msg,
              hash: truncatedHash,
              fullDigestSampleA: `0x${truncatedHash}...[${algo}]`,
              fullDigestSampleB: `0x${truncatedHash}...[${algo}]`,
            };
            break;
          }
          seenHashes.set(truncatedHash, msg);
        }

        setResult({
          hashesComputed: seenHashes.size + (collisionPair ? 1 : 0),
          collisionsFound: collisionPair ? 1 : 0,
          collision: collisionPair,
          bitSpace,
          algorithm: algo,
          sampleSize,
          theoreticalProb: (theoreticalProb * 100).toFixed(2) + "%",
        });
      }

      toast.success("Simulation complete!");
    } catch {
      toast.error("Simulation encountered an unexpected error.");
    } finally {
      clearInterval(interval);
      setProgress(100);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-5xl pb-12">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-sv-green mb-1">
          // Cryptanalysis & Paradox Simulation
        </p>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>
              security_update_warning
            </span>
            Birthday Attack Simulation
          </h1>
          <span
            className="px-3 py-1 rounded-full font-mono text-[11px] text-sv-green"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
          >
            O(√N) Collision Bound
          </span>
        </div>
        <p className="text-sm text-sv-muted-fg mt-0.5">
          Demonstrate hash collision vulnerabilities arising from the mathematical Birthday Paradox.
        </p>
      </div>

      {/* Theory & Math banner */}
      <section className="glass-panel p-5 sm:p-6 border-l-4 border-l-sv-green">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "20px" }}>
            calculate
          </span>
          <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
            Mathematical Principle: The Birthday Paradox
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-sv-muted-fg leading-relaxed">
          In a group of only <strong className="text-sv-fg">23 randomly chosen people</strong>, the probability that at least two share the exact same birthday exceeds <strong className="text-sv-green">50%</strong>.
          When applied to cryptographic hash digests, an adversary does not need N = 2^b evaluations to find a matching pair; they require only approximately <strong className="text-sv-fg">√N = 2^(b/2)</strong> evaluations.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "MD5 (128-bit)", ops: "~2⁶⁴ Operations", note: "Collision broken in practice", color: "#EF4444" },
            { label: "SHA-1 (160-bit)", ops: "~2⁸⁰ Operations", note: "SHAttered attack confirmed", color: "#F59E0B" },
            { label: "SHA-256 (256-bit)", ops: "~2¹²⁸ Operations", note: "Considered quantum-safe", color: "#22C55E" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-3.5"
              style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(46,58,82,0.6)" }}
            >
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-sv-muted-fg">{item.label}</p>
              <p className="font-display font-bold text-sm mt-1" style={{ color: item.color }}>{item.ops}</p>
              <p className="text-[10px] text-sv-muted-fg mt-0.5">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simulator Controls & Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Controls */}
        <section className="glass-panel p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "18px" }}>tune</span>
            <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
              Attack Parameters
            </h2>
          </div>

          <div>
            <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-2">
              Target Digest Algorithm
            </label>
            <div className="flex gap-2">
              {["MD5", "SHA256", "SHA512"].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlgo(a)}
                  className="flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                  style={algo === a
                    ? { background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#22C55E" }
                    : { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(46,58,82,0.6)", color: "#94A3B8" }
                  }
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg">
                Target Bit Space
              </label>
              <span className="text-xs font-mono text-sv-green font-bold">
                {bitSpace}-bit (2^{bitSpace} = {Math.pow(2, bitSpace).toLocaleString()} keys)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { bits: 12, label: "12-bit (Micro)" },
                { bits: 16, label: "16-bit (Demo Fast)" },
                { bits: 20, label: "20-bit (Harder)" },
              ].map((b) => (
                <button
                  key={b.bits}
                  type="button"
                  onClick={() => setBitSpace(b.bits)}
                  className="py-1.5 rounded-lg text-[11px] font-mono font-semibold border transition-all"
                  style={bitSpace === b.bits
                    ? { background: "rgba(34,197,94,0.15)", borderColor: "rgba(34,197,94,0.4)", color: "#22C55E" }
                    : { background: "rgba(15,23,42,0.6)", borderColor: "rgba(46,58,82,0.6)", color: "#64748B" }
                  }
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg">
                Sample Population (k)
              </label>
              <span className="text-xs font-mono text-sv-green font-bold">{sampleSize.toLocaleString()} hashes</span>
            </div>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={sampleSize}
              onChange={(e) => setSampleSize(+e.target.value)}
              className="w-full accent-sv-green cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-sv-muted-fg mt-1">
              <span>100</span>
              <span>1,500</span>
              <span>3,000</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl flex items-center justify-between"
            style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(46,58,82,0.6)" }}
          >
            <div>
              <p className="text-[10px] font-mono uppercase text-sv-muted-fg tracking-wider">Calculated Collision Probability</p>
              <p className="text-xl font-display font-bold mt-0.5" style={{ color: theoreticalProb > 0.5 ? "#22C55E" : "#F59E0B" }}>
                {(theoreticalProb * 100).toFixed(2)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono uppercase text-sv-muted-fg tracking-wider">50% Threshold Bound</p>
              <p className="text-xs font-mono text-sv-fg font-bold mt-0.5">
                k ≈ {Math.round(1.177 * Math.sqrt(Math.pow(2, bitSpace))).toLocaleString()} hashes
              </p>
            </div>
          </div>

          {loading && (
            <div className="w-full bg-sv-card rounded-full h-2 overflow-hidden border border-sv-border/40">
              <div
                className="bg-sv-green h-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={runAttack}
            disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-wider"
          >
            <span className="material-symbols-outlined text-base">
              {loading ? "hourglass_top" : "bolt"}
            </span>
            {loading ? `Computing Hashes (${progress}%)...` : "Execute Collision Sweep"}
          </button>
        </section>

        {/* Interactive SVG Probability Curve */}
        <section className="glass-panel p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "18px" }}>show_chart</span>
              <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
                Collision Probability Curve
              </h2>
            </div>
            <p className="text-xs text-sv-muted-fg mb-4">
              Real-time Poisson approximation curve: P(k) = 1 - exp(-k² / 2N)
            </p>

            <div
              className="relative p-2 rounded-xl overflow-hidden"
              style={{ background: "rgba(8,15,30,0.8)", border: "1px solid rgba(34,197,94,0.15)" }}
            >
              <svg viewBox="0 0 400 160" className="w-full h-44 overflow-visible">
                {/* Horizontal reference lines */}
                <line x1="20" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <text x="385" y="24" fill="#64748B" fontSize="9" fontFamily="monospace">100%</text>

                <line x1="20" y1="80" x2="380" y2="80" stroke="rgba(34,197,94,0.25)" strokeDasharray="4 4" />
                <text x="385" y="84" fill="#22C55E" fontSize="9" fontFamily="monospace">50%</text>

                <line x1="20" y1="140" x2="380" y2="140" stroke="rgba(255,255,255,0.1)" />
                <text x="385" y="144" fill="#64748B" fontSize="9" fontFamily="monospace">0%</text>

                {/* Probability curve path */}
                <polyline
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2.5"
                  points={curvePoints}
                />

                {/* Current sample marker */}
                <circle
                  cx={currentPoint.x}
                  cy={currentPoint.y}
                  r="5"
                  fill="#EF4444"
                  stroke="#FFF"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg flex items-center gap-2.5 text-xs text-sv-muted-fg font-mono bg-sv-card border border-sv-border/40">
            <span className="w-2.5 h-2.5 rounded-full bg-sv-red flex-shrink-0" />
            <span>Red marker indicates current test sample point: <strong>{(theoreticalProb * 100).toFixed(1)}% probability</strong>.</span>
          </div>
        </section>
      </div>

      {/* Results presentation */}
      {result && (
        <section className="glass-panel p-5 sm:p-6 flex flex-col gap-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-sv-green"
                style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}
              >
                analytics
              </span>
              <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
                Cryptanalytic Telemetry Results
              </h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full font-mono text-xs font-bold ${
                result.collisionsFound > 0 ? "bg-sv-red/15 text-sv-red border border-sv-red/30" : "bg-sv-green/15 text-sv-green border border-sv-green/30"
              }`}
            >
              {result.collisionsFound > 0 ? "COLLISION DETECTED" : "NO COLLISION IN SAMPLE"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Hashes Processed", val: result.hashesComputed.toLocaleString(), sub: "In-memory hash table" },
              { label: "Collisions Verified", val: result.collisionsFound, sub: result.collisionsFound > 0 ? "Birthday bound hit" : "Increase sample size" },
              { label: "Expected Probability", val: result.theoreticalProb || (theoreticalProb * 100).toFixed(1) + "%", sub: "Mathematical bound" },
            ].map((card, i) => (
              <div
                key={i}
                className="p-4 rounded-xl text-center"
                style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(46,58,82,0.6)" }}
              >
                <p className="text-[10px] font-mono uppercase text-sv-muted-fg tracking-widest">{card.label}</p>
                <p className={`font-display font-bold text-2xl mt-1.5 ${i === 1 && result.collisionsFound > 0 ? "text-sv-red" : "text-sv-fg"}`}>
                  {card.val}
                </p>
                <p className="text-[10px] text-sv-muted-fg font-mono mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          {result.collision && (
            <div
              className="p-4 sm:p-5 rounded-xl flex flex-col gap-3"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <div className="flex items-center gap-2 text-sv-red font-display font-bold text-sm">
                <span className="material-symbols-outlined text-base">warning</span>
                <span>Hash Collision Pair Identified (Same Digest Output)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-sv-card border border-sv-border/40">
                  <p className="text-[10px] font-mono uppercase text-sv-muted-fg mb-1">Pre-image Input A:</p>
                  <p className="font-mono text-xs text-sv-fg break-all select-all">{result.collision.messageA}</p>
                </div>
                <div className="p-3 rounded-lg bg-sv-card border border-sv-border/40">
                  <p className="text-[10px] font-mono uppercase text-sv-muted-fg mb-1">Pre-image Input B:</p>
                  <p className="font-mono text-xs text-sv-fg break-all select-all">{result.collision.messageB}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-sv-card border border-sv-green/30">
                <p className="text-[10px] font-mono uppercase text-sv-green mb-1">Colliding Truncated Hash Digest:</p>
                <p className="font-mono text-sm text-sv-green font-bold tracking-wider break-all select-all">
                  0x{result.collision.hash}
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
