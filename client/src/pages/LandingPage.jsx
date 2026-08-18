import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const FEATURES = [
  { icon: "science",                 label: "Encryption Lab",       desc: "AES, DES, 3DES — encrypt & decrypt in real time",       color: "#22C55E"  },
  { icon: "fingerprint",             label: "Hash Generator",       desc: "MD5, SHA-256, SHA-512 with avalanche effect demo",       color: "#22D3EE"  },
  { icon: "history_edu",             label: "Digital Signatures",   desc: "RSA key pairs — sign, verify & export messages",        color: "#A78BFA"  },
  { icon: "forum",                   label: "Secure Chat",          desc: "AES-256 end-to-end encrypted real-time messaging",      color: "#22C55E"  },
  { icon: "shield",                  label: "Firewall Simulator",   desc: "Packet-filtering rules with live traffic visualization", color: "#22D3EE"  },
  { icon: "security",                label: "Intrusion Detection",  desc: "Real-time anomaly detection and quarantine engine",      color: "#F59E0B"  },
  { icon: "security_update_warning", label: "Birthday Attack",      desc: "Hash collision via birthday paradox — interactive demo", color: "#EF4444"  },
  { icon: "school",                  label: "Learning Center",      desc: "Interactive IS concept guides & reference sheets",       color: "#A78BFA"  },
];

const STATS = [
  { value: "8",    label: "Security Modules" },
  { value: "100%", label: "Open Source"      },
  { value: "E2E",  label: "Encrypted Chat"   },
  { value: "Live", label: "Threat Detection" },
];

function TypingText({ texts, speed = 90, pause = 1800 }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx]             = useState(0);
  const [charIdx, setCharIdx]     = useState(0);
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    const current = texts[idx];
    let timeout;
    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else {
      setDeleting(false);
      setIdx((i) => (i + 1) % texts.length);
    }
    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, idx, texts, speed, pause]);

  return (
    <span className="text-sv-green">
      {displayed}
      <span className="terminal-cursor" />
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen text-sv-fg font-sans overflow-x-hidden" style={{ background: "#0F172A" }}>

      {/* ── Background ───────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-100"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%2322C55E08' stroke-width='1'/%3E%3C/svg%3E\")" }}
        />
        {/* Radial glows */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-30 blur-[120px]"
          style={{ background: "radial-gradient(ellipse, rgba(34,197,94,0.25) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full opacity-15 blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)" }} />
      </div>

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <header
        className="fixed top-0 w-full z-50 flex items-center justify-between px-6 lg:px-10 py-3.5"
        style={{
          background:     "rgba(10,15,28,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom:   "1px solid rgba(34,197,94,0.12)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
          </div>
          <span className="font-display font-bold text-sv-fg text-base tracking-tight">SecureVault</span>
          <span
            className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22C55E" }}
          >
            <span className="w-1 h-1 rounded-full bg-sv-green animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg text-sv-muted-fg hover:text-sv-fg hover:bg-white/5 text-sm font-mono font-medium transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="btn-primary text-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>rocket_launch</span>
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        {/* Tag */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-mono font-bold uppercase tracking-widest"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#22C55E" }}
        >
          <span className="w-2 h-2 rounded-full bg-sv-green animate-pulse" />
          CY5008 · Information Security Project
        </div>

        {/* Headline */}
        <h1
          className="font-display font-bold text-sv-fg mb-6 leading-tight"
          style={{ fontSize: "clamp(2.2rem, 6.5vw, 4.5rem)", letterSpacing: "-0.03em" }}
        >
          Security Tools,
          <br />
          <TypingText texts={["Built Interactive.", "Made Visual.", "Fully Open.", "100% Hands-on."]} />
        </h1>

        <p className="text-base text-sv-muted-fg max-w-2xl mb-10 leading-relaxed">
          Explore the full lifecycle of information security — from symmetric & asymmetric cryptography,
          hash functions, digital signatures, to firewall simulation and real-time intrusion detection.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link to="/register" className="btn-primary text-sm">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>rocket_launch</span>
            Start Exploring
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-mono font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border:     "1px solid rgba(255,255,255,0.1)",
              color:      "#94A3B8",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>login</span>
            Sign In
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center py-4 px-2 rounded-xl"
              style={{ background: "rgba(27,35,54,0.6)", border: "1px solid rgba(46,58,82,0.7)" }}
            >
              <span className="font-display font-bold text-2xl text-sv-green">{value}</span>
              <span className="text-[10px] font-mono text-sv-muted-fg uppercase tracking-wider mt-1">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.15em] text-sv-green mb-3">
              // What's inside
            </p>
            <h2 className="font-display font-bold text-3xl text-sv-fg mb-4">8 Security Modules</h2>
            <p className="text-sv-muted-fg max-w-lg mx-auto text-sm leading-relaxed">
              Everything you need to understand and demonstrate modern information security concepts interactively.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon, label, desc, color }, i) => (
              <div
                key={label}
                className="glass-card-hover p-5 flex flex-col gap-3"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}14`, border: `1px solid ${color}30` }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1", color }}
                  >
                    {icon}
                  </span>
                </div>
                <div>
                  <p className="font-display font-semibold text-sv-fg text-sm mb-1">{label}</p>
                  <p className="text-xs text-sv-muted-fg leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div
          className="max-w-2xl mx-auto text-center p-10 rounded-2xl relative overflow-hidden"
          style={{
            background:   "rgba(27,35,54,0.8)",
            border:       "1px solid rgba(34,197,94,0.2)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* subtle glow behind */}
          <div className="absolute inset-0 -z-10 blur-[80px] opacity-20"
            style={{ background: "radial-gradient(circle, rgba(34,197,94,0.4), transparent 70%)" }} />

          <span
            className="material-symbols-outlined text-sv-green mb-4 block"
            style={{ fontSize: "40px", fontVariationSettings: "'FILL' 1" }}
          >
            shield
          </span>
          <h2 className="font-display font-bold text-2xl text-sv-fg mb-3">Ready to Dive In?</h2>
          <p className="text-sv-muted-fg text-sm mb-6 leading-relaxed">
            Create your free account and get instant access to all 8 security modules.
          </p>
          <Link to="/register" className="btn-primary">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer
        className="py-6 border-t text-center"
        style={{ borderColor: "rgba(34,197,94,0.1)" }}
      >
        <p className="text-[11px] font-mono text-sv-muted-fg opacity-60">
          © 2024 SecureVault · CY5008 Information Security Project · Vaibhav Pawar
        </p>
      </footer>
    </div>
  );
}
