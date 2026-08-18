import { useState } from "react";
import toast from "react-hot-toast";
import { hashService } from "../services/hashService";

export default function BirthdayPage() {
  const [algo, setAlgo] = useState("MD5");
  const [sampleSize, setSampleSize] = useState(1000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await hashService.birthdayAttack({ algorithm: algo, sampleSize });
      setResult(data.data);
      toast.success("Simulation complete!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Simulation failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">security_update_warning</span>Birthday Attack
        </h1>
        <p className="text-sm text-sv-muted-fg mt-1">Demonstrate hash collision vulnerability via the birthday paradox.</p>
      </div>

      {/* Theory */}
      <section className="glass-panel p-5 border-l-4 border-l-secondary-container">
        <h2 className="font-display font-semibold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary-container">school</span>Birthday Paradox
        </h2>
        <p className="text-sm text-sv-muted-fg leading-relaxed">
          In a group of just <strong className="text-on-surface">23 people</strong>, there is a ~50% probability that two share the same birthday.
          Applied to hash functions: an attacker needs only <strong className="text-on-surface">sqrt(N)</strong> hash operations to find a collision
          in a space of N values - far fewer than the expected N operations for a brute-force search.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ["MD5 (128-bit)", "~2^64 operations", "text-sv-red"],
            ["SHA-1 (160-bit)", "~2^80 operations", "text-secondary-container"],
            ["SHA-256 (256-bit)", "~2^128 operations", "text-sv-green"],
          ].map(([label, val, cls]) => (
            <div key={label} className="bg-sv-card rounded-lg p-3 text-center">
              <p className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider">{label}</p>
              <p className={`font-display font-bold text-sm mt-1 ${cls}`}>{val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simulator config */}
      <section className="glass-panel p-5 flex flex-col gap-4">
        <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">science</span>Collision Simulator
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-2">Hash Algorithm</label>
            <div className="flex flex-wrap gap-2">
              {["MD5", "SHA256", "SHA512"].map((a) => (
                <button
                  key={a}
                  onClick={() => setAlgo(a)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${algo === a ? "bg-primary/20 border-primary text-primary shadow-glow-primary" : "bg-sv-card border-outline-variant/40 text-sv-muted-fg hover:bg-white/5"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-2">
              Sample Size: <span className="text-sv-green">{sampleSize.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={sampleSize}
              onChange={(e) => setSampleSize(+e.target.value)}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-sv-muted-fg mt-1">
              <span>100</span><span>10,000</span>
            </div>
          </div>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #adc6ff, #4cd7f6)" }}
        >
          <span className="material-symbols-outlined text-sm">{loading ? "hourglass_empty" : "play_arrow"}</span>
          {loading ? "Simulating..." : "Run Simulation"}
        </button>
      </section>

      {/* Results */}
      {result && (
        <section className="glass-panel p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">analytics</span>Simulation Results
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ["Hashes Computed", result.hashesComputed || sampleSize, "text-sv-green"],
              ["Collisions Found", result.collisionsFound ?? result.collisions ?? 0, result.collisionsFound > 0 ? "text-sv-red" : "text-sv-green"],
              ["Attack Success", result.collisionsFound > 0 ? "YES" : "NO", result.collisionsFound > 0 ? "text-sv-red" : "text-sv-green"],
            ].map(([label, val, cls]) => (
              <div key={label} className="bg-sv-card rounded-lg p-4 text-center">
                <p className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider">{label}</p>
                <p className={`font-display font-bold text-3xl mt-2 ${cls}`}>{String(val)}</p>
              </div>
            ))}
          </div>
          {result.collision && (
            <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
              <p className="text-xs font-bold uppercase text-sv-red tracking-wider mb-2">Collision Detected!</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[["Message A", result.collision.messageA], ["Message B", result.collision.messageB]].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-sv-muted-fg mb-1">{label}</p>
                    <div className="font-mono text-xs bg-sv-card rounded p-2 text-sv-red break-all">{val}</div>
                  </div>
                ))}
                <div className="md:col-span-2">
                  <p className="text-xs text-sv-muted-fg mb-1">Shared Hash</p>
                  <div className="font-mono text-xs bg-sv-card rounded p-2 text-tertiary break-all">{result.collision.hash}</div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

