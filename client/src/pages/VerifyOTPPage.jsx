import { useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

export default function VerifyOTPPage() {
  const navigate      = useNavigate();
  const { state }     = useLocation();
  const { login }     = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);

  const handleDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const v = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (v.length === 6) { setOtp(v.split("")); refs.current[5]?.focus(); }
  };

  const submit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) { toast.error("Enter all 6 digits"); return; }
    setLoading(true);
    try {
      const { data } = await authService.verifyOTP({ userId: state?.userId, otp: code });
      login(data.token, data.user);
      toast.success("Email verified! Welcome to SecureVault.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await authService.resendOTP({ userId: state?.userId });
      toast.success("OTP resent!");
    } catch {
      toast.error("Resend failed");
    }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: "#0F172A" }}>
      <div className="absolute inset-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%2322C55E07' stroke-width='1'/%3E%3C/svg%3E\")" }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[120px] opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #22C55E, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", boxShadow: "0 0 20px rgba(34,197,94,0.15)" }}
          >
            <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}>
              mark_email_unread
            </span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-2xl text-sv-fg mb-2">Verify Your Email</h1>
          <p className="text-sm text-sv-muted-fg leading-relaxed">
            We sent a 6-digit code to{" "}
            <strong className="text-sv-fg font-mono">{state?.email || "your email"}</strong>
          </p>
        </div>

        <form onSubmit={submit} className="glass-terminal p-7 flex flex-col gap-6">
          {/* OTP inputs */}
          <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                value={d}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                maxLength={1}
                inputMode="numeric"
                aria-label={`OTP digit ${i + 1}`}
                className="w-11 h-13 rounded-lg text-center text-xl font-display font-bold text-sv-fg transition-all focus:outline-none"
                style={{
                  height: "52px",
                  background: "#080F1E",
                  border: d ? "2px solid #22C55E" : "1px solid rgba(46,58,82,0.8)",
                  boxShadow: d ? "0 0 12px rgba(34,197,94,0.25)" : "none",
                  color: d ? "#22C55E" : "#F1F5F9",
                }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="flex gap-1">
            {[0,1,2,3,4,5].map((i) => (
              <div
                key={i}
                className="h-0.5 flex-1 rounded-full transition-all duration-300"
                style={{ background: i < filled ? "#22C55E" : "rgba(46,58,82,0.8)" }}
              />
            ))}
          </div>

          <button type="submit" disabled={loading || filled < 6} className="btn-primary w-full py-3">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-sv-bg/30 border-t-sv-bg rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>verified</span>
                Verify Account
              </>
            )}
          </button>

          <div className="flex justify-between text-xs font-mono">
            <button type="button" onClick={resend} className="text-sv-green hover:underline">Resend code</button>
            <Link to="/login" className="text-sv-muted-fg hover:text-sv-green">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
