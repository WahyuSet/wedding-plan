# Catatan Deploy: Undangan Digital di Domain Terpisah

Untuk agent AI (atau siapa pun) yang akan men-deploy WeddingPlan. Baca sampai habis sebelum menyentuh DNS, env, atau Dockerfile.

Fiturnya selesai diimplementasi 2026-10-01 (keempat fase di [RENCANA-UNDANGAN-DOMAIN-TERPISAH.md](RENCANA-UNDANGAN-DOMAIN-TERPISAH.md)), tetapi **belum pernah di-deploy ke production**. Kode adalah sumber kebenaran: bila isi dokumen ini berbeda dari kode, ikuti kode dan perbarui dokumen ini.

Yang sudah dan belum teruji per tanggal itu:

- Sudah: test otomatis backend dan frontend; ketiga tema dibuka di `http://undangan.localhost:5000` (mode development); backend hasil build dijalankan dengan `NODE_ENV=production` tanpa Docker.
- Sudah: image Docker dibuild dan dicek oleh job `image` di `.github/workflows/ci.yml`, lulus pada pull request WahyuSet/wedding-plan#1 (2026-10-01). Job itu menjalankan container dengan `INVITATION_URL=http://undangan.test` dan mengecek robots, shell HTML, aset, redirect akar, penutupan endpoint login, dan `invitation_url`.
- Docker tidak terpasang di mesin pengembang, jadi job `image` adalah satu-satunya uji build image. Pastikan job itu hijau untuk commit yang akan di-deploy.
- **Belum: HTTPS sungguhan, proxy/CDN di depan backend, dan pratinjau link di aplikasi WhatsApp.** Ketiganya baru bisa dicek saat deploy (bagian 6).

## 1. Gambaran

Undangan digital punya domain sendiri, terpisah dari dashboard. Link tamu berbentuk:

```
https://<domain-undangan>/<slug-pasangan>/<nama-tamu>-<kode>
```

Ada tiga hostname dan dua tempat deploy:

| Hostname (contoh) | Dilayani oleh | Isi |
| --- | --- | --- |
| `app.contoh.id` | Hosting frontend statis | Landing, login, dashboard, editor undangan |
| `api.contoh.id` | Service backend (Docker) | API, `/uploads`, `/share` |
| `undangan.com` | **Service backend yang sama** | Halaman undangan publik + API publik undangan |

Backend membedakan `api.contoh.id` dan `undangan.com` dari header `Host`. Image backend berisi salinan build frontend untuk disajikan di domain undangan.

## 2. Langkah 0: pastikan fiturnya sudah ada di kode

Jangan lanjut ke DNS sebelum ini terkonfirmasi.

```bash
grep -n "INVITATION_URL" backend/src/config/env.ts
```

```bash
ls backend/src/middleware/invitationSite.ts
```

```bash
grep -n "seo:start" frontend/index.html
```

```bash
grep -n "frontend" backend/Dockerfile
```

- Keempatnya ada: lanjut ke bagian 3.
- Ada yang kosong: kode di checkout ini tidak memuat fiturnya (branch lama, atau perubahannya belum di-commit/di-push). **Berhenti**, laporkan ke user, dan jangan mencoba mengakalinya lewat konfigurasi hosting. Tanpa `INVITATION_URL`, aplikasi tetap bisa di-deploy dalam mode satu domain mengikuti bagian Deployment di `README.md`.

Lalu cek job `image` pada run CI terakhir untuk commit yang akan di-deploy. Bila merah atau belum pernah jalan, selesaikan itu dulu: itu satu-satunya bukti image bisa dibuild.

## 3. Yang harus ditanyakan ke user

Jangan menebak dan jangan membeli atau mengubah apa pun tanpa persetujuan user.

1. Nama domain undangan yang dipakai, dan apakah sudah dibeli.
2. Siapa yang mengubah DNS: user sendiri, atau agent diberi akses.
3. Hosting backend yang dipakai dan apakah mendukung lebih dari satu custom domain pada satu service.
4. Apakah sudah ada undangan yang linknya tersebar ke tamu. Ini menentukan seberapa hati-hati soal link lama.

## 4. Jangan lakukan ini

