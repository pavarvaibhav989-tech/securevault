import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/dashboard",  icon: "dashboard",                label: "Dashboard",          tag: null },
  { path: "/encrypt",    icon: "science",                  label: "Encryption Lab",     tag: null },
  { path: "/rsa",        icon: "history_edu",              label: "Digital Signature",  tag: null },
  { path: "/chat",       icon: "forum",                    label: "Secure Chat",        tag: "live" },
  { path: "/hash",       icon: "fingerprint",              label: "Hash Generator",     tag: null },
  { path: "/birthday",   icon: "security_update_warning",  label: "Birthday Attack",    tag: null },
  { path: "/firewall",   icon: "shield",                   label: "Firewall Sim",       tag: null },
  { path: "/ids",        icon: "security",                 label: "Intrusion Detection",tag: "live" },
  { path: "/learn",      icon: "school",                   label: "Learning Center",    tag: null },
];

export default function Sidebar({ isOpen, onToggle }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar column ─────────────────────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-60 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background:   "rgba(11, 17, 33, 0.95)",
          backdropFilter:"blur(20px)",
          WebkitBackdropFilter:"blur(20px)",
          borderRight:  "1px solid rgba(34,197,94,0.12)",
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <div className="px-5 py-5 border-b border-sv-border/40">
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <span
                className="material-symbols-outlined text-sv-green text-base"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: "16px" }}
              >
                shield
              </span>
            </div>
            <span className="font-display font-bold text-sv-fg text-base tracking-tight">
              SecureVault
            </span>
          </div>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-sv-green/60 ml-9">
            SOC Command Center
          </p>
        </div>

        {/* ── System status pill ────────────────────────────────────── */}
        <div className="px-5 py-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider"
            style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", color: "#22C55E" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sv-green opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sv-green" />
            </span>
            All Systems Nominal
          </div>
        </div>

        {/* ── Nav items ─────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-2 flex flex-col gap-0.5 no-scrollbar">
          <p className="px-2 pt-1 pb-2 text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-border-hi">
            Navigation
          </p>

          {navItems.map(({ path, icon, label, tag }) => (
            <Link
              key={path}
              to={path}
              onClick={() => window.innerWidth < 1024 && onToggle()}
              className={isActive(path) ? "sv-nav-item-active" : "sv-nav-item"}
            >
              <span
                className="material-symbols-outlined flex-shrink-0"
                style={{
                  fontSize: "18px",
                  fontVariationSettings: isActive(path) ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {icon}
              </span>
              <span className="flex-1 truncate">{label}</span>
              {tag === "live" && (
                <span className="w-1.5 h-1.5 rounded-full bg-sv-green animate-pulse flex-shrink-0" />
              )}
            </Link>
          ))}

          {isAdmin && (
            <>
              <p className="px-2 pt-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-[0.12em] text-sv-border-hi">
                Admin
              </p>
              <Link
                to="/admin"
                onClick={() => window.innerWidth < 1024 && onToggle()}
                className={isActive("/admin") ? "sv-nav-item-active" : "sv-nav-item"}
              >
                <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: "18px" }}>
                  admin_panel_settings
                </span>
                <span>Admin Panel</span>
              </Link>
            </>
          )}
        </nav>

        {/* ── Bottom section ────────────────────────────────────────── */}
        <div
          className="px-3 py-3 border-t flex flex-col gap-0.5"
          style={{ borderColor: "rgba(34,197,94,0.1)" }}
        >
          <Link
            to="/profile"
            onClick={() => window.innerWidth < 1024 && onToggle()}
            className={isActive("/profile") ? "sv-nav-item-active" : "sv-nav-item"}
          >
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: "18px" }}>
              account_circle
            </span>
            <span>Profile</span>
          </Link>

          <button
            onClick={handleLogout}
            className="sv-nav-item w-full text-left"
            style={{ color: "rgba(248,113,113,0.7)" }}
          >
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: "18px" }}>
              logout
            </span>
            <span>Sign Out</span>
          </button>

          {/* User chip */}
          <div
            className="mt-2 mx-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
            style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
              style={{ background: "rgba(34,197,94,0.2)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sv-fg truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-sv-muted-fg truncate font-mono">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
