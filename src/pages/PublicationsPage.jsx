export function PublicationsPage({ lang, T, dark }) {
  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderBottom: "1px solid #334155", padding: "3rem 1.5rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #0d6efd, #06b6d4, #0d6efd)" }} />
        <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(217,119,6,0.15)", border: "1px solid rgba(217,119,6,0.35)", borderRadius: "999px", padding: "0.2rem 0.8rem", marginBottom: "1.1rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#fcd34d", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "700" }}>🚧 {lang === "id" ? "Segera Hadir" : "Coming Soon"}</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "0.8rem" }}>
            {lang === "id" ? "Publikasi" : "Publications"} <span style={{ color: "#7dd3fc" }}>—</span><br />
            {lang === "id" ? "Laporan & Analisis Berbasis Data" : "Data-Driven Reports & Analysis"}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.72, maxWidth: "620px" }}>
            {lang === "id"
              ? "Pantau Pendidikan akan menerbitkan laporan dan publikasi mendalam berdasarkan data pendidikan Indonesia yang terverifikasi. Pengguna platform akan dapat mengakses ringkasan temuan, analisis tren, dan rekomendasi kebijakan berbasis bukti."
              : "Pantau Pendidikan will publish in-depth reports and publications based on verified Indonesian education data. Platform users will be able to access findings summaries, trend analyses, and evidence-based policy recommendations."}
          </p>
        </div>
      </section>

      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Coming soon cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "3rem" }}>
          {[
            { icon: "📊", color: "#0d6efd", bg: dark ? "rgba(13,110,253,0.1)" : "#eff6ff", border: "#bfdbfe",
              title: lang === "id" ? "Laporan Tahunan PISA Indonesia" : "Indonesia PISA Annual Report",
              desc: lang === "id" ? "Analisis mendalam tren skor PISA Indonesia 2000–2022, disparitas regional, dan perbandingan internasional." : "In-depth analysis of Indonesia's PISA score trends 2000–2022, regional disparities, and international comparisons." },
            { icon: "💰", color: "#d97706", bg: dark ? "rgba(217,119,6,0.1)" : "#fffbeb", border: "#fde68a",
              title: lang === "id" ? "Efektivitas Belanja Pendidikan" : "Education Spending Effectiveness",
              desc: lang === "id" ? "Kajian korelasi antara alokasi anggaran APBN fungsi pendidikan dengan capaian pembelajaran nasional." : "Study on the correlation between APBN education budget allocations and national learning outcomes." },
            { icon: "🗺️", color: "#7c3aed", bg: dark ? "rgba(124,58,237,0.1)" : "#f5f3ff", border: "#ddd6fe",
              title: lang === "id" ? "Atlas Disparitas Pendidikan" : "Education Disparity Atlas",
              desc: lang === "id" ? "Pemetaan kesenjangan pendidikan antar provinsi, kab/kota, dan antara daerah urban-rural berdasarkan data AN dan Dapodik." : "Mapping of education gaps across provinces, regencies, and urban-rural areas based on AN and Dapodik data." },
            { icon: "👩‍🏫", color: "#16a34a", bg: dark ? "rgba(22,163,74,0.1)" : "#f0fdf4", border: "#bbf7d0",
              title: lang === "id" ? "Profil Tenaga Pengajar Indonesia" : "Indonesia Teacher Workforce Profile",
              desc: lang === "id" ? "Analisis distribusi, kualifikasi, dan sertifikasi guru berdasarkan data Dapodik dan kebijakan Kemendikdasmen." : "Analysis of teacher distribution, qualifications, and certification based on Dapodik data and Kemendikdasmen policy." },
          ].map((card, i) => (
            <div key={i} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: "12px", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "1rem", right: "1rem", fontSize: "0.6rem", fontWeight: "700", color: card.color, background: "rgba(255,255,255,0.7)", border: `1px solid ${card.border}`, padding: "0.15rem 0.5rem", borderRadius: "999px", backdropFilter: "blur(4px)" }}>
                {lang === "id" ? "Sedang Disiapkan" : "In Preparation"}
              </div>
              <div style={{ fontSize: "2rem", marginBottom: "0.85rem" }}>{card.icon}</div>
              <h3 style={{ fontSize: "0.92rem", fontWeight: "800", color: T.text, marginBottom: "0.5rem", lineHeight: 1.3, paddingRight: "4rem" }}>{card.title}</h3>
              <p style={{ fontSize: "0.75rem", color: T.textSub, lineHeight: 1.65 }}>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Notify banner */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "2rem", textAlign: "center", boxShadow: T.shadow }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📬</div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: T.text, marginBottom: "0.5rem" }}>
            {lang === "id" ? "Jadilah yang Pertama Mengakses" : "Be the First to Access"}
          </h2>
          <p style={{ fontSize: "0.82rem", color: T.textSub, lineHeight: 1.7, maxWidth: "500px", margin: "0 auto 1.25rem" }}>
            {lang === "id"
              ? "Platform ini masih dalam pengembangan aktif. Publikasi pertama kami dijadwalkan rilis pada semester dua 2025. Pantau terus platform ini untuk pembaruan terbaru."
              : "This platform is under active development. Our first publications are scheduled for release in the second half of 2025. Check back for the latest updates."}
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: T.blueSub, border: `1px solid ${T.borderHover}`, borderRadius: "8px", padding: "0.6rem 1.25rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: T.blue }}>
              🚧 {lang === "id" ? "Dalam Pengembangan — Segera Hadir" : "Under Development — Coming Soon"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
