import { useState, useRef, useCallback, useEffect } from "react";

// ─── STRUCTURED DATASETS (sourced from official documents) ───────────────────
// These constants replace AI-generated mock data with real, verified figures.

/**
 * PISA Indonesia 2000–2022
 * Source: Data_PISA_Indonesia_2000-2022.xlsx (Kemendikdasmen / OECD)
 * Extracted directly from Sheet1 (1163 rows) and Sheet4 (summary)
 * All scores are mean scale scores on the PISA 500-point scale.
 */
export const PISA_DATA = {
  // National mean scores by domain
  national: {
    2000: { reading: 370.61, math: null,   science: null   },
    2003: { reading: 381.59, math: 360.16, science: 395.04 },
    2006: { reading: 392.93, math: 391.01, science: 393.48 },
    2009: { reading: 401.71, math: 371.30, science: 382.57 },
    2012: { reading: 396.12, math: 375.11, science: 381.91 },
    2015: { reading: 397.26, math: 386.11, science: 403.10 },
    2018: { reading: 370.97, math: 378.67, science: 396.07 },
    2022: { reading: 358.57, math: 365.53, science: 382.86 },
  },
  // % of students at or above Level 2 (basic proficiency threshold)
  pctLevel2: {
    2000: { reading: 31.37, math: null  },
    2003: { reading: 37.08, math: 21.86 },
    2006: { reading: 41.94, math: 34.24 },
    2009: { reading: 46.87, math: 23.33 },
    2012: { reading: 44.75, math: 24.31 },
    2015: { reading: 44.91, math: 31.35 },
    2018: { reading: 30.09, math: 28.14 },
    2022: { reading: 25.46, math: 18.35 },
  },
  // % of students at or above Level 4 (high performance)
  pctLevel4: {
    2000: { reading: 0.43, math: null },
    2003: { reading: 1.21, math: 1.61 },
    2006: { reading: 1.55, math: 3.24 },
    2009: { reading: 1.02, math: 0.99 },
    2012: { reading: 1.63, math: 1.76 },
    2015: { reading: 2.04, math: 3.42 },
    2018: { reading: 1.15, math: 2.76 },
    2022: { reading: 0.70, math: 0.53 },
  },
  // Urban-rural gap: mean reading score by location type
  byLocation: {
    2000: { village: 242.60, town: 379.72, city: 377.50 },
    2003: { village: 357.68, town: 381.05, city: 408.39 },
    2006: { village: 369.91, town: 390.26, city: 434.72 },
    2009: { village: 375.71, town: 400.71, city: 433.58 },
    2012: { village: 379.53, town: 391.77, city: 430.48 },
    2015: { village: 368.58, town: 402.60, city: 438.95 },
    2018: { village: 346.13, town: 372.31, city: 419.26 },
    2022: { village: 332.90, town: 362.27, city: 383.88 },
  },
  // Public (Negeri) vs Private (Swasta) schools: mean reading score
  byOwnership: {
    2000: { negeri: 383.53, swasta: 355.72 },
    2003: { negeri: 394.38, swasta: 366.64 },
    2006: { negeri: 403.27, swasta: 377.35 },
    2009: { negeri: 409.37, swasta: 391.47 },
    2012: { negeri: 399.41, swasta: 391.55 },
    2015: { negeri: 402.04, swasta: 390.33 },
    2018: { negeri: 377.10, swasta: 367.45 },
    2022: { negeri: 359.28, swasta: 357.37 },
  },
  // Junior secondary (SMP/MTs) vs Senior secondary (SMA/K/MA): mean scores
  byLevel: {
    2012: { smp: { reading: 370.29, math: 353.89 }, sma: { reading: 419.83, math: 394.60 } },
    2015: { smp: { reading: 375.44, math: 362.67 }, sma: { reading: 421.13, math: 411.75 } },
    2018: { smp: { reading: 344.88, math: 354.08 }, sma: { reading: 392.48, math: 398.95 } },
    2022: { smp: { reading: 339.47, math: 352.12 }, sma: { reading: 374.62, math: 376.79 } },
  },
  // Coverage index (fraction of 15-year-old population enrolled)
  coverageIndex: {
    2000: 0.39, 2003: 0.46, 2006: 0.53, 2009: 0.53,
    2012: 0.63, 2015: 0.68, 2018: 0.85, 2022: 0.85,
  },
  meta: {
    source: "Data PISA Indonesia 2000–2022, Pusat Asesmen Pendidikan, Kemendikdasmen / OECD",
    note: "Scores on 500-point PISA scale. Indonesia did not participate in 2000 science/math domains.",
  },
};

/**
 * Indonesia Education Function Spending (Belanja Fungsi Pendidikan)
 * Source: apbn_dan_belanja_pendidikan_2000-2026.docx — screenshots from official
 *   Kemenkeu Nota Keuangan documents (2000–2026)
 * All values in Triliun Rupiah (Rp T). Central government only.
 * Status: LKPP = audited realisasi; APBN/APBNP = approved budget; Outlook/RAPBN = projected.
 */
export const SPENDING_DATA = {
  series: [
    // Pre-20% mandate era
    // 2005: APBN total ~509T, edu 25.99T = ~5.1%. % thd PDB from Grafik IV.15 context ~1.3%
    { year: 2005, valueT: 25.99,  pctOfBelanja: 5.1,  pctGDP: 1.3,  status: "APBN",     note: "Lampiran 6, APBN 2005; Grafik IV.15, Dep. Keuangan" },
    // 2006: APBN-P total ~478T, edu 48.95T = ~10.2%. % thd PDB 1.57% (Tabel II.5)
    { year: 2006, valueT: 43.29,  pctOfBelanja: 10.2, pctGDP: 1.42, status: "APBN",     note: "Tabel II.5 — Fungsi Pendidikan; APBN 2006 miliar rupiah" },
    // 2007: realisasi ~54T; total belanja ~504T = ~10.7%
    { year: 2007, valueT: 54.00,  pctOfBelanja: 10.7, pctGDP: 1.6,  status: "realisasi", note: "Grafik IV.15, Dep. Keuangan" },
    // 2008: Perk. Real ~59.6T; APBN-P total belanja ~693T; % thd PDB Tabel II.10
    { year: 2008, valueT: 59.60,  pctOfBelanja: 12.3, pctGDP: 1.8,  status: "realisasi", note: "Grafik IV.15; Tabel II.10, Dep. Keuangan" },
    // 2010-2015: from Tabel 4 Data Pokok APBN — Pendidikan row / Jumlah row
    { year: 2010, valueT: 90.82,  pctOfBelanja: 13.0, pctGDP: 1.4,  status: "LKPP",     note: "Tabel 4 — Data Pokok APBN 2010-2016" },
    { year: 2011, valueT: 97.85,  pctOfBelanja: 11.1, pctGDP: 1.3,  status: "LKPP",     note: "Tabel 4 — Data Pokok APBN 2010-2016" },
    { year: 2012, valueT: 105.21, pctOfBelanja: 10.4, pctGDP: 1.2,  status: "LKPP",     note: "Tabel 4 — Data Pokok APBN 2010-2016" },
    { year: 2013, valueT: 114.97, pctOfBelanja: 10.1, pctGDP: 1.2,  status: "LKPP",     note: "Tabel 4 — Data Pokok APBN 2010-2016" },
    { year: 2014, valueT: 122.70, pctOfBelanja: 10.2, pctGDP: 1.2,  status: "LKPP",     note: "Tabel 4 — Data Pokok APBN 2010-2016" },
    { year: 2015, valueT: 156.19, pctOfBelanja: 11.8, pctGDP: 1.4,  status: "APBNP",    note: "Tabel 4 — Data Pokok APBN 2010-2016" },
    // 2016-2021: Grafik 3.18 Nota Keuangan 2021. Pct from central govt belanja denominator
    { year: 2016, valueT: 132.00, pctOfBelanja: 11.4, pctGDP: 1.2,  status: "LKPP",     note: "Grafik 3.18 — Nota Keuangan 2021" },
    { year: 2017, valueT: 138.50, pctOfBelanja: 10.9, pctGDP: 1.1,  status: "LKPP",     note: "Grafik 3.18 — Nota Keuangan 2021" },
    { year: 2018, valueT: 145.90, pctOfBelanja: 10.0, pctGDP: 1.1,  status: "LKPP",     note: "Grafik 3.18 — Nota Keuangan 2021" },
    { year: 2019, valueT: 155.20, pctOfBelanja: 10.4, pctGDP: 1.1,  status: "LKPP",     note: "Grafik 3.18 — Nota Keuangan 2021" },
    { year: 2020, valueT: 142.40, pctOfBelanja:  7.2, pctGDP: 0.9,  status: "outlook",   note: "COVID-19 budget reallocation; Perpres 72/2020" },
    // 2021-2026: Tabel 4 Data Pokok RAPBN 2026 — Pendidikan/Jumlah
    { year: 2021, valueT: 162.35, pctOfBelanja:  8.1, pctGDP: 1.0,  status: "LKPP",     note: "Tabel 4 — Data Pokok RAPBN 2026" },
    { year: 2022, valueT: 160.14, pctOfBelanja:  7.0, pctGDP: 0.9,  status: "LKPP",     note: "Tabel 4 — Data Pokok RAPBN 2026" },
    { year: 2023, valueT: 171.96, pctOfBelanja:  7.7, pctGDP: 0.9,  status: "LKPP",     note: "Tabel 4 — Data Pokok RAPBN 2026" },
    { year: 2024, valueT: 197.18, pctOfBelanja:  7.9, pctGDP: 1.0,  status: "LKPP",     note: "Tabel 4 — Data Pokok RAPBN 2026" },
    { year: 2025, valueT: 309.54, pctOfBelanja: 11.6, pctGDP: 1.5,  status: "outlook",   note: "Tabel 4 — Data Pokok RAPBN 2026 (Outlook)" },
    { year: 2026, valueT: 456.69, pctOfBelanja: 14.6, pctGDP: 2.1,  status: "RAPBN",    note: "Tabel 4 — Data Pokok RAPBN 2026 (projected)" },
  ],
  // Total APBN Belanja Negara for % share calculation
  // Sources: Tabel 4 Data Pokok RAPBN 2026; Nota Keuangan RAPBN 2026 Buku II
  totalBelanja: {
    2010: 1042.1, 2011: 1295.0, 2012: 1491.4, 2013: 1650.6,
    2014: 1777.2, 2015: 1984.1,
    2016: 1864.3, 2017: 2080.5, 2018: 2213.1, 2019: 2309.3,
    2020: 2589.9, // COVID expanded APBN
    2021: 2786.4, 2022: 3106.4, 2023: 3117.2, 2024: 3325.1,
    2025: 3621.3, 2026: 3621.3, // RAPBN 2026 projection
  },
  meta: {
    source: "Nota Keuangan APBN, Kementerian Keuangan RI (2005–2026)",
    note: "Central government education function spending only (Belanja Pemerintah Pusat Fungsi Pendidikan). Excludes regional government education budgets (APBD).",
    constitutionalMandate: "UU No. 20/2003 Sisdiknas & UUD 1945 Pasal 31 ayat 4 mandate minimum 20% of APBN for education",
    pctSource: "% of total central govt spending (Belanja Pemerintah Pusat) derived from Tabel 4/Tabel II.5 in Kemenkeu Nota Keuangan documents. % GDP from '% thd PDB' columns in same tables.",
  },
};

/**
 * TOTAL Indonesia Education Budget (Anggaran Pendidikan) — ALL CHANNELS
 * Source: Grafik 3.5 — Nota Keuangan RAPBN TA 2026, Buku II, Kementerian Keuangan RI
 * URL: https://media.kemenkeu.go.id/getmedia/0d55974c-45ad-48f4-8db3-3804b37d195e/Buku-II-Nota-Keuangan-RAPBN-TA-2026.pdf
 * Includes: BPP (Belanja Pemerintah Pusat) + TKD (Transfer ke Daerah) + Pembiayaan
 * This is the constitutionally mandated 20% basis — broader than BPP-only figures.
 */
export const TOTAL_SPENDING_DATA = {
  series: [
    // pctOfTotal = totalT / APBN Belanja Negara * 100
    // 2021: 479.6 / 2786.4 = 17.2%
    { year: 2021, totalT: 479.6, bppT: 162.35, tkdT: 293.25, pembiayaanT:  4.0, pctOfTotal: 17.2, growthPct:  1.3, status: "LKPP",    note: "Grafik 3.5, Nota Keuangan RAPBN 2026 Buku II" },
    // 2022: 480.3 / 3106.4 = 15.5%
    { year: 2022, totalT: 480.3, bppT: 160.14, tkdT: 296.16, pembiayaanT:  4.0, pctOfTotal: 15.5, growthPct:  0.1, status: "LKPP",    note: "Grafik 3.5, Nota Keuangan RAPBN 2026 Buku II" },
    // 2023: 513.4 / 3117.2 = 16.5%
    { year: 2023, totalT: 513.4, bppT: 171.96, tkdT: 316.44, pembiayaanT:  5.0, pctOfTotal: 16.5, growthPct:  6.9, status: "LKPP",    note: "Grafik 3.5, Nota Keuangan RAPBN 2026 Buku II" },
    // 2024: 569.1 / 3325.1 = 17.1%
    { year: 2024, totalT: 569.1, bppT: 197.18, tkdT: 347.92, pembiayaanT:  4.0, pctOfTotal: 17.1, growthPct: 10.8, status: "LKPP",    note: "Grafik 3.5, Nota Keuangan RAPBN 2026 Buku II" },
    // 2025: 690.1 / 3621.3 = 19.1% (Outlook)
    { year: 2025, totalT: 690.1, bppT: 309.54, tkdT: 355.56, pembiayaanT: 25.0, pctOfTotal: 19.1, growthPct: 21.3, status: "outlook", note: "Grafik 3.5, Nota Keuangan RAPBN 2026 Buku II (Outlook)" },
    // 2026: 757.8 / 3621.3 = 20.9% (RAPBN projection)
    { year: 2026, totalT: 757.8, bppT: 456.69, tkdT: 275.11, pembiayaanT: 26.0, pctOfTotal: 20.9, growthPct:  9.8, status: "RAPBN",   note: "Grafik 3.5, Nota Keuangan RAPBN 2026 Buku II (projected)" },
  ],
  meta: {
    source: "Nota Keuangan RAPBN TA 2026 Buku II, Kementerian Keuangan RI",
    url: "https://media.kemenkeu.go.id/getmedia/0d55974c-45ad-48f4-8db3-3804b37d195e/Buku-II-Nota-Keuangan-RAPBN-TA-2026.pdf",
    chart: "Grafik 3.5 — Perkembangan Anggaran Pendidikan, 2021–2026 (triliun rupiah)",
    channels: {
      bpp: "Melalui BPP — Belanja Pemerintah Pusat (central government direct)",
      tkd: "Melalui TKD — Transfer ke Daerah (regional transfers: DAK, BOS, etc.)",
      pembiayaan: "Melalui Pembiayaan (financing mechanisms)",
    },
    note: "pctOfTotal = (BPP + TKD + Pembiayaan) ÷ Total APBN Belanja Negara. This is the correct basis for 20% mandate compliance. TKD breakdown estimated from total minus BPP minus Pembiayaan.",
    constitutionalMandate20pct: "20% of total APBN Belanja Negara. Total education 2024: Rp 569.1T ÷ Rp 3,325.1T APBN = 17.1%. RAPBN 2026 projection: 20.9% (first time exceeding mandate).",
  },
};

