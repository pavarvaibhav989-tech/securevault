import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { dashboardService } from "../services/dashboardService";

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({ name: user?.name || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handlePw = (e) => setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Load login history when tab switches
  useEffect(() => {
    if (tab === "activity" && history.length === 0) {
      setHistoryLoading(true);
      authService.getLoginHistory()
        .then(({ data }) => setHistory(data.data || []))
        .catch(() => toast.error("Failed to load login history"))
        .finally(() => setHistoryLoading(false));
    }
  }, [tab]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateProfile(form);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: "profile",  icon: "person",   label: "Profile" },
    { id: "security", icon: "security", label: "Security" },
    { id: "activity", icon: "history",  label: "Login History" },
  ];

  const STATUS_COLORS = {
    SUCCESS: "text-tertiary bg-tertiary/10 border-tertiary/30",
    FAILED:  "text-sv-red bg-error/10 border-error/30",
    LOCKED:  "text-secondary bg-secondary/10 border-secondary/30",
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-xl text-sv-fg flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_circle</span>Profile
        </h1>
        <p className="text-sm text-sv-muted-fg mt-1">Manage your account and security settings.</p>
      </div>

      {/* Avatar card */}
      <section className="glass-panel p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-on-primary font-display font-bold text-2xl sm:text-3xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #adc6ff, #4cd7f6)" }}
        >
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <h2 className="font-display font-bold text-lg sm:text-xl text-on-surface truncate">{user?.name}</h2>
          <p className="text-sm text-sv-muted-fg truncate">{user?.email}</p>
          <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {user?.role || "user"}
          </span>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-1 bg-sv-card rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${tab === t.id ? "bg-sv-card text-primary shadow-sm" : "text-sv-muted-fg hover:text-on-surface"}`}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <section className="glass-panel p-5 sm:p-6 animate-fade-in">
          <h2 className="font-display font-semibold text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">edit</span>Edit Profile
          </h2>
          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">person</span>
                <input name="name" value={form.name} onChange={handle} className="input-sv pl-9" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">Email (read-only)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">mail</span>
                <input value={user?.email} readOnly className="input-sv pl-9 opacity-50 cursor-not-allowed" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #adc6ff, #4cd7f6)" }}
            >
              <span className="material-symbols-outlined text-sm">save</span>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <section className="glass-panel p-5 sm:p-6 animate-fade-in">
          <h2 className="font-display font-semibold text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-sv-red">lock_reset</span>Change Password
          </h2>
          <form onSubmit={changePassword} className="flex flex-col gap-4">
            {[["currentPassword","Current Password"],["newPassword","New Password"],["confirmPassword","Confirm New Password"]].map(([name, label]) => (
              <div key={name}>
                <label className="text-xs font-bold uppercase text-sv-muted-fg tracking-wider block mb-1">{label}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">lock</span>
                  <input name={name} type="password" value={pwForm[name]} onChange={handlePw} className="input-sv pl-9" />
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-error/20 border border-error/40 text-sv-red font-bold text-xs uppercase tracking-wider hover:bg-error/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">lock_reset</span>
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </section>
      )}

      {/* Activity tab */}
      {tab === "activity" && (
        <section className="glass-panel overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">history</span>
            <h2 className="font-display font-semibold text-on-surface">Login History</h2>
          </div>
          {historyLoading ? (
            <div className="flex items-center justify-center h-24 text-sv-muted-fg">
              <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
              Loading...
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-sv-muted-fg/50">
              <span className="material-symbols-outlined text-3xl">history</span>
              <span className="text-sm">No login history yet.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-sv-card/50 text-xs font-bold uppercase text-sv-muted-fg">
                    {["Status","IP Address","Browser","OS","Date"].map((h) => (
                      <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[h.status] || "text-sv-muted-fg"}`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-sv-muted-fg">{h.ipAddress}</td>
                      <td className="px-4 py-3 text-xs">{h.browser}</td>
                      <td className="px-4 py-3 text-xs">{h.os}</td>
                      <td className="px-4 py-3 text-xs text-sv-muted-fg whitespace-nowrap">
                        {new Date(h.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

