import { useState } from "react";
import { DATA_SOURCES, CATEGORY_META } from "../data/sources";
import { STRINGS } from "../data/strings";
import { SourceLogo } from "../components/SourceLogo";

export function DataSourcesPage({ lang, T, dark }) {
  const S = STRINGS[lang];
  const [activeFilter, setActiveFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const categories = ["all", "tests", "admin", "legal", "reports"];
  const filtered = activeFilter === "all" ? DATA_SOURCES : DATA_SOURCES.filter(s => s.category === activeFilter);

  const catLabel = (cat) => {
    if (cat === "all") return S.filterAllSources || S.filterAll;
    return typeof CATEGORY_META[cat].label === "string" ? CATEGORY_META[cat].label : CATEGORY_META[cat].label[lang];
  };

  const txt = (v) => typeof v === "string" ? v : (v[lang] || v.id);

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Page Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderBottom: "1px solid #334155", padding: "3rem 1.5rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #0d6efd, #06b6d4, #0d6efd)" }} />
        <div style={{ position: "absolute", top: "-100px", right: "-50px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(13,110,253,0.06)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(13,110,253,0.15)", border: "1px solid rgba(13,110,253,0.3)", borderRadius: "999px", padding: "0.2rem 0.8rem", marginBottom: "1.1rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#7dd3fc", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "700" }}>{S.sourcesCount.replace("sumber data terverifikasi", `${DATA_SOURCES.length} sumber data terverifikasi`).replace("verified data sources", `${DATA_SOURCES.length} verified data sources`)}</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "0.8rem" }}>
            {S.sourcesTitle} <span style={{ color: "#7dd3fc" }}>—</span><br />{S.sourcesTitleEm}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.72, maxWidth: "620px" }}>{S.sourcesDesc}</p>
        </div>
      </section>

      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Data verification status banner */}
        <div style={{ marginBottom: "2rem", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", overflow: "hidden", boxShadow: T.shadow }}>
          <div style={{ background: dark ? "rgba(13,110,253,0.08)" : "#f0f9ff", borderBottom: `1px solid ${T.border}`, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.85rem" }}>📋</span>
            <span style={{ fontSize: "0.72rem", fontWeight: "800", color: T.text, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {lang === "id" ? "Status Verifikasi Data Platform" : "Platform Data Verification Status"}
            </span>
          </div>
          <div style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "✅", color: "#16a34a", bg: dark ? "rgba(22,163,74,0.1)" : "#f0fdf4", border: "#bbf7d0",
                label: lang === "id" ? "Data Terunggah & Terverifikasi" : "Uploaded & Verified Data",
                items: lang === "id"
                  ? ["PISA Indonesia 2000–2022 (1.163 baris, Sheet1 + Sheet4)", "Belanja Pendidikan APBN 2005–2026 (Nota Keuangan Kemenkeu)"]
                  : ["PISA Indonesia 2000–2022 (1,163 rows, Sheet1 + Sheet4)", "APBN Education Spending 2005–2026 (Kemenkeu Nota Keuangan)"],
              },
              { icon: "🔄", color: "#0d6efd", bg: dark ? "rgba(13,110,253,0.08)" : "#eff6ff", border: "#bfdbfe",
                label: lang === "id" ? "Dalam Integrasi (Segera)" : "Integration in Progress (Soon)",
                items: lang === "id"
                  ? ["Asesmen Nasional / Rapor Pendidikan (Kemendikdasmen)", "Dapodik — profil sekolah & guru (Kemendikdasmen)"]
                  : ["Asesmen Nasional / Rapor Pendidikan (Kemendikdasmen)", "Dapodik — school & teacher profiles (Kemendikdasmen)"],
              },
              { icon: "🔍", color: "#d97706", bg: dark ? "rgba(217,119,6,0.08)" : "#fffbeb", border: "#fde68a",
                label: lang === "id" ? "Berbasis Web Search (Sementara)" : "Web Search Based (Temporary)",
                items: lang === "id"
                  ? ["BPS Susenas, EMIS, APBD, KPAI, Bappenas, World Bank, UNICEF — semua sumber ini akan segera diintegrasikan sebagai dataset terverifikasi"]
                  : ["BPS Susenas, EMIS, APBD, KPAI, Bappenas, World Bank, UNICEF — all these sources will soon be integrated as verified datasets"],
              },
            ].map((col, i) => (
              <div key={i} style={{ background: col.bg, border: `1px solid ${col.border}`, borderRadius: "8px", padding: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <span>{col.icon}</span>
                  <span style={{ fontSize: "0.72rem", fontWeight: "700", color: col.color }}>{col.label}</span>
                </div>
                {col.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
                    <span style={{ color: col.color, fontSize: "0.65rem", marginTop: "2px", flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: "0.72rem", color: T.textSub, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Category filter tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {categories.map(cat => {
            const active = activeFilter === cat;
            const meta = cat !== "all" ? CATEGORY_META[cat] : null;
            return (
              <button key={cat} onClick={() => setActiveFilter(cat)} style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                background: active ? (meta?.color || "#0d6efd") : T.surface,
                border: `1px solid ${active ? (meta?.color || "#0d6efd") : T.border}`,
                color: active ? "#fff" : T.textSub,
                fontSize: "0.78rem", fontWeight: "600", padding: "0.45rem 1rem", borderRadius: "999px",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}>
                {meta && <span>{meta.icon}</span>}
                {catLabel(cat)}
                <span style={{ fontSize: "0.65rem", background: active ? "rgba(255,255,255,0.2)" : T.blueSub, padding: "0.05rem 0.4rem", borderRadius: "999px" }}>
                  {cat === "all" ? DATA_SOURCES.length : DATA_SOURCES.filter(s => s.category === cat).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category sections */}
        {(activeFilter === "all" ? ["tests", "admin", "legal", "reports"] : [activeFilter]).map(cat => {
          const meta = CATEGORY_META[cat];
          const sources = DATA_SOURCES.filter(s => s.category === cat);
          if (sources.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: "3rem" }}>
              {/* Category header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", paddingBottom: "0.85rem", borderBottom: `2px solid ${meta.color}22` }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${meta.color}18`, border: `1px solid ${meta.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>{meta.icon}</div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "800", color: T.text, margin: 0 }}>{txt(meta.label)}</h2>
                  <p style={{ fontSize: "0.76rem", color: T.textSub, margin: 0, marginTop: "2px" }}>{meta.desc[lang]}</p>
                </div>
              </div>

              {/* Source cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                {sources.map(source => {
                  const isExpanded = expanded === source.id;
                  return (
                    <div key={source.id} style={{
                      background: T.surface, border: `1px solid ${isExpanded ? source.accentColor + "66" : T.border}`,
                      borderRadius: "12px", overflow: "hidden", boxShadow: isExpanded ? `0 4px 20px ${source.accentColor}22` : T.shadow,
                      transition: "all 0.2s", cursor: "pointer",
                    }} onClick={() => setExpanded(isExpanded ? null : source.id)}>

                      {/* Top accent bar */}
                      <div style={{ height: "3px", background: `linear-gradient(90deg, ${source.accentColor}, ${source.accentColor}88)` }} />

                      {/* Card header */}
                      <div style={{ padding: "1.1rem 1.2rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                        <SourceLogo source={source} size={52} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.3rem" }}>
                            <div>
                              <span style={{ fontSize: "1rem", fontWeight: "800", color: T.text }}>{txt(source.name)}</span>
                              <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: "700", background: `${source.badgeColor}18`, color: source.badgeColor, border: `1px solid ${source.badgeColor}44`, borderRadius: "4px", padding: "0.1rem 0.45rem", marginLeft: "0.5rem", verticalAlign: "middle" }}>
                                {txt(source.badge)}
                              </span>
                            </div>
                            <span style={{ fontSize: "0.75rem", color: T.textMuted, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                          </div>
                          <p style={{ fontSize: "0.75rem", color: T.textSub, margin: 0, lineHeight: 1.4 }}>{txt(source.fullName)}</p>
                          <p style={{ fontSize: "0.72rem", color: source.accentColor, fontWeight: "600", margin: "0.25rem 0 0" }}>{source.org}</p>
                        </div>
                      </div>

                      {/* Meta strip */}
                      <div style={{ display: "flex", borderTop: `1px solid ${T.border}`, background: T.surfaceAlt }}>
                        {[
                          [S.frequency, txt(source.freq)],
                          [S.lastUpdated, source.lastUpdate],
                          [S.coverage, txt(source.coverage)],
                        ].map(([label, val]) => (
                          <div key={label} style={{ flex: 1, padding: "0.5rem 0.75rem", borderRight: `1px solid ${T.border}`, lastChild: "border-right: none" }}>
                            <div style={{ fontSize: "0.58rem", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: "600" }}>{label}</div>
                            <div style={{ fontSize: "0.74rem", color: T.text, fontWeight: "600", marginTop: "1px" }}>{val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Expandable detail */}
                      {isExpanded && (
                        <div style={{ padding: "1.1rem 1.2rem", borderTop: `1px solid ${T.border}`, animation: "fadeUp 0.2s ease both" }}>
                          <p style={{ fontSize: "0.82rem", color: T.textSub, lineHeight: 1.7, marginBottom: "1rem" }}>{source.description[lang]}</p>
                          
                          <div style={{ marginBottom: "1rem" }}>
                            <p style={{ fontSize: "0.62rem", fontWeight: "700", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "0.6rem" }}>{S.dataPoints}</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                              {source.metrics.map(m => (
                                <span key={m} style={{ fontSize: "0.7rem", color: source.accentColor, background: `${source.accentColor}12`, border: `1px solid ${source.accentColor}30`, padding: "0.18rem 0.55rem", borderRadius: "4px", fontWeight: "500" }}>{m}</span>
                              ))}
                            </div>
                          </div>

                          <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.76rem", fontWeight: "700", color: source.accentColor, textDecoration: "none", background: `${source.accentColor}12`, border: `1px solid ${source.accentColor}44`, padding: "0.38rem 0.85rem", borderRadius: "6px" }}
                            onClick={e => e.stopPropagation()}>
                            {S.visitSource}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Integrity commitment box */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "1.5rem 1.25rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(16,163,74,0.12)", border: "1px solid rgba(16,163,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>🔒</div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: T.text, marginBottom: "0.3rem" }}>{S.integrityTitle}</h3>
              <p style={{ fontSize: "0.8rem", color: T.textSub, lineHeight: 1.65, marginBottom: "0.85rem" }}>{S.integrityDesc}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.5rem" }}>
                {S.integrityPoints.map((pt, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.55rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#16a34a", fontWeight: "700", flexShrink: 0, marginTop: "1px" }}>✓</span>
                    <span style={{ fontSize: "0.78rem", color: T.textSub, lineHeight: 1.5 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
