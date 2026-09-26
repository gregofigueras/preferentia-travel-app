"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  Plus, 
  ArrowRight, 
  Plane, 
  Clock, 
  Search,
  ExternalLink,
  Trash2
} from "lucide-react";
import { useApp } from "@/lib/store";

export default function Dashboard() {
  const { data, isLoaded, toggleUrgentTask, addUrgentTask, deleteUrgentTask } = useApp();
  const [newUrgentInput, setNewUrgentInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  // Calculate Metrics
  const totalFacturadoUSD = data.liquidaciones.reduce((sum, l) => sum + (l.total_amount || 0), 0);
  const totalCobradoUSD = data.liquidaciones.reduce((sum, l) => sum + (l.total_paid || 0), 0);
  const totalPendienteUSD = data.liquidaciones.reduce((sum, l) => sum + (l.pending_balance || 0), 0);
  
  const pendientesCobro = data.liquidaciones.filter((l) => l.pending_balance > 1);

  const handleAddUrgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrgentInput.trim()) return;
    addUrgentTask(newUrgentInput.trim());
    setNewUrgentInput("");
  };

  const filteredLiquidaciones = data.liquidaciones.filter((l) => {
    const q = searchTerm.toLowerCase();
    return (
      l.client_name.toLowerCase().includes(q) ||
      l.destination.toLowerCase().includes(q) ||
      l.sheet_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Welcome & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white tracking-tight">¡Hola Lautaro!</span>
            <span className="text-2xl">✈️</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Panel de control de operaciones de Preferentia Travel. Resumen general de liquidaciones, cobranzas y propuestas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/crm?tab=armar"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Ver Cotizaciones ({data.crm.propuestas_a_armar.length})</span>
          </Link>
          <Link
            href="/liquidaciones?nueva=true"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Liquidación</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Facturado */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Facturado</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            USD {totalFacturadoUSD.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400">
            <Plane className="w-3.5 h-3.5 text-sky-400 mr-1" />
            <span>{data.liquidaciones.length} viajes registrados</span>
          </div>
        </div>

        {/* Total Cobrado */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Total Cobrado</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
            USD {totalCobradoUSD.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {Math.round((totalCobradoUSD / (totalFacturadoUSD || 1)) * 100)}% de los servicios cobrados
          </div>
        </div>

        {/* Pendiente de Cobro */}
        <div className="bg-slate-900/70 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-300">Pendiente de Cobro</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">
            USD {totalPendienteUSD.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-2 flex items-center text-xs text-amber-300/80">
            <span className="font-semibold mr-1">{pendientesCobro.length} viajes</span> con saldo pendiente
          </div>
        </div>

        {/* Comisiones Estimadas */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Legajos / Comisiones</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-300">
            {data.legajos.length}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Legajos históricos</span>
            <Link href="/legajos" className="text-sky-400 hover:underline">Ver comisiones →</Link>
          </div>
        </div>

      </div>

      {/* Main Grid: Urgent Tasks ("HOY SI O SI") + Cobranzas prioritarias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* HOY SI O SI (Urgent Widget) */}
        <div className="lg:col-span-1 bg-slate-900/70 border border-rose-500/30 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></div>
              <h2 className="text-base font-bold text-white tracking-tight uppercase">HOY SI O SI</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {data.crm.urgencias_hoy.filter(t => !t.completed).length} pendientes
            </span>
          </div>

          {/* New Urgent Form */}
          <form onSubmit={handleAddUrgent} className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Nueva urgencia diaria..."
              value={newUrgentInput}
              onChange={(e) => setNewUrgentInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
            >
              Agregar
            </button>
          </form>

          {/* Urgent List */}
          <div className="mt-4 space-y-2.5 flex-1 overflow-y-auto max-h-[320px] pr-1">
            {data.crm.urgencias_hoy.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">¡No tenés urgencias pendientes para hoy!</p>
            ) : (
              data.crm.urgencias_hoy.map((task) => (
                <div
                  key={task.id}
                  className={`group flex items-start justify-between p-3 rounded-xl border transition-all ${
                    task.completed
                      ? "bg-slate-950/40 border-slate-800/50 opacity-60"
                      : "bg-slate-950/90 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <button
                    onClick={() => toggleUrgentTask(task.id)}
                    className="flex items-start space-x-2.5 text-left flex-1"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        task.completed ? "line-through text-slate-500" : "text-slate-200 font-medium"
                      }`}
                    >
                      {task.title}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteUrgentTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cobranzas Prioritarias (Clientes con saldo pendiente) */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Cobranzas & Saldos Pendientes</h2>
              <p className="text-xs text-slate-400">Pasajeros que tienen pagos parciales o saldos a saldar</p>
            </div>
            <Link
              href="/liquidaciones?filtro=pendientes"
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
            >
              <span>Ver todos ({pendientesCobro.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-800/60 overflow-hidden">
            {pendientesCobro.slice(0, 5).map((liq) => (
              <div key={liq.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-white truncate">{liq.client_name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {liq.destination}
                    </span>
                    <span className="text-xs text-slate-400">({liq.pax_count} pax)</span>
                  </div>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
                    <span>Total: USD {liq.total_amount.toLocaleString("es-AR")}</span>
                    <span>·</span>
                    <span className="text-emerald-400">Pagado: USD {liq.total_paid.toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <div className="text-right flex items-center space-x-4">
                  <div>
                    <div className="text-sm font-bold text-amber-400">
                      USD {liq.pending_balance.toLocaleString("es-AR")}
                    </div>
                    <div className="text-[11px] text-slate-500">Resta cobrar</div>
                  </div>
                  <Link
                    href={`/liquidaciones/${liq.id}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Ver Ficha y Pagos"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {pendientesCobro.length > 5 && (
            <div className="pt-4 border-t border-slate-800/80 text-center">
              <Link
                href="/liquidaciones?filtro=pendientes"
                className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
              >
                + {pendientesCobro.length - 5} liquidaciones más con saldo pendiente
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Explorador Rápido de Todas las Liquidaciones (66 pestañas del Excel) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Directorio de Liquidaciones</h2>
            <p className="text-xs text-slate-400">Acceso instantáneo a las 66 liquidaciones importadas de tu Excel</p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar cliente, destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Table of Liquidaciones */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Cliente / Grupo</th>
                <th className="pb-3 font-semibold">Destino</th>
                <th className="pb-3 font-semibold text-center">Pasajeros</th>
                <th className="pb-3 font-semibold text-right">Total USD</th>
                <th className="pb-3 font-semibold text-right">Cobrado USD</th>
                <th className="pb-3 font-semibold text-right">Saldo Pendiente</th>
                <th className="pb-3 font-semibold text-center">Estado</th>
                <th className="pb-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredLiquidaciones.slice(0, 10).map((liq) => (
                <tr key={liq.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-medium text-white">
                    <Link href={`/liquidaciones/${liq.id}`} className="hover:text-sky-400 hover:underline">
                      {liq.client_name}
                    </Link>
                  </td>
                  <td className="py-3 text-slate-300">{liq.destination}</td>
                  <td className="py-3 text-center text-slate-400">{liq.pax_count} pax</td>
                  <td className="py-3 text-right font-medium text-slate-200">
                    USD {liq.total_amount.toLocaleString("es-AR")}
                  </td>
                  <td className="py-3 text-right text-emerald-400 font-medium">
                    USD {liq.total_paid.toLocaleString("es-AR")}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {liq.pending_balance <= 0.05 ? (
                      <span className="text-emerald-400">Saldado</span>
                    ) : (
                      <span className="text-amber-400">USD {liq.pending_balance.toLocaleString("es-AR")}</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {liq.status === "paid" ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                        Saldado
                      </span>
                    ) : liq.status === "partial" ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                        En Pagos
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/liquidaciones/${liq.id}`}
                      className="inline-flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 font-medium"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Mostrando {Math.min(10, filteredLiquidaciones.length)} de {filteredLiquidaciones.length} liquidaciones</span>
          <Link href="/liquidaciones" className="text-sky-400 hover:underline font-medium">
            Ver listado completo y crear nuevas liquidaciones →
          </Link>
        </div>
      </div>

    </div>
  );
}
