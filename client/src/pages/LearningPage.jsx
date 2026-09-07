import { useState } from "react";

const TOPICS = [
  {
    id: "aes", icon: "lock", color: "#22C55E", label: "AES",
    title: "Advanced Encryption Standard",
    desc: "Symmetric block cipher standardized by NIST (2001). 128-bit blocks, key sizes 128/192/256 bits. Used globally in TLS, disk encryption, and secure communications.",
    steps: ["Key Expansion", "AddRoundKey (initial)", "SubBytes", "ShiftRows", "MixColumns", "AddRoundKey", "Repeat 9-13 rounds", "Final Round (no MixColumns)"],
    facts: [["Block Size", "128 bits"], ["Key Sizes", "128/192/256 bits"], ["Rounds", "10/12/14"], ["Structure", "SPN"], ["Standard", "FIPS 197"]],
    quiz: [
      { q: "What is the block size of AES?", opts: ["64 bits", "128 bits", "256 bits", "512 bits"], ans: 1 },
      { q: "Which structure does AES use?", opts: ["Feistel Network", "SPN (Substitution-Permutation)", "Stream Cipher", "OFB Mode"], ans: 1 },
      { q: "How many rounds does AES-256 use?", opts: ["10", "12", "14", "16"], ans: 2 },
    ],
  },
  {
    id: "des", icon: "key", color: "#F59E0B", label: "DES",
    title: "Data Encryption Standard",
    desc: "IBM symmetric cipher (1977). Considered insecure due to 56-bit key size. Replaced by AES. 3DES extends it using three sequential DES operations.",
    steps: ["Initial Permutation", "Key Schedule (16 subkeys)", "16 Feistel Rounds", "F-function: Expansion + S-boxes + P-box", "Final Permutation"],
    facts: [["Block Size", "64 bits"], ["Key Size", "56 bits"], ["Rounds", "16"], ["Status", "Deprecated"], ["Replaced by", "AES"]],
    quiz: [
      { q: "Why is DES considered insecure?", opts: ["Too many rounds", "56-bit key is too short", "Uses weak S-boxes", "No key schedule"], ans: 1 },
      { q: "How many Feistel rounds does DES use?", opts: ["8", "12", "16", "32"], ans: 2 },
    ],
  },
  {
    id: "sha", icon: "fingerprint", color: "#22D3EE", label: "SHA-256",
    title: "Secure Hash Algorithm (SHA-256)",
    desc: "Cryptographic hash producing a 256-bit digest. Used in TLS, Bitcoin, digital signatures, and file integrity verification. Part of the SHA-2 family.",
    steps: ["Message Padding", "Parse into 512-bit blocks", "Initialize hash values (H0-H7)", "Compression function (64 rounds)", "Concatenate final hash"],
    facts: [["Output", "256 bits"], ["Block", "512 bits"], ["Rounds", "64"], ["Family", "SHA-2"], ["One-way", "Yes"]],
    quiz: [
      { q: "What is the output size of SHA-256?", opts: ["128 bits", "160 bits", "256 bits", "512 bits"], ans: 2 },
      { q: "How many compression rounds does SHA-256 use?", opts: ["16", "32", "64", "128"], ans: 2 },
      { q: "SHA-256 belongs to which family?", opts: ["SHA-1", "SHA-2", "SHA-3", "MD family"], ans: 1 },
    ],
  },
  {
    id: "rsa", icon: "history_edu", color: "#A78BFA", label: "RSA",
    title: "RSA Public-Key Cryptography",
    desc: "Asymmetric encryption based on integer factorization difficulty. Used for key exchange and digital signatures. Named after Rivest, Shamir, Adleman (1977).",
    steps: ["Choose large primes p and q", "n = p × q", "φ(n) = (p-1)(q-1)", "Choose public exponent e", "Private key: d = e⁻¹ mod φ(n)", "Encrypt: c = mᵉ mod n", "Decrypt: m = cᵈ mod n"],
    facts: [["Key Size", "2048/4096 bits"], ["Type", "Asymmetric"], ["Use", "Encryption + Signing"], ["Based on", "Integer Factoring"], ["Named after", "Rivest, Shamir, Adleman"]],
    quiz: [
      { q: "RSA security relies on which hard problem?", opts: ["Discrete logarithm", "Integer factorization", "Graph isomorphism", "Lattice reduction"], ans: 1 },
      { q: "Which key is used for encryption in RSA?", opts: ["Private key", "Public key", "Symmetric key", "Session key"], ans: 1 },
    ],
  },
  {
    id: "birthday", icon: "security_update_warning", color: "#EF4444", label: "Birthday Attack",
    title: "Birthday Attack on Hash Functions",
    desc: "Exploits the birthday paradox — only √N operations needed to find a hash collision in a space of N values. Far fewer than the expected N operations for brute force.",
    steps: ["Generate random messages", "Hash each message", "Store hashes in a table", "Find two messages with same hash", "Exploit the collision"],
    facts: [["MD5 Collision", "~2⁶⁴ ops"], ["SHA-1 Collision", "~2⁸⁰ ops"], ["SHA-256 Collision", "~2¹²⁸ ops"], ["Defence", "Use SHA-256+"], ["Threat", "Forged signatures"]],
    quiz: [
      { q: "How many operations does a birthday attack need for N-bit hash?", opts: ["N operations", "N² operations", "√N (2^N/2) operations", "log(N) operations"], ans: 2 },
      { q: "Which hash is considered broken by birthday attacks?", opts: ["SHA-256", "SHA-3", "MD5", "BLAKE2"], ans: 2 },
    ],
  },
  {
    id: "firewall", icon: "shield", color: "#22C55E", label: "Firewall",
    title: "Network Firewall Concepts",
    desc: "A firewall monitors and controls incoming/outgoing network traffic based on security rules. Types include packet-filter, stateful inspection, and application-layer (WAF).",
    steps: ["Receive network packet", "Match against rule table (in order)", "Apply ALLOW or DENY action", "Log the decision", "Forward or DROP the packet"],
    facts: [["Types", "Packet/Stateful/WAF"], ["OSI Layer", "3 (Network) / 7 (App)"], ["Common Ports", "80, 443, 22, 3306"], ["Default action", "DROP (deny all)"]],
    quiz: [
      { q: "Which layer does a packet-filter firewall operate at?", opts: ["Layer 2 (Data Link)", "Layer 3 (Network)", "Layer 7 (Application)", "Layer 5 (Session)"], ans: 1 },
      { q: "What is the default-deny firewall principle?", opts: ["Allow all, deny specific", "Deny all, allow specific", "Allow internal, deny external", "Log everything"], ans: 1 },
    ],
  },
  {
    id: "ids", icon: "security", color: "#F87171", label: "IDS",
    title: "Intrusion Detection System",
    desc: "An IDS monitors network events and system logs for signs of malicious activity. Unlike IPS, it only detects — it does not block. Can be signature-based or anomaly-based.",
    steps: ["Capture network traffic / logs", "Pattern match (signatures)", "Anomaly scoring vs baseline", "Raise alert if threshold exceeded", "Log event and notify admin"],
    facts: [["Types", "NIDS / HIDS"], ["Methods", "Signature / Anomaly"], ["Response", "Passive (detect only)"], ["vs IPS", "IPS actively blocks"]],
    quiz: [
      { q: "What does IDS stand for?", opts: ["Internet Defense System", "Intrusion Detection System", "Internal Data Scanner", "Integrity Detection Suite"], ans: 1 },
      { q: "How does IDS differ from IPS?", opts: ["IDS is faster", "IDS only detects, IPS also blocks", "IDS is hardware, IPS is software", "No difference"], ans: 1 },
      { q: "Which IDS type analyzes host logs?", opts: ["NIDS", "HIDS", "WIDS", "FIDS"], ans: 1 },
    ],
  },
];

