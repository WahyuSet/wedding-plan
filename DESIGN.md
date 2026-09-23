# DESIGN.md — WeddingPlan Landing Page

> Spesifikasi desain dan token semantik untuk Landing Page WeddingPlan, memadukan standar estetika anti-slop (`taste-skill`) dan efisiensi senior dev (`ponytail`).

---

## 0. Design Read

> **Reading this as:** Consumer SaaS & Wedding Planner landing page for modern Indonesian engaged couples, with an elegant, high-trust, and organized language, leaning toward Tailwind tokens + Plus Jakarta Sans + warm rose/gold accents and clean bento rhythm.

---

## 1. Dials Configuration

- **`DESIGN_VARIANCE: 7`** — Asymmetric balance, ritme visual editorial dinamis, menghindari monotonitas grid simetris standar.
- **`MOTION_INTENSITY: 5`** — Mikro-interaksi taktil saat hover, spring button feedback, subtle fade-ins, tetap mematuhi `prefers-reduced-motion`.
- **`VISUAL_DENSITY: 4`** — Tipografi bernapas luas, kontras tinggi, kartu informatif tidak berdesak-desakan.

---

## 2. Color System & Palette Lock

Terkunci pada identitas warna aplikasi WeddingPlan yang sudah ada. AI-purple gradients dan dark-mesh generik dilarang.

| Token | Nilai | Peran Semantik |
|---|---|---|
| `--bg-primary` | `#FBFBFA` | Canvas latar belakang (warm alabaster, elegan & menenangkan) |
| `--bg-secondary` | `#FFFFFF` | Surface kartu & wadah informasi |
| `--bg-tertiary` | `#F8FAFC` | Aksen netral latar badge & highlight ringan |
| `--text-primary` | `#0F172A` | Judul utama, teks kontras tinggi (Slate 900) |
| `--text-secondary` | `#475569` | Paragraf tubuh, sub-judul, menu navigasi (Slate 600) |
| `--text-muted` | `#94A3B8` | Label mikro, caption, status sekunder |
| `--brand-primary` | `#E11D48` | Tombol CTA utama, badge aksen mawar, logo mark |
| `--brand-primary-light` | `#FFF1F2` | Latar badge mawar lembut, pilar highlight |
| `--brand-secondary` | `#D4AF37` | Aksen Warm Gold (nuansa pernikahan adat & elegan) |
| `--border-subtle` | `#E2E8F0` | Garis batas struktural kartu & pembatas seksi |

*Aturan:* Satu tema tunggal (Warm Light Mode konsisten dari atas hingga footer). Tidak ada flip ke tema gelap mendadak di tengah scroll.

---

## 3. Tipografi & Skala Hirarki

- **Font Utama:** `Plus Jakarta Sans`, sans-serif (sudah aktif di `index.html`).
- **Font Aksen:** `Playfair Display`, serif — **sudah ter-install di codebase** (`globals.css`), digunakan secara warisan untuk sentuhan kemewahan pada frasa terpilih. Bukan pilihan default baru.
- **Skala:**
  - Hero Headline: `text-4xl sm:text-5xl lg:text-6xl tracking-tight font-extrabold text-slate-900 leading-[1.15]`. Maksimal 2 baris di desktop.
  - Hero Subtext: `text-base sm:text-lg text-slate-600 max-w-[54ch] leading-relaxed`. Maksimal 20 kata, langsung to the point.
  - Section Headline: `text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900`.
  - Body Text: `text-sm sm:text-base text-slate-600 leading-relaxed max-w-[65ch]`.

---

## 4. Struktur Seksi (Ringkas & Padat)

Berdasarkan kesepakatan `/grill-me`:

### 4.1 Navbar (Sticky 64px, Auth-Aware)
- Tinggi tetap 64px (`h-16`), single-line di desktop.
- Logo: Ikon `HeartHandshake` dengan aksen `#E11D48` + tipografi **WeddingPlan**.
- Navigasi jangkar: *Fitur*, *Alur Kerja*, *Undangan Digital*.
- Smart Auth Detection (`useAuthStore`):
  - **Jika sudah login:** Tombol langsung "Buka Dashboard" (ke `/dashboard`).
  - **Jika belum login:** Tombol "Masuk" (ghost) + CTA "Mulai Gratis" (primary rose pill).