const DATA_SOURCES = [
  // ── CATEGORY 1: Tests & Surveys ──
  {
    category: "tests",
    categoryLabel: { id: "Tes & Survei", en: "Tests & Surveys" },
    id: "pisa",
    name: "PISA",
    fullName: { id: "Programme for International Student Assessment", en: "Programme for International Student Assessment" },
    org: "OECD",
    orgFull: { id: "Organisasi Kerja Sama Ekonomi dan Pembangunan", en: "Organisation for Economic Co-operation and Development" },
    url: "https://www.oecd.org/pisa/",
    freq: { id: "3 tahunan", en: "Every 3 years" },
    lastUpdate: "2022",
    coverage: { id: "Nasional (sampel)", en: "National (sampled)" },
    description: {
      id: "Studi internasional yang mengukur kemampuan membaca, matematika, dan sains siswa usia 15 tahun. Indonesia berpartisipasi sejak 2000. Diselenggarakan setiap tiga tahun oleh OECD.",
      en: "International study measuring reading, mathematics, and science competencies of 15-year-olds. Indonesia has participated since 2000, administered every three years by the OECD.",
    },
    metrics: ["Literasi membaca / Reading literacy", "Literasi matematika / Math literacy", "Literasi sains / Science literacy", "Berpikir kreatif / Creative thinking"],
    logoType: "text",
    logoBg: "#003366",
    logoText: "PISA",
    logoSub: "OECD",
    accentColor: "#003366",
    badge: { id: "Internasional", en: "International" },
    badgeColor: "#7c3aed",
  },
  {
    category: "tests",
    id: "an",
    name: { id: "Asesmen Nasional", en: "National Assessment" },
    fullName: { id: "Asesmen Nasional (AN) — AKM, Survei Karakter & Sulingjar", en: "Asesmen Nasional (AN) — AKM, Character Survey & Sulingjar" },
    org: "Kemendikdasmen",
    orgFull: { id: "Kementerian Pendidikan Dasar dan Menengah", en: "Ministry of Basic and Secondary Education" },
    url: "https://raporpendidikan.kemendikdasmen.go.id/",
    freq: { id: "Tahunan", en: "Annual" },
    lastUpdate: "2023",
    coverage: { id: "Seluruh sekolah (sensus)", en: "All schools (census)" },
    description: {
      id: "Penilaian komprehensif seluruh sekolah di Indonesia, mencakup kemampuan literasi & numerasi (AKM), karakter siswa, dan kualitas lingkungan belajar (Sulingjar). Menggantikan UN sejak 2021.",
      en: "Comprehensive assessment of all schools in Indonesia covering literacy & numeracy (AKM), student character, and learning environment quality (Sulingjar). Replaced national exams since 2021.",
    },
    metrics: ["AKM Literasi", "AKM Numerasi", "Survei Karakter", "Sulingjar (learning environment)"],
    logoType: "text",
    logoBg: "#dc2626",
    logoText: "AN",
    logoSub: "KEMENDIKDASMEN",
    accentColor: "#dc2626",
    badge: { id: "Nasional · Sensus", en: "National · Census" },
    badgeColor: "#dc2626",
  },
  {
    category: "tests",
    id: "bps-susenas",
    name: { id: "Susenas BPS", en: "BPS Susenas" },
    fullName: { id: "Survei Sosial Ekonomi Nasional — Modul Pendidikan", en: "National Socioeconomic Survey — Education Module" },
    org: "BPS",
    orgFull: { id: "Badan Pusat Statistik", en: "Statistics Indonesia" },
    url: "https://www.bps.go.id/",
    freq: { id: "Tahunan", en: "Annual" },
    lastUpdate: "2024",
    coverage: { id: "Nasional (sampel rumah tangga)", en: "National (household sample)" },
    description: {
      id: "Survei rumah tangga tahunan BPS yang mencakup data pendidikan: partisipasi sekolah, angka putus sekolah, tingkat melek huruf, akses, dan pengeluaran pendidikan per kapita — disagregasi gender dan wilayah.",
      en: "Annual BPS household survey covering education data: school participation, dropout rates, literacy levels, access, and per-capita education expenditure — disaggregated by gender and region.",
    },
    metrics: ["Angka Partisipasi Sekolah (APS)", "Angka Melek Huruf (AMH)", "Rata-rata lama sekolah", "Pengeluaran rumah tangga untuk pendidikan"],
    logoType: "text",
    logoBg: "#1e40af",
    logoText: "BPS",
    logoSub: "SUSENAS",
    accentColor: "#1e40af",
    badge: { id: "Nasional", en: "National" },
    badgeColor: "#1e40af",
  },
  {
    category: "tests",
    id: "pirls",
    name: "PIRLS / TIMSS",
    fullName: { id: "Progress in International Reading Literacy Study / Trends in International Mathematics and Science Study", en: "Progress in International Reading Literacy Study / Trends in International Mathematics and Science Study" },
    org: "IEA",
    orgFull: { id: "International Association for the Evaluation of Educational Achievement", en: "International Association for the Evaluation of Educational Achievement" },
    url: "https://www.iea.nl/",
    freq: { id: "5 tahunan", en: "Every 5 years" },
    lastUpdate: "2023",
    coverage: { id: "Nasional (sampel, Kelas 4 & 8)", en: "National (sampled, Grade 4 & 8)" },
    description: {
      id: "Studi internasional yang mengukur kemampuan membaca (PIRLS) serta matematika dan sains (TIMSS) untuk siswa kelas 4 dan kelas 8. Indonesia berpartisipasi intermiten sejak 1999.",
      en: "International studies measuring reading (PIRLS) and math/science (TIMSS) for Grade 4 and Grade 8 students. Indonesia has participated intermittently since 1999.",
    },
    metrics: ["Literasi membaca (Kelas 4)", "Matematika (Kelas 8)", "Sains (Kelas 8)"],
    logoType: "text",
    logoBg: "#0f766e",
    logoText: "IEA",
    logoSub: "PIRLS/TIMSS",
    accentColor: "#0f766e",
    badge: { id: "Internasional", en: "International" },
    badgeColor: "#7c3aed",
  },

  // ── CATEGORY 2: Administrative & Financial ──
  {
    category: "admin",
    categoryLabel: { id: "Administratif & Keuangan", en: "Administrative & Financial" },
    id: "dapodik",
    name: "Dapodik",
    fullName: { id: "Data Pokok Pendidikan — Kemdikdasmen", en: "Core Education Data — Kemdikdasmen" },
    org: "Kemendikdasmen",
    orgFull: { id: "Kementerian Pendidikan Dasar dan Menengah", en: "Ministry of Basic and Secondary Education" },
    url: "https://dapo.kemendikdasmen.go.id/",
    freq: { id: "Semesteran", en: "Every semester" },
    lastUpdate: "2024",
    coverage: { id: "Seluruh sekolah negeri & swasta (PAUD–SMA/SMK/SLB)", en: "All public & private schools (PAUD–SMA/SMK/SLB)" },
    description: {
      id: "Sistem pendataan pokok pendidikan dari seluruh satuan pendidikan di Indonesia — sekolah, siswa, guru, rombongan belajar, ruang kelas, dan sarana prasarana. Basis utama perencanaan kebijakan Kemdikdasmen.",
      en: "Core education data system from all educational units in Indonesia — schools, students, teachers, learning groups, classrooms, and facilities. The primary basis for Kemdikdasmen policy planning.",
    },
    metrics: ["Jumlah sekolah & rombel", "Data siswa terdaftar", "Data guru & tendik", "Kondisi sarana prasarana", "Realisasi BOS"],
    logoType: "text",
    logoBg: "#b45309",
    logoText: "DAPO",
    logoSub: "DIK",
    accentColor: "#b45309",
    badge: { id: "Administratif", en: "Administrative" },
    badgeColor: "#b45309",
  },
  {
    category: "admin",
    id: "emis",
    name: "EMIS",
    fullName: { id: "Education Management Information System — Kementerian Agama", en: "Education Management Information System — Ministry of Religious Affairs" },
    org: "Kemenag",
    orgFull: { id: "Kementerian Agama", en: "Ministry of Religious Affairs" },
    url: "https://emis.kemenag.go.id/",
    freq: { id: "Semesteran", en: "Every semester" },
    lastUpdate: "2024",
    coverage: { id: "Madrasah & pesantren seluruh Indonesia", en: "All madrasah & pesantren nationwide" },
    description: {
      id: "Sistem informasi manajemen pendidikan Kemenag yang mencakup data madrasah (MI, MTs, MA, MAK), pesantren, dan pendidikan keagamaan. Paralel dengan Dapodik untuk sektor pendidikan berbasis agama.",
      en: "Kemenag's education management information system covering madrasah (MI, MTs, MA, MAK), pesantren, and religious education. The parallel system to Dapodik for faith-based education institutions.",
    },
    metrics: ["Jumlah madrasah & pesantren", "Data santri/siswa", "Data ustadz/guru madrasah", "Kondisi fasilitas ibadah & belajar"],
    logoType: "text",
    logoBg: "#166534",
    logoText: "EMIS",
    logoSub: "KEMENAG",
    accentColor: "#166534",
    badge: { id: "Administratif", en: "Administrative" },
    badgeColor: "#b45309",
  },
  {
    category: "admin",
    id: "apbn",
    name: { id: "APBN Kemenkeu", en: "State Budget (APBN)" },
    fullName: { id: "Anggaran Pendapatan dan Belanja Negara — Fungsi Pendidikan", en: "State Revenue & Expenditure Budget — Education Function" },
    org: "Kemenkeu",
    orgFull: { id: "Kementerian Keuangan", en: "Ministry of Finance" },
    url: "https://data-apbn.kemenkeu.go.id/",
    freq: { id: "Tahunan (realisasi kuartalan)", en: "Annual (quarterly realization)" },
    lastUpdate: "2024",
    coverage: { id: "Nasional — seluruh K/L fungsi pendidikan", en: "National — all ministries, education function" },
    description: {
      id: "Data anggaran dan realisasi belanja fungsi pendidikan dalam APBN — mencakup Kemdikdasmen, Kemenag, dan transfer daerah (DAK Pendidikan, BOS APBN). Dasar analisis pembiayaan pendidikan nasional.",
      en: "Budget and expenditure data for the education function in the national budget — covering Kemdikdasmen, Kemenag, and regional transfers (Education DAK, BOS APBN). Basis for national education financing analysis.",
    },
    metrics: ["Total anggaran fungsi pendidikan", "BOS Reguler & DAK Fisik", "Realisasi per K/L", "Tunjangan profesi guru (TPG)"],
    logoType: "text",
    logoBg: "#1d4ed8",
    logoText: "APBN",
    logoSub: "KEMENKEU",
    accentColor: "#1d4ed8",
    badge: { id: "Keuangan", en: "Financial" },
    badgeColor: "#1d4ed8",
  },
  {
    category: "admin",
    id: "nota_keuangan_2026",
    name: { id: "Nota Keuangan RAPBN 2026", en: "Nota Keuangan RAPBN 2026" },
    fullName: { id: "Nota Keuangan dan RAPBN TA 2026 — Buku II, Kementerian Keuangan", en: "Budget Notes and RAPBN 2026 — Book II, Ministry of Finance" },
    org: "Kemenkeu",
    orgFull: { id: "Kementerian Keuangan RI", en: "Ministry of Finance, Republic of Indonesia" },
    url: "https://media.kemenkeu.go.id/getmedia/0d55974c-45ad-48f4-8db3-3804b37d195e/Buku-II-Nota-Keuangan-RAPBN-TA-2026.pdf",
    freq: { id: "Tahunan (per RAPBN)", en: "Annual (per RAPBN)" },
    lastUpdate: "2025",
    coverage: { id: "Nasional — total anggaran pendidikan 2021–2026", en: "National — total education budget 2021–2026" },
    description: {
      id: "Dokumen resmi Nota Keuangan RAPBN TA 2026 Buku II yang memuat Grafik 3.5: Perkembangan Anggaran Pendidikan 2021–2026. Mencakup tiga saluran: BPP (pusat), TKD (transfer daerah), dan Pembiayaan. Digunakan sebagai dasar perhitungan mandat 20% APBN.",
      en: "Official RAPBN 2026 Budget Notes Book II containing Grafik 3.5: Education Budget Development 2021–2026. Covers three channels: BPP (central), TKD (regional transfers), and Pembiayaan. Basis for 20% APBN mandate compliance calculation.",
    },
    metrics: ["Total anggaran pendidikan (3 saluran)", "BPP — Belanja Pemerintah Pusat", "TKD — Transfer ke Daerah (DAK, BOS)", "Pembiayaan pendidikan", "Pertumbuhan anggaran YoY (%)"],
    logoType: "text",
    logoBg: "#1d4ed8",
    logoText: "NK",
    logoSub: "RAPBN 2026",
    accentColor: "#1d4ed8",
    badge: { id: "Dokumen Resmi", en: "Official Document" },
    badgeColor: "#1d4ed8",
    verificationStatus: "verified",
  },
  {
    name: { id: "APBD / SIKD", en: "Regional Budget (APBD)" },
    fullName: { id: "Anggaran Pendapatan dan Belanja Daerah — Sistem Informasi Keuangan Daerah", en: "Regional Government Budget — Regional Finance Information System" },
    org: "DJPK Kemenkeu",
    orgFull: { id: "Direktorat Jenderal Perimbangan Keuangan, Kemenkeu", en: "Directorate General of Fiscal Balance, Ministry of Finance" },
    url: "https://djpk.kemenkeu.go.id/portal/data/apbd",
    freq: { id: "Tahunan", en: "Annual" },
    lastUpdate: "2024",
    coverage: { id: "38 provinsi & 514 kab/kota", en: "38 provinces & 514 regencies/cities" },
    description: {
      id: "Data APBD dari 514 pemerintah daerah, termasuk belanja fungsi pendidikan tingkat kabupaten/kota dan provinsi. Basis analisis desentralisasi fiskal dan disparitas pembiayaan pendidikan antar daerah.",
      en: "APBD data from 514 regional governments, including education function spending at regency/city and provincial levels. Basis for fiscal decentralisation and inter-regional education financing disparity analysis.",
    },
    metrics: ["Belanja dinas pendidikan kab/kota", "Transfer BOS daerah", "Dana Alokasi Khusus (DAK) fisik", "Belanja pegawai guru daerah"],
    logoType: "text",
    logoBg: "#1e3a8a",
    logoText: "APBD",
    logoSub: "DJPK",
    accentColor: "#1e3a8a",
    badge: { id: "Keuangan", en: "Financial" },
    badgeColor: "#1d4ed8",
  },
  {
    category: "admin",
    id: "rapor",
    name: { id: "Rapor Pendidikan", en: "Rapor Pendidikan" },
    fullName: { id: "Rapor Pendidikan Indonesia — Portal Kemendikdasmen", en: "Indonesia Education Report Card — Kemendikdasmen Portal" },
    org: "Kemendikdasmen",
    orgFull: { id: "Kementerian Pendidikan Dasar dan Menengah", en: "Ministry of Basic and Secondary Education" },
    url: "https://raporpendidikan.kemendikdasmen.go.id/",
    freq: { id: "Tahunan", en: "Annual" },
    lastUpdate: "2024",
    coverage: { id: "Seluruh satuan pendidikan — Nasional, Provinsi, Kab/Kota", en: "All education units — National, Province, Regency/City" },
    description: {
      id: "Platform dashboard resmi yang mengintegrasikan data AN, Dapodik, BPS, dan lain-lain menjadi rapor komprehensif per sekolah dan wilayah. Dirilis pertama 2022, kini tersedia untuk publik umum.",
      en: "Official dashboard platform integrating AN, Dapodik, BPS, and other data into comprehensive report cards per school and region. First released in 2022, now publicly accessible.",
    },
    metrics: ["Capaian literasi & numerasi", "Iklim keamanan & kebinekaan sekolah", "Kualitas pembelajaran", "Angka partisipasi sekolah (APS)"],
    logoType: "text",
    logoBg: "#7c3aed",
    logoText: "RAPOR",
    logoSub: "PENDIDIKAN",
    accentColor: "#7c3aed",
    badge: { id: "Terintegrasi", en: "Integrated" },
    badgeColor: "#7c3aed",
  },

  // ── CATEGORY 3: Legal Frameworks ──
  {
    category: "legal",
    categoryLabel: { id: "Kerangka Hukum", en: "Legal Frameworks" },
    id: "uu-sisdiknas",
    name: { id: "UU Sisdiknas", en: "National Education System Act" },
    fullName: { id: "Undang-Undang No. 20 Tahun 2003 — Sistem Pendidikan Nasional", en: "Law No. 20 of 2003 — National Education System" },
    org: "DPR / Pemerintah",
    orgFull: { id: "Dewan Perwakilan Rakyat & Pemerintah RI", en: "House of Representatives & Government of Indonesia" },
    url: "https://jdih.kemdikbud.go.id/",
    freq: { id: "Legislatif (diubah sesuai kebutuhan)", en: "Legislative (amended as needed)" },
    lastUpdate: "2003",
    coverage: { id: "Nasional", en: "National" },
    description: {
      id: "Undang-undang pokok yang mengatur keseluruhan sistem pendidikan nasional: jalur, jenjang, jenis pendidikan, serta hak dan kewajiban warga negara dan negara dalam pendidikan. Dasar hukum seluruh kebijakan pendidikan.",
      en: "The foundational law governing the entire national education system: pathways, levels, types of education, and the rights and obligations of citizens and the state. The legal basis for all education policy.",
    },
    metrics: ["Wajib belajar 12 tahun", "Hak atas pendidikan", "Anggaran pendidikan 20% APBN/APBD", "Standar nasional pendidikan"],
    logoType: "icon",
    logoBg: "#064e3b",
    logoIcon: "⚖️",
    logoText: "UU 20/2003",
    accentColor: "#064e3b",
    badge: { id: "Undang-Undang", en: "National Act" },
    badgeColor: "#064e3b",
  },
  {
    category: "legal",
    id: "pp-standar",
    name: { id: "PP Standar Nasional Pendidikan", en: "Govt Regulation on National Education Standards" },
    fullName: { id: "Peraturan Pemerintah tentang Standar Nasional Pendidikan (SNP)", en: "Government Regulation on National Education Standards (SNP)" },
    org: "Pemerintah RI",
    orgFull: { id: "Presiden Republik Indonesia", en: "President of the Republic of Indonesia" },
    url: "https://jdih.kemdikbud.go.id/",
    freq: { id: "Legislatif", en: "Legislative" },
    lastUpdate: "2022",
    coverage: { id: "Nasional", en: "National" },
    description: {
      id: "Peraturan Pemerintah yang mengatur 8 standar nasional pendidikan: isi, proses, kompetensi lulusan, pendidik, sarana prasarana, pengelolaan, pembiayaan, dan penilaian. Terakhir diperbarui PP No. 57 Tahun 2021.",
      en: "Government regulation governing 8 national education standards: content, process, graduate competencies, educators, facilities, management, financing, and assessment. Last updated by PP No. 57 of 2021.",
    },
    metrics: ["8 Standar Nasional Pendidikan (SNP)", "Standar kompetensi lulusan", "Standar pendidik & tenaga kependidikan", "Standar pembiayaan"],
    logoType: "icon",
    logoBg: "#1e3a5f",
    logoIcon: "📋",
    logoText: "PP SNP",
    accentColor: "#1e3a5f",
    badge: { id: "Peraturan Pemerintah", en: "Govt. Regulation" },
    badgeColor: "#1e3a5f",
  },
  {
    category: "legal",
    id: "permen",
    name: { id: "Permendikdasmen / Permendikbudristek", en: "Ministerial Regulations" },
    fullName: { id: "Peraturan Menteri Pendidikan Dasar dan Menengah / Pendidikan, Kebudayaan, Riset, dan Teknologi", en: "Regulations of the Minister of Basic & Secondary Education / Education, Culture, Research & Technology" },
    org: "Kemdikdasmen / Kemdikbudristek",
    orgFull: { id: "Kementerian Pendidikan Dasar dan Menengah", en: "Ministry of Basic and Secondary Education" },
    url: "https://jdih.kemdikbud.go.id/",
    freq: { id: "Sesuai kebijakan", en: "As policy requires" },
    lastUpdate: "2024",
    coverage: { id: "Nasional", en: "National" },
    description: {
      id: "Peraturan teknis dari Menteri yang mengatur kurikulum, asesmen, sertifikasi guru, BOS, dan program strategis lainnya. Termasuk Permendikbudristek No. 16/2022 (Kurikulum Merdeka) dan aturan terkait PAUD–SMA.",
      en: "Technical ministerial regulations covering curriculum, assessment, teacher certification, school grants (BOS), and other strategic programs. Including Permendikbudristek No. 16/2022 (Kurikulum Merdeka).",
    },
    metrics: ["Kurikulum Merdeka (2022)", "Asesmen Nasional & Rapor Pendidikan", "BOS Reguler & Afirmasi", "Sertifikasi & tunjangan guru"],
    logoType: "icon",
    logoBg: "#7e1d1d",
    logoIcon: "📜",
    logoText: "PERMEN",
    accentColor: "#7e1d1d",
    badge: { id: "Peraturan Menteri", en: "Ministerial Reg." },
    badgeColor: "#7e1d1d",
  },
  {
    category: "legal",
    id: "jdih",
    name: "JDIH Kemdikdasmen",
    fullName: { id: "Jaringan Dokumentasi dan Informasi Hukum — Kemendikdasmen", en: "Legal Documentation & Information Network — Kemdikdasmen" },
    org: "Kemendikdasmen",
    orgFull: { id: "Kementerian Pendidikan Dasar dan Menengah", en: "Ministry of Basic and Secondary Education" },
    url: "https://jdih.kemdikbud.go.id/",
    freq: { id: "Berkelanjutan", en: "Ongoing" },
    lastUpdate: "2025",
    coverage: { id: "Nasional — seluruh produk hukum bidang pendidikan", en: "National — all legal products in education sector" },
    description: {
      id: "Repository resmi seluruh produk hukum bidang pendidikan: UU, PP, Perpres, Permen, SK, Pedoman, dan Juknis. Basis referensi hukum bagi seluruh pemangku kepentingan pendidikan Indonesia.",
      en: "Official repository of all legal products in education: Acts, Government Regulations, Presidential Regulations, Ministerial Decrees, Guidelines, and Technical Instructions. The legal reference base for all Indonesian education stakeholders.",
    },
    metrics: ["Undang-Undang pendidikan", "Peraturan Pemerintah (PP)", "Peraturan Menteri (Permen)", "Surat Keputusan & Juknis"],
    logoType: "icon",
    logoBg: "#374151",
    logoIcon: "🏛️",
    logoText: "JDIH",
    accentColor: "#374151",
    badge: { id: "Hukum", en: "Legal" },
    badgeColor: "#374151",
  },

  // ── CATEGORY 4: Official Statements & Reports ──
  {
    category: "reports",
    categoryLabel: { id: "Laporan & Pernyataan Resmi", en: "Official Reports & Statements" },
    id: "kpai",
    name: "KPAI",
    fullName: { id: "Komisi Perlindungan Anak Indonesia", en: "Indonesian Child Protection Commission" },
    org: "KPAI",
    orgFull: { id: "Komisi Perlindungan Anak Indonesia (Lembaga Independen)", en: "Indonesian Child Protection Commission (Independent Body)" },
    url: "https://www.kpai.go.id/",
    freq: { id: "Tahunan + insidental", en: "Annual + incident-based" },
    lastUpdate: "2024",
    coverage: { id: "Nasional", en: "National" },
    description: {
      id: "Laporan tahunan dan data pengaduan KPAI terkait kekerasan, perundungan, dan pelanggaran hak anak di sekolah. Sumber utama untuk analisis keamanan dan kesejahteraan siswa.",
      en: "KPAI's annual reports and complaint data on violence, bullying, and child rights violations in schools. Primary source for student safety and welfare analysis.",
    },
    metrics: ["Laporan kekerasan di sekolah", "Data perundungan (bullying)", "Pengaduan hak anak terkait pendidikan", "Rekomendasi kebijakan perlindungan anak"],
    logoType: "icon",
    logoBg: "#be123c",
    logoIcon: "🛡️",
    logoText: "KPAI",
    accentColor: "#be123c",
    badge: { id: "Lembaga Independen", en: "Independent Body" },
    badgeColor: "#be123c",
  },
  {
    category: "reports",
    id: "bappenas",
    name: "Bappenas",
    fullName: { id: "Kementerian Perencanaan Pembangunan Nasional / Badan Perencanaan Pembangunan Nasional", en: "National Development Planning Ministry / National Development Planning Agency" },
    org: "Bappenas",
    orgFull: { id: "Kementerian PPN/Bappenas", en: "Ministry of National Development Planning / Bappenas" },
    url: "https://www.bappenas.go.id/",
    freq: { id: "Tahunan (RPJMN, RKP, Laporan SDGs)", en: "Annual (RPJMN, RKP, SDGs Reports)" },
    lastUpdate: "2024",
    coverage: { id: "Nasional", en: "National" },
    description: {
      id: "Laporan capaian RPJMN bidang pendidikan, Laporan SDGs Indonesia (Goal 4: Quality Education), dan Rencana Kerja Pemerintah (RKP). Basis kebijakan jangka menengah dan evaluasi capaian pembangunan.",
      en: "Reports on RPJMN education achievements, Indonesia SDGs Reports (Goal 4: Quality Education), and the Government Work Plan (RKP). Basis for medium-term policy and development achievement evaluation.",
    },
    metrics: ["Capaian SDG 4 Indonesia", "Target RPJMN pendidikan", "APM SD/SMP/SMA", "Indeks Pembangunan Manusia (IPM) bidang pendidikan"],
    logoType: "text",
    logoBg: "#1e3a8a",
    logoText: "BAPPENAS",
    logoSub: "BAPPENAS",
    accentColor: "#1e3a8a",
    badge: { id: "Laporan Resmi", en: "Official Report" },
    badgeColor: "#1e3a8a",
  },
  {
    category: "reports",
    id: "worldbank",
    name: "World Bank",
    fullName: { id: "Bank Dunia — Laporan Pendidikan Indonesia", en: "World Bank — Indonesia Education Reports" },
    org: "World Bank",
    orgFull: { id: "Bank Dunia / World Bank Group", en: "World Bank Group" },
    url: "https://www.worldbank.org/en/country/indonesia/publication/education",
    freq: { id: "Periodik (laporan tematik)", en: "Periodic (thematic reports)" },
    lastUpdate: "2024",
    coverage: { id: "Nasional", en: "National" },
    description: {
      id: "Laporan analitik Bank Dunia tentang sistem pendidikan Indonesia — termasuk \"Indonesia Education Overview\", analisis pembiayaan, dan laporan pembelajaran pasca-pandemi. Digunakan sebagai referensi internasional.",
      en: "World Bank analytical reports on Indonesia's education system — including 'Indonesia Education Overview', financing analyses, and post-pandemic learning reports. Used as international reference material.",
    },
    metrics: ["Analisis kualitas pembelajaran", "Human Capital Index (HCI)", "Pembiayaan pendidikan per kapita", "Analisis ekuitas & akses"],
    logoType: "text",
    logoBg: "#003087",
    logoText: "WB",
    logoSub: "WORLD BANK",
    accentColor: "#003087",
    badge: { id: "Laporan Internasional", en: "International Report" },
    badgeColor: "#7c3aed",
  },
  {
    category: "reports",
    id: "unicef",
    name: "UNICEF Indonesia",
    fullName: { id: "United Nations Children's Fund — Indonesia Education Reports", en: "United Nations Children's Fund — Indonesia Education Reports" },
    org: "UNICEF",
    orgFull: { id: "United Nations Children's Fund", en: "United Nations Children's Fund" },
    url: "https://www.unicef.org/indonesia/education",
    freq: { id: "Periodik", en: "Periodic" },
    lastUpdate: "2024",
    coverage: { id: "Nasional, fokus daerah marginal", en: "National, focus on marginalised regions" },
    description: {
      id: "Laporan UNICEF tentang pendidikan anak Indonesia — cakupan PAUD, anak putus sekolah, kekerasan di sekolah, dan kondisi daerah 3T (terdepan, terluar, tertinggal). Perspektif hak anak dan inklusivitas.",
      en: "UNICEF reports on Indonesian children's education — ECCD coverage, out-of-school children, school violence, and conditions in remote/underserved regions (3T areas). Child rights and inclusion perspective.",
    },
    metrics: ["Anak tidak bersekolah (OOSC)", "Cakupan PAUD / ECCD", "Kekerasan & perlindungan anak di sekolah", "Akses pendidikan daerah 3T"],
    logoType: "text",
    logoBg: "#009edb",
    logoText: "UNICEF",
    logoSub: "UNICEF",
    accentColor: "#009edb",
    badge: { id: "Laporan Internasional", en: "International Report" },
    badgeColor: "#7c3aed",
  },
];

const CATEGORY_META = {
  tests: {
    label: { id: "Tes & Survei", en: "Tests & Surveys" },
    icon: "📊",
    desc: {
      id: "Data hasil penilaian dan survei yang mengukur capaian pembelajaran, kondisi sosial-ekonomi, dan faktor-faktor yang mempengaruhi kualitas pendidikan.",
      en: "Assessment and survey data measuring learning outcomes, socioeconomic conditions, and factors affecting education quality.",
    },
    color: "#0d6efd",
  },
  admin: {
    label: { id: "Administratif & Keuangan", en: "Administrative & Financial" },
    icon: "🗂️",
    desc: {
      id: "Data sistem pendataan pendidikan, profil sekolah, tenaga pendidik, dan anggaran dari pemerintah pusat hingga daerah.",
      en: "Education data systems, school profiles, teaching staff, and budgets from central to regional government.",
    },
    color: "#d97706",
  },
  legal: {
    label: { id: "Kerangka Hukum", en: "Legal Frameworks" },
    icon: "⚖️",
    desc: {
      id: "Undang-undang, peraturan pemerintah, peraturan menteri, dan pedoman resmi yang membentuk sistem pendidikan Indonesia.",
      en: "Acts, government regulations, ministerial regulations, and official guidelines that shape Indonesia's education system.",
    },
    color: "#064e3b",
  },
  reports: {
    label: { id: "Laporan & Pernyataan Resmi", en: "Official Reports & Statements" },
    icon: "📣",
    desc: {
      id: "Laporan analitik dan pernyataan resmi dari lembaga pemerintah, badan independen, dan organisasi internasional yang terpercaya.",
      en: "Analytical reports and official statements from government bodies, independent agencies, and credible international organisations.",
    },
    color: "#be123c",
  },
};

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

