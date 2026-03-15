import { getTheme } from "../../utils/theme";
export function BarChart({ data, unit, highlight, T }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value));
  const palette = highlight === "high"
    ? ["#0d6efd","#1a7fff","#3b8fff","#5aa3ff","#79b8ff","#98ccff","#b7e0ff","#d6f4ff","#e8f8ff","#f0fbff","#f8fdff","#ffffff"]
    : highlight === "low"
    ? ["#dc2626","#ef4444","#f87171","#fca5a5","#fecaca","#fee2e2","#fef2f2","#fff5f5","#fff8f8","#fffafa","#fffdfd","#ffffff"]
    : ["#0d6efd","#06b6d4","#7c3aed","#d97706","#16a34a","#dc2626","#0891b2","#9333ea","#ea580c","#15803d","#b91c1c","#0369a1"];
  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.9rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const color = palette[i % palette.length];
        const showInside = pct > 20;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.55rem" }}>
            <span style={{ width: "130px", fontSize: "0.74rem", color: T.textSub, textAlign: "right", flexShrink: 0, lineHeight: 1.3 }}>{d.label}</span>
            <div style={{ flex: 1, background: T.trackBg, borderRadius: "4px", overflow: "hidden", height: "28px", position: "relative" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: showInside ? "8px" : "0", transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)", minWidth: "4px" }}>
                {showInside && <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#fff", whiteSpace: "nowrap" }}>{d.value}</span>}
              </div>
              {!showInside && <span style={{ position: "absolute", left: `calc(${pct}% + 6px)`, top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", fontWeight: "700", color: T.text, whiteSpace: "nowrap" }}>{d.value}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LineChart({ data, unit, T }) {
  if (!data || data.length < 2) return null;
  const W = 480, H = 180, padL = 44, padR = 16, padT = 20, padB = 30;
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const sx = i => padL + (i / (data.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / range) * (H - padT - padB);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.value)}`).join(" ");
  const fill = `${path} L${sx(data.length - 1)},${H - padB} L${sx(0)},${H - padB} Z`;
  // Smart grid: 4 evenly spaced Y values
  const gridStep = Math.pow(10, Math.floor(Math.log10(range / 4)));
  const grids = [];
  for (let v = Math.ceil(minV / gridStep) * gridStep; v <= maxV; v += gridStep) grids.push(v);
  const displayGrids = grids.filter((_, i) => i % Math.ceil(grids.length / 5) === 0).slice(0, 5);
  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        <defs>
          <linearGradient id="lcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0d6efd" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {displayGrids.map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 5} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}</text>
          </g>
        ))}
        <path d={fill} fill="url(#lcGrad)" />
        <path d={path} fill="none" stroke="#0d6efd" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={sx(i)} cy={sy(d.value)} r={4} fill="#0d6efd" stroke={T.surface} strokeWidth="2" />
            <text x={sx(i)} y={sy(d.value) - 10} textAnchor="middle" fill={T.text} fontSize="9.5" fontWeight="700" fontFamily="sans-serif">{d.value}</text>
            <text x={sx(i)} y={H - padB + 14} textAnchor="middle" fill={T.textMuted} fontSize="9" fontFamily="sans-serif">{d.label}</text>
          </g>
        ))}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Scatter / dual-axis chart for correlation questions
// chartData format: [{ label: "2022", x: spending_T, y: pisa_score }]
// OR dual series: [{ label: "2005", spending: 25.99, pisa: 380 }]
export function ScatterChart({ data, unit, T }) {
  if (!data || data.length === 0) return null;

  // Support both {x,y} and {spending,pisa} schemas
  const pts = data.map(d => ({
    label: d.label,
    x: d.x ?? d.spending ?? d.value ?? 0,
    y: d.y ?? d.pisa ?? d.score ?? 0,
  })).filter(d => d.x && d.y);

  if (pts.length === 0) return null;

  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const minX = Math.min(...xs) * 0.9, maxX = Math.max(...xs) * 1.08;
  const minY = Math.min(...ys) - 15, maxY = Math.max(...ys) + 15;
  const W = 420, H = 200, padL = 44, padR = 20, padT = 16, padB = 36;

  const sx = x => padL + ((x - minX) / (maxX - minX)) * (W - padL - padR);
  const sy = y => padT + (1 - (y - minY) / (maxY - minY)) * (H - padT - padB);

  // Simple linear regression for trendline
  const n = pts.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const slope = pts.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0) /
                pts.reduce((s, p) => s + (p.x - meanX) ** 2, 0);
  const intercept = meanY - slope * meanX;
  const trendX1 = minX, trendX2 = maxX;
  const trendY1 = slope * trendX1 + intercept;
  const trendY2 = slope * trendX2 + intercept;

  // Y gridlines
  const yGridStep = Math.round((maxY - minY) / 4 / 5) * 5 || 10;
  const yGrids = [];
  for (let v = Math.ceil(minY / yGridStep) * yGridStep; v <= maxY; v += yGridStep) yGrids.push(v);

  const [unitLeft, unitRight] = unit ? unit.split("/").map(s => s.trim()) : ["Spending (T)", "PISA score"];

  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        {/* Grid */}
        {yGrids.map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}</text>
          </g>
        ))}
        {/* X axis labels */}
        {pts.filter((_, i) => i % Math.ceil(pts.length / 5) === 0 || i === pts.length - 1).map((p, i) => (
          <text key={i} x={sx(p.x)} y={H - padB + 13} textAnchor="middle" fontSize="8.5" fill={T.textMuted} fontFamily="sans-serif">{p.x}T</text>
        ))}
        {/* Axes */}
        <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke={T.border} strokeWidth="1" />
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
        {/* Trendline */}
        <line
          x1={sx(trendX1)} y1={sy(Math.max(minY, Math.min(maxY, trendY1)))}
          x2={sx(trendX2)} y2={sy(Math.max(minY, Math.min(maxY, trendY2)))}
          stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7"
        />
        {/* Points */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill="#0d6efd" opacity="0.85" />
            <text x={sx(p.x)} y={sy(p.y) - 8} textAnchor="middle" fontSize="8.5" fill={T.textSub} fontFamily="sans-serif">{p.label}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem" }}>
        {[["#0d6efd", "●", "Data point"], ["#06b6d4", "╌", "Trendline"]].map(([c, sym, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", color: T.textSub }}>
            <span style={{ color: c }}>{sym}</span>{l}
          </span>
        ))}
      </div>
    </div>
  );
}

// Dual-axis line chart for showing two series with different scales
// chartData: [{ label: "2005", spending: 25.99, pisa: 380 }]
export function DualAxisChart({ data, unit, T, size }) {
  if (!data || data.length === 0) return null;

  const pts = data.map(d => ({
    label: d.label,
    a: d.spending ?? d.budget ?? d.x ?? d.value ?? 0,
    b: d.pisa ?? d.score ?? d.y ?? d.reading ?? 0,
  })).filter(d => d.a > 0 && d.b > 0);

  if (pts.length < 2) return null;

  const as = pts.map(p => p.a), bs = pts.map(p => p.b);
  const minA = Math.min(...as) * 0.85, maxA = Math.max(...as) * 1.12;
  const minB = Math.min(...bs) - 15,   maxB = Math.max(...bs) + 15;

  const isLarge = size === "large";
  const W = isLarge ? 680 : 440;
  const H = isLarge ? 280 : 200;
  const padL = isLarge ? 56 : 48;
  const padR = isLarge ? 56 : 48;
  const padT = isLarge ? 16 : 14;
  const padB = isLarge ? 36 : 28;
  const ptR  = isLarge ? 6 : 5;
  const fTick = isLarge ? "10.5" : "8.5";
  const fVal  = isLarge ? "10" : "8";
  const fX    = isLarge ? "11" : "9";

  const sx  = i => padL + (i / (pts.length - 1)) * (W - padL - padR);
  const syA = v => padT + (1 - (v - minA) / (maxA - minA)) * (H - padT - padB);
  const syB = v => padT + (1 - (v - minB) / (maxB - minB)) * (H - padT - padB);

  const pathA = pts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(i)},${syA(p.a)}`).join(" ");
  const pathB = pts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(i)},${syB(p.b)}`).join(" ");

  const gridCount = 4;
  const aGrids = Array.from({ length: gridCount + 1 }, (_, i) => minA + (i / gridCount) * (maxA - minA));
  const bGrids = Array.from({ length: gridCount + 1 }, (_, i) => minB + (i / gridCount) * (maxB - minB));

  // Parse axis labels from unit string (format: "LabelA / LabelB") or use defaults
  const parts = unit ? unit.split("/").map(s => s.trim()) : [];
  const labelA = parts[0] || "Belanja Pendidikan";
  const labelB = parts[1] || "Skor PISA";
  const unitA  = "Triliun Rp";
  const unitB  = "Poin (skala 500)";

  return (
    <div>
      {/* Axis label pills — rendered as HTML above the chart for crisp legibility */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ width: "14px", height: "3px", background: "#d97706", borderRadius: "2px", display: "block", flexShrink: 0 }} />
          <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#d97706" }}>{labelA}</span>
          <span style={{ fontSize: "0.65rem", color: T.textMuted, background: T.trackBg, padding: "0.05rem 0.4rem", borderRadius: "4px", border: `1px solid ${T.border}` }}>{unitA}</span>
          <span style={{ fontSize: "0.65rem", color: "#d97706", fontWeight: "600" }}>← Kiri</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.65rem", color: "#0d6efd", fontWeight: "600" }}>Kanan →</span>
          <span style={{ fontSize: "0.65rem", color: T.textMuted, background: T.trackBg, padding: "0.05rem 0.4rem", borderRadius: "4px", border: `1px solid ${T.border}` }}>{unitB}</span>
          <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#0d6efd" }}>{labelB}</span>
          <span style={{ width: "14px", height: "3px", background: "#0d6efd", borderRadius: "2px", display: "block", flexShrink: 0 }} />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: `${W}px`, height: H, overflow: "visible", display: "block" }}>

          {/* Gridlines */}
          {aGrids.map((v, i) => (
            <line key={i} x1={padL} x2={W - padR} y1={syA(v)} y2={syA(v)}
              stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
          ))}

          {/* Left Y axis ticks — spending (amber) */}
          {aGrids.map((v, i) => (
            <text key={i} x={padL - 6} y={syA(v) + 3.5}
              textAnchor="end" fontSize={fTick} fill="#d97706" fontFamily="sans-serif" fontWeight="500">
              {v >= 1000 ? `${(v/1000).toFixed(1)}K` : v >= 100 ? `${Math.round(v)}T` : `${v.toFixed(0)}T`}
            </text>
          ))}

          {/* Right Y axis ticks — PISA (blue) */}
          {bGrids.map((v, i) => (
            <text key={i} x={W - padR + 6} y={syB(v) + 3.5}
              textAnchor="start" fontSize={fTick} fill="#0d6efd" fontFamily="sans-serif" fontWeight="500">
              {Math.round(v)}
            </text>
          ))}

          {/* Area fills */}
          <path d={pathA + ` L${sx(pts.length-1)},${H-padB} L${sx(0)},${H-padB} Z`} fill="#d97706" fillOpacity="0.07" />
          <path d={pathB + ` L${sx(pts.length-1)},${H-padB} L${sx(0)},${H-padB} Z`} fill="#0d6efd" fillOpacity="0.07" />

          {/* Lines */}
          <path d={pathA} fill="none" stroke="#d97706" strokeWidth={isLarge ? "2.8" : "2.5"} strokeLinejoin="round" strokeLinecap="round" />
          <path d={pathB} fill="none" stroke="#0d6efd" strokeWidth={isLarge ? "2.8" : "2.5"} strokeLinejoin="round" strokeLinecap="round" />

          {/* Data points + value labels (staggered above/below) */}
          {pts.map((p, i) => {
            const x = sx(i);
            const aAbove = i % 2 === 0;
            const bAbove = i % 2 === 1;
            const aValY = aAbove ? syA(p.a) - (ptR + 5) : syA(p.a) + (ptR + 12);
            const bValY = bAbove ? syB(p.b) - (ptR + 5) : syB(p.b) + (ptR + 12);
            const anchor = i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle";
            return (
              <g key={i}>
                <circle cx={x} cy={syA(p.a)} r={ptR} fill="#d97706" stroke={T.surface} strokeWidth="2" />
                <text x={x} y={aValY} textAnchor={anchor} fontSize={fVal} fontWeight="700" fill="#d97706" fontFamily="sans-serif">
                  {p.a >= 100 ? `${Math.round(p.a)}T` : `${p.a.toFixed(1)}T`}
                </text>
                <circle cx={x} cy={syB(p.b)} r={ptR} fill="#0d6efd" stroke={T.surface} strokeWidth="2" />
                <text x={x} y={bValY} textAnchor={anchor} fontSize={fVal} fontWeight="700" fill="#0d6efd" fontFamily="sans-serif">
                  {Math.round(p.b)}
                </text>
                <text x={x} y={H - padB + 14} textAnchor="middle" fontSize={fX} fill={T.text} fontWeight="600" fontFamily="sans-serif">
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1.5" />
          <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1={W - padR} x2={W - padR} y1={padT} y2={H - padB} stroke="#0d6efd" strokeWidth="1.5" strokeOpacity="0.5" />
        </svg>
      </div>

      {/* Bottom unit annotation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.62rem", color: "#d97706" }}>
          ◀ Sumbu kiri: {labelA} ({unitA})
        </span>
        <span style={{ fontSize: "0.62rem", color: "#0d6efd" }}>
          Sumbu kanan: {labelB} ({unitB}) ▶
        </span>
      </div>
    </div>
  );
}

export function ComparisonChart({ data, unit, T }) {
  const colors = { female: "#0d6efd", male: "#06b6d4" };
  const max = Math.max(...data.flatMap(d => [d.female, d.male]));
  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.75rem" }}>
        {[["female", "Perempuan / Female", colors.female], ["male", "Laki-laki / Male", colors.male]].map(([k, l, c]) => (
          <span key={k} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.74rem", color: T.textSub }}><span style={{ width: "10px", height: "10px", borderRadius: "2px", background: c, display: "block" }} />{l}</span>
        ))}
      </div>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.55rem" }}>
          <span style={{ width: "90px", fontSize: "0.76rem", color: T.textSub, textAlign: "right", flexShrink: 0 }}>{d.label}</span>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
            {[["female", colors.female, d.female], ["male", colors.male, d.male]].map(([k, c, v]) => (
              <div key={k} style={{ flex: 1, background: T.trackBg, borderRadius: "4px", height: "24px", overflow: "hidden" }}>
                <div style={{ width: `${(v / max) * 100}%`, height: "100%", background: c, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "6px" }}>
                  <span style={{ fontSize: "0.66rem", fontWeight: "700", color: "#fff" }}>{v}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