### 4.2 Hero Section (Asymmetric Split)
- **Kolom Kiri:**
  - Eyebrow tag: Ikon `Gem` (Lucide) + *"Smart Wedding Planning Mandiri"* — tanpa emoji, menggunakan ikon library.
  - Headline kuat: *"Rencanakan Pernikahan Impian Tanpa Stres & Tanpa Overbudget"*
  - Sub-headline informatif: *"Satu aplikasi untuk kelola anggaran, checklist berkas KUA, seserahan adat, rundown hari-H, dan undangan digital."*
  - Action buttons: "Mulai Rencanakan Gratis" (Primary CTA) & "Pelajari Fitur" (Secondary button).
  - Trust indicator: *"Gratis & siap pakai untuk calon pengantin di Indonesia"*.
- **Kolom Kanan (Informative Feature Highlight Cards):**
  - Bukan preview clone app penuh, melainkan susunan kartu ringkasan visual yang informatif:
    1. **Kartu Budgeting Cerdas:** Indikator progress anggaran & pelunasan DP vendor.
    2. **Kartu Berkas KUA:** Peringatan H-10 batas pendaftaran resmi Kemenag.
    3. **Kartu Seserahan Adat:** Checklist adat siap impor (Jawa, Sunda, Minang, dll).
    4. **Kartu Countdown Live:** Hari bahagia mempelai.

### 4.3 Stats & Trust Strip
3 pilar pembuktian nilai:
- **30+ Berkas KUA:** Panduan resmi N1–N4, Puskesmas, hingga SIMKAH Kemenag.
- **20+ Template Adat:** Seserahan komprehensif nusantara sekali klik.
- **5 Fase Timeline:** Rundown terstruktur mulai dari H-90, gladi resik, hingga hari-H.

### 4.4 5 Fitur Utama (Bento Layout Terstruktur)
1. **💰 Budget Planner Pintar:** 4 metrik anggaran, filter kategori vendor, status DP/Lunas, export PDF & Excel.
2. **📋 Kelengkapan Berkas KUA:** Checklist dokumen pria, wanita, wali, dan kalkulator batas waktu H-10.
3. **🎁 Seserahan & Hantaran Adat:** Katalog adat nusantara, checklist kotak seserahan, status kesiapan barang.
4. **⚙️ Rundown & Operasional Hari-H:** Timeline jam-ke-jam, PIC penanggung jawab acara, dan gladi resik.
5. **💌 Undangan Digital Terintegrasi:** Fitur undangan online modern (Inveet engine) dengan RSVP & peta venue.

### 4.5 Alur Kerja 3 Langkah (Workflow)
1. **Tentukan Target & Tanggal:** Masukkan nama mempelai, tanggal acara, dan estimasi anggaran.
2. **Ikuti Checklist & Pantau Pengeluaran:** Catat DP vendor dan lengkapi berkas nikah sesuai jadwal.
3. **Eksekusi Hari-H dengan Tenang:** Bagikan rundown ke keluarga & vendor agar acara berjalan lancar.

### 4.6 Banner CTA Final & Footer
- Banner kontras elegan dengan ajakan bertindak tunggal: *"Mulai Rencanakan Pernikahanmu Sekarang"*.
- Footer semantik dengan info lisensi, ringkasan fitur, dan tautan akun.

---

## 5. Kaidah Teknis & Anti-Pattern (Ponytail & Taste-Skill)

1. **Konsistensi Label CTA:** Satu kata aksi seragam di seluruh halaman ("Mulai Rencanakan Gratis" untuk registrasi).
2. **Restriksi Eyebrow:** Maksimal 1 eyebrow per 3 seksi untuk menjaga kebersihan visual. Menggunakan ikon Lucide, bukan emoji (taste-skill §3.D).
3. **Zero New Dependencies:** Menggunakan `lucide-react`, Tailwind utility classes, dan komponen `Button` yang telah tersedia.
4. **Mobile Native Collapse:** Seluruh layout 2 kolom dan grid bento secara otomatis runtuh menjadi 1 kolom yang rapi pada layar ponsel (`< 768px`).
5. **Hapus gaya `#root` di `index.css`:** Blok CSS `#root` (width: 1126px, text-align: center, border-inline) adalah sisa scaffold Vite yang mengganggu layout full-width Landing Page. Sudah tidak relevan karena semua halaman menggunakan layout Tailwind sendiri.
