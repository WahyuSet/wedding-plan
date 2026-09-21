# 💍 WeddingPlan — Smart Wedding Budgeting & Planner

Aplikasi web modern dan komprehensif untuk pasangan di Indonesia yang merencanakan pernikahan secara mandiri (self-service). Didesain dengan standar **Enterprise Frontend Design** (minimalis, elegan, responsif, dan kaya mikro-interaksi).

---

## 🌟 Fitur Utama

1. **🔐 Autentikasi & Profil Mempelai**
   - Register akun 2-langkah dengan setup data mempelai (Nama, Tanggal, Venue, Total Target Anggaran).
   - Login dengan proteksi JWT via session cookie & Bearer token.
   - Otomatis membuat 30+ berkas KUA & 24 timeline tugas hari-H saat registrasi.

2. **🏠 Dashboard Bento Grid**
   - Countdown live ke hari pernikahan (Hari : Jam : Menit : Detik).
   - 4 Panel Ringkasan Interaktif (Anggaran, Seserahan, Operasional, Dokumen KUA).
   - Donut Chart distribusi anggaran per kategori (Recharts).
   - Peringatan berkas KUA mendesak & agenda terdekat.
   - Tombol aksi cepat (Quick Actions).

3. **💰 Budget Planner (Perencanaan Anggaran)**
   - 4 Kartu Metrik Keuangan (Target Anggaran, Total Estimasi, Realisasi Aktual, Sisa Anggaran).
   - Grafik batang perbandingan estimasi vs realisasi per kategori.
   - Filter tab kategori (Venue, Katering, Dekorasi, Busana, Dokumentasi, Hiburan, Transport, Undangan, Mahar, Lainnya).
   - Tabel interaktif dengan status pembayaran (Belum Bayar / DP / Lunas).
   - **Export Laporan PDF** (jsPDF + autoTable) dengan header nama pasangan & tabel rapi.
   - **Export Laporan Excel** (SheetJS xlsx).

4. **🎁 Daftar Seserahan & Hantaran**
   - Progress bar kesiapan barang seserahan.
   - Filter asal barang (Dari Pria ➔ Wanita vs Dari Wanita ➔ Pria / Angsul-angsul).
   - Checklist kotak seserahan interaktif.
   - **Katalog 20+ Template Seserahan Adat Indonesia** yang bisa langsung diimpor dalam 1 klik.
   - Export daftar seserahan ke Excel.

5. **⚙️ Operasional & Rundown Hari-H**
   - Accordion timeline terbagi dalam 5 fase:
     - 🗓️ H-90 s/d H-31 (Persiapan Awal)
     - 📋 H-30 s/d H-8 (Persiapan Intensif)
     - ⏳ H-7 s/d H-1 (Final Countdown & Gladi)
     - 🎊 Hari-H (Rundown Per Jam: Akad, Sungkeman, Resepsi)
     - 🌙 Pasca Pernikahan (Pelunasan Vendor, Disdukcapil)
   - Penanggung jawab (PIC) & tingkat prioritas.
   - Tombol Reset ke 24 template tugas standar.

6. **📋 Perizinan Dokumen KUA**
   - Panduan interaktif alur pendaftaran KUA, Kelurahan (Surat N1-N4), Puskesmas (Vaksin TT & Elsimil), dan SIMKAH Kemenag.
   - 30 Checklist dokumen resmi terbagi dalam 4 tab (Pria, Wanita, Wali, Administrasi KUA).
   - Kalkulasi otomatis batas waktu pendaftaran (H-10 hari kerja) dengan **badge peringatan merah mendesak**.
   - Penjelasan biaya resmi (Gratis di KUA pada jam kerja, Rp 600.000 di luar KUA).

---

## 🛠️ Stack Teknologi

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, React Router v6, TanStack Query, Zustand, Recharts, Lucide React, jsPDF, SheetJS (xlsx), Sonner.
- **Backend:** Express.js, TypeScript, Prisma ORM, SQLite (`dev.db`), jsonwebtoken, bcryptjs, Zod, CORS, cookie-parser.
- **Arsitektur:** Monorepo (`/frontend` + `/backend`).

---

## 🚀 Panduan Menjalankan Project

### 1. Menjalankan Backend API

```bash
cd backend
npm install
npx prisma db push
npm run dev
```
Backend akan berjalan di `http://localhost:5000`.

### 2. Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`.

---

## 🧪 Menjalankan Automated Test Backend

```bash
cd backend
npx tsx src/test-api.ts
```

---

## ☁️ Petunjuk Deployment

- **Frontend:** Deploy ke **Vercel** (atur root directory ke `frontend`).
- **Backend:** Deploy ke **Railway** atau **Render** (atur start command `node dist/index.js`).
