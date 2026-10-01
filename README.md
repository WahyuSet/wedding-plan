# WeddingPlan — Smart Wedding Budgeting & Planner

Aplikasi web untuk pasangan di Indonesia yang merencanakan pernikahan secara mandiri: anggaran, seserahan, rundown hari-H, berkas KUA, dan **undangan digital** dengan RSVP.

## Fitur

1. **Autentikasi & profil mempelai** — register 2 langkah, login (email atau username), sesi lewat cookie httpOnly. Registrasi otomatis membuat 30+ berkas KUA dan 24 tugas rundown.
2. **Dashboard** — countdown, ringkasan anggaran/seserahan/operasional/KUA, donut chart, peringatan berkas mendesak.
3. **Budget Planner** — estimasi vs realisasi, status pembayaran (belum/DP/lunas), export PDF dan Excel.
4. **Seserahan & Hantaran** — checklist, filter asal barang, 20+ template adat yang bisa diimpor, export Excel.
5. **Operasional & Rundown Hari-H** — 5 fase (H-90 s/d pasca nikah), PIC, prioritas, reset ke template.
6. **Dokumen KUA** — checklist 30 berkas, kalkulasi batas pendaftaran H-10 hari kerja, panduan alur.
7. **Undangan Digital**
   - 3 tema: **Noir Calla**, **Chalk & Vow**, **Nocturne Botanica**; gaya bahasa Islami atau Umum; zona waktu WIB/WITA/WIT.
   - Editor 5 tab dengan **pratinjau langsung** (isi form yang belum disimpan), checklist kelengkapan, dan toggle publikasi. Undangan baru **tidak dipublikasikan** sampai Anda mengaktifkannya.
   - **Upload foto dan musik** (foto otomatis diubah ke WebP maks 1920px, kuota 30 file / 100 MB per akun).
   - **Manajemen tamu**: tautan personal per tamu (`/invitation/<slug>/<nama-tamu>-<kode>`; tautan lama `?g=kode` tetap berfungsi), tambah massal, kirim via WhatsApp, tandai terkirim, status RSVP per tamu, ekspor CSV.
   - RSVP dan buku tamu, amplop digital (rekening + alamat kado), Add-to-Calendar (Google + .ics), galeri dengan lightbox.
   - **Domain khusus undangan** (opsional, `INVITATION_URL`): tautan tamu menjadi `https://undangan.com/<slug>/<nama-tamu>-<kode>`, dilayani backend dengan pratinjau Open Graph per undangan.
   - Tanpa domain khusus, tautan bagikan `/share/:slug` dan `/share/:slug/:nama-kode` di backend memuat pratinjau Open Graph (judul + foto sampul) untuk WhatsApp/sosmed, lalu mengalihkan ke undangan.
8. **Superadmin console** — statistik, daftar pengguna, feature flag (`digital_invitation`, `user_registration`, `system_maintenance`) yang benar-benar ditegakkan di backend dan frontend.

## Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand, React Hook Form, Recharts, jsPDF, SheetJS, Sonner.
- **Backend:** Express, TypeScript, Prisma, SQLite, Zod, helmet, express-rate-limit, multer, sharp.
- **Test:** Vitest (frontend dan backend), Supertest.
- Monorepo: `/frontend` dan `/backend`.

## Menjalankan untuk development

```bash
# Backend (http://localhost:5000)
cd backend
cp .env.example .env        # lalu isi JWT_SECRET
npm install
npx prisma migrate deploy   # membuat database dari migrations
npm run seed                # superadmin + akun demo (demo@wedding.com / password123)
npm run dev
```

