import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { hashService } from "../services/hashService";

const ALGORITHMS = ["SHA256", "SHA512", "MD5", "HMAC-SHA256", "HMAC-SHA512"];

export default function HashPage() {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA256");
  const [hmacSecret, setHmacSecret] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [avalanche, setAvalanche] = useState(null);
  const [verifyData, setVerifyData] = useState({ text: "", hash: "", algo: "SHA256" });
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      if (tab === "file" && file) { fd.append("file", file); }
      else { fd.append("text", text); }
      fd.append("algorithm", algorithm);
      if (algorithm.includes("HMAC")) fd.append("secret", hmacSecret);
      const { data } = await hashService.generate(fd);
      setResult(data.data);
      setAvalanche(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Hash failed");
    } finally { setLoading(false); }
  };

  const handleAvalanche = async () => {
    if (!text) { toast.error("Enter text first"); return; }
    setLoading(true);
    try {
      const { data } = await hashService.avalanche({ text, algorithm });
      setAvalanche(data.data);
    } catch { toast.error("Avalanche failed"); }
    finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await hashService.verify(verifyData);
      setVerifyResult(data.data);
    } catch { toast.error("Verify failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">fingerprint</span>Hash Generator
        </h1>
        <p className="text-sm text-sv-muted-fg mt-1">Generate cryptographic hashes and visualize the avalanche effect.</p>
      </div>

      {/* Algorithm picker */}
      <section className="glass-panel p-5">
        <h2 className="font-display font-semibold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">tune</span>Algorithm
        </h2>
        <div className="flex flex-wrap gap-2">
          {ALGORITHMS.map((a) => (
            <button
              key={a}
              onClick={() => setAlgorithm(a)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${algorithm === a ? "bg-primary/20 border-primary text-primary shadow-glow-primary" : "bg-sv-card border-outline-variant/40 text-sv-muted-fg hover:bg-white/5"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Generate */}
        <section className="glass-panel p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">tag</span>Generate Hash
          </h2>
          <div className="flex gap-1 bg-sv-card rounded-lg p-1">
            {["text", "file"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${tab === t ? "bg-sv-card text-primary" : "text-sv-muted-fg hover:text-on-surface"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            {tab === "text" ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to hash..."
                className="input-sv min-h-[100px] resize-y font-mono text-sm"
              />
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border border-dashed border-outline-variant/50 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                style={{ background: "rgba(6,14,32,0.4)" }}
              >
                <span className="material-symbols-outlined text-3xl text-sv-muted-fg">{file ? "description" : "upload_file"}</span>
                <p className="text-xs text-sv-muted-fg">{file ? file.name : "Click to select file"}</p>
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              </div>
            )}

            {algorithm.includes("HMAC") && (
              <div>
                <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">HMAC Secret</label>
                <input value={hmacSecret} onChange={(e) => setHmacSecret(e.target.value)} placeholder="Secret key" className="input-sv" />
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #adc6ff, #4cd7f6)" }}
              >
                <span className="material-symbols-outlined text-sm">tag</span>{loading ? "Hashing..." : "Generate"}
              </button>
              {tab === "text" && (
                <button
                  type="button"
                  onClick={handleAvalanche}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg border border-secondary/40 text-secondary bg-secondary/10 font-bold text-xs uppercase tracking-wider hover:bg-secondary/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">bolt</span>Avalanche
                </button>
              )}
            </div>
          </form>

          {result && (
            <div className="mt-2">
              <p className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider mb-1">Hash Result</p>
              <div className="bg-sv-card rounded-lg p-3 font-mono text-xs text-tertiary break-all">{result.hashValue || result.hash || result}</div>
              {result.algorithm && (
                <p className="text-xs text-sv-muted-fg mt-1">Algorithm: {result.algorithm} &nbsp;|&nbsp; Length: {result.hashLength} bits &nbsp;|&nbsp; Time: {result.executionTime}ms</p>
              )}
            </div>
          )}
        </section>

        {/* Verify */}
        <section className="glass-panel p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">verified</span>Verify Hash
          </h2>
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Original Text</label>
              <textarea
                value={verifyData.text}
                onChange={(e) => setVerifyData((v) => ({ ...v, text: e.target.value }))}
                placeholder="Enter original text..."
                className="input-sv min-h-[80px] resize-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Hash to Verify</label>
              <input
                value={verifyData.hash}
                onChange={(e) => setVerifyData((v) => ({ ...v, hash: e.target.value }))}
                placeholder="Paste hash..."
                className="input-sv font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Algorithm</label>
              <select
                value={verifyData.algo}
                onChange={(e) => setVerifyData((v) => ({ ...v, algo: e.target.value }))}
                className="input-sv"
              >
                {ALGORITHMS.filter((a) => !a.includes("HMAC")).map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg border border-primary/40 text-primary bg-primary/10 font-bold text-xs uppercase tracking-wider hover:bg-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">verified</span>{loading ? "Verifying..." : "Verify Hash"}
            </button>
          </form>
          {verifyResult !== null && verifyResult !== undefined && (
            <div className={`mt-2 flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm ${(verifyResult?.isMatch || verifyResult?.match) ? "bg-tertiary/15 border border-tertiary/30 text-tertiary" : "bg-error/15 border border-error/30 text-sv-red"}`}>
              <span className="material-symbols-outlined">{(verifyResult?.isMatch || verifyResult?.match) ? "check_circle" : "cancel"}</span>
              {(verifyResult?.isMatch || verifyResult?.match) ? "Hash matches - integrity verified!" : "Hash mismatch - data may be tampered!"}
            </div>
          )}
        </section>
      </div>

      {/* Avalanche result */}
      {avalanche && (
        <section className="glass-panel p-5">
          <h2 className="font-display font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">bolt</span>Avalanche Effect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[["Original", avalanche.original], ["Modified (+1 bit)", avalanche.modified]].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider mb-1">{label}</p>
                <div className="bg-sv-card rounded-lg p-3 font-mono text-xs text-tertiary break-all">{val?.hash || val}</div>
              </div>
            ))}
          </div>
          {avalanche.bitsChanged !== undefined && (
            <div className="mt-4 px-4 py-3 bg-secondary/10 border border-secondary/30 rounded-lg text-sm">
              <span className="text-sv-muted-fg">Bits changed: </span>
              <span className="font-bold text-secondary">{avalanche.bitsChanged}</span>
              <span className="text-sv-muted-fg"> of {avalanche.totalBits} ({avalanche.percentChanged}%) - {avalanche.percentChanged > 40 ? "Strong avalanche effect" : "Weak avalanche"}</span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

