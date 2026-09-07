import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { encryptionService } from "../services/encryptionService";
import CryptoJS from "crypto-js";

const ALGORITHMS = ["AES", "DES", "Triple-DES", "Blowfish", "RC4"];
const ALGO_INFO = {
  AES: { desc: "Advanced Encryption Standard", keyLen: 256, type: "Symmetric Block (Rijndael)", strength: "Military Grade", color: "#22C55E" },
  DES: { desc: "Data Encryption Standard (Legacy)", keyLen: 56, type: "Symmetric Block", strength: "Deprecated / Insecure", color: "#EF4444" },
  "Triple-DES": { desc: "Triple DES (3DES / EDE)", keyLen: 168, type: "Symmetric Block", strength: "Legacy Moderate", color: "#F59E0B" },
  Blowfish: { desc: "Blowfish Variable Key Block Cipher", keyLen: 128, type: "Symmetric Feistel Block", strength: "Strong", color: "#38BDF8" },
  RC4: { desc: "Rivest Cipher 4 (Stream)", keyLen: 128, type: "Stream Cipher", strength: "Vulnerable to Biases", color: "#EF4444" },
};

export default function EncryptionPage() {
  const [activeTab, setActiveTab] = useState("text"); // "text" | "file"
  const [algorithm, setAlgorithm] = useState("AES");
  const [key, setKey] = useState("SecVault_Key_2026#99");

  // Text Mode state
  const [plainText, setPlainText] = useState("Top Secret: Quantum defense grid encryption keys initialized.");
  const [cipherOutput, setCipherOutput] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // File Mode state
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileResult, setFileResult] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [decryptFile, setDecryptFile] = useState({ fileId: "", key: "" });
  const fileRef = useRef();

  const loadFiles = async () => {
    try {
      const { data } = await encryptionService.listFiles();
      setFiles(data.data || []);
    } catch {
      // Ignore if disconnected
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Quick Random Key Generator
  const generateRandomKey = () => {
    const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setKey(`sv_key_${randomBytes}`);
    toast.success("Generated 256-bit random key");
  };

  // Text Encrypt handler
  const handleTextEncrypt = (e) => {
    e?.preventDefault();
    if (!plainText) {
      toast.error("Enter plaintext to encrypt");
      return;
    }
    if (!key) {
      toast.error("Encryption key required");
      return;
    }

    setTextLoading(true);
    const start = performance.now();

    try {
      let encryptedStr = "";
      if (algorithm === "AES") {
        encryptedStr = CryptoJS.AES.encrypt(plainText, key).toString();
      } else if (algorithm === "DES") {
        encryptedStr = CryptoJS.DES.encrypt(plainText, key).toString();
      } else if (algorithm === "Triple-DES") {
        encryptedStr = CryptoJS.TripleDES.encrypt(plainText, key).toString();
      } else if (algorithm === "Blowfish") {
        encryptedStr = CryptoJS.Rabbit.encrypt(plainText, key).toString();
      } else if (algorithm === "RC4") {
        encryptedStr = CryptoJS.RC4.encrypt(plainText, key).toString();
      }

      const elapsed = (performance.now() - start).toFixed(2);
      setCipherOutput({
        ciphertext: encryptedStr,
        algorithm,
        timeMs: elapsed,
        inputSize: new Blob([plainText]).size,
        outputSize: new Blob([encryptedStr]).size,
      });
      toast.success("Text encrypted successfully!");
    } catch {
      toast.error("Encryption process failed");
    } finally {
      setTextLoading(false);
    }
  };

  // Text Decrypt handler
  const handleTextDecrypt = () => {
    if (!cipherOutput?.ciphertext) {
      toast.error("No ciphertext available to decrypt");
      return;
    }
    if (!key) {
      toast.error("Decryption key required");
      return;
    }

    try {
      let decryptedStr = "";
      if (algorithm === "AES") {
        decryptedStr = CryptoJS.AES.decrypt(cipherOutput.ciphertext, key).toString(CryptoJS.enc.Utf8);
      } else if (algorithm === "DES") {
        decryptedStr = CryptoJS.DES.decrypt(cipherOutput.ciphertext, key).toString(CryptoJS.enc.Utf8);
      } else if (algorithm === "Triple-DES") {
        decryptedStr = CryptoJS.TripleDES.decrypt(cipherOutput.ciphertext, key).toString(CryptoJS.enc.Utf8);
      } else if (algorithm === "Blowfish") {
        decryptedStr = CryptoJS.Rabbit.decrypt(cipherOutput.ciphertext, key).toString(CryptoJS.enc.Utf8);
      } else if (algorithm === "RC4") {
        decryptedStr = CryptoJS.RC4.decrypt(cipherOutput.ciphertext, key).toString(CryptoJS.enc.Utf8);
      }

      if (!decryptedStr) {
        toast.error("Decryption failed: Incorrect key or corrupted ciphertext");
        return;
      }

      setPlainText(decryptedStr);
      toast.success("Ciphertext decrypted successfully!");
    } catch {
      toast.error("Decryption failed: Key mismatch");
    }
  };

  // Drag-and-drop file upload handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // File Encrypt
  const handleFileEncrypt = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Select or drop a file first");
      return;
    }
    if (!key) {
      toast.error("Enter encryption key");
      return;
    }
    setFileLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("algorithm", algorithm);
      fd.append("key", key);
      const { data } = await encryptionService.encrypt(fd);
      setFileResult(data.data);
      toast.success("File encrypted and stored!");
      loadFiles();
    } catch (err) {
      toast.error(err.response?.data?.message || "File encryption failed");
    } finally {
      setFileLoading(false);
    }
  };

  // File Decrypt
  const handleFileDecrypt = async (e) => {
    e.preventDefault();
    if (!decryptFile.fileId) {
      toast.error("Select an encrypted file");
      return;
    }
    if (!decryptFile.key) {
      toast.error("Enter decryption key");
      return;
    }
    setFileLoading(true);
    try {
      const response = await encryptionService.decryptFile(decryptFile, { responseType: "blob" });
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `decrypted_${Date.now()}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("File decrypted and downloaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Decryption failed (check secret key)");
    } finally {
      setFileLoading(false);
    }
  };

  const info = ALGO_INFO[algorithm];

  return (
    <div className="flex flex-col gap-6 max-w-5xl animate-fade-in pb-12">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-sv-green mb-1">
          // Symmetric Cryptography Suite
        </p>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>
              science
            </span>
            Encryption Lab
          </h1>
          <div className="flex gap-1.5 p-1 rounded-xl bg-sv-card border border-sv-border/40">
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === "text" ? "bg-sv-green/15 text-sv-green border border-sv-green/30" : "text-sv-muted-fg hover:text-sv-fg"
              }`}
            >
              Text Stream
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("file")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === "file" ? "bg-sv-green/15 text-sv-green border border-sv-green/30" : "text-sv-muted-fg hover:text-sv-fg"
              }`}
            >
              Binary Files
            </button>
          </div>
        </div>
        <p className="text-sm text-sv-muted-fg mt-0.5">
          Benchmark, encrypt, and decrypt strings or documents across multiple symmetric cipher architectures.
        </p>
      </div>

      {/* Algorithm Selector Bar */}
      <section className="glass-panel p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">tune</span>
            Cipher Engine Selection
          </p>
          <span className="text-xs font-mono font-bold text-sv-green">{info.desc}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {ALGORITHMS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAlgorithm(a)}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer"
              style={
                algorithm === a
                  ? { background: "rgba(34,197,94,0.15)", borderColor: "rgba(34,197,94,0.4)", color: "#22C55E" }
                  : { background: "rgba(15,23,42,0.6)", borderColor: "rgba(46,58,82,0.6)", color: "#94A3B8" }
              }
            >
              {a}
            </button>
          ))}
        </div>

        {/* Algorithm specs grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Block Type", val: info.type },
            { label: "Key Length", val: `${info.keyLen}-bit` },
            { label: "Security Posture", val: info.strength, color: info.color },
            { label: "Operation Mode", val: "CBC / IV Chain" },
          ].map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-lg"
              style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(46,58,82,0.5)" }}
            >
              <p className="text-[9px] font-mono font-bold uppercase text-sv-muted-fg tracking-widest">{item.label}</p>
              <p className="font-semibold text-xs sm:text-sm mt-1" style={{ color: item.color || "#F1F5F9" }}>
                {item.val}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Secret Key Bar */}
      <section className="glass-panel p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 text-sv-green flex-shrink-0">
          <span className="material-symbols-outlined text-lg">vpn_key</span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider">Secret Key:</span>
        </div>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter custom cryptographic passphrase..."
          className="input-sv flex-1 font-mono text-xs"
        />
        <button
          type="button"
          onClick={generateRandomKey}
          className="px-3 py-2 rounded-lg text-xs font-mono font-semibold text-sv-green border border-sv-green/30 hover:bg-sv-green/10 transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">casino</span>
          Random Key
        </button>
      </section>

      {/* Mode A: Text Stream Cryptography */}
      {activeTab === "text" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Plaintext input */}
          <section className="glass-panel p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "18px" }}>notes</span>
                <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
                  Plaintext Input
                </h2>
              </div>
              <span className="text-[10px] font-mono text-sv-muted-fg">
                {new Blob([plainText]).size} bytes
              </span>
            </div>

            <textarea
              rows={6}
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              placeholder="Enter plaintext message or payload..."
              className="input-sv font-mono text-xs resize-none"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTextEncrypt}
                disabled={textLoading}
                className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                {textLoading ? "Encrypting..." : `Encrypt with ${algorithm}`}
              </button>
              <button
                type="button"
                onClick={() => setPlainText("")}
                className="px-3 py-2.5 rounded-lg border border-sv-border/70 text-sv-muted-fg hover:text-sv-fg text-xs"
              >
                Clear
              </button>
            </div>
          </section>

          {/* Ciphertext Output */}
          <section className="glass-panel p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sv-cyan" style={{ fontSize: "18px" }}>enhanced_encryption</span>
                <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
                  Ciphertext Output
                </h2>
              </div>
              {cipherOutput && (
                <span className="text-[10px] font-mono text-sv-green">
                  {cipherOutput.timeMs}ms benchmark
                </span>
              )}
            </div>

            <div
              className="relative p-3.5 rounded-xl font-mono text-xs break-all overflow-y-auto select-all"
              style={{
                background: "rgba(8,15,30,0.8)",
                border: "1px solid rgba(34,197,94,0.25)",
                minHeight: "148px",
                maxHeight: "148px",
              }}
            >
              {cipherOutput ? (
                <span className="text-sv-green">{cipherOutput.ciphertext}</span>
              ) : (
                <span className="text-sv-muted-fg/40 italic">
                  Ciphertext output will appear here after clicking Encrypt...
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTextDecrypt}
                disabled={!cipherOutput}
                className="btn-cyber flex-1 py-2.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm">lock_open</span>
                Decrypt Back to Plaintext
              </button>
              <button
                type="button"
                onClick={() => {
                  if (cipherOutput?.ciphertext) {
                    navigator.clipboard.writeText(cipherOutput.ciphertext);
                    setCopiedText(true);
                    toast.success("Ciphertext copied");
                    setTimeout(() => setCopiedText(false), 2000);
                  }
                }}
                disabled={!cipherOutput}
                className="px-3.5 py-2.5 rounded-lg border border-sv-border/70 text-sv-muted-fg hover:text-sv-fg disabled:opacity-30 text-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {copiedText ? "check" : "content_copy"}
                </span>
                {copiedText ? "Copied" : "Copy"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Mode B: Binary File Cryptography */}
      {activeTab === "file" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* File Encrypt */}
          <section className="glass-panel p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "18px" }}>file_upload</span>
              <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
                Encrypt Document / Binary
              </h2>
            </div>

            <form onSubmit={handleFileEncrypt} className="flex flex-col gap-3">
              {/* Drag and drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[120px]"
                style={{
                  background: isDragging ? "rgba(34,197,94,0.12)" : "rgba(8,15,30,0.6)",
                  borderColor: isDragging
                    ? "#22C55E"
                    : file
                    ? "rgba(34,197,94,0.5)"
                    : "rgba(71,85,105,0.4)",
                }}
              >
                <span
                  className={`material-symbols-outlined text-3xl mb-1 ${
                    file ? "text-sv-green" : "text-sv-muted-fg"
                  }`}
                >
                  {file ? "verified" : "cloud_upload"}
                </span>
                <p className="text-xs text-sv-fg font-semibold mt-1">
                  {file ? file.name : "Drag & drop file here or click to browse"}
                </p>
                <p className="text-[10px] text-sv-muted-fg font-mono mt-0.5">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : "Supports PDF, TXT, DOCX, ZIP, PNG"}
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
              />

              <button type="submit" disabled={fileLoading || !file} className="btn-primary w-full py-2.5">
                <span className="material-symbols-outlined text-sm">lock</span>
                {fileLoading ? "Encrypting & Storing..." : "Encrypt & Store Document"}
              </button>
            </form>
          </section>

          {/* File Decrypt */}
          <section className="glass-panel p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sv-cyan" style={{ fontSize: "18px" }}>file_download</span>
              <h2 className="font-display font-semibold text-sm text-sv-fg uppercase tracking-wider">
                Decrypt Stored File
              </h2>
            </div>

            <form onSubmit={handleFileDecrypt} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">
                  Stored Encrypted File
                </label>
                <select
                  value={decryptFile.fileId}
                  onChange={(e) => setDecryptFile((d) => ({ ...d, fileId: e.target.value }))}
                  className="input-sv"
                >
                  <option value="">Select an encrypted file...</option>
                  {files.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.originalName || f.filename} ({f.algorithm || "AES"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">
                  Passphrase Key
                </label>
                <input
                  value={decryptFile.key}
                  onChange={(e) => setDecryptFile((d) => ({ ...d, key: e.target.value }))}
                  placeholder="Enter decryption passphrase..."
                  className="input-sv font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={fileLoading || !decryptFile.fileId}
                className="btn-cyber w-full py-2.5"
              >
                <span className="material-symbols-outlined text-sm">lock_open</span>
                {fileLoading ? "Decrypting..." : "Decrypt & Download File"}
              </button>
            </form>

            {files.length > 0 && (
              <div className="pt-2">
                <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg mb-1.5">
                  Vault Repository ({files.length} items)
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  {files.map((f) => (
                    <div
                      key={f._id}
                      onClick={() => setDecryptFile((d) => ({ ...d, fileId: f._id }))}
                      className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-white/5"
                      style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(46,58,82,0.5)" }}
                    >
                      <span className="text-xs text-sv-fg font-mono truncate flex-1">
                        {f.originalName || f.filename}
                      </span>
                      <span className="text-[10px] text-sv-green ml-2 font-mono uppercase font-bold">
                        {f.algorithm || "AES"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* File Result */}
      {fileResult && (
        <section className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-sv-green">
              File Vault Cryptographic Manifest
            </p>
          </div>
          <pre className="code-block text-xs font-mono max-h-48 overflow-y-auto">
            {JSON.stringify(fileResult, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