1. **Jangan arahkan domain undangan ke hosting frontend statis** (Vercel, Netlify, Cloudflare Pages). Halamannya akan terbuka, tetapi pratinjau link di WhatsApp menampilkan judul dan gambar landing WeddingPlan, `robots.txt` salah, dan panggilan `/api` gagal. Domain undangan harus menuju service backend.
2. **Jangan menambahkan domain undangan ke `CORS_ORIGIN`.** Halaman undangan memanggil API di origin yang sama, jadi CORS tidak diperlukan. Menambahkannya justru memberi domain yang memuat konten buatan pengguna izin kredensial ke API dashboard.
3. **Jangan mengubah `COOKIE_DOMAIN`, `FRONTEND_URL`, atau `API_PUBLIC_URL`** karena fitur ini. Auth dashboard tidak berubah: cookie httpOnly, dashboard dan API tetap harus satu domain induk.
4. **Jangan menjalankan lebih dari satu instance backend.** Database SQLite di volume `/data`.
5. **Jangan build image dari folder `backend/`.** Build context harus akar repo karena image ikut mem-build `frontend/`.
6. **Jangan memakai `prisma db push`.** Gunakan `prisma migrate deploy` (sudah dijalankan otomatis saat container start). Fitur ini tidak menambah migrasi.
7. **Jangan mengganti domain undangan setelah link tersebar** tanpa redirect dari domain lama. Semua link yang sudah dikirim ke tamu akan mati.
8. **Jangan menulis secret** (`JWT_SECRET`, `ADMIN_PASSWORD`) ke file yang ikut di-commit atau ke dokumen ini.

## 5. Langkah deploy

### 5.1 Build image

```bash
docker build -f backend/Dockerfile -t weddingplan-api .
```

Di platform yang mem-build dari repo (Railway, Render, Fly, dan sejenisnya): set root directory ke akar repo dan Dockerfile path ke `backend/Dockerfile`. Bila sebelumnya root directory-nya `backend`, ini harus diubah.

File yang dikecualikan dari build context diatur `.dockerignore` di akar repo (`backend/.dockerignore` sudah tidak ada). Build frontend di dalam image tidak membutuhkan `VITE_API_URL`.

### 5.2 Env backend

Tambahkan satu variabel ke env yang sudah ada:

```
INVITATION_URL=https://undangan.com
```

- Hanya origin: pakai `https://`, tanpa path, tanpa garis miring di akhir.
- Hostname-nya harus berbeda dari hostname `FRONTEND_URL` dan `API_PUBLIC_URL`. Server menolak start bila sama.
- `INVITATION_DIST_DIR` sudah diisi di dalam image (`/app/web`). Tidak perlu diset manual.

Frontend dashboard tidak butuh env baru. Dashboard membaca domain undangan dari `GET /api/settings/public`.

### 5.3 Domain dan DNS

1. Tambahkan domain undangan sebagai custom domain **kedua** pada service backend (domain pertama tetap `api.contoh.id`).
2. Buat record DNS sesuai instruksi hosting (biasanya `CNAME`, atau `A`/`ALIAS` untuk domain apex).
3. Tunggu sertifikat SSL terbit.
4. Varian `www`: bila dipakai, redirect ke domain utama di level DNS/hosting. Backend hanya mengenali satu hostname persis seperti di `INVITATION_URL`.

### 5.4 Proxy atau CDN di depan backend

Backend memilih perilaku dari hostname permintaan, jadi hostname asli harus sampai ke Express.

- Nginx: `proxy_set_header Host $host;` dan `proxy_set_header X-Forwarded-Proto $scheme;`.
- Caddy `reverse_proxy` dan Cloudflare (mode proxy) meneruskan `Host` secara default.
- Platform yang mengganti `Host` dengan hostname internal harus mengirim `X-Forwarded-Host`. Express sudah `trust proxy` di production.

Gejala bila host tidak sampai: membuka domain undangan menghasilkan JSON "Wedding Planner Backend API Server is Running".

### 5.5 Deploy ulang dashboard

Deploy frontend dashboard dari commit yang sama dengan backend, supaya editor undangan membuat link dengan format baru. Dashboard membaca domain undangan dari backend saat halaman dibuka, jadi setelah itu mengganti `INVITATION_URL` cukup dengan restart backend, tanpa build ulang dashboard.

### 5.6 Cek slug yang bentrok (hanya bila sudah ada data)

Slug pasangan sekarang berada di akar path domain undangan, jadi beberapa kata dicadangkan. Jalankan di database production:

```bash
sqlite3 /data/wedding.db "SELECT slug FROM DigitalInvitation WHERE slug IN ('assets','invitation','invitation-preview','invitation-admin','budget','seserahan','operasional','dokumen-kua','favicon','robots','sitemap','static','public','www','health','index','admin','api','login','register','dashboard','settings','share','uploads');"
```

Hasil kosong berarti aman. Bila ada, laporkan ke user sebelum mengubah apa pun. Daftar kata yang berlaku ada di `RESERVED_SLUGS` pada `backend/src/controllers/invitation.controller.ts`.

