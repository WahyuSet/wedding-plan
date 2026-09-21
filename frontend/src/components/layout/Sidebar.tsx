import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  WalletCards,
  Gift,
  Clock,
  FileCheck2,
  Settings,
  LogOut,
  HeartHandshake,
  X,
  Mail,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore.js";
import { cn } from "../../lib/utils.js";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Budget Planner", href: "/budget", icon: WalletCards },
  { name: "Daftar Seserahan", href: "/seserahan", icon: Gift },
  { name: "Operasional Hari-H", href: "/operasional", icon: Clock },
  { name: "Dokumen KUA", href: "/dokumen-kua", icon: FileCheck2 },
  { name: "Undangan Digital", href: "/invitation-admin", icon: Mail },
];

// Generate consistent avatar color from string seed
function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

function getInitials(groomName?: string | null, brideName?: string | null): string {
  const g = groomName?.trim().charAt(0).toUpperCase() || "";
  const b = brideName?.trim().charAt(0).toUpperCase() || "";
  return g + b || "WP";
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { profile, user, logout } = useAuthStore();

  const initials = getInitials(profile?.groomName, profile?.brideName);
  const avatarBg = getAvatarColor(user?.id || "default");

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out select-none",
          "md:static md:w-64 md:translate-x-0 md:h-screen md:sticky md:top-0 md:z-30",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] shadow-sm">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                Wedding<span className="text-[#E11D48]">Plan</span>
              </h1>
              <p className="text-[11px] font-medium text-slate-400">Smart Wedding Assistant</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Tutup navigasi"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Couple Mini Banner */}
        <div className="mx-4 my-4 p-3.5 bg-gradient-to-br from-rose-50/70 via-rose-50/40 to-slate-50 border border-rose-100/60 rounded-xl">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Mempelai</p>
          <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
            {profile?.groomName || "Pria"} & {profile?.brideName || "Wanita"}
          </p>
          {profile?.venue && (
            <p className="text-[11px] text-slate-500 truncate mt-0.5">📍 {profile.venue}</p>
          )}
        </div>

        {/* Nav Navigation */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-rose-50/80 text-[#E11D48] font-bold shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#E11D48] rounded-r-full" />
                    )}
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-[#E11D48]" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Settings Link */}
        <div className="px-3 pb-2">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-rose-50/80 text-[#E11D48] font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#E11D48] rounded-r-full" />
                )}
                <Settings
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-[#E11D48]" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span>Pengaturan</span>
              </>
            )}
          </NavLink>
        </div>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm"
              style={{ backgroundColor: avatarBg }}
            >
              {initials}
            </div>

            <div className="flex-1 truncate min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.username ? `@${user.username}` : user?.email}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Aktif
              </p>
            </div>

            <button
              onClick={() => logout()}
              title="Keluar"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
