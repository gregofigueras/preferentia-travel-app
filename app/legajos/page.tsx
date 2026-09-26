"use client";

import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Search, 
  Plus, 
  Calculator, 
  Calendar, 
  DollarSign, 
  Printer, 
  AlertCircle,
  X
} from "lucide-react";
import { useApp } from "@/lib/store";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function LegajosPage() {
  const { data, isLoaded, addLegajo } = useApp();
  const [selectedMonth, setSelectedMonth] = useState<string>("Agosto");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Commission Calculator State
  const [calcUtilidad, setCalcUtilidad] = useState<number>(1000);
  const [calcCommissionPct, setCalcCommissionPct] = useState<number>(50);
  const [calcRetentionPct, setCalcRetentionPct] = useState<number>(18); // 18% = * 0.82

  // New Legajo Form
  const [newTitle, setNewTitle] = useState("");
  const [newLegNumber, setNewLegNumber] = useState("");
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newNotes, setNewNotes] = useState("");

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  // Calculate live commission from calculator widget
  const netBeforeSplit = calcUtilidad * (1 - calcRetentionPct / 100);
  const finalCommission = netBeforeSplit * (calcCommissionPct / 100);

  // Filter legajos by selected month and search term
  const filteredLegajos = data.legajos.filter((leg) => {
    // Check if legajo has entry in selected month
    const hasMonth = leg.months.some((m) => m.month === selectedMonth);
    if (!hasMonth && selectedMonth !== "Todos") return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      leg.raw_title.toLowerCase().includes(q) ||
      (leg.leg_number && leg.leg_number.includes(q))
    );
  });

  // Calculate monthly total for selected month
  const monthlyTotal = filteredLegajos.reduce((acc, leg) => {
    const entry = leg.months.find((m) => m.month === selectedMonth);
    if (!entry) return acc;
    const num = typeof entry.amount === "number" ? entry.amount : parseFloat(String(entry.amount)) || 0;
    return acc + num;
  }, 0);

  const handleCreateLegajo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const fullTitle = newLegNumber.trim()
      ? `${newTitle.trim()} - LEG ${newLegNumber.trim()}`
      : newTitle.trim();

    addLegajo({
      raw_title: fullTitle,
      leg_number: newLegNumber.trim(),
      client_name: newTitle.trim(),
      months: [
        {
          month: selectedMonth,
          amount: newAmount,
          formula: `=${newAmount}*(1-${calcRetentionPct / 100})*${calcCommissionPct / 100}`
        }
      ],
      notes: newNotes.trim() || undefined,
    });

    setNewTitle("");
    setNewLegNumber("");
    setNewAmount(0);
    setNewNotes("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-sky-400" />
            <span>Legajos & Comisiones Mensuales</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Control de números de legajo oficial, cierres mensuales de comisiones y deducciones impositivas automatizadas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Legajo</span>
        </button>
      </div>

      {/* Month Navigation Pills */}
      <div className="bg-slate-900/60 p-2 rounded-2xl border border-slate-800 overflow-x-auto flex space-x-1.5 scrollbar-none">
        {MONTHS.map((m) => {
          const isSelected = selectedMonth === m;
          const countInMonth = data.legajos.filter((l) => l.months.some((x) => x.month === m)).length;
          return (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span>{m}</span>
              {countInMonth > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-sky-700 text-white" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {countInMonth}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Top Split: Live Commission Calculator + Month Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Month Summary Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Cierre de {selectedMonth}</span>
              <Calendar className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {filteredLegajos.length} <span className="text-base font-normal text-slate-400">legajos cerrados</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Archivos registrados con comisión liquidada en {selectedMonth}.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Liquidado en Mes:</span>
            <span className="text-base font-bold text-emerald-400">
              {monthlyTotal > 0 ? monthlyTotal.toLocaleString("es-AR", { maximumFractionDigits: 2 }) : "Ver detalle"}
            </span>
          </div>
        </div>

        {/* Automated Commission Calculator (Solves Lautaro's manual Excel formulas) */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-sky-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Calculadora Inteligente de Comisiones</h3>
              </div>
              <span className="text-[11px] text-sky-400 font-mono">
                Reemplaza =(Utilidad*0.82)*50%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Utilidad Bruta (USD/ARS)</label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    value={calcUtilidad || ""}
                    onChange={(e) => setCalcUtilidad(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Retención / IIBB</label>
                <select
                  value={calcRetentionPct}
                  onChange={(e) => setCalcRetentionPct(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value={18}>18% Retención (* 0.82)</option>
                  <option value={6}>6% IIBB (* 0.94)</option>
                  <option value={0}>0% Sin retención (* 1.0)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Porcentaje Vendedor</label>
                <select
                  value={calcCommissionPct}
                  onChange={(e) => setCalcCommissionPct(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value={50}>50% (Estándar)</option>
                  <option value={30}>30%</option>
                  <option value={35}>35%</option>
                  <option value={25}>25%</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/60 p-3 rounded-xl">
            <div className="text-xs text-slate-400">
              Neto Impositivo: <span className="font-mono text-slate-200">${netBeforeSplit.toFixed(2)}</span>
            </div>
            <div className="text-xs text-right">
              <span className="text-slate-400 mr-2">Tu Comisión Neta:</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                ${finalCommission.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Search & Legajos Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Legajos Registrados en {selectedMonth}
            </h2>
            <p className="text-xs text-slate-400">Detalle de expedientes, montos y fórmulas de liquidación</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por cliente o N° LEG..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Cliente y Número de Legajo</th>
                <th className="pb-3 font-semibold text-center">N° Legajo</th>
                <th className="pb-3 font-semibold text-right">Monto / Comisión</th>
                <th className="pb-3 font-semibold">Fórmula Registrada</th>
                <th className="pb-3 font-semibold text-center">Estado / Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredLegajos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No hay legajos registrados en {selectedMonth}.
                  </td>
                </tr>
              ) : (
                filteredLegajos.map((leg) => {
                  const entry = leg.months.find((m) => m.month === selectedMonth) || leg.months[0];
                  const hasPrintNote = leg.notes && leg.notes.toLowerCase().includes("imprimir");
                  const hasCheckNote = leg.raw_title.toLowerCase().includes("chequear");

                  return (
                    <tr key={leg.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-medium text-white max-w-xs truncate">
                        {leg.raw_title}
                      </td>
                      <td className="py-3 text-center">
                        {leg.leg_number ? (
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                            LEG {leg.leg_number}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-400">
                        {entry && entry.amount !== undefined ? (
                          typeof entry.amount === "number" ? (
                            `$${entry.amount.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`
                          ) : (
                            String(entry.amount)
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                        {entry && entry.formula ? entry.formula : "-"}
                      </td>
                      <td className="py-3 text-center">
                        {hasPrintNote ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold flex items-center justify-center space-x-1 w-fit mx-auto">
                            <Printer className="w-3 h-3" />
                            <span>Imprimir Leg</span>
                          </span>
                        ) : hasCheckNote ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-semibold flex items-center justify-center space-x-1 w-fit mx-auto">
                            <AlertCircle className="w-3 h-3" />
                            <span>Chequear</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                            {leg.notes || "Listo"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nuevo Legajo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-400" />
                <h2 className="text-base font-bold text-white">Nuevo Legajo / Cierre</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLegajo} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Pasajero / Viaje</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gomez Carlos - Cancun"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Número de LEG</label>
                  <input
                    type="text"
                    placeholder="Ej: 42849"
                    value={newLegNumber}
                    onChange={(e) => setNewLegNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Mes de Cierre</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Monto Comisión Calculada</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newAmount || ""}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notas (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: imprimir leg"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/20"
                >
                  Registrar Legajo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
