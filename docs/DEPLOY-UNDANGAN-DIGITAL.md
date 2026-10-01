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
5. Apakah sudah ada instance yang live dengan data pengguna. Bila ya, ikuti bagian 4A sebelum bagian 5.

## 4. Jangan lakukan ini

1. **Jangan arahkan domain undangan ke hosting frontend statis** (Vercel, Netlify, Cloudflare Pages). Halamannya akan terbuka, tetapi pratinjau link di WhatsApp menampilkan judul dan gambar landing WeddingPlan, `robots.txt` salah, dan panggilan `/api` gagal. Domain undangan harus menuju service backend.
2. **Jangan menambahkan domain undangan ke `CORS_ORIGIN`.** Halaman undangan memanggil API di origin yang sama, jadi CORS tidak diperlukan. Menambahkannya justru memberi domain yang memuat konten buatan pengguna izin kredensial ke API dashboard.
3. **Jangan mengubah `COOKIE_DOMAIN`, `FRONTEND_URL`, atau `API_PUBLIC_URL`** karena fitur ini. Auth dashboard tidak berubah: cookie httpOnly, dashboard dan API tetap harus satu domain induk.
4. **Jangan menjalankan lebih dari satu instance backend.** Database SQLite di volume `/data`.
5. **Jangan build image dari folder `backend/`.** Build context harus akar repo karena image ikut mem-build `frontend/`.
6. **Jangan memakai `prisma db push`.** Gunakan `prisma migrate deploy` (sudah dijalankan otomatis saat container start). Fitur ini tidak menambah migrasi.
7. **Jangan mengganti domain undangan setelah link tersebar** tanpa redirect dari domain lama. Semua link yang sudah dikirim ke tamu akan mati.
8. **Jangan menjalankan container baru di atas data live tanpa backup dan tanpa baseline migrasi.** Lihat bagian 4A.
9. **Jangan menulis secret** (`JWT_SECRET`, `ADMIN_PASSWORD`) ke file yang ikut di-commit atau ke dokumen ini.

## 4A. Bila sudah ada data live (upgrade dari versi lama)

Bagian ini wajib dibaca bila sudah ada instance yang dipakai pengguna. Versi sebelum commit `0f6cd26` tidak punya folder migrasi, jadi database-nya dibuat dengan `prisma db push` dan tidak punya tabel `_prisma_migrations`.

Hasil simulasi 2026-10-01 (database schema commit `fd85a85` berisi data contoh, lalu dimigrasikan ke versi sekarang):

- `prisma migrate deploy` langsung pada database lama **gagal dengan error P3005** ("The database schema is not empty"). Data tidak tersentuh. Di Docker, container berhenti saat start karena perintah itu dijalankan sebelum server.
- Setelah `prisma migrate resolve --applied 0_init`, `migrate deploy` berhasil dan semua data tetap ada: akun dan hash password, anggaran, undangan (slug dan status publikasi tidak berubah), tamu, dan RSVP.
- Tiap tamu lama mendapat kode acak 12 karakter. RSVP lama tetap ada tetapi tidak terikat ke tamu tertentu (`guestId` kosong), sama seperti sebelumnya.

Detail instance yang live (domain, IP, keadaan reverse proxy) **sengaja tidak ditulis di dokumen ini karena repo ini publik**. Bila ada, baca `docs/instance.local.md` (tidak ikut git); bila tidak ada, tanyakan ke pemilik. Jangan menulis domain, IP, atau isi `.env` instance ke file yang ikut di-commit.

### Jalur A: tetap systemd di VPS (disarankan bila versi lama berjalan lewat systemd)

Fitur domain undangan tidak butuh Docker. Backend cukup menemukan build frontend di `INVITATION_DIST_DIR`. Dengan tetap memakai systemd, file database tidak perlu dipindahkan sama sekali.

Kerjakan dalam dua tahap, supaya masalah data dan masalah domain tidak tercampur.

**Bila dashboard dan API berada di satu domain** (dashboard dibuild dengan `VITE_API_URL="/api"` dan reverse proxy meneruskan `/api` ke backend), periksa tiga hal di konfigurasi Nginx domain dashboard sebelum Tahap 1 selesai:

