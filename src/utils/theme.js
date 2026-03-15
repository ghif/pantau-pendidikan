export function getTheme(dark) {
  return {
    pageBg:     dark ? "#0f172a" : "#f1f5f9",
    surface:    dark ? "#1e293b" : "#ffffff",
    surfaceAlt: dark ? "#162032" : "#f8fafc",
    border:      dark ? "#334155" : "#e2e8f0",
    borderHover: dark ? "#475569" : "#bfdbfe",
    text:      dark ? "#f1f5f9" : "#0f172a",
    textSub:   dark ? "#94a3b8" : "#475569",
    textMuted: dark ? "#475569" : "#9ca3af",
    trackBg:   dark ? "#0f172a" : "#e2e8f0",
    blue:      "#0d6efd",
    teal:      "#06b6d4",
    blueSub:     dark ? "rgba(13,110,253,0.18)" : "rgba(13,110,253,0.08)",
    shadow:      dark ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.07)",
    shadowHover: dark ? "0 4px 16px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.10)",
  };
}
