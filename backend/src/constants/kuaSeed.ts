export interface DefaultKuaDoc {
  documentName: string;
  documentCode?: string;
  documentType: string;
  fromParty: "calon_pria" | "calon_wanita" | "wali" | "kua";
  notes?: string;
}

export const DEFAULT_KUA_DOCUMENTS: DefaultKuaDoc[] = [
  // Calon Pria
  {
    documentName: "Surat Pengantar Nikah dari Kelurahan (Model N1)",
    documentCode: "N1",
    documentType: "surat_keterangan",
    fromParty: "calon_pria",
    notes: "Diurus di Kelurahan/Desa domisili calon mempelai pria dengan membawa pengantar RT/RW",
  },
  {
    documentName: "Surat Permohonan Kehendak Nikah (Model N2)",
    documentCode: "N2",
    documentType: "surat_keterangan",
    fromParty: "calon_pria",
    notes: "Format surat dari KUA / Kelurahan",
  },
  {
    documentName: "Surat Persetujuan Mempelai (Model N4)",
    documentCode: "N4",
    documentType: "surat_keterangan",
    fromParty: "calon_pria",
    notes: "Ditandatangani oleh kedua calon mempelai",
  },
  {
    documentName: "Surat Izin Orang Tua (Model N5) — jika usia < 21 tahun",
    documentCode: "N5",
    documentType: "surat_keterangan",
    fromParty: "calon_pria",
    notes: "Wajib jika calon pengantin berusia di bawah 21 tahun",
  },
  {
    documentName: "Fotokopi KTP Calon Pengantin Pria (2 lembar)",
    documentType: "fotokopi",
    fromParty: "calon_pria",
    notes: "Pastikan KTP masih aktif atau e-KTP",
  },
  {
    documentName: "Fotokopi Kartu Keluarga (KK) Calon Pria",
    documentType: "fotokopi",
    fromParty: "calon_pria",
    notes: "Fotokopi KK terbaru",
  },
  {
    documentName: "Fotokopi Akta Kelahiran / Surat Kenal Lahir",
    documentType: "fotokopi",
    fromParty: "calon_pria",
    notes: "Fotokopi legalisir jika memungkinkan",
  },
  {
    documentName: "Fotokopi Ijazah Terakhir",
    documentType: "fotokopi",
    fromParty: "calon_pria",
    notes: "Untuk pencocokan data nama dan tanggal lahir",
  },
  {
    documentName: "Pas Foto 2x3 (4 lembar) & 4x6 (2 lembar) Background Biru",
    documentType: "foto",
    fromParty: "calon_pria",
    notes: "Pakaian formal/berkerah, background warna biru polos",
  },
  {
    documentName: "Surat Keterangan Sehat & Bebas Tetanus / Imunisasi TT",
    documentType: "surat_kesehatan",
    fromParty: "calon_pria",
    notes: "Dari Puskesmas atau faskes pemerintah setempat",
  },
  {
    documentName: "Surat Rekomendasi Nikah (N8) dari KUA Asal (jika beda kecamatan)",
    documentCode: "N8",
    documentType: "surat_keterangan",
    fromParty: "calon_pria",
    notes: "Wajib jika nikah dilakukan di luar kecamatan domisili pria (Surat Numpang Nikah)",
  },
  {
    documentName: "Surat Izin Komandan (Khusus Anggota TNI / POLRI)",
    documentType: "izin_khusus",
    fromParty: "calon_pria",
    notes: "Hanya untuk anggota dinas aktif",
  },

  // Calon Wanita
  {
    documentName: "Surat Pengantar Nikah dari Kelurahan (Model N1)",
    documentCode: "N1",
    documentType: "surat_keterangan",
    fromParty: "calon_wanita",
    notes: "Diurus di Kelurahan/Desa domisili calon mempelai wanita",
  },
  {
    documentName: "Surat Permohonan Kehendak Nikah (Model N2)",
    documentCode: "N2",
    documentType: "surat_keterangan",
    fromParty: "calon_wanita",
    notes: "Format surat dari KUA / Kelurahan",
  },
  {
    documentName: "Surat Persetujuan Mempelai (Model N4)",
    documentCode: "N4",
    documentType: "surat_keterangan",
    fromParty: "calon_wanita",
    notes: "Ditandatangani kedua calon mempelai",
  },
  {
    documentName: "Fotokopi KTP Calon Pengantin Wanita (2 lembar)",
    documentType: "fotokopi",
    fromParty: "calon_wanita",
    notes: "Pastikan e-KTP aktif",
  },
  {
    documentName: "Fotokopi Kartu Keluarga (KK) Calon Wanita",
    documentType: "fotokopi",
    fromParty: "calon_wanita",
    notes: "Fotokopi KK terbaru",
  },
  {
    documentName: "Fotokopi Akta Kelahiran Calon Wanita",
    documentType: "fotokopi",
    fromParty: "calon_wanita",
    notes: "Dokumen asli disiapkan untuk verifikasi",
  },
  {
    documentName: "Fotokopi Ijazah Terakhir Calon Wanita",
    documentType: "fotokopi",
    fromParty: "calon_wanita",
    notes: "Pencocokan ejaan nama",
  },
  {
    documentName: "Pas Foto 2x3 (4 lembar) & 4x6 (2 lembar) Background Biru",
    documentType: "foto",
    fromParty: "calon_wanita",
    notes: "Pakaian formal/hijab rapi, background biru polos",
  },
  {
    documentName: "Sertifikat / Surat Vaksinasi TT (Tetanus Toksoid)",
    documentType: "surat_kesehatan",
    fromParty: "calon_wanita",
    notes: "Diperoleh dari Puskesmas setelah pemeriksaan pranikah",
  },
  {
    documentName: "Sertifikat Elsimil (Elektronik Siap Nikah Siap Hamil)",
    documentType: "surat_kesehatan",
    fromParty: "calon_wanita",
    notes: "Download aplikasi Elsimil BKKBN dan isi data skrining kesehatan",
  },

  // Wali Nikah
  {
    documentName: "Fotokopi KTP Wali Nikah",
    documentType: "fotokopi",
    fromParty: "wali",
    notes: "Ayah kandung atau wali nasab yang sah",
  },
  {
    documentName: "Fotokopi Kartu Keluarga (KK) Wali Nikah",
    documentType: "fotokopi",
    fromParty: "wali",
    notes: "Memastikan hubungan nasab dengan calon wanita",
  },
  {
    documentName: "Surat Keterangan Kematian Ayah (jika ayah sudah meninggal)",
    documentType: "surat_keterangan",
    fromParty: "wali",
    notes: "Dari Kelurahan/Rumah Sakit, untuk pengalihan wali ke kakek/saudara laki-laki",
  },
  {
    documentName: "Surat Taukil Wali (jika wali berhalangan hadir)",
    documentType: "surat_kuasa",
    fromParty: "wali",
    notes: "Surat pelimpahan kuasa akad kepada penghulu/orang lain",
  },

  // Dari KUA
  {
    documentName: "Bukti Pendaftaran Online SIMKAH Kemenag",
    documentType: "bukti_daftar",
    fromParty: "kua",
    notes: "Mendaftar melalui portal simkah.kemenag.go.id",
  },
  {
    documentName: "Bukti Pembayaran PNBP (Rp 600.000) jika nikah di luar KUA",
    documentType: "bukti_bayar",
    fromParty: "kua",
    notes: "Gratis Rp 0 jika akad nikah dilaksanakan di Kantor KUA pada hari & jam kerja",
  },
  {
    documentName: "Pemeriksaan / Verifikasi Berkas Fisik di KUA",
    documentType: "verifikasi",
    fromParty: "kua",
    notes: "Membawa seluruh berkas asli dan fotokopi minimal H-10 hari kerja",
  },
  {
    documentName: "Mengikuti Bimbingan Perkawinan (Bimwin) Mandiri / Tatap Muka",
    documentType: "bimbingan",
    fromParty: "kua",
    notes: "Kursus pranikah yang diselenggarakan oleh KUA Kemenag",
  },
];
