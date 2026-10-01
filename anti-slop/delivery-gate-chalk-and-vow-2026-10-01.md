# Delivery Gate antislop: tema Chalk & Vow

Tanggal: 2026-10-01. Mode: selama pengerjaan. Diuji lewat `http://localhost:5174/invitation-preview` dengan data contoh.

Design Read: undangan pernikahan satu halaman untuk keluarga dan teman (mayoritas di HP), bahasa visual papan kapur dan kertas undangan cetak, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

## Keterbatasan verifikasi

- Screenshot hanya berhasil di 375x812 (sampul, semua section, lightbox). Di 360x640, 375x667, 390x760, 768x1024, dan 1440x900 screenshot gagal karena jendela aplikasi tersembunyi, jadi ukuran itu diperiksa lewat pengukuran DOM.
- Tautan peta, kalender, dan Instagram diperiksa lewat `href` dan `target`, tidak dibuka.
- Unduh .ics: berkas dan nama berkas terbentuk dan toast muncul, tetapi penyimpanan ke disk dicegat saat tes.
- Salin rekening dan salin alamat: clipboard diblokir di browser otomatis, jadi hanya jalur gagal (toast "Tidak dapat menyalin") yang terlihat.
- Jalur gagal kirim RSVP dan tombol musik diperiksa lewat kode, tidak dijalankan.

## Blok 1: Hard Gate

| Aturan | Hasil | Bukti |
|---|---|---|
| R-02 em dash | PASS | `grep` karakter em dash di tiga berkas tema: kosong; `innerText` halaman: tidak ada |
| R-03 mobile | PASS | Tanpa scroll horizontal di 360, 375, 390, 768, 1440; 24 dari 24 tombol/isian minimal 44px; 0 dari 94 teks di bawah 12px |
| R-17 angka | PASS | Tidak ada statistik; hitung mundur dihitung dari tanggal acara dan disembunyikan bila tanggal kosong |
| R-18 testimoni | PASS | Tidak ada testimoni; daftar ucapan berasal dari data RSVP |
| R-23 aset | PASS | Ornamen botani SVG dibuat atas instruksi user ("pakai SVG sementara"), ditandai `TODO(aset)` di `ChalkOrnaments.tsx`; potret kosong diganti inisial, bukan foto stok |
| R-24 navigasi | PASS | Tidak ada navbar |
| R-25 kontras | PASS | Dihitung dengan rumus WCAG: terendah 4,91:1 (inisial sage di kotak foto, teks besar 72px) dan 5,59:1 (sage di kertas); garis isian 3,91:1 |
| R-26 elemen interaktif | PASS | Semua tombol dan tautan punya aksi nyata (daftar klik di bawah) |
| R-27 keadaan UI | PASS | Kosong: "Belum ada ucapan. Isi formulir di atas..."; memuat: tombol "Mengirim..." dan nonaktif; gagal: toast dari `useRsvpForm` (lewat kode) |
| R-28 FAQ | PASS | Tidak ada FAQ |
| R-32 keyboard | PASS | Lightbox: Tab tetap di dalam dialog, panah berpindah foto, Escape menutup, fokus kembali ke ubin; radio kehadiran menampilkan cincin fokus; kelas `focus-visible` di semua kontrol (lewat kode) |
| R-33 skrip tambal | PASS | Semua perubahan ditulis langsung di sumber |
| R-34 tema | PASS | Tidak ada toggle tema |
| R-35 verifikasi | PASS | Typecheck, lint, dan 27 tes lolos; daftar klik di bawah; tidak ada error konsol baru setelah perbaikan terakhir |
| R-36 klaim | PASS | Tidak ada klaim keamanan, kepatuhan, atau performa |
| R-37 arah desain | PASS | Arah dari deskripsi tema dan keputusan user; Design Read dan dial tertulis di rencana |
| R-38 isi nyata | PASS | 9 teks pengganti dan 3 foto stok dihapus; bagian tanpa data disembunyikan |

## Blok 2: Purpose-Gate