- `/uploads/` dan `/share/` harus ikut diteruskan ke backend. Versi lama tidak punya keduanya, jadi konfigurasi lama biasanya hanya meneruskan `/api`, dan kedua path itu jatuh ke `index.html` dashboard. Cara cek dari luar: `curl -sI https://<domain-dashboard>/share/tes` yang menjawab `text/html` dashboard berarti belum diteruskan.

  ```nginx
  # File upload (foto/musik) dan halaman share dilayani backend, bukan folder dashboard.
  location /uploads/ { proxy_pass http://127.0.0.1:5000; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
  location /share/   { proxy_pass http://127.0.0.1:5000; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
  ```

- `client_max_body_size 12m;` di blok `/api`. Batas bawaan Nginx 1 MB, sedangkan upload foto sampai 5 MB dan musik sampai 10 MB. Tanpa ini upload gagal dengan 413.
- `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` di blok `/api`. Versi baru membatasi permintaan per IP (login: 10 percobaan per 15 menit). Tanpa header ini semua pengguna terhitung sebagai satu IP dan saling mengunci.

Pada susunan satu domain seperti ini, `FRONTEND_URL` dan `API_PUBLIC_URL` berisi origin yang sama, dan `COOKIE_DOMAIN` **jangan diisi**: cookie yang terikat ke host dashboard tidak ikut terkirim ke subdomain lain, termasuk domain undangan.

Port `5000` di contoh mengikuti `.env.example`; pakai port yang sebenarnya dipakai service. Setelah mengubah Nginx: `sudo nginx -t && sudo systemctl reload nginx`.

**Tahap 1: naik versi tanpa domain undangan** (`INVITATION_URL` belum diisi)

1. Catat commit yang sedang jalan (`git rev-parse HEAD`) untuk rollback, dan pastikan Node di VPS versi 20.9 atau lebih baru (`node -v`). Itu syarat pustaka `sharp` yang dipakai untuk upload foto; CI memakai Node 22.
2. Hentikan service: `sudo systemctl stop <nama-service>`.
3. Backup database ke luar folder aplikasi. Jangan lanjut sebelum file backup ada dan ukurannya masuk akal:

   ```bash
   mkdir -p ~/backup && cp backend/prisma/dev.db ~/backup/wedding-$(date +%F-%H%M).db && ls -l ~/backup
   ```

   Bila ada file `dev.db-journal` di sampingnya, service belum berhenti dengan bersih. Selesaikan itu dulu.
4. Ambil kode baru: `git fetch && git checkout main && git pull --ff-only`.
5. Sesuaikan `backend/.env` (file ini tidak ikut git, jadi isinya masih versi lama):

   | Variabel | Yang harus dilakukan |
   | --- | --- |
   | `JWT_SECRET` | **Wajib minimal 32 karakter**, kalau tidak server menolak start. Versi lama punya nilai cadangan di kode yang ikut tersimpan di riwayat git; bila `.env` lama tidak mengisinya, buat nilai baru. Mengganti nilainya membuat semua pengguna login ulang. |
   | `NODE_ENV` | Harus `production`. |
   | `FRONTEND_URL` | Baru, wajib: origin dashboard, mis. `https://app.contoh.id`. Default-nya `http://localhost:5173`. |
   | `API_PUBLIC_URL` | Baru: origin API, dipakai untuk URL file upload. |
   | `UPLOAD_DIR` | Baru: folder upload. Pakai path absolut di luar folder repo dan pastikan bisa ditulis user service. |
   | `COOKIE_DOMAIN` | Isi `.contoh.id` bila dashboard dan API berbeda subdomain. |
   | `CORS_ORIGIN`, `DATABASE_URL`, `PORT` | Biarkan seperti semula. |

6. Build backend dan frontend:

   ```bash
   cd backend && npm ci && npm run build
   ```

   ```bash
   cd ../frontend && npm ci && npm run build
   ```

   `frontend/.env` lama (berisi `VITE_API_URL`) tetap dipakai untuk build dashboard. Bila `root` Nginx untuk dashboard bukan `frontend/dist` di repo ini, salin hasil build ke folder itu seperti deploy sebelumnya.
7. Tandai baseline, lalu jalankan migrasi (dari folder `backend`). Kedua perintah ini sudah diuji pada simulasi:

   ```bash
   npx prisma migrate resolve --applied 0_init
   ```

   ```bash
   npx prisma migrate deploy
   ```

   Baseline hanya sekali seumur database. Bila `migrate deploy` gagal, jangan start service; lihat Rollback.
