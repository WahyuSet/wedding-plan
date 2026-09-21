import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User as UserIcon,
  Heart,
  Shield,
  Check,
  Eye,
  EyeOff,
  AtSign,
  Mail,
  Lock,
  CalendarDays,
  MapPin,
  Wallet,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";
import { Topbar } from "../components/layout/Topbar.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Input } from "../components/ui/Input.js";
import { formatRupiah } from "../lib/utils.js";

// ─────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────
const accountSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-z0-9_]+$/, "Hanya huruf kecil, angka, dan underscore")
    .or(z.literal(""))
    .optional(),
  email: z.string().email("Format email tidak valid").optional(),
});

const profileSchema = z.object({
  groomName: z.string().min(1, "Nama mempelai pria wajib diisi"),
  brideName: z.string().min(1, "Nama mempelai wanita wajib diisi"),
  weddingDate: z.string().optional(),
  venue: z.string().optional(),
  totalBudget: z.coerce.number().nonnegative("Anggaran tidak boleh negatif").optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type AccountFormData = z.infer<typeof accountSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// ─────────────────────────────────────────────
// Avatar Utility
// ─────────────────────────────────────────────
function getAvatarInitials(groomName?: string | null, brideName?: string | null): string {
  const g = groomName?.trim().charAt(0).toUpperCase() || "";
  const b = brideName?.trim().charAt(0).toUpperCase() || "";
  return g + b || "WP";
}

function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

// ─────────────────────────────────────────────
// Password Strength Indicator
// ─────────────────────────────────────────────
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 25, label: "Lemah", color: "bg-red-500" };
  if (score === 2) return { score: 50, label: "Cukup", color: "bg-amber-500" };
  if (score === 3) return { score: 75, label: "Kuat", color: "bg-emerald-500" };
  return { score: 100, label: "Sangat Kuat", color: "bg-emerald-600" };
}

// ─────────────────────────────────────────────
// Settings Tabs
// ─────────────────────────────────────────────
type Tab = "account" | "profile" | "security";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "account", label: "Akun", icon: <UserIcon className="w-4 h-4" /> },
  { id: "profile", label: "Profil Pernikahan", icon: <Heart className="w-4 h-4" /> },
  { id: "security", label: "Keamanan", icon: <Shield className="w-4 h-4" /> },
];

