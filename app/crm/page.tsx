"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  KanbanSquare, 
  Plus, 
  Clock, 
  Send, 
  CheckCircle2, 
  Calendar,
  Trash2,
  ReceiptText,
  Search,
  ChevronRight,
  ChevronLeft,
  X
} from "lucide-react";
import { useApp } from "@/lib/store";
import { CRMItem } from "@/types";

export default function CRMPage() {
  const { data, isLoaded, addCRMItem, updateCRMStatus, deleteCRMItem } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Proposal Form
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [newStatus, setNewStatus] = useState<CRMItem["status"]>("armar");

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCRMItem({
      title: newTitle.trim(),
      client_name: newClient.trim() || undefined,
      destination: newDestination.trim() || undefined,
      status: newStatus,
      date: new Date().toISOString().split("T")[0],
    });

    setNewTitle("");
    setNewClient("");
    setNewDestination("");
    setIsModalOpen(false);
  };

  const filterItems = (items: CRMItem[]) => {
    if (!searchTerm.trim()) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.client_name && i.client_name.toLowerCase().includes(q)) ||
        (i.destination && i.destination.toLowerCase().includes(q))
    );
  };

  const colArmar = filterItems(data.crm.propuestas_a_armar);
  const colEnviadas = filterItems(data.crm.propuestas_enviadas);
  const colCerradas = filterItems(data.crm.cerrados_2026);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <KanbanSquare className="w-6 h-6 text-sky-400" />
            <span>Pipeline de Cotizaciones & Seguimiento</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestioná el ciclo completo: desde cotizaciones pedidas por WhatsApp hasta propuestas enviadas y ventas cerradas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Propuesta</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-4 text-xs text-slate-300">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>A Cotizar: <strong className="text-white">{colArmar.length}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span>En Seguimiento: <strong className="text-white">{colEnviadas.length}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Cerradas 2026: <strong className="text-white">{colCerradas.length}</strong></span>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrar propuestas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Kanban Board (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* COLUMN 1: Propuestas a armar */}
        <div className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">A Cotizar / Armar</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
              {colArmar.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
            {colArmar.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No hay cotizaciones pendientes.</p>
            ) : (
              colArmar.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 shadow-sm space-y-2 group transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white leading-snug">
                      {item.title}
                    </span>
                    <button
                      onClick={() => deleteCRMItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition-opacity"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => updateCRMStatus(item.id, "enviada")}
                      className="inline-flex items-center space-x-1 text-[11px] font-medium text-sky-400 hover:text-sky-300"
                    >
                      <span>Pasar a Enviada</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: Propuestas Enviadas y Seguimiento */}
        <div className="bg-slate-900/60 border border-sky-500/20 rounded-2xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-sky-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Enviadas & Seguimiento</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/20">
              {colEnviadas.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
            {colEnviadas.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No hay propuestas en seguimiento.</p>
            ) : (
              colEnviadas.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/90 border border-slate-800 hover:border-sky-500/40 rounded-xl p-3.5 shadow-sm space-y-2 group transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white leading-snug">
                      {item.title}
                    </span>
                    <button
                      onClick={() => deleteCRMItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition-opacity"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => updateCRMStatus(item.id, "armar")}
                      className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-400 hover:text-slate-300"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      <span>Volver</span>
                    </button>

                    <button
                      onClick={() => updateCRMStatus(item.id, "cerrado")}
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <span>¡Cerrada!</span>
                      <CheckCircle2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: Ventas Cerradas */}
        <div className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Cerradas / En Operación</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              {colCerradas.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
            {colCerradas.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No hay ventas cerradas aún.</p>
            ) : (
              colCerradas.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-3.5 shadow-sm space-y-2 group transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white leading-snug">
                      {item.title}
                    </span>
                    <button
                      onClick={() => deleteCRMItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition-opacity"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {item.date && (
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Cerrado el {item.date}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => updateCRMStatus(item.id, "enviada")}
                      className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-400 hover:text-slate-300"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      <span>Volver</span>
                    </button>

                    <Link
                      href={`/liquidaciones?nueva=true`}
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-sky-400 hover:text-sky-300"
                    >
                      <ReceiptText className="w-3 h-3" />
                      <span>Crear Liquidación</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal: Nueva Propuesta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <KanbanSquare className="w-5 h-5 text-sky-400" />
                <h2 className="text-base font-bold text-white">Nueva Propuesta / Cotización</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título / Resumen</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Perez Juan - Vuelos Miami x4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Estado Inicial</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as CRMItem["status"])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="armar">A Cotizar / Armar</option>
                  <option value="enviada">Propuesta Enviada / Seguimiento</option>
                  <option value="cerrado">Cerrada</option>
                </select>
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
                  Guardar Propuesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
