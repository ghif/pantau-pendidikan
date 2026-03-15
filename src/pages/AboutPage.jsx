export function AboutPage({ lang, T, dark }) {
  const L = {
    id: {
      heroTag: "Tentang Platform",
      heroTitle: "Tentang", heroTitleEm: "Pantau Pendidikan",
      heroDesc: "Platform independen untuk memantau, memahami, dan mengadvokasi perbaikan data pendidikan Indonesia — dibangun oleh tim lintas disiplin yang berdedikasi pada transparansi dan akuntabilitas.",
      aboutTitle: "Tentang Platform",
      aboutBody: [
        "Pantau Pendidikan adalah platform intelijen pendidikan independen yang dirancang untuk menjembatani kesenjangan antara data pendidikan Indonesia yang besar dan pemahaman publik terhadap data tersebut. Platform ini menggabungkan data dari sumber resmi — termasuk PISA/OECD, Asesmen Nasional, Dapodik, EMIS, dan data APBN Kemenkeu — dan menyajikannya melalui antarmuka berbasis AI yang dapat diakses oleh siapa pun.",
        "Kami percaya bahwa kebijakan pendidikan yang baik dimulai dari data yang dapat dipercaya dan dapat dipahami. Pantau Pendidikan bukan afiliasi resmi pemerintah — kami adalah proyek sipil independen yang berkomitmen pada transparansi, ketelitian data, dan aksesibilitas publik.",
        "Platform ini saat ini dalam tahap Beta (v0.1). Fitur-fitur baru, sumber data tambahan, dan laporan mendalam sedang dalam pengembangan aktif.",
      ],
      featuresTitle: "Fitur Platform",
      features: [
        { icon: "🤖", title: "Analisis AI Berbahasa Alami", desc: "Ajukan pertanyaan dalam Bahasa Indonesia atau Inggris — AI kami menganalisis data dan menyajikan temuan dengan visualisasi langsung." },
        { icon: "📊", title: "Dataset Terverifikasi", desc: "Data PISA Indonesia 2000–2022 dan data belanja pendidikan APBN 2005–2026 telah diunggah, divalidasi, dan diintegrasikan langsung ke sistem AI." },
        { icon: "🔍", title: "Analisis Mendalam PISA", desc: "Jelajahi data PISA berdasarkan domain (Membaca, Matematika, Sains), tingkat kemahiran, kesenjangan lokasi, dan kepemilikan sekolah." },
        { icon: "🗂️", title: "Katalog Sumber Data", desc: "Direktori lengkap 17 sumber data pendidikan resmi Indonesia, beserta frekuensi pembaruan, cakupan, dan tautan langsung." },
        { icon: "🌐", title: "Bilingual EN/ID", desc: "Seluruh platform tersedia dalam Bahasa Indonesia dan Inggris, termasuk analisis AI dan visualisasi data." },
        { icon: "🌙", title: "Mode Gelap & Terang", desc: "Antarmuka yang nyaman digunakan dalam kondisi pencahayaan apapun dengan mode gelap dan terang yang dapat diaktifkan kapan saja." },
      ],
      teamTitle: "Tim Kami",
      teamDesc: "Pantau Pendidikan dibangun oleh tim lintas disiplin yang menggabungkan keahlian kebijakan pendidikan, pemerintahan, rekayasa perangkat lunak, dan analitik data.",
      teamGroups: [
        {
          icon: "🎓", color: "#0d6efd", bg: dark ? "rgba(13,110,253,0.1)" : "#eff6ff", border: "#bfdbfe",
          title: "Pakar Pendidikan & Mantan Pejabat Pemerintah",
          desc: "Tim kami mencakup para ahli kebijakan pendidikan dan mantan pejabat pemerintah yang telah bekerja langsung dengan sistem pendidikan Indonesia — memahami nuansa regulasi, program Kemendikdasmen, dan dinamika desentralisasi pendidikan dari pengalaman langsung.",
          tags: ["Kebijakan Pendidikan", "Tata Kelola Pemerintah", "Regulasi K-12", "Desentralisasi Fiskal"],
        },
        {
          icon: "💻", color: "#7c3aed", bg: dark ? "rgba(124,58,237,0.1)" : "#f5f3ff", border: "#ddd6fe",
          title: "Insinyur Perangkat Lunak",
          desc: "Engineer kami membangun infrastruktur platform — mulai dari pipeline data backend, integrasi API, sistem AI, hingga antarmuka pengguna responsif. Tim berfokus pada keandalan, keamanan data, dan pengalaman pengguna yang intuitif.",
          tags: ["Full-Stack Development", "AI/LLM Integration", "Data Pipelines", "UI/UX Engineering"],
        },
        {
          icon: "📈", color: "#16a34a", bg: dark ? "rgba(22,163,74,0.1)" : "#f0fdf4", border: "#bbf7d0",
          title: "Pakar Analitik Data",
          desc: "Analis data kami bertanggung jawab atas validasi dataset, pengembangan metodologi, dan interpretasi statistik. Mereka memastikan bahwa setiap angka yang ditampilkan platform ini dapat dipertanggungjawabkan dan bersumber dari data yang dapat diverifikasi secara publik.",
          tags: ["Statistik Pendidikan", "Validasi Data", "Visualisasi", "Analisis Kebijakan Berbasis Bukti"],
        },
      ],
      valuesTitle: "Nilai & Komitmen Kami",
      values: [
        { icon: "✅", title: "Independen", desc: "Kami tidak berafiliasi dengan instansi pemerintah mana pun. Analisis kami bebas dari tekanan institusional." },
        { icon: "🔎", title: "Transparan", desc: "Setiap analisis dilengkapi kutipan sumber. Kami membedakan data terverifikasi dari estimasi berbasis web search." },
        { icon: "🌍", title: "Aksesibel", desc: "Data pendidikan harus dapat dipahami oleh semua pihak — bukan hanya peneliti dan pembuat kebijakan." },
        { icon: "🛡️", title: "Bertanggung Jawab", desc: "Kami mengakui keterbatasan data secara terbuka dan tidak pernah menyajikan klaim yang tidak dapat diverifikasi." },
      ],
      contactTitle: "Hubungi Kami",
      contactDesc: "Platform ini masih dalam pengembangan aktif (Beta v0.1). Kami menyambut masukan, saran sumber data baru, dan kolaborasi.",
    },
    en: {
      heroTag: "About the Platform",
      heroTitle: "About", heroTitleEm: "Pantau Pendidikan",
      heroDesc: "Pantau Pendidikan translates to Monitor Education. An independent platform for monitoring, understanding, and advocating for improvements in Indonesia's education data — built by a multidisciplinary team dedicated to transparency and accountability.",
      aboutTitle: "About the Platform",
      aboutBody: [
        "Pantau Pendidikan is an independent education intelligence platform designed to bridge the gap between Indonesia's vast education data and public understanding of that data. The platform aggregates data from official sources — including PISA/OECD, Asesmen Nasional, Dapodik, EMIS, and Kemenkeu APBN data — and presents it through an AI-powered interface accessible to everyone.",
        "We believe that good education policy starts with trustworthy, understandable data. Pantau Pendidikan is not affiliated with any government agency — we are an independent civic project committed to transparency, data rigour, and public accessibility.",
        "The platform is currently in Beta (v0.1). New features, additional data sources, and in-depth reports are under active development.",
      ],
      featuresTitle: "Platform Features",
      features: [
        { icon: "🤖", title: "Natural Language AI Analysis", desc: "Ask questions in Bahasa Indonesia or English — our AI analyses data and presents findings with live visualisations." },
        { icon: "📊", title: "Verified Datasets", desc: "Indonesia PISA data 2000–2022 and APBN education spending data 2005–2026 have been uploaded, validated, and integrated directly into the AI system." },
        { icon: "🔍", title: "PISA Deep Dive", desc: "Explore PISA data by domain (Reading, Mathematics, Science), proficiency levels, location gaps, and school ownership." },
        { icon: "🗂️", title: "Data Source Catalogue", desc: "A complete directory of 17 official Indonesian education data sources with update frequencies, coverage, and direct links." },
        { icon: "🌐", title: "Bilingual EN/ID", desc: "The entire platform is available in Bahasa Indonesia and English, including AI analysis and data visualisations." },
        { icon: "🌙", title: "Dark & Light Mode", desc: "A comfortable interface for any lighting condition with toggleable dark and light modes." },
      ],
      teamTitle: "Our Team",
      teamDesc: "Pantau Pendidikan is built by a multidisciplinary team combining expertise in education policy, government, software engineering, and data analytics.",
      teamGroups: [
        {
          icon: "🎓", color: "#0d6efd", bg: dark ? "rgba(13,110,253,0.1)" : "#eff6ff", border: "#bfdbfe",
          title: "Education Experts & Former Government Officials",
          desc: "Our team includes education policy experts and former government officials who have worked directly within Indonesia's education system — with deep understanding of Kemendikdasmen regulations, national programmes, and the dynamics of education decentralisation from first-hand experience.",
          tags: ["Education Policy", "Government Governance", "K-12 Regulation", "Fiscal Decentralisation"],
        },
        {
          icon: "💻", color: "#7c3aed", bg: dark ? "rgba(124,58,237,0.1)" : "#f5f3ff", border: "#ddd6fe",
          title: "Software Engineers",
          desc: "Our engineers build the platform infrastructure — from backend data pipelines and API integrations to the AI system and responsive user interface. The team focuses on reliability, data security, and intuitive user experience.",
          tags: ["Full-Stack Development", "AI/LLM Integration", "Data Pipelines", "UI/UX Engineering"],
        },
        {
          icon: "📈", color: "#16a34a", bg: dark ? "rgba(22,163,74,0.1)" : "#f0fdf4", border: "#bbf7d0",
          title: "Data Analytics Experts",
          desc: "Our data analysts are responsible for dataset validation, methodology development, and statistical interpretation. They ensure every figure the platform displays is accountable and sourced from publicly verifiable data.",
          tags: ["Education Statistics", "Data Validation", "Visualisation", "Evidence-Based Policy Analysis"],
        },
      ],
      valuesTitle: "Our Values & Commitments",
      values: [
        { icon: "✅", title: "Independent", desc: "We are not affiliated with any government agency. Our analyses are free from institutional pressure." },
        { icon: "🔎", title: "Transparent", desc: "Every analysis includes source citations. We distinguish verified data from web-search-based estimates." },
        { icon: "🌍", title: "Accessible", desc: "Education data should be understandable by everyone — not just researchers and policymakers." },
        { icon: "🛡️", title: "Accountable", desc: "We openly acknowledge data limitations and never present claims that cannot be verified." },
      ],
      contactTitle: "Get in Touch",
      contactDesc: "This platform is under active development (Beta v0.1). We welcome feedback, suggestions for new data sources, and collaboration.",
    },
  }[lang];

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderBottom: "1px solid #334155", padding: "3rem 1.5rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #0d6efd, #06b6d4, #0d6efd)" }} />
        <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(13,110,253,0.15)", border: "1px solid rgba(13,110,253,0.3)", borderRadius: "999px", padding: "0.2rem 0.8rem", marginBottom: "1.1rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#7dd3fc", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "700" }}>{L.heroTag}</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "0.8rem" }}>
            {L.heroTitle} <span style={{ color: "#7dd3fc" }}>—</span><br /><em style={{ fontStyle: "normal", color: "#7dd3fc" }}>{L.heroTitleEm}</em>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.72, maxWidth: "620px" }}>{L.heroDesc}</p>
        </div>
      </section>

      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* About the Platform */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "4px", height: "1.2rem", background: "#0d6efd", borderRadius: "2px", display: "block" }} />{L.aboutTitle}
          </h2>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "1.75rem", boxShadow: T.shadow }}>
            {L.aboutBody.map((para, i) => (
              <p key={i} style={{ fontSize: "0.875rem", color: T.textSub, lineHeight: 1.8, marginBottom: i < L.aboutBody.length - 1 ? "1rem" : 0 }}>{para}</p>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "4px", height: "1.2rem", background: "#06b6d4", borderRadius: "2px", display: "block" }} />{L.featuresTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {L.features.map((f, i) => (
              <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "1.25rem", boxShadow: T.shadow, display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: "700", color: T.text, marginBottom: "0.35rem" }}>{f.title}</p>
                  <p style={{ fontSize: "0.74rem", color: T.textSub, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "4px", height: "1.2rem", background: "#7c3aed", borderRadius: "2px", display: "block" }} />{L.teamTitle}
          </h2>
          <p style={{ fontSize: "0.82rem", color: T.textSub, lineHeight: 1.7, marginBottom: "1.25rem", maxWidth: "680px" }}>{L.teamDesc}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {L.teamGroups.map((g, i) => (
              <div key={i} style={{ background: g.bg, border: `1px solid ${g.border}`, borderRadius: "12px", padding: "1.5rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{g.icon}</div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: T.text, marginBottom: "0.6rem", lineHeight: 1.3 }}>{g.title}</h3>
                <p style={{ fontSize: "0.77rem", color: T.textSub, lineHeight: 1.7, marginBottom: "1rem" }}>{g.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {g.tags.map(tag => (
                    <span key={tag} style={{ fontSize: "0.64rem", fontWeight: "700", color: g.color, background: "rgba(255,255,255,0.6)", border: `1px solid ${g.border}`, padding: "0.18rem 0.55rem", borderRadius: "999px" }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "4px", height: "1.2rem", background: "#16a34a", borderRadius: "2px", display: "block" }} />{L.valuesTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {L.values.map((v, i) => (
              <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "1.25rem", boxShadow: T.shadow }}>
                <div style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>{v.icon}</div>
                <p style={{ fontSize: "0.85rem", fontWeight: "700", color: T.text, marginBottom: "0.35rem" }}>{v.title}</p>
                <p style={{ fontSize: "0.74rem", color: T.textSub, lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <div style={{ background: "linear-gradient(135deg, #0d6efd11, #06b6d411)", border: `1px solid ${T.borderHover}`, borderRadius: "14px", padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>💬</div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: "800", color: T.text, marginBottom: "0.5rem" }}>{L.contactTitle}</h2>
            <p style={{ fontSize: "0.82rem", color: T.textSub, lineHeight: 1.7, maxWidth: "480px", margin: "0 auto" }}>{L.contactDesc}</p>
          </div>
        </section>

      </div>
    </div>
  );
}