const STRINGS = {
  id: {
    platformSub: "Platform Pendidikan",
    civicNotice: "📊 Platform independen pemantauan data pendidikan Indonesia · Bukan afiliasi resmi pemerintah",
    betaBadge: "Beta v0.1",
    navHome: "Beranda",
    navSources: "Sumber Data",
    navAnalysis: "Analisis",
    navPublications: "Publikasi",
    navAbout: "Tentang",
    heroBadge: "Platform AI Aktif",
    heroTitle: "Pantau pendidikan Indonesia",
    heroTitleEm: "dengan data, bukan asumsi.",
    heroDesc: "Platform independen untuk memantau dan memahami data pendidikan Indonesia. Tanyakan apa pun dalam bahasa alami — sistem kami menganalisis data pendidikan dari PISA, Kementerian Pendidikan, asesmen nasional, dan berbagai sumber data terpercaya untuk memberikan jawaban berbasis bukti.",
    heroPlaceholder: 'Coba: "Provinsi mana yang memiliki tingkat melek huruf terendah?"',
    analyzeBtn: "Analisis →",
    analysisLabel: "Analisis AI — Pantau Pendidikan Intelligence",
    keyFindings: "Temuan Kunci",
    dataSource: "Sumber",
    downloadCSV: "↓ Unduh CSV",
    share: "🔗 Bagikan",
    popularAnalyses: "Analisis Populer",
    popularSub: "Klik untuk langsung menjalankan analisis berbasis data pendidikan publik Indonesia",
    filterAll: "Semua",
    whyTitle: "Mengapa Menggunakan Portal Ini?",
    whyCards: [
      { icon: "✅", color: "#16a34a", bg: "#dcfce7", title: "Berbasis Data Publik", desc: "Seluruh analisis mengacu pada data resmi yang dipublikasikan secara terbuka oleh lembaga pemerintah." },
      { icon: "🔗", color: "#0d6efd", bg: "#dbeafe", title: "Terintegrasi", desc: "Data dari BPS, Kemendikdasmen, KPAI, dan lembaga lain digabungkan dalam satu antarmuka yang mudah diakses." },
      { icon: "🔄", color: "#d97706", bg: "#fef3c7", title: "Terkini", desc: "Diperbarui secara berkala untuk mencerminkan kondisi nyata pendidikan di lapangan." },
      { icon: "🤖", color: "#7c3aed", bg: "#ede9fe", title: "Berbasis AI", desc: "Analisis natural language memudahkan siapa pun memahami data pendidikan tanpa keahlian teknis." },
    ],
    footerDesc: "Platform independen untuk memantau dan memahami data pendidikan Indonesia. Tidak berafiliasi dengan instansi pemerintah manapun.",
    footerNav: "Navigasi",
    footerNavLinks: ["Beranda", "Sumber Data", "Analisis Populer", "Publikasi", "Tentang Pantau Pendidikan"],
    footerSources: "Sumber Data Utama",
    copyright: "© 2025 Pantau Pendidikan · Platform independen · Bukan afiliasi resmi pemerintah",
    lightMode: "☀️ Mode Terang",
    darkMode: "🌙 Mode Gelap",
    langSwitch: "English",
    statsLabels: ["Kab / Kota", "Provinsi", "Sekolah", "Siswa", "Guru"],
    thinking: "Menganalisis data pendidikan...",
    errorMsg: "Terjadi kesalahan saat menganalisis. Silakan coba lagi.",
    // Data sources page
    sourcesTitle: "Sumber Data",
    sourcesTitleEm: "Landasan Faktual Platform Ini",
    sourcesDesc: "Pantau Pendidikan hanya menggunakan sumber data yang dapat diverifikasi secara publik. Semua analisis AI kami berakar pada dataset resmi berikut — beserta kerangka hukum dan laporan yang menginterpretasikannya.",
    sourcesCount: "sumber data terverifikasi",
    filterAllSources: "Semua Kategori",
    visitSource: "Kunjungi Sumber →",
    coverage: "Cakupan",
    frequency: "Frekuensi",
    lastUpdated: "Terakhir Diperbarui",
    dataPoints: "Indikator Tersedia",
    integrityTitle: "Komitmen Integritas Data",
    integrityDesc: "Kami hanya menggunakan data yang dapat diverifikasi secara publik. Ketika data tidak tersedia atau tidak pasti, kami mengatakannya dengan jelas — daripada mengisi celah dengan estimasi yang tidak dapat dipertanggungjawabkan.",
    integrityPoints: [
      "Setiap klaim data dalam analisis kami dilengkapi kutipan sumber yang spesifik",
      "Kami membedakan antara data sensus (AN, Dapodik) dan data sampel (PISA, Susenas)",
      "Keterbatasan data ditampilkan secara transparan dalam setiap hasil analisis",
      "Kami tidak menganalisis data yang sumbernya tidak dapat diverifikasi secara publik",
    ],
  },
  en: {
    platformSub: "Education Platform",
    civicNotice: "📊 Independent platform monitoring Indonesia's education data · Not affiliated with any government body",
    betaBadge: "Beta v0.1",
    navHome: "Home",
    navSources: "Data Sources",
    navAnalysis: "Analysis",
    navPublications: "Publications",
    navAbout: "About",
    heroBadge: "AI Platform Active",
    heroTitle: "Monitor Indonesia's education",
    heroTitleEm: "with data, not assumptions.",
    heroDesc: "An independent platform for monitoring and understanding Indonesia's education data. Ask anything in natural language — our system analyses education data from PISA, the Ministry of Education, national assessments, and a range of credible data sources to provide evidence-grounded answers.",
    heroPlaceholder: 'Try: "Which provinces have the lowest literacy rates?"',
    analyzeBtn: "Analyse →",
    analysisLabel: "AI Analysis — Pantau Pendidikan Intelligence",
    keyFindings: "Key Findings",
    dataSource: "Source",
    downloadCSV: "↓ Download CSV",
    share: "🔗 Share",
    popularAnalyses: "Popular Analyses",
    popularSub: "Click to run analyses based on Indonesia's public education data",
    filterAll: "All",
    whyTitle: "Why Use This Portal?",
    whyCards: [
      { icon: "✅", color: "#16a34a", bg: "#dcfce7", title: "Public Data Only", desc: "All analyses are grounded in official data published openly by government agencies." },
      { icon: "🔗", color: "#0d6efd", bg: "#dbeafe", title: "Integrated", desc: "Data from BPS, Kemendikdasmen, KPAI, and other agencies combined in one accessible interface." },
      { icon: "🔄", color: "#d97706", bg: "#fef3c7", title: "Up to Date", desc: "Updated regularly to reflect the real conditions of education on the ground." },
      { icon: "🤖", color: "#7c3aed", bg: "#ede9fe", title: "AI-Powered", desc: "Natural language analysis makes it easy for anyone to understand education data without technical expertise." },
    ],
    footerDesc: "An independent platform for monitoring and understanding Indonesia's education data. Not affiliated with any government agency.",
    footerNav: "Navigation",
    footerNavLinks: ["Home", "Data Sources", "Popular Analyses", "Publications", "About Pantau Pendidikan"],
    footerSources: "Key Data Sources",
    copyright: "© 2025 Pantau Pendidikan · Independent platform · Not affiliated with government",
    lightMode: "☀️ Light Mode",
    darkMode: "🌙 Dark Mode",
    langSwitch: "Bahasa",
    statsLabels: ["Regencies", "Provinces", "Schools", "Students", "Teachers"],
    thinking: "Analysing education data...",
    errorMsg: "An error occurred during analysis. Please try again.",
    // Data sources page
    sourcesTitle: "Data Sources",
    sourcesTitleEm: "The Factual Foundation of This Platform",
    sourcesDesc: "Pantau Pendidikan only uses publicly verifiable data sources. All our AI analyses are rooted in the official datasets below — along with the legal frameworks and reports that interpret them.",
    sourcesCount: "verified data sources",
    filterAllSources: "All Categories",
    visitSource: "Visit Source →",
    coverage: "Coverage",
    frequency: "Frequency",
    lastUpdated: "Last Updated",
    dataPoints: "Available Indicators",
    integrityTitle: "Data Integrity Commitment",
    integrityDesc: "We only use publicly verifiable data. When data is unavailable or uncertain, we say so clearly — rather than filling gaps with unaccountable estimates.",
    integrityPoints: [
      "Every data claim in our analyses includes a specific source citation",
      "We distinguish between census data (AN, Dapodik) and sampled data (PISA, Susenas)",
      "Data limitations are displayed transparently in every analysis result",
      "We do not analyse data whose source cannot be publicly verified",
    ],
  },
};

const SUGGESTED_QUERIES = {
  id: [
    { icon: "📈", category: "Anggaran", title: "Tren Belanja Pendidikan", query: "Bagaimana tren pengeluaran anggaran pendidikan Indonesia dari 2020 hingga 2024? Tampilkan dalam Triliun Rupiah dan persentase APBN.", dataSource: "verified" },
    { icon: "📊", category: "Kinerja", title: "Tren Skor PISA Indonesia", query: "Bagaimana tren skor PISA Indonesia dari 2000 hingga 2022?", dataSource: "verified" },
    { icon: "🏙️", category: "Kesenjangan", title: "Kesenjangan Kota vs Desa PISA", query: "Apa kesenjangan skor PISA antara siswa di perkotaan dan pedesaan Indonesia?", dataSource: "verified" },
    { icon: "🔗", category: "Korelasi", title: "Belanja vs Skor PISA", query: "Apa korelasi antara belanja pendidikan Indonesia dan skor PISA? Tampilkan tren belanja dan skor PISA dalam grafik yang sama.", dataSource: "verified" },
    { icon: "🗺️", category: "Kinerja", title: "Daerah dengan Nilai Terendah", query: "Apa 5 daerah yang paling berkinerja rendah berdasarkan skor asesmen nasional terbaru?", dataSource: "webSearch" },
    { icon: "🛡️", category: "Keamanan", title: "Zona Bullying Tertinggi", query: "Zona mana yang masih memiliki tingkat perundungan tertinggi di sekolah?", dataSource: "webSearch" },
    { icon: "👩‍🏫", category: "Guru", title: "Kesenjangan Sertifikasi Guru", query: "Provinsi mana yang memiliki tingkat guru bersertifikat paling rendah?", dataSource: "webSearch" },
    { icon: "📚", category: "Literasi", title: "Disparitas Tingkat Literasi", query: "Apa disparitas tingkat literasi di berbagai daerah Indonesia?", dataSource: "webSearch" },
  ],
  en: [
    { icon: "📈", category: "Budget", title: "Education Spending Trends", query: "What is the trend in Indonesia's education budget from 2020 to 2024? Show in Trillion IDR and as a percentage of total APBN.", dataSource: "verified" },
    { icon: "📊", category: "Performance", title: "Indonesia PISA Score Trend", query: "What is the trend of Indonesia PISA scores from 2000 to 2022?", dataSource: "verified" },
    { icon: "🏙️", category: "Equity", title: "Urban vs Rural PISA Gap", query: "What is the PISA score gap between urban and rural students in Indonesia?", dataSource: "verified" },
    { icon: "🔗", category: "Correlation", title: "Spending vs PISA Performance", query: "What is the correlation between Indonesia's education spending and PISA scores? Show both spending and PISA trends together in the same chart.", dataSource: "verified" },
    { icon: "🗺️", category: "Performance", title: "Lowest-Performing Regions", query: "Which are the top 5 underperforming regions based on the latest national assessment scores?", dataSource: "webSearch" },
    { icon: "🛡️", category: "Safety", title: "Highest Bullying Zones", query: "Which zones still have the highest reports of bullying in schools?", dataSource: "webSearch" },
    { icon: "👩‍🏫", category: "Teachers", title: "Teacher Certification Gap", query: "Which provinces have the lowest rates of certified teachers?", dataSource: "webSearch" },
    { icon: "📚", category: "Literacy", title: "Literacy Rate Disparities", query: "What are the literacy rate disparities across different regions of Indonesia?", dataSource: "webSearch" },
  ],
};

// ─── CHART COMPONENTS ────────────────────────────────────────────────────────

