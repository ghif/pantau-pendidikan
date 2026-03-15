import { STRINGS } from "../data/strings";
import styles from "../styles/Header.module.css";

export function Header({ lang, dark, page, setPage, setDark, toggleLang }) {
  const S = STRINGS[lang];
  
  const navItems = [
    { key: "home",    label: S.navHome },
    { key: "sources", label: S.navSources },
    { key: "pub",     label: S.navPublications },
    { key: "about",   label: S.navAbout },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer} onClick={() => setPage("home")}>
          <div className={styles.logoIcon}>
            <span className={styles.logoEmoji}>📚</span>
          </div>
          <div>
            <div className={styles.platformSub}>{S.platformSub}</div>
            <div className={styles.platformTitle}>Pantau Pendidikan</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => (
            <button key={item.key}
              onClick={() => setPage(item.key)}
              className={`${styles.navButton} ${page === item.key ? styles.navButtonActive : ""}`}
            >{item.label}</button>
          ))}
        </nav>

        <div className={styles.actions}>
          <button onClick={toggleLang} className={styles.langBtn}>
            <span>{lang === "id" ? "🇬🇧" : "🇮🇩"}</span>{S.langSwitch}
          </button>
          <button onClick={() => setDark(!dark)} className={styles.themeBtn}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