```bash
# Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Saat seed di development tanpa `ADMIN_PASSWORD`, password superadmin dibuat acak dan ditampilkan sekali di terminal. Perubahan schema: edit `prisma/schema.prisma` lalu `npx prisma migrate dev --name <nama>`.

## Environment variable (backend)

| Variabel | Keterangan |
| --- | --- |
| `JWT_SECRET` | **Wajib.** Minimal 32 karakter di production. Server menolak start jika kosong. |
| `DATABASE_URL` | SQLite, mis. `file:./dev.db`. Di production arahkan ke volume, mis. `file:/data/wedding.db`. |
| `FRONTEND_URL` | Origin frontend (CORS dan tujuan redirect halaman share). |
| `CORS_ORIGIN` | Origin tambahan, dipisah koma. Localhost hanya diizinkan di non-production. |
| `API_PUBLIC_URL` | URL publik backend; dipakai untuk URL file upload dan tautan share. |
| `UPLOAD_DIR` | Folder file upload. Di production arahkan ke volume, mis. `/data/uploads`. |
| `COOKIE_DOMAIN` | Opsional, mis. `.contoh.id` bila frontend dan API beda subdomain. |
| `INVITATION_URL` | Opsional. Origin domain khusus undangan yang dilayani backend ini, mis. `https://undangan.com`. Hostname harus berbeda dari `FRONTEND_URL` dan `API_PUBLIC_URL`. Kosong = undangan dibuka di `FRONTEND_URL/invitation/...`. |
| `INVITATION_DIST_DIR` | Folder build frontend yang disajikan di domain undangan. Default `../frontend/dist`. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Dipakai `npm run seed`. Di production `ADMIN_PASSWORD` wajib (min 12 karakter). |

Frontend: `VITE_API_URL` (lihat `frontend/.env.example`).

## Test dan pengecekan

```bash
cd backend  && npx tsc --noEmit && npm test     # 50 test (auth, IDOR, validasi, flag, tamu, upload, share, domain undangan, rate limit)
cd frontend && npm run lint && npm test && npm run build
```

CI (GitHub Actions) menjalankan semuanya pada tiap push dan pull request, lalu mem-build image Docker dan mengecek domain undangan dilayani dari image itu: `.github/workflows/ci.yml`.

## Deployment

> **Undangan digital di domain terpisah:** sebelum mengatur domain undangan, baca [docs/DEPLOY-UNDANGAN-DIGITAL.md](docs/DEPLOY-UNDANGAN-DIGITAL.md) (catatan deploy, juga untuk agent AI). Rancangannya ada di [docs/RENCANA-UNDANGAN-DOMAIN-TERPISAH.md](docs/RENCANA-UNDANGAN-DOMAIN-TERPISAH.md).

**Sesi memakai cookie httpOnly saja (tanpa token di localStorage)**, jadi frontend dan API harus berada di satu domain induk, mis. `app.contoh.id` dan `api.contoh.id` dengan `COOKIE_DOMAIN=.contoh.id`. Deploy lintas domain berbeda (mis. `*.vercel.app` + `*.railway.app`) tidak akan mempertahankan login.

**Backend (Docker + SQLite):**

```bash
# Dari akar repo (bukan dari folder backend): image ikut mem-build frontend.
docker build -f backend/Dockerfile -t weddingplan-api .
docker run -d -p 5000:5000 -v weddingplan-data:/data \
  -e JWT_SECRET=... -e FRONTEND_URL=https://app.contoh.id \
  -e API_PUBLIC_URL=https://api.contoh.id -e COOKIE_DOMAIN=.contoh.id \
  -e INVITATION_URL=https://undangan.com \
  weddingplan-api
```

- Container menjalankan `prisma migrate deploy` lalu server. Database dan upload disimpan di volume `/data`.
- `INVITATION_URL` opsional. Bila diisi, domain itu diarahkan ke **container backend ini** (bukan ke hosting frontend), dan link tamu menjadi `https://undangan.com/<slug>/<nama-tamu>-<kode>` dengan pratinjau WhatsApp per undangan. Bila tidak diisi, undangan dibuka di `FRONTEND_URL/invitation/...`.
- SQLite berarti **satu instance saja**. Untuk scale-out, pindah ke PostgreSQL (schema Prisma tetap sama).
- Seed pertama kali (membuat superadmin dan feature flag, tanpa akun demo): `docker exec -e ADMIN_PASSWORD=... <container> node dist/prisma/seed.js`.
- **Backup:** salin `/data` secara berkala, atau gunakan `sqlite3 /data/wedding.db ".backup '/backup/wedding.db'"` lewat cron.

**Frontend:** deploy `frontend` ke Vercel/Netlify/Nginx dengan `VITE_API_URL=https://api.contoh.id/api` saat build, dan rewrite semua path ke `index.html` (SPA).

## Catatan keamanan

- Jika password admin lama (`@admin2026`) pernah dipakai di instance mana pun, **ganti sekarang**: nilainya ada di riwayat git.
- Hanya file dengan isi JPG/PNG/WebP/MP3 yang diterima upload (dicek dari isi file, bukan ekstensi).
- Halaman undangan berisi `noindex` dan tidak diindeks mesin pencari (`robots.txt`).
