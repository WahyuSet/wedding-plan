import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HeartHandshake,
  Lock,
  Mail,
  User,
  Calendar,
  MapPin,
  Coins,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api.js";
import { useAuthStore } from "../../store/authStore.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";

const registerSchema = z
  .object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    groomName: z.string().min(1, "Nama pengantin pria wajib diisi"),
    brideName: z.string().min(1, "Nama pengantin wanita wajib diisi"),
    weddingDate: z.string().optional(),
    venue: z.string().optional(),
    totalBudget: z.coerce.number().nonnegative("Budget tidak boleh negatif").optional().default(0),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      totalBudget: 100000000,
    },
  });

  const nextStep = async () => {
    if (authError) setAuthError(null);
    const isValid = await trigger(["email", "password", "confirmPassword"]);
    if (isValid) setStep(2);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      const res = await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        groomName: data.groomName,
        brideName: data.brideName,
        weddingDate: data.weddingDate || undefined,
        venue: data.venue || undefined,
        totalBudget: Number(data.totalBudget) || 0,
      });

      if (res.data.success) {
        login(res.data.data.token, res.data.data.user, res.data.data.profile);
        toast.success("Rencana pernikahan berhasil dibuat! 💍", {
          description: "Template dokumen KUA dan tugas operasional telah disiapkan otomatis.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Terjadi kesalahan saat mendaftar.";
      setAuthError(errorMsg);
      toast.error("Pendaftaran Gagal", {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FBFBFA] to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] animate-scale-up">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] mx-auto shadow-sm">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Mulai Rencana Pernikahan
          </h1>
          <p className="text-xs text-slate-500">
            Langkah {step} dari 2 — {step === 1 ? "Informasi Akun" : "Detail Pernikahan"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 1 ? "w-12 bg-[#E11D48]" : "w-6 bg-emerald-500"
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 2 ? "w-12 bg-[#E11D48]" : "w-6 bg-slate-200"
            }`}
          />
        </div>

        {/* Inline Error Banner */}
        {authError && (
          <div className="mb-6 flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/90 text-[#BE123C] text-xs leading-relaxed animate-fade-in shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E11D48] mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-[#E11D48]">Pendaftaran Gagal</p>
              <p className="text-rose-700 mt-0.5">{authError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <Input
                label="Alamat Email"
                type="email"
                placeholder="nama@email.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register("email", {
                  onChange: () => {
                    if (authError) setAuthError(null);
                  },
                })}
              />

              <Input
                label="Kata Sandi"
                type="password"
                placeholder="Minimal 6 karakter"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register("password", {
                  onChange: () => {
                    if (authError) setAuthError(null);
                  },
                })}
              />

              <Input
                label="Konfirmasi Kata Sandi"
                type="password"
                placeholder="Ketik ulang kata sandi"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  onChange: () => {
                    if (authError) setAuthError(null);
                  },
                })}
              />

              <Button
                type="button"
                variant="primary"
                className="w-full py-2.5 mt-2"
                onClick={nextStep}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Lanjut ke Detail Pernikahan
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Nama Mempelai Pria"
                  placeholder="Contoh: Budi Santoso"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.groomName?.message}
                  {...register("groomName", {
                    onChange: () => {
                      if (authError) setAuthError(null);
                    },
                  })}
                />

                <Input
                  label="Nama Mempelai Wanita"
                  placeholder="Contoh: Sari Rahmawati"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.brideName?.message}
                  {...register("brideName", {
                    onChange: () => {
                      if (authError) setAuthError(null);
                    },
                  })}
                />
              </div>

              <Input
                label="Tanggal Pernikahan (Akad / Resepsi)"
                type="date"
                leftIcon={<Calendar className="w-4 h-4" />}
                error={errors.weddingDate?.message}
                {...register("weddingDate")}
              />

              <Input
                label="Lokasi / Venue Pernikahan"
                placeholder="Contoh: Gedung Balai Kartini, Jakarta"
                leftIcon={<MapPin className="w-4 h-4" />}
                error={errors.venue?.message}
                {...register("venue")}
              />

              <Input
                label="Target Total Anggaran (Rupiah)"
                type="number"
                placeholder="Contoh: 100000000"
                hint="Dapat disesuaikan kembali nanti di menu Budget"
                leftIcon={<Coins className="w-4 h-4" />}
                error={errors.totalBudget?.message}
                {...register("totalBudget")}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 py-2.5"
                  onClick={() => setStep(1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 py-2.5"
                  isLoading={isLoading}
                >
                  Buat Rencana 💍
                </Button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-bold text-[#E11D48] hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
