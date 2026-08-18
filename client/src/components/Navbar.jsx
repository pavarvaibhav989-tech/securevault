import { Menu, Bell, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

const pageTitle = {
  "/dashboard": "Dashboard",
  "/encrypt":   "Encryption Lab",
  "/hash":      "Hash Generator",
  "/rsa":       "Digital Signature",
  "/chat":      "Secure Chat",
  "/firewall":  "Firewall Simulator",
  "/ids":       "Intrusion Detection",
  "/learn":     "Learning Center",
  "/birthday":  "Birthday Attack",
  "/profile":   "Profile",
  "/admin":     "Admin Panel",
};

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const location = useLocation();
  const title    = pageTitle[location.pathname] || "SecureVault";
  const now      = new Date();
  const timeStr  = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <header
      className="sticky top-0 z-30 flex justify-between items-center px-4 lg:px-5 py-3 w-full"
      style={{
        background:     "rgba(10, 15, 28, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom:   "1px solid rgba(34,197,94,0.1)",
      }}
    >
      {/* Left: burger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-btn"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-sv-muted-fg hover:text-sv-fg hover:bg-white/5 transition-all"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-sv-green opacity-60 hidden sm:block" />
          <span className="text-sv-muted-fg text-xs font-mono hidden sm:block opacity-50">/</span>
          <h2 className="font-display font-semibold text-sm text-sv-fg tracking-wide">
            {title}
          </h2>
        </div>
      </div>

      {/* Right: clock + notifications + avatar */}
      <div className="flex items-center gap-2">
        {/* Live clock */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold"
          style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)", color: "#22C55E" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sv-green animate-pulse" />
          SECURE
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg text-sv-muted-fg hover:text-sv-fg hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#22C55E" }}
          />
        </button>

        {/* Avatar */}
        <Link
          to="/profile"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
            style={{
              background: "rgba(34,197,94,0.15)",
              border:     "1px solid rgba(34,197,94,0.35)",
              color:      "#22C55E",
            }}
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="text-xs font-medium text-sv-muted-fg hidden sm:block truncate max-w-[80px]">
            {user?.name}
          </span>
        </Link>
      </div>
    </header>
  );
}
