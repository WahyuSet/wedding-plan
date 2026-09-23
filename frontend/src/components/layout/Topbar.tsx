import React from "react";
import { Calendar, MapPin, Heart } from "lucide-react";
import { useAuthStore } from "../../store/authStore.js";
import { formatDateIndo, cn } from "../../lib/utils.js";
import { Badge } from "../ui/Badge.js";

export interface TopbarProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  sticky?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ title, description, action, sticky = true }) => {
  const { profile } = useAuthStore();

  let daysRemaining: number | null = null;
  if (profile?.weddingDate) {
    const diff = new Date(profile.weddingDate).getTime() - new Date().getTime();
    daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <header
      className={cn(
        "bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4",
        sticky && "sticky top-0 z-20"
      )}
    >
      {/* Title & Description */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          {title}
        </h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>

      {/* Right side info / action */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Countdown Badge */}
        {profile?.weddingDate && (
          <div className="hidden sm:flex items-center gap-2 bg-rose-50/80 border border-rose-100 px-3 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-[#E11D48]" />
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-rose-500 leading-none">
                Hari Pernikahan
              </p>
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {formatDateIndo(profile.weddingDate)}
              </p>
            </div>
            {daysRemaining !== null && (
              <Badge variant={daysRemaining > 0 ? "rose" : "neutral"} size="sm" className="ml-1 font-bold">
                {daysRemaining > 0
                  ? `${daysRemaining} Hari Lagi`
                  : daysRemaining === 0
                  ? "Hari Ini! 🎊"
                  : "Sudah Lewat"}
              </Badge>
            )}
          </div>
        )}

        {action}
      </div>
    </header>
  );
};
