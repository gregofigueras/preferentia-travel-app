"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ReceiptText, 
  KanbanSquare, 
  FileSpreadsheet, 
  Menu,
  X,
  Plane
} from "lucide-react";
import { useApp } from "@/lib/store";

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { data } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingUrgentCount = data.crm.urgencias_hoy.filter(t => !t.completed).length;
  const pendingDebtCount = data.liquidaciones.filter(l => l.pending_balance > 0.05).length;

  const navItems = [
    {
      name: "1. Seguimiento & Cotizaciones",
      href: "/?tab=seguimiento",
      icon: KanbanSquare,
      badge: pendingUrgentCount > 0 ? `${pendingUrgentCount} urgentes` : undefined,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
    {
      name: "2. Mis Números & Legajos",
      href: "/?tab=numeros",
      icon: FileSpreadsheet,
    },
    {
      name: "3. Liquidaciones & Cobranzas",
      href: "/?tab=liquidaciones",
      icon: ReceiptText,
      badge: pendingDebtCount > 0 ? `${pendingDebtCount} por cobrar` : undefined,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-amber-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Plane className="w-5 h-5 text-sky-400 -rotate-45" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold tracking-tight text-white text-lg">PREFERENTIA</span>
                  <span className="text-sky-400 font-semibold text-xs tracking-widest uppercase bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-800/60">TRAVEL</span>
                </div>
                <p className="text-xs text-slate-400">Lautaro Zeppa · Operaciones & Ventas</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800 text-sky-400 shadow-inner border border-slate-700"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User profile & Action */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Preferentia v1.0</span>
            </div>
            <Link
              href="/liquidaciones?nueva=true"
              className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all hover:shadow-sky-500/20 hover:scale-[1.02]"
            >
              <span>+ Nueva Liquidación</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-slate-800 text-sky-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-slate-400" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800">
            <Link
              href="/liquidaciones?nueva=true"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow transition-colors"
            >
              <span>+ Nueva Liquidación</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
