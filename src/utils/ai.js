export async function runAIQuery(question, lang) {
  const S = {
    id: { errorMsg: "Terjadi kesalahan saat menganalisis. Silakan coba lagi." },
    en: { errorMsg: "An error occurred during analysis. Please try again." }
  };

  const systemPrompt = lang === "en"
    ? `You are the AI analysis engine for Pantau Pendidikan, an independent platform monitoring Indonesia's education system. Answer questions using ONLY real, publicly verifiable Indonesian education data from BPS, Kemendikdasmen, Rapor Pendidikan, KPAI, Dapodik, EMIS, APBN/APBD data, and PISA/OECD. NEVER fabricate statistics. Respond ONLY with a JSON object (no markdown): {"summary":"2-3 sentence finding","insights":["finding 1","finding 2","finding 3","finding 4"],"chartType":"bar"|"line"|"comparison"|"none","chartData":[{"label":"...","value":number}],"unit":"chart label","highlight":"high"|"low"|"neutral","source":"citation"}`
    : `Anda adalah mesin analisis AI Pantau Pendidikan. Jawab pertanyaan menggunakan data pendidikan Indonesia yang nyata dan dapat diverifikasi dari BPS, Kemendikdasmen, Rapor Pendidikan, KPAI, Dapodik, EMIS, data APBN/APBD, dan PISA/OECD. JANGAN membuat statistik. Jawab HANYA dengan objek JSON (tanpa markdown): {"summary":"ringkasan 2-3 kalimat","insights":["temuan 1","temuan 2","temuan 3","temuan 4"],"chartType":"bar"|"line"|"comparison"|"none","chartData":[{"label":"...","value":number}],"unit":"label grafik","highlight":"high"|"low"|"neutral","source":"kutipan sumber"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: question }]
      }),
    });

    if (!response.ok) throw new Error(`API ${response.status}`);

    const data = await response.json();
    const raw = data.content.map(b => b.text || "").join("").trim().replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
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