function BarChart({ data, unit, highlight, T }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value));
  const palette = highlight === "high"
    ? ["#0d6efd","#1a7fff","#3b8fff","#5aa3ff","#79b8ff","#98ccff","#b7e0ff","#d6f4ff","#e8f8ff","#f0fbff","#f8fdff","#ffffff"]
    : highlight === "low"
    ? ["#dc2626","#ef4444","#f87171","#fca5a5","#fecaca","#fee2e2","#fef2f2","#fff5f5","#fff8f8","#fffafa","#fffdfd","#ffffff"]
    : ["#0d6efd","#06b6d4","#7c3aed","#d97706","#16a34a","#dc2626","#0891b2","#9333ea","#ea580c","#15803d","#b91c1c","#0369a1"];
  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.9rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const color = palette[i % palette.length];
        const showInside = pct > 20;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.55rem" }}>
            <span style={{ width: "130px", fontSize: "0.74rem", color: T.textSub, textAlign: "right", flexShrink: 0, lineHeight: 1.3 }}>{d.label}</span>
            <div style={{ flex: 1, background: T.trackBg, borderRadius: "4px", overflow: "hidden", height: "28px", position: "relative" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: showInside ? "8px" : "0", transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)", minWidth: "4px" }}>
                {showInside && <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#fff", whiteSpace: "nowrap" }}>{d.value}</span>}
              </div>
              {!showInside && <span style={{ position: "absolute", left: `calc(${pct}% + 6px)`, top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", fontWeight: "700", color: T.text, whiteSpace: "nowrap" }}>{d.value}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ data, unit, T }) {
  if (!data || data.length < 2) return null;
  const W = 480, H = 180, padL = 44, padR = 16, padT = 20, padB = 30;
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const sx = i => padL + (i / (data.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / range) * (H - padT - padB);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.value)}`).join(" ");
  const fill = `${path} L${sx(data.length - 1)},${H - padB} L${sx(0)},${H - padB} Z`;
  // Smart grid: 4 evenly spaced Y values
  const gridStep = Math.pow(10, Math.floor(Math.log10(range / 4)));
  const grids = [];
  for (let v = Math.ceil(minV / gridStep) * gridStep; v <= maxV; v += gridStep) grids.push(v);
  const displayGrids = grids.filter((_, i) => i % Math.ceil(grids.length / 5) === 0).slice(0, 5);
  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        <defs>
          <linearGradient id="lcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0d6efd" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {displayGrids.map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 5} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}</text>
          </g>
        ))}
        <path d={fill} fill="url(#lcGrad)" />
        <path d={path} fill="none" stroke="#0d6efd" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={sx(i)} cy={sy(d.value)} r={4} fill="#0d6efd" stroke={T.surface} strokeWidth="2" />
            <text x={sx(i)} y={sy(d.value) - 10} textAnchor="middle" fill={T.text} fontSize="9.5" fontWeight="700" fontFamily="sans-serif">{d.value}</text>
            <text x={sx(i)} y={H - padB + 14} textAnchor="middle" fill={T.textMuted} fontSize="9" fontFamily="sans-serif">{d.label}</text>
          </g>
        ))}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Scatter / dual-axis chart for correlation questions
// chartData format: [{ label: "2022", x: spending_T, y: pisa_score }]
// OR dual series: [{ label: "2005", spending: 25.99, pisa: 380 }]
function ScatterChart({ data, unit, T }) {
  if (!data || data.length === 0) return null;

  // Support both {x,y} and {spending,pisa} schemas
  const pts = data.map(d => ({
    label: d.label,
    x: d.x ?? d.spending ?? d.value ?? 0,
    y: d.y ?? d.pisa ?? d.score ?? 0,
  })).filter(d => d.x && d.y);

  if (pts.length === 0) return null;

  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const minX = Math.min(...xs) * 0.9, maxX = Math.max(...xs) * 1.08;
  const minY = Math.min(...ys) - 15, maxY = Math.max(...ys) + 15;
  const W = 420, H = 200, padL = 44, padR = 20, padT = 16, padB = 36;

  const sx = x => padL + ((x - minX) / (maxX - minX)) * (W - padL - padR);
  const sy = y => padT + (1 - (y - minY) / (maxY - minY)) * (H - padT - padB);

  // Simple linear regression for trendline
  const n = pts.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const slope = pts.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0) /
                pts.reduce((s, p) => s + (p.x - meanX) ** 2, 0);
  const intercept = meanY - slope * meanX;
  const trendX1 = minX, trendX2 = maxX;
  const trendY1 = slope * trendX1 + intercept;
  const trendY2 = slope * trendX2 + intercept;

  // Y gridlines
  const yGridStep = Math.round((maxY - minY) / 4 / 5) * 5 || 10;
  const yGrids = [];
  for (let v = Math.ceil(minY / yGridStep) * yGridStep; v <= maxY; v += yGridStep) yGrids.push(v);

  const [unitLeft, unitRight] = unit ? unit.split("/").map(s => s.trim()) : ["Spending (T)", "PISA score"];

  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        {/* Grid */}
        {yGrids.map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}</text>
          </g>
        ))}
        {/* X axis labels */}
        {pts.filter((_, i) => i % Math.ceil(pts.length / 5) === 0 || i === pts.length - 1).map((p, i) => (
          <text key={i} x={sx(p.x)} y={H - padB + 13} textAnchor="middle" fontSize="8.5" fill={T.textMuted} fontFamily="sans-serif">{p.x}T</text>
        ))}
        {/* Axes */}
        <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke={T.border} strokeWidth="1" />
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
        {/* Trendline */}
        <line
          x1={sx(trendX1)} y1={sy(Math.max(minY, Math.min(maxY, trendY1)))}
          x2={sx(trendX2)} y2={sy(Math.max(minY, Math.min(maxY, trendY2)))}
          stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.7"
        />
        {/* Points */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill="#0d6efd" opacity="0.85" />
            <text x={sx(p.x)} y={sy(p.y) - 8} textAnchor="middle" fontSize="8.5" fill={T.textSub} fontFamily="sans-serif">{p.label}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem" }}>
        {[["#0d6efd", "●", "Data point"], ["#06b6d4", "╌", "Trendline"]].map(([c, sym, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.68rem", color: T.textSub }}>
            <span style={{ color: c }}>{sym}</span>{l}
          </span>
        ))}
      </div>
    </div>
  );
}

// Dual-axis line chart for showing two series with different scales
// chartData: [{ label: "2005", spending: 25.99, pisa: 380 }]
function DualAxisChart({ data, unit, T, size }) {
  if (!data || data.length === 0) return null;

  const pts = data.map(d => ({
    label: d.label,
    a: d.spending ?? d.budget ?? d.x ?? d.value ?? 0,
    b: d.pisa ?? d.score ?? d.y ?? d.reading ?? 0,
  })).filter(d => d.a > 0 && d.b > 0);

  if (pts.length < 2) return null;

  const as = pts.map(p => p.a), bs = pts.map(p => p.b);
  const minA = Math.min(...as) * 0.85, maxA = Math.max(...as) * 1.12;
  const minB = Math.min(...bs) - 15,   maxB = Math.max(...bs) + 15;

  const isLarge = size === "large";
  const W = isLarge ? 680 : 440;
  const H = isLarge ? 280 : 200;
  const padL = isLarge ? 56 : 48;
  const padR = isLarge ? 56 : 48;
  const padT = isLarge ? 16 : 14;
  const padB = isLarge ? 36 : 28;
  const ptR  = isLarge ? 6 : 5;
  const fTick = isLarge ? "10.5" : "8.5";
  const fVal  = isLarge ? "10" : "8";
  const fX    = isLarge ? "11" : "9";

  const sx  = i => padL + (i / (pts.length - 1)) * (W - padL - padR);
  const syA = v => padT + (1 - (v - minA) / (maxA - minA)) * (H - padT - padB);
  const syB = v => padT + (1 - (v - minB) / (maxB - minB)) * (H - padT - padB);

  const pathA = pts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(i)},${syA(p.a)}`).join(" ");
  const pathB = pts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(i)},${syB(p.b)}`).join(" ");

  const gridCount = 4;
  const aGrids = Array.from({ length: gridCount + 1 }, (_, i) => minA + (i / gridCount) * (maxA - minA));
  const bGrids = Array.from({ length: gridCount + 1 }, (_, i) => minB + (i / gridCount) * (maxB - minB));

  // Parse axis labels from unit string (format: "LabelA / LabelB") or use defaults
  const parts = unit ? unit.split("/").map(s => s.trim()) : [];
  const labelA = parts[0] || "Belanja Pendidikan";
  const labelB = parts[1] || "Skor PISA";
  const unitA  = "Triliun Rp";
  const unitB  = "Poin (skala 500)";

  return (
    <div>
      {/* Axis label pills — rendered as HTML above the chart for crisp legibility */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", gap: "0.5rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ width: "14px", height: "3px", background: "#d97706", borderRadius: "2px", display: "block", flexShrink: 0 }} />
          <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#d97706" }}>{labelA}</span>
          <span style={{ fontSize: "0.65rem", color: T.textMuted, background: T.trackBg, padding: "0.05rem 0.4rem", borderRadius: "4px", border: `1px solid ${T.border}` }}>{unitA}</span>
          <span style={{ fontSize: "0.65rem", color: "#d97706", fontWeight: "600" }}>← Kiri</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.65rem", color: "#0d6efd", fontWeight: "600" }}>Kanan →</span>
          <span style={{ fontSize: "0.65rem", color: T.textMuted, background: T.trackBg, padding: "0.05rem 0.4rem", borderRadius: "4px", border: `1px solid ${T.border}` }}>{unitB}</span>
          <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#0d6efd" }}>{labelB}</span>
          <span style={{ width: "14px", height: "3px", background: "#0d6efd", borderRadius: "2px", display: "block", flexShrink: 0 }} />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: `${W}px`, height: H, overflow: "visible", display: "block" }}>

          {/* Gridlines */}
          {aGrids.map((v, i) => (
            <line key={i} x1={padL} x2={W - padR} y1={syA(v)} y2={syA(v)}
              stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
          ))}

          {/* Left Y axis ticks — spending (amber) */}
          {aGrids.map((v, i) => (
            <text key={i} x={padL - 6} y={syA(v) + 3.5}
              textAnchor="end" fontSize={fTick} fill="#d97706" fontFamily="sans-serif" fontWeight="500">
              {v >= 1000 ? `${(v/1000).toFixed(1)}K` : v >= 100 ? `${Math.round(v)}T` : `${v.toFixed(0)}T`}
            </text>
          ))}

          {/* Right Y axis ticks — PISA (blue) */}
          {bGrids.map((v, i) => (
            <text key={i} x={W - padR + 6} y={syB(v) + 3.5}
              textAnchor="start" fontSize={fTick} fill="#0d6efd" fontFamily="sans-serif" fontWeight="500">
              {Math.round(v)}
            </text>
          ))}

          {/* Area fills */}
          <path d={pathA + ` L${sx(pts.length-1)},${H-padB} L${sx(0)},${H-padB} Z`} fill="#d97706" fillOpacity="0.07" />
          <path d={pathB + ` L${sx(pts.length-1)},${H-padB} L${sx(0)},${H-padB} Z`} fill="#0d6efd" fillOpacity="0.07" />

          {/* Lines */}
          <path d={pathA} fill="none" stroke="#d97706" strokeWidth={isLarge ? "2.8" : "2.5"} strokeLinejoin="round" strokeLinecap="round" />
          <path d={pathB} fill="none" stroke="#0d6efd" strokeWidth={isLarge ? "2.8" : "2.5"} strokeLinejoin="round" strokeLinecap="round" />

          {/* Data points + value labels (staggered above/below) */}
          {pts.map((p, i) => {
            const x = sx(i);
            const aAbove = i % 2 === 0;
            const bAbove = i % 2 === 1;
            const aValY = aAbove ? syA(p.a) - (ptR + 5) : syA(p.a) + (ptR + 12);
            const bValY = bAbove ? syB(p.b) - (ptR + 5) : syB(p.b) + (ptR + 12);
            const anchor = i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle";
            return (
              <g key={i}>
                <circle cx={x} cy={syA(p.a)} r={ptR} fill="#d97706" stroke={T.surface} strokeWidth="2" />
                <text x={x} y={aValY} textAnchor={anchor} fontSize={fVal} fontWeight="700" fill="#d97706" fontFamily="sans-serif">
                  {p.a >= 100 ? `${Math.round(p.a)}T` : `${p.a.toFixed(1)}T`}
                </text>
                <circle cx={x} cy={syB(p.b)} r={ptR} fill="#0d6efd" stroke={T.surface} strokeWidth="2" />
                <text x={x} y={bValY} textAnchor={anchor} fontSize={fVal} fontWeight="700" fill="#0d6efd" fontFamily="sans-serif">
                  {Math.round(p.b)}
                </text>
                <text x={x} y={H - padB + 14} textAnchor="middle" fontSize={fX} fill={T.text} fontWeight="600" fontFamily="sans-serif">
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1.5" />
          <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="#d97706" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1={W - padR} x2={W - padR} y1={padT} y2={H - padB} stroke="#0d6efd" strokeWidth="1.5" strokeOpacity="0.5" />
        </svg>
      </div>

      {/* Bottom unit annotation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.62rem", color: "#d97706" }}>
          ◀ Sumbu kiri: {labelA} ({unitA})
        </span>
        <span style={{ fontSize: "0.62rem", color: "#0d6efd" }}>
          Sumbu kanan: {labelB} ({unitB}) ▶
        </span>
      </div>
    </div>
  );
}

function ComparisonChart({ data, unit, T }) {
  const colors = { female: "#0d6efd", male: "#06b6d4" };
  const max = Math.max(...data.flatMap(d => [d.female, d.male]));
  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.75rem" }}>
        {[["female", "Perempuan / Female", colors.female], ["male", "Laki-laki / Male", colors.male]].map(([k, l, c]) => (
          <span key={k} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.74rem", color: T.textSub }}><span style={{ width: "10px", height: "10px", borderRadius: "2px", background: c, display: "block" }} />{l}</span>
        ))}
      </div>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.55rem" }}>
          <span style={{ width: "90px", fontSize: "0.76rem", color: T.textSub, textAlign: "right", flexShrink: 0 }}>{d.label}</span>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
            {[["female", colors.female, d.female], ["male", colors.male, d.male]].map(([k, c, v]) => (
              <div key={k} style={{ flex: 1, background: T.trackBg, borderRadius: "4px", height: "24px", overflow: "hidden" }}>
                <div style={{ width: `${(v / max) * 100}%`, height: "100%", background: c, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "6px" }}>
                  <span style={{ fontSize: "0.66rem", fontWeight: "700", color: "#fff" }}>{v}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TypingText({ text, onDone }) {
  const [i, setI] = useState(0);
  const timerRef = useRef();
  useEffect(() => { setI(0); }, [text]);
  useEffect(() => {
    if (i < text.length) {
      timerRef.current = setTimeout(() => setI(n => n + 1), 13);
    } else if (i > 0 && onDone) {
      onDone();
    }
    return () => clearTimeout(timerRef.current);
  }, [i, text]);
  return <span>{text.slice(0, i)}<span style={{ opacity: i < text.length ? 1 : 0 }}>▍</span></span>;
}

async function runAIQuery(question, lang) {
  // Serialise the real datasets into the prompt so Claude uses verified figures
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
Mandate compliance: ${TOTAL_SPENDING_DATA.meta.constitutionalMandate20pct}`.trim();

  const systemPrompt = lang === "en"
    ? `You are the AI analysis engine for Pantau Pendidikan, an independent platform monitoring Indonesia's education system.

IMPORTANT: Always respond entirely in English, regardless of what language the user's question is written in.

You have access to a web search tool. Use it to find current, credible data to supplement the verified datasets below.

VERIFIED DATASETS (always use these first for PISA and education spending):
${dataContext}

RESEARCH APPROACH — follow this order for every question:
1. Answer what you can from the VERIFIED DATASETS above (sourceType: "verified")
2. Use web_search to find supplementary data. Search ONLY these source types, in order of preference:
   TIER 1 — Official Indonesian government portals:
   - https://data.kemendikdasmen.go.id/data-induk (Kemendikdasmen official data)
   - https://npd.kemendikdasmen.go.id/ (Neraca Pendidikan Daerah)
   - https://raporpendidikan.kemendikdasmen.go.id/ (Rapor Pendidikan / AN)
   - https://bps.go.id/ (BPS Statistics Indonesia)
   - https://data-apbn.kemenkeu.go.id/ (Kemenkeu APBN data)
   - https://kpai.go.id/ (KPAI child protection)
   TIER 2 — Multilateral & INGO organisations:
   - https://www.oecd.org/pisa/ and https://data.oecd.org/ (OECD / PISA)
   - https://www.worldbank.org/en/country/indonesia (World Bank Indonesia)
   - https://www.unicef.org/indonesia/education (UNICEF Indonesia)
   - https://uis.unesco.org/ (UNESCO Institute for Statistics)
3. AVOID: news media, blogs, opinion sites, social media, aggregators. Only use official reports or peer-reviewed sources.
4. NEVER fabricate statistics. If data is genuinely unavailable from official sources, state that explicitly.

SPENDING RULE: For ANY spending finding, distinguish BPP-only (Dataset 2, central govt) from TOTAL (Dataset 3, all channels). Always state: Rupiah value, % of APBN, and % of GDP. For mandate compliance always use TOTAL figures. Example: "Total education budget 2024: Rp 569.1T (BPP Rp 197.2T + TKD ~Rp 347.9T), ~17.1% of APBN — below the 20% mandate." Source: Grafik 3.5, Nota Keuangan RAPBN 2026 Buku II (https://media.kemenkeu.go.id/getmedia/0d55974c-45ad-48f4-8db3-3804b37d195e/Buku-II-Nota-Keuangan-RAPBN-TA-2026.pdf)

Produce 4-6 insights covering BOTH verified data and web-sourced findings. Each insight must cite its source.

Respond ONLY with a JSON object (no markdown, no preamble):
{"headline":"one sharp sentence — max 12 words","summary":"2-3 sentence synthesis of verified + web findings","insights":[{"text":"specific finding with concrete data","sourceLabel":"e.g. PISA 2022 / Kemendikdasmen 2024","sourceType":"verified"|"web","sourceUrl":"https://exact-url-used"}],"chartType":"bar"|"line"|"comparison"|"scatter"|"dual_axis"|"none","chartData":[{"label":"...","value":number,"sourceType":"verified"|"web","sourceLabel":"source name"}],"unit":"chart axis label","highlight":"high"|"low"|"neutral"}

CHART RULES:
- ALWAYS try to produce a chart. Extract numeric values from percentages, counts, rankings, or rates found in any source.
- Each chartData point MUST include sourceType ("verified" if from PISA/APBN datasets, "web" if from web search) and sourceLabel (short source name).
- GEOGRAPHY RULE: If the question asks about zones, regions, provinces, islands, or geographic areas — chartData labels MUST be geographic names (e.g. "Jawa", "Sumatera", "Papua", "Kalimantan", "Urban", "Rural"). Do NOT use school levels (SD/SMP/SMA) as labels for geographic questions.
- SPENDING TREND queries (e.g. "trend in education spending", "tren belanja pendidikan"): use chartType "line" with chartData [{label: year, value: spending_in_T_Rp, sourceType, sourceLabel}]. Show spending values in Rp Triliun over time only. Do NOT include PISA data.
- CORRELATION queries (e.g. "correlation between spending and PISA", "korelasi belanja dan PISA"): use chartType "dual_axis" with chartData [{label: year, spending: value_in_T_Rp, pisa: score}]. Include BOTH spending AND PISA in the same dataset.
- "bar": categorical comparison — [{label, value, sourceType, sourceLabel}]
- "line": time series — [{label, value, sourceType, sourceLabel}]
- "comparison": two groups — [{label, female, male}]
- "scatter": correlation — [{label, x, y}]
- "dual_axis": two time series with different scales — [{label, spending, pisa}]
- Only use "none" if no numeric data of any kind is available anywhere in your research.`
    : `Anda adalah mesin analisis AI Pantau Pendidikan, platform independen pemantauan pendidikan Indonesia.

PENTING: Selalu jawab seluruhnya dalam Bahasa Indonesia, terlepas dari bahasa apa yang digunakan pengguna dalam pertanyaannya.

Anda memiliki akses ke alat pencarian web. Gunakan untuk menemukan data terkini dari sumber terpercaya guna melengkapi dataset terverifikasi di bawah ini.

DATASET TERVERIFIKASI (selalu gunakan lebih dahulu untuk PISA dan belanja pendidikan):
${dataContext}

PENDEKATAN RISET — ikuti urutan ini untuk setiap pertanyaan:
1. Jawab menggunakan DATASET TERVERIFIKASI di atas terlebih dahulu (sourceType: "verified")
2. Gunakan web_search hanya dari jenis sumber berikut, berurutan berdasarkan prioritas:
   TIER 1 — Portal resmi pemerintah Indonesia:
   - https://data.kemendikdasmen.go.id/data-induk (data resmi Kemendikdasmen)
   - https://npd.kemendikdasmen.go.id/ (Neraca Pendidikan Daerah)
   - https://raporpendidikan.kemendikdasmen.go.id/ (Rapor Pendidikan / AN)
   - https://bps.go.id/ (BPS Statistik Indonesia)
   - https://data-apbn.kemenkeu.go.id/ (data APBN Kemenkeu)
   - https://kpai.go.id/ (KPAI perlindungan anak)
   TIER 2 — Organisasi multilateral & INGO:
   - https://www.oecd.org/pisa/ dan https://data.oecd.org/ (OECD / PISA)
   - https://www.worldbank.org/en/country/indonesia (World Bank Indonesia)
   - https://www.unicef.org/indonesia/education (UNICEF Indonesia)
   - https://uis.unesco.org/ (UNESCO Institute for Statistics)
3. HINDARI: media berita, blog, opini, media sosial, agregator. Hanya gunakan laporan resmi atau sumber ilmiah.
4. JANGAN membuat statistik. Jika data tidak tersedia dari sumber resmi, nyatakan secara eksplisit.

ATURAN BELANJA: Untuk SETIAP temuan belanja, bedakan BPP saja (Dataset 2, pemerintah pusat) dari TOTAL (Dataset 3, semua saluran). Selalu sebutkan nilai Rupiah, % APBN, dan % PDB. Untuk kepatuhan mandat gunakan angka TOTAL. Contoh: "Total anggaran pendidikan 2024: Rp 569,1T (BPP Rp 197,2T + TKD ~Rp 347,9T), ~17,1% APBN — di bawah mandat 20%." Sumber: Grafik 3.5, Nota Keuangan RAPBN 2026 Buku II.

Hasilkan 4-6 temuan yang mencakup data terverifikasi DAN temuan berbasis web. Setiap temuan harus mencantumkan sumbernya.

Jawab HANYA dengan objek JSON (tanpa markdown, tanpa pembuka):
{"headline":"satu kalimat tajam — maks 12 kata","summary":"sintesis 2-3 kalimat dari data terverifikasi dan web","insights":[{"text":"temuan spesifik dengan data konkret","sourceLabel":"mis. PISA 2022 / Kemendikdasmen 2024","sourceType":"verified"|"web","sourceUrl":"https://url-yang-digunakan"}],"chartType":"bar"|"line"|"comparison"|"scatter"|"dual_axis"|"none","chartData":[{"label":"...","value":number,"sourceType":"verified"|"web","sourceLabel":"nama sumber"}],"unit":"label sumbu grafik","highlight":"high"|"low"|"neutral"}

ATURAN GRAFIK:
- SELALU coba buat grafik. Ekstrak nilai numerik dari persentase, jumlah, peringkat, atau angka apapun dari sumber yang ditemukan.
- Setiap titik chartData HARUS menyertakan sourceType ("verified" jika dari dataset PISA/APBN, "web" jika dari pencarian web) dan sourceLabel (nama sumber singkat).
- ATURAN GEOGRAFI: Jika pertanyaan tentang zona, wilayah, provinsi, pulau, atau area geografis — label chartData HARUS berupa nama geografis (mis. "Jawa", "Sumatera", "Papua", "Kalimantan", "Perkotaan", "Perdesaan"). JANGAN gunakan jenjang sekolah (SD/SMP/SMA) sebagai label untuk pertanyaan geografis.
- PERTANYAAN TREN BELANJA (mis. "tren belanja pendidikan", "pengeluaran pendidikan 5 tahun"): gunakan chartType "line" dengan chartData [{label: tahun, value: belanja_dalam_T_Rp, sourceType, sourceLabel}]. Tampilkan hanya data belanja dari waktu ke waktu. JANGAN sertakan data PISA.
- PERTANYAAN KORELASI (mis. "korelasi belanja dan PISA", "hubungan belanja dengan kinerja PISA"): gunakan chartType "dual_axis" dengan chartData [{label: tahun, spending: nilai_T_Rp, pisa: skor}]. Sertakan KEDUA data belanja DAN PISA dalam dataset yang sama.
- "bar": perbandingan kategorikal — [{label, value, sourceType, sourceLabel}]
- "line": deret waktu — [{label, value, sourceType, sourceLabel}]
- "comparison": dua kelompok — [{label, female, male}]
- "scatter": korelasi — [{label, x, y}]
- "dual_axis": dua deret waktu skala berbeda — [{label, spending, pisa}]
- Gunakan "none" HANYA jika tidak ada data numerik sama sekali dari semua sumber.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemPrompt,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: `${question}\n\nIMPORTANT: Respond ${lang === "en" ? "entirely in English" : "seluruhnya dalam Bahasa Indonesia"}. Your final response MUST be a single raw JSON object only — no preamble, no explanation, no markdown fences. Start your response with { and end with }.` }],
    }),
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  const data = await response.json();

  // Concatenate all text blocks (web_search produces text + tool_use + tool_result + text)
  const allText = data.content
    .filter(b => b.type === "text")
    .map(b => b.text || "")
    .join("");

  // Robustly extract the outermost JSON object — the model may wrap it in prose or markdown
  const extractJSON = (str) => {
    // Try: strip markdown fences first
    const stripped = str.replace(/^```json\s*/im, "").replace(/\s*```\s*$/im, "").trim();
    // Find the first { and its matching closing }
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
    throw new Error("Unterminated JSON object in response");
  };

  const jsonStr = extractJSON(allText);
  return JSON.parse(jsonStr);
}

// ─── SOURCE LOGO ─────────────────────────────────────────────────────────────

function SourceLogo({ source, size = 56 }) {
  const style = { width: size, height: size, borderRadius: "12px", background: source.logoBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" };
  if (source.logoType === "icon") {
    return (
      <div style={style}>
        <span style={{ fontSize: size * 0.42 }}>{source.logoIcon}</span>
      </div>
    );
  }
  return (
    <div style={style}>
      <span style={{ fontSize: size * 0.26, fontWeight: "800", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>{source.logoText}</span>
      {source.logoSub && <span style={{ fontSize: size * 0.13, fontWeight: "600", color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em", marginTop: "2px" }}>{source.logoSub}</span>}
    </div>
  );
}

// ─── DATA SOURCES PAGE ────────────────────────────────────────────────────────

function DataSourcesPage({ lang, T, dark }) {
  const S = STRINGS[lang];
  const [activeFilter, setActiveFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const categories = ["all", "tests", "admin", "legal", "reports"];
  const filtered = activeFilter === "all" ? DATA_SOURCES : DATA_SOURCES.filter(s => s.category === activeFilter);

  const catLabel = (cat) => {
    if (cat === "all") return S.filterAllSources || S.filterAll;
    return typeof CATEGORY_META[cat].label === "string" ? CATEGORY_META[cat].label : CATEGORY_META[cat].label[lang];
  };

  const txt = (v) => typeof v === "string" ? v : (v[lang] || v.id);

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Page Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderBottom: "1px solid #334155", padding: "3rem 1.5rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, #0d6efd, #06b6d4, #0d6efd)" }} />
        <div style={{ position: "absolute", top: "-100px", right: "-50px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(13,110,253,0.06)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(13,110,253,0.15)", border: "1px solid rgba(13,110,253,0.3)", borderRadius: "999px", padding: "0.2rem 0.8rem", marginBottom: "1.1rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#7dd3fc", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "700" }}>{S.sourcesCount.replace("sumber data terverifikasi", `${DATA_SOURCES.length} sumber data terverifikasi`).replace("verified data sources", `${DATA_SOURCES.length} verified data sources`)}</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "0.8rem" }}>
            {S.sourcesTitle} <span style={{ color: "#7dd3fc" }}>—</span><br />{S.sourcesTitleEm}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.72, maxWidth: "620px" }}>{S.sourcesDesc}</p>
        </div>
      </section>

      <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Data verification status banner */}
        <div style={{ marginBottom: "2rem", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", overflow: "hidden", boxShadow: T.shadow }}>
          <div style={{ background: dark ? "rgba(13,110,253,0.08)" : "#f0f9ff", borderBottom: `1px solid ${T.border}`, padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.85rem" }}>📋</span>
            <span style={{ fontSize: "0.72rem", fontWeight: "800", color: T.text, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {lang === "id" ? "Status Verifikasi Data Platform" : "Platform Data Verification Status"}
            </span>
          </div>
          <div style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {[
              { icon: "✅", color: "#16a34a", bg: dark ? "rgba(22,163,74,0.1)" : "#f0fdf4", border: "#bbf7d0",
                label: lang === "id" ? "Data Terunggah & Terverifikasi" : "Uploaded & Verified Data",
                items: lang === "id"
                  ? ["PISA Indonesia 2000–2022 (1.163 baris, Sheet1 + Sheet4)", "Belanja Pendidikan APBN 2005–2026 (Nota Keuangan Kemenkeu)"]
                  : ["PISA Indonesia 2000–2022 (1,163 rows, Sheet1 + Sheet4)", "APBN Education Spending 2005–2026 (Kemenkeu Nota Keuangan)"],
              },
              { icon: "🔄", color: "#0d6efd", bg: dark ? "rgba(13,110,253,0.08)" : "#eff6ff", border: "#bfdbfe",
                label: lang === "id" ? "Dalam Integrasi (Segera)" : "Integration in Progress (Soon)",
                items: lang === "id"
                  ? ["Asesmen Nasional / Rapor Pendidikan (Kemendikdasmen)", "Dapodik — profil sekolah & guru (Kemendikdasmen)"]
                  : ["Asesmen Nasional / Rapor Pendidikan (Kemendikdasmen)", "Dapodik — school & teacher profiles (Kemendikdasmen)"],
              },
              { icon: "🔍", color: "#d97706", bg: dark ? "rgba(217,119,6,0.08)" : "#fffbeb", border: "#fde68a",
                label: lang === "id" ? "Berbasis Web Search (Sementara)" : "Web Search Based (Temporary)",
                items: lang === "id"
                  ? ["BPS Susenas, EMIS, APBD, KPAI, Bappenas, World Bank, UNICEF — semua sumber ini akan segera diintegrasikan sebagai dataset terverifikasi"]
                  : ["BPS Susenas, EMIS, APBD, KPAI, Bappenas, World Bank, UNICEF — all these sources will soon be integrated as verified datasets"],
              },
            ].map((col, i) => (
              <div key={i} style={{ background: col.bg, border: `1px solid ${col.border}`, borderRadius: "8px", padding: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <span>{col.icon}</span>
                  <span style={{ fontSize: "0.72rem", fontWeight: "700", color: col.color }}>{col.label}</span>
                </div>
                {col.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem" }}>
                    <span style={{ color: col.color, fontSize: "0.65rem", marginTop: "2px", flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: "0.72rem", color: T.textSub, lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Category filter tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {categories.map(cat => {
            const active = activeFilter === cat;
            const meta = cat !== "all" ? CATEGORY_META[cat] : null;
            return (
              <button key={cat} onClick={() => setActiveFilter(cat)} style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                background: active ? (meta?.color || "#0d6efd") : T.surface,
                border: `1px solid ${active ? (meta?.color || "#0d6efd") : T.border}`,
                color: active ? "#fff" : T.textSub,
                fontSize: "0.78rem", fontWeight: "600", padding: "0.45rem 1rem", borderRadius: "999px",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}>
                {meta && <span>{meta.icon}</span>}
                {catLabel(cat)}
                <span style={{ fontSize: "0.65rem", background: active ? "rgba(255,255,255,0.2)" : T.blueSub, padding: "0.05rem 0.4rem", borderRadius: "999px" }}>
                  {cat === "all" ? DATA_SOURCES.length : DATA_SOURCES.filter(s => s.category === cat).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category sections */}
        {(activeFilter === "all" ? ["tests", "admin", "legal", "reports"] : [activeFilter]).map(cat => {
          const meta = CATEGORY_META[cat];
          const sources = DATA_SOURCES.filter(s => s.category === cat);
          if (sources.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: "3rem" }}>
              {/* Category header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", paddingBottom: "0.85rem", borderBottom: `2px solid ${meta.color}22` }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${meta.color}18`, border: `1px solid ${meta.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>{meta.icon}</div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "800", color: T.text, margin: 0 }}>{txt(meta.label)}</h2>
                  <p style={{ fontSize: "0.76rem", color: T.textSub, margin: 0, marginTop: "2px" }}>{meta.desc[lang]}</p>
                </div>
              </div>

              {/* Source cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
                {sources.map(source => {
                  const isExpanded = expanded === source.id;
                  return (
                    <div key={source.id} style={{
                      background: T.surface, border: `1px solid ${isExpanded ? source.accentColor + "66" : T.border}`,
                      borderRadius: "12px", overflow: "hidden", boxShadow: isExpanded ? `0 4px 20px ${source.accentColor}22` : T.shadow,
                      transition: "all 0.2s", cursor: "pointer",
                    }} onClick={() => setExpanded(isExpanded ? null : source.id)}>

                      {/* Top accent bar */}
                      <div style={{ height: "3px", background: `linear-gradient(90deg, ${source.accentColor}, ${source.accentColor}88)` }} />

                      {/* Card header */}
                      <div style={{ padding: "1.1rem 1.2rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                        <SourceLogo source={source} size={52} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.3rem" }}>
                            <div>
                              <span style={{ fontSize: "1rem", fontWeight: "800", color: T.text }}>{txt(source.name)}</span>
                              <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: "700", background: `${source.badgeColor}18`, color: source.badgeColor, border: `1px solid ${source.badgeColor}44`, borderRadius: "4px", padding: "0.1rem 0.45rem", marginLeft: "0.5rem", verticalAlign: "middle" }}>
                                {txt(source.badge)}
                              </span>
                            </div>
                            <span style={{ fontSize: "0.75rem", color: T.textMuted, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                          </div>
                          <p style={{ fontSize: "0.75rem", color: T.textSub, margin: 0, lineHeight: 1.4 }}>{txt(source.fullName)}</p>
                          <p style={{ fontSize: "0.72rem", color: source.accentColor, fontWeight: "600", margin: "0.25rem 0 0" }}>{source.org}</p>
                        </div>
                      </div>

                      {/* Meta strip */}
                      <div style={{ display: "flex", borderTop: `1px solid ${T.border}`, background: T.surfaceAlt }}>
                        {[
                          [S.frequency, txt(source.freq)],
                          [S.lastUpdated, source.lastUpdate],
                          [S.coverage, txt(source.coverage)],
                        ].map(([label, val]) => (
                          <div key={label} style={{ flex: 1, padding: "0.5rem 0.75rem", borderRight: `1px solid ${T.border}`, lastChild: "border-right: none" }}>
                            <div style={{ fontSize: "0.58rem", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: "600" }}>{label}</div>
                            <div style={{ fontSize: "0.74rem", color: T.text, fontWeight: "600", marginTop: "1px" }}>{val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Expandable detail */}
                      {isExpanded && (
                        <div style={{ padding: "1.1rem 1.2rem", borderTop: `1px solid ${T.border}`, animation: "fadeUp 0.2s ease both" }}>
                          <p style={{ fontSize: "0.82rem", color: T.textSub, lineHeight: 1.7, marginBottom: "1rem" }}>{source.description[lang]}</p>
                          
                          <div style={{ marginBottom: "1rem" }}>
                            <p style={{ fontSize: "0.62rem", fontWeight: "700", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "0.6rem" }}>{S.dataPoints}</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                              {source.metrics.map(m => (
                                <span key={m} style={{ fontSize: "0.7rem", color: source.accentColor, background: `${source.accentColor}12`, border: `1px solid ${source.accentColor}30`, padding: "0.18rem 0.55rem", borderRadius: "4px", fontWeight: "500" }}>{m}</span>
                              ))}
                            </div>
                          </div>

                          <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.76rem", fontWeight: "700", color: source.accentColor, textDecoration: "none", background: `${source.accentColor}12`, border: `1px solid ${source.accentColor}44`, padding: "0.38rem 0.85rem", borderRadius: "6px" }}
                            onClick={e => e.stopPropagation()}>
                            {S.visitSource}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Integrity commitment box */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "1.75rem 2rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(16,163,74,0.12)", border: "1px solid rgba(16,163,74,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>🔒</div>
            <div style={{ flex: 1, minWidth: "240px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: T.text, marginBottom: "0.3rem" }}>{S.integrityTitle}</h3>
              <p style={{ fontSize: "0.8rem", color: T.textSub, lineHeight: 1.65, marginBottom: "0.85rem" }}>{S.integrityDesc}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.5rem" }}>
                {S.integrityPoints.map((pt, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.55rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#16a34a", fontWeight: "700", flexShrink: 0, marginTop: "1px" }}>✓</span>
                    <span style={{ fontSize: "0.78rem", color: T.textSub, lineHeight: 1.5 }}>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INSIGHTS LIST with inline micro-charts ──────────────────────────────────

// Maps keywords in insight text to a specific PISA_DATA slice + chart config
function resolveInsightChart(text) {
  const t = text.toLowerCase();

  // Proficiency level trend — "level 2", "basic proficiency", "proficient"
  if ((t.includes("level 2") || t.includes("basic proficiency") || t.includes("proficient")) && (t.includes("reading") || t.includes("membaca") || t.includes("%"))) {
    return {
      type: "bar",
      title: "% Students ≥ Level 2 — Reading",
      data: Object.entries(PISA_DATA.pctLevel2)
        .filter(([,d]) => d.reading !== null)
        .map(([y,d]) => ({ label: y, value: d.reading })),
      unit: "% reaching basic proficiency (L2+)",
      color: "#0d6efd",
      highlight: (v, max) => v === max ? "high" : v < 30 ? "low" : "neutral",
    };
  }
  if ((t.includes("level 2") || t.includes("basic proficiency") || t.includes("proficient")) && (t.includes("math") || t.includes("matemat"))) {
    return {
      type: "bar",
      title: "% Students ≥ Level 2 — Mathematics",
      data: Object.entries(PISA_DATA.pctLevel2)
        .filter(([,d]) => d.math !== null)
        .map(([y,d]) => ({ label: y, value: d.math })),
      unit: "% reaching basic proficiency (L2+)",
      color: "#7c3aed",
      highlight: (v, max) => v === max ? "high" : v < 25 ? "low" : "neutral",
    };
  }

  // Mean score trend
  if (t.includes("score") || t.includes("skor") || t.includes("mean") || t.includes("rata-rata")) {
    const domain = t.includes("math") || t.includes("matemat") ? "math"
      : t.includes("science") || t.includes("sains") ? "science" : "reading";
    const colors = { reading: "#0d6efd", math: "#7c3aed", science: "#16a34a" };
    const domainLabel = { reading: "Reading", math: "Mathematics", science: "Science" };
    return {
      type: "line",
      title: `National Mean Score — ${domainLabel[domain]}`,
      data: Object.entries(PISA_DATA.national)
        .filter(([,d]) => d[domain] !== null)
        .map(([y,d]) => ({ label: y, value: d[domain] })),
      unit: "PISA mean scale score",
      color: colors[domain],
    };
  }

  // Urban-rural / location gap
  if (t.includes("urban") || t.includes("rural") || t.includes("village") || t.includes("city") || t.includes("kota") || t.includes("desa") || t.includes("gap") || t.includes("kesenjangan")) {
    const latest = Object.entries(PISA_DATA.byLocation).sort(([a],[b]) => b-a)[0];
    const [yr, locs] = latest;
    return {
      type: "bar",
      title: `Reading Score by Location — ${yr}`,
      data: [
        { label: "Village / Desa", value: locs.village },
        { label: "Town / Kota Kecil", value: locs.town },
        { label: "City / Kota", value: locs.city },
      ],
      unit: "PISA mean reading score",
      color: "#f59e0b",
      highlight: (v, max) => v === max ? "high" : v === Math.min(locs.village, locs.town, locs.city) ? "low" : "neutral",
    };
  }

  // Negeri vs Swasta / public vs private
  if (t.includes("negeri") || t.includes("swasta") || t.includes("public") || t.includes("private") || t.includes("state school")) {
    return {
      type: "line",
      title: "Public vs Private Schools — Reading (National Mean)",
      data: Object.entries(PISA_DATA.byOwnership).map(([y,d]) => [
        { label: `${y} Negeri`, value: d.negeri, group: "negeri" },
        { label: `${y} Swasta`, value: d.swasta, group: "swasta" },
      ]).flat(),
      unit: "PISA mean reading score",
      color: "#06b6d4",
      dual: true,
      negeriData: Object.entries(PISA_DATA.byOwnership).map(([y,d]) => ({ label: y, value: d.negeri })),
      swastaData: Object.entries(PISA_DATA.byOwnership).map(([y,d]) => ({ label: y, value: d.swasta })),
    };
  }

  // Coverage / participation
  if (t.includes("coverage") || t.includes("cakupan") || t.includes("participation") || t.includes("partisipasi")) {
    return {
      type: "bar",
      title: "PISA Coverage Index (% of 15-year-olds enrolled)",
      data: Object.entries(PISA_DATA.coverageIndex).map(([y,v]) => ({ label: y, value: Math.round(v * 100) })),
      unit: "% of 15-year-old population in school",
      color: "#16a34a",
      highlight: (v, max) => v === max ? "high" : "neutral",
    };
  }

  // Level 4 / high performers
  if (t.includes("level 4") || t.includes("high perform") || t.includes("top")) {
    return {
      type: "bar",
      title: "% Students ≥ Level 4 — Reading (High Performers)",
      data: Object.entries(PISA_DATA.pctLevel4)
        .filter(([,d]) => d.reading !== null)
        .map(([y,d]) => ({ label: y, value: d.reading })),
      unit: "% at Level 4+ (advanced proficiency)",
      color: "#d97706",
    };
  }

  // Spending / budget
  if (t.includes("spend") || t.includes("belanja") || t.includes("budget") || t.includes("anggaran") || t.includes("trillion") || t.includes("triliun")) {
    return {
      type: "line",
      title: "Education Function Spending 2005–2024",
      data: SPENDING_DATA.series.filter(d => d.status !== "RAPBN" && d.status !== "outlook" || d.year <= 2024)
        .map(d => ({ label: d.year, value: d.valueT })),
      unit: "Central govt education spending (Trillion Rp)",
      color: "#d97706",
    };
  }

  return null;
}

// Compact inline bar chart for insight micro-charts
function MicroBarChart({ data, unit, color, highlightFn, T }) {
  const vals = data.map(d => d.value);
  const max = Math.max(...vals);
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <p style={{ fontSize: "0.62rem", fontWeight: "700", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{unit}</p>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const hl = highlightFn ? highlightFn(d.value, max) : "neutral";
        const barColor = hl === "high" ? "#16a34a" : hl === "low" ? "#dc2626" : color;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "0.68rem", color: T.textMuted, width: "52px", textAlign: "right", flexShrink: 0 }}>{d.label}</span>
            <div style={{ flex: 1, background: T.surfaceAlt, borderRadius: "3px", overflow: "hidden", height: "16px", position: "relative" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: "3px", transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: "0.72rem", fontWeight: "700", color: hl === "low" ? "#dc2626" : hl === "high" ? "#16a34a" : T.text, width: "38px", flexShrink: 0 }}>
              {typeof d.value === "number" && d.value < 10 ? d.value.toFixed(1) : Math.round(d.value)}{unit.includes("%") ? "%" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Compact inline line chart for insight micro-charts
function MicroLineChart({ data, unit, color, T }) {
  if (data.length < 2) return null;
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals) - 8, maxV = Math.max(...vals) + 8;
  const W = 320, H = 80, padL = 32, padR = 8, padT = 12, padB = 20;
  const sx = i => padL + (i / (data.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.value)}`).join(" ");
  const fill = path + ` L${sx(data.length - 1)},${H - padB} L${sx(0)},${H - padB} Z`;
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <p style={{ fontSize: "0.62rem", fontWeight: "700", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>{unit}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        <defs>
          <linearGradient id={`mg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={fill} fill={`url(#mg-${color.replace("#","")})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={sx(i)} cy={sy(d.value)} r={3} fill={color} />
            <text x={sx(i)} y={H - 4} textAnchor="middle" fontSize="8" fill={T.textMuted} fontFamily="sans-serif">{d.label}</text>
            {(i === 0 || i === data.length - 1) && (
              <text x={sx(i)} y={sy(d.value) - 6} textAnchor={i === 0 ? "start" : "end"} fontSize="8.5" fontWeight="700" fill={T.text} fontFamily="sans-serif">{Math.round(d.value)}</text>
            )}
          </g>
        ))}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
    </div>
  );
}

