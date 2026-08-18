import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { encryptionService } from "../services/encryptionService";

const ALGORITHMS = ["AES", "DES", "Triple-DES", "Blowfish", "RC4"];
const ALGO_INFO = {
  AES: { desc: "Advanced Encryption Standard", keyLen: 256, type: "Symmetric Block", strength: "Very Strong", color: "text-tertiary" },
  DES: { desc: "Data Encryption Standard (Legacy)", keyLen: 56, type: "Symmetric Block", strength: "Weak", color: "text-error" },
  "Triple-DES": { desc: "Triple DES (3DES)", keyLen: 168, type: "Symmetric Block", strength: "Moderate", color: "text-secondary-container" },
  Blowfish: { desc: "Blowfish Cipher", keyLen: 128, type: "Symmetric Block", strength: "Strong", color: "text-tertiary" },
  RC4: { desc: "Rivest Cipher 4 (Deprecated)", keyLen: 128, type: "Stream Cipher", strength: "Deprecated", color: "text-error" },
};

export default function EncryptionPage() {
  const [file, setFile] = useState(null);
  const [algorithm, setAlgorithm] = useState("AES");
  const [key, setKey] = useState("");
  const [result, setResult] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [decryptFile, setDecryptFile] = useState({ fileId: "", key: "" });
  const fileRef = useRef();

  const loadFiles = async () => {
    try {
      const { data } = await encryptionService.listFiles();
      setFiles(data.data || []);
    } catch {}
  };

  useEffect(() => { loadFiles(); }, []);

  const handleEncrypt = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Select a file first"); return; }
    if (!key) { toast.error("Enter encryption key"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("algorithm", algorithm);
      fd.append("key", key);
      const { data } = await encryptionService.encrypt(fd);
      setResult(data.data);
      toast.success("File encrypted!");
      loadFiles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Encryption failed");
    } finally { setLoading(false); }
  };

  const handleDecrypt = async (e) => {
    e.preventDefault();
    if (!decryptFile.fileId) { toast.error("Enter file ID"); return; }
    if (!decryptFile.key) { toast.error("Enter decryption key"); return; }
    setLoading(true);
    try {
      // Decrypt returns the file binary — trigger download
      const response = await encryptionService.decryptFile(decryptFile, { responseType: 'blob' });
      // If response is a blob, trigger download
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decrypted_file';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('File decrypted and downloaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Decryption failed');
    } finally { setLoading(false); }
  };

  const info = ALGO_INFO[algorithm];

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Page header */}
      <div>
        <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-sv-green mb-1">
          // Symmetric Cryptography
        </p>
        <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
          <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>science</span>
          Encryption Lab
        </h1>
        <p className="text-sm text-sv-muted-fg mt-0.5">Encrypt and decrypt files using symmetric cipher algorithms.</p>
      </div>

      {/* Algorithm selector */}
      <section className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-sv-muted-fg" style={{ fontSize: "16px" }}>tune</span>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg">Algorithm Selection</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {ALGORITHMS.map((a) => (
            <button
              key={a}
              onClick={() => setAlgorithm(a)}
              className="px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer"
              style={algorithm === a
                ? { background: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.4)", color: "#22C55E" }
                : { background: "rgba(15,23,42,0.6)", borderColor: "rgba(46,58,82,0.8)", color: "#64748B" }
              }
            >
              {a}
            </button>
          ))}
        </div>
        {info && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[["Algorithm", info.desc], ["Key Length", `${info.keyLen}-bit`], ["Type", info.type], ["Strength", info.strength]].map(([k, v], i) => (
              <div key={k} className="rounded-lg p-3" style={{ background: "rgba(15,23,42,0.7)" }}>
                <p className="text-[9px] font-mono font-semibold uppercase text-sv-muted-fg tracking-widest">{k}</p>
                <p className={`font-semibold mt-1 text-sm ${i === 3 ? info.color : "text-sv-fg"}`}>{v}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Encrypt */}
        <section className="glass-panel p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "16px" }}>lock</span>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg">Encrypt File</p>
          </div>
          <form onSubmit={handleEncrypt} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">File</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[76px]"
                style={{
                  background: "rgba(8,15,30,0.6)",
                  borderColor: file ? "rgba(34,197,94,0.4)" : "rgba(71,85,105,0.4)",
                }}
              >
                <span className="material-symbols-outlined text-2xl text-sv-muted-fg">{file ? "description" : "upload_file"}</span>
                <p className="text-xs text-sv-muted-fg mt-1 font-mono">{file ? file.name : "Click to select file"}</p>
              </div>
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </div>
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">Encryption Key</label>
              <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter your secret key" className="input-sv" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>lock</span>
              {loading ? "Encrypting..." : "Encrypt File"}
            </button>
          </form>
        </section>

        {/* Decrypt */}
        <section className="glass-panel p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-cyan" style={{ fontSize: "16px" }}>lock_open</span>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg">Decrypt File</p>
          </div>
          <form onSubmit={handleDecrypt} className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">Encrypted File</label>
              <select
                value={decryptFile.fileId}
                onChange={(e) => setDecryptFile((d) => ({ ...d, fileId: e.target.value }))}
                className="input-sv"
              >
                <option value="">Select encrypted file...</option>
                {files.map((f) => <option key={f._id} value={f._id}>{f.originalName || f.filename}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">Decryption Key</label>
              <input
                value={decryptFile.key}
                onChange={(e) => setDecryptFile((d) => ({ ...d, key: e.target.value }))}
                placeholder="Enter your secret key"
                className="input-sv"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-cyber w-full py-2.5">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>lock_open</span>
              {loading ? "Decrypting..." : "Decrypt File"}
            </button>
          </form>
          {files.length > 0 && (
            <div>
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg mb-2">Stored Files</p>
              <div className="space-y-1 max-h-32 overflow-y-auto no-scrollbar">
                {files.map((f) => (
                  <div key={f._id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "rgba(15,23,42,0.6)" }}>
                    <span className="text-xs text-sv-muted-fg font-mono truncate flex-1">{f.originalName || f.filename}</span>
                    <span className="text-xs text-sv-green ml-2 font-mono">{f.algorithm || algorithm}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Result */}
      {result && (
        <section className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-green">Encryption Result</p>
          </div>
          <pre className="code-block">
            {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