| Aturan | Hasil | Alasan tertulis |
|---|---|---|
| R-01 gradasi | PASS | Dua gradasi radial 5 sampai 6 persen di papan: kesan bekas hapusan kapur |
| R-04 ikon | PASS | Lucide hanya untuk aksi (peta, kalender, unduh, salin, kirim, amplop, Instagram); Sparkles, Heart, Gift dihapus |
| R-06 tipografi | PASS | Great Vibes: tulisan tangan di papan; Playfair: cetakan undangan klasik; Plus Jakarta Sans: keterbacaan isi. Label huruf besar berjarak lebar dihapus |
| R-07 latar | PASS | Tekstur hanya di papan, sebagai identitas tema |
| R-08 panah | PASS | Tidak ada panah di tombol |
| R-09 badge | PASS | Tidak ada badge kapsul |
| R-10 kaca | PASS | Tidak ada `backdrop-filter` |
| R-12 bayangan | PASS | Hanya pada foto (cetakan yang menumpang di kertas) dan tombol musik mengambang |
| R-13 cahaya | PASS | Tidak ada glow |
| R-14 kartu | PASS | Kartu hanya untuk acara, rekening, alamat, dan formulir: satuan yang punya aksi |
| R-19 animasi | PASS | `Reveal` mengarahkan mata ke section yang masuk; `cv-fade` saat undangan dibuka; satu-satunya putaran berulang adalah batang ekualiser saat musik benar-benar diputar |
| R-22 ilustrasi | PASS | Tangkai botani terkait identitas papan kapur; berstatus sementara |

## Blok 3: Liveliness

| Butir | Hasil | Bukti |
|---|---|---|
| Dial dinyatakan | PASS | ENERGY 2 / RHYTHM 2 / MOTION 2 |
| Konsisten dengan dial | PASS | Jeda ritme: pita papan di hitung mundur dan penutup, garis waktu rata kiri, foto miring |
| Titik fokus per layar | PASS | Sampul: nama; pembuka: foto; RSVP: tombol kirim |
| Ruang kosong terstruktur | PASS | `py-12` antar section, `py-10` untuk kutipan, pita papan tanpa jeda |
| Satu aksen | PASS | Burgundy hanya di nama pasangan dan tombol "Kirim konfirmasi" |
| Motif identitas | PASS | Tulisan sambung dan garis kapur di bawah tiap judul |
| Design Read | PASS | Tertulis di rencana sebelum kode |

## Blok 4: Craftsmanship dan Quality Locks

| Butir | Hasil | Bukti |
|---|---|---|
| C-1 sampai C-5 | PASS | Tiap keputusan punya alasan di tabel rencana; tidak ada kontrol mati, section pengisi, atau isi karangan |
| R-05 tata letak | PASS | Urutan mengikuti isi undangan; section tanpa data tidak dirender |
| R-11 sudut | PASS | 0 untuk foto, 8px untuk kartu dan tombol, bulat hanya untuk tombol ikon |
| R-15 CTA | PASS | "Buka Undangan", "Buka Peta", "Simpan ke Kalender", "Kirim konfirmasi" |
| R-16 kata klise | PASS | Tidak ada |
| R-20 identitas | PASS | Papan kapur, bingkai emas, tulisan sambung |
| R-21 mode gelap | PASS | Tema tetap: sampul papan lalu kertas, sesuai identitas |
| R-29 palet | PASS | Papan, kertas, sage, dan aksen burgundy; emas hanya garis bingkai. Hijau, merah, dan kuning tua hanya pada teks status kehadiran, selalu disertai tulisan |
| R-30 tiruan | PASS | Komposisi sampul baru (lapisan CSS, rata tengah); gambar bernama `inveet-*` dihapus |
| R-31 alasan | PASS | Tabel "Arah desain" di rencana |

## Daftar klik (375x812)

- Buka Undangan: sampul berganti isi undangan, halaman kembali ke atas, 9 section tampil.
- Ubin galeri 2: dialog modal terbuka, fokus di "Tutup galeri", label "Galeri foto, 2 dari 6".
- Panah kanan: "3 dari 6". Panah kiri tiga kali: "6 dari 6" (berputar).
- Tab empat kali: fokus tetap di dalam dialog.
- Escape: dialog tertutup, fokus kembali ke "Buka foto 2", scroll halaman pulih.
- Klik latar dan tombol tutup: dialog tertutup.
- Lihat semua foto (8): ubin dari 6 menjadi 8, tombol hilang; dengan 6 foto tombol tidak muncul.
- Kehadiran "Tidak hadir": radio terpilih, isian jumlah tamu hilang; "Hadir": isian muncul lagi.
- Kirim konfirmasi: toast "Mode pratinjau: RSVP tidak dikirim".
- Unduh .ics: berkas `Akad_Nikah_Anindya_Raditya.ics` (465 byte, text/calendar) terbentuk, toast muncul.
- Salin nomor rekening dan salin alamat: toast gagal menyalin (clipboard diblokir).
- Data minim dan nama 14 huruf: section hanya Pembuka, Mempelai, RSVP; tanpa teks pengganti, tanpa gambar, nama tidak terpotong.
- Gerak dikurangi: 0 dari 11 blok `Reveal` tersembunyi; tidak ada animasi berulang.