// Dual-line micro chart for Negeri vs Swasta
function MicroDualLineChart({ negeriData, swastaData, unit, T }) {
  if (!negeriData || negeriData.length < 2) return null;
  const allVals = [...negeriData, ...swastaData].map(d => d.value);
  const minV = Math.min(...allVals) - 8, maxV = Math.max(...allVals) + 8;
  const W = 320, H = 80, padL = 32, padR = 8, padT = 12, padB = 20;
  const sx = i => padL + (i / (negeriData.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const pathN = negeriData.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.value)}`).join(" ");
  const pathS = swastaData.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.value)}`).join(" ");
  return (
    <div style={{ marginTop: "0.75rem" }}>
      <p style={{ fontSize: "0.62rem", fontWeight: "700", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>{unit}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        <path d={pathN} fill="none" stroke="#0d6efd" strokeWidth="2" strokeLinejoin="round" />
        <path d={pathS} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4,3" />
        {negeriData.map((d, i) => (
          <text key={i} x={sx(i)} y={H - 4} textAnchor="middle" fontSize="8" fill={T.textMuted} fontFamily="sans-serif">{d.label}</text>
        ))}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.3rem" }}>
        {[["#0d6efd", "━", "Negeri (Public)"], ["#f59e0b", "╌", "Swasta (Private)"]].map(([c, s, l]) => (
          <span key={l} style={{ fontSize: "0.65rem", color: T.textSub, display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: c }}>{s}</span>{l}
          </span>
        ))}
      </div>
    </div>
  );
}

function InsightsList({ insights, lang, T }) {
  const label = lang === "id" ? "Temuan Kunci" : "Key Findings";
  return (
    <>
      <p style={{ fontSize: "0.62rem", fontWeight: "700", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "0.75rem" }}>{label}</p>
      {insights.map((ins, i) => {
        const text = typeof ins === "string" ? ins : ins.text;
        const sourceLabel = typeof ins === "object" ? ins.sourceLabel : null;
        const sourceType = typeof ins === "object" ? ins.sourceType : null;
        const sourceUrl = typeof ins === "object" && ins.sourceUrl && ins.sourceUrl !== "null" && ins.sourceUrl !== null ? ins.sourceUrl : null;
        const isVerified = sourceType === "verified";
        return (
          <div key={i} style={{ display: "flex", gap: "0.65rem", marginBottom: "1rem", animation: `fadeUp 0.4s ease ${0.1 + i * 0.07}s both` }}>
            <span style={{ width: "5px", minWidth: "5px", height: "5px", borderRadius: "50%", background: isVerified ? "#16a34a" : T.blue, marginTop: "0.45rem", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.8rem", color: T.textSub, lineHeight: 1.65 }}>{text}</span>
              {sourceLabel && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.35rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.6rem", fontWeight: "700", padding: "0.12rem 0.45rem", borderRadius: "4px",
                    background: isVerified ? "#dcfce7" : "#fef3c7",
                    color: isVerified ? "#15803d" : "#92400e",
                    border: `1px solid ${isVerified ? "#bbf7d0" : "#fde68a"}`,
                    display: "inline-flex", alignItems: "center", gap: "3px",
                  }}>
                    {isVerified ? "✓" : "🔍"} {sourceLabel}
                  </span>
                  {sourceUrl && (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "0.6rem", fontWeight: "700", color: T.blue,
                        textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "2px",
                        background: "rgba(13,110,253,0.08)", border: "1px solid rgba(13,110,253,0.2)",
                        padding: "0.12rem 0.45rem", borderRadius: "4px",
                      }}
                    >
                      {lang === "id" ? "Lihat Sumber ↗" : "View Source ↗"}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ─── PISA DEEP DIVE PANEL ─────────────────────────────────────────────────────

// ── PISA sub-view components (hoisted to top level — no re-definition on parent render) ──

function PisaProficiencyView({ domain, color, labels, T }) {
  const years = [2000, 2003, 2006, 2009, 2012, 2015, 2018, 2022];
  const data = years.map(y => ({
    year: y,
    l2: PISA_DATA.pctLevel2[y]?.[domain] ?? null,
    l4: PISA_DATA.pctLevel4[y]?.[domain] ?? null,
  })).filter(d => d.l2 !== null);
  const maxL2 = Math.max(...data.map(d => d.l2));
  const W = 540, H = 200, padL = 44, padR = 16, padT = 14, padB = 26;
  const barW = Math.floor((W - padL - padR) / data.length) - 8;
  const sx = i => padL + i * ((W - padL - padR) / data.length) + (((W - padL - padR) / data.length) - barW) / 2;
  const sy = v => padT + (1 - v / 55) * (H - padT - padB);
  return (
    <div>
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        {[[color, labels.l2label], ["#94a3b8", labels.l4label]].map(([c, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.71rem", color: T.textSub }}>
            <span style={{ width: "12px", height: "12px", background: c, borderRadius: "2px", display: "block" }} />{l}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        {[10, 20, 30, 40, 50].map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}%</text>
          </g>
        ))}
        {data.map((d, i) => {
          const l2H = (d.l2 / 55) * (H - padT - padB);
          const l4H = d.l4 ? (d.l4 / 55) * (H - padT - padB) : 0;
          const isLatest = d.year === 2022;
          const isPeak = d.l2 === maxL2;
          return (
            <g key={i}>
              <rect x={sx(i)} y={H - padB - l2H} width={barW} height={l2H}
                fill={isLatest ? (d.l2 < 30 ? "#dc2626" : color) : color}
                opacity={isLatest ? 1 : 0.55} rx="2" />
              {d.l4 > 0 && <rect x={sx(i) + barW * 0.2} y={H - padB - l4H} width={barW * 0.6} height={l4H} fill="#fff" opacity="0.35" rx="1" />}
              <text x={sx(i) + barW / 2} y={H - padB - l2H - 4} textAnchor="middle" fontSize="8.5" fontWeight={isLatest ? "800" : "600"} fill={isLatest ? (d.l2 < 30 ? "#dc2626" : T.text) : T.textMuted} fontFamily="sans-serif">{d.l2.toFixed(1)}%</text>
              {isPeak && <text x={sx(i) + barW / 2} y={H - padB - l2H - 14} textAnchor="middle" fontSize="7.5" fill="#16a34a" fontFamily="sans-serif">▲ peak</text>}
              <text x={sx(i) + barW / 2} y={H - padB + 13} textAnchor="middle" fontSize="9" fill={isLatest ? T.text : T.textMuted} fontWeight={isLatest ? "700" : "400"} fontFamily="sans-serif">{d.year}</text>
            </g>
          );
        })}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
    </div>
  );
}

function PisaTrendView({ domain, color, labels, T }) {
  const years = [2000, 2003, 2006, 2009, 2012, 2015, 2018, 2022];
  const data = years.map(y => ({ year: y, value: PISA_DATA.national[y]?.[domain] })).filter(d => d.value);
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals) - 12, maxV = Math.max(...vals) + 12;
  const W = 540, H = 180, padL = 44, padR = 16, padT = 14, padB = 26;
  const sx = i => padL + (i / (data.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(d.value)}`).join(" ");
  const fill = path + ` L${sx(data.length - 1)},${H - padB} L${sx(0)},${H - padB} Z`;
  const gridVals = [350, 375, 400, 425].filter(v => v >= minV && v <= maxV);
  const gradId = `tg-${domain}`;
  return (
    <div>
      <p style={{ fontSize: "0.7rem", color: T.textMuted, marginBottom: "0.5rem" }}>{labels.meanLabel}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {gridVals.map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}</text>
          </g>
        ))}
        <line x1={padL} x2={W - padR} y1={sy(487)} y2={sy(487)} stroke="#d97706" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.7" />
        <text x={W - padR - 2} y={sy(487) - 4} textAnchor="end" fontSize="8" fill="#d97706" fontFamily="sans-serif">OECD avg 487</text>
        <path d={fill} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((d, i) => {
          const isLatest = d.year === 2022;
          return (
            <g key={i}>
              <circle cx={sx(i)} cy={sy(d.value)} r={isLatest ? 5 : 4} fill={color} stroke={T.surface} strokeWidth="2" />
              <text x={sx(i)} y={sy(d.value) - 10} textAnchor="middle" fontSize={isLatest ? "10" : "9"} fontWeight={isLatest ? "800" : "600"} fill={T.text} fontFamily="sans-serif">{Math.round(d.value)}</text>
              <text x={sx(i)} y={H - padB + 13} textAnchor="middle" fontSize="9" fill={isLatest ? T.text : T.textMuted} fontWeight={isLatest ? "700" : "400"} fontFamily="sans-serif">{d.year}</text>
            </g>
          );
        })}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
    </div>
  );
}

function PisaLocationView({ labels, T }) {
  const years = [2003, 2006, 2009, 2012, 2015, 2018, 2022];
  const W = 540, H = 180, padL = 44, padR = 50, padT = 14, padB = 26;
  const allVals = years.flatMap(y => [PISA_DATA.byLocation[y].village, PISA_DATA.byLocation[y].town, PISA_DATA.byLocation[y].city]);
  const minV = Math.min(...allVals) - 10, maxV = Math.max(...allVals) + 10;
  const sx = i => padL + (i / (years.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const series = [["city", "#0d6efd", "City / Kota"], ["town", "#06b6d4", "Town"], ["village", "#f59e0b", "Village / Desa"]];
  const makePath = key => years.map((y, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(PISA_DATA.byLocation[y][key])}`).join(" ");
  const lastY = years[years.length - 1], lastI = years.length - 1;
  const gap = Math.round(PISA_DATA.byLocation[lastY].city - PISA_DATA.byLocation[lastY].village);
  return (
    <div>
      <p style={{ fontSize: "0.7rem", color: T.textMuted, marginBottom: "0.5rem" }}>{labels.locationLabel}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        {[340, 360, 380, 400, 420, 440].filter(v => v >= minV && v <= maxV).map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}</text>
          </g>
        ))}
        {series.map(([key, c]) => <path key={key} d={makePath(key)} fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round" />)}
        <line x1={sx(lastI) + 8} y1={sy(PISA_DATA.byLocation[lastY].city)} x2={sx(lastI) + 8} y2={sy(PISA_DATA.byLocation[lastY].village)} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="2,2" />
        <text x={sx(lastI) + 12} y={(sy(PISA_DATA.byLocation[lastY].city) + sy(PISA_DATA.byLocation[lastY].village)) / 2 + 4} fontSize="8.5" fill="#dc2626" fontWeight="700" fontFamily="sans-serif">{gap}pt gap</text>
        {years.map((y, i) => <text key={i} x={sx(i)} y={H - padB + 13} textAnchor="middle" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{y}</text>)}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
        {series.map(([key, c, l]) => (
          <span key={key} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", color: T.textSub }}>
            <span style={{ width: "20px", height: "3px", background: c, display: "block", borderRadius: "2px" }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

function PisaOwnershipView({ labels, T }) {
  const owYears = Object.keys(PISA_DATA.byOwnership).map(Number).sort();
  const W = 540, H = 180, padL = 44, padR = 16, padT = 14, padB = 26;
  const allVals = owYears.flatMap(y => [PISA_DATA.byOwnership[y].negeri, PISA_DATA.byOwnership[y].swasta]);
  const minV = Math.min(...allVals) - 10, maxV = Math.max(...allVals) + 10;
  const sx = i => padL + (i / (owYears.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const pathN = owYears.map((y, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(PISA_DATA.byOwnership[y].negeri)}`).join(" ");
  const pathS = owYears.map((y, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(PISA_DATA.byOwnership[y].swasta)}`).join(" ");
  return (
    <div>
      <p style={{ fontSize: "0.7rem", color: T.textMuted, marginBottom: "0.5rem" }}>{labels.ownershipLabel}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        {[350, 370, 390, 410].filter(v => v >= minV && v <= maxV).map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}</text>
          </g>
        ))}
        <path d={pathN} fill="none" stroke="#0d6efd" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={pathS} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="5,3" />
        {owYears.map((y, i) => {
          const gap = Math.round(PISA_DATA.byOwnership[y].negeri - PISA_DATA.byOwnership[y].swasta);
          const showGap = i === 0 || i === owYears.length - 1;
          return (
            <g key={i}>
              {showGap && <text x={sx(i)} y={sy(PISA_DATA.byOwnership[y].swasta) + 16} textAnchor="middle" fontSize="8" fill={gap <= 5 ? "#16a34a" : "#94a3b8"} fontFamily="sans-serif">gap: {gap}</text>}
              <text x={sx(i)} y={H - padB + 13} textAnchor="middle" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{y}</text>
            </g>
          );
        })}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem" }}>
        {[["#0d6efd", "━", "Negeri (Public)"], ["#f59e0b", "╌", "Swasta (Private)"]].map(([c, s, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", color: T.textSub }}>
            <span style={{ color: c, fontSize: "0.85rem" }}>{s}</span>{l}
          </span>
        ))}
      </div>
    </div>
  );
}


// ─── PUBLICATIONS PAGE ───────────────────────────────────────────────────────

function PublicationsPage({ lang, T, dark }) {
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

// ─── ABOUT PAGE ──────────────────────────────────────────────────────────────

function AboutPage({ lang, T, dark }) {
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

// ─── DATA EXPLORER SUB-CHARTS (hoisted to avoid re-definition on render) ──────



function DeProficiencyChart({ lang, T }) {
  const years = [2000, 2003, 2006, 2009, 2012, 2015, 2018, 2022];
  const data = years.map(y => ({
    year: y, l2r: PISA_DATA.pctLevel2[y].reading, l2m: PISA_DATA.pctLevel2[y].math || 0,
  })).filter(d => d.l2r !== null);
  const maxV = 55;
  const barW = 28, gap = 8, groupGap = 20;
  const W = data.length * (barW * 2 + gap + groupGap) + 40, H = 150, padB = 22, padT = 12, padL = 36;
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 360, height: 150 }}>
          {[20, 30, 40, 50].map(v => {
            const y = padT + (1 - v / maxV) * (H - padT - padB);
            return (
              <g key={v}>
                <line x1={padL} x2={W} y1={y} y2={y} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
                <text x={padL - 3} y={y + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}%</text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const gx = padL + i * (barW * 2 + gap + groupGap);
            const rH = (d.l2r / maxV) * (H - padT - padB);
            const mH = (d.l2m / maxV) * (H - padT - padB);
            return (
              <g key={i}>
                <rect x={gx} y={H - padB - rH} width={barW} height={rH} fill="#0d6efd" rx="2" />
                <rect x={gx + barW + gap} y={H - padB - mH} width={barW} height={mH} fill="#06b6d4" rx="2" />
                <text x={gx + barW} y={H - padB + 13} textAnchor="middle" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{d.year}</text>
              </g>
            );
          })}
          <line x1={padL} x2={W} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
        </svg>
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
        {[["#0d6efd", lang === "id" ? "Membaca ≥ L2" : "Reading ≥ L2"], ["#06b6d4", lang === "id" ? "Matematika ≥ L2" : "Math ≥ L2"]].map(([c, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", color: T.textSub }}>
            <span style={{ width: "12px", height: "12px", background: c, borderRadius: "2px", display: "block" }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── MIXED SOURCE CHARTS ─────────────────────────────────────────────────────
// Renders chartData that has a mix of verified and web-sourced points.
// Each data point can have: { label, value, sourceType: "verified"|"web", sourceLabel }

function MixedBarChart({ data, unit, T, lang }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value));
  const allWeb = data.every(d => d.sourceType !== "verified");
  const hasVerified = data.some(d => d.sourceType === "verified");
  const hasWeb = data.some(d => d.sourceType !== "verified");

  // Collect unique web sources for methodology note
  const webSources = allWeb
    ? [...new Map(data.filter(d => d.sourceType !== "verified").map(d => [d.sourceLabel, d])).values()]
    : [];

  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      {data.map((d, i) => {
        const isVerified = d.sourceType === "verified";
        const pct = (d.value / max) * 100;
        const barColor = isVerified ? "linear-gradient(90deg, #0d6efd, #06b6d4)" : "#f59e0b";
        const textColor = isVerified ? "#fff" : "#78350f";
        const showInside = pct > 20;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
            <span style={{ width: "130px", fontSize: "0.74rem", color: T.textSub, textAlign: "right", flexShrink: 0, lineHeight: 1.3 }}>{d.label}</span>
            <div style={{ flex: 1, background: T.trackBg, borderRadius: "4px", overflow: "hidden", height: "26px", position: "relative" }}>
              <div style={{
                width: `${pct}%`, height: "100%", borderRadius: "4px",
                background: barColor,
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                paddingRight: showInside ? "6px" : "0",
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              }}>
                {showInside && <span style={{ fontSize: "0.68rem", fontWeight: "700", color: textColor, whiteSpace: "nowrap" }}>{d.value}{unit?.includes("%") ? "%" : ""}</span>}
              </div>
              {!showInside && <span style={{ position: "absolute", left: `calc(${pct}% + 6px)`, top: "50%", transform: "translateY(-50%)", fontSize: "0.68rem", fontWeight: "700", color: T.text, whiteSpace: "nowrap" }}>{d.value}{unit?.includes("%") ? "%" : ""}</span>}
            </div>
            <span style={{
              fontSize: "0.55rem", fontWeight: "700", flexShrink: 0, width: "14px", height: "14px",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: isVerified ? "#dcfce7" : "#fef3c7",
              color: isVerified ? "#15803d" : "#92400e",
              border: `1px solid ${isVerified ? "#bbf7d0" : "#fde68a"}`,
            }}>{isVerified ? "✓" : "🔍"}</span>
          </div>
        );
      })}

      {/* Legend */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
        {hasVerified && (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.66rem", color: T.textSub }}>
            <span style={{ width: "24px", height: "10px", borderRadius: "2px", background: "linear-gradient(90deg, #0d6efd, #06b6d4)", display: "block" }} />
            ✓ {lang === "id" ? "Data Terverifikasi" : "Verified Data"}
          </span>
        )}
        {hasWeb && (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.66rem", color: T.textSub }}>
            <span style={{ width: "24px", height: "10px", borderRadius: "2px", background: "#f59e0b", display: "block" }} />
            🔍 {lang === "id" ? "Sumber Web" : "Web Source"}
          </span>
        )}
      </div>

      {/* Methodology note — shown when all data comes from web sources */}
      {allWeb && webSources.length > 0 && (
        <div style={{
          marginTop: "0.85rem", padding: "0.65rem 0.85rem",
          background: lang === "id" ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.25)", borderRadius: "8px",
        }}>
          <p style={{ fontSize: "0.63rem", fontWeight: "700", color: "#92400e", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            🔍 {lang === "id" ? "Tentang Visualisasi Ini" : "About This Chart"}
          </p>
          <p style={{ fontSize: "0.65rem", color: T.textSub, lineHeight: 1.6, margin: 0 }}>
            {lang === "id"
              ? `Grafik ini sepenuhnya dibangun dari hasil pencarian web langsung. Nilai yang ditampilkan bersumber dari laporan resmi yang ditemukan selama analisis — bukan dari dataset PISA atau APBN yang diunggah ke platform ini. Sumber: ${webSources.map(s => s.sourceLabel).join(", ")}.`
              : `This chart is built entirely from live web search results. Values shown are drawn from official reports found during the analysis — not from the PISA or APBN datasets uploaded to this platform. Sources: ${webSources.map(s => s.sourceLabel).join(", ")}.`}
          </p>
          {webSources.some(s => s.sourceUrl && s.sourceUrl !== "null") && (
            <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {webSources.filter(s => s.sourceUrl && s.sourceUrl !== "null").map((s, i) => (
                <a key={i} href={s.sourceUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.62rem", color: "#d97706", fontWeight: "600", textDecoration: "none" }}>
                  {s.sourceLabel} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MixedLineChart({ data, unit, T, lang }) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.value).filter(v => v != null);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const W = 520, H = 160, padL = 36, padR = 16, padT = 18, padB = 28;
  const sx = i => padL + (i / (data.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / range) * (H - padT - padB);

  // Split into segments — connected if same source, break if switching
  const verifiedPts = data.map((d, i) => d.sourceType === "verified" ? { x: sx(i), y: sy(d.value), ...d } : null);
  const webPts = data.map((d, i) => d.sourceType !== "verified" ? { x: sx(i), y: sy(d.value), ...d } : null);

  const makeSegments = (pts) => {
    const segs = [];
    let cur = [];
    pts.forEach(p => {
      if (p) { cur.push(p); }
      else { if (cur.length >= 1) segs.push(cur); cur = []; }
    });
    if (cur.length >= 1) segs.push(cur);
    return segs;
  };

  const gridStep = Math.round(range / 4 / 5) * 5 || Math.round(range / 4) || 1;
  const grids = [];
  for (let v = Math.ceil(minV / gridStep) * gridStep; v <= maxV; v += gridStep) grids.push(v);

  return (
    <div>
      <p style={{ fontSize: "0.68rem", color: T.textMuted, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: "600" }}>{unit}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        <defs>
          <linearGradient id="mixedVerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d6efd" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0d6efd" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {grids.map(v => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL - 4} y={sy(v) + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">{v}{unit?.includes("%") ? "%" : ""}</text>
          </g>
        ))}
        {/* Verified segments — solid blue */}
        {makeSegments(verifiedPts).map((seg, si) => (
          <g key={`vs${si}`}>
            {seg.length >= 2 && <path d={seg.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")} fill="none" stroke="#0d6efd" strokeWidth="2.5" strokeLinejoin="round" />}
            {seg.length === 1 && <circle cx={seg[0].x} cy={seg[0].y} r={4} fill="#0d6efd" stroke={T.surface} strokeWidth="2" />}
          </g>
        ))}
        {/* Web segments — amber dashed */}
        {makeSegments(webPts).map((seg, si) => (
          <g key={`ws${si}`}>
            {seg.length >= 2 && <path d={seg.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="5,3" strokeLinejoin="round" />}
            {seg.length === 1 && <circle cx={seg[0].x} cy={seg[0].y} r={4} fill="#d97706" stroke={T.surface} strokeWidth="2" />}
          </g>
        ))}
        {/* Connecting bridge between verified and web segments */}
        {data.map((d, i) => {
          if (i === 0 || !data[i-1]) return null;
          const prev = data[i-1];
          if (prev.sourceType !== d.sourceType) {
            return <line key={`bridge${i}`} x1={sx(i-1)} y1={sy(prev.value)} x2={sx(i)} y2={sy(d.value)} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,3" />;
          }
          return null;
        })}
        {/* Data points */}
        {data.map((d, i) => {
          const isVerified = d.sourceType === "verified";
          return (
            <g key={i}>
              <circle cx={sx(i)} cy={sy(d.value)} r={4}
                fill={isVerified ? "#0d6efd" : "#d97706"}
                stroke={T.surface} strokeWidth="2" />
              <text x={sx(i)} y={sy(d.value) - 9} textAnchor="middle" fontSize="9" fontWeight="700" fill={T.text} fontFamily="sans-serif">
                {d.value}{unit?.includes("%") ? "%" : ""}
              </text>
              <text x={sx(i)} y={H - padB + 12} textAnchor="middle" fontSize="8.5" fill={T.textMuted} fontFamily="sans-serif">{d.label}</text>
            </g>
          );
        })}
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1" />
      </svg>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
        {data.some(d => d.sourceType === "verified") && (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.66rem", color: T.textSub }}>
            <span style={{ width: "20px", height: "3px", background: "#0d6efd", display: "block", borderRadius: "2px" }} />
            ✓ {lang === "id" ? "Data Terverifikasi" : "Verified Data"}
          </span>
        )}
        {data.some(d => d.sourceType !== "verified") && (
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.66rem", color: T.textSub }}>
            <span style={{ width: "20px", height: "3px", background: "#d97706", display: "block", borderRadius: "2px", borderBottom: "2px dashed #d97706" }} />
            🔍 {lang === "id" ? "Sumber Web" : "Web Source"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── SPENDING RESULT CHART ────────────────────────────────────────────────────
// Used in the analysis result panel for any spending/budget question.
// Always draws from SPENDING_DATA (verified) for 2020–2024 regardless of what
// chartData the AI returned, ensuring the line chart is always accurate and togglable.

function SpendingLineChart({ data, unit, lang, T, dark, size }) {
  const [metric, setMetric] = useState("idr");

  // Normalise AI chartData — values may come as strings, labels may be non-integer years
  const normalised = (data || []).map(d => ({
    ...d,
    value: typeof d.value === "string" ? parseFloat(d.value) : (d.value ?? 0),
    label: String(d.label ?? ""),
  })).filter(d => !isNaN(d.value));

  // Try to match each point to a verified year; if AI returned no usable year labels,
  // fall back to the full SPENDING_DATA series for the last 5 years
  const getVerifiedYear = label => {
    const y = parseInt(label);
    return isNaN(y) ? null : y;
  };

  const hasValidYears = normalised.some(d => getVerifiedYear(d.label) !== null &&
    SPENDING_DATA.series.some(s => s.year === getVerifiedYear(d.label)));

  // Build source data: use AI years if they match verified data, else use last-5-years of verified data
  const sourceData = hasValidYears ? normalised : (() => {
    const recent = SPENDING_DATA.series.filter(s => s.year >= 2020 && s.year <= 2024);
    return recent.map(s => ({ label: String(s.year), value: s.valueT }));
  })();

  const enriched = sourceData.map(d => {
    const year = getVerifiedYear(d.label);
    const bpp = year ? SPENDING_DATA.series.find(s => s.year === year) : null;
    const tot = year ? TOTAL_SPENDING_DATA.series.find(s => s.year === year) : null;
    return {
      label: d.label,
      idr:        bpp ? bpp.valueT       : (typeof d.value === "number" && d.value > 0 ? d.value : null),
      total:      tot ? tot.totalT       : null,
      pctOfTotal: tot ? tot.pctOfTotal   : null,
      pctGDP:     bpp ? bpp.pctGDP       : null,
      isVerified: !!(bpp || tot),
      hasTotalData: !!tot,
    };
  });

  const hasPct   = enriched.some(d => d.pctOfTotal !== null);
  const hasGdp   = enriched.some(d => d.pctGDP !== null);
  const hasTotal = enriched.some(d => d.total !== null);
  const cfgMap = {
    idr:   { getValue: d => d.idr,        format: v => `${v}T`,  color: "#d97706",
              label: lang === "id" ? "BPP (Triliun Rp)" : "BPP (Trillion IDR)" },
    total: { getValue: d => d.total,      format: v => `${v}T`,  color: "#7c3aed",
              label: lang === "id" ? "Total Anggaran" : "Total Budget" },
    pct:   { getValue: d => d.pctOfTotal, format: v => `${v}%`,  color: "#0d6efd",
              label: lang === "id" ? "% Total APBN" : "% of Total APBN",
              mandateLine: 20,
              sublabel: "(BPP + TKD + Pembiayaan) ÷ Total Belanja Negara" },
    gdp:   { getValue: d => d.pctGDP,     format: v => `${v}%`,  color: "#16a34a",
              label: lang === "id" ? "% PDB" : "% of GDP" },
  };
  const cfg = cfgMap[metric] || cfgMap.idr;
  let pts = enriched.filter(d => cfg.getValue(d) !== null && cfg.getValue(d) > 0);

  // If still not enough points (AI returned unusable data), force-load verified 2020-2024
  if (pts.length < 2 && metric === "idr") {
    const fallback = SPENDING_DATA.series.filter(s => s.year >= 2020 && s.year <= 2024).map(s => ({
      label: String(s.year), idr: s.valueT, total: null, pctOfTotal: null, pctGDP: s.pctGDP, isVerified: true, hasTotalData: false,
    }));
    pts = fallback;
  }
  if (pts.length < 2) return null;

  const vals = pts.map(d => cfg.getValue(d));
  const minV = Math.min(...vals) * 0.88;
  const maxV = metric === "pct" && cfg.mandateLine ? Math.max(Math.max(...vals) * 1.1, 22) : Math.max(...vals) * 1.12;

  const isLarge = size === "large";
  const W = isLarge ? 760 : 480;
  const H = isLarge ? 320 : 220;
  const padL = isLarge ? 62 : 54;
  const padR = isLarge ? 28 : 24;
  const padT = isLarge ? 40 : 32;
  const padB = isLarge ? 44 : 36;
  const ptR = isLarge ? 6 : 5;
  const vFont = isLarge ? "12" : "9.5";
  const lFont = isLarge ? "12" : "9.5";
  const gFont = isLarge ? "10.5" : "9";
  const dFont = isLarge ? "9.5" : "7.5";

  const sx = i => padL + (i / (pts.length - 1)) * (W - padL - padR);
  const sy = v => padT + (1 - (v - minV) / (maxV - minV)) * (H - padT - padB);
  const pathD = pts.map((d, i) => `${i === 0 ? "M" : "L"}${sx(i)},${sy(cfg.getValue(d))}`).join(" ");
  const fillD = `${pathD} L${sx(pts.length - 1)},${H - padB} L${sx(0)},${H - padB} Z`;
  const gradId = `slg_${metric}_${isLarge ? "l" : "s"}`;
  const grids = Array.from({ length: 5 }, (_, i) => minV + (i / 4) * (maxV - minV));

  return (
    <div>
      <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.85rem", flexWrap: "wrap" }}>
        <button onClick={() => setMetric("idr")} style={{ background: metric === "idr" ? "#d97706" : T.surface, border: `1px solid ${metric === "idr" ? "#d97706" : T.border}`, color: metric === "idr" ? "#fff" : T.textSub, fontSize: "0.69rem", fontWeight: "700", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
          {lang === "id" ? "BPP Pusat" : "Central (BPP)"}
        </button>
        {hasTotal && <button onClick={() => setMetric("total")} style={{ background: metric === "total" ? "#7c3aed" : T.surface, border: `1px solid ${metric === "total" ? "#7c3aed" : T.border}`, color: metric === "total" ? "#fff" : T.textSub, fontSize: "0.69rem", fontWeight: "700", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
          {lang === "id" ? "Total Anggaran" : "Total Budget"}
        </button>}
        {hasPct && <button onClick={() => setMetric("pct")} style={{ background: metric === "pct" ? "#0d6efd" : T.surface, border: `1px solid ${metric === "pct" ? "#0d6efd" : T.border}`, color: metric === "pct" ? "#fff" : T.textSub, fontSize: "0.69rem", fontWeight: "700", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
          {lang === "id" ? "% Total APBN" : "% of Total APBN"}
        </button>}
        {hasGdp && <button onClick={() => setMetric("gdp")} style={{ background: metric === "gdp" ? "#16a34a" : T.surface, border: `1px solid ${metric === "gdp" ? "#16a34a" : T.border}`, color: metric === "gdp" ? "#fff" : T.textSub, fontSize: "0.69rem", fontWeight: "700", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
          {lang === "id" ? "% PDB" : "% of GDP"}
        </button>}
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: `${W}px`, height: H, display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cfg.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={cfg.color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {grids.map((v, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
              <text x={padL - 8} y={sy(v) + 4} textAnchor="end" fontSize={gFont} fill={T.textMuted} fontFamily="sans-serif">
                {metric === "idr" ? `${Math.round(v)}T` : `${v.toFixed(1)}%`}
              </text>
            </g>
          ))}

          {cfg.mandateLine && sy(cfg.mandateLine) >= padT && sy(cfg.mandateLine) <= H - padB && (
            <g>
              <line x1={padL} x2={W - padR} y1={sy(cfg.mandateLine)} y2={sy(cfg.mandateLine)} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.8" />
              <text x={W - padR - 4} y={sy(cfg.mandateLine) - 5} textAnchor="end" fontSize={gFont} fill="#dc2626" fontWeight="700" fontFamily="sans-serif">
                {lang === "id" ? "Mandat 20%" : "20% mandate"}
              </text>
            </g>
          )}

          <path d={fillD} fill={`url(#${gradId})`} />
          <path d={pathD} fill="none" stroke={cfg.color} strokeWidth={isLarge ? "3" : "2.5"} strokeLinejoin="round" strokeLinecap="round" />

          {pts.map((d, i) => {
            const v = cfg.getValue(d);
            const x = sx(i), y = sy(v);
            const prev = i > 0 ? cfg.getValue(pts[i - 1]) : null;
            const delta = prev !== null ? ((v - prev) / prev * 100) : null;
            // Alternate labels above/below to avoid overlap when points are close
            const above = pts.length <= 5 || i % 2 === 0;
            const valY = above ? y - (ptR + 9) : y + (ptR + 16);
            const anchor = i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle";
            return (
              <g key={i}>
                {delta !== null && Math.abs(delta) > 0.1 && (
                  <text x={(sx(i - 1) + x) / 2}
                    y={Math.min(sy((v + prev) / 2) - 5, Math.min(sy(v), sy(prev)) - 6)}
                    textAnchor="middle" fontSize={dFont} fontWeight="700"
                    fill={delta >= 0 ? "#16a34a" : "#dc2626"} fontFamily="sans-serif">
                    {delta >= 0 ? "▲" : "▼"}{Math.abs(delta).toFixed(1)}%
                  </text>
                )}
                <circle cx={x} cy={y} r={ptR} fill={d.isVerified ? cfg.color : T.surface} stroke={cfg.color} strokeWidth="2.5" />
                <text x={x} y={valY} textAnchor={anchor} fontSize={vFont} fontWeight="800" fill={T.text} fontFamily="sans-serif">
                  {cfg.format(v)}
                </text>
                <text x={x} y={H - padB + 16} textAnchor="middle" fontSize={lFont} fontWeight="600" fill={T.text} fontFamily="sans-serif">
                  {d.label}
                </text>
              </g>
            );
          })}

          <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={T.border} strokeWidth="1.5" />
        </svg>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.66rem", color: T.textSub }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: cfg.color, display: "block" }} />
          ✓ {metric === "total"
            ? (lang === "id" ? "Total Anggaran Pendidikan (BPP+TKD+Pembiayaan) — Grafik 3.5, NK RAPBN 2026 Buku II" : "Total Education Budget (BPP+TKD+Pembiayaan) — Grafik 3.5, NK RAPBN 2026 Bk II")
            : (lang === "id" ? "Total Anggaran Pendidikan (data terverifikasi)" : "Total Education Spending (verified data)")}
        </span>
        {enriched.some(d => !d.isVerified) && (
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.66rem", color: T.textSub }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", border: `2px solid ${cfg.color}`, background: T.surface, display: "block" }} />
            {lang === "id" ? "Estimasi AI" : "AI estimate"}
          </span>
        )}
      </div>

      {metric === "pct" && (
        <>
          <p style={{ fontSize: "0.65rem", color: T.textMuted, marginTop: "0.25rem", fontStyle: "italic" }}>
            {lang === "id"
              ? "% dihitung dari total anggaran pendidikan (BPP + TKD + Pembiayaan) dibagi total Belanja Negara APBN tahun bersangkutan"
              : "% calculated as total education budget (BPP + TKD + Pembiayaan) divided by total APBN Belanja Negara for that year"}
          </p>
          <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem", background: dark ? "rgba(220,38,38,0.1)" : "#fef2f2", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "6px", padding: "0.45rem 0.75rem" }}>
            <span style={{ fontSize: "0.75rem", flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: "0.65rem", color: dark ? "#fca5a5" : "#991b1b", margin: 0, lineHeight: 1.5 }}>
              {lang === "id"
                ? "Mandat konstitusional: minimal 20% APBN untuk pendidikan (UU Sisdiknas No. 20/2003 & UUD 1945 Pasal 31 ayat 4). Realisasi 2024: 17,1% — di bawah mandat. Proyeksi RAPBN 2026: 20,9% (pertama kali memenuhi mandat)."
                : "Constitutional mandate: minimum 20% of APBN for education (UU Sisdiknas No. 20/2003 & UUD 1945 Article 31.4). Actual 2024: 17.1% — below mandate. RAPBN 2026 projection: 20.9% (first time meeting mandate)."}
            </p>
          </div>
        </>
      )}
      <p style={{ fontSize: "0.61rem", color: T.textMuted, marginTop: "0.4rem", lineHeight: 1.5 }}>
        ✓ {lang === "id"
          ? <>BPP: Nota Keuangan APBN, Kemenkeu RI · Total: <a href={TOTAL_SPENDING_DATA.meta.url} target="_blank" rel="noopener noreferrer" style={{ color: T.blue, textDecoration: "none" }}>Grafik 3.5, Nota Keuangan RAPBN 2026 Buku II ↗</a></>
          : <>BPP: Nota Keuangan APBN, Kemenkeu RI · Total: <a href={TOTAL_SPENDING_DATA.meta.url} target="_blank" rel="noopener noreferrer" style={{ color: T.blue, textDecoration: "none" }}>Grafik 3.5, Nota Keuangan RAPBN 2026 Book II ↗</a></>}
      </p>
    </div>
  );
}
// ─── RESULT CHART PANEL ──────────────────────────────────────────────────────
// Wraps the analysis result chart with a zoom button. Resolves which chart
// component to render based on query type and data shape.

function resolveChart(result, lastQuery, lang, T, dark, size) {
  const d = result.chartData || [];
  const q = (result._query || lastQuery || "").toLowerCase();

  // 1. CORRELATION — strict keyword match required; chartType hint only supplements, never overrides
  const isCorrelationQ =
    (q.includes("korelasi") || q.includes("correlation") || q.includes("hubungan") || q.includes("relationship")) &&
    (q.includes("pisa") || q.includes("skor") || q.includes("score") || q.includes("kinerja") || q.includes("performance") || q.includes("learning") || q.includes("hasil") || q.includes("capaian"));

  if (isCorrelationQ) {
    // Build dual-axis data from verified datasets: years where we have both spending and PISA data
    const verifiedDual = [2010, 2012, 2015, 2018, 2022].map(yr => {
      const sp = SPENDING_DATA.series.find(s => s.year === yr);
      const ps = PISA_DATA.national[yr];
      if (!sp || !ps || !ps.reading) return null;
      return { label: String(yr), spending: sp.valueT, pisa: ps.reading };
    }).filter(Boolean);
    if (verifiedDual.length >= 2) {
      return <DualAxisChart
        data={verifiedDual}
        unit={lang === "id" ? "Belanja Pendidikan (BPP) / Skor PISA Membaca" : "Education Spending (BPP) / PISA Reading Score"}
        T={T} size={size}
      />;
    }
    const hasDualData = d.length > 0 && (d[0]?.spending !== undefined || d[0]?.pisa !== undefined);
    if (hasDualData) return <DualAxisChart data={d} unit={result.unit} T={T} size={size} />;
  }

  // 2. SPENDING — only for pure spending/trend queries (not correlation)
  const isCorrelationKeyword = q.includes("korelasi") || q.includes("correlation") || q.includes("hubungan") || q.includes("relationship");
  const isSpendingQ = !isCorrelationKeyword && (
    q.includes("spend") || q.includes("belanja") || q.includes("budget") ||
    q.includes("anggaran") || q.includes("apbn") || q.includes("rupiah") ||
    q.includes("trillion") || q.includes("triliun") || q.includes("fiscal") || q.includes("fiskal") ||
    q.includes("pengeluaran") || q.includes("pembiayaan")
  );
  if (isSpendingQ) return <SpendingLineChart data={d} unit={result.unit} lang={lang} T={T} dark={dark} size={size} />;

  // 3. No chartData — nothing to show
  if (d.length === 0) return null;

  const hasMixed = d.some(p => p.sourceType);
  if (hasMixed && result.chartType === "line") return <MixedLineChart data={d} unit={result.unit} T={T} lang={lang} />;
  if (hasMixed) return <MixedBarChart data={d} unit={result.unit} T={T} lang={lang} />;
  if (result.chartType === "bar") return <BarChart data={d} unit={result.unit} highlight={result.highlight} T={T} />;
  if (result.chartType === "line") return <LineChart data={d} unit={result.unit} T={T} />;
  if (result.chartType === "comparison") return <ComparisonChart data={d} unit={result.unit} T={T} />;
  if (result.chartType === "scatter") return <ScatterChart data={d} unit={result.unit} T={T} />;
  return <BarChart data={d} unit={result.unit} highlight={result.highlight} T={T} />;
}


function ResultChartPanel({ result, lastQuery, lang, T, dark }) {
  const [zoomed, setZoomed] = useState(false);
  const title = (result._query || lastQuery || "").slice(0, 70);

  return (
    <div style={{ padding: "1.4rem", position: "relative" }}>
      <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 2 }}>
        <button
          onClick={() => setZoomed(true)}
          title={lang === "id" ? "Perbesar grafik" : "Expand chart"}
          style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "6px", color: T.textMuted, fontSize: "0.8rem", padding: "0.2rem 0.5rem", cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", gap: "4px" }}
        >
          <span style={{ fontSize: "0.65rem", fontWeight: "600" }}>⤢</span>
          <span style={{ fontSize: "0.62rem", fontWeight: "600" }}>{lang === "id" ? "Perbesar" : "Expand"}</span>
        </button>
      </div>

      {resolveChart(result, lastQuery, lang, T, dark, "normal")}

      {zoomed && (
        <ZoomModal title={title} T={T} onClose={() => setZoomed(false)}>
          {resolveChart(result, lastQuery, lang, T, dark, "large")}
        </ZoomModal>
      )}
    </div>
  );
}

function ZoomModal({ children, title, onClose, T }) {
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", width: "100%", maxWidth: "960px", maxHeight: "90vh", overflow: "auto", boxShadow: T.shadowHover }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.4rem", borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: T.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMuted, fontSize: "1.2rem", cursor: "pointer", lineHeight: 1, padding: "0.2rem 0.4rem", borderRadius: "4px" }}>✕</button>
        </div>
        <div style={{ padding: "1.5rem", background: T.surface }}>{children}</div>
      </div>
    </div>
  );
}

// Reusable zoom button
function ZoomBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Zoom / expand"
      style={{ background: "none", border: "1px solid #334155", borderRadius: "5px", color: "#94a3b8", fontSize: "0.75rem", padding: "0.18rem 0.45rem", cursor: "pointer", lineHeight: 1, flexShrink: 0 }}
    >⤢</button>
  );
}

function DeSpendingChart({ T, lang }) {
  const [metric, setMetric] = useState("idr");   // "idr" | "pct" | "gdp"
  const [zoomed, setZoomed] = useState(false);

  // Merge SPENDING_DATA with TOTAL_SPENDING_DATA: use pctOfTotal where available (2021+), pctOfBelanja for older years
  const data = SPENDING_DATA.series.map(d => {
    const tot = TOTAL_SPENDING_DATA.series.find(t => t.year === d.year);
    return { ...d, pctForChart: tot ? tot.pctOfTotal : d.pctOfBelanja, hasTotal: !!tot };
  });

  const metricLabels = {
    idr: lang === "id" ? "Triliun Rp" : "Trillion IDR",
    pct: lang === "id" ? "% Total APBN" : "% of Total APBN",
    gdp: lang === "id" ? "% PDB" : "% of GDP",
  };
  const getValue = d => metric === "idr" ? d.valueT : metric === "pct" ? d.pctForChart : d.pctGDP;
  const vals = data.map(getValue);
  const maxV = Math.max(...vals) * 1.12;

  const mandateLine = metric === "pct" ? 20 : null;

  const renderChart = (W, H) => {
    const padL = 44, padR = 14, padT = 18, padB = 28;
    const xScale = i => padL + (i / (data.length - 1)) * (W - padL - padR);
    const yScale = v => padT + (1 - v / maxV) * (H - padT - padB);
    const splitIdx = data.findIndex(d => (d.status === "outlook" || d.status === "RAPBN") && d.year >= 2025);
    const confirmedPts = data.slice(0, splitIdx > 0 ? splitIdx : data.length).map((d, i) => ({ x: xScale(i), y: yScale(getValue(d)), ...d }));
    const projectedPts = splitIdx > 0 ? data.slice(splitIdx - 1).map((d, i) => ({ x: xScale(splitIdx - 1 + i), y: yScale(getValue(d)), ...d })) : [];
    const confirmedPath = confirmedPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const projectedPath = projectedPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const fillPath = confirmedPath + ` L${confirmedPts[confirmedPts.length-1].x},${H-padB} L${confirmedPts[0].x},${H-padB} Z`;

    // Grid lines
    const gridStep = metric === "idr" ? 100 : metric === "pct" ? 5 : 0.5;
    const grids = [];
    for (let v = gridStep; v < maxV; v += gridStep) grids.push(v);

    const gradId = `spendGrad_${metric}`;
    const color = "#d97706";

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {grids.map(v => (
          <g key={v}>
            <line x1={padL} x2={W-padR} y1={yScale(v)} y2={yScale(v)} stroke={T.border} strokeWidth="1" strokeDasharray="3,3" />
            <text x={padL-3} y={yScale(v)+4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily="sans-serif">
              {metric === "idr" ? `${v}T` : `${v}%`}
            </text>
          </g>
        ))}
        {/* 20% mandate reference line */}
        {mandateLine && yScale(mandateLine) >= padT && (
          <g>
            <line x1={padL} x2={W-padR} y1={yScale(mandateLine)} y2={yScale(mandateLine)} stroke="#16a34a" strokeWidth="1.5" strokeDasharray="6,3" opacity="0.8" />
            <text x={W-padR-2} y={yScale(mandateLine)-4} textAnchor="end" fontSize="8" fill="#16a34a" fontFamily="sans-serif">
              {lang === "id" ? "Mandat 20%" : "20% mandate"}
            </text>
          </g>
        )}
        <path d={fillPath} fill={`url(#${gradId})`} />
        <path d={confirmedPath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        {projectedPts.length > 1 && <path d={projectedPath} fill="none" stroke={color} strokeWidth="2" strokeDasharray="5,4" strokeLinejoin="round" />}
        {data.map((d, i) => {
          const isProjected = d.status === "outlook" || d.status === "RAPBN";
          const showLabel = [2005, 2008, 2010, 2013, 2016, 2019, 2022, 2024, 2026].includes(d.year);
          const v = getValue(d);
          return (
            <g key={i}>
              <circle cx={xScale(i)} cy={yScale(v)} r={showLabel ? 4 : 2.5} fill={isProjected ? T.surface : color} stroke={color} strokeWidth={showLabel ? 2 : 1.5} />
              {showLabel && (
                <text x={xScale(i)} y={yScale(v) - 8} textAnchor="middle" fontSize="8.5" fontWeight="700" fill={isProjected ? T.textMuted : T.text} fontFamily="sans-serif">
                  {metric === "idr" ? `${v}T` : `${v}%`}
                </text>
              )}
              {showLabel && (
                <text x={xScale(i)} y={H-padB+13} textAnchor="middle" fontSize="8.5" fill={T.textMuted} fontFamily="sans-serif">{d.year}</text>
              )}
            </g>
          );
        })}
        <line x1={padL} x2={W-padR} y1={H-padB} y2={H-padB} stroke={T.border} strokeWidth="1" />
      </svg>
    );
  };

  const legend = (
    <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
      {[["#d97706", "━", lang === "id" ? "Realisasi / APBN" : "Actual / Budget"],
        ["#d97706", "╌", lang === "id" ? "Proyeksi" : "Projected"],
        ...(mandateLine ? [["#16a34a", "╌", lang === "id" ? "Mandat 20%" : "20% mandate"]] : [])
      ].map(([c, s, l]) => (
        <span key={l} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.7rem", color: T.textSub }}>
          <span style={{ color: c, fontSize: "0.85rem" }}>{s}</span>{l}
        </span>
      ))}
    </div>
  );

  const toggleRow = (
    <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
      {[["idr", metricLabels.idr], ["pct", metricLabels.pct], ["gdp", metricLabels.gdp]].map(([k, l]) => (
        <button key={k} onClick={() => setMetric(k)} style={{
          background: metric === k ? "#d97706" : T.surface,
          border: `1px solid ${metric === k ? "#d97706" : T.border}`,
          color: metric === k ? "#fff" : T.textSub,
          fontSize: "0.68rem", fontWeight: "700", padding: "0.2rem 0.6rem",
          borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
        }}>{l}</button>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        {toggleRow}
        <ZoomBtn onClick={() => setZoomed(true)} />
      </div>
      {renderChart(580, 180)}
      {legend}
      {zoomed && (
        <ZoomModal
          title={`${lang === "id" ? "Belanja Pendidikan" : "Education Spending"} — ${metricLabels[metric]} (2005–2026)`} T={T} onClose={() => setZoomed(false)}
        >
          <div style={{ marginBottom: "1rem" }}>{toggleRow}</div>
          {renderChart(820, 320)}
          {legend}
          <p style={{ fontSize: "0.65rem", color: "#475569", marginTop: "1rem" }}>{SPENDING_DATA.meta.source} · {SPENDING_DATA.meta.pctSource}</p>
        </ZoomModal>
      )}
    </div>
  );
}

function ZoomablePisaView({ children, T, lang }) {
  const [zoomed, setZoomed] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.4rem" }}>
        <ZoomBtn onClick={() => setZoomed(true)} />
      </div>
      {children}
      {zoomed && (
        <ZoomModal title={lang === "id" ? "PISA Indonesia — Tampilan Diperbesar" : "PISA Indonesia — Expanded View"} T={T} onClose={() => setZoomed(false)}>
          {children}
          <p style={{ fontSize: "0.65rem", color: "#475569", marginTop: "1rem" }}>{PISA_DATA.meta.source}</p>
        </ZoomModal>
      )}
    </div>
  );
}

// ─── DATA EXPLORER COMPONENT ─────────────────────────────────────────────────

function DataExplorer({ lang, T, onQuery }) {
  const [activeTab, setActiveTab] = useState("pisa"); // "pisa" | "spending"
  const [pisaView, setPisaView] = useState("trend");  // "trend" | "gap" | "proficiency" | "ownership" | "score_trend"
  const [pisaDomain, setPisaDomain] = useState("reading");

  const labels = {
    id: {
      title: "Jelajah Data Resmi",
      sub: "Visualisasi langsung dari dataset PISA dan APBN yang telah diverifikasi",
      tabPisa: "PISA Indonesia",
      tabSpending: "Belanja Pendidikan",
      viewTrend: "Tren Nasional",
      viewGap: "Kesenjangan Kota-Desa",
      viewProf: "Tingkat Kemahiran",
      viewOwnership: "Negeri vs Swasta",
      viewScoreTrend: "Tren per Domain",
      domainReading: "Membaca",
      domainMath: "Matematika",
      domainScience: "Sains",
      sourceNote: "Sumber: OECD / Kemendikdasmen",
      spendingSource: "Sumber: Nota Keuangan APBN, Kemenkeu RI",
      spendingNote: "Belanja fungsi pendidikan — Triliun Rp · % Belanja Pemerintah · % PDB",
      projectedLabel: "Proyeksi →",
      l2label: "% mencapai L2+ (kemahiran dasar)",
      l4label: "% mencapai L4+ (kemahiran tinggi)",
      meanLabel: "Skor rata-rata nasional (skala 500)",
      ownershipLabel: "Skor membaca rata-rata berdasarkan kepemilikan sekolah",
      source: "Sumber: PISA Indonesia 2000–2022, Kemendikdasmen / OECD",
    },
    en: {
      title: "Explore Official Data",
      sub: "Direct visualisation from verified PISA and APBN datasets",
      tabPisa: "PISA Indonesia",
      tabSpending: "Education Spending",
      viewTrend: "Proficiency Trend",
      viewGap: "Urban-Rural Gap",
      viewProf: "Domain Proficiency",
      viewOwnership: "Public vs Private",
      viewScoreTrend: "Score Trend",
      domainReading: "Reading",
      domainMath: "Mathematics",
      domainScience: "Science",
      sourceNote: "Source: OECD / Kemendikdasmen",
      spendingSource: "Source: Nota Keuangan APBN, Kemenkeu RI",
      spendingNote: "Education function spending — Trillion IDR · % of Govt Spending · % of GDP",
      projectedLabel: "Projected →",
      l2label: "% reaching L2+ (basic proficiency)",
      l4label: "% reaching L4+ (high proficiency)",
      meanLabel: "National mean score (500-point scale)",
      ownershipLabel: "Mean reading score by school ownership",
      source: "Source: PISA Indonesia 2000–2022, Kemendikdasmen / OECD",
    },
  }[lang];

  // Which views show the domain selector
  const viewsWithDomain = ["trend", "proficiency", "score_trend"];
  const domainColor = { reading: "#0d6efd", math: "#7c3aed", science: "#16a34a" };
  const color = domainColor[pisaDomain];

  // Suggested AI query per view
  const aiQuery = {
    trend: lang === "id" ? "Bagaimana tren tingkat kemahiran PISA Indonesia dari 2000 hingga 2022?" : "What is the trend in PISA proficiency levels in Indonesia from 2000 to 2022?",
    gap: lang === "id" ? "Seberapa besar kesenjangan skor PISA antara siswa perkotaan dan pedesaan di Indonesia?" : "How large is the PISA score gap between urban and rural students in Indonesia?",
    proficiency: lang === "id" ? "Berapa persen siswa Indonesia yang mencapai kemahiran dasar PISA di setiap domain?" : "What percentage of Indonesian students reach PISA basic proficiency across domains?",
    ownership: lang === "id" ? "Bagaimana perbandingan skor PISA antara sekolah negeri dan swasta di Indonesia?" : "How do PISA scores compare between public and private schools in Indonesia?",
    score_trend: lang === "id" ? "Bagaimana tren skor PISA Indonesia dari 2000 hingga 2022?" : "What is the trend of Indonesia PISA scores from 2000 to 2022?",
  };

  const spendingYears = SPENDING_DATA.series;

  return (
    <section style={{ marginBottom: "2.5rem" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "0.2rem" }}>{labels.title}</h2>
          <p style={{ fontSize: "0.77rem", color: T.textSub }}>{labels.sub}</p>
        </div>
        {/* Dataset tabs */}
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {[["pisa", labels.tabPisa, "#0d6efd"], ["spending", labels.tabSpending, "#d97706"]].map(([key, label, color]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{
              background: activeTab === key ? color : T.surface,
              border: `1px solid ${activeTab === key ? color : T.border}`,
              color: activeTab === key ? "#fff" : T.textSub,
              fontSize: "0.72rem", fontWeight: "700", padding: "0.3rem 0.85rem",
              borderRadius: "6px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", overflow: "hidden", boxShadow: T.shadow }}>
        {activeTab === "pisa" ? (
          <>
            {/* PISA controls */}
            <div style={{ background: T.surfaceAlt, padding: "0.75rem 1.2rem", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {/* View selector */}
              <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                {[
                  ["trend", labels.viewTrend],
                  ["score_trend", labels.viewScoreTrend],
                  ["gap", labels.viewGap],
                  ["proficiency", labels.viewProf],
                  ["ownership", labels.viewOwnership],
                ].map(([k, l]) => (
                  <button key={k} onClick={() => setPisaView(k)} style={{ background: pisaView === k ? T.blueSub : "none", border: `1px solid ${pisaView === k ? T.blue : T.border}`, color: pisaView === k ? T.blue : T.textSub, fontSize: "0.7rem", fontWeight: "600", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
                ))}
              </div>
              {/* Domain selector — shown for trend, proficiency, score_trend views */}
              {viewsWithDomain.includes(pisaView) && (
                <div style={{ display: "flex", gap: "0.25rem", marginLeft: "auto" }}>
                  {[["reading", labels.domainReading, "#0d6efd"], ["math", labels.domainMath, "#7c3aed"], ["science", labels.domainScience, "#16a34a"]].map(([k, l, c]) => (
                    <button key={k} onClick={() => setPisaDomain(k)} style={{ background: pisaDomain === k ? c : "none", border: `1px solid ${pisaDomain === k ? c : T.border}`, color: pisaDomain === k ? "#fff" : T.textSub, fontSize: "0.68rem", fontWeight: "600", padding: "0.2rem 0.6rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "1rem 1.2rem 0.75rem" }}>
              {pisaView === "trend" && (
                <ZoomablePisaView T={T} lang={lang}>
                  <PisaProficiencyView domain={pisaDomain} color={color} labels={labels} T={T} />
                </ZoomablePisaView>
              )}
              {pisaView === "score_trend" && (
                <ZoomablePisaView T={T} lang={lang}>
                  <PisaTrendView domain={pisaDomain} color={color} labels={labels} T={T} />
                </ZoomablePisaView>
              )}
              {pisaView === "gap" && (
                <ZoomablePisaView T={T} lang={lang}>
                  <PisaLocationView labels={labels} T={T} />
                </ZoomablePisaView>
              )}
              {pisaView === "proficiency" && (
                <ZoomablePisaView T={T} lang={lang}>
                  <DeProficiencyChart lang={lang} T={T} />
                </ZoomablePisaView>
              )}
              {pisaView === "ownership" && (
                <ZoomablePisaView T={T} lang={lang}>
                  <PisaOwnershipView labels={labels} T={T} />
                </ZoomablePisaView>
              )}
            </div>

            <div style={{ padding: "0.5rem 1.2rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", borderTop: `1px solid ${T.border}` }}>
              <span style={{ fontSize: "0.66rem", color: T.textMuted }}>{labels.sourceNote} · {PISA_DATA.meta.note}</span>
              <button onClick={() => onQuery(aiQuery[pisaView])}
                style={{ fontSize: "0.68rem", fontWeight: "700", color: T.blue, background: T.blueSub, border: `1px solid ${T.blue}44`, padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit" }}>
                {lang === "id" ? "Analisis dengan AI →" : "Analyse with AI →"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: T.surfaceAlt, padding: "0.75rem 1.2rem", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#d97706" }}>
                {lang === "id" ? "Belanja Fungsi Pendidikan · 2005–2026" : "Education Function Spending · 2005–2026"}
              </span>
              <span style={{ fontSize: "0.67rem", color: T.textMuted }}>{labels.spendingNote}</span>
            </div>
            <div style={{ padding: "1rem 1.2rem 0.75rem" }}>
              <DeSpendingChart T={T} lang={lang} />
            </div>
            <div style={{ padding: "0.5rem 1.2rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", borderTop: `1px solid ${T.border}` }}>
              <span style={{ fontSize: "0.66rem", color: T.textMuted }}>{labels.spendingSource} · {SPENDING_DATA.meta.note}</span>
              <button onClick={() => onQuery(lang === "id" ? "Bagaimana tren belanja pendidikan Indonesia dari 2005 hingga sekarang?" : "What is the trend in Indonesia education spending from 2005 to present?")}
                style={{ fontSize: "0.68rem", fontWeight: "700", color: "#d97706", background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.3)", padding: "0.22rem 0.65rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit" }}>
                {lang === "id" ? "Analisis dengan AI →" : "Analyse with AI →"}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState("id");
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState("home"); // "home" | "sources"
  const [query, setQuery] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(null);
  const [typingDone, setTypingDone] = useState(false);
  const inputRef = useRef(null);
  const resultRef = useRef(null);
  const S = STRINGS[lang];
  const QUERIES = SUGGESTED_QUERIES[lang];
  const isSpendingQuery = (() => {
    const q = (lastQuery || "").toLowerCase();
    const isCorr = (q.includes("korelasi") || q.includes("correlation") || q.includes("hubungan")) &&
      (q.includes("pisa") || q.includes("skor") || q.includes("kinerja") || q.includes("performance"));
    if (isCorr) return true; // correlation also needs a chart panel
    return q.includes("spend") || q.includes("belanja") || q.includes("budget") ||
      q.includes("anggaran") || q.includes("apbn") || q.includes("triliun") ||
      q.includes("pengeluaran") || q.includes("pembiayaan") || q.includes("fiskal");
  })();

  const T = {
    pageBg:     dark ? "#0f172a" : "#f1f5f9",
    surface:    dark ? "#1e293b" : "#ffffff",
    surfaceAlt: dark ? "#162032" : "#f8fafc",
    border:      dark ? "#334155" : "#e2e8f0",
    borderHover: dark ? "#475569" : "#bfdbfe",
    text:      dark ? "#f1f5f9" : "#0f172a",
    textSub:   dark ? "#94a3b8" : "#475569",
    textMuted: dark ? "#475569" : "#9ca3af",
    trackBg:   dark ? "#0f172a" : "#e2e8f0",
    blue:      "#0d6efd",
    teal:      "#06b6d4",
    blueSub:     dark ? "rgba(13,110,253,0.18)" : "rgba(13,110,253,0.08)",
    shadow:      dark ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.07)",
    shadowHover: dark ? "0 4px 16px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.10)",
  };

  const categories = [...new Set(QUERIES.map(q => q.category))];
  const filteredQueries = filter ? QUERIES.filter(q => q.category === filter) : QUERIES;

  const handleQuery = useCallback(async (q) => {
    const text = (q || query).trim();
    if (!text) return;
    setLastQuery(text);
    setResult(null); setTypingDone(false); setLoading(true); setPage("home");
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    try {
      const data = await runAIQuery(text, lang);
      setResult({ ...data, _query: text });  // embed query so chart resolver never mismatches
    } catch (err) {
      console.error("Query error:", err);
      setResult({ headline: S.errorMsg, summary: String(err?.message || err), insights: [], chartType: "none", source: "" });
    }
    finally { setLoading(false); }
  }, [query, lang]);

  const toggleLang = () => {
    const newLang = lang === "id" ? "en" : "id";
    const newS = STRINGS[newLang];
    setLang(newLang);
    setTypingDone(false);
    setFilter(null);
    if (lastQuery) {
      setResult(null);
      setLoading(true);
      setPage("home");
      runAIQuery(lastQuery, newLang)
        .then(data => setResult({ ...data, _query: lastQuery }))
        .catch(err => setResult({ headline: newS.errorMsg, summary: String(err?.message || err), insights: [], chartType: "none", source: "", _query: lastQuery }))
        .finally(() => setLoading(false));
    }
  };

  const navItems = [
    { key: "home",    label: S.navHome },
    { key: "sources", label: S.navSources },
    { key: "pub",     label: S.navPublications },
    { key: "about",   label: S.navAbout },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.pageBg, color: T.text, fontFamily: "'Plus Jakarta Sans','Noto Sans',sans-serif", transition: "background 0.25s,color 0.25s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::placeholder{color:#94a3b8}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* ── CIVIC NOTICE BAR ── */}
      <div style={{ background: dark ? "#1e293b" : "#f0f9ff", borderBottom: `1px solid ${dark ? "#334155" : "#bae6fd"}`, padding: "0.3rem 0" }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.68rem", color: dark ? "#7dd3fc" : "#0369a1", fontWeight: "500" }}>{S.civicNotice}</span>
          <span style={{ fontSize: "0.65rem", color: T.textSub, background: T.blueSub, border: `1px solid ${T.borderHover}`, padding: "0.1rem 0.5rem", borderRadius: "4px", fontWeight: "600" }}>{S.betaBadge}</span>
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <header style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 50, boxShadow: T.shadow, transition: "background 0.25s,border-color 0.25s" }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", height: "54px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0, cursor: "pointer" }} onClick={() => setPage("home")}>
            <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "linear-gradient(135deg,#0d6efd,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(13,110,253,0.35)" }}>
              <span style={{ fontSize: "1.1rem" }}>📚</span>
            </div>
            <div>
              <div style={{ fontSize: "0.62rem", color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: "600", lineHeight: 1 }}>{S.platformSub}</div>
              <div style={{ fontSize: "0.97rem", fontWeight: "800", color: T.text, lineHeight: 1.25, letterSpacing: "-0.01em" }}>Pantau Pendidikan</div>
            </div>
          </div>

          <nav style={{ display: "flex", gap: "0.15rem", flex: 1 }}>
            {navItems.map(item => (
              <button key={item.key}
                onClick={() => setPage(item.key)}
                style={{
                  background: page === item.key ? T.blueSub : "none",
                  border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px",
                  fontSize: "0.8rem", fontWeight: page === item.key ? "700" : "500",
                  color: page === item.key ? T.blue : T.textSub,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (page !== item.key) { e.currentTarget.style.background = T.blueSub; e.currentTarget.style.color = T.blue; } }}
                onMouseLeave={e => { if (page !== item.key) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = T.textSub; } }}
              >{item.label}</button>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <button onClick={toggleLang} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.72rem", fontWeight: "700", padding: "0.3rem 0.8rem", borderRadius: "6px", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit", letterSpacing: "0.03em", background: dark ? "rgba(255,255,255,0.07)" : "rgba(13,110,253,0.08)", border: `1px solid ${dark ? "rgba(255,255,255,0.18)" : "#bfdbfe"}`, color: dark ? "rgba(255,255,255,0.75)" : "#0d6efd" }}>
              <span>{lang === "id" ? "🇬🇧" : "🇮🇩"}</span>{S.langSwitch}
            </button>
            <button onClick={() => setDark(!dark)} style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(3,105,161,0.08)", border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "#7dd3fc"}`, color: dark ? "#7dd3fc" : "#0369a1", fontSize: "0.67rem", padding: "0.15rem 0.55rem", borderRadius: "4px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>{dark ? "☀️" : "🌙"}</button>
          </div>
        </div>
      </header>

      {/* ── PAGES ── */}
      {page === "sources" ? (
        <DataSourcesPage lang={lang} T={T} dark={dark} />
      ) : page === "pub" ? (
        <PublicationsPage lang={lang} T={T} dark={dark} />
      ) : page === "about" ? (
        <AboutPage lang={lang} T={T} dark={dark} />
      ) : (
        <>
          {/* ── HERO ── */}
          <section style={{ background: "linear-gradient(135deg,#0d6efd 0%,#0284c7 55%,#0369a1 100%)", padding: "3.5rem 1.5rem 3rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-80px", right: "-60px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(6,182,212,0.15)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-60px", left: "30%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: "5px", height: "100%", background: "linear-gradient(180deg,#06b6d4,#0d6efd)" }} />
            <div style={{ maxWidth: "1140px", margin: "0 auto", animation: "fadeUp 0.5s ease both" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px", padding: "0.25rem 0.85rem", marginBottom: "1.25rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite", display: "block" }} />
                <span style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.9)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "700" }}>{S.heroBadge}</span>
              </div>
              <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: "800", color: "#fff", lineHeight: 1.2, marginBottom: "0.85rem", letterSpacing: "-0.02em" }}>
                {S.heroTitle}<br /><em style={{ color: "#7dd3fc", fontStyle: "normal" }}>{S.heroTitleEm}</em>
              </h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "clamp(0.82rem,1.5vw,0.92rem)", lineHeight: 1.72, maxWidth: "540px", marginBottom: "2rem" }}>{S.heroDesc}</p>
              <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: "12px", padding: "4px 4px 4px 18px", maxWidth: "640px", boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
                <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleQuery()} placeholder={S.heroPlaceholder}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: "0.87rem", color: "#0f172a", padding: "0.8rem 0.5rem 0.8rem 0", fontFamily: "inherit", background: "transparent" }} />
                <button onClick={() => handleQuery()} disabled={loading || !query.trim()}
                  style={{ background: loading ? "#94a3b8" : "#0d6efd", color: "#fff", border: "none", borderRadius: "9px", padding: "0.7rem 1.4rem", fontSize: "0.82rem", fontWeight: "700", cursor: loading ? "wait" : "pointer", fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                  {loading ? "..." : S.analyzeBtn}
                </button>
              </div>
              {/* Data sources pill link */}
              <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)" }}>{lang === "id" ? "Berbasis:" : "Powered by:"}</span>
                {["PISA","AN","BPS","Dapodik","EMIS","APBN"].map(s => (
                  <span key={s} style={{ fontSize: "0.65rem", fontWeight: "700", color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", padding: "0.1rem 0.5rem", borderRadius: "4px" }}>{s}</span>
                ))}
                <button onClick={() => setPage("sources")} style={{ fontSize: "0.68rem", color: "#7dd3fc", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", padding: 0, textDecoration: "underline" }}>
                  {lang === "id" ? "+ lihat semua sumber →" : "+ view all sources →"}
                </button>
              </div>
            </div>
          </section>

          {/* ── STATS STRIP ── */}
          <div style={{ background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
              {[["514",0],["38",1],["300K+",2],["52M+",3],["3M+",4]].map(([val,i]) => (
                <div key={i} style={{ padding: "1.1rem 2.2rem", borderRight: `1px solid ${T.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: "1.35rem", fontWeight: "800", color: T.text, letterSpacing: "-0.02em" }}>{val}</div>
                  <div style={{ fontSize: "0.62rem", color: T.textMuted, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "2px" }}>{S.statsLabels[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MAIN ── */}
          <main style={{ maxWidth: "1140px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

            {/* Result panel */}
            <div ref={resultRef}>
              {loading && (
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", padding: "2.5rem", marginBottom: "2.5rem", display: "flex", alignItems: "center", gap: "1rem", boxShadow: T.shadow }}>
                  <div style={{ width: "22px", height: "22px", border: `3px solid ${T.border}`, borderTopColor: T.blue, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                  <span style={{ color: T.textSub, fontSize: "0.9rem" }}>{S.thinking}</span>
                </div>
              )}
              {result && !loading && (
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", marginBottom: "2.5rem", overflow: "hidden", boxShadow: T.shadowHover, animation: "fadeUp 0.4s ease both" }}>
                  <div style={{ background: T.surfaceAlt, padding: "1rem 1.4rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: "0.62rem", fontWeight: "700", color: T.blue, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: "0.25rem" }}>{S.analysisLabel}</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: "700", color: T.text }}>{result._query || lastQuery}</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                      <button style={{ background: T.blueSub, border: `1px solid ${T.borderHover}`, color: T.textSub, fontSize: "0.72rem", fontWeight: "600", padding: "0.35rem 0.85rem", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit" }}>{S.share}</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: (result.chartType && result.chartType !== "none" && result.chartData?.length > 0) || isSpendingQuery ? (["dual_axis","dual","scatter","line_dual"].includes(result.chartType) ? "1fr 1.6fr" : "1fr 1.25fr") : "1fr", gap: 0 }}>
                    <div style={{ padding: "1.4rem", borderRight: (result.chartType && result.chartType !== "none" && result.chartData?.length > 0) || isSpendingQuery ? `1px solid ${T.border}` : "none" }}>
                      {/* Always-visible headline */}
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: T.text, lineHeight: 1.35, marginBottom: "0.75rem", letterSpacing: "-0.015em" }}>
                        {result.headline
                          ? result.headline
                          : (result.summary || "").match(/[^.!?]+[.!?]*/)?.[0]?.trim() || ""}
                      </h3>
                      {/* Body summary */}
                      {result.summary && !result.headline && (() => {
                        const sentences = result.summary.match(/[^.!?]+[.!?]*/g) || [];
                        return sentences.length > 1 ? (
                          <p style={{ fontSize: "0.875rem", color: T.textSub, lineHeight: 1.75, marginBottom: "1.25rem" }}>
                            {sentences.slice(1).join("").trim()}
                          </p>
                        ) : null;
                      })()}
                      {result.summary && result.headline && (
                        <p style={{ fontSize: "0.875rem", color: T.textSub, lineHeight: 1.75, marginBottom: "1.25rem" }}>
                          {typingDone ? result.summary : <TypingText text={result.summary} onDone={() => setTypingDone(true)} />}
                        </p>
                      )}
                      {result.insights?.length > 0 && (
                        <InsightsList insights={result.insights} lang={lang} T={T} />
                      )}
                      {/* Sources & disclaimer */}
                      {result.insights?.length > 0 && (() => {
                        const ins = result.insights.filter(i => typeof i === "object");
                        const verified = ins.filter(i => i.sourceType === "verified");
                        const web = ins.filter(i => i.sourceType === "web");
                        const hasAny = ins.length > 0 || result.source;
                        if (!hasAny) return null;
                        return (
                          <div style={{ marginTop: "1rem", paddingTop: "0.85rem", borderTop: `1px solid ${T.border}` }}>
                            {/* Source attribution rows */}
                            {verified.length > 0 && (
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem" }}>
                                <span style={{ fontSize: "0.62rem", fontWeight: "700", color: "#15803d", background: "#dcfce7", border: "1px solid #bbf7d0", padding: "0.1rem 0.4rem", borderRadius: "3px", flexShrink: 0, marginTop: "1px" }}>✓ {lang === "id" ? "Terverifikasi" : "Verified"}</span>
                                <span style={{ fontSize: "0.68rem", color: T.textMuted, lineHeight: 1.5 }}>
                                  {[...new Set(verified.map(i => i.sourceLabel))].join(" · ")}
                                </span>
                              </div>
                            )}
                            {web.length > 0 && (
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem" }}>
                                <span style={{ fontSize: "0.62rem", fontWeight: "700", color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", padding: "0.1rem 0.4rem", borderRadius: "3px", flexShrink: 0, marginTop: "1px" }}>🔍 {lang === "id" ? "Sumber Luar" : "External"}</span>
                                <span style={{ fontSize: "0.68rem", color: T.textMuted, lineHeight: 1.5 }}>
                                  {[...new Set(web.map(i => i.sourceLabel))].map((lbl, j) => {
                                    const url = web.find(i => i.sourceLabel === lbl)?.sourceUrl;
                                    return url && url !== "null"
                                      ? <span key={j}>{j > 0 ? " · " : ""}<a href={url} target="_blank" rel="noopener noreferrer" style={{ color: T.blue, textDecoration: "none", fontWeight: "600" }}>{lbl} ↗</a></span>
                                      : <span key={j}>{j > 0 ? " · " : ""}{lbl}</span>;
                                  })}
                                </span>
                              </div>
                            )}
                            {/* AI disclaimer */}
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", background: dark ? "rgba(13,110,253,0.08)" : "#eff6ff", border: "1px solid rgba(13,110,253,0.25)", borderRadius: "6px", padding: "0.55rem 0.75rem", marginTop: "0.6rem" }}>
                              <span style={{ fontSize: "0.8rem", flexShrink: 0 }}>ℹ️</span>
                              <p style={{ fontSize: "0.66rem", color: dark ? "#93c5fd" : "#1e40af", lineHeight: 1.55, margin: 0 }}>
                                {lang === "id"
                                  ? `Analisis ini menggabungkan: ${verified.length > 0 ? "dataset PISA/APBN terverifikasi yang diunggah ke platform ini (✓)" : ""} ${web.length > 0 ? `dan hasil pencarian web langsung dari sumber terpercaya (🔍). Klik "Lihat Sumber" pada setiap temuan untuk memverifikasi data secara mandiri.` : ""}`
                                  : `This analysis combines: ${verified.length > 0 ? "verified PISA/APBN datasets uploaded to this platform (✓)" : ""} ${web.length > 0 ? `and live web search results from credible sources (🔍). Click "View Source" on each finding to independently verify the data.` : ""}`}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    {(result.chartType && result.chartType !== "none" && result.chartData && result.chartData.length > 0) || isSpendingQuery ? (
                      <ResultChartPanel result={result} lastQuery={lastQuery} lang={lang} T={T} dark={dark} />
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* ── DATA EXPLORER ── */}
            <DataExplorer lang={lang} T={T} onQuery={(q) => { setQuery(q); handleQuery(q); }} />

            {/* Popular analyses */}
            <section>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: T.text, marginBottom: "0.2rem" }}>{S.popularAnalyses}</h2>
                  <p style={{ fontSize: "0.77rem", color: T.textSub }}>{S.popularSub}</p>
                </div>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  <button onClick={() => setFilter(null)} style={{ background: !filter ? T.blue : T.surface, border: `1px solid ${!filter ? T.blue : T.border}`, color: !filter ? "#fff" : T.textSub, fontSize: "0.71rem", fontWeight: "600", padding: "0.28rem 0.75rem", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{S.filterAll}</button>
                  {categories.map(f => (
                    <button key={f} onClick={() => setFilter(f === filter ? null : f)} style={{ background: filter === f ? T.blue : T.surface, border: `1px solid ${filter === f ? T.blue : T.border}`, color: filter === f ? "#fff" : T.textSub, fontSize: "0.71rem", fontWeight: "600", padding: "0.28rem 0.75rem", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(262px,1fr))", gap: "0.85rem" }}>
                {filteredQueries.map((sq, i) => (
                  <button key={i} onClick={() => { setQuery(sq.query); handleQuery(sq.query); }}
                    style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "1.1rem 1.15rem", textAlign: "left", cursor: "pointer", transition: "all 0.16s", color: T.text, boxShadow: T.shadow, display: "flex", gap: "0.85rem", alignItems: "flex-start" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.boxShadow = T.shadowHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = T.shadow; e.currentTarget.style.transform = "translateY(0)"; }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "9px", background: T.blueSub, border: `1px solid ${T.borderHover}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{sq.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ marginBottom: "0.3rem", display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: "0.59rem", fontWeight: "700", color: T.blue, textTransform: "uppercase", letterSpacing: "0.07em", background: T.blueSub, padding: "0.13rem 0.45rem", borderRadius: "4px" }}>{sq.category}</span>
                        {sq.dataSource === "verified"
                          ? <span style={{ fontSize: "0.58rem", fontWeight: "700", color: "#16a34a", background: "#dcfce7", border: "1px solid #bbf7d0", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>✓ {lang === "id" ? "Data Terverifikasi" : "Verified Data"}</span>
                          : <span style={{ fontSize: "0.58rem", fontWeight: "700", color: "#92400e", background: "#fef3c7", border: "1px solid #fde68a", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>🔍 {lang === "id" ? "Berbasis Web Search" : "Web Search"}</span>
                        }
                      </div>
                      <p style={{ fontSize: "0.84rem", fontWeight: "700", color: T.text, marginBottom: "0.3rem", lineHeight: 1.3 }}>{sq.title}</p>
                      <p style={{ fontSize: "0.71rem", color: T.textSub, lineHeight: 1.55, margin: 0 }}>{sq.query}</p>
                      {sq.dataSource === "webSearch" && (
                        <p style={{ fontSize: "0.63rem", color: T.textMuted, marginTop: "0.4rem", fontStyle: "italic" }}>
                          {lang === "id" ? "Menggunakan pencarian web + sumber prioritas terpercaya." : "Uses live web search from priority credible sources."}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Why use this portal */}
            <section style={{ marginTop: "3rem" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: "800", color: T.text, marginBottom: "1.1rem" }}>{S.whyTitle}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "0.85rem" }}>
                {S.whyCards.map(c => (
                  <div key={c.title} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "1.1rem 1.15rem", boxShadow: T.shadow }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", marginBottom: "0.7rem" }}>{c.icon}</div>
                    <p style={{ fontSize: "0.85rem", fontWeight: "700", color: T.text, marginBottom: "0.35rem" }}>{c.title}</p>
                    <p style={{ fontSize: "0.74rem", color: T.textSub, lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: dark ? "#0a0f1e" : "#0c1e3e", borderTop: "4px solid #0d6efd" }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "2rem 1.5rem 1.25rem" }}>
          <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
            <div style={{ flex: "1 1 240px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.85rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg,#0d6efd,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>📚</div>
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#fff", letterSpacing: "-0.01em" }}>Pantau Pendidikan</span>
              </div>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.65, maxWidth: "280px" }}>{S.footerDesc}</p>
            </div>
            <div style={{ flex: "1 1 180px" }}>
              <p style={{ fontSize: "0.65rem", fontWeight: "700", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>{S.footerNav}</p>
              {S.footerNavLinks.map((l, i) => {
                const pageKey = ["home","sources","home","pub","about"][i];
                return (
                  <p key={l} style={{ margin: "0.3rem 0" }}>
                    <button onClick={() => setPage(pageKey)} style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0, textAlign: "left" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#7dd3fc"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>{l}</button>
                  </p>
                );
              })}
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <p style={{ fontSize: "0.65rem", fontWeight: "700", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>{S.footerSources}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {["Kemendikdasmen","BPS","KPAI","PISA/OECD","Dapodik","EMIS","APBN","Bappenas"].map(src => (
                  <span key={src} style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.2rem 0.55rem", borderRadius: "999px" }}>{src}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)" }}>{S.copyright}</p>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <button onClick={toggleLang} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", padding: "0.28rem 0.75rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>
                {lang === "id" ? "🇬🇧 English" : "🇮🇩 Bahasa"}
              </button>
              <button onClick={() => setDark(!dark)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", padding: "0.28rem 0.75rem", borderRadius: "5px", cursor: "pointer", fontFamily: "inherit", fontWeight: "500" }}>
                {dark ? S.lightMode : S.darkMode}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
