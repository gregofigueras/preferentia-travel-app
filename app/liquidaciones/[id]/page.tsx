"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  ReceiptText, 
  Plane, 
  Users, 
  DollarSign, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Printer,
  Check
} from "lucide-react";
import { useApp } from "@/lib/store";
import { PaymentItem, ServiceItem } from "@/types";

export default function LiquidacionDetailPage() {
  const params = useParams();
  const { data, isLoaded, addPaymentToLiquidacion, deletePaymentFromLiquidacion, addServiceToLiquidacion, deleteServiceFromLiquidacion } = useApp();

  const id = params?.id as string;
  const liq = data.liquidaciones.find((l) => l.id === id);

  // New Service State
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState<number>(0);
  const [newServiceNeto, setNewServiceNeto] = useState<string>("");
  const [isAddingService, setIsAddingService] = useState(false);

  // New Payment State
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentCurrency, setPaymentCurrency] = useState<"USD" | "ARS">("USD");
  const [paymentTC, setPaymentTC] = useState<number>(1560);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  // Copied alert state
  const [copied, setCopied] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  if (!liq) {
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
        <ReceiptText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Liquidación no encontrada</h2>
        <p className="text-xs text-slate-400 mt-1">Es posible que el id sea inválido o haya sido eliminada.</p>
        <Link
          href="/liquidaciones"
          className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Liquidaciones</span>
        </Link>
      </div>
    );
  }

  const isFullyPaid = liq.pending_balance <= 0.05;

  // Add Service Handler
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceDesc.trim() || newServicePrice <= 0) return;

    const newService: ServiceItem = {
      description: newServiceDesc.trim(),
      price: Number(newServicePrice),
      neto: newServiceNeto.trim() ? newServiceNeto.trim() : null,
    };

    addServiceToLiquidacion(liq.id, newService);
    setNewServiceDesc("");
    setNewServicePrice(0);
    setNewServiceNeto("");
    setIsAddingService(false);
  };

  // Add Payment Handler
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    let finalAmountUSD = paymentAmount;
    let noteDetails = paymentNotes.trim();

    if (paymentCurrency === "ARS") {
      finalAmountUSD = Math.round((paymentAmount / paymentTC) * 100) / 100;
      noteDetails = noteDetails 
        ? `${noteDetails} (ARS ${paymentAmount.toLocaleString("es-AR")} @ TC ${paymentTC})`
        : `ARS ${paymentAmount.toLocaleString("es-AR")} @ TC ${paymentTC}`;
    }

    const newPayment: PaymentItem = {
      date: paymentDate,
      amount: finalAmountUSD,
      currency: paymentCurrency,
      tc: paymentCurrency === "ARS" ? paymentTC : null,
      notes: noteDetails,
    };

    addPaymentToLiquidacion(liq.id, newPayment);
    setPaymentAmount(0);
    setPaymentCurrency("USD");
    setPaymentNotes("");
    setIsAddingPayment(false);
  };

  // WhatsApp Message Generator
  const generateWhatsAppMessage = () => {
    const lines = [
      `✈️ *PREFERENTIA TRAVEL* - Estado de Liquidación`,
      `👤 *Cliente:* ${liq.client_name}`,
      `📍 *Destino:* ${liq.destination} (${liq.pax_count} pax)`,
      ``,
      `📋 *Servicios Contratados:*`,
      ...liq.services.map((s) => `• ${s.description}: USD ${s.price.toLocaleString("es-AR")}`),
      ``,
      `💰 *Total a Abonar:* USD ${liq.total_amount.toLocaleString("es-AR")}`,
      `💳 *Total Pagado a la Fecha:* USD ${liq.total_paid.toLocaleString("es-AR")}`,
      isFullyPaid 
        ? `✅ *Saldo Pendiente:* USD 0.00 (VIAJE SALDADO)` 
        : `⏳ *Saldo Pendiente:* USD ${liq.pending_balance.toLocaleString("es-AR")}`,
      ``,
      `Cualquier consulta sobre formas de pago o tipo de cambio del día, avísame. ¡Saludos! Lauti - Preferentia Travel`,
    ];
    return lines.join("\n");
  };

  const copyWhatsApp = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/liquidaciones"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyWhatsApp}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              copied
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-400" />}
            <span>{copied ? "¡Copiado para WhatsApp!" : "Copiar para WhatsApp"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Trip Card Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-xs font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Preferentia Travel · Liquidación
              </span>
              <span className="text-xs text-slate-500">{liq.sheet_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {liq.client_name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center space-x-1 text-sky-400 font-medium">
                <Plane className="w-4 h-4" />
                <span>{liq.destination}</span>
              </span>
              <span>·</span>
              <span className="flex items-center space-x-1 text-slate-400">
                <Users className="w-4 h-4" />
                <span>{liq.pax_count} Pasajeros</span>
              </span>
            </div>
          </div>

          {/* Quick Balance Status Badge */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Saldo Pendiente</div>
              <div className={`text-xl sm:text-2xl font-black ${isFullyPaid ? "text-emerald-400" : "text-amber-400"}`}>
                {isFullyPaid ? "USD 0.00" : `USD ${liq.pending_balance.toLocaleString("es-AR")}`}
              </div>
            </div>
            <div className="pl-3 border-l border-slate-800">
              {isFullyPaid ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SALDADO</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>EN COBRO</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium">Total Contratado</span>
            <div className="text-lg font-bold text-white mt-0.5">USD {liq.total_amount.toLocaleString("es-AR")}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium">Total Cobrado</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">USD {liq.total_paid.toLocaleString("es-AR")}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium">Porcentaje Cobrado</span>
            <div className="text-lg font-bold text-sky-400 mt-0.5">
              {liq.total_amount > 0 ? Math.round((liq.total_paid / liq.total_amount) * 100) : 100}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Services Breakdown & Payments History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Detalle de Servicios */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                  <Plane className="w-4 h-4 text-sky-400" />
                  <span>Desglose de Servicios</span>
                </h2>
                <p className="text-xs text-slate-400">Vuelos, alojamientos, traslados y asistencias médicas</p>
              </div>

              <button
                onClick={() => setIsAddingService(!isAddingService)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Ítem</span>
              </button>
            </div>

            {/* Inline Add Service Form */}
            {isAddingService && (
              <form onSubmit={handleAddService} className="bg-slate-950 p-4 rounded-xl border border-sky-500/30 mb-4 space-y-3 animate-in fade-in">
                <div className="text-xs font-semibold text-sky-400">Nuevo Servicio / Producto</div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Descripción (ej: Vuelos ARAJET BUE-PUJ, Hotel Barceló...)"
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Precio Venta (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={newServicePrice || ""}
                      onChange={(e) => setNewServicePrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Costo Neto Operador (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: neto 1450"
                      value={newServiceNeto}
                      onChange={(e) => setNewServiceNeto(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingService(false)}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
                  >
                    Guardar Servicio
                  </button>
                </div>
              </form>
            )}

            {/* Services List */}
            <div className="divide-y divide-slate-800/60">
              {liq.services.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No hay servicios detallados en esta ficha.</p>
              ) : (
                liq.services.map((service, index) => (
                  <div key={index} className="py-3 flex items-start justify-between gap-4 group">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-200">
                        {service.description}
                      </div>
                      {service.neto && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Operador: <span className="font-mono">{service.neto}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        USD {service.price.toLocaleString("es-AR")}
                      </span>
                      <button
                        onClick={() => deleteServiceFromLiquidacion(liq.id, index)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                        title="Eliminar ítem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">TOTAL A ABONAR:</span>
            <span className="font-bold text-sm text-white">USD {liq.total_amount.toLocaleString("es-AR")}</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Registro y Control de Pagos */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Registro de Cobros</span>
                </h2>
                <p className="text-xs text-slate-400">Pagos parciales, cuotas y conversión de tipo de cambio</p>
              </div>

              <button
                onClick={() => setIsAddingPayment(!isAddingPayment)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Registrar Cobro</span>
              </button>
            </div>

            {/* Inline Add Payment Form */}
            {isAddingPayment && (
              <form onSubmit={handleAddPayment} className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 mb-4 space-y-3 animate-in fade-in">
                <div className="text-xs font-semibold text-emerald-400">Registrar Nuevo Cobro</div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Fecha</label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Moneda del Pago</label>
                    <select
                      value={paymentCurrency}
                      onChange={(e) => setPaymentCurrency(e.target.value as "USD" | "ARS")}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="USD">USD (Dólares billete o transf.)</option>
                      <option value="ARS">ARS (Pesos con Tipo de Cambio)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      {paymentCurrency === "ARS" ? "Monto Abonado en ARS" : "Monto Abonado (USD)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={paymentAmount || ""}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  {paymentCurrency === "ARS" && (
                    <div>
                      <label className="block text-[10px] text-amber-400 mb-1">Tipo de Cambio (TC)</label>
                      <input
                        type="number"
                        step="1"
                        required
                        value={paymentTC || ""}
                        onChange={(e) => setPaymentTC(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>

                {paymentCurrency === "ARS" && paymentAmount > 0 && paymentTC > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                    Equivalente: <span className="font-bold">USD {(paymentAmount / paymentTC).toFixed(2)}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Notas / Quién Pagó</label>
                  <input
                    type="text"
                    placeholder="Ej: Pago Marisa transferencia, seña 50%..."
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPayment(false)}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    Registrar Cobro
                  </button>
                </div>
              </form>
            )}

            {/* Payments List */}
            <div className="divide-y divide-slate-800/60">
              {liq.payments.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No hay cobros registrados todavía.</p>
              ) : (
                liq.payments.map((payment, index) => (
                  <div key={index} className="py-3 flex items-start justify-between gap-4 group">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-emerald-400">
                          USD {payment.amount.toLocaleString("es-AR")}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {payment.date || "Fecha no esp."}
                        </span>
                      </div>
                      {payment.notes && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {payment.notes}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deletePaymentFromLiquidacion(liq.id, index)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                      title="Eliminar pago"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">TOTAL COBRADO:</span>
            <span className="font-bold text-sm text-emerald-400">USD {liq.total_paid.toLocaleString("es-AR")}</span>
          </div>
        </div>

      </div>

      {/* Printable / WhatsApp Ready Voucher Preview Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-inner print:block print:bg-white print:text-black print:border-none">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ReceiptText className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Vista Previa para Pasajero (Preferentia Travel)</h3>
          </div>
          <button
            onClick={copyWhatsApp}
            className="text-xs text-sky-400 hover:underline flex items-center space-x-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar texto formateado</span>
          </button>
        </div>

        <div className="mt-4 bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800/80">
          {generateWhatsAppMessage()}
        </div>
      </div>
    </div>
  );
}
