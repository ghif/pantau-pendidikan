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

export const ASESMEN_NASIONAL_DATA = {
  data: {
    "year": 2025,
    "national_avg": { "literacy": 67.94, "numeracy": 62.53 },
    "provinces": [
      {
        "kode_prov": 31,
        "name": "Prov. D.K.I. Jakarta",
        "levels": {
          "SEMUA": { "literacy": 86.18, "numeracy": 78.29 },
          "SD/sederajat": { "literacy": 83.51, "numeracy": 73.89 },
          "SMP/sederajat": { "literacy": 91.65, "numeracy": 85.96 },
          "SMA/SMK/sederajat": { "literacy": 84.25, "numeracy": 76.59 }
        }
      },
      {
        "kode_prov": 32,
        "name": "Prov. Jawa Barat",
        "levels": {
          "SEMUA": { "literacy": 68.85, "numeracy": 63.72 },
          "SD/sederajat": { "literacy": 66.87, "numeracy": 61.16 },
          "SMP/sederajat": { "literacy": 75.21, "numeracy": 69.68 },
          "SMA/SMK/sederajat": { "literacy": 64.92, "numeracy": 61.61 }
        }
      },
      {
        "kode_prov": 33,
        "name": "Prov. Jawa Tengah",
        "levels": {
          "SEMUA": { "literacy": 78.19, "numeracy": 71.91 },
          "SD/sederajat": { "literacy": 75.33, "numeracy": 68.48 },
          "SMP/sederajat": { "literacy": 85.91, "numeracy": 80.28 },
          "SMA/SMK/sederajat": { "literacy": 76.26, "numeracy": 70.94 }
        }
      },
      {
        "kode_prov": 34,
        "name": "Prov. D.I. Yogyakarta",
        "levels": {
          "SEMUA": { "literacy": 87.75, "numeracy": 81.63 },
          "SD/sederajat": { "literacy": 84.27, "numeracy": 77.74 },
          "SMP/sederajat": { "literacy": 94.5, "numeracy": 90.02 },
          "SMA/SMK/sederajat": { "literacy": 87.15, "numeracy": 79.88 }
        }
      },
      {
        "kode_prov": 35,
        "name": "Prov. Jawa Timur",
        "levels": {
          "SEMUA": { "literacy": 73.12, "numeracy": 67.96 },
          "SD/sederajat": { "literacy": 71.24, "numeracy": 65.34 },
          "SMP/sederajat": { "literacy": 79.35, "numeracy": 74.3 },
          "SMA/SMK/sederajat": { "literacy": 69.3, "numeracy": 65.74 }
        }
      },
      {
        "kode_prov": 11,
        "name": "Prov. Aceh",
        "levels": {
          "SEMUA": { "literacy": 57.25, "numeracy": 53.18 },
          "SD/sederajat": { "literacy": 52.86, "numeracy": 47.68 },
          "SMP/sederajat": { "literacy": 62.38, "numeracy": 57.54 },
          "SMA/SMK/sederajat": { "literacy": 58.97, "numeracy": 58.2 }
        }
      },
      {
        "kode_prov": 12,
        "name": "Prov. Sumatera Utara",
        "levels": {
          "SEMUA": { "literacy": 60.53, "numeracy": 56.5 },
          "SD/sederajat": { "literacy": 59.33, "numeracy": 54.71 },
          "SMP/sederajat": { "literacy": 66.3, "numeracy": 61.68 },
          "SMA/SMK/sederajat": { "literacy": 55.2, "numeracy": 53.22 }
        }
      },
      {
        "kode_prov": 13,
        "name": "Prov. Sumatera Barat",
        "levels": {
          "SEMUA": { "literacy": 69.98, "numeracy": 63.48 },
          "SD/sederajat": { "literacy": 67.69, "numeracy": 60.38 },
          "SMP/sederajat": { "literacy": 76.47, "numeracy": 69.33 },
          "SMA/SMK/sederajat": { "literacy": 66.24, "numeracy": 62.94 }
        }
      },
      {
        "kode_prov": 14,
        "name": "Prov. Riau",
        "levels": {
          "SEMUA": { "literacy": 68.4, "numeracy": 61.33 },
          "SD/sederajat": { "literacy": 63.72, "numeracy": 56.05 },
          "SMP/sederajat": { "literacy": 74.17, "numeracy": 67.6 },
          "SMA/SMK/sederajat": { "literacy": 69.61, "numeracy": 63.05 }
        }
      },
      {
        "kode_prov": 15,
        "name": "Prov. Jambi",
        "levels": {
          "SEMUA": { "literacy": 63.03, "numeracy": 57.51 },
          "SD/sederajat": { "literacy": 60.4, "numeracy": 54.56 },
          "SMP/sederajat": { "literacy": 69.49, "numeracy": 63.32 },
          "SMA/SMK/sederajat": { "literacy": 59.19, "numeracy": 55.34 }
        }
      },
      {
        "kode_prov": 16,
        "name": "Prov. Sumatera Selatan",
        "levels": {
          "SEMUA": { "literacy": 62.08, "numeracy": 57.66 },
          "SD/sederajat": { "literacy": 58.81, "numeracy": 53.06 },
          "SMP/sederajat": { "literacy": 69.16, "numeracy": 64.97 },
          "SMA/SMK/sederajat": { "literacy": 59.65, "numeracy": 58.24 }
        }
      },
      {
        "kode_prov": 18,
        "name": "Prov. Lampung",
        "levels": {
          "SEMUA": { "literacy": 62.1, "numeracy": 56.1 },
          "SD/sederajat": { "literacy": 58.66, "numeracy": 51.16 },
          "SMP/sederajat": { "literacy": 69.06, "numeracy": 63.78 },
          "SMA/SMK/sederajat": { "literacy": 59.98, "numeracy": 56.4 }
        }
      },
      {
        "kode_prov": 61,
        "name": "Prov. Kalimantan Barat",
        "levels": {
          "SEMUA": { "literacy": 61.73, "numeracy": 53.85 },
          "SD/sederajat": { "literacy": 55.35, "numeracy": 46.84 },
          "SMP/sederajat": { "literacy": 69.48, "numeracy": 61.81 },
          "SMA/SMK/sederajat": { "literacy": 64.18, "numeracy": 57.54 }
        }
      },
      {
        "kode_prov": 62,
        "name": "Prov. Kalimantan Tengah",
        "levels": {
          "SEMUA": { "literacy": 66.61, "numeracy": 59.71 },
          "SD/sederajat": { "literacy": 60.35, "numeracy": 52.95 },
          "SMP/sederajat": { "literacy": 75.52, "numeracy": 68.44 },
          "SMA/SMK/sederajat": { "literacy": 66.31, "numeracy": 60.87 }
        }
      },
      {
        "kode_prov": 63,
        "name": "Prov. Kalimantan Selatan",
        "levels": {
          "SEMUA": { "literacy": 71.47, "numeracy": 64.51 },
          "SD/sederajat": { "literacy": 66.62, "numeracy": 59.05 },
          "SMP/sederajat": { "literacy": 78.79, "numeracy": 71.54 },
          "SMA/SMK/sederajat": { "literacy": 71.01, "numeracy": 65.87 }
        }
      },
      {
        "kode_prov": 64,
        "name": "Prov. Kalimantan Timur",
        "levels": {
          "SEMUA": { "literacy": 74.74, "numeracy": 65.82 },
          "SD/sederajat": { "literacy": 67.65, "numeracy": 57.85 },
          "SMP/sederajat": { "literacy": 83.12, "numeracy": 75.09 },
          "SMA/SMK/sederajat": { "literacy": 77.39, "numeracy": 69.03 }
        }
      },
      {
        "kode_prov": 71,
        "name": "Prov. Sulawesi Utara",
        "levels": {
          "SEMUA": { "literacy": 56.25, "numeracy": 49.98 },
          "SD/sederajat": { "literacy": 50.25, "numeracy": 42.73 },
          "SMP/sederajat": { "literacy": 66.41, "numeracy": 59.86 },
          "SMA/SMK/sederajat": { "literacy": 54.57, "numeracy": 51.97 }
        }
      },
      {
        "kode_prov": 72,
        "name": "Prov. Sulawesi Tengah",
        "levels": {
          "SEMUA": { "literacy": 56.78, "numeracy": 49.41 },
          "SD/sederajat": { "literacy": 52.32, "numeracy": 43.63 },
          "SMP/sederajat": { "literacy": 64.92, "numeracy": 57.64 },
          "SMA/SMK/sederajat": { "literacy": 53.99, "numeracy": 49.72 }
        }
      },
      {
        "kode_prov": 73,
        "name": "Prov. Sulawesi Selatan",
        "levels": {
          "SEMUA": { "literacy": 60.31, "numeracy": 55.95 },
          "SD/sederajat": { "literacy": 58.55, "numeracy": 54.1 },
          "SMP/sederajat": { "literacy": 65.96, "numeracy": 60.02 },
          "SMA/SMK/sederajat": { "literacy": 55.73, "numeracy": 54.08 }
        }
      },
      {
        "kode_prov": 74,
        "name": "Prov. Sulawesi Tenggara",
        "levels": {
          "SEMUA": { "literacy": 56.72, "numeracy": 51.67 },
          "SD/sederajat": { "literacy": 50.96, "numeracy": 45.27 },
          "SMP/sederajat": { "literacy": 65.75, "numeracy": 59.1 },
          "SMA/SMK/sederajat": { "literacy": 55.89, "numeracy": 54.27 }
        }
      },
      {
        "kode_prov": 81,
        "name": "Prov. Maluku",
        "levels": {
          "SEMUA": { "literacy": 48.36, "numeracy": 43.85 },
          "SD/sederajat": { "literacy": 44.46, "numeracy": 38.07 },
          "SMP/sederajat": { "literacy": 55.12, "numeracy": 50.96 },
          "SMA/SMK/sederajat": { "literacy": 45.65, "numeracy": 44.32 }
        }
      },
      {
        "kode_prov": 51,
        "name": "Prov. Bali",
        "levels": {
          "SEMUA": { "literacy": 77.22, "numeracy": 69.87 },
          "SD/sederajat": { "literacy": 72.07, "numeracy": 64.93 },
          "SMP/sederajat": { "literacy": 88.17, "numeracy": 80.49 },
          "SMA/SMK/sederajat": { "literacy": 82.29, "numeracy": 74.55 }
        }
      },
      {
        "kode_prov": 52,
        "name": "Prov. Nusa Tenggara Barat",
        "levels": {
          "SEMUA": { "literacy": 52.89, "numeracy": 47.71 },
          "SD/sederajat": { "literacy": 52.33, "numeracy": 45.44 },
          "SMP/sederajat": { "literacy": 58.69, "numeracy": 52.55 },
          "SMA/SMK/sederajat": { "literacy": 45.88, "numeracy": 46.08 }
        }
      },
      {
        "kode_prov": 53,
        "name": "Prov. Nusa Tenggara Timur",
        "levels": {
          "SEMUA": { "literacy": 52.97, "numeracy": 48.01 },
          "SD/sederajat": { "literacy": 49.72, "numeracy": 44.71 },
          "SMP/sederajat": { "literacy": 60.87, "numeracy": 54.74 },
          "SMA/SMK/sederajat": { "literacy": 47.55, "numeracy": 44.61 }
        }
      },
      {
        "kode_prov": 91,
        "name": "Prov. Papua",
        "levels": {
          "SEMUA": { "literacy": 47.45, "numeracy": 44.77 },
          "SD/sederajat": { "literacy": 39.97, "numeracy": 36.21 },
          "SMP/sederajat": { "literacy": 57.21, "numeracy": 54.3 },
          "SMA/SMK/sederajat": { "literacy": 47.9, "numeracy": 47.59 }
        }
      },
      {
        "kode_prov": 17,
        "name": "Prov. Bengkulu",
        "levels": {
          "SEMUA": { "literacy": 63.38, "numeracy": 56.99 },
          "SD/sederajat": { "literacy": 60.14, "numeracy": 53.41 },
          "SMP/sederajat": { "literacy": 70.69, "numeracy": 63.69 },
          "SMA/SMK/sederajat": { "literacy": 59.61, "numeracy": 55.01 }
        }
      },
      {
        "kode_prov": 82,
        "name": "Prov. Maluku Utara",
        "levels": {
          "SEMUA": { "literacy": 33.58, "numeracy": 30.96 },
          "SD/sederajat": { "literacy": 28.02, "numeracy": 23.35 },
          "SMP/sederajat": { "literacy": 41.46, "numeracy": 38.3 },
          "SMA/SMK/sederajat": { "literacy": 33.32, "numeracy": 34.78 }
        }
      },
      {
        "kode_prov": 36,
        "name": "Prov. Banten",
        "levels": {
          "SEMUA": { "literacy": 75.82, "numeracy": 65.6 },
          "SD/sederajat": { "literacy": 71.79, "numeracy": 59.45 },
          "SMP/sederajat": { "literacy": 83.67, "numeracy": 75.27 },
          "SMA/SMK/sederajat": { "literacy": 74.35, "numeracy": 67.17 }
        }
      },
      {
        "kode_prov": 75,
        "name": "Prov. Gorontalo",
        "levels": {
          "SEMUA": { "literacy": 56.98, "numeracy": 49.34 },
          "SD/sederajat": { "literacy": 50.19, "numeracy": 41.36 },
          "SMP/sederajat": { "literacy": 68.13, "numeracy": 61.38 },
          "SMA/SMK/sederajat": { "literacy": 55.79, "numeracy": 49.74 }
        }
      },
      {
        "kode_prov": 19,
        "name": "Prov. Kepulauan Bangka Belitung",
        "levels": {
          "SEMUA": { "literacy": 60.39, "numeracy": 55.8 },
          "SD/sederajat": { "literacy": 57.46, "numeracy": 51.19 },
          "SMP/sederajat": { "literacy": 66.18, "numeracy": 62.22 },
          "SMA/SMK/sederajat": { "literacy": 58.65, "numeracy": 56.84 }
        }
      },
      {
        "kode_prov": 21,
        "name": "Prov. Kepulauan Riau",
        "levels": {
          "SEMUA": { "literacy": 78.05, "numeracy": 69.2 },
          "SD/sederajat": { "literacy": 72.16, "numeracy": 62.23 },
          "SMP/sederajat": { "literacy": 86.22, "numeracy": 78.77 },
          "SMA/SMK/sederajat": { "literacy": 78.06, "numeracy": 69.39 }
        }
      },
      {
        "kode_prov": 76,
        "name": "Prov. Sulawesi Barat",
        "levels": {
          "SEMUA": { "literacy": 49.73, "numeracy": 45.74 },
          "SD/sederajat": { "literacy": 46.76, "numeracy": 41.74 },
          "SMP/sederajat": { "literacy": 56.49, "numeracy": 51.09 },
          "SMA/SMK/sederajat": { "literacy": 45.71, "numeracy": 45.8 }
        }
      },
      {
        "kode_prov": 92,
        "name": "Prov. Papua Barat",
        "levels": {
          "SEMUA": { "literacy": 42.04, "numeracy": 38.35 },
          "SD/sederajat": { "literacy": 36.88, "numeracy": 31.86 },
          "SMP/sederajat": { "literacy": 48.99, "numeracy": 45.98 },
          "SMA/SMK/sederajat": { "literacy": 43.81, "numeracy": 42.48 }
        }
      },
      {
        "kode_prov": 65,
        "name": "Prov. Kalimantan Utara",
        "levels": {
          "SEMUA": { "literacy": 66.11, "numeracy": 57.7 },
          "SD/sederajat": { "literacy": 57.81, "numeracy": 48.69 },
          "SMP/sederajat": { "literacy": 75.46, "numeracy": 67.62 },
          "SMA/SMK/sederajat": { "literacy": 68.54, "numeracy": 60.65 }
        }
      },
      {
        "kode_prov": 93,
        "name": "Prov. Papua Selatan",
        "levels": {
          "SEMUA": { "literacy": 37.68, "numeracy": 35.9 },
          "SD/sederajat": { "literacy": 32.27, "numeracy": 28.85 },
          "SMP/sederajat": { "literacy": 47.47, "numeracy": 45.29 },
          "SMA/SMK/sederajat": { "literacy": 33.42, "numeracy": 36.22 }
        }
      },
      {
        "kode_prov": 94,
        "name": "Prov. Papua Tengah",
        "levels": {
          "SEMUA": { "literacy": 43.79, "numeracy": 41.8 },
          "SD/sederajat": { "literacy": 43.36, "numeracy": 37.91 },
          "SMP/sederajat": { "literacy": 50.47, "numeracy": 47.28 },
          "SMA/SMK/sederajat": { "literacy": 36.16, "numeracy": 40.9 }
        }
      },
      {
        "kode_prov": 96,
        "name": "Prov. Papua Barat Daya",
        "levels": {
          "SEMUA": { "literacy": 47.99, "numeracy": 43.97 },
          "SD/sederajat": { "literacy": 41.63, "numeracy": 36.71 },
          "SMP/sederajat": { "literacy": 56.95, "numeracy": 52.03 },
          "SMA/SMK/sederajat": { "literacy": 46.74, "numeracy": 46.17 }
        }
      },
      {
        "kode_prov": 95,
        "name": "Prov. Papua Pegunungan",
        "levels": {
          "SEMUA": { "literacy": 27.16, "numeracy": 31.43 },
          "SD/sederajat": { "literacy": 37.29, "numeracy": 35.59 },
          "SMP/sederajat": { "literacy": 29.95, "numeracy": 31.12 },
          "SMA/SMK/sederajat": { "literacy": 15.12, "numeracy": 28.45 }
        }
      }
    ]
  },
  meta: {
    source: "Asesmen Nasional Tahun 2025",
    url: "https://data.kemendikdasmen.go.id/dataset/p/prioritas-data/persentase-peserta-didik-satuan-pendidikan-formal-dan-nonformal-yang-mencapai-standar-kompetensi-minimum-dalam-asesmen-kompetensi-tingkat-nasional-a-literasi-membaca-dan-b-numerasi-2025-indonesia",
  },
};