// ─────────────────────────────────────────────
// Tab: Account
// ─────────────────────────────────────────────
const AccountTab: React.FC = () => {
  const { user, updateUserState } = useAuthStore();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    try {
      const payload: Record<string, string> = {};
      if (data.username !== undefined && data.username !== (user?.username ?? "")) {
        payload.username = data.username || "";
      }
      if (data.email && data.email !== user?.email) {
        payload.email = data.email;
      }

      if (Object.keys(payload).length === 0) {
        toast.info("Tidak ada perubahan untuk disimpan.");
        return;
      }

      const res = await api.put("/auth/account", payload);
      if (res.data.success) {
        updateUserState({
          email: res.data.data.email,
          username: res.data.data.username,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        toast.success("Informasi akun berhasil diperbarui!");
      }
    } catch (error: any) {
      toast.error("Gagal memperbarui akun", {
        description: error.response?.data?.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-0.5">Informasi Akun</h3>
        <p className="text-xs text-slate-500">
          Atur username untuk login tanpa email. Username hanya boleh huruf kecil, angka, dan underscore.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Username"
          placeholder="contoh: budi_santoso"
          leftIcon={<AtSign className="w-4 h-4" />}
          error={errors.username?.message}
          hint="Digunakan untuk login selain email"
          {...register("username")}
        />
        <Input
          label="Alamat Email"
          type="email"
          placeholder="email@contoh.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          ID Akun: <span className="font-mono text-slate-500">{user?.id?.slice(0, 12)}...</span>
        </p>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          leftIcon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        >
          {saved ? "Tersimpan!" : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
};

// ─────────────────────────────────────────────
// Tab: Wedding Profile
// ─────────────────────────────────────────────
const ProfileTab: React.FC = () => {
  const { profile, updateProfileState } = useAuthStore();
  const [saved, setSaved] = useState(false);

  const weddingDateValue = profile?.weddingDate
    ? new Date(profile.weddingDate).toISOString().split("T")[0]
    : "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      groomName: profile?.groomName || "",
      brideName: profile?.brideName || "",
      weddingDate: weddingDateValue,
      venue: profile?.venue || "",
      totalBudget: profile?.totalBudget || 0,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const res = await api.put("/auth/profile", data);
      if (res.data.success) {
        updateProfileState(res.data.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        toast.success("Profil pernikahan berhasil diperbarui!");
      }
    } catch (error: any) {
      toast.error("Gagal memperbarui profil", {
        description: error.response?.data?.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-0.5">Profil Pernikahan</h3>
        <p className="text-xs text-slate-500">
          Data mempelai, tanggal pernikahan, dan target anggaran.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nama Mempelai Pria"
          placeholder="Budi Santoso"
          error={errors.groomName?.message}
          {...register("groomName")}
        />
        <Input
          label="Nama Mempelai Wanita"
          placeholder="Sari Rahmawati"
          error={errors.brideName?.message}
          {...register("brideName")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Tanggal Pernikahan"
          type="date"
          leftIcon={<CalendarDays className="w-4 h-4" />}
          error={errors.weddingDate?.message}
          {...register("weddingDate")}
        />
        <Input
          label="Target Total Anggaran (Rp)"
          type="number"
          placeholder="150000000"
          leftIcon={<Wallet className="w-4 h-4" />}
          hint={profile?.totalBudget ? `Saat ini: ${formatRupiah(profile.totalBudget)}` : undefined}
          error={errors.totalBudget?.message}
          {...register("totalBudget")}
        />
      </div>

      <Input
        label="Lokasi / Venue Pernikahan"
        placeholder="Gedung Balai Kartini, Jakarta Selatan"
        leftIcon={<MapPin className="w-4 h-4" />}
        {...register("venue")}
      />

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          leftIcon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        >
          {saved ? "Tersimpan!" : "Simpan Profil"}
        </Button>
      </div>
    </form>
  );
};

// ─────────────────────────────────────────────
// Tab: Security / Change Password
// ─────────────────────────────────────────────
const SecurityTab: React.FC = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const strength = getPasswordStrength(newPassword);

  const onSubmit = async (data: PasswordFormData) => {
    try {
      const res = await api.put("/auth/change-password", data);
      if (res.data.success) {
        setSaved(true);
        reset();
        setNewPassword("");
        setTimeout(() => setSaved(false), 2000);
        toast.success("Password berhasil diperbarui!", {
          description: "Silakan login ulang jika diperlukan.",
        });
      }
    } catch (error: any) {
      toast.error("Gagal memperbarui password", {
        description: error.response?.data?.message,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-0.5">Ubah Password</h3>
        <p className="text-xs text-slate-500">
          Verifikasi password lama terlebih dahulu sebelum menetapkan password baru.
        </p>
      </div>

      {/* Current Password */}
      <div className="relative">
        <Input
          label="Password Saat Ini"
          type={showCurrent ? "text" : "password"}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <button
          type="button"
          onClick={() => setShowCurrent((v) => !v)}
          className="absolute right-3 top-8 text-slate-400 hover:text-slate-700 transition-colors"
        >
          {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="h-px bg-slate-100" />

      {/* New Password */}
      <div className="relative">
        <Input
          label="Password Baru"
          type={showNew ? "text" : "password"}
          placeholder="Minimal 6 karakter"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.newPassword?.message}
          {...register("newPassword", {
            onChange: (e) => setNewPassword(e.target.value),
          })}
        />
        <button
          type="button"
          onClick={() => setShowNew((v) => !v)}
          className="absolute right-3 top-8 text-slate-400 hover:text-slate-700 transition-colors"
        >
          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Password Strength Bar */}
      {newPassword && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Kekuatan Password</span>
            <span
              className={`text-[11px] font-bold ${
                strength.score <= 25
                  ? "text-red-500"
                  : strength.score <= 50
                  ? "text-amber-500"
                  : "text-emerald-600"
              }`}
            >
              {strength.label}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Tips: Gunakan huruf besar, angka, dan simbol untuk password yang lebih kuat.
          </p>
        </div>
      )}

      {/* Confirm Password */}
      <div className="relative">
        <Input
          label="Konfirmasi Password Baru"
          type={showConfirm ? "text" : "password"}
          placeholder="Ulangi password baru"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          className="absolute right-3 top-8 text-slate-400 hover:text-slate-700 transition-colors"
        >
          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          leftIcon={saved ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
        >
          {saved ? "Password Diperbarui!" : "Perbarui Password"}
        </Button>
      </div>
    </form>
  );
};

// ─────────────────────────────────────────────
// Main Settings Page
// ─────────────────────────────────────────────
export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const { user, profile } = useAuthStore();

  const initials = getAvatarInitials(profile?.groomName, profile?.brideName);
  const avatarBg = getAvatarColor(user?.id || "default");

  return (
    <div className="space-y-6 animate-fade-in">
      <Topbar
        title="Pengaturan Akun"
        description="Kelola informasi akun, profil pernikahan, dan keamanan akunmu"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar Kiri ── */}
        <aside className="w-full lg:w-64 shrink-0">
          <Card className="p-0 overflow-hidden">
            {/* Avatar Header */}
            <div className="p-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-xl font-black shadow-md mb-3 select-none"
                style={{ backgroundColor: avatarBg }}
              >
                {initials}
              </div>
              <p className="text-sm font-bold text-slate-900 truncate">
                {profile?.groomName || "Pengguna"}
                {profile?.brideName ? ` & ${profile.brideName}` : ""}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {user?.username ? `@${user.username}` : user?.email}
              </p>
            </div>

            {/* Tab Nav */}
            <nav className="p-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left relative ${
                    activeTab === tab.id
                      ? "bg-rose-50 text-[#E11D48]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {activeTab === tab.id && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#E11D48] rounded-full" />
                  )}
                  <span
                    className={`${
                      activeTab === tab.id ? "text-[#E11D48]" : "text-slate-400"
                    } transition-colors`}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </aside>

        {/* ── Konten Kanan ── */}
        <main className="flex-1 min-w-0">
          <Card className="p-6 lg:p-8">
            {activeTab === "account" && <AccountTab />}
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "security" && <SecurityTab />}
          </Card>
        </main>
      </div>
    </div>
  );
};
