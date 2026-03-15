import { useState, useRef, useEffect } from "react";
import { toBlob } from "html-to-image";
import { BsCopy } from 'react-icons/bs';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import styles from "../styles/HomePage.module.css";

import { SUGGESTED_QUERIES } from "../data/queries";
import { STRINGS } from "../data/strings";
import { TESTIMONIES } from "../data/testimonies";
import { PISA_DATA, SPENDING_DATA, TOTAL_SPENDING_DATA } from "../data/official";
import { BarChart, LineChart, ComparisonChart, ScatterChart, DualAxisChart } from "../components/Charts";
import { TypingText } from "../components/TypingText";
import { getTheme } from "../utils/theme";

// --- Extracted UI Helper Components ---
// ─── INSIGHTS LIST with inline micro-charts ──────────────────────────────────

// Maps keywords in insight text to a specific PISA_DATA slice + chart config
function resolveInsightChart(text) {
  const t = text.toLowerCase();

  // Proficiency level trend — "level 2", "basic proficiency", "proficient"
  if ((t.includes("level 2") || t.includes("basic proficiency") || t.includes("proficient")) && (t.includes("reading") || t.includes("membaca") || t.includes("%"))) {
    return {
      type: "bar",
      title: "% Students ≥ Level 2 — Reading",
      data: Object.entries(PISA_DATA.pctLevel2)
        .filter(([,d]) => d.reading !== null)
        .map(([y,d]) => ({ label: y, value: d.reading })),
      unit: "% reaching basic proficiency (L2+)",
      color: "#0d6efd",
      highlight: (v, max) => v === max ? "high" : v < 30 ? "low" : "neutral",
    };
  }
  if ((t.includes("level 2") || t.includes("basic proficiency") || t.includes("proficient")) && (t.includes("math") || t.includes("matemat"))) {
    return {
      type: "bar",
      title: "% Students ≥ Level 2 — Mathematics",
      data: Object.entries(PISA_DATA.pctLevel2)
        .filter(([,d]) => d.math !== null)
        .map(([y,d]) => ({ label: y, value: d.math })),
      unit: "% reaching basic proficiency (L2+)",
      color: "#7c3aed",
      highlight: (v, max) => v === max ? "high" : v < 25 ? "low" : "neutral",
    };
  }

  // Mean score trend
  if (t.includes("score") || t.includes("skor") || t.includes("mean") || t.includes("rata-rata")) {
    const domain = t.includes("math") || t.includes("matemat") ? "math"
      : t.includes("science") || t.includes("sains") ? "science" : "reading";
    const colors = { reading: "#0d6efd", math: "#7c3aed", science: "#16a34a" };
    const domainLabel = { reading: "Reading", math: "Mathematics", science: "Science" };
    return {
      type: "line",
      title: `National Mean Score — ${domainLabel[domain]}`,
      data: Object.entries(PISA_DATA.national)
        .filter(([,d]) => d[domain] !== null)
        .map(([y,d]) => ({ label: y, value: d[domain] })),
      unit: "PISA mean scale score",
      color: colors[domain],
    };
  }

  // Urban-rural / location gap
  if (t.includes("urban") || t.includes("rural") || t.includes("village") || t.includes("city") || t.includes("kota") || t.includes("desa") || t.includes("gap") || t.includes("kesenjangan")) {
    const latest = Object.entries(PISA_DATA.byLocation).sort(([a],[b]) => b-a)[0];
    const [yr, locs] = latest;
    return {
      type: "bar",
      title: `Reading Score by Location — ${yr}`,
      data: [
        { label: "Village / Desa", value: locs.village },
        { label: "Town / Kota Kecil", value: locs.town },
        { label: "City / Kota", value: locs.city },
      ],
      unit: "PISA mean reading score",
      color: "#f59e0b",
      highlight: (v, max) => v === max ? "high" : v === Math.min(locs.village, locs.town, locs.city) ? "low" : "neutral",
    };
  }

  // Negeri vs Swasta / public vs private
  if (t.includes("negeri") || t.includes("swasta") || t.includes("public") || t.includes("private") || t.includes("state school")) {
    return {
      type: "line",
      title: "Public vs Private Schools — Reading (National Mean)",
      data: Object.entries(PISA_DATA.byOwnership).map(([y,d]) => [
        { label: `${y} Negeri`, value: d.negeri, group: "negeri" },
        { label: `${y} Swasta`, value: d.swasta, group: "swasta" },
      ]).flat(),
      unit: "PISA mean reading score",
      color: "#06b6d4",
      dual: true,
      negeriData: Object.entries(PISA_DATA.byOwnership).map(([y,d]) => ({ label: y, value: d.negeri })),
      swastaData: Object.entries(PISA_DATA.byOwnership).map(([y,d]) => ({ label: y, value: d.swasta })),
    };
  }

  // Coverage / participation
  if (t.includes("coverage") || t.includes("cakupan") || t.includes("participation") || t.includes("partisipasi")) {
    return {
      type: "bar",
      title: "PISA Coverage Index (% of 15-year-olds enrolled)",
      data: Object.entries(PISA_DATA.coverageIndex).map(([y,v]) => ({ label: y, value: Math.round(v * 100) })),
      unit: "% of 15-year-old population in school",
      color: "#16a34a",
      highlight: (v, max) => v === max ? "high" : "neutral",
    };
  }

  // Level 4 / high performers
  if (t.includes("level 4") || t.includes("high perform") || t.includes("top")) {
    return {
      type: "bar",
      title: "% Students ≥ Level 4 — Reading (High Performers)",
      data: Object.entries(PISA_DATA.pctLevel4)
        .filter(([,d]) => d.reading !== null)
        .map(([y,d]) => ({ label: y, value: d.reading })),
      unit: "% at Level 4+ (advanced proficiency)",
      color: "#d97706",
    };
  }

  // Spending / budget
  if (t.includes("spend") || t.includes("belanja") || t.includes("budget") || t.includes("anggaran") || t.includes("trillion") || t.includes("triliun")) {
    return {
      type: "line",
      title: "Education Function Spending 2005–2024",
      data: SPENDING_DATA.series.filter(d => d.status !== "RAPBN" && d.status !== "outlook" || d.year <= 2024)
        .map(d => ({ label: d.year, value: d.valueT })),
      unit: "Central govt education spending (Trillion Rp)",
      color: "#d97706",
    };
  }

  return null;
}

// Compact inline bar chart for insight micro-charts
function MicroBarChart({ data, unit, color, highlightFn, T }) {
  const vals = data.map(d => d.value);
  const max = Math.max(...vals);
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <p style={{ fontSize: "0.62rem", fontWeight: "700", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{unit}</p>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const hl = highlightFn ? highlightFn(d.value, max) : "neutral";
        const barColor = hl === "high" ? "#16a34a" : hl === "low" ? "#dc2626" : color;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "0.68rem", color: T.textMuted, width: "52px", textAlign: "right", flexShrink: 0 }}>{d.label}</span>
            <div style={{ flex: 1, background: T.surfaceAlt, borderRadius: "3px", overflow: "hidden", height: "16px", position: "relative" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "3px", transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: "0.72rem", fontWeight: "700", color: hl === "low" ? "#dc2626" : hl === "high" ? "#16a34a" : T.text, width: "38px", flexShrink: 0 }}>
              {typeof d.value === "number" && d.value < 10 ? d.value.toFixed(1) : Math.round(d.value)}{unit.includes("%") ? "%" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Compact inline line chart for insight micro-charts
function MicroLineChart({ data, unit, color, T }) {
  if (data.length < 2) return null;
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals) - 8, maxV = Math.max(...vals) + 8;
  const W = 320, H = 80, padL = 32, padR = 8, padT = 12, padB = 20;
  const sx = i => padL + (i / (data.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.value)}`).join(" ");
  const fill = path + ` L${sx(data.length - 1)},${H - padB} L${sx(0)},${H - padB} Z`;
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <p style={{ fontSize: "0.62rem", fontWeight: "700", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>{unit}</p>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id={`mg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={fill} fill={`url(#mg-${color.replace("#","")})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={sx(i)} cy={sy(d.value)} r={3} fill={color} />
            <text x={sx(i)} y={H - 4} textAnchor="middle" fontSize="8" fill={T.textMuted} fontFamily="sans-serif">{d.label}</text>
            {(i === 0 || i === data.length - 1) && (
              <text x={sx(i)} y={sy(d.value) - 6} textAnchor={i === 0 ? "start" : "end"} fontSize="8.5" fontWeight="700" fill={T.text} fontFamily="sans-serif">{Math.round(d.value)}</text>
            )}
          </g>
        ))}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
    </div>
  );
}

// Dual-line micro chart for Negeri vs Swasta
function MicroDualLineChart({ negeriData, swastaData, unit, T }) {
  if (!negeriData || negeriData.length < 2) return null;
  const allVals = [...negeriData, ...swastaData].map(d => d.value);
  const minV = Math.min(...allVals) - 8, maxV = Math.max(...allVals) + 8;
  const W = 320, H = 80, padL = 32, padR = 8, padT = 12, padB = 20;
  const sx = i => padL + (i / (negeriData.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const pathN = negeriData.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.value)}`).join(" ");
  const pathS = swastaData.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.value)}`).join(" ");
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <p style={{ fontSize: "0.62rem", fontWeight: "700", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>{unit}</p>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "auto", display: "block" }}>
        <path d={pathN} fill="none" stroke="#0d6efd" strokeWidth="2" strokeLinejoin="round" />
        <path d={pathS} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4,3" />
        {negeriData.map((d, i) => (
          <text key={i} x={sx(i)} y={H - 4} textAnchor="middle" fontSize="8" fill={T.textMuted} fontFamily="sans-serif">{d.label}</text>
        ))}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.3rem" }}>
        {[["#0d6efd", "━", "Negeri (Public)"], ["#f59e0b", "╌", "Swasta (Private)"]].map(([c, s, l]) => (
          <span key={l} style={{ fontSize: "0.65rem", color: T.textSub, display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: c }}>{s}</span>{l}
          </span>
        ))}
      </div>
    </div>
  );
}

function InsightsList({ insights, lang, T }) {
  const label = lang === "id" ? "Temuan Kunci" : "Key Findings";
  return (
    <>
      <p style={{ fontSize: "0.62rem", fontWeight: "700", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "0.75rem" }}>{label}</p>
      {insights.map((ins, i) => {
        const text = typeof ins === "string" ? ins : ins.text;
        const sourceLabel = typeof ins === "object" ? ins.sourceLabel : null;
        const sourceType = typeof ins === "object" ? ins.sourceType : null;
        const sourceUrl = typeof ins === "object" && ins.sourceUrl && ins.sourceUrl !== "null" && ins.sourceUrl !== null ? ins.sourceUrl : null;
        const isVerified = sourceType === "verified";
        return (
          <div key={i} style={{ display: "flex", gap: "0.65rem", marginBottom: "1rem", animation: `fadeUp 0.4s ease ${0.1 + i * 0.07}s both` }}>
            <span style={{ width: "5px", minWidth: "5px", height: "5px", borderRadius: "50%", background: isVerified ? "#16a34a" : T.blue, marginTop: "0.45rem", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.8rem", color: T.textSub, lineHeight: 1.65 }}>{text}</span>
              {sourceLabel && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.35rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.6rem", fontWeight: "700", padding: "0.12rem 0.45rem", borderRadius: "4px",
                    background: isVerified ? "#dcfce7" : "#fef3c7",
                    color: isVerified ? "#15803d" : "#92400e",
                    border: `1px solid ${isVerified ? "#bbf7d0" : "#fde68a"}`,
                    display: "inline-flex", alignItems: "center", gap: "3px",
                  }}>
                    {isVerified ? "✓" : "🔍"} {sourceLabel}
                  </span>
                  {sourceUrl && (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "0.6rem", fontWeight: "700", color: T.blue,
                        textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "2px",
                        background: "rgba(13,110,253,0.08)", border: "1px solid rgba(13,110,253,0.2)",
                        padding: "0.12rem 0.45rem", borderRadius: "4px",
                      }}
                    >
                      {lang === "id" ? "Lihat Sumber ↗" : "View Source ↗"}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ─── PISA DEEP DIVE PANEL ─────────────────────────────────────────────────────

// ── PISA sub-view components (hoisted to top level — no re-definition on parent render) ──

function PisaProficiencyView({ domain, color, labels, T }) {
  const years = [2000, 2003, 2006, 2009, 2012, 2015, 2018, 2022];
  const data = years.map(y => ({
    year: y,
    l2: PISA_DATA.pctLevel2[y]?.[domain] ?? null,
    l4: PISA_DATA.pctLevel4[y]?.[domain] ?? null,
  })).filter(d => d.l2 !== null);
  const maxL2 = Math.max(...data.map(d => d.l2));
  const W = 540, H = 200, padL = 44, padR = 16, padT = 14, padB = 26;
  const barW = Math.floor((W - padL - padR) / data.length) - 8;
  const sx = i => padL + i * ((W - padL - padR) / data.length) + (((W - padL - padR) / data.length) - barW) / 2;
  const sy = v => padT + (1 - v / 55) * (H - padT - padB);
  return (
    <div>
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        {[[color, labels.l2label], ["#94a3b8", labels.l4label]].map(([c, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.71rem", color: T.textSub }}>
            <span style={{ width: "12px", height: "12px", background: c, borderRadius: "2px", display: "block" }} />{l}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "auto", display: "block" }}>
        {[10, 20, 30, 40, 50].map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}%</text>
          </g>
        ))}
        {data.map((d, i) => {
          const l2H = (d.l2 / 55) * (H - padT - padB);
          const l4H = d.l4 ? (d.l4 / 55) * (H - padT - padB) : 0;
          const isLatest = d.year === 2022;
          const isPeak = d.l2 === maxL2;
          return (
            <g key={i}>
              <rect x={sx(i)} y={H - padB - l2H} width={barW} height={l2H}
                fill={isLatest ? (d.l2 < 30 ? "#dc2626" : color) : color}
                opacity={isLatest ? 1 : 0.55} rx="2" />
              {d.l4 > 0 && <rect x={sx(i) + barW * 0.2} y={H - padB - l4H} width={barW * 0.6} height={l4H} fill="#fff" opacity="0.35" rx="1" />}
              <text x={sx(i) + barW / 2} y={H - padB - l2H - 4} textAnchor="middle" fontSize="8.5" fontWeight={isLatest ? "800" : "600"} fill={isLatest ? (d.l2 < 30 ? "#dc2626" : T.text) : T.textMuted} fontFamily="sans-serif">{d.l2.toFixed(1)}%</text>
              {isPeak && <text x={sx(i) + barW / 2} y={H - padB - l2H - 14} textAnchor="middle" fontSize="7.5" fill="#16a34a" fontFamily="sans-serif">▲ peak</text>}
              <text x={sx(i) + barW / 2} y={H - padB + 13} textAnchor="middle" fontSize="9" fill={isLatest ? T.text : T.textMuted} fontWeight={isLatest ? "700" : "400"} fontFamily="sans-serif">{d.year}</text>
            </g>
          );
        })}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
    </div>
  );
}

function PisaTrendView({ domain, color, labels, T }) {
  const years = [2000, 2003, 2006, 2009, 2012, 2015, 2018, 2022];
  const data = years.map(y => ({ year: y, value: PISA_DATA.national[y]?.[domain] })).filter(d => d.value);
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals) - 12, maxV = Math.max(...vals) + 12;
  const W = 540, H = 180, padL = 44, padR = 16, padT = 14, padB = 26;
  const sx = i => padL + (i / (data.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.value)}`).join(" ");
  const fill = path + ` L${sx(data.length - 1)},${H - padB} L${sx(0)},${H - padB} Z`;
  const gridVals = [350, 375, 400, 425].filter(v => v >= minV && v <= maxV);
  const gradId = `tg-${domain}`;
  return (
    <div>
      <p style={{ fontSize: "0.7rem", color: T.textMuted, marginBottom: "0.5rem" }}>{labels.meanLabel}</p>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {gridVals.map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}</text>
          </g>
        ))}
        <line x1={padL} x2={W - padR} y1={sy(487)} y2={sy(487)} stroke="#d97706" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.7" />
        <text x={W - padR - 2} y={sy(487) - 4} textAnchor="end" fontSize="8" fill="#d97706" fontFamily="sans-serif">OECD avg 487</text>
        <path d={fill} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((d, i) => {
          const isLatest = d.year === 2022;
          return (
            <g key={i}>
              <circle cx={sx(i)} cy={sy(d.value)} r={isLatest ? 5 : 4} fill={color} stroke={T.surface} strokeWidth="2" />
              <text x={sx(i)} y={sy(d.value) - 10} textAnchor="middle" fontSize={isLatest ? "10" : "9"} fontWeight={isLatest ? "800" : "600"} fill={T.text} fontFamily="sans-serif">{Math.round(d.value)}</text>
              <text x={sx(i)} y={H - padB + 13} textAnchor="middle" fontSize="9" fill={isLatest ? T.text : T.textMuted} fontWeight={isLatest ? "700" : "400"} fontFamily="sans-serif">{d.year}</text>
            </g>
          );
        })}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
    </div>
  );
}

