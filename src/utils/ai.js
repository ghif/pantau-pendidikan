import {
  PISA_DATA,
  SPENDING_DATA,
  TOTAL_SPENDING_DATA,
  ASESMEN_NASIONAL_DATA,
} from "../data/official";

export async function runAIQuery(question, lang) {
  const S = {
    id: { errorMsg: "Terjadi kesalahan saat menganalisis. Silakan coba lagi." },
    en: { errorMsg: "An error occurred during analysis. Please try again." }
  };

  const pisaSummary = Object.entries(PISA_DATA.national).map(([y, d]) =>
    `${y}: Reading=${d.reading}, Math=${d.math ?? "N/A"}, Science=${d.science ?? "N/A"}`
  ).join("; ");
  const pisaLevel2 = Object.entries(PISA_DATA.pctLevel2).map(([y, d]) =>
    `${y}: Reading=${d.reading}%, Math=${d.math ?? "N/A"}%`
  ).join("; ");
  const locationGap = Object.entries(PISA_DATA.byLocation).map(([y, d]) =>
    `${y}: Village=${d.village}, Town=${d.town}, City=${d.city}`
  ).join("; ");
  const spendingSummary = SPENDING_DATA.series.map(d =>
    `${d.year}(${d.status}): Rp${d.valueT}T | ${d.pctOfBelanja}% of central govt spending | ${d.pctGDP}% of GDP`
  ).join("; ");

  const totalSpendingSummary = TOTAL_SPENDING_DATA.series.map(d =>
    `${d.year}(${d.status}): Total=${d.totalT}T (BPP=${d.bppT}T + TKD~${d.tkdT}T + Pembiayaan~${d.pembiayaanT}T) | ${d.pctOfTotal}% of total APBN | YoY growth=${d.growthPct}%`
  ).join("; ");

  const anLiteracySummary = ASESMEN_NASIONAL_DATA.data.provinces.map(
    d => `${d.name.replace('Prov. ', '')}: ${d.levels.SEMUA.literacy}`
  ).join("; ");
  const anNumeracySummary = ASESMEN_NASIONAL_DATA.data.provinces.map(
    d => `${d.name.replace('Prov. ', '')}: ${d.levels.SEMUA.numeracy}`
  ).join("; ");

  const dataContext = `
VERIFIED DATASET 1 — PISA Indonesia National Mean Scores (500-point scale):
${pisaSummary}

PISA % students at or above Level 2 (basic proficiency):
${pisaLevel2}

PISA Urban-Rural Gap (mean Reading score by location type):
${locationGap}

PISA Public vs Private schools (mean Reading):
${Object.entries(PISA_DATA.byOwnership).map(([y,d])=>`${y}: Negeri=${d.negeri}, Swasta=${d.swasta}`).join("; ")}

VERIFIED DATASET 2 — Indonesia Education Function Spending, Central Govt only (BPP — Belanja Pemerintah Pusat):
${spendingSummary}
Constitutional mandate: ${SPENDING_DATA.meta.constitutionalMandate}
Source: ${SPENDING_DATA.meta.source}
Note: ${SPENDING_DATA.meta.note}
Note on %: ${SPENDING_DATA.meta.pctSource}

VERIFIED DATASET 3 — Indonesia TOTAL Education Budget (ALL channels: BPP + TKD + Pembiayaan):
${totalSpendingSummary}
Source: ${TOTAL_SPENDING_DATA.meta.source}
Chart: ${TOTAL_SPENDING_DATA.meta.chart}
URL: ${TOTAL_SPENDING_DATA.meta.url}
Note: ${TOTAL_SPENDING_DATA.meta.note}
Mandate compliance: ${TOTAL_SPENDING_DATA.meta.constitutionalMandate20pct}

VERIFIED DATASET 4 - Indonesia National Assessment (Asesmen Nasional) for literacy:
${anLiteracySummary}
Source: ${ASESMEN_NASIONAL_DATA.meta.source}
URL: ${ASESMEN_NASIONAL_DATA.meta.url}

VERIFIED DATASET 5 - Indonesia National Assessment (Asesmen Nasional) for numeracy:
${anNumeracySummary}
Source: ${ASESMEN_NASIONAL_DATA.meta.source}
URL: ${ASESMEN_NASIONAL_DATA.meta.url}
  `.trim();

  const systemPrompt = lang === "en"
    ? `You are the AI analysis engine for Pantau Pendidikan, an independent platform monitoring Indonesia's education system.

IMPORTANT: Always respond entirely in English, regardless of what language the user's question is written in.

VERIFIED DATASETS (always use these first for PISA, education spending, and national assessment):
${dataContext}

RESEARCH APPROACH:
1. Answer what you can from the VERIFIED DATASETS above (sourceType: "verified")
2. If the data is not in the verified datasets, you can answer based on your pre-trained knowledge or available tools for these official sources:
   - https://data.kemendikdasmen.go.id/data-induk
   - https://raporpendidikan.kemendikdasmen.go.id/
   - https://bps.go.id/
   - https://data-apbn.kemenkeu.go.id/
   - https://kpai.go.id/
3. NEVER fabricate statistics. If data is genuinely unavailable, state that explicitly.

SPENDING RULE: For ANY spending finding, distinguish BPP-only from TOTAL. Always state: Rupiah value, % of APBN, and % of GDP. For mandate compliance always use TOTAL figures.

Produce 4-6 insights covering BOTH verified data and other findings. Each insight must cite its source.

Respond ONLY with a JSON object (no markdown, no preamble):
{"headline":"one sharp sentence — max 12 words","summary":"2-3 sentence synthesis of findings","insights":[{"text":"specific finding with concrete data","sourceLabel":"e.g. PISA 2022 / Kemendikdasmen 2024","sourceType":"verified"|"web","sourceUrl":"https://exact-url-used"}],"chartType":"bar"|"line"|"comparison"|"scatter"|"dual_axis"|"none","chartData":[{"label":"...","value":number,"sourceType":"verified"|"web","sourceLabel":"source name"}],"unit":"chart axis label","highlight":"high"|"low"|"neutral"}

CHART RULES:
- ALWAYS try to produce a chart. Extract numeric values from percentages, counts, rankings, or rates.
- Each chartData point MUST include sourceType ("verified" if from PISA/APBN datasets, "web" if otherwise) and sourceLabel (short source name).
- SPENDING TREND queries: use chartType "line" with chartData [{label: year, value: spending_in_T_Rp, sourceType, sourceLabel}].
- CORRELATION queries: use chartType "dual_axis" with chartData [{label: year, spending: value_in_T_Rp, pisa: score}].
- "bar": categorical comparison — [{label, value, sourceType, sourceLabel}]
- "line": time series — [{label, value, sourceType, sourceLabel}]
- "comparison": two groups — [{label, female, male}]
- "scatter": correlation — [{label, x, y}]
- "dual_axis": two time series with different scales — [{label, spending, pisa}]
- Only use "none" if no numeric data of any kind is available.`
    : `Anda adalah mesin analisis AI Pantau Pendidikan, platform independen pemantauan pendidikan Indonesia.

PENTING: Selalu jawab seluruhnya dalam Bahasa Indonesia, terlepas dari bahasa apa yang digunakan pengguna.

DATASET TERVERIFIKASI (selalu gunakan lebih dahulu untuk PISA, belanja pendidikan, dan asesmen nasional):
${dataContext}

PENDEKATAN RISET:
1. Jawab menggunakan DATASET TERVERIFIKASI di atas terlebih dahulu (sourceType: "verified")
2. Jika tidak ada di data terverifikasi, gunakan pengetahuan Anda tentang sumber resmi berikut:
   - BPS, Kemendikdasmen, Rapor Pendidikan, Kemenkeu, KPAI.
3. JANGAN membuat statistik. Jika data tidak tersedia, nyatakan secara eksplisit.

ATURAN BELANJA: Untuk SETIAP temuan belanja, bedakan BPP saja dari TOTAL. Selalu sebutkan nilai Rupiah, % APBN, dan % PDB. Untuk kepatuhan mandat gunakan angka TOTAL.

Hasilkan 4-6 temuan yang mencakup data terverifikasi DAN temuan berbasis web/sumber lain. Setiap temuan harus mencantumkan sumbernya.

Jawab HANYA dengan objek JSON (tanpa markdown, tanpa pembuka):
{"headline":"satu kalimat tajam — maks 12 kata","summary":"sintesis 2-3 kalimat dari temuan","insights":[{"text":"temuan spesifik dengan data konkret","sourceLabel":"mis. PISA 2022 / Kemendikdasmen 2024","sourceType":"verified"|"web","sourceUrl":"https://url-yang-digunakan"}],"chartType":"bar"|"line"|"comparison"|"scatter"|"dual_axis"|"none","chartData":[{"label":"...","value":number,"sourceType":"verified"|"web","sourceLabel":"nama sumber"}],"unit":"label sumbu grafik","highlight":"high"|"low"|"neutral"}

ATURAN GRAFIK:
- SELALU coba buat grafik. Ekstrak nilai numerik dari persentase, jumlah, peringkat, atau angka apapun.
- Setiap titik chartData HARUS menyertakan sourceType ("verified" jika dari dataset PISA/APBN, "web" jika dari sumber lain) dan sourceLabel (nama sumber singkat).
- PERTANYAAN TREN BELANJA: gunakan chartType "line" dengan chartData [{label: tahun, value: belanja_dalam_T_Rp, sourceType, sourceLabel}].
- PERTANYAAN KORELASI: gunakan chartType "dual_axis" dengan chartData [{label: tahun, spending: nilai_T_Rp, pisa: skor}].
- "bar": perbandingan kategorikal — [{label, value, sourceType, sourceLabel}]
- "line": deret waktu — [{label, value, sourceType, sourceLabel}]
- "comparison": dua kelompok — [{label, female, male}]
- "scatter": korelasi — [{label, x, y}]
- "dual_axis": dua deret waktu skala berbeda — [{label, spending, pisa}]
- Gunakan "none" HANYA jika tidak ada data numerik sama sekali.`;

  try {
    const response = await fetch('/api/ai/generateContent', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: question }] }],
        generationConfig: {
          response_mime_type: "application/json"
        },
        // tools: [{ googleSearch: {} }]
      }),
    });

    if (!response.ok) throw new Error(`API ${response.status}`);

    const data = await response.json();
    const raw = data.candidates[0].content.parts[0].text;
    
    // Robustly extract JSON if markdown fences are present
    const extractJSON = (str) => {
      const stripped = str.replace(/^\`\`\`json\s*/im, "").replace(/\s*\`\`\`\s*$/im, "").trim();
      const start = stripped.indexOf("{");
      if (start === -1) throw new Error("No JSON object found in response");
      let depth = 0;
      for (let i = start; i < stripped.length; i++) {
        if (stripped[i] === "{") depth++;
        else if (stripped[i] === "}") {
          depth--;
          if (depth === 0) return stripped.slice(start, i + 1);
        }
      }
      return stripped;
    };
    
    return JSON.parse(extractJSON(raw));
  } catch (err) {
    console.error("AI Query Error:", err);
    return {
      headline: S[lang].errorMsg,
      summary: String(err?.message || err),
      insights: [],
      chartType: "none",
      source: ""
    };
  }
}
