import { SUGGESTED_QUERIES as QUERIES_DATA } from "../data/queries";
import { STRINGS as STRINGS_DATA } from "../data/strings";
import { BarChart, LineChart, ComparisonChart } from "../components/Charts";
import { TypingText } from "../components/TypingText";
import styles from "../styles/HomePage.module.css";

export function HomePage({ 
  lang, inputRef, query, setQuery, handleQuery, 
  loading, result, typingDone, setTypingDone, 
  resultRef, setPage, filter, setFilter
}) {
  const S = STRINGS_DATA[lang];
  const QUERIES = QUERIES_DATA[lang];

  const categories = [...new Set(QUERIES.map(q => q.category))];
  const filteredQueries = filter ? QUERIES.filter(q => q.category === filter) : QUERIES;

  return (
    <>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBgCircle1} />
        <div className={styles.heroBgCircle2} />
        <div className={styles.heroBgStrip} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            <span className={styles.heroBadgeText}>{S.heroBadge}</span>
          </div>
          <h1 className={styles.heroTitle}>
            {S.heroTitle}<br /><em className={styles.heroTitleHighlight}>{S.heroTitleEm}</em>
          </h1>
          <p className={styles.heroDesc}>{S.heroDesc}</p>
          <div className={styles.searchBox}>
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleQuery()} placeholder={S.heroPlaceholder}
              className={styles.searchInput} />
            <button onClick={() => handleQuery()} disabled={loading || !query.trim()}
              className={styles.searchButton}>
              {loading ? "..." : S.analyzeBtn}
            </button>
          </div>
          <div className={styles.heroFootnote}>
            <span className={styles.footnoteLabel}>{lang === "id" ? "Berbasis:" : "Powered by:"}</span>
            {["PISA","AN","BPS","Dapodik","EMIS","APBN"].map(s => (
              <span key={s} className={styles.footnoteTag}>{s}</span>
            ))}
            <button onClick={() => setPage("sources")} className={styles.footnoteLink}>
              {lang === "id" ? "+ lihat semua sumber →" : "+ view all sources →"}
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className={styles.statsStrip}>
        <div className={styles.statsContainer}>
          {[["514",0],["38",1],["300K+",2],["52M+",3],["3M+",4]].map(([val,i]) => (
            <div key={i} className={styles.statsItem}>
              <div className={styles.statsValue}>{val}</div>
              <div className={styles.statsLabel}>{S.statsLabels[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        {/* Result panel */}
        <div ref={resultRef}>
          {loading && (
            <div className={styles.loadingPanel}>
              <div className={styles.spinner} />
              <span style={{ color: "var(--text-sub)", fontSize: "0.9rem" }}>{S.thinking}</span>
            </div>
          )}
          {result && !loading && (
            <div className={styles.resultPanel}>
              <div className={styles.resultHeader}>
                <div>
                  <div className={styles.analysisTitle}>{S.analysisLabel}</div>
                  <div className={styles.analysisQuery}>{query}</div>
                </div>
                <div className={styles.resultActions}>
                  {/* for the time being, sharing the result is good enough */}
                  {/* CSV download will be implemented soon after */}
                  {/*<button className={styles.actionBtn}>{S.downloadCSV}</button>*/}
                  <button className={styles.actionBtn}>{S.share}</button>
                </div>
              </div>
              <div className={styles.resultContent}>
                <div className={styles.resultTextColumn}>
                  <div className={styles.summaryTitle}>{ result.title }</div>
                  <p className={styles.summaryText}>
                    {typingDone ? result.summary : <TypingText text={result.summary || ""} onDone={() => setTypingDone(true)} />}
                  </p>
                </div>
              </div>
              <div className={styles.resultContent} style={{ gridTemplateColumns: result.chartType !== "none" ? "1fr 1.25fr" : "1fr" }}>
                <div className={styles.resultTextColumn} style={{ borderRight: result.chartType !== "none" ? "1px solid var(--border)" : "none" }}>
                  {result.insights?.length > 0 && <>
                    <p className={styles.keyFindingsLabel}>{S.keyFindings}</p>
                    {result.insights.map((ins, i) => (
                      <div key={i} className={styles.insightItem} style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
                        <span className={styles.insightDot} />
                        <span className={styles.insightText}>
                          {ins.finding} <a href={ins.source}>{S.dataSource}</a>
                        </span>
                      </div>
                    ))}
                  </>}
                </div>
                {result.chartType !== "none" && result.chartData && (
                  <div className={styles.chartColumn}>
                    {result.chartType === "bar" && <BarChart data={result.chartData} unit={result.chartTitle} highlight={result.highlight} />}
                    {result.chartType === "line" && <LineChart data={result.chartData} unit={result.chartTitle} />}
                    {result.chartType === "comparison" && <ComparisonChart data={result.chartData} unit={result.chartTitle} />}
                    {result.chartSource && (
                      <div className={styles.sourceInfo}>
                        <span className={styles.sourceLabel}>{S.dataSource}: </span><a href={result.chartSource}>{result.chartSource}</a>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            </div>
          )}
        </div>

        {/* Popular analyses */}
        <section>
          <div className={styles.popularHeader}>
            <div>
              <h2 className={styles.popularTitle}>{S.popularAnalyses}</h2>
              <p className={styles.popularSub}>{S.popularSub}</p>
            </div>
            <div className={styles.filterBar}>
              <button onClick={() => setFilter(null)} className={`${styles.filterBtn} ${!filter ? styles.filterBtnActive : ""}`}>{S.filterAll}</button>
              {categories.map(f => (
                <button key={f} onClick={() => setFilter(f === filter ? null : f)} className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className={styles.queryGrid}>
            {filteredQueries.map((sq, i) => (
              <button key={i} onClick={() => { setQuery(sq.query); handleQuery(sq.query); }}
                className={styles.queryCard}>
                <div className={styles.queryIcon}>{sq.icon}</div>
                <div className={styles.queryContent}>
                  <div style={{ marginBottom: "0.3rem" }}>
                    <span className={styles.queryCategory}>{sq.category}</span>
                  </div>
                  <p className={styles.queryTitle}>{sq.title}</p>
                  <p className={styles.queryText}>{sq.query}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Why use this portal */}
        <section className={styles.whySection}>
          <h2 className={styles.whyTitle}>{S.whyTitle}</h2>
          <div className={styles.whyGrid}>
            {S.whyCards.map(c => (
              <div key={c.title} className={styles.whyCard}>
                <div className={styles.whyIcon} style={{ background: c.bg }}>{c.icon}</div>
                <p className={styles.whyCardTitle}>{c.title}</p>
                <p className={styles.whyCardDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
