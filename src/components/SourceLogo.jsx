export function SourceLogo({ source, size = 56 }) {
  const style = { width: size, height: size, borderRadius: "12px", background: source.logoBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" };
  if (source.logoType === "icon") {
    return (
      <div style={style}>
        <span style={{ fontSize: size * 0.42 }}>{source.logoIcon}</span>
      </div>
    );
  }
  return (
    <div style={style}>
      <span style={{ fontSize: size * 0.26, fontWeight: "800", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>{source.logoText}</span>
      {source.logoSub && <span style={{ fontSize: size * 0.13, fontWeight: "600", color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em", marginTop: "2px" }}>{source.logoSub}</span>}
    </div>
  );
}
