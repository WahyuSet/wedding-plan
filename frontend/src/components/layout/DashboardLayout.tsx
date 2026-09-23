import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, HeartHandshake } from "lucide-react";
import { Sidebar } from "./Sidebar.js";
import { MobileNav } from "./MobileNav.js";

export const DashboardLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FBFBFA]">
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 select-none">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 -ml-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] shadow-xs">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span className="text-sm font-extrabold text-slate-900">
              Wedding<span className="text-[#E11D48]">Plan</span>
            </span>
          </div>
        </div>
      </header>

      {/* Sidebar (Desktop Static + Mobile Slide-out Drawer) */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
};
