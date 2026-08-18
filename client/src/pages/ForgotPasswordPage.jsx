import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
      toast.success("Password reset email sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: "#0F172A" }}>
      <div className="absolute inset-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%2322C55E07' stroke-width='1'/%3E%3C/svg%3E\")" }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[120px] opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.5), transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", boxShadow: "0 0 20px rgba(59,130,246,0.15)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1", color: "#3B82F6" }}>
              lock_reset
            </span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-2xl text-sv-fg mb-2">Reset Password</h1>
          <p className="text-sm text-sv-muted-fg">Enter your email and we'll send you a secure reset link.</p>
        </div>

        {!sent ? (
          <form onSubmit={submit} className="glass-terminal p-7 flex flex-col gap-5">
            <div>
              <label htmlFor="forgot-email" className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sv-border-hi text-[17px]">mail</span>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-sv pl-9"
                  autoComplete="email"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-sv-bg/30 border-t-sv-bg rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>send</span>
                  Send Reset Link
                </>
              )}
            </button>

            <Link to="/login" className="text-center text-xs font-mono text-sv-muted-fg hover:text-sv-green transition-colors">
              ← Back to login
            </Link>
          </form>
        ) : (
          <div
            className="glass-terminal p-8 flex flex-col items-center gap-5 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>
                mark_email_read
              </span>
            </div>
            <div>
              <p className="text-sv-fg font-semibold mb-1">Check your inbox</p>
              <p className="text-sm text-sv-muted-fg">Reset link sent to <strong className="text-sv-fg font-mono">{email}</strong>. Expires in 30 minutes.</p>
            </div>
            <Link to="/login" className="text-sv-green text-sm font-mono font-semibold hover:underline">
              ← Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
