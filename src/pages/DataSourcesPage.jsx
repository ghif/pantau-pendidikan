import { useState } from "react";
import { DATA_SOURCES, CATEGORY_META } from "../data/sources";
import { STRINGS } from "../data/strings";
import { SourceLogo } from "../components/SourceLogo";
import styles from "../styles/DataSourcesPage.module.css";

export function DataSourcesPage({ lang }) {
  const S = STRINGS[lang];
  const [activeFilter, setActiveFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const categories = ["all", "tests", "admin", "legal", "reports"];
  const filtered = activeFilter === "all" 
    ? DATA_SOURCES 
    : DATA_SOURCES.filter(s => s.category === activeFilter);

  const catLabel = (cat) => {
    if (cat === "all") return S.filterAllLabel;
    const catData = CATEGORY_META[cat];
    return typeof catData.label === "string" ? catData.label : catData.label[lang];
  };

  const txt = (v) => typeof v === "string" ? v : (v[lang] || v.id);

  return (
    <div className={styles.pageContainer}>
      {/* Page Hero */}
      <section className={styles.pageHero}>
        <div className={styles.heroBar} />
        <div className={styles.heroCircle} />
        <div className={styles.container}>
          <div className={styles.badge}>
            <span className={styles.badgeText}>
              {S.sourcesCount.replace("{count}", DATA_SOURCES.length)}
            </span>
          </div>
          <h1 className={styles.title}>
            {S.sourcesTitle} <span className={styles.titleEm}>—</span><br />{S.sourcesTitleEm}
          </h1>
          <p className={styles.desc}>{S.sourcesDesc}</p>
        </div>
      </section>

      <div className={styles.pageContent}>
        {/* Category filter tabs */}
        <div className={styles.filterTabs}>
          {categories.map(cat => {
            const active = activeFilter === cat;
            const meta = cat !== "all" ? CATEGORY_META[cat] : null;
            return (
              <button key={cat} onClick={() => setActiveFilter(cat)} 
                className={styles.filterTab}
                style={{
                  background: active ? (meta?.color || "var(--blue)") : "var(--surface)",
                  borderColor: active ? (meta?.color || "var(--blue)") : "var(--border)",
                  color: active ? "#fff" : "var(--text-sub)",
                }}>
                {meta && <span>{meta.icon}</span>}
                {catLabel(cat)}
                <span className={active ? styles.filterTabActiveCount : styles.filterTabCount}>
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
            <div key={cat} className={styles.categorySection}>
              {/* Category header */}
              <div className={styles.categoryHeader} style={{ borderColor: `${meta.color}22` }}>
                <div className={styles.categoryIcon} style={{ background: `${meta.color}18`, borderColor: `${meta.color}44` }}>{meta.icon}</div>
                <div>
                  <h2 className={styles.categoryTitle}>{txt(meta.label)}</h2>
                  <p className={styles.categoryDesc}>{meta.desc[lang]}</p>
                </div>
              </div>

              {/* Source cards */}
              <div className={styles.sourceGrid}>
                {sources.map(source => {
                  const isExpanded = expanded === source.id;
                  return (
                    <div key={source.id} 
                      className={`${styles.sourceCard} ${isExpanded ? styles.sourceCardExpanded : ""}`}
                      style={{ 
                        borderColor: isExpanded ? source.accentColor + "66" : "var(--border)",
                        boxShadow: isExpanded ? `0 4px 20px ${source.accentColor}22` : "var(--shadow)"
                      }} 
                      onClick={() => setExpanded(isExpanded ? null : source.id)}>

                      {/* Top accent bar */}
                      <div className={styles.cardAccent} style={{ background: `linear-gradient(90deg, ${source.accentColor}, ${source.accentColor}88)` }} />

                      {/* Card header */}
                      <div className={styles.cardHeader}>
                        <SourceLogo source={source} size={52} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={styles.cardTitleRow}>
                            <div>
                              <span className={styles.sourceName}>{txt(source.name)}</span>
                              <span className={styles.sourceBadge} style={{ background: `${source.badgeColor}18`, color: source.badgeColor, borderColor: `${source.badgeColor}44` }}>
                                {txt(source.badge)}
                              </span>
                            </div>
                            <span className={`${styles.expandIcon} ${isExpanded ? styles.expandIconActive : ""}`}>▾</span>
                          </div>
                          <p className={styles.sourceFullName}>{txt(source.fullName)}</p>
                          <p className={styles.sourceOrg} style={{ color: source.accentColor }}>{source.org}</p>
                        </div>
                      </div>

                      {/* Meta strip */}
                      <div className={styles.metaStrip}>
                        {[
                          [S.frequency, txt(source.freq)],
                          [S.lastUpdated, source.lastUpdate],
                          [S.coverage, txt(source.coverage)],
                        ].map(([label, val]) => (
                          <div key={label} className={styles.metaItem}>
                            <div className={styles.metaLabel}>{label}</div>
                            <div className={styles.metaValue}>{val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Expandable detail */}
                      {isExpanded && (
                        <div className={styles.expandedDetail}>
                          <p className={styles.sourceDetailText}>{source.description[lang]}</p>
                          
                          <div className={styles.dataPointsSection}>
                            <p className={styles.dataPointsLabel}>{S.dataPoints}</p>
                            <div className={styles.metricsCloud}>
                              {source.metrics.map(m => (
                                <span key={m} className={styles.metricTag} style={{ color: source.accentColor, background: `${source.accentColor}12`, borderColor: `${source.accentColor}30` }}>{m}</span>
                              ))}
                            </div>
                          </div>

                          <a href={source.url} target="_blank" rel="noopener noreferrer" 
                            className={styles.sourceLink}
                            style={{ color: source.accentColor, background: `${source.accentColor}12`, borderColor: `${source.accentColor}44` }}
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
        <div className={styles.integrityBox}>
          <div className={styles.integrityHeader}>
            <div className={styles.integrityIcon}>🔒</div>
            <div className={styles.integrityContent}>
              <h3 className={styles.integrityTitle}>{S.integrityTitle}</h3>
              <p className={styles.integrityDesc}>{S.integrityDesc}</p>
              <div className={styles.integrityGrid}>
                {S.integrityPoints.map((pt, i) => (
                  <div key={i} className={styles.integrityPoint}>
                    <span className={styles.checkIcon}>✓</span>
                    <span className={styles.integrityText}>{pt}</span>
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
