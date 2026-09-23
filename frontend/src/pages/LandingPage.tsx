import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartHandshake,
  Gem,
  WalletCards,
  FileCheck2,
  Gift,
  Clock,
  Mail,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Calendar,
  AlertCircle,
  Menu,
  X,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { Button } from "../components/ui/Button.js";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 flex flex-col selection:bg-[#E11D48]/15 selection:text-[#BE123C]">
      {/* 1. Sticky Navigation Bar (64px) */}
      <header className="sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] shadow-xs group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">
              Wedding<span className="text-[#E11D48]">Plan</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#fitur" className="hover:text-[#E11D48] transition-colors">
              Fitur Lengkap
            </a>
            <a href="#cara-kerja" className="hover:text-[#E11D48] transition-colors">
              Cara Kerja
            </a>
            <a href="#undangan" className="hover:text-[#E11D48] transition-colors">
              Undangan Digital
            </a>
            <a href="#testimoni" className="hover:text-[#E11D48] transition-colors">
              Testimoni
            </a>
          </nav>

          {/* Desktop Auth State Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="shadow-sm"
                >
                  Buka Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="shadow-sm"
                  >
                    Mulai Rencanakan Gratis
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="text-xs px-2.5 py-1.5">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="primary" size="sm" className="text-xs px-2.5 py-1.5">
                  Daftar
                </Button>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white/95 px-4 py-4 space-y-3 shadow-lg animate-fade-in">
            <a
              href="#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#E11D48]"
            >
              Fitur Lengkap
            </a>
            <a
              href="#cara-kerja"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#E11D48]"
            >
              Cara Kerja
            </a>
            <a
              href="#undangan"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#E11D48]"
            >
              Undangan Digital
            </a>
            <a
              href="#testimoni"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 hover:text-[#E11D48]"
            >
              Testimoni
            </a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center">
                    Buka Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Masuk ke Akun
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full justify-center">
                      Mulai Rencanakan Gratis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section (Asymmetric Split View) */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
        {/* Subtle Warm Background Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow badge (taste-skill compliant: Lucide Gem icon, no raw emoji) */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-xs font-bold text-[#E11D48]">
                <Gem className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Smart Wedding Planning Mandiri</span>
              </div>

              {/* Main Headline (max 2 lines desktop) */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Rencanakan Pernikahan Impian <br className="hidden sm:inline" />
                <span className="text-[#E11D48] font-playfair italic font-bold">Tanpa Stres</span> & Bebas Overbudget
              </h1>

              {/* Concise Subtext (<= 20 words) */}
              <p className="text-base sm:text-lg text-slate-600 max-w-[52ch] leading-relaxed">
                Satu aplikasi lengkap untuk kelola anggaran, checklist berkas KUA, seserahan adat, rundown hari-H, dan undangan digital.
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full sm:w-auto shadow-md shadow-rose-500/20 text-base font-bold py-3 px-6"
                  >
                    {isAuthenticated ? "Buka Dashboard Saya" : "Mulai Rencanakan Gratis"}
                  </Button>
                </Link>
                <a href="#fitur">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base font-semibold py-3 px-6"
                  >
                    Pelajari Fitur
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Gratis & Self-Service</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sesuai Regulasi KUA & Kemenag</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>20+ Template Adat Nusantara</span>
                </div>
              </div>
            </div>

            {/* Right Column: Informative Feature Highlight Cards (Grill-Me decision: pure informative cards) */}
            <div className="lg:col-span-5 relative">
              <div className="space-y-4">
                {/* 1. Countdown Live Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:border-rose-200 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Hitung Mundur Hari-H</p>
                        <p className="text-[11px] text-slate-400">Akad & Resepsi Pernikahan</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Tersisa 118 Hari
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center pt-1">
                    <div className="bg-slate-50 rounded-xl py-2 px-1 border border-slate-100">
                      <span className="text-base sm:text-lg font-black text-slate-900">118</span>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Hari</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl py-2 px-1 border border-slate-100">
                      <span className="text-base sm:text-lg font-black text-slate-900">14</span>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Jam</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl py-2 px-1 border border-slate-100">
                      <span className="text-base sm:text-lg font-black text-slate-900">42</span>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Menit</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl py-2 px-1 border border-slate-100">
                      <span className="text-base sm:text-lg font-black text-slate-900">19</span>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Detik</p>
                    </div>
                  </div>
                </div>

                {/* 2. Smart Budget Progress Card */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:border-rose-200 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <WalletCards className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Pengawasan Anggaran</p>
                        <p className="text-[11px] text-slate-400">Target Rp 120.000.000</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      Hemat Rp 5.500.000
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Realisasi & DP Terbayar:</span>
                      <span className="font-bold text-slate-800">Rp 114.500.000 (95.4%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-[#E11D48] rounded-full w-[95%]" />
                    </div>
                  </div>
                </div>

                {/* 3. KUA Deadline Warning Card */}
                <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-[0_8px_20px_rgba(0,0,0,0.03)] flex items-start gap-3 bg-gradient-to-br from-white to-rose-50/40">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-[#E11D48] shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900">Batas Daftar KUA (H-10)</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-[#E11D48]">
                        Prioritas
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Pendaftaran resmi Kemenag wajib rampung 10 hari kerja sebelum hari akad. Checklist Surat N1–N4 siap cetak.
                    </p>
                  </div>
                </div>

                {/* 4. Traditional Seserahan Catalog Mini Pill */}
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-[0_8px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-[#D4AF37]">
                      <Gift className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      20+ Template Adat (Jawa, Sunda, Minang, dll)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    1-Klik Impor
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats & Trust Strip */}
      <section className="border-y border-slate-200/80 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="md:px-6 first:pl-0 space-y-1 pt-4 md:pt-0">
              <div className="flex items-center justify-center md:justify-start gap-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                <FileCheck2 className="w-7 h-7 text-[#E11D48]" />
                <span>30+ Berkas KUA</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Panduan resmi Surat N1–N4 dari Kelurahan, Vaksin Puskesmas (Elsimil), hingga SIMKAH Kemenag.
              </p>
            </div>

            <div className="md:px-6 space-y-1 pt-6 md:pt-0">
              <div className="flex items-center justify-center md:justify-start gap-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                <Gift className="w-7 h-7 text-[#D4AF37]" />
                <span>20+ Template Adat</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Katalog kotak seserahan & hantaran siap pakai untuk berbagai adat suku pernikahan di Indonesia.
              </p>
            </div>

            <div className="md:px-6 last:pr-0 space-y-1 pt-6 md:pt-0">
              <div className="flex items-center justify-center md:justify-start gap-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                <Clock className="w-7 h-7 text-emerald-600" />
                <span>5 Fase Rundown</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Manajemen timeline terstruktur dari H-90, H-30, gladi resik H-7, hari-H jam-ke-jam, hingga pelunasan vendor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Bento Grid */}
      <section id="fitur" className="py-20 bg-[#FBFBFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Semua Modul Persiapan dalam Satu Tempat
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Dirancang khusus untuk calon pengantin Indonesia yang ingin merencanakan pesta pernikahan mandiri secara transparan dan rapi.
            </p>
          </div>

          {/* 5-Feature Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Budget Planner (Col-span 2 on desktop) */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] mb-5">
                  <WalletCards className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2.5">
                  Smart Budgeting & Realisasi Pembayaran
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl mb-6">
                  Pantau alokasi biaya per kategori: Venue, Katering, Dekorasi, Rias & Busana, Dokumentasi, hingga Souvenir. Lacak status pembayaran Belum Bayar, Uang Muka (DP), dan Lunas tanpa takut kecolongan overbudget.
                </p>

                {/* Micro feature pills */}
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    <FileText className="w-3.5 h-3.5 text-[#E11D48]" /> Export Laporan PDF Lengkap
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Format Excel (.xlsx)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Tracking DP & Bukti Pelunasan
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Metrik otomatis: Estimasi vs Aktual vs Sisa Anggaran</span>
                <span className="font-bold text-[#E11D48]">Terintegrasi Real-time</span>
              </div>
            </div>

            {/* Feature 2: Dokumen KUA */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#D4AF37] mb-5">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Panduan & Legalitas Berkas KUA
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Checklist lengkap 30+ persyaratan nikah resmi: Surat N1–N4 Kelurahan, Imunisasi TT Puskesmas, sertifikat Elsimil, hingga pendaftaran online SIMKAH Kemenag.
                </p>
                <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-xs text-[#BE123C] space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Kalkulasi Batas Waktu H-10
                  </p>
                  <p className="text-[11px] text-rose-700">
                    Notifikasi otomatis batas pendaftaran ke KUA agar tidak terkena denda dispensasi.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Termasuk Info Biaya Kemenag</span>
                <span className="font-semibold text-slate-700">Gratis / Rp 600rb</span>
              </div>
            </div>

            {/* Feature 3: Seserahan Adat */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-5">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Katalog Seserahan Adat Nusantara
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Bingung apa saja isi kotak hantaran? Impor katalog adat siap pakai (Adat Jawa, Sunda, Minang, dll) dalam satu klik dan pantau kesiapan barang yang sudah terbeli.
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Filter Pria ➔ Wanita vs Angsul-angsul</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Checklist nomor boks & status hias</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                20+ Preset Adat Siap Impor
              </div>
            </div>

            {/* Feature 4: Rundown Hari-H */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Rundown & Operasional Hari-H
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Jadwal terinci mulai dari akad nikah, sungkeman, kirab pengantin, hingga ramah tamah resepsi. Tetapkan Penanggung Jawab (PIC) untuk setiap agenda agar keluarga dan vendor selaras.
                </p>
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="font-semibold text-slate-700">5 Fase Timeline Standar:</p>
                  <p className="text-[11px] mt-0.5">Persiapan Awal (H-90) s/d Pasca Nikah & Disdukcapil.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                Template 24 Tugas Siap Pakai
              </div>
            </div>

            {/* Feature 5: Undangan Digital (Inveet Engine) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] mb-5">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Undangan Digital Modern
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Bagikan undangan pernikahan online yang elegan langsung dari platform. Dilengkapi musik latar, peta venue Google Maps, galeri foto, dan konfirmasi kehadiran (RSVP) tamu.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kustomisasi URL Slug Mandiri</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                Responsif Mobile & QR Code
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Workflow Section (3 Simple Steps) */}
      <section id="cara-kerja" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              3 Langkah Mudah Menyiapkan Hari Bahagiamu
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Tidak perlu spreadsheet rumit atau catatan kertas yang rawan hilang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#FBFBFA] rounded-3xl p-6 sm:p-8 border border-slate-200/80 relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Tentukan Target & Tanggal
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Daftar akun dan masukkan data calon mempelai, tanggal akad/resepsi, lokasi venue, serta estimasi total anggaran yang direncanakan.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FBFBFA] rounded-3xl p-6 sm:p-8 border border-slate-200/80 relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#E11D48] text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Lengkapi Checklist & Biaya
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gunakan template adat seserahan, pantau checklist berkas KUA sesuai deadline, dan catat DP vendor secara transparan bersama pasangan.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FBFBFA] rounded-3xl p-6 sm:p-8 border border-slate-200/80 relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Eksekusi Hari-H Tanpa Stres
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Bagikan rundown jam-ke-jam ke PIC keluarga dan panitia. Nikmati momen sakral pernikahan dengan tenang karena semua sudah terkontrol.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Undangan Digital Showcase Banner */}
      <section id="undangan" className="py-16 bg-[#FBFBFA] border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-rose-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fitur Spesial Terintegrasi</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Bagikan Kebahagiaan dengan Undangan Digital
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Setiap akun WeddingPlan mendapatkan akses membuat dan mengelola website undangan pernikahan online secara cuma-cuma. Bagikan via WhatsApp ke seluruh kerabat dengan mudah.
              </p>
              <div className="pt-2">
                <Link to={isAuthenticated ? "/invitation-admin" : "/register"}>
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="font-bold"
                  >
                    {isAuthenticated ? "Kelola Undangan Digital" : "Buat Undangan Gratis"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials Section (Social Proof) */}
      <section id="testimoni" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Cerita Bahagia dari Calon Pengantin
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Pengalaman nyata pasangan di Indonesia yang berhasil mewujudkan pernikahan impian tanpa stres dan bebas overbudget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial Card 1 */}
            <div className="bg-[#FBFBFA] rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-rose-200 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    💰 Hemat Rp 12 Juta
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  &ldquo;Awalnya takut overbudget di katering dan dekor. Berkat tracking estimasi vs realisasinya, kami malah hemat Rp 12 juta dari target awal.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-rose-200 text-[#BE123C] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  RA
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">Rian &amp; Anindya</p>
                  <p className="text-xs text-slate-500 truncate">Gedung Pernikahan, Jakarta</p>
                </div>
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="bg-[#FBFBFA] rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-rose-200 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-[#BE123C] border border-rose-200/60">
                    📋 Bebas Drama KUA
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  &ldquo;Fitur kalkulator H-10 KUA dan template seserahan adat Sunda-nya sangat membantu! Semua berkas kelurahan selesai tanpa bolak-balik.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  DS
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">Dimas &amp; Sarah</p>
                  <p className="text-xs text-slate-500 truncate">Adat Sunda, Bandung</p>
                </div>
              </div>
            </div>

            {/* Testimonial Card 3 */}
            <div className="bg-[#FBFBFA] rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-rose-200 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                    ⏱️ Rundown Tepat Waktu
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  &ldquo;Rundown jam-ke-jam gampang dibagikan ke panitia keluarga via link. Akad dan resepsi berjalan tepat waktu tanpa perlu sewa WO mahal.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                  FN
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">Fajar &amp; Nadia</p>
                  <p className="text-xs text-slate-500 truncate">Intimate Wedding, Yogyakarta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Final Call to Action Banner */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] mx-auto shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Siap Mewujudkan Pernikahan Impianmu?
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Bergabunglah dengan pasangan lainnya yang merencanakan pernikahan secara cerdas, mandiri, dan bebas overbudget.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto shadow-md shadow-rose-500/20 text-base font-bold py-3.5 px-8"
              >
                {isAuthenticated ? "Buka Dashboard Saya" : "Mulai Rencanakan Gratis"}
              </Button>
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Tanpa kartu kredit • Siap pakai dalam 1 menit • 100% Bebas Biaya
          </p>
        </div>
      </section>

      {/* 8. Minimalist Semantic Footer */}
      <footer className="border-t border-slate-200/80 bg-[#FBFBFA] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand Logo & Info */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48]">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-slate-900">
                Wedding<span className="text-[#E11D48]">Plan</span>
              </span>
              <span className="text-xs text-slate-400 border-l border-slate-200 pl-2.5 ml-0.5">
                Smart Wedding Budgeting & Planner
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
              <a href="#fitur" className="hover:text-[#E11D48] transition-colors">
                Fitur
              </a>
              <a href="#cara-kerja" className="hover:text-[#E11D48] transition-colors">
                Alur Kerja
              </a>
              <a href="#undangan" className="hover:text-[#E11D48] transition-colors">
                Undangan Digital
              </a>
              <a href="#testimoni" className="hover:text-[#E11D48] transition-colors">
                Testimoni
              </a>
              <Link to="/login" className="hover:text-[#E11D48] transition-colors">
                Masuk Akun
              </Link>
              <Link to="/register" className="hover:text-[#E11D48] transition-colors">
                Daftar Baru
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} WeddingPlan. Hak cipta dilindungi undang-undang.</p>
            <p>Didesain untuk pernikahan bahagia di Indonesia 🇮🇩</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
