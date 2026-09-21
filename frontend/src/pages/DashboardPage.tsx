import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  WalletCards,
  Gift,
  Clock,
  FileCheck2,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../lib/api.js";
import { DashboardSummary, ApiResponse } from "../types/index.js";
import { formatRupiah, formatShortRupiah, formatDateIndo } from "../lib/utils.js";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/Card.js";
import { Badge } from "../components/ui/Badge.js";
import { ProgressBar } from "../components/ui/ProgressBar.js";
import { Skeleton } from "../components/ui/Skeleton.js";
import { Button } from "../components/ui/Button.js";

const CHART_COLORS = [
  "#E11D48",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#6366F1",
  "#94A3B8",
];

const categoryLabels: Record<string, string> = {
  venue: "Venue & Gedung",
  katering: "Katering",
  dekorasi: "Dekorasi",
  busana: "Busana & Rias",
  dokumentasi: "Dokumentasi",
  hiburan: "Hiburan / Musik",
  transport: "Transportasi",
  undangan: "Undangan & Souvenir",
  mas_kawin: "Mas Kawin / Mahar",
  lainnya: "Lain-lain",
};

// ─────────────────────────────────────────────
// Circular Progress Gauge Component
// ─────────────────────────────────────────────
interface CircularGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({
  percentage,
  size = 140,
  strokeWidth = 12,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  let strokeColor = "#E11D48"; // Rose primary
  if (percentage >= 100) strokeColor = "#10B981"; // Emerald
  else if (percentage >= 75) strokeColor = "#3B82F6"; // Blue
  else if (percentage >= 50) strokeColor = "#F59E0B"; // Amber

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Active Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {percentage}%
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Kesiapan
        </span>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { data, isLoading, error } = useQuery<ApiResponse<DashboardSummary>>({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await api.get("/dashboard/summary");
      return res.data;
    },
  });

  const summary = data?.data;

  // Real-time Countdown Timer
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!summary?.profile.weddingDate) return;

    const targetDate = new Date(summary.profile.weddingDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [summary?.profile.weddingDate]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton height={140} rounded="2xl" />
        <Skeleton height={220} rounded="2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton height={160} rounded="2xl" />
          <Skeleton height={160} rounded="2xl" />
          <Skeleton height={160} rounded="2xl" />
          <Skeleton height={160} rounded="2xl" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <Card className="p-8 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Gagal Memuat Data</h3>
        <p className="text-xs text-slate-500">Silakan muat ulang halaman atau coba beberapa saat lagi.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Muat Ulang
        </Button>
      </Card>
    );
  }

  const { profile, readiness, budget, seserahan, operasional, kua } = summary;

  const readinessScore = readiness?.overallPercentage || 0;
  const statusLabel = readiness?.statusLabel || "Dalam Persiapan";
  const nextActions = readiness?.nextActions || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Hero Countdown Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-rose-500/20 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-rose-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rencana Pernikahan Bahagia</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {profile.groomName || "Mempelai Pria"} & {profile.brideName || "Mempelai Wanita"}
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-400" />
              {profile.weddingDate ? formatDateIndo(profile.weddingDate) : "Tanggal belum diatur"}
              {profile.venue && ` • 📍 ${profile.venue}`}
            </p>
          </div>

          {/* Countdown Clock */}
          {profile.weddingDate && (
            <div className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 self-start lg:self-auto">
              <div className="text-center px-2 sm:px-3">
                <span className="block text-2xl sm:text-3xl font-black text-rose-400 tabular-nums">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  Hari
                </span>
              </div>
              <span className="text-xl font-bold text-slate-600">:</span>
              <div className="text-center px-2 sm:px-3">
                <span className="block text-2xl sm:text-3xl font-black text-white tabular-nums">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  Jam
                </span>
              </div>
              <span className="text-xl font-bold text-slate-600">:</span>
              <div className="text-center px-2 sm:px-3">
                <span className="block text-2xl sm:text-3xl font-black text-white tabular-nums">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  Menit
                </span>
              </div>
              <span className="text-xl font-bold text-slate-600">:</span>
              <div className="text-center px-2 sm:px-3">
                <span className="block text-2xl sm:text-3xl font-black text-slate-300 tabular-nums">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  Detik
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. ✨ HERO READINESS HUB (Status Progress Semua Modul) ✨ */}
      <Card className="p-6 md:p-8 bg-gradient-to-b from-white via-white to-slate-50/60 border-slate-200/90 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Sisi Kiri: Circular Gauge Skor Kesiapan */}
          <div className="flex flex-col items-center justify-center text-center shrink-0 w-full lg:w-56 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
            <CircularGauge percentage={readinessScore} size={130} strokeWidth={11} />
            <div className="mt-3">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                  readinessScore === 100
                    ? "bg-emerald-100 text-emerald-700"
                    : readinessScore >= 75
                    ? "bg-blue-100 text-blue-700"
                    : readinessScore >= 50
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {statusLabel}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Bobot seimbang 4 modul</p>
            </div>
          </div>

          {/* Sisi Kanan: 4 Modul Progress Bars (Budget, Seserahan, Operasional, Dokumen KUA) */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#E11D48]" />
                  Status Progress Kesiapan Pernikahan
                </h3>
                <p className="text-xs text-slate-500">
                  Pantau kemajuan persiapan dari seluruh modul secara langsung
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Modul 1: Dokumen KUA */}
              <Link
                to="/dokumen-kua"
                className="group p-3.5 bg-white hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-200 rounded-2xl transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                        Dokumen KUA
                      </h4>
                      <p className="text-[10px] text-slate-400">Legalitas Pernikahan</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600">
                    {kua.completed}/{kua.total}
                  </span>
                </div>
                <div className="space-y-1">
                  <ProgressBar value={kua.progressPercentage} size="sm" colorVariant="emerald" />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{kua.progressPercentage}% Berkas Selesai</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Modul 2: Pelunasan Budget */}
              <Link
                to="/budget"
                className="group p-3.5 bg-white hover:bg-rose-50/40 border border-slate-200/80 hover:border-rose-200 rounded-2xl transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 text-[#E11D48] flex items-center justify-center">
                      <WalletCards className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#E11D48] transition-colors">
                        Pelunasan Budget
                      </h4>
                      <p className="text-[10px] text-slate-400">Kas &amp; DP Vendor</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#E11D48]">
                    {formatShortRupiah(budget.totalPaid)}
                  </span>
                </div>
                <div className="space-y-1">
                  <ProgressBar
                    value={readiness?.scores?.budget ?? budget.spentPercentage}
                    size="sm"
                    colorVariant="auto"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{readiness?.scores?.budget ?? 0}% Kas Terbayar</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Modul 3: Daftar Seserahan */}
              <Link
                to="/seserahan"
                className="group p-3.5 bg-white hover:bg-amber-50/40 border border-slate-200/80 hover:border-amber-200 rounded-2xl transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                        Daftar Seserahan
                      </h4>
                      <p className="text-[10px] text-slate-400">Hantaran Mempelai</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-amber-600">
                    {seserahan.prepared}/{seserahan.total}
                  </span>
                </div>
                <div className="space-y-1">
                  <ProgressBar value={seserahan.progressPercentage} size="sm" colorVariant="amber" />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{seserahan.progressPercentage}% Item Siap</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Modul 4: Operasional Hari-H */}
              <Link
                to="/operasional"
                className="group p-3.5 bg-white hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-200 rounded-2xl transition-all duration-200 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                        Operasional Hari-H
                      </h4>
                      <p className="text-[10px] text-slate-400">Rundown &amp; Panitia</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-blue-600">
                    {operasional.completed}/{operasional.total}
                  </span>
                </div>
                <div className="space-y-1">
                  <ProgressBar value={operasional.progressPercentage} size="sm" colorVariant="blue" />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{operasional.progressPercentage}% Rundown Beres</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Rekomendasi Aksi Cepat / Next Actions Alert */}
            {nextActions.length > 0 && (
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      Langkah Prioritas Berikutnya
                    </p>
                    <p className="text-xs font-semibold text-slate-100">{nextActions[0].text}</p>
                  </div>
                </div>
                <Link to={nextActions[0].link} className="shrink-0 self-end sm:self-auto">
                  <Button variant="primary" size="sm" className="text-xs py-1 px-3">
                    Kerjakan Sekarang →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Bento Grid — 4 Core Metric Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Panel 1: Budget */}
        <Card hoverable className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48]">
                <WalletCards className="w-4 h-4" />
              </div>
              <Badge variant={budget.remainingBudget >= 0 ? "success" : "danger"} size="sm">
                {budget.remainingBudget >= 0 ? "Aman" : "Over Budget"}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-slate-500">Anggaran Terpakai</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {formatShortRupiah(budget.totalActual || budget.totalEstimated)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              dari {formatShortRupiah(budget.totalBudget)} target
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Sudah Dibayar</span>
              <span className="font-bold text-emerald-600">{formatShortRupiah(budget.totalPaid)}</span>
            </div>
            <Link
              to="/budget"
              className="text-xs font-bold text-[#E11D48] hover:underline flex items-center justify-between pt-1"
            >
              <span>Detail Anggaran</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Panel 2: Seserahan */}
        <Card hoverable className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Gift className="w-4 h-4" />
              </div>
              <Badge variant={seserahan.progressPercentage === 100 ? "success" : "gold"} size="sm">
                {seserahan.prepared}/{seserahan.total} Item
              </Badge>
            </div>
            <p className="text-xs font-semibold text-slate-500">Seserahan Siap</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {seserahan.prepared} / {seserahan.total}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {seserahan.total - seserahan.prepared} item dalam persiapan
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <ProgressBar value={seserahan.progressPercentage} size="sm" colorVariant="amber" />
            <Link
              to="/seserahan"
              className="text-xs font-bold text-amber-700 hover:underline flex items-center justify-between pt-1"
            >
              <span>Kelola Seserahan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Panel 3: Operasional */}
        <Card hoverable className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
              <Badge variant={operasional.progressPercentage === 100 ? "success" : "blue"} size="sm">
                {operasional.completed}/{operasional.total} Tugas
              </Badge>
            </div>
            <p className="text-xs font-semibold text-slate-500">Tugas Operasional</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {operasional.completed} / {operasional.total}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {operasional.total - operasional.completed} tugas tersisa
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <ProgressBar value={operasional.progressPercentage} size="sm" colorVariant="blue" />
            <Link
              to="/operasional"
              className="text-xs font-bold text-blue-700 hover:underline flex items-center justify-between pt-1"
            >
              <span>Timeline Rundown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Panel 4: Dokumen KUA */}
        <Card hoverable className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <FileCheck2 className="w-4 h-4" />
              </div>
              {kua.urgentCount > 0 ? (
                <Badge variant="danger" size="sm" dot>
                  {kua.urgentCount} Mendesak
                </Badge>
              ) : (
                <Badge variant="success" size="sm">
                  {kua.completed}/{kua.total} Dokumen
                </Badge>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-500">Dokumen KUA Lengkap</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {kua.completed} / {kua.total}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {kua.total - kua.completed} berkas belum lengkap
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <ProgressBar value={kua.progressPercentage} size="sm" colorVariant="emerald" />
            <Link
              to="/dokumen-kua"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center justify-between pt-1"
            >
              <span>Checklist Dokumen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* 4. Middle Section: Budget Chart + Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Donut Chart Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Distribusi Anggaran per Kategori</CardTitle>
              <CardDescription>
                Rincian alokasi biaya pengeluaran pernikahan berdasarkan kategori
              </CardDescription>
            </div>
            <Link to="/budget">
              <Button variant="outline" size="sm">
                Lihat Tabel
              </Button>
            </Link>
          </CardHeader>

          {budget.categoryChart && budget.categoryChart.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 py-2">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budget.categoryChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {budget.categoryChart.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatRupiah(val), "Alokasi"]}
                      labelFormatter={(label) => categoryLabels[label] || label}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                {budget.categoryChart.map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-3 rounded-md shrink-0"
                        style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-700 truncate">
                        {categoryLabels[item.name] || item.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 ml-2">
                      {formatShortRupiah(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <WalletCards className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Belum ada item anggaran</p>
              <p className="text-[11px] text-slate-400">Tambahkan item pengeluaran di menu Budget Planner.</p>
              <Link to="/budget">
                <Button variant="primary" size="sm" className="mt-2">
                  + Tambah Item Anggaran
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Right Col: Urgent KUA & Upcoming Tasks */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <div>
                <CardTitle>Tugas &amp; Dokumen Prioritas</CardTitle>
                <CardDescription>Aktivitas yang perlu perhatian segera</CardDescription>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {/* Urgent KUA docs */}
              {kua.urgentDocs && kua.urgentDocs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Berkas KUA Mendesak
                  </p>
                  {kua.urgentDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl text-xs flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800 truncate mr-2">
                        {doc.documentName}
                      </span>
                      <Badge variant="danger" size="sm">
                        {doc.daysRemaining !== null && doc.daysRemaining !== undefined
                          ? doc.daysRemaining <= 0
                            ? "Lewat"
                            : `${doc.daysRemaining} hari`
                          : "Segera"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Upcoming operasional tasks */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Agenda Operasional
                </p>
                {operasional.upcomingTasks && operasional.upcomingTasks.length > 0 ? (
                  operasional.upcomingTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <p className="font-semibold text-slate-800 truncate">{task.taskName}</p>
                        <p className="text-[10px] text-slate-400">{task.assignedTo || "Panitia"}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-2">Semua agenda operasional telah selesai.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/operasional" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Buka Seluruh Agenda
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* 5. Quick Action Buttons */}
      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E11D48]" />
          <span className="text-xs font-bold text-slate-800">Aksi Cepat:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/budget">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Tambah Budget
            </Button>
          </Link>
          <Link to="/seserahan">
            <Button variant="outline" size="sm" leftIcon={<Gift className="w-3.5 h-3.5" />}>
              Kelola Seserahan
            </Button>
          </Link>
          <Link to="/operasional">
            <Button variant="outline" size="sm" leftIcon={<Clock className="w-3.5 h-3.5" />}>
              Timeline Hari-H
            </Button>
          </Link>
          <Link to="/dokumen-kua">
            <Button variant="outline" size="sm" leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}>
              Cek Dokumen KUA
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
