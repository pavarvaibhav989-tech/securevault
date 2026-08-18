import { useState } from "react";

const TOPICS = [
  {
    id: "aes", icon: "lock", color: "text-sv-green", label: "AES",
    title: "Advanced Encryption Standard",
    desc: "Symmetric block cipher standardized by NIST (2001). 128-bit blocks, key sizes 128/192/256 bits.",
    steps: ["Key Expansion", "AddRoundKey (initial)", "SubBytes", "ShiftRows", "MixColumns", "AddRoundKey", "Repeat 9-13 rounds", "Final Round (no MixColumns)"],
    facts: [["Block Size", "128 bits"], ["Key Sizes", "128/192/256 bits"], ["Rounds", "10/12/14"], ["Structure", "SPN"]],
  },
  {
    id: "des", icon: "key", color: "text-secondary-container", label: "DES",
    title: "Data Encryption Standard",
    desc: "IBM symmetric cipher (1977). Considered insecure due to 56-bit key size. Replaced by AES.",
    steps: ["Initial Permutation", "Key Schedule (16 subkeys)", "16 Feistel Rounds", "F-function: Expansion + S-boxes + P-box", "Final Permutation"],
    facts: [["Block Size", "64 bits"], ["Key Size", "56 bits"], ["Rounds", "16"], ["Status", "Deprecated"]],
  },
  {
    id: "sha", icon: "fingerprint", color: "text-sv-green", label: "SHA-256",
    title: "Secure Hash Algorithm (SHA-256)",
    desc: "Cryptographic hash producing a 256-bit digest. Used in TLS, Bitcoin, digital signatures.",
    steps: ["Message Padding", "Parse into 512-bit blocks", "Initialize hash values", "Compression function (64 rounds)", "Concatenate final hash"],
    facts: [["Output", "256 bits"], ["Block", "512 bits"], ["Rounds", "64"], ["Family", "SHA-2"]],
  },
  {
    id: "rsa", icon: "history_edu", color: "text-sv-green", label: "RSA",
    title: "RSA Public-Key Cryptography",
    desc: "Asymmetric encryption based on integer factorization. Used for key exchange and digital signatures.",
    steps: ["Choose primes p and q", "n = p x q", "phi(n) = (p-1)(q-1)", "Choose public exponent e", "Private key: d = e^-1 mod phi(n)"],
    facts: [["Key Size", "2048/4096 bits"], ["Type", "Asymmetric"], ["Use", "Encryption + Signing"], ["Based on", "Factoring"]],
  },
  {
    id: "birthday", icon: "security_update_warning", color: "text-sv-cyan", label: "Birthday Attack",
    title: "Birthday Attack on Hashes",
    desc: "Exploits the birthday paradox - only sqrt(N) operations needed to find a hash collision.",
    steps: ["Generate random messages", "Hash each message", "Store in hash table", "Find collision (same hash)", "Exploit duplicate"],
    facts: [["MD5 Collision", "~2^64 ops"], ["SHA-1 Collision", "~2^80 ops"], ["Defence", "Use SHA-256+"], ["Threat", "Forged signatures"]],
  },
  {
    id: "firewall", icon: "shield", color: "text-sv-green", label: "Firewall",
    title: "Network Firewall Concepts",
    desc: "Monitors and controls network traffic based on security rules. Packet-filter, stateful, or WAF.",
    steps: ["Receive network packet", "Match against rule table", "Apply ALLOW or DENY", "Log the decision", "Forward or DROP"],
    facts: [["Types", "Packet/Stateful/WAF"], ["OSI Layer", "3 (Network) / 7 (App)"], ["Common Ports", "80, 443, 22, 3306"]],
  },
  {
    id: "ids", icon: "security", color: "text-sv-red", label: "IDS",
    title: "Intrusion Detection System",
    desc: "Monitors events for signs of malicious activity. Signature-based or anomaly-based detection.",
    steps: ["Capture network traffic", "Pattern match (signatures)", "Anomaly scoring", "Raise alert if threshold exceeded", "Log and quarantine"],
    facts: [["Types", "NIDS / HIDS"], ["Methods", "Signature / Anomaly"], ["Response", "Passive (detect only)"]],
  },
];

export default function LearningPage() {
  const [active, setActive] = useState("aes");
  const topic = TOPICS.find((t) => t.id === active);
  const idx = TOPICS.findIndex((t) => t.id === active);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">school</span>Learning Center
        </h1>
        <p className="text-sm text-sv-muted-fg mt-1">Explore information security concepts, algorithms, and protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Topic list */}
        <div className="glass-panel p-4 flex flex-col gap-1 lg:col-span-1">
          <p className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider mb-3">Topics</p>
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${active === t.id ? "bg-primary/15 border border-primary/40 text-primary" : "text-sv-muted-fg hover:bg-white/5"}`}
            >
              <span className={`material-symbols-outlined text-[18px] ${active === t.id ? "text-sv-green" : t.color}`}>{t.icon}</span>
              <span className="text-xs font-bold">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <section className="glass-panel p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className={`material-symbols-outlined text-3xl ${topic.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{topic.icon}</span>
              <div>
                <h2 className="font-display font-bold text-xl text-on-surface">{topic.title}</h2>
                <p className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider">{topic.label}</p>
              </div>
            </div>
            <p className="text-sm text-sv-muted-fg leading-relaxed">{topic.desc}</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="glass-panel p-5">
              <h3 className="font-display font-semibold text-on-surface text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-lg">schema</span>How It Works
              </h3>
              <ol className="space-y-2">
                {topic.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-sv-muted-fg">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 text-primary text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            <section className="glass-panel p-5">
              <h3 className="font-display font-semibold text-on-surface text-sm mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-lg">info</span>Key Facts
              </h3>
              <div className="space-y-2">
                {topic.facts.map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs font-semibold uppercase text-sv-muted-fg tracking-wider">{label}</span>
                    <span className="text-xs font-bold text-on-surface bg-sv-card-highest px-2 py-1 rounded">{val}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => idx > 0 && setActive(TOPICS[idx - 1].id)}
              disabled={idx === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant/40 text-sv-muted-fg hover:bg-white/5 text-xs font-bold disabled:opacity-30 transition-all"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>Previous
            </button>
            <span className="text-xs text-sv-muted-fg">{idx + 1} / {TOPICS.length}</span>
            <button
              onClick={() => idx < TOPICS.length - 1 && setActive(TOPICS[idx + 1].id)}
              disabled={idx === TOPICS.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 text-xs font-bold disabled:opacity-30 transition-all"
            >
              Next<span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

