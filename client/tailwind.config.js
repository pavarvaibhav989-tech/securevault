/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    "bg-white/3","bg-white/8","bg-white/10","hover:bg-white/5","hover:bg-white/8","hover:bg-white/10",
    "focus:bg-white/8","focus:bg-white/10","border-l-4","border-l-sv-green","border-l-sv-red",
    "border-l-sv-blue","border-l-sv-amber","col-span-8","col-span-4","col-span-12",
    "md:col-span-8","md:col-span-4","sm:grid-cols-2","lg:grid-cols-4",
  ],
  theme: {
    extend: {
      colors: {
        // ── UI/UX Pro Max Skill Design System ──────────────────────────────
        "sv-bg":       "#0F172A",   // Background
        "sv-card":     "#1B2336",   // Card surface
        "sv-muted":    "#272F42",   // Muted surface
        "sv-border":   "#2E3A52",   // Default border
        "sv-border-hi":"#475569",   // High-contrast border
        "sv-fg":       "#F8FAFC",   // Foreground text
        "sv-muted-fg": "#94A3B8",   // Muted foreground
        "sv-green":    "#22C55E",   // Accent / CTA (status green)
        "sv-green-dim":"#16A34A",   // Darker green
        "sv-red":      "#EF4444",   // Destructive
        "sv-amber":    "#F59E0B",   // Warning
        "sv-blue":     "#3B82F6",   // Info
        "sv-cyan":     "#22D3EE",   // Secondary accent
        // Legacy Material3 tokens (kept for backward-compat)
        primary:       "#22C55E",
        "on-primary":  "#052E16",
        "primary-container":"#16A34A",
        "on-primary-container":"#DCFCE7",
        secondary:     "#22D3EE",
        "on-secondary": "#083344",
        "secondary-container":"#0E7490",
        "on-secondary-container":"#CFFAFE",
        tertiary:      "#A78BFA",
        "on-tertiary": "#2E1065",
        "tertiary-container":"#6D28D9",
        "on-tertiary-container":"#EDE9FE",
        error:         "#F87171",
        "on-error":    "#7F1D1D",
        "error-container":"#991B1B",
        "on-error-container":"#FEE2E2",
        surface:       "#0F172A",
        "surface-dim": "#0B1221",
        "surface-bright":"#1E293B",
        "surface-container-lowest":"#080F1E",
        "surface-container-low": "#111827",
        "surface-container":     "#1B2336",
        "surface-container-high":"#222D42",
        "surface-container-highest":"#2C3A52",
        "surface-variant":"#1E293B",
        "on-surface":  "#F1F5F9",
        "on-surface-variant":"#94A3B8",
        "inverse-surface":"#E2E8F0",
        "inverse-on-surface":"#1E293B",
        background:    "#0F172A",
        "on-background":"#F1F5F9",
        outline:       "#475569",
        "outline-variant":"#2E3A52",
        // Threat severity
        threat: {
          low:      "#22C55E",
          medium:   "#F59E0B",
          high:     "#EF4444",
          critical: "#DC2626",
        },
      },
      fontFamily: {
        // Skill: JetBrains Mono → headings/display, Fira Sans → body
        sans:    ["Fira Sans", "Inter", "system-ui", "sans-serif"],
        display: ["JetBrains Mono", "Fira Code", "monospace"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "cyber-grid": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%2322C55E0A' stroke-width='1'/%3E%3C/svg%3E\")",
        "dot-grid":   "radial-gradient(#22C55E18 1px, transparent 1px)",
        "gradient-radial":"radial-gradient(var(--tw-gradient-stops))",
        "sv-hero":    "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,197,94,0.15) 0%, transparent 60%)",
      },
      boxShadow: {
        "glow-green":  "0 0 20px rgba(34,197,94,0.35)",
        "glow-green-sm":"0 0 10px rgba(34,197,94,0.2)",
        "glow-red":    "0 0 20px rgba(239,68,68,0.35)",
        "glow-blue":   "0 0 20px rgba(59,130,246,0.3)",
        "glow-cyan":   "0 0 20px rgba(34,211,238,0.3)",
        glass:         "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        card:          "0 4px 16px rgba(0,0,0,0.4)",
        "terminal":    "0 0 0 1px rgba(34,197,94,0.3), 0 4px 24px rgba(0,0,0,0.5)",
      },
      animation: {
        "pulse-slow":   "pulse 3s ease-in-out infinite",
        "pulse-green":  "pulseGreen 2s infinite",
        scan:           "scan 2s linear infinite",
        flicker:        "flicker 4s ease-in-out infinite",
        float:          "float 6s ease-in-out infinite",
        "glow-pulse":   "glowPulse 2s ease-in-out infinite",
        "flow-packet":  "flowPacket 3s infinite linear",
        "stagger-in":   "staggerIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-up":     "slideUp 0.35s ease both",
        "terminal-blink":"terminalBlink 1s step-end infinite",
      },
      keyframes: {
        scan:         {"0%":{transform:"translateY(-100%)"},"100%":{transform:"translateY(100%)"}},
        flicker:      {"0%,100%":{opacity:1},"50%":{opacity:0.85}},
        float:        {"0%,100%":{transform:"translateY(0px)"},"50%":{transform:"translateY(-8px)"}},
        glowPulse:    {"0%,100%":{boxShadow:"0 0 8px rgba(34,197,94,0.2)"},"50%":{boxShadow:"0 0 24px rgba(34,197,94,0.6)"}},
        pulseGreen:   {"0%":{boxShadow:"0 0 0 0 rgba(34,197,94,0.4)"},"70%":{boxShadow:"0 0 0 10px rgba(34,197,94,0)"},"100%":{boxShadow:"0 0 0 0 rgba(34,197,94,0)"}},
        staggerIn:    {"0%":{opacity:0,transform:"translateY(16px) scale(0.95)"},"100%":{opacity:1,transform:"translateY(0) scale(1)"}},
        slideUp:      {"from":{opacity:0,transform:"translateY(12px)"},"to":{opacity:1,transform:"translateY(0)"}},
        terminalBlink:{"0%,100%":{opacity:1},"50%":{opacity:0}},
        flowPacket:   {"0%":{transform:"translateX(0) scale(1)",opacity:0},"10%":{opacity:1},"50%":{transform:"translateX(150px) scale(1.2)",opacity:1},"90%":{opacity:1},"100%":{transform:"translateX(300px) scale(1)",opacity:0}},
      },
      backdropBlur: { xs:"2px", sm:"4px" },
      spacing: {
        // Dense dashboard spacing scale (8-32px)
        "2.5":"10px", "4.5":"18px",
      },
    },
  },
  plugins:[],
};