8. Start service dan lihat lognya: `sudo systemctl start <nama-service> && journalctl -u <nama-service> -n 30`. Unit systemd tidak perlu diubah selama `WorkingDirectory`-nya folder `backend` dan `ExecStart`-nya `node dist/index.js`.
9. Cek data: login dengan akun lama, buka anggaran, buka undangan yang sebelumnya sudah dipublikasikan, dan buka satu tautan tamu lama.
10. Ganti password superadmin bila masih memakai nilai lama dari versi sebelumnya (nilai itu ada di riwayat git). Dari folder `backend`, dengan `NODE_ENV=production` di `.env`:

    ```bash
    ADMIN_PASSWORD='<password baru, minimal 12 karakter>' npm run seed:prod
    ```

    Seed di production hanya memperbarui password superadmin dan memastikan feature flag ada. **Jangan menjalankan `npm run seed` (versi development) di VPS**: ia menghapus dan membuat ulang akun demo.

**Tahap 2: aktifkan domain undangan** (setelah Tahap 1 stabil)

1. Buat record DNS `A` untuk domain undangan ke IP VPS, tunggu sampai `nslookup <domain-undangan>` menjawab IP itu, lalu terbitkan sertifikat SSL-nya (mis. `sudo certbot --nginx -d <domain-undangan>`).
2. Tambahkan server block Nginx yang meneruskan **semua** path domain undangan ke backend, dengan header `Host` asli:

   ```nginx
   server {
     server_name <domain-undangan>;
     location / {
       proxy_pass http://127.0.0.1:5000;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
   }
   ```

   Jangan arahkan domain undangan ke folder `frontend/dist` secara langsung (lihat bagian 4 nomor 1). Bila varian `www` juga dipakai, buat server block terpisah yang hanya me-redirect ke domain utamanya; backend hanya mengenali hostname persis seperti di `INVITATION_URL`.
3. Tambahkan ke `backend/.env`: `INVITATION_URL=https://<domain-undangan>` dan `INVITATION_DIST_DIR=<path absolut ke frontend/dist>`.
4. Restart service, lalu jalankan pengecekan bagian 6. Pada susunan satu domain, domain dashboard dan domain API di perintah-perintah itu sama.

Setelah Tahap 2, tautan tamu berbentuk `https://<domain-undangan>/<slug>/<nama-tamu>-<kode>`, dan tautan lama di `<domain-dashboard>/invitation/...` dialihkan ke sana.

Contoh Nginx dan langkah Tahap 2 belum pernah dijalankan di server sungguhan; sesuaikan dengan konfigurasi yang sudah ada di VPS.

### Jalur B: pindah ke Docker

Hanya bila pemilik memang ingin pindah dari systemd. Perintah `docker` di bawah belum pernah dijalankan; periksa hasil tiap langkah.

1. Hentikan service lama dan backup database seperti Jalur A langkah 2–3.
2. Salin database ke volume container dengan nama `wedding.db`, pemilik user `node` (uid 1000):

   ```bash
   docker volume create weddingplan-data
   ```

   ```bash
   docker run --rm -v weddingplan-data:/data -v /path/ke/backend/prisma:/src:ro node:22-slim sh -c "cp /src/dev.db /data/wedding.db && chown -R 1000:1000 /data"
   ```

   Bila langkah ini dilewati, container membuat database baru yang kosong. Data lama tidak hilang, tetapi aplikasi tampak kosong dan pengguna bisa mendaftar ulang, sehingga datanya terbelah dua.
3. Tandai baseline sebelum container dijalankan:

   ```bash
   docker run --rm -v weddingplan-data:/data weddingplan-api npx prisma migrate resolve --applied 0_init
   ```

4. Jalankan container seperti bagian 5, lalu cek data seperti Jalur A langkah 9–10.

### Yang berubah bagi pengguna lama

- Pengguna mungkin perlu login ulang satu kali, karena sesi sekarang hanya lewat cookie (token di localStorage tidak dipakai lagi). Password tidak berubah.
- Login baru bertahan hanya bila dashboard dan API berada di satu domain induk dan lewat HTTPS. Versi lama masih bisa jalan lintas domain karena memakai token di localStorage; versi ini tidak.
- Tautan undangan lama (`/invitation/<slug>`, `?to=Nama`, `/share/<slug>`) tetap berfungsi, dan dialihkan ke domain undangan bila `INVITATION_URL` diisi.

### Rollback

Hentikan service (atau container), kembalikan file backup ke `backend/prisma/dev.db`, `git checkout <commit lama>`, build ulang, lalu start. Jangan menjalankan versi lama di atas database yang sudah dimigrasikan.

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
