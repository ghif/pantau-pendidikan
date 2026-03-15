import styles from "../../styles/Charts.module.css";

export function BarChart({ data, unit, highlight }) {
  const max = Math.max(...data.map(d => d.value));
  const colors = highlight === "high" 
    ? ["#0d6efd", "#1a7fff", "#2a8fff", "#4aa3ff", "#6ab8ff"] 
    : highlight === "low" 
      ? ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fecaca"] 
      : ["#0d6efd", "#06b6d4", "#3b82f6", "#0891b2", "#38bdf8"];

  return (
    <div>
      <p className={styles.unitLabel}>{unit}</p>
      {data.map((d, i) => (
        <div key={i} className={styles.barRow}>
          <span className={styles.barLabel}>{d.label}</span>
          <div className={styles.barTrack}>
            <div className={styles.barFill} 
              style={{ 
                width: `${(d.value / max) * 100}%`, 
                background: colors[i]
              }}>
              <span className={styles.barValue}>{d.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data, unit }) {
  const W = 480, H = 140, pad = 32;
  const vals = data.map(d => d.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pts = data.map((d, i) => ({ 
    x: pad + (i / (data.length - 1)) * (W - pad * 2), 
    y: pad + (1 - (d.value - min) / (max - min)) * (H - pad * 2), 
    ...d 
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const fill = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  
  return (
    <div>
      <p className={styles.unitLabel}>{unit}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svgChart}>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0d6efd" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#lg)" />
        <path d={path} fill="none" stroke="#0d6efd" strokeWidth="2.5" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="#0d6efd" />
            <text x={p.x} y={p.y - 11} textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="700" fontFamily="sans-serif">{p.value}</text>
            <text x={p.x} y={H - 5} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="sans-serif">{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function ComparisonChart({ data, unit }) {
  const colors = { female: "#0d6efd", male: "#06b6d4" };
  const max = Math.max(...data.flatMap(d => [d.female, d.male]));
  
  return (
    <div>
      <p className={styles.unitLabel}>{unit}</p>
      <div className={styles.legend}>
        {[["female", "Perempuan / Female", colors.female], ["male", "Laki-laki / Male", colors.male]].map(([k, l, c]) => (
          <span key={k} className={styles.legendItem}>
            <span className={styles.legendColor} style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>
      {data.map((d, i) => (
        <div key={i} className={styles.barRow}>
          <span className={styles.comparisonLabel}>{d.label}</span>
          <div className={styles.comparisonBarContainer}>
            {[["female", colors.female, d.female], ["male", colors.male, d.male]].map(([k, c, v]) => (
              <div key={k} className={styles.comparisonTrack}>
                <div className={styles.comparisonFill} 
                  style={{ 
                    width: `${(v / max) * 100}%`, 
                    background: c
                  }}>
                  <span className={styles.comparisonValue}>{v}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
