"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ReceiptText, 
  Search, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Plane,
  X
} from "lucide-react";
import { useApp } from "@/lib/store";
import { Liquidacion } from "@/types";

function LiquidacionesContent() {
  const { data, isLoaded, addLiquidacion } = useApp();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filtro") || "todos";
  const shouldOpenNew = searchParams.get("nueva") === "true";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [isModalOpen, setIsModalOpen] = useState(shouldOpenNew);

  // New Liquidacion Form State
  const [newClient, setNewClient] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newPax, setNewPax] = useState(2);
  const [newTotalAmount, setNewTotalAmount] = useState<number>(0);
  const [newCurrency, setNewCurrency] = useState<"USD" | "ARS">("USD");
  const [initialServiceDesc, setInitialServiceDesc] = useState("Paquete Turístico Completo");

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newDestination.trim()) return;

    const newLiq: Omit<Liquidacion, "id"> = {
      sheet_name: `${newClient} - ${newDestination}`,
      title: `Liquidacion ${newClient} x${newPax} - Programa ${newDestination}`,
      client_name: newClient.trim(),
      destination: newDestination.trim(),
      pax_count: Number(newPax) || 1,
      total_amount: Number(newTotalAmount) || 0,
      total_paid: 0,
      pending_balance: Number(newTotalAmount) || 0,
      currency: newCurrency,
      status: "pending",
      services: [
        {
          description: initialServiceDesc.trim() || "Servicios generales",
          price: Number(newTotalAmount) || 0,
          category: "otro"
        }
      ],
      payments: [],
      notes: "Creada desde el sistema web"
    };

    addLiquidacion(newLiq);
    setIsModalOpen(false);
    // Reset form
    setNewClient("");
    setNewDestination("");
    setNewTotalAmount(0);
  };

  // Filter logic
  const filtered = data.liquidaciones.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      l.client_name.toLowerCase().includes(q) ||
      l.destination.toLowerCase().includes(q) ||
      l.title.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === "pendientes") return l.pending_balance > 0.05;
    if (statusFilter === "saldados") return l.pending_balance <= 0.05;
    return true;
  });

  const countTodos = data.liquidaciones.length;
  const countPendientes = data.liquidaciones.filter((l) => l.pending_balance > 0.05).length;
  const countSaldados = data.liquidaciones.filter((l) => l.pending_balance <= 0.05).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ReceiptText className="w-6 h-6 text-sky-400" />
            <span>Liquidaciones & Cobros</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Administrá todos los viajes, desglose de vuelos, hoteles, asistencias y pagos escalonados de tus pasajeros.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Liquidación</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("todos")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === "todos"
                ? "bg-sky-500 text-white font-semibold shadow-sm"
                : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            Todos ({countTodos})
          </button>
          <button
            onClick={() => setStatusFilter("pendientes")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              statusFilter === "pendientes"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-800/80 text-amber-400/90 hover:text-amber-300"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Con Saldo Pendiente ({countPendientes})</span>
          </button>
          <button
            onClick={() => setStatusFilter("saldados")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
              statusFilter === "saldados"
                ? "bg-emerald-500 text-white font-semibold shadow-sm"
                : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saldados ({countSaldados})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cliente, destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Liquidaciones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            <ReceiptText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No se encontraron liquidaciones con los filtros actuales.</p>
          </div>
        ) : (
          filtered.map((liq) => {
            const percentPaid = liq.total_amount > 0 
              ? Math.min(100, Math.round((liq.total_paid / liq.total_amount) * 100))
              : 100;
            const isFullyPaid = liq.pending_balance <= 0.05;

            return (
              <div
                key={liq.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all hover:translate-y-[-2px] group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition-colors">
                        {liq.client_name}
                      </h3>
                      <p className="text-xs text-sky-400 font-medium flex items-center space-x-1 mt-0.5">
                        <Plane className="w-3 h-3" />
                        <span>{liq.destination}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isFullyPaid
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {isFullyPaid ? "SALDADO" : "PENDIENTE"}
                    </span>
                  </div>

                  {/* Pax & Details */}
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mb-4">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{liq.pax_count} pax</span>
                    </span>
                    <span>·</span>
                    <span>{liq.services.length} servicios</span>
                    <span>·</span>
                    <span>{liq.payments.length} pagos</span>
                  </div>

                  {/* Financial Stats */}
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Venta:</span>
                      <span className="font-semibold text-white">USD {liq.total_amount.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Cobrado:</span>
                      <span className="font-semibold text-emerald-400">USD {liq.total_paid.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                      <span className="text-slate-300 font-medium">Saldo Pendiente:</span>
                      <span className={`font-bold ${isFullyPaid ? "text-emerald-400" : "text-amber-400"}`}>
                        {isFullyPaid ? "USD 0" : `USD ${liq.pending_balance.toLocaleString("es-AR")}`}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Progreso de cobro</span>
                      <span className="font-medium text-slate-300">{percentPaid}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFullyPaid ? "bg-emerald-400" : "bg-gradient-to-r from-sky-400 to-amber-400"
                        }`}
                        style={{ width: `${percentPaid}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    {liq.sheet_name}
                  </span>
                  <Link
                    href={`/liquidaciones/${liq.id}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <span>Ver Ficha & Pagos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Nueva Liquidación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ReceiptText className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-bold text-white">Nueva Liquidación de Viaje</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre del Cliente / Grupo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Flia. Gonzalez, o Grupo Amigos Miami"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Destino / Programa</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Punta Cana, Europa 2026..."
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cant. Pasajeros (Pax)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPax}
                    onChange={(e) => setNewPax(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total a Abonar</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newTotalAmount || ""}
                    onChange={(e) => setNewTotalAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Moneda</label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value as "USD" | "ARS")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="USD">USD (Dólares)</option>
                    <option value="ARS">ARS (Pesos)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descripción del Servicio Inicial</label>
                <input
                  type="text"
                  placeholder="Ej: Aéreos Arajet + Hotel Viva Dominicus"
                  value={initialServiceDesc}
                  onChange={(e) => setInitialServiceDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/20"
                >
                  Crear Ficha de Viaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiquidacionesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    }>
      <LiquidacionesContent />
    </Suspense>
  );
}
