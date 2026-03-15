import { useState } from "react";
import { STRINGS } from "../data/strings";
import styles from "../styles/Header.module.css";

export function Header({ lang, dark, page, setPage, setDark, toggleLang }) {
  const S = STRINGS[lang];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { key: "home",    label: S.navHome },
    { key: "sources", label: S.navSources },
    { key: "pub",     label: S.navPublications },
    { key: "about",   label: S.navAbout },
  ];

  const handlePageChange = (key) => {
    setPage(key);
    setMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer} onClick={() => handlePageChange("home")}>
          <div className={styles.logoIcon}>
            <span className={styles.logoEmoji}>📚</span>
          </div>
          <div>
            <div className={styles.platformSub}>{S.platformSub}</div>
            <div className={styles.platformTitle}>Pantau Pendidikan</div>
          </div>
        </div>

        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ""}`}>
          {navItems.map(item => (
            <button key={item.key}
              onClick={() => handlePageChange(item.key)}
              className={`${styles.navButton} ${page === item.key ? styles.navButtonActive : ""}`}
            >{item.label}</button>
          ))}
          
          <div className={styles.mobileActions}>
            <button onClick={toggleLang} className={styles.langBtn}>
              <span>{lang === "id" ? "🇬🇧" : "🇮🇩"}</span>{S.langSwitch}
            </button>
            <button onClick={() => setDark(!dark)} className={styles.themeBtn}>
              {dark ? "☀️" : "🌙"} {dark ? "Light" : "Dark"} Mode
            </button>
          </div>
        </nav>

        <div className={styles.actions}>
          <button onClick={toggleLang} className={styles.langBtn}>
            <span>{lang === "id" ? "🇬🇧" : "🇮🇩"}</span>{S.langSwitch}
          </button>
          <button onClick={() => setDark(!dark)} className={styles.themeBtn}>
            {dark ? "☀️" : "🌙"}
          </button>
          
          <button 
            className={styles.mobileToggle} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
