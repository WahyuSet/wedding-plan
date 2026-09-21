import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  WalletCards,
  Gift,
  Clock,
  FileCheck2,
  Settings,
  Mail,
} from "lucide-react";
import { cn } from "../../lib/utils.js";

const mobileNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Budget", href: "/budget", icon: WalletCards },
  { name: "Seserahan", href: "/seserahan", icon: Gift },
  { name: "Undangan", href: "/invitation-admin", icon: Mail },
  { name: "Operasional", href: "/operasional", icon: Clock },
  { name: "KUA", href: "/dokumen-kua", icon: FileCheck2 },
  { name: "Setelan", href: "/settings", icon: Settings },
];

export const MobileNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all",
                  isActive
                    ? "text-[#E11D48] font-bold"
                    : "text-slate-500 hover:text-slate-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "w-5 h-5 mb-0.5 transition-transform",
                      isActive && "scale-110 text-[#E11D48]"
                    )}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
