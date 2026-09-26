"use client";

import React, { useEffect } from "react";
import { 
  Keyboard, 
  X, 
  Sparkles, 
  KanbanSquare, 
  Share2, 
  Lightbulb
} from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  action: string;
  desc: string;
  badge?: string;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navShortcuts: ShortcutItem[] = [
    {
      keys: ["1"],
      action: "Seguimiento & Cotizaciones",
      desc: "Agenda de alertas, propuestas a armar, enviadas y ventas cerradas",
    },
    {
      keys: ["2"],
      action: "Mis Números & Legajos",
      desc: "Ventas por legajo, cálculo de comisión y porcentaje retenido",
    },
    {
      keys: ["3"],
      action: "Liquidaciones & Cobranzas",
      desc: "Master de pasajeros, cobros parciales/saldados y estado de cuenta",
    },
  ];

  const actionShortcuts: ShortcutItem[] = [
    {
      keys: ["Alt", "P"],
      action: "Programar Alerta / Vencimiento",
      desc: "Abre el calendario de alertas con fecha de vencimiento y prioridad",
      badge: "Nuevo",
    },
    {
      keys: ["Alt", "L"],
      action: "Nueva Liquidación Rápida",
      desc: "Crea una liquidación con cliente, destino, pasajeros y total",
      badge: "Frecuente",
    },
    {
      keys: ["Alt", "C"],
      action: "Nueva Cotización en CRM",
      desc: "Enfoca el campo rápido para cargar un presupuesto a armar",
    },
    {
      keys: ["Alt", "M"],
      action: "Nuevo Legajo de Venta",
      desc: "Registra un legajo con utilidad y comisión en Mis Números",
    },
  ];

  const utilityShortcuts: ShortcutItem[] = [
    {
      keys: ["Alt", "W"],
      action: "Copiar Resumen para WhatsApp",
      desc: "Copia el mensaje formal con saldos y detalles para el cliente",
    },
    {
      keys: ["/"],
      action: "Búsqueda Rápida",
      desc: "Pone el cursor en el buscador de la sección activa al instante",
    },
    {
      keys: ["Esc"],
      action: "Cerrar Ventana / Cancelar",
      desc: "Cierra cualquier formulario o modal sin guardar cambios",
    },
    {
      keys: ["?"],
      action: "Guía de Atajos de Teclado",
      desc: "Abre o cierra este panel de ayuda en cualquier momento",
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="shortcuts-title" className="text-base font-bold text-white tracking-tight">
                  Atajos de Teclado
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                  Accesos Rápidos
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Operá Preferentia Travel a la velocidad de la luz sin depender del mouse
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Group 1: Navigation */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <KanbanSquare className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                1. Navegación entre Módulos
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {navShortcuts.map((item) => (
                <div 
                  key={item.action} 
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-200 text-xs">{item.action}</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold text-xs shadow-inner">
                      {item.keys[0]}
                    </kbd>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Group 2: Actions & Creation */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                2. Creación & Carga Rápida
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {actionShortcuts.map((item) => (
                <div 
                  key={item.action} 
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs">{item.action}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {item.keys.map((k, i) => (
                      <React.Fragment key={k}>
                        <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sky-300 font-mono font-bold text-xs shadow-inner">
                          {k}
                        </kbd>
                        {i < item.keys.length - 1 && <span className="text-slate-500 text-xs">+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group 3: Utilities */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Share2 className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">
                3. Acciones & Utilidades
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {utilityShortcuts.map((item) => (
                <div 
                  key={item.action} 
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-white text-xs">{item.action}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {item.keys.map((k, i) => (
                      <React.Fragment key={k}>
                        <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-amber-300 font-mono font-bold text-xs shadow-inner">
                          {k}
                        </kbd>
                        {i < item.keys.length - 1 && <span className="text-slate-500 text-xs">+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer tip */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-[11px]">
            <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong className="text-slate-200">Diseñado para tu ritmo:</strong> Los atajos con <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">Alt</kbd> evitan conflictos con Google Chrome en Windows.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
          >
            Entendido (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
