import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HeartHandshake, Lock, AtSign } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api.js";
import { useAuthStore } from "../../store/authStore.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email atau username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const res = await api.post("/auth/login", data);

      if (res.data.success) {
        login(res.data.data.token, res.data.data.user, res.data.data.profile);
        toast.success("Selamat datang kembali! 👋", {
          description: `Login sebagai ${res.data.data.profile?.groomName || "Pengguna"}`,
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error("Gagal Masuk", {
        description: error.response?.data?.message || "Email / username atau password tidak sesuai.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-[#FBFBFA] to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] animate-scale-up">
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] mx-auto shadow-sm">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Masuk ke Wedding<span className="text-[#E11D48]">Plan</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Kelola anggaran, seserahan, timeline hari-H, dan berkas KUA pernikahanmu dalam satu tempat.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email atau Username"
            type="text"
            placeholder="nama@email.com atau username"
            leftIcon={<AtSign className="w-4 h-4" />}
            error={errors.identifier?.message}
            {...register("identifier")}
          />

          <Input
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" isLoading={isLoading}>
            Masuk ke Akun
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Belum punya rencana pernikahan?{" "}
            <Link to="/register" className="font-bold text-[#E11D48] hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