## 6. Verifikasi setelah deploy

Ganti `undangan.com`, `api.contoh.id`, `app.contoh.id`, dan `<slug>` dengan nilai asli. `<slug>` harus undangan yang sudah dipublikasikan.

**Host undangan dikenali** (harus redirect 302 ke dashboard, bukan JSON):

```bash
curl -sI https://undangan.com/
```

**Shell berisi meta undangan** (harus muncul nama pasangan, `noindex`, dan `wp-site`):

```bash
curl -s https://undangan.com/<slug> | grep -E "og:title|noindex|wp-site"
```

**API publik lewat domain undangan** (harus 200):

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://undangan.com/api/invitation/public/<slug>
```

**Endpoint ber-auth tertutup di domain undangan** (harus 404):

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://undangan.com/api/auth/login
```

**Tidak diindeks** (harus berisi `Disallow: /`):

```bash
curl -s https://undangan.com/robots.txt
```

**API lama tidak berubah** (harus JSON status ok):

```bash
curl -s https://api.contoh.id/api/health
```

**Dashboard tahu domain undangan** (harus berisi `invitation_url`):

```bash
curl -s https://api.contoh.id/api/settings/public
```

Lalu uji di browser, karena tidak bisa digantikan `curl`:

1. Login di dashboard, refresh, pastikan sesi bertahan.
2. Di editor undangan, tambah satu tamu dan salin linknya. Linknya harus berbentuk `https://undangan.com/<slug>/<nama>-<kode>`.
3. Buka link itu di jendela incognito: nama tamu tampil di cover, console tanpa error CSP, foto dan musik termuat.
4. Kirim RSVP, lalu cek statusnya muncul pada tamu tersebut di dashboard.
5. Tempel link ke chat WhatsApp: pratinjau menampilkan nama pasangan dan foto sampul. WhatsApp menyimpan cache pratinjau per URL, jadi pakai link tamu yang belum pernah ditempel bila hasilnya tampak basi.
6. Bila ada link lama (`/invitation/<slug>?g=<kode>` atau `/share/<slug>?g=<kode>`), buka dan pastikan berakhir di URL baru dengan tamu yang benar.

## 7. Bila ada masalah

| Gejala | Penyebab yang paling mungkin |
| --- | --- |
| Domain undangan menampilkan JSON API | Header `Host` tidak sampai ke backend, atau `INVITATION_URL` tidak sama persis dengan hostname yang dibuka (mis. `www`). Lihat 5.4. |
| Container gagal start, log menyebut `INVITATION_DIST_DIR` | Image dibuild dari folder `backend/`, bukan dari akar repo. Lihat 5.1. |
| Container gagal start, log menyebut host harus berbeda | `INVITATION_URL` diisi dengan domain dashboard atau domain API. |
| Halaman undangan putih, console penuh error CSP | Tema memuat aset dari sumber yang belum diizinkan. Perbaiki daftar CSP di `backend/src/middleware/invitationSite.ts`, jangan mematikan CSP. |
| Pratinjau WhatsApp menampilkan landing WeddingPlan | Domain undangan mengarah ke hosting frontend statis. (Bila penanda `<!--seo:start-->` hilang dari `index.html`, container menolak start, jadi bukan itu penyebabnya.) |
| Slug berhuruf besar (`/R-J`) menampilkan "Undangan Tidak Ditemukan" | Memang begitu: slug di URL harus huruf kecil persis seperti yang tersimpan. |
| Link dari dashboard masih `/share/...` atau `/invitation/...` | `INVITATION_URL` belum diset di backend, atau dashboard belum di-deploy ulang. |
| Login dashboard tidak bertahan | Bukan dari fitur ini. Cek `COOKIE_DOMAIN` dan apakah dashboard dan API satu domain induk (lihat `README.md`). |

## 8. Rollback

Hapus `INVITATION_URL` dari env backend lalu restart. Aplikasi kembali ke mode satu domain dan dashboard kembali membuat link `/share/...`.

Konsekuensinya: link `https://undangan.com/...` yang sudah dikirim ke tamu **tidak bisa dibuka** selama rollback, karena backend tidak lagi mengenali host itu. Bila sudah ada link tersebar, sampaikan ini ke user dan minta keputusan sebelum rollback. Memperbaiki ke depan biasanya lebih aman daripada rollback.

## 9. Setelah selesai

Laporkan ke user: domain yang aktif, hasil tiap pengecekan di bagian 6 (termasuk yang gagal atau dilewati), dan perubahan konfigurasi hosting yang dibuat. Bila ada langkah di dokumen ini yang ternyata tidak cocok dengan kode, perbarui dokumennya di commit yang sama.
