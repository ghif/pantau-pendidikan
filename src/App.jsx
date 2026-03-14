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
  const [dark, setDark] = useState(false);
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

    // const data = await runAIQuery(text, lang);
    // console.log(data)
    // Trend skor PISA Indonesia sejak 2009
    const data = JSON.parse(`
{
    "summary": "Skor PISA Indonesia dalam literasi membaca, matematika, dan sains menunjukkan tren penurunan signifikan pada hasil terbaru tahun 2022 dibandingkan periode sebelumnya. Meskipun skor mengalami penurunan secara poin, peringkat global Indonesia cenderung membaik karena penurunan performa yang lebih drastis terjadi di banyak negara lain selama pandemi COVID-19.",
    "title": "Tren Skor PISA Indonesia Mengalami Penurunan Signifikan Terutama pada Literasi Membaca",
    "insights": [
        {
            "finding": "Skor membaca Indonesia pada PISA 2022 turun ke titik terendah sejak 2009, yaitu 359 poin dari sebelumnya 371 pada 2018.",
            "source": "https://www.oecd.org/en/publications/pisa-2022-results-volume-i_53123254-en.html"
        },
        {
            "finding": "Skor matematika Indonesia di tahun 2022 mencapai 366, turun 13 poin dibandingkan skor 379 pada PISA 2018.",
            "source": "https://www.kemdikbud.go.id/main/blog/2023/12/peringkat-indonesia-pada-pisa-2022-naik-5-sampai-6-posisi-dibanding-2018"
        },
        {
            "finding": "Performa literasi sains Indonesia juga menurun dari 396 poin di tahun 2018 menjadi 383 poin pada tahun 2022.",
            "source": "https://gpseducation.oecd.org/CountryProfile?primaryCountry=IDN&treshold=10&topic=PI"
        },
        {
            "finding": "Indonesia pernah mencapai skor sains tertinggi pada siklus 2015 dengan raihan 403 poin.",
            "source": "https://www.oecd.org/en/publications/pisa-2015-results-volume-i_9789264266490-en.html"
        }
    ],
    "chartType": "line",
    "chartData": [
        {
            "label": "2009",
            "value": 402
        },
        {
            "label": "2012",
            "value": 396
        },
        {
            "label": "2015",
            "value": 397
        },
        {
            "label": "2018",
            "value": 371
        },
        {
            "label": "2022",
            "value": 359
        }
    ],
    "chartTitle": "Tren Penurunan Skor Literasi Membaca PISA Indonesia (2009-2022)",
    "unit": "Skor PISA",
    "highlight": "low",
    "chartSource": "https://www.oecd.org/en/publications/pisa-2022-results-volume-i_53123254-en.html"
}
    `)
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
