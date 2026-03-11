import { STRINGS } from "../data/strings";
import styles from "../styles/Footer.module.css";

export function Footer({ lang, dark, toggleLang, setDark }) {
  const S = STRINGS[lang];
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.colBrand}>
            <div className={styles.logoRow}>
              <div className={styles.logoIcon}>📚</div>
              <span className={styles.brandName}>Pantau Pendidikan</span>
            </div>
            <p className={styles.description}>{S.footerDesc}</p>
          </div>
          <div className={styles.colLinks}>
            <p className={styles.colTitle}>{S.footerNav}</p>
            {S.footerNavLinks.map(l => (
              <p key={l} className={styles.linkItem}>
                <a href="#" className={styles.link}>{l}</a>
              </p>
            ))}
          </div>
          <div className={styles.colSources}>
            <p className={styles.colTitle}>{S.footerSources}</p>
            <div className={styles.tagCloud}>
              {["Kemendikdasmen","BPS","KPAI","PISA/OECD","Dapodik","EMIS","APBN","Bappenas"].map(src => (
                <span key={src} className={styles.tag}>{src}</span>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.bottomRow}>
          <p className={styles.copyright}>{S.copyright}</p>
          <div className={styles.actions}>
            <button onClick={toggleLang} className={styles.footerBtn}>
              {lang === "id" ? "🇬🇧 English" : "🇮🇩 Bahasa"}
            </button>
            <button onClick={() => setDark(!dark)} className={styles.footerBtn}>
              {dark ? S.lightMode : S.darkMode}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
