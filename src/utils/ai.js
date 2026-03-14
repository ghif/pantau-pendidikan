export async function runAIQuery(question, lang) {
  const S = {
    id: { errorMsg: "Terjadi kesalahan saat menganalisis. Silakan coba lagi." },
    en: { errorMsg: "An error occurred during analysis. Please try again." }
  };

  const systemPrompt = lang === "en"
    ? `You are the AI analysis engine for Pantau Pendidikan, an independent platform monitoring Indonesia's education system. Answer questions using ONLY real, publicly verifiable Indonesian education data from BPS, Kemendikdasmen, Rapor Pendidikan, KPAI, Dapodik, EMIS, APBN/APBD data, and PISA/OECD. NEVER fabricate statistics. Respond ONLY with a JSON object (no markdown):
      {
        "summary":"2-3 sentence finding",
        "title":"One sentence that highlights the summary",
        "insights":[
          {"finding":"finding 1","source":"reference URL for finding 1"},
          {"finding":"finding 2","source":"reference URL for finding 2"},
          {"finding":"finding 3","source":"reference URL for finding 3"},
          {"finding":"finding 4","source":"reference URL for finding 4"},
        ],
        "chartType":"bar"|"line"|"comparison"|"none",
        "chartData":[{"label":"...","value":number}],
        "chartTitle":"One sentence insight extracted from the chart",
        "unit":"the dimension name of the value of the chart",
        "highlight":"high"|"low"|"neutral",
        "chartSource":"the URL where you get the data for the chart"
      }`
    : `Anda adalah mesin analisis AI Pantau Pendidikan. Jawab pertanyaan menggunakan data pendidikan Indonesia yang nyata dan dapat diverifikasi dari BPS, Kemendikdasmen, Rapor Pendidikan, KPAI, Dapodik, EMIS, data APBN/APBD, dan PISA/OECD. JANGAN membuat statistik. Jawab HANYA dengan objek JSON (tanpa markdown):
      {
        "summary":"ringkasan 2-3 kalimat",
        "title":"Satu kalimat inti sari dari summary",
        "insights":[
          {"finding":"temuan 1","source":"URL referensi untuk temuan 1"},
          {"finding":"temuan 2","source":"URL referensi untuk temuan 2"},
          {"finding":"temuan 3","source":"URL referensi untuk temuan 3"},
          {"finding":"temuan 4","source":"URL referensi untuk temuan 4"},
        ],
        "chartType":"bar"|"line"|"comparison"|"none",
        "chartData":[{"label":"...","value":number}],
        "chartTitle":"Insight dalam satu kalimat dari chart tersebut",
        "unit":"nama dimensi dari value pada chart",
        "highlight":"high"|"low"|"neutral",
        "chartSource":"URL referensi data chart berasal"
      }`;

  try {
    const response = await fetch('/api/ai/generateContent', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: question }] }],
        generationConfig: {
          response_mime_type: "application/json"
        }
      }),
    });

    if (!response.ok) throw new Error(`API ${response.status}`);

    const data = await response.json();
    const raw = data.candidates[0].content.parts[0].text;
    return JSON.parse(raw);
  } catch (err) {
    console.error("AI Query Error:", err);
    return {
      summary: S[lang].errorMsg,
      insights: [],
      chartType: "none",
      source: ""
    };
  }
}
