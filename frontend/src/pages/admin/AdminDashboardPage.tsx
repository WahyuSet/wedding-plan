import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  WalletCards,
  Mail,
  HeartHandshake,
  ShieldCheck,
  Search,
  Trash2,
  Calendar,
  LogOut,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  X,
  Radio,
} from "lucide-react";
import { api } from "../../lib/api.js";
import { useAuthStore } from "../../store/authStore.js";
import { Button } from "../../components/ui/Button.js";
import { toast } from "sonner";

interface PlatformStats {
  totalUsers: number;
  totalProfiles: number;
  totalBudgetManaged: number;
  totalDigitalInvitations: number;
  totalGuests: number;
  totalRsvps: number;
}

interface SystemSettingItem {
  key: string;
  value: string;
  label: string;
  updatedAt: string;
}

interface UserDirectoryItem {
  id: string;
  email: string;
  username: string | null;
  role: string;
  createdAt: string;
  weddingProfile: {
    id: string;
    groomName: string | null;
    brideName: string | null;
    weddingDate: string | null;
    venue: string | null;
    totalBudget: number;
    _count: {
      budgetItems: number;
      seserahanItems: number;
      operasionalTasks: number;
      kuaDocuments: number;
    };
    digitalInvitation: {
      slug: string;
      isPublished: boolean;
    } | null;
  } | null;
}

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [settings, setSettings] = useState<SystemSettingItem[]>([]);
  const [users, setUsers] = useState<UserDirectoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingSetting, setIsUpdatingSetting] = useState<string | null>(null);

  // Modal delete state
  const [userToDelete, setUserToDelete] = useState<UserDirectoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, settingsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/settings"),
        api.get(`/admin/users${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (settingsRes.data.success) setSettings(settingsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (error: any) {
      toast.error("Gagal Memuat Data Admin", {
        description: error.response?.data?.message || "Terjadi kesalahan pada server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleToggleSetting = async (key: string, currentValue: string) => {
    try {
      setIsUpdatingSetting(key);
      const nextValue = currentValue === "true" ? "false" : "true";

      const res = await api.put(`/admin/settings/${key}`, { value: nextValue });

      if (res.data.success) {
        setSettings((prev) =>
          prev.map((s) => (s.key === key ? { ...s, value: nextValue } : s))
        );
        toast.success("Pengaturan Diperbarui", {
          description: res.data.message,
        });
      }
    } catch (error: any) {
      toast.error("Gagal Mengubah Pengaturan", {
        description: error.response?.data?.message || "Gagal memperbarui status fitur.",
      });
    } finally {
      setIsUpdatingSetting(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/admin/users/${userToDelete.id}`);

      if (res.data.success) {
        toast.success("Pengguna Dihapus", {
          description: res.data.message,
        });
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        setUserToDelete(null);
        // Refresh stats
        const statsRes = await api.get("/admin/stats");
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (error: any) {
      toast.error("Gagal Menghapus Pengguna", {
        description: error.response?.data?.message || "Terjadi kesalahan saat menghapus pengguna.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-slate-800 flex flex-col">
      {/* 1. Topbar Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                Wedding<span className="text-[#E11D48]">Plan</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-[#E11D48] border border-rose-200/60 text-[10px] font-black uppercase tracking-wider">
                Superadmin
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Platform Management Console</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/" target="_blank" className="hidden sm:flex">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Lihat Website
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchDashboardData()}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            className="text-xs"
          >
            Refresh
          </Button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600 hidden sm:inline">{user?.email}</span>
            <button
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              title="Keluar"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Ringkasan Operasional Platform
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau aktivitas seluruh pasangan pengantin dan kelola ketersediaan fitur secara terpusat.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Berjalan Normal</span>
          </div>
        </div>

        {/* 3. 4 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Users */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Pasangan
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#E11D48] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalUsers ?? 0}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Akun mempelai terdaftar aktif</p>
            </div>
          </div>

          {/* Card 2: Total Budget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Anggaran Terkelola
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <WalletCards className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate block">
                {formatRupiah(stats?.totalBudgetManaged ?? 0)}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Akumulasi estimasi seluruh akun</p>
            </div>
          </div>

          {/* Card 3: Digital Invitations */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Undangan Aktif
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalDigitalInvitations ?? 0}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Website undangan digital online</p>
            </div>
          </div>

          {/* Card 4: RSVP & Guests */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tamu &amp; RSVP
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalRsvps ?? 0}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Konfirmasi kehadiran yang tercatat</p>
            </div>
          </div>
        </div>

        {/* 4. 3 Feature Flags Toggles */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#E11D48]" />
              Kontrol Saklar Fitur (Feature Flags)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aktifkan atau non-aktifkan modul secara global tanpa perlu melakukan deployment ulang server.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Flag 1: digital_invitation */}
            {(() => {
              const setting = settings.find((s) => s.key === "digital_invitation");
              const isEnabled = setting?.value === "true";
              return (
                <div className="p-4 rounded-2xl border border-slate-200 bg-[#FBFBFA] flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Undangan Digital</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isEnabled
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isEnabled ? "Aktif" : "Non-aktif"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Izinkan calon mempelai membuat dan membagikan website undangan digital online.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting("digital_invitation", setting?.value || "true")}
                    disabled={isUpdatingSetting === "digital_invitation"}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isEnabled
                        ? "bg-rose-50 text-[#BE123C] border border-rose-200 hover:bg-rose-100"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {isEnabled ? "Matikan Fitur" : "Aktifkan Fitur"}
                  </button>
                </div>
              );
            })()}

            {/* Flag 2: user_registration */}
            {(() => {
              const setting = settings.find((s) => s.key === "user_registration");
              const isEnabled = setting?.value === "true";
              return (
                <div className="p-4 rounded-2xl border border-slate-200 bg-[#FBFBFA] flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Pendaftaran Akun Baru</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isEnabled
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        {isEnabled ? "Dibuka" : "Ditutup"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Buka atau tutup sementara form registrasi pengguna baru di halaman /register.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting("user_registration", setting?.value || "true")}
                    disabled={isUpdatingSetting === "user_registration"}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isEnabled
                        ? "bg-rose-50 text-[#BE123C] border border-rose-200 hover:bg-rose-100"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {isEnabled ? "Tutup Pendaftaran" : "Buka Pendaftaran"}
                  </button>
                </div>
              );
            })()}

            {/* Flag 3: system_maintenance */}
            {(() => {
              const setting = settings.find((s) => s.key === "system_maintenance");
              const isMaintenance = setting?.value === "true";
              return (
                <div className="p-4 rounded-2xl border border-slate-200 bg-[#FBFBFA] flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Maintenance Mode</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isMaintenance
                            ? "bg-amber-100 text-amber-800 border border-amber-200 font-black"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isMaintenance ? "Maintenance Aktif" : "Normal"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Alihkan akses pengguna umum ke halaman pemeliharaan saat perbaikan server berkala.
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting("system_maintenance", setting?.value || "false")}
                    disabled={isUpdatingSetting === "system_maintenance"}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isMaintenance
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    {isMaintenance ? "Kembalikan ke Normal" : "Aktifkan Maintenance"}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* 5. User Directory Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Direktori Seluruh Pasangan Terdaftar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {users.length} akun terdaftar dalam sistem.
              </p>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-72">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari email, nama, venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-[#E11D48] transition-all"
                />
              </div>
              <Button type="submit" variant="primary" size="sm" className="text-xs">
                Cari
              </Button>
            </form>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Mempelai</th>
                  <th className="py-3 px-3">Email Akun</th>
                  <th className="py-3 px-3">Hari-H</th>
                  <th className="py-3 px-3">Target Budget</th>
                  <th className="py-3 px-3">Progress Modul</th>
                  <th className="py-3 px-3">Daftar</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ada pengguna yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  users.map((item) => {
                    const profile = item.weddingProfile;
                    const isSuperadminAccount = item.role === "ADMIN";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Couple Names */}
                        <td className="py-3.5 px-3">
                          {isSuperadminAccount ? (
                            <span className="font-bold text-rose-600 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5" /> Superadmin System
                            </span>
                          ) : (
                            <div>
                              <p className="font-bold text-slate-900">
                                {profile?.groomName || "Pria"} &amp; {profile?.brideName || "Wanita"}
                              </p>
                              {profile?.venue && (
                                <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                                  📍 {profile.venue}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-3 font-medium text-slate-600">
                          {item.email}
                        </td>

                        {/* Wedding Date */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                          {profile?.weddingDate ? formatDate(profile.weddingDate) : "-"}
                        </td>

                        {/* Budget */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-800">
                          {profile ? formatRupiah(profile.totalBudget) : "-"}
                        </td>

                        {/* Progress */}
                        <td className="py-3.5 px-3">
                          {profile ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 font-semibold" title="Budget item">
                                {profile._count.budgetItems} Pos
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 font-semibold" title="Seserahan">
                                {profile._count.seserahanItems} Boks
                              </span>
                              {profile.digitalInvitation && (
                                <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-[#BE123C] font-bold">
                                  Undangan
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                          {formatDate(item.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-right">
                          {isSuperadminAccount ? (
                            <span className="text-[11px] font-semibold text-slate-400 italic">
                              Terkunci
                            </span>
                          ) : (
                            <button
                              onClick={() => setUserToDelete(item)}
                              title="Hapus Akun Pengguna"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 6. Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#E11D48] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">Hapus Akun Pasangan?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anda akan menghapus akun{" "}
                <span className="font-bold text-slate-800">{userToDelete.email}</span> (
                {userToDelete.weddingProfile?.groomName || "Pria"} &amp;{" "}
                {userToDelete.weddingProfile?.brideName || "Wanita"}).
              </p>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-2xl text-[11px] text-[#BE123C] leading-snug">
              ⚠️ Seluruh data anggaran, berkas KUA, tugas rundown hari-H, dan website undangan digital akun ini akan dihapus secara permanen dari basis data.
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDeleteUser}
                isLoading={isDeleting}
              >
                Hapus Permanen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
