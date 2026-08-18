import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

const TERMINAL_LINES = [
  "$ initializing secure connection...",
  "$ TLS 1.3 handshake complete",
  "$ AES-256 session key established",
  "$ authentication gateway ready",
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm]           = useState({ email: "", password: "" });
  const [captcha, setCaptcha]     = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => { if (isAuthenticated) navigate("/dashboard"); }, [isAuthenticated]);
  useEffect(() => { fetchCaptcha(); }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setVisibleLines((v) => (v < TERMINAL_LINES.length ? v + 1 : v));
    }, 600);
    return () => clearInterval(id);
  }, []);

  const fetchCaptcha = async () => {
    try {
      const { data } = await authService.getCaptcha();
      setCaptcha(data.data);
      setCaptchaAnswer("");
    } catch { /* optional */ }
  };

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (captcha && captchaAnswer) payload.captchaAnswer = parseInt(captchaAnswer);
      const { data } = await authService.login(payload);
      login(data.token, data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0F172A" }}>
      {/* ── Left: Terminal panel ─────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-center px-12 w-[45%] relative overflow-hidden"
        style={{ borderRight: "1px solid rgba(34,197,94,0.12)" }}
      >
        {/* Background grid */}
        <div className="absolute inset-0 opacity-100"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%2322C55E07' stroke-width='1'/%3E%3C/svg%3E\")" }}
        />
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[120px] opacity-15"
          style={{ background: "radial-gradient(circle, #22C55E, transparent 70%)" }} />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)" }}
            >
              <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
            </div>
            <div>
              <p className="font-display font-bold text-sv-fg text-base">SecureVault</p>
              <p className="text-[10px] font-mono text-sv-green/60 uppercase tracking-widest">SOC Command Center</p>
            </div>
          </div>

          {/* Terminal window */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "rgba(8,15,30,0.9)", border: "1px solid rgba(34,197,94,0.18)" }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-2 px-4 py-2.5"
              style={{ borderBottom: "1px solid rgba(34,197,94,0.12)" }}
            >
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#22C55E" }} />
              </div>
              <span className="font-mono text-[11px] text-sv-muted-fg ml-2">secure_terminal ~ auth</span>
            </div>
            {/* Terminal output */}
            <div className="p-5 font-mono text-[12px] leading-7 min-h-[160px]">
              {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                <div key={i} style={{ color: i === visibleLines - 1 ? "#22C55E" : "#4ADE80" }}>
                  {line}
                </div>
              ))}
              {visibleLines < TERMINAL_LINES.length && (
                <span className="text-sv-green terminal-cursor" />
              )}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {[
              { icon: "lock", text: "AES-256-GCM encryption" },
              { icon: "fingerprint", text: "Biometric-ready auth" },
              { icon: "verified_user", text: "Zero-trust architecture" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-sv-muted-fg">
                <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>
                  {icon}
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Login form ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 opacity-100"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%2322C55E05' stroke-width='1'/%3E%3C/svg%3E\")" }}
        />

        <div className="relative z-10 w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <span className="font-display font-bold text-sv-fg">SecureVault</span>
          </div>

          <div className="mb-7">
            <h1 className="font-display font-bold text-2xl text-sv-fg mb-1">Welcome back</h1>
            <p className="text-sm text-sv-muted-fg">Sign in to your secure workspace</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sv-border-hi text-[17px]">
                  mail
                </span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handle}
                  placeholder="you@example.com"
                  className="input-sv pl-9"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password" className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[10px] font-mono text-sv-green hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sv-border-hi text-[17px]">
                  lock
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handle}
                  placeholder="Your password"
                  className="input-sv pl-9 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sv-border-hi hover:text-sv-fg transition-colors"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {showPass ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            {captcha && (
              <div>
                <label className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">
                  CAPTCHA —{" "}
                  <span className="text-sv-green normal-case font-bold">{captcha.question}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="captcha-answer"
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Answer"
                    className="input-sv flex-1"
                  />
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="px-3 rounded-lg transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(46,58,82,0.8)", color: "#94A3B8" }}
                  >
                    <span className="material-symbols-outlined text-[17px]">refresh</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-1"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-sv-bg/30 border-t-sv-bg rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>login</span>
                  Sign In
                </>
              )}
            </button>

            <p className="text-center text-xs text-sv-muted-fg">
              No account?{" "}
              <Link to="/register" className="text-sv-green hover:underline font-semibold">
                Create one free
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
