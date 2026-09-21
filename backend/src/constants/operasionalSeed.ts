export interface DefaultOperasionalTask {
  taskName: string;
  phase: "h90" | "h30" | "h7" | "hariH" | "pascaNikah";
  scheduledTime?: string;
  assignedTo?: string;
  priority?: "low" | "medium" | "high";
  notes?: string;
}

export const DEFAULT_OPERASIONAL_TASKS: DefaultOperasionalTask[] = [
  // H-90 s/d H-31
  {
    taskName: "Menentukan & booking gedung / venue akad dan resepsi",
    phase: "h90",
    assignedTo: "Pasangan & Keluarga",
    priority: "high",
    notes: "Pastikan ketersediaan tanggal, kapasitas tamu, dan fasilitas parkir",
  },
  {
    taskName: "Memilih & DP vendor katering + food testing",
    phase: "h90",
    assignedTo: "Pasangan",
    priority: "high",
    notes: "Hitung porsi: jumlah undangan x 2 + 10% cadangan",
  },
  {
    taskName: "Booking vendor dekorasi & tema pelaminan",
    phase: "h90",
    assignedTo: "Pasangan",
    priority: "medium",
    notes: "Tentukan palet warna dan request backdrop photo booth",
  },
  {
    taskName: "Booking vendor fotografer & videografer",
    phase: "h90",
    assignedTo: "Pasangan",
    priority: "medium",
    notes: "Termasuk sesi pre-wedding jika ada",
  },
  {
    taskName: "Pengurusan berkas awal ke RT/RW & Kelurahan (Surat N1-N4)",
    phase: "h90",
    assignedTo: "Masing-masing mempelai",
    priority: "high",
    notes: "Minta surat pengantar nikah ke kelurahan masing-masing",
  },

  // H-30 s/d H-8
  {
    taskName: "Pendaftaran resmi & penyerahan berkas ke KUA",
    phase: "h30",
    assignedTo: "Kedua Mempelai",
    priority: "high",
    notes: "Maksimal H-10 hari kerja sebelum hari pernikahan",
  },
  {
    taskName: "Final fitting busana pengantin & keluarga",
    phase: "h30",
    assignedTo: "Pasangan & Orang Tua",
    priority: "high",
    notes: "Cek kenyamanan dan kelengkapan aksesoris",
  },
  {
    taskName: "Penyusunan & distribusi undangan (fisik / digital)",
    phase: "h30",
    assignedTo: "Pasangan",
    priority: "high",
    notes: "Kirim undangan digital H-14 s/d H-7",
  },
  {
    taskName: "Pembelian & penataan kotak seserahan",
    phase: "h30",
    assignedTo: "Calon Pria & WO",
    priority: "medium",
    notes: "Hias kotak seserahan dan bungkus rapi",
  },
  {
    taskName: "Rapat koordinasi keluarga & panitia inti (Technical Meeting)",
    phase: "h30",
    assignedTo: "Ketua Panitia / WO",
    priority: "high",
    notes: "Pembagian tugas: among tamu, meja penerima tamu, sound, konsumsi panitia",
  },

  // H-7 s/d H-1
  {
    taskName: "Gladi bersih akad & resepsi",
    phase: "h7",
    assignedTo: "Seluruh Panitia & Mempelai",
    priority: "high",
    notes: "Cek alur masuk, posisi duduk, sound system, mic penghulu",
  },
  {
    taskName: "Konfirmasi final seluruh vendor (H-3)",
    phase: "h7",
    assignedTo: "Koordinator Vendor / WO",
    priority: "high",
    notes: "Katering, dekor, sound, genset, MUA, MC, dokumentasi",
  },
  {
    taskName: "Pengecekan mahar / mas kawin & dokumen KUA",
    phase: "h7",
    assignedTo: "Saksi / Keluarga Inti",
    priority: "high",
    notes: "Simpan mahar dan berkas di tas khusus yang mudah diakses",
  },
  {
    taskName: "Istirahat cukup & perawatan diri pengantin (H-1)",
    phase: "h7",
    assignedTo: "Pasangan",
    priority: "high",
    notes: "Tidur minimal 7-8 jam sebelum hari-H",
  },

  // Hari-H
  {
    taskName: "05:00 — MUA & rias pengantin + keluarga inti",
    phase: "hariH",
    scheduledTime: "05:00",
    assignedTo: "Tim MUA",
    priority: "high",
    notes: "Pastikan ruangan ber-AC dan pencahayaan terang",
  },
  {
    taskName: "07:30 — Penyambutan keluarga pria & penyerahan seserahan",
    phase: "hariH",
    scheduledTime: "07:30",
    assignedTo: "MC & Among Tamu",
    priority: "high",
    notes: "Keluarga pria tiba di lokasi akad",
  },
  {
    taskName: "08:00 — Prosesi Akad Nikah & Ijab Qabul",
    phase: "hariH",
    scheduledTime: "08:00",
    assignedTo: "Penghulu, Saksi, Wali, Mempelai",
    priority: "high",
    notes: "Penyerahan mahar, penandatanganan buku nikah",
  },
  {
    taskName: "09:30 — Sesi foto keluarga inti & sungkeman",
    phase: "hariH",
    scheduledTime: "09:30",
    assignedTo: "Dokumentasi & MC",
    priority: "medium",
    notes: "Urutan foto sesuai rundown yang disepakati",
  },
  {
    taskName: "11:00 s/d 14:00 — Resepsi pernikahan & ramah tamah",
    phase: "hariH",
    scheduledTime: "11:00",
    assignedTo: "MC, Katering, Keamanan",
    priority: "high",
    notes: "Pantau ketersediaan makanan dan alur antrean salaman",
  },
  {
    taskName: "14:30 — Closing, foto bersama panitia & serah terima kado/amplop",
    phase: "hariH",
    scheduledTime: "14:30",
    assignedTo: "Keluarga Inti & Tim Keamanan",
    priority: "high",
    notes: "Amankan kotak amplop langsung ke kamar khusus",
  },

  // Pasca Nikah
  {
    taskName: "Penyelesaian sisa pelunasan vendor",
    phase: "pascaNikah",
    assignedTo: "Bendahara / Pasangan",
    priority: "high",
    notes: "Periksa kelengkapan layanan sebelum transfer pelunasan",
  },
  {
    taskName: "Pengembalian busana sewa, properti, & kotak seserahan",
    phase: "pascaNikah",
    assignedTo: "Koordinator Perlengkapan",
    priority: "medium",
    notes: "Cek kondisi barang agar tidak kena denda",
  },
  {
    taskName: "Pengiriman ucapan terima kasih ke panitia & vendor",
    phase: "pascaNikah",
    assignedTo: "Pasangan",
    priority: "low",
    notes: "Kirim ucapan personal atau hampers kecil",
  },
  {
    taskName: "Update data kependudukan (KTP & KK baru status Kawin)",
    phase: "pascaNikah",
    assignedTo: "Pasangan",
    priority: "medium",
    notes: "Urus ke Disdukcapil membawa Buku Nikah",
  },
];
