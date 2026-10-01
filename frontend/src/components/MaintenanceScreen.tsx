import React from "react";
import { Wrench } from "lucide-react";

export const MaintenanceScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBFBFA] p-6 text-center">
    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
      <Wrench className="w-6 h-6" />
    </div>
    <h1 className="text-lg font-bold text-slate-900">Sedang Dalam Pemeliharaan</h1>
    <p className="text-sm text-slate-500 mt-2 max-w-sm">
      WeddingPlan sedang diperbarui sebentar. Data Anda aman. Silakan coba lagi beberapa saat lagi.
    </p>
  </div>
);
