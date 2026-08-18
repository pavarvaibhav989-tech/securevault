import { useState } from "react";
import toast from "react-hot-toast";
import { rsaService } from "../services/rsaService";

export default function RSAPage() {
  const [keySize, setKeySize] = useState(2048);
  const [keys, setKeys] = useState(null);
  const [genLoading, setGenLoading] = useState(false);
  // Sign/Verify
  const [signMsg, setSignMsg] = useState("");
  const [signPrivKey, setSignPrivKey] = useState("");
  const [signature, setSignature] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifySig, setVerifySig] = useState("");
  const [verifyPubKey, setVerifyPubKey] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  // Encrypt/Decrypt
  const [encMsg, setEncMsg] = useState("");
  const [encPubKey, setEncPubKey] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [decCipher, setDecCipher] = useState("");
  const [decPrivKey, setDecPrivKey] = useState("");
  const [plaintext, setPlaintext] = useState("");

  const [loading, setLoading] = useState(false);

  const generateKeys = async () => {
    setGenLoading(true);
    try {
      const { data } = await rsaService.generateKeys(keySize);
      setKeys(data.data);
      // Auto-fill fields
      setSignPrivKey(data.data.privateKey);
      setVerifyPubKey(data.data.publicKey);
      setEncPubKey(data.data.publicKey);
      setDecPrivKey(data.data.privateKey);
      toast.success(`${keySize}-bit key pair generated!`);
    } catch { toast.error("Key generation failed"); }
    finally { setGenLoading(false); }
  };

  const sign = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await rsaService.sign({ message: signMsg, privateKey: signPrivKey || keys?.privateKey });
      setSignature(data.data.signature);
      setVerifySig(data.data.signature);
      setVerifyMsg(signMsg);
      toast.success("Message signed!");
    } catch (err) { toast.error(err.response?.data?.message || "Signing failed"); }
    finally { setLoading(false); }
  };

  const verify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await rsaService.verify({ message: verifyMsg, signature: verifySig, publicKey: verifyPubKey || keys?.publicKey });
      setVerifyResult(data.data);
      toast.success("Verification complete");
    } catch (err) { toast.error(err.response?.data?.message || "Verification failed"); }
    finally { setLoading(false); }
  };

  const encrypt = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await rsaService.encrypt({ message: encMsg, publicKey: encPubKey || keys?.publicKey });
      setCiphertext(data.data.ciphertext);
      setDecCipher(data.data.ciphertext);
      toast.success("Message encrypted!");
    } catch (err) { toast.error(err.response?.data?.message || "RSA encryption failed (message too long for key size?)"); }
    finally { setLoading(false); }
  };

  const decrypt = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await rsaService.decrypt({ ciphertext: decCipher, privateKey: decPrivKey || keys?.privateKey });
      setPlaintext(data.data.plaintext);
      toast.success("Message decrypted!");
    } catch (err) { toast.error(err.response?.data?.message || "RSA decryption failed"); }
    finally { setLoading(false); }
  };

  const copy = (text) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history_edu</span>
          RSA and Digital Signatures
        </h1>
        <p className="text-sm text-sv-muted-fg mt-1">Generate RSA key pairs, sign/verify messages, and perform asymmetric encryption.</p>
      </div>

      {/* Key generation */}
      <section className="glass-panel p-5 flex flex-col gap-4">
        <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">key</span>Step 1: Generate Key Pair
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider">Key Size:</span>
          {[1024, 2048, 4096].map((s) => (
            <button
              key={s}
              onClick={() => setKeySize(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${keySize === s ? "bg-secondary/20 border-secondary text-secondary" : "bg-sv-card border-outline-variant/40 text-sv-muted-fg hover:bg-white/5"}`}
            >
              {s}-bit
            </button>
          ))}
          {keySize === 4096 && <span className="text-xs text-sv-muted-fg italic">(slow)</span>}
          <button
            onClick={generateKeys}
            disabled={genLoading}
            className="ml-auto px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider text-on-primary hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #adc6ff, #4cd7f6)" }}
          >
            {genLoading ? (
              <><span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />Generating...</>
            ) : (
              <><span className="material-symbols-outlined text-sm">generating_tokens</span>Generate Keys</>
            )}
          </button>
        </div>
        {keys && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[["Public Key", keys.publicKey, "vpn_key"], ["Private Key", keys.privateKey, "lock"]].map(([label, val, icon]) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">{icon}</span>{label}
                  </p>
                  <button onClick={() => copy(val)} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-sm">copy_all</span>Copy
                  </button>
                </div>
                <textarea readOnly value={val} rows={5} className="w-full bg-sv-card border border-outline-variant/30 rounded-lg p-3 font-mono text-xs text-sv-muted-fg resize-none focus:outline-none" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sign + Verify */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="glass-panel p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">draw</span>Sign Message
          </h2>
          <form onSubmit={sign} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Message</label>
              <textarea value={signMsg} onChange={(e) => setSignMsg(e.target.value)} placeholder="Message to sign..." className="input-sv min-h-[70px] resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Private Key</label>
              <textarea value={signPrivKey} onChange={(e) => setSignPrivKey(e.target.value)} placeholder="Paste private key or generate above..." className="input-sv min-h-[70px] resize-none font-mono text-xs" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-tertiary/20 border border-tertiary/40 text-tertiary font-bold text-xs uppercase tracking-wider hover:bg-tertiary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">draw</span>{loading ? "Signing..." : "Sign Message"}
            </button>
          </form>
          {signature && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider">Signature</p>
                <button onClick={() => copy(signature)} className="text-xs text-primary hover:underline flex items-center gap-0.5"><span className="material-symbols-outlined text-sm">copy_all</span>Copy</button>
              </div>
              <div className="bg-sv-card rounded-lg p-3 font-mono text-xs text-tertiary break-all">{signature}</div>
            </div>
          )}
        </section>

        <section className="glass-panel p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">verified</span>Verify Signature
          </h2>
          <form onSubmit={verify} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Original Message</label>
              <textarea value={verifyMsg} onChange={(e) => setVerifyMsg(e.target.value)} placeholder="Original message..." className="input-sv resize-none min-h-[50px]" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Signature</label>
              <textarea value={verifySig} onChange={(e) => setVerifySig(e.target.value)} placeholder="Paste signature..." className="input-sv resize-none min-h-[50px] font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Public Key</label>
              <textarea value={verifyPubKey} onChange={(e) => setVerifyPubKey(e.target.value)} placeholder="Paste public key..." className="input-sv resize-none min-h-[50px] font-mono text-xs" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-primary/20 border border-primary/40 text-primary font-bold text-xs uppercase tracking-wider hover:bg-primary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">verified</span>{loading ? "Verifying..." : "Verify Signature"}
            </button>
          </form>
          {verifyResult !== null && verifyResult !== undefined && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm ${(verifyResult?.isValid || verifyResult?.valid) ? "bg-tertiary/15 border border-tertiary/30 text-tertiary" : "bg-error/15 border border-error/30 text-sv-red"}`}>
              <span className="material-symbols-outlined">{(verifyResult?.isValid || verifyResult?.valid) ? "check_circle" : "cancel"}</span>
              {(verifyResult?.isValid || verifyResult?.valid) ? "Signature is VALID!" : "Signature is INVALID!"}
            </div>
          )}
        </section>
      </div>

      {/* Encrypt/Decrypt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="glass-panel p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lock</span>RSA Encrypt
            <span className="text-xs text-sv-muted-fg font-normal">(short messages only)</span>
          </h2>
          <form onSubmit={encrypt} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Plaintext</label>
              <textarea value={encMsg} onChange={(e) => setEncMsg(e.target.value)} placeholder="Short message to encrypt..." className="input-sv resize-none min-h-[70px]" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Public Key</label>
              <textarea value={encPubKey} onChange={(e) => setEncPubKey(e.target.value)} placeholder="Paste public key..." className="input-sv resize-none min-h-[60px] font-mono text-xs" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-primary/20 border border-primary/40 text-primary font-bold text-xs uppercase tracking-wider hover:bg-primary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">lock</span>{loading ? "Encrypting..." : "Encrypt"}
            </button>
          </form>
          {ciphertext && <div className="bg-sv-card rounded-lg p-3 font-mono text-xs text-primary break-all">{ciphertext}</div>}
        </section>

        <section className="glass-panel p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">lock_open</span>RSA Decrypt
          </h2>
          <form onSubmit={decrypt} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Ciphertext (Base64)</label>
              <textarea value={decCipher} onChange={(e) => setDecCipher(e.target.value)} placeholder="Paste ciphertext..." className="input-sv resize-none min-h-[70px] font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Private Key</label>
              <textarea value={decPrivKey} onChange={(e) => setDecPrivKey(e.target.value)} placeholder="Paste private key..." className="input-sv resize-none min-h-[60px] font-mono text-xs" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-secondary/20 border border-secondary/40 text-secondary font-bold text-xs uppercase tracking-wider hover:bg-secondary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">lock_open</span>{loading ? "Decrypting..." : "Decrypt"}
            </button>
          </form>
          {plaintext && (
            <div className="bg-sv-card rounded-lg p-3 text-sm text-tertiary font-semibold">
              {plaintext}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