function PisaLocationView({ labels, T }) {
  const years = [2003, 2006, 2009, 2012, 2015, 2018, 2022];
  const W = 540, H = 180, padL = 44, padR = 50, padT = 14, padB = 26;
  const allVals = years.flatMap(y => [PISA_DATA.byLocation[y].village, PISA_DATA.byLocation[y].town, PISA_DATA.byLocation[y].city]);
  const minV = Math.min(...allVals) - 10, maxV = Math.max(...allVals) + 10;
  const sx = i => padL + (i / (years.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const series = [["city", "#0d6efd", "City / Kota"], ["town", "#06b6d4", "Town"], ["village", "#f59e0b", "Village / Desa"]];
  const makePath = key => years.map((y, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(PISA_DATA.byLocation[y][key])}`).join(" ");
  const lastY = years[years.length - 1], lastI = years.length - 1;
  const gap = Math.round(PISA_DATA.byLocation[lastY].city - PISA_DATA.byLocation[lastY].village);
  return (
    <div>
      <p style={{ fontSize: "0.7rem", color: T.textMuted, marginBottom: "0.5rem" }}>{labels.locationLabel}</p>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "auto", display: "block" }}>
        {[340, 360, 380, 400, 420, 440].filter(v => v >= minV && v <= maxV).map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}</text>
          </g>
        ))}
        {series.map(([key, c]) => <path key={key} d={makePath(key)} fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round" />)}
        <line x1={sx(lastI) + 8} y1={sy(PISA_DATA.byLocation[lastY].city)} x2={sx(lastI) + 8} y2={sy(PISA_DATA.byLocation[lastY].village)} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="2,2" />
        <text x={sx(lastI) + 12} y={(sy(PISA_DATA.byLocation[lastY].city) + sy(PISA_DATA.byLocation[lastY].village)) / 2 + 4} fontSize="8.5" fill="#dc2626" fontWeight="700" fontFamily="sans-serif">{gap}pt gap</text>
        {years.map((y, i) => <text key={i} x={sx(i)} y={H - padB + 13} textAnchor="middle" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{y}</text>)}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
        {series.map(([key, c, l]) => (
          <span key={key} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", color: T.textSub }}>
            <span style={{ width: "20px", height: "3px", background: c, display: "block", borderRadius: "2px" }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

function PisaOwnershipView({ labels, T }) {
  const owYears = Object.keys(PISA_DATA.byOwnership).map(Number).sort();
  const W = 540, H = 180, padL = 44, padR = 16, padT = 14, padB = 26;
  const allVals = owYears.flatMap(y => [PISA_DATA.byOwnership[y].negeri, PISA_DATA.byOwnership[y].swasta]);
  const minV = Math.min(...allVals) - 10, maxV = Math.max(...allVals) + 10;
  const sx = i => padL + (i / (owYears.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const pathN = owYears.map((y, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(PISA_DATA.byOwnership[y].negeri)}`).join(" ");
  const pathS = owYears.map((y, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(PISA_DATA.byOwnership[y].swasta)}`).join(" ");
  return (
    <div>
      <p style={{ fontSize: "0.7rem", color: T.textMuted, marginBottom: "0.5rem" }}>{labels.ownershipLabel}</p>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "auto", display: "block" }}>
        {[350, 370, 390, 410].filter(v => v >= minV && v <= maxV).map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}</text>
          </g>
        ))}
        <path d={pathN} fill="none" stroke="#0d6efd" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={pathS} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="5,3" />
        {owYears.map((y, i) => {
          const gap = Math.round(PISA_DATA.byOwnership[y].negeri - PISA_DATA.byOwnership[y].swasta);
          const showGap = i === 0 || i === owYears.length - 1;
          return (
            <g key={i}>
              {showGap && <text x={sx(i)} y={sy(PISA_DATA.byOwnership[y].swasta) + 16} textAnchor="middle" fontSize="8" fill={gap <= 5 ? "#16a34a" : "#94a3b8"} fontFamily="sans-serif">gap: {gap}</text>}
              <text x={sx(i)} y={H - padB + 13} textAnchor="middle" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{y}</text>
            </g>
          );
        })}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem" }}>
        {[["#0d6efd", "━", "Negeri (Public)"], ["#f59e0b", "╌", "Swasta (Private)"]].map(([c, s, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", color: T.textSub }}>
            <span style={{ color: c, fontSize: "0.85rem" }}>{s}</span>{l}
          </span>
        ))}
      </div>
    </div>
  );
}


// ─── PUBLICATIONS PAGE ───────────────────────────────────────────────────────

function PublicationsPage({ lang, T, dark }) {
  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderBottom: "1px solid #334155", padding: "3rem 1.5rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #0d6efd, #06b6d4, #0d6efd)" }} />
        <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(217,119,6,0.15)", border: "1px solid rgba(217,119,6,0.35)", borderRadius: "999px", padding: "0.2rem 0.8rem", marginBottom: "1.1rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#fcd34d", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "700" }}>🚧 {lang === "id" ? "Segera Hadir" : "Coming Soon"}</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "0.8rem" }}>
            {lang === "id" ? "Publikasi" : "Publications"} <span style={{ color: "#7dd3fc" }}>—</span><br />
            {lang === "id" ? "Laporan & Analisis Berbasis Data" : "Data-Driven Reports & Analysis"}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.72, maxWidth: "620px" }}>
            {lang === "id"
              ? "Pantau Pendidikan akan menerbitkan laporan dan publikasi mendalam berdasarkan data pendidikan Indonesia yang terverifikasi. Pengguna platform akan dapat mengakses ringkasan temuan, analisis tren, dan rekomendasi kebijakan berbasis bukti."
              : "Pantau Pendidikan will publish in-depth reports and publications based on verified Indonesian education data. Platform users will be able to access findings summaries, trend analyses, and evidence-based policy recommendations."}
          </p>
        </div>
      </section>

      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Coming soon cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
          {[
            { icon: "📊", color: "#0d6efd", bg: dark ? "rgba(13,110,253,0.1)" : "#eff6ff", border: "#bfdbfe",
              title: lang === "id" ? "Laporan Tahunan PISA Indonesia" : "Indonesia PISA Annual Report",
              desc: lang === "id" ? "Analisis mendalam tren skor PISA Indonesia 2000–2022, disparitas regional, dan perbandingan internasional." : "In-depth analysis of Indonesia's PISA score trends 2000–2022, regional disparities, and international comparisons." },
            { icon: "💰", color: "#d97706", bg: dark ? "rgba(217,119,6,0.1)" : "#fffbeb", border: "#fde68a",
              title: lang === "id" ? "Efektivitas Belanja Pendidikan" : "Education Spending Effectiveness",
              desc: lang === "id" ? "Kajian korelasi antara alokasi anggaran APBN fungsi pendidikan dengan capaian pembelajaran nasional." : "Study on the correlation between APBN education budget allocations and national learning outcomes." },
            { icon: "🗺️", color: "#7c3aed", bg: dark ? "rgba(124,58,237,0.1)" : "#f5f3ff", border: "#ddd6fe",
              title: lang === "id" ? "Atlas Disparitas Pendidikan" : "Education Disparity Atlas",
              desc: lang === "id" ? "Pemetaan kesenjangan pendidikan antar provinsi, kab/kota, dan antara daerah urban-rural berdasarkan data AN dan Dapodik." : "Mapping of education gaps across provinces, regencies, and urban-rural areas based on AN and Dapodik data." },
            { icon: "👩‍🏫", color: "#16a34a", bg: dark ? "rgba(22,163,74,0.1)" : "#f0fdf4", border: "#bbf7d0",
              title: lang === "id" ? "Profil Tenaga Pengajar Indonesia" : "Indonesia Teacher Workforce Profile",
              desc: lang === "id" ? "Analisis distribusi, kualifikasi, dan sertifikasi guru berdasarkan data Dapodik dan kebijakan Kemendikdasmen." : "Analysis of teacher distribution, qualifications, and certification based on Dapodik data and Kemendikdasmen policy." },
          ].map((card, i) => (
            <div key={i} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: "12px", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "0.6rem", fontWeight: "700", color: card.color, background: "rgba(255,255,255,0.7)", border: `1px solid ${card.border}`, padding: "0.15rem 0.5rem", borderRadius: "999px", backdropFilter: "blur(4px)" }}>
                {lang === "id" ? "Sedang Disiapkan" : "In Preparation"}
              </div>
              <div style={{ fontSize: "2rem", marginBottom: "0.85rem" }}>{card.icon}</div>
              <h3 style={{ fontSize: "0.92rem", fontWeight: "800", color: T.text, marginBottom: "0.5rem", lineHeight: 1.3, paddingRight: "4rem" }}>{card.title}</h3>
              <p style={{ fontSize: "0.75rem", color: T.textSub, lineHeight: 1.65 }}>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Notify banner */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "2rem", textAlign: "center", boxShadow: T.shadow }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📬</div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: T.text, marginBottom: "0.5rem" }}>
            {lang === "id" ? "Jadilah yang Pertama Mengakses" : "Be the First to Access"}
          </h2>
          <p style={{ fontSize: "0.82rem", color: T.textSub, lineHeight: 1.7, maxWidth: "500px", margin: "0 auto 1.25rem" }}>
            {lang === "id"
              ? "Platform ini masih dalam pengembangan aktif. Publikasi pertama kami dijadwalkan rilis pada semester dua 2025. Pantau terus platform ini untuk pembaruan terbaru."
              : "This platform is under active development. Our first publications are scheduled for release in the second half of 2025. Check back for the latest updates."}
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: T.blueSub, border: `1px solid ${T.borderHover}`, borderRadius: "8px", padding: "0.6rem 1.25rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: T.blue }}>
              🚧 {lang === "id" ? "Dalam Pengembangan — Segera Hadir" : "Under Development — Coming Soon"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ──────────────────────────────────────────────────────────────

function AboutPage({ lang, T, dark }) {
  const L = {
    id: {
      heroTag: "Tentang Platform",
      heroTitle: "Tentang", heroTitleEm: "Pantau Pendidikan",
      heroDesc: "Platform independen untuk memantau, memahami, dan mengadvokasi perbaikan data pendidikan Indonesia — dibangun oleh tim lintas disiplin yang berdedikasi pada transparansi dan akuntabilitas.",
      aboutTitle: "Tentang Platform",
      aboutBody: [
        "Pantau Pendidikan adalah platform intelijen pendidikan independen yang dirancang untuk menjembatani kesenjangan antara data pendidikan Indonesia yang besar dan pemahaman publik terhadap data tersebut. Platform ini menggabungkan data dari sumber resmi — termasuk PISA/OECD, Asesmen Nasional, Dapodik, EMIS, dan data APBN Kemenkeu — dan menyajikannya melalui antarmuka berbasis AI yang dapat diakses oleh siapa pun.",
        "Kami percaya bahwa kebijakan pendidikan yang baik dimulai dari data yang dapat dipercaya dan dapat dipahami. Pantau Pendidikan bukan afiliasi resmi pemerintah — kami adalah proyek sipil independen yang berkomitmen pada transparansi, ketelitian data, dan aksesibilitas publik.",
        "Platform ini saat ini dalam tahap Beta (v0.1). Fitur-fitur baru, sumber data tambahan, dan laporan mendalam sedang dalam pengembangan aktif.",
      ],
      featuresTitle: "Fitur Platform",
      features: [
        { icon: "🤖", title: "Analisis AI Berbahasa Alami", desc: "Ajukan pertanyaan dalam Bahasa Indonesia atau Inggris — AI kami menganalisis data dan menyajikan temuan dengan visualisasi langsung." },
        { icon: "📊", title: "Dataset Terverifikasi", desc: "Data PISA Indonesia 2000–2022 dan data belanja pendidikan APBN 2005–2026 telah diunggah, divalidasi, dan diintegrasikan langsung ke sistem AI." },
        { icon: "🔍", title: "Analisis Mendalam PISA", desc: "Jelajahi data PISA berdasarkan domain (Membaca, Matematika, Sains), tingkat kemahiran, kesenjangan lokasi, dan kepemilikan sekolah." },
        { icon: "🗂️", title: "Katalog Sumber Data", desc: "Direktori lengkap 17 sumber data pendidikan resmi Indonesia, beserta frekuensi pembaruan, cakupan, dan tautan langsung." },
        { icon: "🌐", title: "Bilingual EN/ID", desc: "Seluruh platform tersedia dalam Bahasa Indonesia dan Inggris, termasuk analisis AI dan visualisasi data." },
        { icon: "🌙", title: "Mode Gelap & Terang", desc: "Antarmuka yang nyaman digunakan dalam kondisi pencahayaan apapun dengan mode gelap dan terang yang dapat diaktifkan kapan saja." },
      ],
      teamTitle: "Tim Kami",
      teamDesc: "Pantau Pendidikan dibangun oleh tim lintas disiplin yang menggabungkan keahlian kebijakan pendidikan, pemerintahan, rekayasa perangkat lunak, dan analitik data.",
      teamGroups: [
        {
          icon: "🎓", color: "#0d6efd", bg: dark ? "rgba(13,110,253,0.1)" : "#eff6ff", border: "#bfdbfe",
          title: "Pakar Pendidikan & Mantan Pejabat Pemerintah",
          desc: "Tim kami mencakup para ahli kebijakan pendidikan dan mantan pejabat pemerintah yang telah bekerja langsung dengan sistem pendidikan Indonesia — memahami nuansa regulasi, program Kemendikdasmen, dan dinamika desentralisasi pendidikan dari pengalaman langsung.",
          tags: ["Kebijakan Pendidikan", "Tata Kelola Pemerintah", "Regulasi K-12", "Desentralisasi Fiskal"],
        },
        {
          icon: "💻", color: "#7c3aed", bg: dark ? "rgba(124,58,237,0.1)" : "#f5f3ff", border: "#ddd6fe",
          title: "Insinyur Perangkat Lunak",
          desc: "Engineer kami membangun infrastruktur platform — mulai dari pipeline data backend, integrasi API, sistem AI, hingga antarmuka pengguna responsif. Tim berfokus pada keandalan, keamanan data, dan pengalaman pengguna yang intuitif.",
          tags: ["Full-Stack Development", "AI/LLM Integration", "Data Pipelines", "UI/UX Engineering"],
        },
        {
          icon: "📈", color: "#16a34a", bg: dark ? "rgba(22,163,74,0.1)" : "#f0fdf4", border: "#bbf7d0",
          title: "Pakar Analitik Data",
          desc: "Analis data kami bertanggung jawab atas validasi dataset, pengembangan metodologi, dan interpretasi statistik. Mereka memastikan bahwa setiap angka yang ditampilkan platform ini dapat dipertanggungjawabkan dan bersumber dari data yang dapat diverifikasi secara publik.",
          tags: ["Statistik Pendidikan", "Validasi Data", "Visualisasi", "Analisis Kebijakan Berbasis Bukti"],
        },
      ],
      valuesTitle: "Nilai & Komitmen Kami",
      values: [
        { icon: "✅", title: "Independen", desc: "Kami tidak berafiliasi dengan instansi pemerintah mana pun. Analisis kami bebas dari tekanan institusional." },
        { icon: "🔎", title: "Transparan", desc: "Setiap analisis dilengkapi kutipan sumber. Kami membedakan data terverifikasi dari estimasi berbasis web search." },
        { icon: "🌍", title: "Aksesibel", desc: "Data pendidikan harus dapat dipahami oleh semua pihak — bukan hanya peneliti dan pembuat kebijakan." },
        { icon: "🛡️", title: "Bertanggung Jawab", desc: "Kami mengakui keterbatasan data secara terbuka dan tidak pernah menyajikan klaim yang tidak dapat diverifikasi." },
      ],
      contactTitle: "Hubungi Kami",
      contactDesc: "Platform ini masih dalam pengembangan aktif (Beta v0.1). Kami menyambut masukan, saran sumber data baru, dan kolaborasi.",
    },
    en: {
      heroTag: "About the Platform",
      heroTitle: "About", heroTitleEm: "Pantau Pendidikan",
      heroDesc: "Pantau Pendidikan translates to Monitor Education. An independent platform for monitoring, understanding, and advocating for improvements in Indonesia's education data — built by a multidisciplinary team dedicated to transparency and accountability.",
      aboutTitle: "About the Platform",
      aboutBody: [
        "Pantau Pendidikan is an independent education intelligence platform designed to bridge the gap between Indonesia's vast education data and public understanding of that data. The platform aggregates data from official sources — including PISA/OECD, Asesmen Nasional, Dapodik, EMIS, and Kemenkeu APBN data — and presents it through an AI-powered interface accessible to everyone.",
        "We believe that good education policy starts with trustworthy, understandable data. Pantau Pendidikan is not affiliated with any government agency — we are an independent civic project committed to transparency, data rigour, and public accessibility.",
        "The platform is currently in Beta (v0.1). New features, additional data sources, and in-depth reports are under active development.",
      ],
      featuresTitle: "Platform Features",
      features: [
        { icon: "🤖", title: "Natural Language AI Analysis", desc: "Ask questions in Bahasa Indonesia or English — our AI analyses data and presents findings with live visualisations." },
        { icon: "📊", title: "Verified Datasets", desc: "Indonesia PISA data 2000–2022 and APBN education spending data 2005–2026 have been uploaded, validated, and integrated directly into the AI system." },
        { icon: "🔍", title: "PISA Deep Dive", desc: "Explore PISA data by domain (Reading, Mathematics, Science), proficiency levels, location gaps, and school ownership." },
        { icon: "🗂️", title: "Data Source Catalogue", desc: "A complete directory of 17 official Indonesian education data sources with update frequencies, coverage, and direct links." },
        { icon: "🌐", title: "Bilingual EN/ID", desc: "The entire platform is available in Bahasa Indonesia and English, including AI analysis and data visualisations." },
        { icon: "🌙", title: "Dark & Light Mode", desc: "A comfortable interface for any lighting condition with toggleable dark and light modes." },
      ],
      teamTitle: "Our Team",
      teamDesc: "Pantau Pendidikan is built by a multidisciplinary team combining expertise in education policy, government, software engineering, and data analytics.",
      teamGroups: [
        {
          icon: "🎓", color: "#0d6efd", bg: dark ? "rgba(13,110,253,0.1)" : "#eff6ff", border: "#bfdbfe",
          title: "Education Experts & Former Government Officials",
          desc: "Our team includes education policy experts and former government officials who have worked directly within Indonesia's education system — with deep understanding of Kemendikdasmen regulations, national programmes, and the dynamics of education decentralisation from first-hand experience.",
          tags: ["Education Policy", "Government Governance", "K-12 Regulation", "Fiscal Decentralisation"],
        },
        {
          icon: "💻", color: "#7c3aed", bg: dark ? "rgba(124,58,237,0.1)" : "#f5f3ff", border: "#ddd6fe",
          title: "Software Engineers",
          desc: "Our engineers build the platform infrastructure — from backend data pipelines and API integrations to the AI system and responsive user interface. The team focuses on reliability, data security, and intuitive user experience.",
          tags: ["Full-Stack Development", "AI/LLM Integration", "Data Pipelines", "UI/UX Engineering"],
        },
        {
          icon: "📈", color: "#16a34a", bg: dark ? "rgba(22,163,74,0.1)" : "#f0fdf4", border: "#bbf7d0",
          title: "Data Analytics Experts",
          desc: "Our data analysts are responsible for dataset validation, methodology development, and statistical interpretation. They ensure every figure the platform displays is accountable and sourced from publicly verifiable data.",
          tags: ["Education Statistics", "Data Validation", "Visualisation", "Evidence-Based Policy Analysis"],
        },
      ],
      valuesTitle: "Our Values & Commitments",
      values: [
        { icon: "✅", title: "Independent", desc: "We are not affiliated with any government agency. Our analyses are free from institutional pressure." },
        { icon: "🔎", title: "Transparent", desc: "Every analysis includes source citations. We distinguish verified data from web-search-based estimates." },
        { icon: "🌍", title: "Accessible", desc: "Education data should be understandable by everyone — not just researchers and policymakers." },
        { icon: "🛡️", title: "Accountable", desc: "We openly acknowledge data limitations and never present claims that cannot be verified." },
      ],
      contactTitle: "Get in Touch",
      contactDesc: "This platform is under active development (Beta v0.1). We welcome feedback, suggestions for new data sources, and collaboration.",
    },
  }[lang];

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderBottom: "1px solid #334155", padding: "3rem 1.5rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #0d6efd, #06b6d4, #0d6efd)" }} />
        <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(13,110,253,0.15)", border: "1px solid rgba(13,110,253,0.3)", borderRadius: "999px", padding: "0.2rem 0.8rem", marginBottom: "1.1rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#7dd3fc", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "700" }}>{L.heroTag}</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "0.8rem" }}>
            {L.heroTitle} <span style={{ color: "#7dd3fc" }}>—</span><br /><em style={{ fontStyle: "normal", color: "#7dd3fc" }}>{L.heroTitleEm}</em>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.72, maxWidth: "620px" }}>{L.heroDesc}</p>
        </div>
      </section>

      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* About the Platform */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "4px", height: "1.2rem", background: "#0d6efd", borderRadius: "2px", display: "block" }} />{L.aboutTitle}
          </h2>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "1.75rem", boxShadow: T.shadow }}>
            {L.aboutBody.map((para, i) => (
              <p key={i} style={{ fontSize: "0.875rem", color: T.textSub, lineHeight: 1.8, marginBottom: i < L.aboutBody.length - 1 ? "1rem" : 0 }}>{para}</p>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "4px", height: "1.2rem", background: "#06b6d4", borderRadius: "2px", display: "block" }} />{L.featuresTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {L.features.map((f, i) => (
              <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "1.25rem", boxShadow: T.shadow, display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: "700", color: T.text, marginBottom: "0.35rem" }}>{f.title}</p>
                  <p style={{ fontSize: "0.74rem", color: T.textSub, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "4px", height: "1.2rem", background: "#7c3aed", borderRadius: "2px", display: "block" }} />{L.teamTitle}
          </h2>
          <p style={{ fontSize: "0.82rem", color: T.textSub, lineHeight: 1.7, marginBottom: "1.25rem", maxWidth: "680px" }}>{L.teamDesc}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {L.teamGroups.map((g, i) => (
              <div key={i} style={{ background: g.bg, border: `1px solid ${g.border}`, borderRadius: "12px", padding: "1.5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{g.icon}</div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: T.text, marginBottom: "0.6rem", lineHeight: 1.3 }}>{g.title}</h3>
                <p style={{ fontSize: "0.77rem", color: T.textSub, lineHeight: 1.7, marginBottom: "1rem" }}>{g.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {g.tags.map(tag => (
                    <span key={tag} style={{ fontSize: "0.64rem", fontWeight: "700", color: g.color, background: "rgba(255,255,255,0.6)", border: `1px solid ${g.border}`, padding: "0.18rem 0.55rem", borderRadius: "999px" }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "4px", height: "1.2rem", background: "#16a34a", borderRadius: "2px", display: "block" }} />{L.valuesTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {L.values.map((v, i) => (
              <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "1.25rem", boxShadow: T.shadow }}>
                <div style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>{v.icon}</div>
                <p style={{ fontSize: "0.85rem", fontWeight: "700", color: T.text, marginBottom: "0.35rem" }}>{v.title}</p>
                <p style={{ fontSize: "0.74rem", color: T.textSub, lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <div style={{ background: "linear-gradient(135deg, #0d6efd11, #06b6d411)", border: `1px solid ${T.borderHover}`, borderRadius: "14px", padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>💬</div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: "800", color: T.text, marginBottom: "0.5rem" }}>{L.contactTitle}</h2>
            <p style={{ fontSize: "0.82rem", color: T.textSub, lineHeight: 1.7, maxWidth: "480px", margin: "0 auto" }}>{L.contactDesc}</p>
          </div>
        </section>

      </div>
    </div>
  );
}

// ─── DATA EXPLORER SUB-CHARTS (hoisted to avoid re-definition on render) ──────



function DeProficiencyChart({ lang, T }) {
  const years = [2000, 2003, 2006, 2009, 2012, 2015, 2018, 2022];
  const data = years.map(y => ({
    year: y, l2r: PISA_DATA.pctLevel2[y].reading, l2m: PISA_DATA.pctLevel2[y].math || 0,
  })).filter(d => d.l2r !== null);
  const maxV = 55;
  const barW = 28, gap = 8, groupGap = 20;
  const W = data.length * (barW * 2 + gap + groupGap) + 40, H = 150, padB = 22, padT = 12, padL = 36;
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", minWidth: 360, height: "auto", display: "block" }}>
          {[20, 30, 40, 50].map(v => {
            const y = padT + (1 - v / maxV) * (H - padT - padB);
            return (
              <g key={v}>
                <line x1={padL} x2={W} y1={y} y2={y} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
                <text x={padL - 3} y={y + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}%</text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const gx = padL + i * (barW * 2 + gap + groupGap);
            const rH = (d.l2r / maxV) * (H - padT - padB);
            const mH = (d.l2m / maxV) * (H - padT - padB);
            return (
              <g key={i}>
                <rect x={gx} y={H - padB - rH} width={barW} height={rH} fill="#0d6efd" rx="2" />
                <rect x={gx + barW + gap} y={H - padB - mH} width={barW} height={mH} fill="#06b6d4" rx="2" />
                <text x={gx + barW} y={H - padB + 13} textAnchor="middle" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{d.year}</text>
              </g>
            );
          })}
          <line x1={padL} x2={W} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
        </svg>
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
        {[["#0d6efd", lang === "id" ? "Membaca ≥ L2" : "Reading ≥ L2"], ["#06b6d4", lang === "id" ? "Matematika ≥ L2" : "Math ≥ L2"]].map(([c, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", color: T.textSub }}>
            <span style={{ width: "12px", height: "12px", background: c, borderRadius: "2px", display: "block" }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── MIXED SOURCE CHARTS ─────────────────────────────────────────────────────
// Renders chartData that has a mix of verified and web-sourced points.
// Each data point can have: { label, value, sourceType: "verified"|"web", sourceLabel }

function MixedBarChart({ data, unit, T, lang }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value));
  const allWeb = data.every(d => d.sourceType !== "verified");
  const hasVerified = data.some(d => d.sourceType === "verified");
  const hasWeb = data.some(d => d.sourceType !== "verified");

  // Collect unique web sources for methodology note
  const webSources = allWeb
    ? [...new Map(data.filter(d => d.sourceType !== "verified").map(d => [d.sourceLabel, d])).values()]
    : [];

  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      {data.map((d, i) => {
        const isVerified = d.sourceType === "verified";
        const pct = (d.value / max) * 100;
        const barColor = isVerified ? "linear-gradient(90deg, #0d6efd, #06b6d4)" : "#f59e0b";
        const textColor = isVerified ? "#fff" : "#78350f";
        const showInside = pct > 20;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
            <span style={{ width: "130px", fontSize: "0.74rem", color: T.textSub, textAlign: "right", flexShrink: 0, lineHeight: 1.3 }}>{d.label}</span>
            <div style={{ flex: 1, background: T.trackBg, borderRadius: "4px", overflow: "hidden", height: "26px", position: "relative" }}>
              <div style={{
                width: `${pct}%`, height: "100%", borderRadius: "4px",
                background: barColor,
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                paddingRight: showInside ? "6px" : "0",
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              }}>
                {showInside && <span style={{ fontSize: "0.68rem", fontWeight: "700", color: textColor, whiteSpace: "nowrap" }}>{d.value}{unit?.includes("%") ? "%" : ""}</span>}
              </div>
              {!showInside && <span style={{ position: "absolute", left: `calc(${pct}% + 6px)`, top: "50%", transform: "translateY(-50%)", fontSize: "0.68rem", fontWeight: "700", color: T.text, whiteSpace: "nowrap" }}>{d.value}{unit?.includes("%") ? "%" : ""}</span>}
            </div>
            <span style={{
              fontSize: "0.55rem", fontWeight: "700", flexShrink: 0, width: "14px", height: "14px",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: isVerified ? "#dcfce7" : "#fef3c7",
              color: isVerified ? "#15803d" : "#92400e",
              border: `1px solid ${isVerified ? "#bbf7d0" : "#fde68a"}`,
            }}>{isVerified ? "✓" : "🔍"}</span>
          </div>
        );
      })}

      {/* Legend */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
        {hasVerified && (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.66rem", color: T.textSub }}>
            <span style={{ width: "24px", height: "10px", borderRadius: "2px", background: "linear-gradient(90deg, #0d6efd, #06b6d4)", display: "block" }} />
            ✓ {lang === "id" ? "Data Terverifikasi" : "Verified Data"}
          </span>
        )}
        {hasWeb && (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.66rem", color: T.textSub }}>
            <span style={{ width: "24px", height: "10px", borderRadius: "2px", background: "#f59e0b", display: "block" }} />
            🔍 {lang === "id" ? "Sumber Web" : "Web Source"}
          </span>
        )}
      </div>

      {/* Methodology note — shown when all data comes from web sources */}
      {allWeb && webSources.length > 0 && (
        <div style={{
          marginTop: "0.85rem", padding: "0.65rem 0.85rem",
          background: lang === "id" ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.25)", borderRadius: "8px",
        }}>
          <p style={{ fontSize: "0.63rem", fontWeight: "700", color: "#92400e", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            🔍 {lang === "id" ? "Tentang Visualisasi Ini" : "About This Chart"}
          </p>
          <p style={{ fontSize: "0.65rem", color: T.textSub, lineHeight: 1.6, margin: 0 }}>
            {lang === "id"
              ? `Grafik ini sepenuhnya dibangun dari hasil pencarian web langsung. Nilai yang ditampilkan bersumber dari laporan resmi yang ditemukan selama analisis — bukan dari dataset PISA atau APBN yang diunggah ke platform ini. Sumber: ${webSources.map(s => s.sourceLabel).join(", ")}.`
              : `This chart is built entirely from live web search results. Values shown are drawn from official reports found during the analysis — not from the PISA or APBN datasets uploaded to this platform. Sources: ${webSources.map(s => s.sourceLabel).join(", ")}.`}
          </p>
          {webSources.some(s => s.sourceUrl && s.sourceUrl !== "null") && (
            <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {webSources.filter(s => s.sourceUrl && s.sourceUrl !== "null").map((s, i) => (
                <a key={i} href={s.sourceUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.62rem", color: "#d97706", fontWeight: "600", textDecoration: "none" }}>
                  {s.sourceLabel} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MixedLineChart({ data, unit, T, lang }) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.value).filter(v => v != null);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const W = 520, H = 160, padL = 36, padR = 16, padT = 18, padB = 28;
  const sx = i => padL + (i / (data.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / range) * (H - padT - padB);

  // Split into segments — connected if same source, break if switching
  const verifiedPts = data.map((d, i) => d.sourceType === "verified" ? { x: sx(i), y: sy(d.value), ...d } : null);
  const webPts = data.map((d, i) => d.sourceType !== "verified" ? { x: sx(i), y: sy(d.value), ...d } : null);

  const makeSegments = (pts) => {
    const segs = [];
    let cur = [];
    pts.forEach(p => {
      if (p) { cur.push(p); }
      else { if (cur.length >= 1) segs.push(cur); cur = []; }
    });
    if (cur.length >= 1) segs.push(cur);
    return segs;
  };

  const gridStep = Math.round(range / 4 / 5) * 5 || Math.round(range / 4) || 1;
  const grids = [];
  for (let v = Math.ceil(minV / gridStep) * gridStep; v <= maxV; v += gridStep) grids.push(v);

  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id="mixedVerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0d6efd" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {grids.map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}{unit?.includes("%") ? "%" : ""}</text>
          </g>
        ))}
        {/* Verified segments — solid blue */}
        {makeSegments(verifiedPts).map((seg, si) => (
          <g key={`vs${si}`}>
            {seg.length >= 2 && <path d={seg.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")} fill="none" stroke="#0d6efd" strokeWidth="2.5" strokeLinejoin="round" />}
            {seg.length === 1 && <circle cx={seg[0].x} cy={seg[0].y} r={4} fill="#0d6efd" stroke={T.surface} strokeWidth="2" />}
          </g>
        ))}
        {/* Web segments — amber dashed */}
        {makeSegments(webPts).map((seg, si) => (
          <g key={`ws${si}`}>
            {seg.length >= 2 && <path d={seg.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="5,3" strokeLinejoin="round" />}
            {seg.length === 1 && <circle cx={seg[0].x} cy={seg[0].y} r={4} fill="#d97706" stroke={T.surface} strokeWidth="2" />}
          </g>
        ))}
        {/* Connecting bridge between verified and web segments */}
        {data.map((d, i) => {
          if (i === 0 || !data[i-1]) return null;
          const prev = data[i-1];
          if (prev.sourceType !== d.sourceType) {
            return <line key={`bridge${i}`} x1={sx(i-1)} y1={sy(prev.value)} x2={sx(i)} y2={sy(d.value)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,3" />;
          }
          return null;
        })}
        {/* Data points */}
        {data.map((d, i) => {
          const isVerified = d.sourceType === "verified";
          return (
            <g key={i}>
              <circle cx={sx(i)} cy={sy(d.value)} r={4}
                fill={isVerified ? "#0d6efd" : "#d97706"}
                stroke={T.surface} strokeWidth="2" />
              <text x={sx(i)} y={sy(d.value) - 9} textAnchor="middle" fontSize="9" fontWeight="700" fill={T.text} fontFamily="sans-serif">
                {d.value}{unit?.includes("%") ? "%" : ""}
              </text>
              <text x={sx(i)} y={H - padB + 12} textAnchor="middle" fontSize="8.5" fill={T.textMuted} fontFamily="sans-serif">{d.label}</text>
            </g>
          );
        })}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
        {data.some(d => d.sourceType === "verified") && (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.66rem", color: T.textSub }}>
            <span style={{ width: "20px", height: "3px", background: "#0d6efd", display: "block", borderRadius: "2px" }} />
            ✓ {lang === "id" ? "Data Terverifikasi" : "Verified Data"}
          </span>
        )}
        {data.some(d => d.sourceType !== "verified") && (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.66rem", color: T.textSub }}>
            <span style={{ width: "20px", height: "3px", background: "#d97706", display: "block", borderRadius: "2px", borderBottom: "2px dashed #d97706" }} />
            🔍 {lang === "id" ? "Sumber Web" : "Web Source"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── SPENDING RESULT CHART ────────────────────────────────────────────────────
// Used in the analysis result panel for any spending/budget question.
// Always draws from SPENDING_DATA (verified) for 2020–2024 regardless of what
// chartData the AI returned, ensuring the line chart is always accurate and togglable.

function SpendingLineChart({ data, unit, lang, T, dark, size }) {
  const [metric, setMetric] = useState("idr");

  // Normalise AI chartData — values may come as strings, labels may be non-integer years
  const normalised = (data || []).map(d => ({
    ...d,
    value: typeof d.value === "string" ? parseFloat(d.value) : (d.value ?? 0),
    label: String(d.label ?? ""),
  })).filter(d => !isNaN(d.value));

  // Try to match each point to a verified year; if AI returned no usable year labels,
  // fall back to the full SPENDING_DATA series for the last 5 years
  const getVerifiedYear = label => {
    const y = parseInt(label);
    return isNaN(y) ? null : y;
  };

  const hasValidYears = normalised.some(d => getVerifiedYear(d.label) !== null &&
    SPENDING_DATA.series.some(s => s.year === getVerifiedYear(d.label)));

  // Build source data: use AI years if they match verified data, else use last-5-years of verified data
  const sourceData = hasValidYears ? normalised : (() => {
    const recent = SPENDING_DATA.series.filter(s => s.year >= 2020 && s.year <= 2024);
    return recent.map(s => ({ label: String(s.year), value: s.valueT }));
  })();

  const enriched = sourceData.map(d => {
    const year = getVerifiedYear(d.label);
    const bpp = year ? SPENDING_DATA.series.find(s => s.year === year) : null;
    const tot = year ? TOTAL_SPENDING_DATA.series.find(s => s.year === year) : null;
    return {
      label: d.label,
      idr:        bpp ? bpp.valueT       : (typeof d.value === "number" && d.value > 0 ? d.value : null),
      total:      tot ? tot.totalT       : null,
      pctOfTotal: tot ? tot.pctOfTotal   : null,
      pctGDP:     bpp ? bpp.pctGDP       : null,
      isVerified: !!(bpp || tot),
      hasTotalData: !!tot,
    };
  });

  const hasPct   = enriched.some(d => d.pctOfTotal !== null);
  const hasGdp   = enriched.some(d => d.pctGDP !== null);
  const hasTotal = enriched.some(d => d.total !== null);
  const cfgMap = {
    idr:   { getValue: d => d.idr,        format: v => `${v}T`,  color: "#d97706",
              label: lang === "id" ? "BPP (Triliun Rp)" : "BPP (Trillion IDR)" },
    total: { getValue: d => d.total,      format: v => `${v}T`,  color: "#7c3aed",
              label: lang === "id" ? "Total Anggaran" : "Total Budget" },
    pct:   { getValue: d => d.pctOfTotal, format: v => `${v}%`,  color: "#0d6efd",
              label: lang === "id" ? "% Total APBN" : "% of Total APBN",
              mandateLine: 20,
              sublabel: "(BPP + TKD + Pembiayaan) ÷ Total Belanja Negara" },
    gdp:   { getValue: d => d.pctGDP,     format: v => `${v}%`,  color: "#16a34a",
              label: lang === "id" ? "% PDB" : "% of GDP" },
  };
  const cfg = cfgMap[metric] || cfgMap.idr;
  let pts = enriched.filter(d => cfg.getValue(d) !== null && cfg.getValue(d) > 0);

  // If still not enough points (AI returned unusable data), force-load verified 2020-2024
  if (pts.length < 2 && metric === "idr") {
    const fallback = SPENDING_DATA.series.filter(s => s.year >= 2020 && s.year <= 2024).map(s => ({
      label: String(s.year), idr: s.valueT, total: null, pctOfTotal: null, pctGDP: s.pctGDP, isVerified: true, hasTotalData: false,
    }));
    pts = fallback;
  }
  if (pts.length < 2) return null;

  const vals = pts.map(d => cfg.getValue(d));
  const minV = Math.min(...vals) * 0.88;
  const maxV = metric === "pct" && cfg.mandateLine ? Math.max(Math.max(...vals) * 1.1, 22) : Math.max(...vals) * 1.12;

  const isLarge = size === "large";
  const W = isLarge ? 760 : 480;
  const H = isLarge ? 320 : 220;
  const padL = isLarge ? 62 : 54;
  const padR = isLarge ? 28 : 24;
  const padT = isLarge ? 40 : 32;
  const padB = isLarge ? 44 : 36;
  const ptR = isLarge ? 6 : 5;
  const vFont = isLarge ? "12" : "9.5";
  const lFont = isLarge ? "12" : "9.5";
  const gFont = isLarge ? "10.5" : "9";
  const dFont = isLarge ? "9.5" : "7.5";

  const sx = i => padL + (i / (pts.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const pathD = pts.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(cfg.getValue(d))}`).join(" ");
  const fillD = `${pathD} L${sx(pts.length - 1)},${H - padB} L${sx(0)},${H - padB} Z`;
  const gradId = `slg_${metric}_${isLarge ? "l" : "s"}`;
  const grids = Array.from({ length: 5 }, (_, i) => minV + (i / 4) * (maxV - minV));

  return (
    <div>
      <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.85rem", flexWrap: "wrap" }}>
        <button onClick={() => setMetric("idr")} style={{ background: metric === "idr" ? "#d97706" : T.surface, border: `1px solid ${metric === "idr" ? "#d97706" : T.border}`, color: metric === "idr" ? "#fff" : T.textSub, fontSize: "0.69rem", fontWeight: "700", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
          {lang === "id" ? "BPP Pusat" : "Central (BPP)"}
        </button>
        {hasTotal && <button onClick={() => setMetric("total")} style={{ background: metric === "total" ? "#7c3aed" : T.surface, border: `1px solid ${metric === "total" ? "#7c3aed" : T.border}`, color: metric === "total" ? "#fff" : T.textSub, fontSize: "0.69rem", fontWeight: "700", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
          {lang === "id" ? "Total Anggaran" : "Total Budget"}
        </button>}
        {hasPct && <button onClick={() => setMetric("pct")} style={{ background: metric === "pct" ? "#0d6efd" : T.surface, border: `1px solid ${metric === "pct" ? "#0d6efd" : T.border}`, color: metric === "pct" ? "#fff" : T.textSub, fontSize: "0.69rem", fontWeight: "700", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
          {lang === "id" ? "% Total APBN" : "% of Total APBN"}
        </button>}
        {hasGdp && <button onClick={() => setMetric("gdp")} style={{ background: metric === "gdp" ? "#16a34a" : T.surface, border: `1px solid ${metric === "gdp" ? "#16a34a" : T.border}`, color: metric === "gdp" ? "#fff" : T.textSub, fontSize: "0.69rem", fontWeight: "700", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
          {lang === "id" ? "% PDB" : "% of GDP"}
        </button>}
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: `${W}px`, height: H, display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cfg.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={cfg.color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {grids.map((v, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
              <text x={padL - 8} y={sy(v) + 4} textAnchor="end" fontSize={gFont} fill={T.textMuted} fontFamily="sans-serif">
                {metric === "idr" ? `${Math.round(v)}T` : `${v.toFixed(1)}%`}
              </text>
            </g>
          ))}

          {cfg.mandateLine && sy(cfg.mandateLine) >= padT && sy(cfg.mandateLine) <= H - padB && (
            <g>
              <line x1={padL} x2={W - padR} y1={sy(cfg.mandateLine)} y2={sy(cfg.mandateLine)} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.8" />
              <text x={W - padR - 4} y={sy(cfg.mandateLine) - 5} textAnchor="end" fontSize={gFont} fill="#dc2626" fontWeight="700" fontFamily="sans-serif">
                {lang === "id" ? "Mandat 20%" : "20% mandate"}
              </text>
            </g>
          )}

          <path d={fillD} fill={`url(#${gradId})`} />
          <path d={pathD} fill="none" stroke={cfg.color} strokeWidth={isLarge ? "3" : "2.5"} strokeLinejoin="round" strokeLinecap="round" />

          {pts.map((d, i) => {
            const v = cfg.getValue(d);
            const x = sx(i), y = sy(v);
            const prev = i > 0 ? cfg.getValue(pts[i - 1]) : null;
            const delta = prev !== null ? ((v - prev) / prev * 100) : null;
            // Alternate labels above/below to avoid overlap when points are close
            const above = pts.length <= 5 || i % 2 === 0;
            const valY = above ? y - (ptR + 9) : y + (ptR + 16);
            const anchor = i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle";
            return (
              <g key={i}>
                {delta !== null && Math.abs(delta) > 0.1 && (
                  <text x={(sx(i - 1) + x) / 2}
                    y={Math.min(sy((v + prev) / 2) - 5, Math.min(sy(v), sy(prev)) - 6)}
                    textAnchor="middle" fontSize={dFont} fontWeight="700"
                    fill={delta >= 0 ? "#16a34a" : "#dc2626"} fontFamily="sans-serif">
                    {delta >= 0 ? "▲" : "▼"}{Math.abs(delta).toFixed(1)}%
                  </text>
                )}
                <circle cx={x} cy={y} r={ptR} fill={d.isVerified ? cfg.color : T.surface} stroke={cfg.color} strokeWidth="2.5" />
                <text x={x} y={valY} textAnchor={anchor} fontSize={vFont} fontWeight="800" fill={T.text} fontFamily="sans-serif">
                  {cfg.format(v)}
                </text>
                <text x={x} y={H - padB + 16} textAnchor="middle" fontSize={lFont} fontWeight="600" fill={T.text} fontFamily="sans-serif">
                  {d.label}
                </text>
              </g>
            );
          })}

          <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1.5" />
        </svg>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.66rem", color: T.textSub }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: cfg.color, display: "block" }} />
          ✓ {metric === "total"
            ? (lang === "id" ? "Total Anggaran Pendidikan (BPP+TKD+Pembiayaan) — Grafik 3.5, NK RAPBN 2026 Buku II" : "Total Education Budget (BPP+TKD+Pembiayaan) — Grafik 3.5, NK RAPBN 2026 Bk II")
            : (lang === "id" ? "Total Anggaran Pendidikan (data terverifikasi)" : "Total Education Spending (verified data)")}
        </span>
        {enriched.some(d => !d.isVerified) && (
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.66rem", color: T.textSub }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", border: `2px solid ${cfg.color}`, background: T.surface, display: "block" }} />
            {lang === "id" ? "Estimasi AI" : "AI estimate"}
          </span>
        )}
      </div>

      {metric === "pct" && (
        <>
          <p style={{ fontSize: "0.65rem", color: T.textMuted, marginTop: "0.25rem", fontStyle: "italic" }}>
            {lang === "id"
              ? "% dihitung dari total anggaran pendidikan (BPP + TKD + Pembiayaan) dibagi total Belanja Negara APBN tahun bersangkutan"
              : "% calculated as total education budget (BPP + TKD + Pembiayaan) divided by total APBN Belanja Negara for that year"}
          </p>
          <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem", background: dark ? "rgba(220,38,38,0.1)" : "#fef2f2", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "6px", padding: "0.45rem 0.75rem" }}>
            <span style={{ fontSize: "0.75rem", flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: "0.65rem", color: dark ? "#fca5a5" : "#991b1b", margin: 0, lineHeight: 1.5 }}>
              {lang === "id"
                ? "Mandat konstitusional: minimal 20% APBN untuk pendidikan (UU Sisdiknas No. 20/2003 & UUD 1945 Pasal 31 ayat 4). Realisasi 2024: 17,1% — di bawah mandat. Proyeksi RAPBN 2026: 20,9% (pertama kali memenuhi mandat)."
                : "Constitutional mandate: minimum 20% of APBN for education (UU Sisdiknas No. 20/2003 & UUD 1945 Article 31.4). Actual 2024: 17.1% — below mandate. RAPBN 2026 projection: 20.9% (first time meeting mandate)."}
            </p>
          </div>
        </>
      )}
      <p style={{ fontSize: "0.61rem", color: T.textMuted, marginTop: "0.4rem", lineHeight: 1.5 }}>
        ✓ {lang === "id"
          ? <>BPP: Nota Keuangan APBN, Kemenkeu RI · Total: <a href={TOTAL_SPENDING_DATA.meta.url} target="_blank" rel="noopener noreferrer" style={{ color: T.blue, textDecoration: "none" }}>Grafik 3.5, Nota Keuangan RAPBN 2026 Buku II ↗</a></>
          : <>BPP: Nota Keuangan APBN, Kemenkeu RI · Total: <a href={TOTAL_SPENDING_DATA.meta.url} target="_blank" rel="noopener noreferrer" style={{ color: T.blue, textDecoration: "none" }}>Grafik 3.5, Nota Keuangan RAPBN 2026 Book II ↗</a></>}
      </p>
    </div>
  );
}
// ─── RESULT CHART PANEL ──────────────────────────────────────────────────────
// Wraps the analysis result chart with a zoom button. Resolves which chart
// component to render based on query type and data shape.

function resolveChart(result, lastQuery, lang, T, dark, size) {
  const d = result.chartData || [];
  const q = (result._query || lastQuery || "").toLowerCase();

  // 1. CORRELATION — strict keyword match required; chartType hint only supplements, never overrides
  const isCorrelationQ =
    (q.includes("korelasi") || q.includes("correlation") || q.includes("hubungan") || q.includes("relationship")) &&
    (q.includes("pisa") || q.includes("skor") || q.includes("score") || q.includes("kinerja") || q.includes("performance") || q.includes("learning") || q.includes("hasil") || q.includes("capaian"));

  if (isCorrelationQ) {
    // Build dual-axis data from verified datasets: years where we have both spending and PISA data
    const verifiedDual = [2010, 2012, 2015, 2018, 2022].map(yr => {
      const sp = SPENDING_DATA.series.find(s => s.year === yr);
      const ps = PISA_DATA.national[yr];
      if (!sp || !ps || !ps.reading) return null;
      return { label: String(yr), spending: sp.valueT, pisa: ps.reading };
    }).filter(Boolean);
    if (verifiedDual.length >= 2) {
      return <DualAxisChart
        data={verifiedDual}
        unit={lang === "id" ? "Belanja Pendidikan (BPP) / Skor PISA Membaca" : "Education Spending (BPP) / PISA Reading Score"}
        T={T} size={size}
      />;
    }
    const hasDualData = d.length > 0 && (d[0]?.spending !== undefined || d[0]?.pisa !== undefined);
    if (hasDualData) return <DualAxisChart data={d} unit={result.unit} T={T} size={size} />;
  }

  // 2. SPENDING — only for pure spending/trend queries (not correlation)
  const isCorrelationKeyword = q.includes("korelasi") || q.includes("correlation") || q.includes("hubungan") || q.includes("relationship");
  const isSpendingQ = !isCorrelationKeyword && (
    q.includes("spend") || q.includes("belanja") || q.includes("budget") ||
    q.includes("anggaran") || q.includes("apbn") || q.includes("rupiah") ||
    q.includes("trillion") || q.includes("triliun") || q.includes("fiscal") || q.includes("fiskal") ||
    q.includes("pengeluaran") || q.includes("pembiayaan")
  );
  if (isSpendingQ) return <SpendingLineChart data={d} unit={result.unit} lang={lang} T={T} dark={dark} size={size} />;

  // 3. No chartData — nothing to show
  if (d.length === 0) return null;

  const hasMixed = d.some(p => p.sourceType);
  if (hasMixed && result.chartType === "line") return <MixedLineChart data={d} unit={result.unit} T={T} lang={lang} />;
  if (hasMixed) return <MixedBarChart data={d} unit={result.unit} T={T} lang={lang} />;
  if (result.chartType === "bar") return <BarChart data={d} unit={result.unit} highlight={result.highlight} T={T} />;
  if (result.chartType === "line") return <LineChart data={d} unit={result.unit} T={T} />;
  if (result.chartType === "comparison") return <ComparisonChart data={d} unit={result.unit} T={T} />;
  if (result.chartType === "scatter") return <ScatterChart data={d} unit={result.unit} T={T} />;
  return <BarChart data={d} unit={result.unit} highlight={result.highlight} T={T} />;
}


function ResultChartPanel({ result, lastQuery, lang, T, dark }) {
  const [zoomed, setZoomed] = useState(false);
  const title = (result._query || lastQuery || "").slice(0, 70);

  return (
    <div style={{ padding: "1.4rem", position: "relative" }}>
      <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 2 }}>
        <button
          onClick={() => setZoomed(true)}
          title={lang === "id" ? "Perbesar grafik" : "Expand chart"}
          style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "6px", color: T.textMuted, fontSize: "0.8rem", padding: "0.2rem 0.5rem", cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", gap: "4px" }}
        >
          <span style={{ fontSize: "0.65rem", fontWeight: "600" }}>⤢</span>
          <span style={{ fontSize: "0.62rem", fontWeight: "600" }}>{lang === "id" ? "Perbesar" : "Expand"}</span>
        </button>
      </div>

      {resolveChart(result, lastQuery, lang, T, dark, "normal")}

      {zoomed && (
        <ZoomModal title={title} T={T} onClose={() => setZoomed(false)}>
          {resolveChart(result, lastQuery, lang, T, dark, "large")}
        </ZoomModal>
      )}
    </div>
  );
}

function ZoomModal({ children, title, onClose, T }) {
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", width: "100%", maxWidth: "960px", maxHeight: "90vh", overflow: "auto", boxShadow: T.shadowHover }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.4rem", borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: T.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMuted, fontSize: "1.2rem", cursor: "pointer", lineHeight: 1, padding: "0.2rem 0.4rem", borderRadius: "4px" }}>✕</button>
        </div>
        <div style={{ padding: "1.5rem", background: T.surface }}>{children}</div>
      </div>
    </div>
  );
}

// Reusable zoom button
function ZoomBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Zoom / expand"
      style={{ background: "none", border: "1px solid #334155", borderRadius: "5px", color: "#94a3b8", fontSize: "0.75rem", padding: "0.18rem 0.45rem", cursor: "pointer", lineHeight: 1, flexShrink: 0 }}
    >⤢</button>
  );
}

function DeSpendingChart({ T, lang }) {
  const [metric, setMetric] = useState("idr");   // "idr" | "pct" | "gdp"
  const [zoomed, setZoomed] = useState(false);

  // Merge SPENDING_DATA with TOTAL_SPENDING_DATA: use pctOfTotal where available (2021+), pctOfBelanja for older years
  const data = SPENDING_DATA.series.map(d => {
    const tot = TOTAL_SPENDING_DATA.series.find(t => t.year === d.year);
    return { ...d, pctForChart: tot ? tot.pctOfTotal : d.pctOfBelanja, hasTotal: !!tot };
  });

  const metricLabels = {
    idr: lang === "id" ? "Triliun Rp" : "Trillion IDR",
    pct: lang === "id" ? "% Total APBN" : "% of Total APBN",
    gdp: lang === "id" ? "% PDB" : "% of GDP",
  };
  const getValue = d => metric === "idr" ? d.valueT : metric === "pct" ? d.pctForChart : d.pctGDP;
  const vals = data.map(getValue);
  const maxV = Math.max(...vals) * 1.12;

  const mandateLine = metric === "pct" ? 20 : null;

  const renderChart = (W, H) => {
    const padL = 44, padR = 14, padT = 18, padB = 28;
    const xScale = i => padL + (i / (data.length - 1)) * (W - padL - padR);
    const yScale = v => padT + (1 - v / maxV) * (H - padT - padB);
    const splitIdx = data.findIndex(d => (d.status === "outlook" || d.status === "RAPBN") && d.year >= 2025);
    const confirmedPts = data.slice(0, splitIdx > 0 ? splitIdx : data.length).map((d, i) => ({ x: xScale(i), y: yScale(getValue(d)), ...d }));
    const projectedPts = splitIdx > 0 ? data.slice(splitIdx - 1).map((d, i) => ({ x: xScale(splitIdx - 1 + i), y: yScale(getValue(d)), ...d })) : [];
    const confirmedPath = confirmedPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const projectedPath = projectedPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const fillPath = confirmedPath + ` L${confirmedPts[confirmedPts.length-1].x},${H-padB} L${confirmedPts[0].x},${H-padB} Z`;

    // Grid lines
    const gridStep = metric === "idr" ? 100 : metric === "pct" ? 5 : 0.5;
    const grids = [];
    for (let v = gridStep; v < maxV; v += gridStep) grids.push(v);

    const gradId = `spendGrad_${metric}`;
    const color = "#d97706";

    return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {grids.map(v => (
          <g key={v}>
            <line x1={padL} x2={W-padR} y1={yScale(v)} y2={yScale(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL-3} y={yScale(v)+4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">
              {metric === "idr" ? `${v}T` : `${v}%`}
            </text>
          </g>
        ))}
        {/* 20% mandate reference line */}
        {mandateLine && yScale(mandateLine) >= padT && (
          <g>
            <line x1={padL} x2={W-padR} y1={yScale(mandateLine)} y2={yScale(mandateLine)} stroke="#16a34a" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.8" />
            <text x={W-padR-2} y={yScale(mandateLine)-4} textAnchor="end" fontSize="8" fill="#16a34a" fontFamily="sans-serif">
              {lang === "id" ? "Mandat 20%" : "20% mandate"}
            </text>
          </g>
        )}
        <path d={fillPath} fill={`url(#${gradId})`} />
        <path d={confirmedPath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        {projectedPts.length > 1 && <path d={projectedPath} fill="none" stroke={color} strokeWidth="2" strokeDasharray="5,4" strokeLinejoin="round" />}
        {data.map((d, i) => {
          const isProjected = d.status === "outlook" || d.status === "RAPBN";
          const showLabel = [2005, 2008, 2010, 2013, 2016, 2019, 2022, 2024, 2026].includes(d.year);
          const v = getValue(d);
          return (
            <g key={i}>
              <circle cx={xScale(i)} cy={yScale(v)} r={showLabel ? 4 : 2.5} fill={isProjected ? T.surface : color} stroke={color} strokeWidth={showLabel ? 2 : 1.5} />
              {showLabel && (
                <text x={xScale(i)} y={yScale(v) - 8} textAnchor="middle" fontSize="8.5" fontWeight="700" fill={isProjected ? T.textMuted : T.text} fontFamily="sans-serif">
                  {metric === "idr" ? `${v}T` : `${v}%`}
                </text>
              )}
              {showLabel && (
                <text x={xScale(i)} y={H-padB+13} textAnchor="middle" fontSize="8.5" fill={T.textMuted} fontFamily="sans-serif">{d.year}</text>
              )}
            </g>
          );
        })}
        <line x1={padL} x2={W-padR} y1={H-padB} y2={H-padB} stroke={T.border} strokeWidth="1" />
      </svg>
    );
  };

  const legend = (
    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
      {[["#d97706", "━", lang === "id" ? "Realisasi / APBN" : "Actual / Budget"],
        ["#d97706", "╌", lang === "id" ? "Proyeksi" : "Projected"],
        ...(mandateLine ? [["#16a34a", "╌", lang === "id" ? "Mandat 20%" : "20% mandate"]] : [])
      ].map(([c, s, l]) => (
        <span key={l} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", color: T.textSub }}>
          <span style={{ color: c, fontSize: "0.85rem" }}>{s}</span>{l}
        </span>
      ))}
    </div>
  );

  const toggleRow = (
    <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
      {[["idr", metricLabels.idr], ["pct", metricLabels.pct], ["gdp", metricLabels.gdp]].map(([k, l]) => (
        <button key={k} onClick={() => setMetric(k)} style={{
          background: metric === k ? "#d97706" : T.surface,
          border: `1px solid ${metric === k ? "#d97706" : T.border}`,
          color: metric === k ? "#fff" : T.textSub,
          fontSize: "0.68rem", fontWeight: "700", padding: "0.2rem 0.6rem",
          borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
        }}>{l}</button>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        {toggleRow}
        <ZoomBtn onClick={() => setZoomed(true)} />
      </div>
      {renderChart(580, 180)}
      {legend}
      {zoomed && (
        <ZoomModal
          title={`${lang === "id" ? "Belanja Pendidikan" : "Education Spending"} — ${metricLabels[metric]} (2005–2026)`} T={T} onClose={() => setZoomed(false)}
        >
          <div style={{ marginBottom: "1rem" }}>{toggleRow}</div>
          {renderChart(820, 320)}
          {legend}
          <p style={{ fontSize: "0.65rem", color: "#475569", marginTop: "1rem" }}>{SPENDING_DATA.meta.source} · {SPENDING_DATA.meta.pctSource}</p>
        </ZoomModal>
      )}
    </div>
  );
}

function ZoomablePisaView({ children, T, lang }) {
  const [zoomed, setZoomed] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.4rem" }}>
        <ZoomBtn onClick={() => setZoomed(true)} />
      </div>
      {children}
      {zoomed && (
        <ZoomModal title={lang === "id" ? "PISA Indonesia — Tampilan Diperbesar" : "PISA Indonesia — Expanded View"} T={T} onClose={() => setZoomed(false)}>
          {children}
          <p style={{ fontSize: "0.65rem", color: "#475569", marginTop: "1rem" }}>{PISA_DATA.meta.source}</p>
        </ZoomModal>
      )}
    </div>
  );
}

// ─── DATA EXPLORER COMPONENT ─────────────────────────────────────────────────

function DataExplorer({ lang, T, onQuery }) {
  const [activeTab, setActiveTab] = useState("pisa"); // "pisa" | "spending"
  const [pisaView, setPisaView] = useState("trend");  // "trend" | "gap" | "proficiency" | "ownership" | "score_trend"
  const [pisaDomain, setPisaDomain] = useState("reading");

  const labels = {
    id: {
      title: "Jelajah Data Resmi",
      sub: "Visualisasi langsung dari dataset PISA dan APBN yang telah diverifikasi",
      tabPisa: "PISA Indonesia",
      tabSpending: "Belanja Pendidikan",
      viewTrend: "Tren Nasional",
      viewGap: "Kesenjangan Kota-Desa",
      viewProf: "Tingkat Kemahiran",
      viewOwnership: "Negeri vs Swasta",
      viewScoreTrend: "Tren per Domain",
      domainReading: "Membaca",
      domainMath: "Matematika",
      domainScience: "Sains",
      sourceNote: "Sumber: OECD / Kemendikdasmen",
      spendingSource: "Sumber: Nota Keuangan APBN, Kemenkeu RI",
      spendingNote: "Belanja fungsi pendidikan — Triliun Rp · % Belanja Pemerintah · % PDB",
      projectedLabel: "Proyeksi →",
      l2label: "% mencapai L2+ (kemahiran dasar)",
      l4label: "% mencapai L4+ (kemahiran tinggi)",
      meanLabel: "Skor rata-rata nasional (skala 500)",
      ownershipLabel: "Skor membaca rata-rata berdasarkan kepemilikan sekolah",
      source: "Sumber: PISA Indonesia 2000–2022, Kemendikdasmen / OECD",
    },
    en: {
      title: "Explore Official Data",
      sub: "Direct visualisation from verified PISA and APBN datasets",
      tabPisa: "PISA Indonesia",
      tabSpending: "Education Spending",
      viewTrend: "Proficiency Trend",
      viewGap: "Urban-Rural Gap",
      viewProf: "Domain Proficiency",
      viewOwnership: "Public vs Private",
      viewScoreTrend: "Score Trend",
      domainReading: "Reading",
      domainMath: "Mathematics",
      domainScience: "Science",
      sourceNote: "Source: OECD / Kemendikdasmen",
      spendingSource: "Source: Nota Keuangan APBN, Kemenkeu RI",
      spendingNote: "Education function spending — Trillion IDR · % of Govt Spending · % of GDP",
      projectedLabel: "Projected →",
      l2label: "% reaching L2+ (basic proficiency)",
      l4label: "% reaching L4+ (high proficiency)",
      meanLabel: "National mean score (500-point scale)",
      ownershipLabel: "Mean reading score by school ownership",
      source: "Source: PISA Indonesia 2000–2022, Kemendikdasmen / OECD",
    },
  }[lang];

  // Which views show the domain selector
  const viewsWithDomain = ["trend", "proficiency", "score_trend"];
  const domainColor = { reading: "#0d6efd", math: "#7c3aed", science: "#16a34a" };
  const color = domainColor[pisaDomain];

  // Suggested AI query per view
  const aiQuery = {
    trend: lang === "id" ? "Bagaimana tren tingkat kemahiran PISA Indonesia dari 2000 hingga 2022?" : "What is the trend in PISA proficiency levels in Indonesia from 2000 to 2022?",
    gap: lang === "id" ? "Seberapa besar kesenjangan skor PISA antara siswa perkotaan dan pedesaan di Indonesia?" : "How large is the PISA score gap between urban and rural students in Indonesia?",
    proficiency: lang === "id" ? "Berapa persen siswa Indonesia yang mencapai kemahiran dasar PISA di setiap domain?" : "What percentage of Indonesian students reach PISA basic proficiency across domains?",
    ownership: lang === "id" ? "Bagaimana perbandingan skor PISA antara sekolah negeri dan swasta di Indonesia?" : "How do PISA scores compare between public and private schools in Indonesia?",
    score_trend: lang === "id" ? "Bagaimana tren skor PISA Indonesia dari 2000 hingga 2022?" : "What is the trend of Indonesia PISA scores from 2000 to 2022?",
  };

  const spendingYears = SPENDING_DATA.series;

  return (
    <section style={{ marginBottom: "2.5rem" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "0.2rem" }}>{labels.title}</h2>
          <p style={{ fontSize: "0.77rem", color: T.textSub }}>{labels.sub}</p>
        </div>
        {/* Dataset tabs */}
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {[["pisa", labels.tabPisa, "#0d6efd"], ["spending", labels.tabSpending, "#d97706"]].map(([key, label, color]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              background: activeTab === key ? color : T.surface,
              border: `1px solid ${activeTab === key ? color : T.border}`,
              color: activeTab === key ? "#fff" : T.textSub,
              fontSize: "0.72rem", fontWeight: "700", padding: "0.3rem 0.85rem",
              borderRadius: "6px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", overflow: "hidden", boxShadow: T.shadow }}>
        {activeTab === "pisa" ? (
          <>
            {/* PISA controls */}
            <div style={{ background: T.surfaceAlt, padding: "0.75rem 1.2rem", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {/* View selector */}
              <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                {[
                  ["trend", labels.viewTrend],
                  ["score_trend", labels.viewScoreTrend],
                  ["gap", labels.viewGap],
                  ["proficiency", labels.viewProf],
                  ["ownership", labels.viewOwnership],
                ].map(([k, l]) => (
                  <button key={k} onClick={() => setPisaView(k)} style={{ background: pisaView === k ? T.blueSub : "none", border: `1px solid ${pisaView === k ? T.blue : T.border}`, color: pisaView === k ? T.blue : T.textSub, fontSize: "0.7rem", fontWeight: "600", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
                ))}
              </div>
              {/* Domain selector — shown for trend, proficiency, score_trend views */}
              {viewsWithDomain.includes(pisaView) && (
                <div style={{ display: "flex", gap: "0.25rem", marginLeft: "auto" }}>
                  {[["reading", labels.domainReading, "#0d6efd"], ["math", labels.domainMath, "#7c3aed"], ["science", labels.domainScience, "#16a34a"]].map(([k, l, c]) => (
                    <button key={k} onClick={() => setPisaDomain(k)} style={{ background: pisaDomain === k ? c : "none", border: `1px solid ${pisaDomain === k ? c : T.border}`, color: pisaDomain === k ? "#fff" : T.textSub, fontSize: "0.68rem", fontWeight: "600", padding: "0.2rem 0.6rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "1rem 1.2rem 0.75rem" }}>
              {pisaView === "trend" && (
                <ZoomablePisaView T={T} lang={lang}>
                  <PisaProficiencyView domain={pisaDomain} color={color} labels={labels} T={T} />
                </ZoomablePisaView>
              )}
              {pisaView === "score_trend" && (
                <ZoomablePisaView T={T} lang={lang}>
                  <PisaTrendView domain={pisaDomain} color={color} labels={labels} T={T} />
                </ZoomablePisaView>
              )}
              {pisaView === "gap" && (
                <ZoomablePisaView T={T} lang={lang}>
                  <PisaLocationView labels={labels} T={T} />
                </ZoomablePisaView>
              )}
              {pisaView === "proficiency" && (
                <ZoomablePisaView T={T} lang={lang}>
                  <DeProficiencyChart lang={lang} T={T} />
                </ZoomablePisaView>
              )}
              {pisaView === "ownership" && (
                <ZoomablePisaView T={T} lang={lang}>
                  <PisaOwnershipView labels={labels} T={T} />
                </ZoomablePisaView>
              )}
            </div>

            <div style={{ padding: "0.5rem 1.2rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", borderTop: `1px solid ${T.border}` }}>
              <span style={{ fontSize: "0.66rem", color: T.textMuted }}>{labels.sourceNote} · {PISA_DATA.meta.note}</span>
              <button onClick={() => onQuery(aiQuery[pisaView])}
                style={{ fontSize: "0.68rem", fontWeight: "700", color: T.blue, background: T.blueSub, border: `1px solid ${T.blue}44`, padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit" }}>
                {lang === "id" ? "Analisis dengan AI →" : "Analyse with AI →"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: T.surfaceAlt, padding: "0.75rem 1.2rem", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#d97706" }}>
                {lang === "id" ? "Belanja Fungsi Pendidikan · 2005–2026" : "Education Function Spending · 2005–2026"}
              </span>
              <span style={{ fontSize: "0.67rem", color: T.textMuted }}>{labels.spendingNote}</span>
            </div>
            <div style={{ padding: "1rem 1.2rem 0.75rem" }}>
              <DeSpendingChart T={T} lang={lang} />
            </div>
            <div style={{ padding: "0.5rem 1.2rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", borderTop: `1px solid ${T.border}` }}>
              <span style={{ fontSize: "0.66rem", color: T.textMuted }}>{labels.spendingSource} · {SPENDING_DATA.meta.note}</span>
              <button onClick={() => onQuery(lang === "id" ? "Bagaimana tren belanja pendidikan Indonesia dari 2005 hingga sekarang?" : "What is the trend in Indonesia education spending from 2005 to present?")}
                style={{ fontSize: "0.68rem", fontWeight: "700", color: "#d97706", background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.3)", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit" }}>
                {lang === "id" ? "Analisis dengan AI →" : "Analyse with AI →"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}


// --- HomePage Component ---
export function HomePage({ 
  lang, inputRef, query, setQuery, handleQuery, 
  loading, result, typingDone, setTypingDone, 
  resultRef, setPage, filter, setFilter, dark
}) {
  const S = STRINGS[lang];
  const QUERIES = SUGGESTED_QUERIES[lang];
  const T = getTheme(dark);
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Optional: enable autoplay
    autoplaySpeed: 2000,
  };

  const categories = [...new Set(QUERIES.map(q => q.category))];
  const filteredQueries = filter ? QUERIES.filter(q => q.category === filter) : QUERIES;

  const lastQuery = result?._query || query;
  
  const isSpendingQuery = (() => {
    const q = (lastQuery || "").toLowerCase();
    const isCorr = (q.includes("korelasi") || q.includes("correlation") || q.includes("hubungan")) &&
      (q.includes("pisa") || q.includes("skor") || q.includes("kinerja") || q.includes("performance"));
    if (isCorr) return true;
    return q.includes("spend") || q.includes("belanja") || q.includes("budget") ||
      q.includes("anggaran") || q.includes("apbn") || q.includes("triliun") ||
      q.includes("pengeluaran") || q.includes("pembiayaan") || q.includes("fiskal");
  })();

  const copyAnalysisToClipboard = async () => {
    if (resultRef.current === null) return;
    try {
      const blob = await toBlob(resultRef.current, { quality: 0.95 });
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert(S.shareSuccessful);
      }
    } catch (error) {
      console.error(S.shareError, error);
    }
  };

  return (
    <>
      {/* ── HERO ── */}
          <section style={{ background: "linear-gradient(135deg,#0d6efd 0%,#0284c7 55%,#0369a1 100%)", padding: "3.5rem 1.5rem 3rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-80px", right: "-60px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(6,182,212,0.15)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-60px", left: "30%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: "5px", height: "100%", background: "linear-gradient(180deg,#06b6d4,#0d6efd)" }} />
            <div style={{ maxWidth: "1140px", margin: "0 auto", animation: "fadeUp 0.5s ease both" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px", padding: "0.25rem 0.85rem", marginBottom: "1.25rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite", display: "block" }} />
                <span style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.9)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "700" }}>{S.heroBadge}</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: "800", color: "#fff", lineHeight: 1.2, marginBottom: "0.85rem", letterSpacing: "-0.02em" }}>
                {S.heroTitle}<br /><em style={{ color: "#7dd3fc", fontStyle: "normal" }}>{S.heroTitleEm}</em>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "clamp(0.82rem,1.5vw,0.92rem)", lineHeight: 1.72, maxWidth: "540px", marginBottom: "2rem" }}>{S.heroDesc}</p>
              <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "12px", padding: "4px 4px 4px 18px", maxWidth: "640px", boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
                <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleQuery()} placeholder={S.heroPlaceholder}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: "0.87rem", color: "#0f172a", padding: "0.8rem 0.5rem 0.8rem 0", fontFamily: "inherit", background: "transparent" }} />
                <button onClick={() => handleQuery()} disabled={loading || !query.trim()}
                  style={{ background: loading ? "#94a3b8" : "#0d6efd", color: "#fff", border: "none", borderRadius: "9px", padding: "0.7rem 1.4rem", fontSize: "0.82rem", fontWeight: "700", cursor: loading ? "wait" : "pointer", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                  {loading ? "..." : S.analyzeBtn}
                </button>
              </div>
              {/* Data sources pill link */}
              <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)" }}>{lang === "id" ? "Berbasis:" : "Powered by:"}</span>
                {["PISA","AN","BPS","Dapodik","EMIS","APBN"].map(s => (
                  <span key={s} style={{ fontSize: "0.65rem", fontWeight: "700", color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", padding: "0.1rem 0.5rem", borderRadius: "4px" }}>{s}</span>
                ))}
                <button onClick={() => setPage("sources")} style={{ fontSize: "0.68rem", color: "#7dd3fc", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", padding: 0, textDecoration: "underline" }}>
                  {lang === "id" ? "+ lihat semua sumber →" : "+ view all sources →"}
                </button>
              </div>
            </div>
          </section>

          {/* ── STATS STRIP ── */}
          <div style={{ background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
              {[["514",0],["38",1],["300K+",2],["52M+",3],["3M+",4]].map(([val,i]) => (
                <div key={i} style={{ padding: "1.1rem 2.2rem", borderRight: `1px solid ${T.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: "1.35rem", fontWeight: "800", color: T.text, letterSpacing: "-0.02em" }}>{val}</div>
                  <div style={{ fontSize: "0.62rem", color: T.textMuted, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "2px" }}>{S.statsLabels[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MAIN ── */}
          <main style={{ maxWidth: "1140px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

            {/* Result panel */}
            <div ref={resultRef}>
              {loading && (
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "2.5rem", marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "1rem", boxShadow: T.shadow }}>
                  <div style={{ width: "22px", height: "22px", border: `3px solid ${T.border}`, borderTopColor: T.blue, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                  <span style={{ color: T.textSub, fontSize: "0.9rem" }}>{S.thinking}</span>
                </div>
              )}
              {result && !loading && (
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", marginBottom: "2.5rem", overflow: "hidden", boxShadow: T.shadowHover, animation: "fadeUp 0.4s ease both" }}>
                  <div style={{ background: T.surfaceAlt, padding: "1rem 1.4rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "0.62rem", fontWeight: "700", color: T.blue, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "0.25rem" }}>{S.analysisLabel}</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: "700", color: T.text }}>{result._query || lastQuery}</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <button style={{ background: T.blueSub, border: `1px solid ${T.borderHover}`, color: T.textSub, fontSize: "0.72rem", fontWeight: "600", padding: "0.35rem 0.85rem", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit" }} onClick={copyAnalysisToClipboard}><BsCopy /> {S.share}</button>
                    </div>
                  </div>
                  <div className={styles.resultContent} style={{ gridTemplateColumns: (result.chartType && result.chartType !== "none" && result.chartData?.length > 0) || isSpendingQuery ? (window.innerWidth < 768 ? "1fr" : (["dual_axis","dual","scatter","line_dual"].includes(result.chartType) ? "1fr 1.6fr" : "1fr 1.25fr")) : "1fr" }}>
                    <div style={{ padding: "1.4rem", borderRight: (window.innerWidth >= 768 && ((result.chartType && result.chartType !== "none" && result.chartData?.length > 0) || isSpendingQuery)) ? `1px solid ${T.border}` : "none", borderBottom: (window.innerWidth < 768 && ((result.chartType && result.chartType !== "none" && result.chartData?.length > 0) || isSpendingQuery)) ? `1px solid ${T.border}` : "none" }}>
                      {/* Always-visible headline */}
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: T.text, lineHeight: 1.35, marginBottom: "0.75rem", letterSpacing: "-0.015em" }}>
                        {result.headline
                          ? result.headline
                          : (result.summary || "").match(/[^.!?]+[.!?]*/)?.[0]?.trim() || ""}
                      </h3>
                      {/* Body summary */}
                      {result.summary && !result.headline && (() => {
                        const sentences = result.summary.match(/[^.!?]+[.!?]*/g) || [];
                        return sentences.length > 1 ? (
                          <p style={{ fontSize: "0.875rem", color: T.textSub, lineHeight: 1.75, marginBottom: "1.25rem" }}>
                            {sentences.slice(1).join("").trim()}
                          </p>
                        ) : null;
                      })()}
                      {result.summary && result.headline && (
                        <p style={{ fontSize: "0.875rem", color: T.textSub, lineHeight: 1.75, marginBottom: "1.25rem" }}>
                          {typingDone ? result.summary : <TypingText text={result.summary} onDone={() => setTypingDone(true)} />}
                        </p>
                      )}
                      {result.insights?.length > 0 && (
                        <InsightsList insights={result.insights} lang={lang} T={T} />
                      )}
                      {/* Sources & disclaimer */}
                      {result.insights?.length > 0 && (() => {
                        const ins = result.insights.filter(i => typeof i === "object");
                        const verified = ins.filter(i => i.sourceType === "verified");
                        const web = ins.filter(i => i.sourceType === "web");
                        const hasAny = ins.length > 0 || result.source;
                        if (!hasAny) return null;
                        return (
                          <div style={{ marginTop: "1rem", paddingTop: "0.85rem", borderTop: `1px solid ${T.border}` }}>
                            {/* Source attribution rows */}
                            {verified.length > 0 && (
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem" }}>
                                <span style={{ fontSize: "0.62rem", fontWeight: "700", color: "#15803d", background: "#dcfce7", border: "1px solid #bbf7d0", padding: "0.1rem 0.4rem", borderRadius: "3px", flexShrink: 0, marginTop: "1px" }}>✓ {lang === "id" ? "Terverifikasi" : "Verified"}</span>
                                <span style={{ fontSize: "0.68rem", color: T.textMuted, lineHeight: 1.5 }}>
                                  {[...new Set(verified.map(i => i.sourceLabel))].join(" · ")}
                                </span>
                              </div>
                            )}
                            {web.length > 0 && (
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem" }}>
                                <span style={{ fontSize: "0.62rem", fontWeight: "700", color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", padding: "0.1rem 0.4rem", borderRadius: "3px", flexShrink: 0, marginTop: "1px" }}>🔍 {lang === "id" ? "Sumber Luar" : "External"}</span>
                                <span style={{ fontSize: "0.68rem", color: T.textMuted, lineHeight: 1.5 }}>
                                  {[...new Set(web.map(i => i.sourceLabel))].map((lbl, j) => {
                                    const url = web.find(i => i.sourceLabel === lbl)?.sourceUrl;
                                    return url && url !== "null"
                                      ? <span key={j}>{j > 0 ? " · " : ""}<a href={url} target="_blank" rel="noopener noreferrer" style={{ color: T.blue, textDecoration: "none", fontWeight: "600" }}>{lbl} ↗</a></span>
                                      : <span key={j}>{j > 0 ? " · " : ""}{lbl}</span>;
                                  })}
                                </span>
                              </div>
                            )}
                            {/* AI disclaimer */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", background: dark ? "rgba(13,110,253,0.08)" : "#eff6ff", border: "1px solid rgba(13,110,253,0.25)", borderRadius: "6px", padding: "0.55rem 0.75rem", marginTop: "0.6rem" }}>
                              <span style={{ fontSize: "0.8rem", flexShrink: 0 }}>ℹ️</span>
                              <p style={{ fontSize: "0.66rem", color: dark ? "#93c5fd" : "#1e40af", lineHeight: 1.55, margin: 0 }}>
                                {lang === "id"
                                  ? `Analisis ini menggabungkan: ${verified.length > 0 ? "dataset PISA/APBN terverifikasi yang diunggah ke platform ini (✓)" : ""} ${web.length > 0 ? `dan hasil pencarian web langsung dari sumber terpercaya (🔍). Klik "Lihat Sumber" pada setiap temuan untuk memverifikasi data secara mandiri.` : ""}`
                                  : `This analysis combines: ${verified.length > 0 ? "verified PISA/APBN datasets uploaded to this platform (✓)" : ""} ${web.length > 0 ? `and live web search results from credible sources (🔍). Click "View Source" on each finding to independently verify the data.` : ""}`}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {(result.chartType && result.chartType !== "none" && result.chartData && result.chartData.length > 0) || isSpendingQuery ? (
                      <ResultChartPanel result={result} lastQuery={lastQuery} lang={lang} T={T} dark={dark} />
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* ── DATA EXPLORER ── */}
            <DataExplorer lang={lang} T={T} onQuery={(q) => { setQuery(q); handleQuery(q); }} />

            {/* Popular analyses */}
            <section>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "0.2rem" }}>{S.popularAnalyses}</h2>
                  <p style={{ fontSize: "0.77rem", color: T.textSub }}>{S.popularSub}</p>
                </div>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  <button onClick={() => setFilter(null)} style={{ background: !filter ? T.blue : T.surface, border: `1px solid ${!filter ? T.blue : T.border}`, color: !filter ? "#fff" : T.textSub, fontSize: "0.71rem", fontWeight: "600", padding: "0.28rem 0.75rem", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{S.filterAll}</button>
                  {categories.map(f => (
                    <button key={f} onClick={() => setFilter(f === filter ? null : f)} style={{ background: filter === f ? T.blue : T.surface, border: `1px solid ${filter === f ? T.blue : T.border}`, color: filter === f ? "#fff" : T.textSub, fontSize: "0.71rem", fontWeight: "600", padding: "0.28rem 0.75rem", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(262px,1fr))", gap: "0.85rem" }}>
                {filteredQueries.map((sq, i) => (
                  <button key={i} onClick={() => { setQuery(sq.query); handleQuery(sq.query); }}
                    style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "1.1rem 1.15rem", textAlign: "left", cursor: "pointer", transition: "all 0.16s", color: T.text, boxShadow: T.shadow, display: "flex", gap: "0.85rem", alignItems: "flex-start" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.boxShadow = T.shadowHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = T.shadow; e.currentTarget.style.transform = "translateY(0)"; }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: T.blueSub, border: `1px solid ${T.borderHover}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{sq.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ marginBottom: "0.3rem", display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: "0.59rem", fontWeight: "700", color: T.blue, textTransform: "uppercase", letterSpacing: "0.07em", background: T.blueSub, padding: "0.13rem 0.45rem", borderRadius: "4px" }}>{sq.category}</span>
                        {sq.dataSource === "verified"
                          ? <span style={{ fontSize: "0.58rem", fontWeight: "700", color: "#16a34a", background: "#dcfce7", border: "1px solid #bbf7d0", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>✓ {lang === "id" ? "Data Terverifikasi" : "Verified Data"}</span>
                          : <span style={{ fontSize: "0.58rem", fontWeight: "700", color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>🔍 {lang === "id" ? "Berbasis Web Search" : "Web Search"}</span>
                        }
                      </div>
                      <p style={{ fontSize: "0.84rem", fontWeight: "700", color: T.text, marginBottom: "0.3rem", lineHeight: 1.3 }}>{sq.title}</p>
                      <p style={{ fontSize: "0.71rem", color: T.textSub, lineHeight: 1.55, margin: 0 }}>{sq.query}</p>
                      {sq.dataSource === "webSearch" && (
                        <p style={{ fontSize: "0.63rem", color: T.textMuted, marginTop: "0.4rem", fontStyle: "italic" }}>
                          {lang === "id" ? "Menggunakan pencarian web + sumber prioritas terpercaya." : "Uses live web search from priority credible sources."}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* TESTIMONIES */}
            <section style={{ marginTop: "3rem" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "1.1rem" }}>{S.testimonials}</h2>
              <div style={{ maxWidth: 600, margin: 'auto' }}>
                <Slider {...settings}>
                  {TESTIMONIES.map((item, i) => (
                    <div key={i} className={styles.testimonial}>
                      <figure>
                        <blockquote><p>"{item.testimony}"</p></blockquote>
                        <figcaption>
                          — <span className={styles.testimonialAuthor}>{item.author}</span>, <cite className={styles.testimonialCompany}>{item.company}</cite>
                        </figcaption>
                      </figure>
                    </div>
                  ))}
                </Slider>
              </div>
            </section>

            {/* Why use this portal */}
            <section style={{ marginTop: "3rem" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: "800", color: T.text, marginBottom: "1.1rem" }}>{S.whyTitle}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "0.85rem" }}>
                {S.whyCards.map(c => (
                  <div key={c.title} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "1.1rem 1.15rem", boxShadow: T.shadow }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", marginBottom: "0.7rem" }}>{c.icon}</div>
                    <p style={{ fontSize: "0.85rem", fontWeight: "700", color: T.text, marginBottom: "0.35rem" }}>{c.title}</p>
                    <p style={{ fontSize: "0.74rem", color: T.textSub, lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
    </>
  );
}
