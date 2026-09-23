import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import { ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] mb-3 shadow-xs animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-slate-500">Memverifikasi Otoritas Superadmin...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "ADMIN") {
    toast.error("Akses Ditolak", {
      description: "Anda tidak memiliki izin untuk mengakses Konsol Superadmin.",
    });
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