export default function LearningPage() {
  const [active, setActive]   = useState("aes");
  const [mode, setMode]       = useState("learn");   // "learn" | "quiz"
  const [qIdx, setQIdx]       = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore]     = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const topic = TOPICS.find((t) => t.id === active);
  const idx   = TOPICS.findIndex((t) => t.id === active);

  const switchTopic = (id) => {
    setActive(id);
    setMode("learn");
    setQIdx(0);
    setSelected(null);
    setScore(0);
    setQuizDone(false);
  };

  const startQuiz = () => {
    setQIdx(0); setSelected(null); setScore(0); setQuizDone(false);
    setMode("quiz");
  };

  const handleAnswer = (i) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === topic.quiz[qIdx].ans) setScore((s) => s + 1);
  };

  const nextQ = () => {
    if (qIdx + 1 >= topic.quiz.length) { setQuizDone(true); return; }
    setQIdx((q) => q + 1);
    setSelected(null);
  };

  const q = topic.quiz[qIdx];
  const pct = Math.round((score / topic.quiz.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-green" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            Learning Center
          </h1>
          <p className="text-sm text-sv-muted-fg mt-1">Explore information security concepts with interactive quizzes.</p>
        </div>
        {/* Progress pills */}
        <div className="flex gap-1 flex-wrap">
          {TOPICS.map((t) => (
            <div key={t.id} className="w-2 h-2 rounded-full transition-all" style={{ background: active === t.id ? t.color : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="glass-panel p-4 flex flex-col gap-1 lg:col-span-1">
          <p className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider mb-3">Topics ({TOPICS.length})</p>
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTopic(t.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
              style={{
                background: active === t.id ? `${t.color}15` : 'transparent',
                border: `1px solid ${active === t.id ? `${t.color}30` : 'transparent'}`,
              }}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ color: t.color, fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
              <span className="text-xs font-bold" style={{ color: active === t.id ? t.color : '#94A3B8' }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Header + mode toggle */}
          <section className="glass-panel p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${topic.color}15`, border: `1px solid ${topic.color}30` }}>
                  <span className="material-symbols-outlined" style={{ color: topic.color, fontVariationSettings: "'FILL' 1" }}>{topic.icon}</span>
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-on-surface">{topic.title}</h2>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: topic.color }}>{topic.label}</p>
                </div>
              </div>
              {/* Mode switcher */}
              <div className="flex gap-1 bg-sv-card rounded-lg p-1">
                {["learn", "quiz"].map((m) => (
                  <button key={m} onClick={() => m === "quiz" ? startQuiz() : setMode("learn")}
                    className="px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all"
                    style={{
                      background: mode === m ? `${topic.color}20` : 'transparent',
                      color: mode === m ? topic.color : '#64748B',
                      border: mode === m ? `1px solid ${topic.color}30` : '1px solid transparent',
                    }}>
                    {m === "quiz" ? "🧠 Quiz" : "📖 Learn"}
                  </button>
                ))}
              </div>
            </div>
            {mode === "learn" && (
              <p className="text-sm text-sv-muted-fg leading-relaxed mt-4">{topic.desc}</p>
            )}
          </section>

          {/* LEARN MODE */}
          {mode === "learn" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="glass-panel p-5">
                  <h3 className="font-display font-semibold text-on-surface text-sm mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400 text-lg">schema</span>How It Works
                  </h3>
                  <ol className="space-y-2.5">
                    {topic.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-sv-muted-fg">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                          style={{ background: `${topic.color}20`, border: `1px solid ${topic.color}30`, color: topic.color }}>{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </section>
                <section className="glass-panel p-5">
                  <h3 className="font-display font-semibold text-on-surface text-sm mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400 text-lg">info</span>Key Facts
                  </h3>
                  <div className="space-y-2">
                    {topic.facts.map(([label, val]) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-xs font-semibold uppercase text-sv-muted-fg tracking-wider">{label}</span>
                        <span className="text-xs font-bold font-mono text-on-surface px-2 py-1 rounded"
                          style={{ background: `${topic.color}10`, color: topic.color }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <div className="flex justify-between items-center">
                <button onClick={() => idx > 0 && switchTopic(TOPICS[idx - 1].id)} disabled={idx === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant/40 text-sv-muted-fg hover:bg-white/5 text-xs font-bold disabled:opacity-30 transition-all">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>Previous
                </button>
                <button onClick={startQuiz}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: `${topic.color}20`, border: `1px solid ${topic.color}30`, color: topic.color }}>
                  🧠 Take Quiz
                </button>
                <button onClick={() => idx < TOPICS.length - 1 && switchTopic(TOPICS[idx + 1].id)} disabled={idx === TOPICS.length - 1}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold disabled:opacity-30 transition-all"
                  style={{ background: `${topic.color}20`, border: `1px solid ${topic.color}30`, color: topic.color }}>
                  Next<span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </>
          )}

          {/* QUIZ MODE */}
          {mode === "quiz" && !quizDone && (
            <section className="glass-panel p-6 flex flex-col gap-6">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-mono text-sv-muted-fg mb-2">
                  <span>Question {qIdx + 1} of {topic.quiz.length}</span>
                  <span>Score: {score}/{qIdx}</span>
                </div>
                <div className="h-1 rounded-full bg-white/10">
                  <div className="h-1 rounded-full transition-all duration-500"
                    style={{ width: `${((qIdx) / topic.quiz.length) * 100}%`, background: topic.color }} />
                </div>
              </div>
              {/* Question */}
              <div>
                <p className="text-base font-bold text-on-surface mb-4">{q.q}</p>
                <div className="flex flex-col gap-2.5">
                  {q.opts.map((opt, i) => {
                    let style = {};
                    let cls = "px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all border cursor-pointer";
                    if (selected === null) {
                      style = { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#CBD5E1' };
                    } else if (i === q.ans) {
                      style = { background: 'rgba(34,197,94,0.15)', borderColor: '#22C55E', color: '#22C55E' };
                    } else if (i === selected && i !== q.ans) {
                      style = { background: 'rgba(239,68,68,0.15)', borderColor: '#EF4444', color: '#F87171' };
                    } else {
                      style = { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', color: '#475569' };
                    }
                    return (
                      <button key={i} onClick={() => handleAnswer(i)} className={cls} style={style}>
                        <span className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border text-[11px] flex items-center justify-center flex-shrink-0 font-bold"
                            style={{ borderColor: 'currentColor' }}>{String.fromCharCode(65 + i)}</span>
                          {opt}
                          {selected !== null && i === q.ans && <span className="material-symbols-outlined text-[18px] ml-auto">check_circle</span>}
                          {selected !== null && i === selected && i !== q.ans && <span className="material-symbols-outlined text-[18px] ml-auto">cancel</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {selected !== null && (
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold" style={{ color: selected === q.ans ? '#22C55E' : '#F87171' }}>
                    {selected === q.ans ? "✓ Correct!" : `✗ Incorrect. Answer: ${q.opts[q.ans]}`}
                  </p>
                  <button onClick={nextQ}
                    className="px-5 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{ background: topic.color, color: '#0F172A' }}>
                    {qIdx + 1 >= topic.quiz.length ? "See Results" : "Next →"}
                  </button>
                </div>
              )}
            </section>
          )}

          {/* QUIZ RESULTS */}
          {mode === "quiz" && quizDone && (
            <section className="glass-panel p-8 text-center flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `${topic.color}15`, border: `3px solid ${topic.color}40` }}>
                <span className="text-3xl font-black" style={{ color: topic.color }}>{pct}%</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-on-surface">Quiz Complete!</h3>
                <p className="text-sm text-sv-muted-fg mt-1">
                  You scored <strong style={{ color: topic.color }}>{score} of {topic.quiz.length}</strong> questions correctly.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={startQuiz}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: `${topic.color}15`, border: `1px solid ${topic.color}30`, color: topic.color }}>
                  Try Again
                </button>
                <button onClick={() => setMode("learn")}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: topic.color, color: '#0F172A' }}>
                  Back to Learn
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
