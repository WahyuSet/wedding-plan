# Tindak lanjut audit antislop 001: Nocturne Botanica

Tanggal: 2026-10-01. Semua nomor 1 sampai 13 disetujui user (nomor 2 lewat perbaikan halaman admin), ditambah nomor 14 yang ditemukan saat menyusun rencana.

Pemeriksaan: `npm run typecheck`, `npm run lint`, `npm test` (35 tes lolos, 8 di antaranya baru), tema lewat `localhost:5174/invitation-preview` di 375x812, admin lewat `localhost:5174/invitation-admin` dengan akun demo dari berkas seed.

## Status per nomor

| No | Status | Bukti |
|---|---|---|
| 1 | Selesai | Nama 14 huruf tampil 36px; tepi kanan huruf di x=234 (sampul), 235 (pembuka), 293 (penutup) dari lebar 375 |
| 2 | Selesai, dengan catatan | Lihat bagian "Nomor 2" di bawah |
| 3 | Selesai | Kontras placeholder terukur 6,49:1 (sebelumnya 4,35:1) |
| 4 | Selesai | `font-weight` terpasang pada `h1` pembuka: 400 (sebelumnya 700) |
| 5 | Selesai | Label di atas enam judul section dihapus; garis emas pendek dipertahankan. "Hadiah Digital" menjadi "Tanda Kasih" |
| 6 | Selesai | Animasi berulang di halaman: 8 (sebelumnya 18). Sampul: 6 titik, dibatasi sampai y=365, teks pertama mulai y=364 |
| 7 | Selesai | Elemen dengan `backdrop-filter`: 0 (sebelumnya 10) |
| 8 | Selesai | Judul "(3)" dan 3 konfirmasi tampil; yang tanpa pesan hanya nama, status, tanggal |
| 9 | Selesai | Teks di bawah 12px: 0 dari 92 (sebelumnya 4) |
| 10 | Selesai | `text-balance` pada nama lengkap mempelai |
| 11 | Selesai | Spasi nyata sebelum "&" di sampul dan pembuka |
| 12 | Selesai | `fieldset` + 3 radio; pilihan terpilih berlatar emas, cincin fokus emas terlihat; isian jumlah tamu hilang saat tidak hadir |
| 13 | Selesai | Nocturne dan Noir Calla memakai `shared/Lightbox.tsx`: dialog modal, panah berputar (1 ke 6), Tab tetap di dalam, Escape menutup, fokus kembali ke ubin; warna latar tiap tema dipertahankan |
| 14 | Selesai | Kontras garis tepi isian terukur 3,27:1 (sebelumnya 1,51:1) |

## Nomor 2: foto stok

Yang dikerjakan:

- Formulir admin tidak lagi mengisi otomatis foto sampul, pembuka, dan mempelai.
- Isian "Foto Pembuka" baru (URL, unggah, Master Galeri, pratinjau). Diuji: diisi, disimpan, dimuat ulang, nilainya bertahan dan tersimpan di database.
- "Tambah Manual" di galeri menambah baris kosong dengan kotak "Belum ada foto"; keterangan bawaan "Momen Bahagia" dihapus.
- Chalk & Vow memakai foto pembuka bila diisi, selain itu foto sampul.

Temuan tambahan saat mengerjakan: skema database (`backend/prisma/schema.prisma` baris 125 sampai 126) memberi foto stok sebagai nilai bawaan `coverPhotoUrl` dan `heroPhotoUrl` untuk setiap undangan baru. Menghapus pengisian otomatis di formulir saja tidak cukup.

Penanganan tanpa migrasi database: `frontend/src/lib/invitationDefaults.ts` menganggap dua URL bawaan skema itu sebagai "belum diisi". Penyaring ini dipakai di `parseInvitation` (semua tema) dan di formulir admin. Diuji di tiga tema dengan data berisi URL bawaan skema: 0 gambar memakai URL itu.

Yang belum tuntas:

- Skema database masih memberi nilai bawaan itu. Perbaikan tuntasnya adalah migrasi Prisma yang menghapus `@default` kedua kolom; ini menyentuh backend dan menunggu keputusan user.
- Undangan lama yang sudah menyimpan foto mempelai dari Master Galeri tidak dibersihkan, karena tidak bisa dibedakan dari pilihan sengaja.

Efek pada data uji: undangan akun demo semula berisi foto sampul dan pembuka bawaan skema. Setelah disimpan dari formulir baru, keduanya menjadi kosong di database.

## Keterbatasan verifikasi

- Jendela aplikasi sering tidak menggambar frame, jadi sebagian besar pemeriksaan lewat pengukuran DOM. Screenshot yang berhasil: sampul dan pembuka Nocturne, pembuka dengan nama panjang, dan isian Foto Pembuka di admin.
- Klik di halaman admin dijalankan lewat skrip, bukan klik tetikus.
- Tombol musik dan penghentian animasi untuk gerak-dikurangi dinilai dari kode.
