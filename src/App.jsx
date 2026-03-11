import { useState, useRef, useCallback } from "react";
import { STRINGS } from "./data/strings";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { DataSourcesPage } from "./pages/DataSourcesPage";
import { runAIQuery } from "./utils/ai";
import "./styles/index.css";

export default function App() {
  const [lang, setLang] = useState("id");
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("home"); // "home" | "sources"
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(null);
  const [typingDone, setTypingDone] = useState(false);
  const inputRef = useRef(null);
  const resultRef = useRef(null);

  const handleQuery = useCallback(async (q) => {
    const text = (q || query).trim();
    if (!text) return;

    setResult(null); 
    setTypingDone(false); 
    setLoading(true); 
    setPage("home");

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    const data = await runAIQuery(text, lang);
    setResult(data);
    setLoading(false);
  }, [query, lang]);

  const toggleLang = () => { 
    setLang(l => l === "id" ? "en" : "id"); 
    setResult(null); 
    setQuery(""); 
    setFilter(null); 
  };

  const commonProps = { 
    lang, dark, page, setPage, setDark, toggleLang
  };

  return (
    <div className={dark ? "dark" : ""} style={{ 
      minHeight: "100vh", 
      background: "var(--page-bg)", 
      color: "var(--text)", 
      transition: "background 0.25s,color 0.25s" 
    }}>
      <Header {...commonProps} />

      <div style={{ animation: "fadeUp 0.4s ease both" }}>
        {page === "sources" ? (
          <DataSourcesPage lang={lang} />
        ) : (
          <HomePage 
            {...commonProps}
            inputRef={inputRef}
            query={query}
            setQuery={setQuery}
            handleQuery={handleQuery}
            loading={loading}
            result={result}
            typingDone={typingDone}
            setTypingDone={setTypingDone}
            resultRef={resultRef}
            filter={filter}
            setFilter={setFilter}
          />
        )}
      </div>

      <Footer {...commonProps} />
    </div>
  );
}
