"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ReceiptText, 
  KanbanSquare, 
  FileSpreadsheet, 
  Menu,
  X,
  Plane,
  Sparkles
} from "lucide-react";
import { useApp } from "@/lib/store";

function NavigationContent() {
  const pathname = usePathname();
  const { data, activeTab, setActiveTab } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = pathname === "/";

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueOrTodayCount = data.crm.urgencias_hoy.filter(t => !t.completed && (!t.date || t.date <= todayStr)).length;
  const pendingDebtCount = data.liquidaciones.filter(l => l.pending_balance > 0.05).length;

  const navItems = [
    {
      name: "Seguimiento & Cotizaciones",
      hotkey: "1",
      tabKey: "seguimiento",
      href: "/?tab=seguimiento",
      icon: KanbanSquare,
      badge: overdueOrTodayCount > 0 ? `${overdueOrTodayCount} para hoy` : undefined,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      activeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-sm shadow-sky-500/10",
      iconActive: "text-sky-400",
    },
    {
      name: "Mis Números & Legajos",
      hotkey: "2",
      tabKey: "numeros",
      href: "/?tab=numeros",
      icon: FileSpreadsheet,
      activeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-sm shadow-indigo-500/10",
      iconActive: "text-indigo-400",
    },
    {
      name: "Liquidaciones & Cobranzas",
      hotkey: "3",
      tabKey: "liquidaciones",
      href: "/?tab=liquidaciones",
      icon: ReceiptText,
      badge: pendingDebtCount > 0 ? `${pendingDebtCount} por cobrar` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      activeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10",
      iconActive: "text-emerald-400",
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3 group" title="Ir al Tablero Principal">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Plane className="w-5 h-5 text-sky-400 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold tracking-tight text-white text-base sm:text-lg">PREFERENTIA</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-sky-950/80 text-sky-400 px-1.5 py-0.5 rounded border border-sky-800/60 font-mono">
                    TRAVEL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Lautaro Zeppa · Tablero Ejecutivo</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation (Tabs with Hotkey Badges) */}
          <nav className="hidden md:flex items-center space-x-1.5" aria-label="Navegación principal">
            {navItems.map((item) => {
              const isTabActive = isHome ? activeTab === item.tabKey : pathname.startsWith(item.href.replace("/?tab=", "/"));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    if (isHome) {
                      e.preventDefault();
                      setActiveTab(item.tabKey as "seguimiento" | "numeros" | "liquidaciones");
                    }
                  }}
                  className={`group relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                    isTabActive
                      ? `${item.activeColor} border-current`
                      : "border-transparent text-slate-300 hover:text-white hover:bg-slate-800/60 hover:border-slate-700/60"
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-mono font-bold transition-colors ${
                    isTabActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                  }`}>
                    {item.hotkey}
                  </span>
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isTabActive ? item.iconActive : "text-slate-400"}`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User profile & Fast Action */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/90 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] text-slate-300 font-sans font-medium">Operaciones en vivo</span>
            </div>
            <Link
              href="/?tab=liquidaciones&nueva=true"
              className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Nueva Liquidación</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2 animate-in fade-in">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1">
            Espacios de Trabajo
          </div>
          {navItems.map((item) => {
            const isTabActive = isHome ? activeTab === item.tabKey : pathname.startsWith(item.href.replace("/?tab=", "/"));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (isHome) {
                    e.preventDefault();
                    setActiveTab(item.tabKey as "seguimiento" | "numeros" | "liquidaciones");
                  }
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  isTabActive
                    ? `${item.activeColor} border-current`
                    : "border-transparent text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-5 h-5 rounded bg-slate-800 text-[11px] font-mono flex items-center justify-center text-slate-400">
                    {item.hotkey}
                  </span>
                  <Icon className={`w-4 h-4 ${isTabActive ? item.iconActive : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800">
            <Link
              href="/?tab=liquidaciones&nueva=true"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-98 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Nueva Liquidación Rápida</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export const Navigation: React.FC = () => {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 h-16 flex items-center px-6 text-slate-400 text-xs">
        Cargando navegación...
      </header>
    }>
      <NavigationContent />
    </Suspense>
  );
};
