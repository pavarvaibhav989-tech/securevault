import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../services/authService";

const RULES = [
  { test: (v) => v.length >= 8,       label: "At least 8 characters" },
  { test: (v) => /[A-Z]/.test(v),     label: "Uppercase letter" },
  { test: (v) => /[a-z]/.test(v),     label: "Lowercase letter" },
  { test: (v) => /\d/.test(v),        label: "Number" },
  { test: (v) => /[@$!%*?&]/.test(v), label: "Special character (@$!%*?&)" },
];

function StrengthBar({ password }) {
  const score = RULES.filter((r) => r.test(password)).length;
  const colors = ["#EF4444", "#F97316", "#F59E0B", "#22D3EE", "#22C55E"];
  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0,1,2,3,4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score - 1] : "rgba(46,58,82,0.8)" }}
          />
        ))}
      </div>
      {password && (
        <p className="text-[10px] font-mono" style={{ color: colors[score - 1] || "#475569" }}>
          {score > 0 ? labels[score - 1] : ""}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    if (!RULES.every((r) => r.test(form.password))) { toast.error("Password does not meet requirements"); return; }
    setLoading(true);
    try {
      const { data } = await authService.register({ name: form.name, email: form.email, password: form.password });
      toast.success("Account created! Check your email for the OTP.");
      navigate("/verify-otp", { state: { userId: data.userId, email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmMatch = form.confirm ? form.confirm === form.password : null;

  return (
    <div className="min-h-screen flex" style={{ background: "#0F172A" }}>
      {/* ── Left: Feature panel ──────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-center px-12 w-[42%] relative overflow-hidden"
        style={{ borderRight: "1px solid rgba(34,197,94,0.12)" }}
      >
        <div className="absolute inset-0"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%2322C55E07' stroke-width='1'/%3E%3C/svg%3E\")" }}
        />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-15"
          style={{ background: "radial-gradient(circle, #22C55E, transparent 70%)" }} />

        <div className="relative z-10">
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

          <h2 className="font-display font-bold text-2xl text-sv-fg mb-3">
            Join the platform
          </h2>
          <p className="text-sm text-sv-muted-fg mb-10 leading-relaxed">
            Get instant access to 8 interactive security modules — completely free.
          </p>

          <div className="space-y-4">
            {[
              { icon: "science",    label: "Encryption Lab",      sub: "AES, DES, 3DES demos" },
              { icon: "security",   label: "Intrusion Detection", sub: "Real-time monitoring" },
              { icon: "forum",      label: "Secure Chat",         sub: "E2E encrypted messaging" },
              { icon: "school",     label: "Learning Center",     sub: "Interactive guides" },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  <span className="material-symbols-outlined text-sv-green" style={{ fontSize: "16px" }}>{icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-sv-fg">{label}</p>
                  <p className="text-[11px] text-sv-muted-fg">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Register form ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0"
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
            <h1 className="font-display font-bold text-2xl text-sv-fg mb-1">Create account</h1>
            <p className="text-sm text-sv-muted-fg">Free forever — no credit card needed</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Name */}
            <div>
              <label htmlFor="reg-name" className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sv-border-hi text-[17px]">person</span>
                <input id="reg-name" name="name" type="text" required value={form.name} onChange={handle} placeholder="Vaibhav Pawar" className="input-sv pl-9" autoComplete="name" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sv-border-hi text-[17px]">mail</span>
                <input id="reg-email" name="email" type="email" required value={form.email} onChange={handle} placeholder="you@example.com" className="input-sv pl-9" autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sv-border-hi text-[17px]">lock</span>
                <input
                  id="reg-password" name="password"
                  type={showPass ? "text" : "password"}
                  required value={form.password} onChange={handle}
                  placeholder="Strong password"
                  className="input-sv pl-9 pr-10"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sv-border-hi hover:text-sv-fg transition-colors"
                  aria-label={showPass ? "Hide password" : "Show password"}>
                  <span className="material-symbols-outlined text-[17px]">{showPass ? "visibility_off" : "visibility"}</span>
                </button>
              </div>

              {/* Strength bar */}
              {form.password && <StrengthBar password={form.password} />}

              {/* Rules */}
              {form.password && (
                <div className="mt-2 grid grid-cols-1 gap-0.5">
                  {RULES.map((r) => (
                    <div key={r.label} className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: r.test(form.password) ? "#22C55E" : "#475569" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                        {r.test(form.password) ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label htmlFor="reg-confirm" className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-muted-fg block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sv-border-hi text-[17px]">lock</span>
                <input
                  id="reg-confirm" name="confirm" type="password"
                  required value={form.confirm} onChange={handle}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className="input-sv pl-9"
                  style={form.confirm ? { borderColor: confirmMatch ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)" } : {}}
                />
                {form.confirm && (
                  <span
                    className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[17px]"
                    style={{ color: confirmMatch ? "#22C55E" : "#EF4444" }}
                  >
                    {confirmMatch ? "check_circle" : "cancel"}
                  </span>
                )}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-sv-bg/30 border-t-sv-bg rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>person_add</span>
                  Create Account
                </>
              )}
            </button>

            <p className="text-center text-xs text-sv-muted-fg">
              Already have an account?{" "}
              <Link to="/login" className="text-sv-green hover:underline font-semibold">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
