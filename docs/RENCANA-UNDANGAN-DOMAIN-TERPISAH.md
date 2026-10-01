# Rencana Implementasi: Undangan Digital di Domain Terpisah

Status (2026-10-01): **keempat fase selesai diimplementasi, belum pernah di-deploy**. Bila `INVITATION_URL` diisi, backend melayani domain undangan dan dashboard membuat link langsung ke domain itu. Image Docker sudah dibuild dan dicek oleh job CI `image` (lulus di pull request WahyuSet/wedding-plan#1); Docker tidak ada di mesin pengembang, jadi job itu satu-satunya uji build image.
Catatan deploy untuk agent ada di [DEPLOY-UNDANGAN-DIGITAL.md](DEPLOY-UNDANGAN-DIGITAL.md).

## 1. Tujuan

Halaman undangan digital pindah ke domain sendiri, terpisah dari dashboard, dengan bentuk link:

```
https://undangan.com/<slug-pasangan>/<nama-tamu>-<kode>
https://undangan.com/r-j/jokowi-x7k2mq        ← link personal tamu
https://undangan.com/r-j                      ← undangan umum tanpa nama tamu
```

`undangan.com` di dokumen ini hanya contoh. Domain asli diisi lewat env `INVITATION_URL`.

## 2. Keputusan yang sudah diambil

| Hal | Keputusan |
| --- | --- |
| Bentuk URL | `/<slug-pasangan>/<nama-tamu>-<kode>` di satu domain undangan bersama |
| Slug pasangan | Bebas diisi pasangan (sudah ada), unik se-aplikasi, minimal 3 karakter. `&` diubah jadi `-`, jadi `R&J` menjadi `r-j` |
| Segmen tamu | `nama-kode`. **Kode yang menentukan tamu**, bagian nama hanya hiasan agar link enak dibaca |
| Kode tamu baru | 6 karakter dari `abcdefghjkmnpqrstuvwxyz23456789` (tanpa huruf/angka yang mirip) |
| Link lama | `/invitation/<slug>?g=<kode>` dan `/share/<slug>?g=<kode>` tetap berfungsi |
| Ganti slug pasangan | Diberi peringatan di form. Redirect slug lama **tidak** dikerjakan (lihat bagian 9) |
| Auth dashboard | Tidak berubah: cookie httpOnly, dashboard dan API tetap satu domain induk |
| Siapa yang melayani domain undangan | **Backend** (lihat bagian 3) |

## 3. Arsitektur

```
app.contoh.id   ──► hosting frontend statis (dashboard, landing, login)   [tidak berubah]
api.contoh.id   ──► backend Express (API + /uploads + /share)             [tidak berubah]
undangan.com    ──► backend Express yang SAMA, dibedakan dari header Host [baru]
```

Domain undangan diarahkan ke service backend, bukan ke hosting frontend statis. Backend menyimpan salinan build frontend di dalam image-nya dan, khusus untuk host undangan, mengirim `index.html` yang meta Open Graph-nya sudah diisi data undangan.

Alasannya:

- **Pratinjau WhatsApp.** Crawler WhatsApp tidak menjalankan JavaScript. Kalau domain undangan dilayani hosting statis, semua link undangan akan tampil dengan judul dan gambar landing WeddingPlan. Dengan backend yang merender `<head>`, link cantik langsung punya pratinjau yang benar tanpa lewat `/share`.
- **Tanpa CORS dan tanpa aturan proxy.** Halaman undangan memanggil `/api` di origin yang sama.
- **`robots.txt` dan `noindex` bisa berbeda per domain.** Hosting statis menyajikan satu `robots.txt` untuk semua domain.
- **Deploy sederhana.** Cukup menambah satu custom domain di service backend dan satu env.

Bila `INVITATION_URL` kosong, aplikasi berjalan dalam **mode satu domain** seperti sekarang: undangan di `<FRONTEND_URL>/invitation/<slug>/<nama-kode>` dan pratinjau WhatsApp lewat `/share`. Mode ini dipakai untuk development lokal.

## 4. Fase 1: Format link tamu baru (selesai)

Bisa dirilis sendiri, belum butuh domain baru. Tidak ada perubahan schema Prisma.

Catatan hasil implementasi yang berbeda dari rencana di bawah:

- Route frontend memakai satu pola dengan segmen opsional, `/invitation/:slug/:guestKey?`, supaya halaman tidak dipasang ulang saat URL dirapikan.
- `invitationBaseUrl()` baru membaca `FRONTEND_URL`. Cabang `INVITATION_URL` ditambahkan di Fase 2.
- Fungsi link di frontend belum menerima basis URL; itu bagian Fase 3. Yang ditambah: `guestKey` dan `invitationPath`.
- Peringatan ganti slug membandingkan teks yang diketik dengan slug tersimpan, jadi mengetik `R&J` saat slug tersimpan `r-j` tetap memunculkan peringatan.

### Backend

**`backend/src/controllers/invitation.controller.ts`**

- `createSlug`: tambahkan normalisasi sebelum membuang simbol.
  - `.normalize("NFKD").replace(/[̀-ͯ]/g, "")` agar `André` menjadi `andre`.
  - `.replace(/&/g, " ")` agar `R&J` menjadi `r-j`, bukan `rj`.
- `RESERVED_SLUGS`: tambah `assets`, `invitation`, `invitation-preview`, `invitation-admin`, `budget`, `seserahan`, `operasional`, `dokumen-kua`, `favicon`, `robots`, `sitemap`, `static`, `public`, `www`, `health`, `index`. Di domain undangan slug berada di akar path, jadi tidak boleh bentrok dengan `/assets`, `/api`, `/uploads`, `/share`.
- `newGuestCode`: ganti ke 6 karakter dari alfabet di tabel bagian 2, pakai `crypto.randomInt`. Kolom `code` sudah `@unique` global, jadi tangkap error Prisma `P2002` dan ulangi (maks 5 kali) di `addGuest`. Di `bulkAddGuests`, pastikan kode dalam satu batch tidak kembar lalu ulangi seluruh transaksi bila `P2002`.
- `getPublicGuest`: parameter menjadi `:guestKey`, dicari lewat helper `guestCodeCandidates`. Response ditambah `key` (bentuk kanonik `nama-kode`) agar frontend bisa merapikan URL.
- `publicRsvpSchema.guestCode`: `max(32)` menjadi `max(120)`. `submitPublicRsvp` mencari tamu lewat helper yang sama, jadi field ini menerima kode polos maupun `nama-kode`.

**`backend/src/lib/invitationUrls.ts` (baru)**, fungsi murni agar mudah dites:

```ts
// "jokowi-x7k2mq" → ["jokowi-x7k2mq", "x7k2mq"]
// "joko-widodo-aB-cD3_x" → [..., "widodo-aB-cD3_x", "aB-cD3_x", "cD3_x"]
// Seluruh segmen + setiap sufiks setelah "-", sehingga kode lama (base64url, bisa
// mengandung "-") dan kode baru sama-sama ketemu dengan satu query `code IN (...)`.
export const guestCodeCandidates = (key: string): string[]

// slug nama dipotong 40 karakter; nama tanpa huruf latin → hanya kode.
export const guestKey = (guest: { slug: string; code: string | null }): string | null

// Basis link undangan: INVITATION_URL bila diisi, selain itu `${FRONTEND_URL}/invitation`.
export const invitationBaseUrl = (): string
export const buildInvitationUrl = (slug: string, key?: string | null): string
```

Kandidat disaring ke panjang 4–32 karakter dan `guestKey` dari URL dibatasi 120 karakter sebelum query.

**`backend/src/routes/invitation.routes.ts`**: `/public/:slug/guests/:code` menjadi `/public/:slug/guests/:guestKey`. Path-nya sama, hanya nama parameter.

**`backend/src/controllers/share.controller.ts`**

- Pisahkan pembuatan meta OG menjadi fungsi `buildOgMeta(invitation)` yang mengembalikan `{ title, description, image }`. Fase 2 memakainya lagi.
- Tambah route `GET /share/:slug/:guestKey`. Tujuan redirect dibuat dengan `buildInvitationUrl`.
- `GET /share/:slug?g=<kode>` tetap ada untuk link yang sudah tersebar.

### Frontend

- **`frontend/src/lib/invitationLinks.ts`**: tambah `guestKey(guest)` (kembaran versi backend) dan ubah `publicInvitationUrl` / `shareInvitationUrl` agar menerima basis URL dan `guestKey`, bukan `?g=`.
- **`frontend/src/App.tsx`**: tambah route `/invitation/:slug/:guestKey` di samping `/invitation/:slug`.
- **`frontend/src/pages/invitation/StandaloneInvitationPage.tsx`**: kunci tamu diambil dari `useParams().guestKey`, jatuh ke `?g=` bila tidak ada. Setelah tamu ketemu dan URL tidak kanonik (link `?g=` lama, atau bagian nama tidak cocok), panggil `navigate(..., { replace: true })` ke bentuk `/<slug>/<key>`. RSVP mengirim `guestCode: <key>`. Parameter lama `?to=` tetap didukung.
- **`frontend/src/components/invitation/GuestManager.tsx`**: `linkFor` memakai `guestKey(g)`.
- **`frontend/src/pages/InvitationAdminPage.tsx`**:
  - Hint kolom slug menampilkan contoh link lengkap, mis. `undangan.com/r-j/nama-tamu-kode`.
  - Peringatan di bawah kolom slug bila nilainya berbeda dari slug tersimpan dan undangan sudah dipublikasikan atau ada tamu berstatus terkirim: "Mengubah tautan akan mematikan semua link yang sudah dibagikan."

### Test

- `backend/tests/guests.test.ts`: assertion `c.length >= 8` diganti regex format baru. Tambah kasus: resolve lewat `nama-kode`, lewat kode polos, lewat kode lama yang mengandung `-`, nama di URL salah tetapi kode benar tetap ketemu, kode salah 404, RSVP dengan `nama-kode` tetap satu per tamu.
- `backend/tests/invitation.test.ts`: `R&J` → `r-j`, slug `assets` ditolak.
- `backend/tests/share.test.ts`: route `/share/:slug/:guestKey`.
- `frontend/src/lib/__tests__/invitationLinks.test.ts` (baru): `guestKey` untuk nama biasa, nama panjang, nama tanpa huruf latin, kode null.

## 5. Fase 2: Backend melayani domain undangan (selesai)

Catatan hasil implementasi yang berbeda dari rencana di bawah:

- `INVITATION_DIST_DIR` punya default `../frontend/dist`, jadi untuk uji lokal cukup mengisi `INVITATION_URL`.
- Di luar production, `index.html` dibaca ulang tiap permintaan agar build frontend baru langsung terpakai. Di production dibaca sekali saat start. `index.html` tanpa penanda `seo` diperlakukan sama seperti file yang tidak terbaca.
- Path tak dikenal tanpa ekstensi file dijawab dengan shell berstatus 404 (frontend menampilkan "Undangan Tidak Ditemukan"); path berekstensi dan method selain GET dijawab 404 teks polos.
- Slug di URL domain undangan harus huruf kecil (`[a-z0-9-]+`). `/R-J` tidak dialihkan ke `/r-j`.
- CSP: `img-src` dan `media-src` juga mengizinkan `http:` di luar production, karena file upload lokal dilayani lewat http. Production hanya `https:` dan ditambah `upgrade-insecure-requests`.
- Ketiga tema sudah diuji di `undangan.localhost` tanpa pelanggaran CSP (font Google, foto dari URL luar, API same-origin).

### Env backend (`backend/src/config/env.ts`, `backend/.env.example`)

| Variabel | Keterangan |
| --- | --- |
| `INVITATION_URL` | Opsional. Origin domain undangan, mis. `https://undangan.com`. Tanpa path, tanpa garis miring di akhir. Kosong = mode satu domain. |
| `INVITATION_DIST_DIR` | Folder build frontend yang berisi `index.html`. Di Docker: `/app/web`. |

Validasi saat start:

- Host `INVITATION_URL` harus berbeda dari host `FRONTEND_URL` dan `API_PUBLIC_URL`. Bila sama, keluar dengan pesan error.
- Bila `INVITATION_URL` diisi tetapi `INVITATION_DIST_DIR/index.html` tidak terbaca: keluar dengan error di production, peringatan di development.

### Penanda di `frontend/index.html`

Bungkus blok `<title>`, meta SEO, Open Graph, Twitter, canonical, dan JSON-LD milik landing dengan komentar penanda:

```html
<!--seo:start-->
...blok SEO landing yang sekarang...
<!--seo:end-->
```

Vite tidak membuang komentar HTML saat build. Backend mengganti isi di antara penanda. Link font dan tag `<script>`/`<link>` hasil build berada di luar penanda dan tidak disentuh.

### `backend/src/middleware/invitationSite.ts` (baru)

Dipasang di `app.ts` sebelum handler `/` dan sebelum 404. Hanya aktif bila `INVITATION_URL` diisi dan `req.hostname` sama dengan host-nya. Untuk host lain middleware langsung `next()`, jadi perilaku `api.contoh.id` tidak berubah.

Urutan penanganan di host undangan:

1. `/api/*`: hanya `/api/invitation/public/*`, `/api/settings/public`, dan `/api/health` yang diteruskan. Sisanya 404. Tujuannya agar tidak ada sesi login yang bisa terbentuk di domain yang memuat konten buatan pengguna.
2. `/uploads/*` dan `/share/*`: diteruskan ke handler yang sudah ada.
3. `GET /robots.txt`: `User-agent: *` + `Disallow: /`.
4. File statis dari `INVITATION_DIST_DIR` (`express.static` dengan `index: false`). `/assets/*` diberi cache `immutable` satu tahun.
5. `GET /`: redirect 302 ke `FRONTEND_URL`.
6. `GET /invitation/:slug` dan `/invitation/:slug/:guestKey`: redirect 301 ke `/:slug[/:guestKey]` dengan query dipertahankan.
7. `GET /:slug` dan `GET /:slug/:guestKey`: kirim shell HTML (di bawah), dibatasi `apiLimiter`.
8. Selain itu: 404.

Shell HTML:

- Baca `index.html` sekali saat start, simpan di memori.
- Ambil undangan berdasarkan slug dengan field yang sama seperti `getShareLanding`. Bila tidak ada, belum dipublikasikan, atau flag `digital_invitation` mati: pakai judul generik "Undangan Pernikahan Digital" tanpa data apa pun, sama seperti perilaku `/share` sekarang.
- Ganti isi penanda `seo` dengan: `<title>`, `description`, `og:*`, `twitter:*`, `<meta name="robots" content="noindex, nofollow">`, dan `<meta name="wp-site" content="invitation">`. Semua nilai lewat `escapeHtml`. `og:url` adalah URL kanonik undangan.
- Header: `Cache-Control: no-cache`, `X-Robots-Tag: noindex, nofollow`, dan CSP khusus yang menimpa CSP bawaan helmet:

  ```
  default-src 'self'; script-src 'self'; connect-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  img-src 'self' data: blob: https:; media-src 'self' https:;
  frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  ```

  `img-src`/`media-src` dibuka ke `https:` karena foto galeri dan musik boleh berupa URL luar. Sebelum merge, buka ketiga tema dengan DevTools dan pastikan tidak ada pelanggaran CSP di console.
- Nama tamu tidak dimasukkan ke meta OG.

### `GET /api/settings/public`

`getPublicSettings` di `backend/src/controllers/admin.controller.ts` menambah field `invitation_url: string | null`, termasuk di cabang `catch`. Dashboard memakainya untuk membangun link, jadi **frontend tidak butuh env baru di production**.

### Frontend: mode situs undangan

- **`frontend/src/lib/site.ts` (baru)**
  - `servedByBackend`: ada `<meta name="wp-site" content="invitation">` di dokumen.
  - `isInvitationSite`: `servedByBackend`, atau `import.meta.env.VITE_SITE === "invitation"` (hanya untuk development).
- **`frontend/src/lib/api.ts`**: `API_BASE_URL` menjadi `"/api"` bila `servedByBackend`, selain itu tetap dari `VITE_API_URL`.
- **`frontend/src/App.tsx`**: bila `isInvitationSite`, render hanya `/:slug` dan `/:slug/:guestKey` ke `StandaloneInvitationPage`, plus halaman "tidak ditemukan" untuk path lain. Route dashboard, login, dan landing tidak didaftarkan.
- `StandaloneInvitationPage` membangun URL kanonik dengan awalan `""` di situs undangan dan `/invitation` di mode satu domain.

### Test

`backend/tests/invitationSite.test.ts` (baru) dengan fixture `backend/tests/fixtures/web/index.html` yang berisi penanda. `setupEnv.ts` mengisi `INVITATION_URL=http://undangan.test` dan `INVITATION_DIST_DIR`. Permintaan dikirim dengan `.set("Host", "undangan.test")`.

- `/:slug` berisi `og:title` pasangan, `noindex`, `wp-site`, dan tidak lagi berisi teks SEO landing.
- Undangan belum dipublikasikan atau tidak ada: judul generik, tanpa data.
- Nama mempelai berisi `<script>` ter-escape.
- `/` redirect ke `FRONTEND_URL`. `/robots.txt` berisi `Disallow: /`.
- `/api/auth/login` dan `/api/invitation/config` di host undangan: 404. `/api/invitation/public/:slug`: 200.
- Host lain (`localhost`) tetap mendapat JSON root API seperti sekarang.

`share.test.ts` perlu disesuaikan karena tujuan redirect sekarang domain undangan. Mode satu domain dites lewat unit test `invitationBaseUrl`.

## 6. Fase 3: Dashboard mengarah ke domain undangan (selesai)

Catatan hasil implementasi:

- Dashboard membaca `invitation_url` dari `GET /api/settings/public` saat berjalan, jadi mengganti `INVITATION_URL` di backend cukup dengan restart backend. Dashboard tidak perlu dibuild ulang.
- Dengan domain undangan, "Salin Link", "Buka Undangan", banner tautan, dan pesan WhatsApp semuanya memakai `https://<domain-undangan>/<slug>[/<nama-kode>]`. Tanpa domain undangan, link untuk dibagikan tetap lewat `/share/...`.
- Route `/invitation/:slug/:guestKey?` di dashboard menunggu pengaturan publik termuat, lalu mengalihkan ke domain undangan. Bila pengaturan gagal dimuat, halaman undangan dirender di tempat seperti mode satu domain.
- Link di editor masih mengikuti teks slug yang sedang diketik (belum disimpan), sama seperti sebelumnya.

- **`frontend/src/hooks/usePublicSettings.ts`**: tipe ditambah `invitation_url`.
- **Pembuat link** (`InvitationAdminPage.tsx` baris `publicUrl`/`shareUrl`, `GuestManager.tsx` `linkFor`):
  - `invitation_url` ada → `${invitation_url}/${slug}/${key}`. Link ini dipakai untuk "Buka Undangan", "Salin Link", dan pesan WhatsApp.
  - `invitation_url` kosong → perilaku mode satu domain (`/share/...` untuk dibagikan).
- **Route lama di dashboard**: `/invitation/:slug[/:guestKey]` di domain dashboard melakukan `window.location.replace` ke domain undangan bila `invitation_url` ada, dengan `?g=` dan `?to=` dipertahankan.
- **Pratinjau di editor** (`/invitation-preview` + `postMessage`) tetap di domain dashboard. Tidak diubah.
- **`/share/:slug`** di backend tetap hidup dan sekarang mengalihkan ke domain undangan.

## 7. Fase 4: Docker, CI, dokumentasi (selesai)

Catatan hasil implementasi:

- `backend/.dockerignore` dihapus; penggantinya `.dockerignore` di akar repo.
- CI mendapat job baru `image` (di luar rencana awal): mem-build image, menjalankan container dengan `INVITATION_URL=http://undangan.test`, lalu mengecek robots, shell HTML, aset, redirect akar, penutupan endpoint login, dan `invitation_url` di pengaturan publik. Ini pengganti uji build lokal yang tidak bisa dilakukan tanpa Docker.
- Komentar penjelasan di `frontend/index.html` ditaruh **di dalam** blok penanda. Bila ditaruh di luar, teksnya ikut terkirim ke tamu dan mengecoh pengecekan "blok SEO sudah diganti".
- Pengecekan penanda di CI memakai teks lengkap `<!--seo:start-->` dan `<!--seo:end-->`.

- **`backend/Dockerfile`**: build context pindah ke akar repo (`docker build -f backend/Dockerfile .`). Tambah stage yang menjalankan `npm ci && npm run build` di `frontend/`, lalu `COPY --from=web /web/dist ./web` dan `ENV INVITATION_DIST_DIR=/app/web`. Path `COPY` backend menyesuaikan (`backend/package*.json`, `backend/prisma`, `backend/src`).
- **`.dockerignore` di akar repo** (baru), menggantikan `backend/.dockerignore`: `**/node_modules`, `**/dist`, `**/.env`, `**/*.db*`, `backend/uploads`, `backend/tests`, `.git`.
- **`.github/workflows/ci.yml`**: di job frontend, setelah build, `grep -q "seo:start" dist/index.html` agar penanda tidak hilang tanpa ketahuan.
- **`README.md`**: bagian fitur (bentuk link baru), tabel env, bagian Deployment (perintah `docker build` baru dan rujukan ke catatan deploy).

## 8. Kriteria selesai

- [ ] `https://<domain-undangan>/<slug>/<nama>-<kode>` menampilkan undangan dengan nama tamu di cover, dan RSVP tercatat atas tamu itu.
- [ ] Menempel link tersebut di WhatsApp menampilkan judul "Undangan Pernikahan A & B" dan foto sampul.
- [ ] Link lama `?g=<kode>` (dashboard maupun `/share`) berakhir di URL baru dengan tamu yang benar.
- [ ] Mengubah bagian nama di URL tidak mengubah tamu; mengubah kode menghasilkan undangan tanpa nama tamu.
- [ ] Login dashboard tetap bertahan setelah refresh. Tidak ada endpoint ber-auth yang bisa diakses lewat domain undangan.
- [ ] `INVITATION_URL` dikosongkan: semua berjalan di satu domain seperti sebelumnya.
- [ ] `cd backend && npx tsc --noEmit && npm test` dan `cd frontend && npm run lint && npm test && npm run build` lulus.

## 9. Di luar cakupan

- Redirect otomatis dari slug pasangan lama setelah diganti (butuh tabel riwayat slug).
- Subdomain per pasangan (`r-j.undangan.com`) dan domain milik pasangan sendiri. Keduanya bisa ditambah nanti di atas middleware host yang sama.
- Cek ketersediaan slug saat mengetik.
- Nama tamu di pratinjau WhatsApp.
- Melayani dashboard dari backend juga (satu image untuk semuanya).

## 10. Risiko

| Risiko | Penanganan |
| --- | --- |
| Kode 6 karakter bisa ditebak dengan brute force | Ruang kode sekitar 887 juta dan `apiLimiter` 300 permintaan/menit per IP. Untuk undangan 300 tamu, butuh rata-rata hampir seminggu memukul terus-menerus dari satu IP untuk menemukan satu link. Hasilnya hanya nama tamu dan kemampuan mengisi RSVP atas namanya. Panjang kode adalah satu konstanta, bisa dinaikkan ke 8. |
| CSP memblokir aset tema | Uji ketiga tema di host undangan sebelum merge (lihat Fase 2). |
| Versi dashboard dan versi undangan berbeda karena dibuild terpisah | Deploy keduanya dari commit yang sama pada setiap rilis. |
| Proxy/CDN mengubah header `Host` | Middleware bergantung pada host. Dijelaskan di catatan deploy. |
| Slug yang sudah ada bentrok dengan kata baru di `RESERVED_SLUGS` | Slug otomatis selalu punya sufiks acak, jadi kecil kemungkinannya. Query pengecekan ada di catatan deploy. |

## 11. Menguji secara lokal

Browser me-resolve `*.localhost` ke komputer sendiri, jadi tidak perlu mengubah file hosts.

```bash
cd frontend && npm run build
```

Tambahkan ke `backend/.env`:

```
INVITATION_URL="http://undangan.localhost:5000"
```

Jalankan backend, lalu buka `http://undangan.localhost:5000/<slug>/<nama>-<kode>`. Undangannya harus sudah dipublikasikan. Dashboard tetap di `http://localhost:5174`.

Selama `INVITATION_URL` terisi, link `/share/...` mengalihkan ke domain undangan itu, jadi `frontend/dist` harus sudah dibuild. Hapus barisnya untuk kembali ke mode satu domain.

Untuk mengerjakan tampilan dengan hot reload tanpa build, jalankan Vite kedua dengan `VITE_SITE=invitation` di port lain. Mode ini tidak menguji meta OG maupun CSP.
