"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  DollarSign, 
  ReceiptText, 
  Plus, 
  Plane, 
  Search,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Calendar,
  ChevronRight,
  Calculator,
  Printer,
  Copy,
  Check,
  X,
  Circle,
  ArrowRight,
  FileSpreadsheet,
  KanbanSquare,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { useApp } from "@/lib/store";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function ExecutiveWorkspaceContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "seguimiento";
  const { 
    data, 
    isLoaded, 
    addLiquidacion,
    addPaymentToLiquidacion,
    deletePaymentFromLiquidacion,
    addServiceToLiquidacion,
    deleteServiceFromLiquidacion,
    addCRMProposal,
    moveCRMToSeguimiento,
    cerrarVentaCRM,
    deleteCRMItem,
    toggleUrgentTask,
    addUrgentTask,
    deleteUrgentTask,
    addLegajo,
    showToast
  } = useApp();

  // Active top-level workspace tab
  const [activeTab, setActiveTab] = useState<"seguimiento" | "numeros" | "liquidaciones">(
    initialTab as "seguimiento" | "numeros" | "liquidaciones"
  );

  // Sync tab with URL if changed
  useEffect(() => {
    if (searchParams.get("tab")) {
      const t = searchParams.get("tab");
      if (t === "seguimiento" || t === "numeros" || t === "liquidaciones") {
        setActiveTab(t);
      }
    }
  }, [searchParams]);

  // Keyboard shortcut listener (keys 1, 2, 3 to switch views)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === "1") setActiveTab("seguimiento");
      if (e.key === "2") setActiveTab("numeros");
      if (e.key === "3") setActiveTab("liquidaciones");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --------------------------------------------------------------------------
  // STATE: TAB 1 - SEGUIMIENTO & COTIZACIONES
  // --------------------------------------------------------------------------
  const [newUrgentInput, setNewUrgentInput] = useState("");
  const [newPropArmar, setNewPropArmar] = useState("");
  const [newPropEnv, setNewPropEnv] = useState("");
  const [searchCerradas, setSearchCerradas] = useState("");
  const [cerradasYear, setCerradasYear] = useState<"2026" | "2025">("2026");

  // Modal para cerrar venta
  const [closeSaleModal, setCloseSaleModal] = useState<{
    isOpen: boolean;
    itemId: string;
    clientName: string;
    serviceDesc: string;
    date: string;
  }>({
    isOpen: false,
    itemId: "",
    clientName: "",
    serviceDesc: "",
    date: new Date().toISOString().split("T")[0],
  });

  // --------------------------------------------------------------------------
  // STATE: TAB 2 - MIS NÚMEROS / LEGAJOS
  // --------------------------------------------------------------------------
  const [selectedMonth, setSelectedMonth] = useState<string>("Agosto");
  const [searchLegajo, setSearchLegajo] = useState("");
  const [calcUtilidad, setCalcUtilidad] = useState<number>(1000);
  const [calcCommissionPct, setCalcCommissionPct] = useState<number>(50);
  const [calcRetentionPct, setCalcRetentionPct] = useState<number>(18);
  const [newLegModal, setNewLegModal] = useState(false);
  const [newLegClient, setNewLegClient] = useState("");
  const [newLegNum, setNewLegNum] = useState("");
  const [newLegAmount, setNewLegAmount] = useState<number>(0);
  const [newLegNotes, setNewLegNotes] = useState("");

  // --------------------------------------------------------------------------
  // STATE: TAB 3 - LIQUIDACIONES (SPLIT-VIEW)
  // --------------------------------------------------------------------------
  const [searchLiq, setSearchLiq] = useState("");
  const [liqFilter, setLiqFilter] = useState<"todas" | "pendientes" | "saldadas">("todas");
  const [selectedLiqId, setSelectedLiqId] = useState<string>("");
  
  // Set initial selected liquidation
  useEffect(() => {
    if (!selectedLiqId && data.liquidaciones.length > 0) {
      setSelectedLiqId(data.liquidaciones[0].id);
    }
  }, [data.liquidaciones, selectedLiqId]);

  // Form states inside selected liquidation
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState<number>(0);
  const [isAddingService, setIsAddingService] = useState(false);

  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentCurrency, setPaymentCurrency] = useState<"USD" | "ARS">("USD");
  const [paymentTC, setPaymentTC] = useState<number>(1560);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [whatsappCopied, setWhatsappCopied] = useState(false);

  // Modal para nueva liquidación
  const [newLiqModal, setNewLiqModal] = useState(false);
  const [newLiqClient, setNewLiqClient] = useState("");
  const [newLiqDest, setNewLiqDest] = useState("");
  const [newLiqPax, setNewLiqPax] = useState(2);
  const [newLiqTotal, setNewLiqTotal] = useState<number>(0);
  const [newLiqInitialService, setNewLiqInitialService] = useState("Paquete Turístico Completo");

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  // Current selected liquidation object
  const selectedLiq = data.liquidaciones.find((l) => l.id === selectedLiqId) || data.liquidaciones[0];

  // Global KPIs
  const totalFacturadoUSD = data.liquidaciones.reduce((sum, l) => sum + (l.total_amount || 0), 0);
  const totalCobradoUSD = data.liquidaciones.reduce((sum, l) => sum + (l.total_paid || 0), 0);
  const totalPendienteUSD = data.liquidaciones.reduce((sum, l) => sum + (l.pending_balance || 0), 0);
  const countPendientes = data.liquidaciones.filter((l) => l.pending_balance > 0.05).length;
  const countSaldadas = data.liquidaciones.filter((l) => l.pending_balance <= 0.05).length;
  const pctCobrado = totalFacturadoUSD > 0 ? Math.round((totalCobradoUSD / totalFacturadoUSD) * 100) : 0;

  // Calculadora de comisiones
  const netBeforeSplit = calcUtilidad * (1 - calcRetentionPct / 100);
  const finalCommission = netBeforeSplit * (calcCommissionPct / 100);

  // Handlers TAB 1
  const handleAddUrgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrgentInput.trim()) return;
    addUrgentTask(newUrgentInput.trim());
    setNewUrgentInput("");
  };

  const handleAddPropArmar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropArmar.trim()) return;
    addCRMProposal(newPropArmar.trim(), "armar");
    setNewPropArmar("");
  };

  const handleAddPropEnv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropEnv.trim()) return;
    addCRMProposal(newPropEnv.trim(), "enviada");
    setNewPropEnv("");
  };

  const openCloseSale = (item: { id: string; title: string }) => {
    setCloseSaleModal({
      isOpen: true,
      itemId: item.id,
      clientName: item.title.split("-")[0].trim(),
      serviceDesc: item.title.includes("-") ? item.title.split("-")[1].trim() : item.title,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleConfirmCloseSale = (e: React.FormEvent) => {
    e.preventDefault();
    const fullTitle = `${closeSaleModal.clientName} - ${closeSaleModal.serviceDesc}`;
    cerrarVentaCRM(closeSaleModal.itemId, closeSaleModal.date, fullTitle);
    setCloseSaleModal({ ...closeSaleModal, isOpen: false });
  };

  // Handlers TAB 2 (Legajos)
  const filteredLegajos = data.legajos.filter((leg) => {
    const hasMonth = leg.months.some((m) => m.month === selectedMonth);
    if (!hasMonth && selectedMonth !== "Todos") return false;
    if (!searchLegajo.trim()) return true;
    const q = searchLegajo.toLowerCase();
    return leg.raw_title.toLowerCase().includes(q) || (leg.leg_number && leg.leg_number.includes(q));
  });

  const monthlyTotal = filteredLegajos.reduce((acc, leg) => {
    const entry = leg.months.find((m) => m.month === selectedMonth);
    if (!entry) return acc;
    const num = typeof entry.amount === "number" ? entry.amount : parseFloat(String(entry.amount)) || 0;
    return acc + num;
  }, 0);

  const handleSaveLegajo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLegClient.trim()) return;
    const title = newLegNum.trim() ? `${newLegClient.trim()} - LEG ${newLegNum.trim()}` : newLegClient.trim();
    addLegajo({
      raw_title: title,
      leg_number: newLegNum.trim(),
      client_name: newLegClient.trim(),
      months: [
        {
          month: selectedMonth,
          amount: newLegAmount,
          formula: `=${newLegAmount}*(1-${calcRetentionPct / 100})*${calcCommissionPct / 100}`
        }
      ],
      notes: newLegNotes.trim() || undefined,
    });
    setNewLegModal(false);
    setNewLegClient("");
    setNewLegNum("");
    setNewLegAmount(0);
    setNewLegNotes("");
  };

  // Handlers TAB 3 (Liquidaciones)
  const filteredLiquidaciones = data.liquidaciones.filter((l) => {
    const q = searchLiq.toLowerCase();
    const matches = l.client_name.toLowerCase().includes(q) || l.destination.toLowerCase().includes(q) || l.sheet_name.toLowerCase().includes(q);
    if (!matches) return false;
    if (liqFilter === "pendientes") return l.pending_balance > 0.05;
    if (liqFilter === "saldadas") return l.pending_balance <= 0.05;
    return true;
  });

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLiq || !newServiceDesc.trim() || newServicePrice <= 0) return;
    addServiceToLiquidacion(selectedLiq.id, {
      description: newServiceDesc.trim(),
      price: Number(newServicePrice),
    });
    setNewServiceDesc("");
    setNewServicePrice(0);
    setIsAddingService(false);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLiq || paymentAmount <= 0) return;
    let finalAmountUSD = paymentAmount;
    let noteDetails = paymentNotes.trim();

    if (paymentCurrency === "ARS") {
      finalAmountUSD = Math.round((paymentAmount / paymentTC) * 100) / 100;
      noteDetails = noteDetails 
        ? `${noteDetails} (ARS ${paymentAmount.toLocaleString("es-AR")} @ TC ${paymentTC})`
        : `ARS ${paymentAmount.toLocaleString("es-AR")} @ TC ${paymentTC}`;
    }

    addPaymentToLiquidacion(selectedLiq.id, {
      date: paymentDate,
      amount: finalAmountUSD,
      currency: paymentCurrency,
      tc: paymentCurrency === "ARS" ? paymentTC : null,
      notes: noteDetails,
    });

    setPaymentAmount(0);
    setPaymentCurrency("USD");
    setPaymentNotes("");
    setIsAddingPayment(false);
  };

  const getWhatsAppMessage = () => {
    if (!selectedLiq) return "";
    const isPaid = selectedLiq.pending_balance <= 0.05;
    const lines = [
      `✈️ *PREFERENTIA TRAVEL* - Estado de Liquidación`,
      `👤 *Cliente:* ${selectedLiq.client_name}`,
      `📍 *Destino:* ${selectedLiq.destination} (${selectedLiq.pax_count} pax)`,
      ``,
      `📋 *Servicios Contratados:*`,
      ...selectedLiq.services.map((s) => `• ${s.description}: USD ${s.price.toLocaleString("es-AR")}`),
      ``,
      `💰 *Total a Abonar:* USD ${selectedLiq.total_amount.toLocaleString("es-AR")}`,
      `💳 *Total Pagado a la Fecha:* USD ${selectedLiq.total_paid.toLocaleString("es-AR")}`,
      isPaid 
        ? `✅ *Saldo Pendiente:* USD 0.00 (VIAJE SALDADO)` 
        : `⏳ *Saldo Pendiente:* USD ${selectedLiq.pending_balance.toLocaleString("es-AR")}`,
      ``,
      `Cualquier consulta sobre formas de pago o tipo de cambio del día, avísame. ¡Saludos! Lauti - Preferentia Travel`,
    ];
    return lines.join("\n");
  };

  const copyWhatsApp = () => {
    const text = getWhatsAppMessage();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setWhatsappCopied(true);
    showToast("Resumen de liquidación copiado para WhatsApp 📋", "success");
    setTimeout(() => setWhatsappCopied(false), 2500);
  };

  const openWhatsAppWeb = () => {
    const text = getWhatsAppMessage();
    if (!text) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCreateLiq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLiqClient.trim() || !newLiqDest.trim()) return;
    const id = addLiquidacion({
      sheet_name: `${newLiqClient} - ${newLiqDest}`,
      title: `Liquidacion ${newLiqClient} x${newLiqPax} - Programa ${newLiqDest}`,
      client_name: newLiqClient.trim(),
      destination: newLiqDest.trim(),
      pax_count: Number(newLiqPax) || 1,
      total_amount: Number(newLiqTotal) || 0,
      total_paid: 0,
      pending_balance: Number(newLiqTotal) || 0,
      currency: "USD",
      status: "pending",
      services: [
        {
          description: newLiqInitialService.trim() || "Servicios generales",
          price: Number(newLiqTotal) || 0,
          category: "otro",
        }
      ],
      payments: [],
      notes: "Creada desde el Display",
    });
    setNewLiqModal(false);
    setSelectedLiqId(id);
    setActiveTab("liquidaciones");
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* TOP COMMAND BAR / EXECUTIVE WORKSPACE SWITCHER */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Tablero Operativo Preferentia
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-bold">
                Display Unificado
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Todo tu flujo de trabajo en una sola pantalla: Cotizaciones, Comisiones y Liquidaciones en vivo.
            </p>
          </div>

          {/* Quick Metrics Bar across top */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 text-xs">
            <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 flex-1 min-w-[120px]">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">Total Facturado</span>
              <span className="font-bold text-white text-sm sm:text-base font-mono">USD {totalFacturadoUSD.toLocaleString("es-AR")}</span>
            </div>
            <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 flex-1 min-w-[120px]">
              <span className="text-emerald-400/90 block text-[10px] uppercase font-semibold tracking-wider">Total Cobrado</span>
              <span className="font-bold text-emerald-400 text-sm sm:text-base font-mono">USD {totalCobradoUSD.toLocaleString("es-AR")}</span>
            </div>
            <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-amber-500/30 flex-1 min-w-[120px]">
              <span className="text-amber-400/90 block text-[10px] uppercase font-semibold tracking-wider">Saldo por Cobrar</span>
              <span className="font-black text-amber-400 text-sm sm:text-base font-mono">USD {totalPendienteUSD.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>

        {/* Global Collection Rate Progress */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Efectividad Global de Cobranzas:</span>
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              {pctCobrado}% cobrado ({countSaldadas} saldadas de {data.liquidaciones.length})
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${pctCobrado}%` }}
            />
          </div>
        </div>

        {/* 3 Main Display Tabs (The core UX shift Lautaro requested) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab("seguimiento")}
            className={`flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "seguimiento"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 scale-[1.01]"
                : "bg-slate-950 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800"
            }`}
          >
            <KanbanSquare className="w-4 h-4" />
            <span>1. Seguimiento & Cotizaciones</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === "seguimiento" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
              {data.crm.propuestas_a_armar.length + data.crm.propuestas_enviadas.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("numeros")}
            className={`flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "numeros"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.01]"
                : "bg-slate-950 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>2. Mis Números & Legajos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === "numeros" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
              {data.legajos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("liquidaciones")}
            className={`flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "liquidaciones"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 scale-[1.01]"
                : "bg-slate-950 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800"
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>3. Liquidaciones & Fichas</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === "liquidaciones" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"}`}>
              66 viajes
            </span>
          </button>
        </div>

        {/* Hotkey hint */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 pt-1 gap-2">
          <div className="flex items-center space-x-2">
            <span>Atajos rápidos de teclado:</span>
            <button
              onClick={() => setActiveTab("seguimiento")}
              className={`font-mono px-2 py-0.5 rounded border transition-colors ${activeTab === "seguimiento" ? "bg-sky-500/20 text-sky-300 border-sky-500/40" : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"}`}
              title="Cambiar a Seguimiento & Cotizaciones"
            >
              Tecla 1
            </button>
            <button
              onClick={() => setActiveTab("numeros")}
              className={`font-mono px-2 py-0.5 rounded border transition-colors ${activeTab === "numeros" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"}`}
              title="Cambiar a Mis Números & Legajos"
            >
              Tecla 2
            </button>
            <button
              onClick={() => setActiveTab("liquidaciones")}
              className={`font-mono px-2 py-0.5 rounded border transition-colors ${activeTab === "liquidaciones" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"}`}
              title="Cambiar a Liquidaciones & Fichas"
            >
              Tecla 3
            </button>
          </div>
          <button
            onClick={() => setNewLiqModal(true)}
            className="text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Liquidación Rápida</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKSPACE 1: SEGUIMIENTO & COTIZACIONES */}
      {/* ========================================================================= */}
      {activeTab === "seguimiento" && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* HOY SI O SI (Urgencias Banner) */}
          <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <h2 className="text-sm font-extrabold text-white tracking-wider uppercase">HOY SI O SI · Tareas Urgentes</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  {data.crm.urgencias_hoy.filter(t => !t.completed).length} pendientes
                </span>
              </div>
              
              <form onSubmit={handleAddUrgent} className="flex gap-2 w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Agregar urgencia del día..."
                  value={newUrgentInput}
                  onChange={(e) => setNewUrgentInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Agregar
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-3">
              {data.crm.urgencias_hoy.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    task.completed
                      ? "bg-slate-950/40 border-slate-800/40 opacity-50"
                      : "bg-slate-950/90 border-slate-800 hover:border-rose-500/40"
                  }`}
                >
                  <button
                    onClick={() => toggleUrgentTask(task.id)}
                    className="flex items-center space-x-2 text-left flex-1 min-w-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <span className={`text-xs truncate ${task.completed ? "line-through text-slate-500" : "text-slate-200 font-medium"}`}>
                      {task.title}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteUrgentTask(task.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Grid: Propuestas a armar + Seguimiento + Ventas Cerradas (Separado!) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Columna 1: Propuestas a armar */}
            <div className="bg-slate-900/70 border border-amber-500/20 rounded-2xl p-4 flex flex-col min-h-[550px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Propuestas a Armar</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                  {data.crm.propuestas_a_armar.length}
                </span>
              </div>

              {/* Quick Add */}
              <form onSubmit={handleAddPropArmar} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Pasajero y destino a cotizar..."
                  value={newPropArmar}
                  onChange={(e) => setNewPropArmar(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button type="submit" className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold">
                  +
                </button>
              </form>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {data.crm.propuestas_a_armar.map((item) => (
                  <div key={item.id} className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3 shadow-sm group space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-200 leading-snug">{item.title}</span>
                      <button onClick={() => deleteCRMItem(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                      <button
                        onClick={() => moveCRMToSeguimiento(item.id)}
                        className="inline-flex items-center space-x-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300"
                      >
                        <span>Pasar a Seguimiento</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna 2: Propuestas Enviadas & Seguimiento */}
            <div className="bg-slate-900/70 border border-sky-500/20 rounded-2xl p-4 flex flex-col min-h-[550px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">En Seguimiento (Cotizadas)</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/20">
                  {data.crm.propuestas_enviadas.length}
                </span>
              </div>

              {/* Quick Add */}
              <form onSubmit={handleAddPropEnv} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Nueva propuesta enviada..."
                  value={newPropEnv}
                  onChange={(e) => setNewPropEnv(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button type="submit" className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold">
                  +
                </button>
              </form>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {data.crm.propuestas_enviadas.map((item) => (
                  <div key={item.id} className="bg-slate-950/90 border border-slate-800 hover:border-sky-500/40 rounded-xl p-3 shadow-sm group space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-white leading-snug">{item.title}</span>
                      <button onClick={() => deleteCRMItem(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Botón Cerrar Venta: Lautaro pidió que al cerrar se saque de seguimiento y pase al panel de ventas cerradas */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Esperando respuesta</span>
                      <button
                        onClick={() => openCloseSale(item)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cerrar Venta</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna 3: Ventas Cerradas (Panel Separado como pidió Lautaro) */}
            <div className="bg-slate-900/70 border border-emerald-500/30 rounded-2xl p-4 flex flex-col min-h-[550px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ventas Cerradas</h3>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCerradasYear("2026")}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      cerradasYear === "2026" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    2026 ({data.crm.ventas_cerradas_2026.length})
                  </button>
                  <button
                    onClick={() => setCerradasYear("2025")}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      cerradasYear === "2025" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    2025 ({data.crm.ventas_cerradas_2025.length})
                  </button>
                </div>
              </div>

              {/* Search Cerradas */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Buscar venta cerrada..."
                  value={searchCerradas}
                  onChange={(e) => setSearchCerradas(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* List of Closed Sales */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {(cerradasYear === "2026" ? data.crm.ventas_cerradas_2026 : data.crm.ventas_cerradas_2025)
                  .filter((i) => !searchCerradas.trim() || i.title.toLowerCase().includes(searchCerradas.toLowerCase()))
                  .map((item) => (
                    <div key={item.id} className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-2.5 text-xs space-y-1">
                      <div className="font-semibold text-white">{item.title}</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{item.date || "Fecha reg."}</span>
                        </span>
                        <button
                          onClick={() => {
                            setNewLiqClient(item.title.split("-")[0].trim());
                            setNewLiqDest(item.title.includes("-") ? item.title.split("-")[1].trim() : "Destino");
                            setNewLiqModal(true);
                          }}
                          className="text-sky-400 hover:text-sky-300 font-semibold"
                        >
                          + Liquidar
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 2: MIS NÚMEROS (LEGAJOS & COMISIONES) */}
      {/* ========================================================================= */}
      {activeTab === "numeros" && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Month Selector Pills */}
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
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <span>{m}</span>
                  {countInMonth > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-indigo-800 text-white" : "bg-slate-700 text-slate-300"}`}>
                      {countInMonth}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Top Row: Month KPI + Commission Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Resumen del Mes */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Cierre de {selectedMonth}</span>
                  <Calendar className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-black text-white mt-1">
                  {filteredLegajos.length} <span className="text-sm font-normal text-slate-400">legajos cerrados</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Total de expedientes oficiales con comisiones generadas en {selectedMonth}.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Liquidado en Mes:</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {monthlyTotal > 0 ? monthlyTotal.toLocaleString("es-AR", { maximumFractionDigits: 2 }) : "-"}
                </span>
              </div>
            </div>

            {/* Calculadora Inteligente: Qué deja cada venta */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Calculadora Inteligente de Ganancia por Venta</h3>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-400">Reemplaza =(Utilidad*0.82)*50%</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Utilidad Bruta de la Venta</label>
                    <div className="relative">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                      <input
                        type="number"
                        step="0.01"
                        value={calcUtilidad || ""}
                        onChange={(e) => setCalcUtilidad(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Retención Impositiva</label>
                    <select
                      value={calcRetentionPct}
                      onChange={(e) => setCalcRetentionPct(parseFloat(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value={18}>18% Retención (* 0.82)</option>
                      <option value={6}>6% IIBB (* 0.94)</option>
                      <option value={0}>0% Sin retención (* 1.0)</option>
                    </select>
                    <div className="flex gap-1.5 mt-2">
                      {[18, 6, 0].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setCalcRetentionPct(pct)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            calcRetentionPct === pct
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                              : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                          }`}
                        >
                          {pct === 18 ? "18% Gan." : pct === 6 ? "6% IIBB" : "0% Sin ret."}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Porcentaje de Comisión</label>
                    <select
                      value={calcCommissionPct}
                      onChange={(e) => setCalcCommissionPct(parseFloat(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value={50}>50% (Estándar)</option>
                      <option value={35}>35%</option>
                      <option value={30}>30%</option>
                      <option value={25}>25%</option>
                    </select>
                    <div className="flex gap-1.5 mt-2">
                      {[50, 35, 30, 25].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setCalcCommissionPct(pct)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            calcCommissionPct === pct
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                              : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                  <span className="font-mono text-slate-400">Utilidad: ${calcUtilidad.toFixed(2)}</span>
                  <span className="text-slate-600">➔</span>
                  <span className="font-mono text-amber-400/90">Neto: ${netBeforeSplit.toFixed(2)}</span>
                  <span className="text-slate-600">➔</span>
                  <span className="font-mono text-sky-400">Split: {calcCommissionPct}%</span>
                </div>
                <div className="text-xs text-right flex items-center justify-end space-x-2">
                  <span className="text-slate-400">Tu Comisión Neta:</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight">
                    ${finalCommission.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Tabla de Legajos de Cierre */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Expedientes Cerrados en {selectedMonth}</h3>
                <p className="text-xs text-slate-400">Registro histórico de comisiones por legajo</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar cliente o N° LEG..."
                    value={searchLegajo}
                    onChange={(e) => setSearchLegajo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={() => setNewLegModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold whitespace-nowrap"
                >
                  + Agregar Legajo
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Cliente y Expediente</th>
                    <th className="pb-3 font-semibold text-center">N° LEG</th>
                    <th className="pb-3 font-semibold text-right">Monto Comisión</th>
                    <th className="pb-3 font-semibold">Fórmula de Cálculo</th>
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
                          <td className="py-2.5 font-medium text-white max-w-xs truncate">{leg.raw_title}</td>
                          <td className="py-2.5 text-center">
                            {leg.leg_number ? (
                              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                                LEG {leg.leg_number}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                            {entry && entry.amount !== undefined ? (
                              typeof entry.amount === "number" ? `$${entry.amount.toLocaleString("es-AR", { maximumFractionDigits: 2 })}` : String(entry.amount)
                            ) : "-"}
                          </td>
                          <td className="py-2.5 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                            {entry && entry.formula ? entry.formula : "-"}
                          </td>
                          <td className="py-2.5 text-center">
                            {hasPrintNote ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold inline-flex items-center space-x-1">
                                <Printer className="w-3 h-3" />
                                <span>Imprimir</span>
                              </span>
                            ) : hasCheckNote ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-semibold inline-flex items-center space-x-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Chequear</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px]">{leg.notes || "Listo"}</span>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 3: LIQUIDACIONES (EXCEL SPLIT-VIEW MASTER-DETAIL) */}
      {/* ========================================================================= */}
      {activeTab === "liquidaciones" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in">
          
          {/* PANEL IZQUIERDO: Directorio de 66 Liquidaciones (4 columnas de 12) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[700px] shadow-xl space-y-3">
            
            {/* Header + Search */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ReceiptText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Directorio de Viajes ({data.liquidaciones.length})</h3>
              </div>
              <button
                onClick={() => setNewLiqModal(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                + Nuevo
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar cliente, destino..."
                value={searchLiq}
                onChange={(e) => setSearchLiq(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 text-xs">
              <button
                onClick={() => setLiqFilter("todas")}
                className={`flex-1 py-1 rounded-lg text-center font-medium ${
                  liqFilter === "todas" ? "bg-slate-700 text-white font-bold" : "bg-slate-950 text-slate-400"
                }`}
              >
                Todas ({data.liquidaciones.length})
              </button>
              <button
                onClick={() => setLiqFilter("pendientes")}
                className={`flex-1 py-1 rounded-lg text-center font-medium ${
                  liqFilter === "pendientes" ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-950 text-amber-400/90"
                }`}
              >
                Por Cobrar ({countPendientes})
              </button>
              <button
                onClick={() => setLiqFilter("saldadas")}
                className={`flex-1 py-1 rounded-lg text-center font-medium ${
                  liqFilter === "saldadas" ? "bg-emerald-500 text-white font-bold" : "bg-slate-950 text-slate-400"
                }`}
              >
                Saldadas ({countSaldadas})
              </button>
            </div>

            {/* Liquidations Compact List (Excel-like Rows) */}
            <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[580px] pr-1">
              {filteredLiquidaciones.map((liq) => {
                const isSelected = selectedLiq && selectedLiq.id === liq.id;
                const isPaid = liq.pending_balance <= 0.05;

                return (
                  <div
                    key={liq.id}
                    onClick={() => setSelectedLiqId(liq.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-slate-800/90 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40"
                        : "bg-slate-950/80 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-white truncate max-w-[160px]">{liq.client_name}</div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isPaid ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {isPaid ? "SALDADO" : `DEBE $${liq.pending_balance.toLocaleString("es-AR")}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center space-x-1 truncate max-w-[140px]">
                        <Plane className="w-3 h-3 text-sky-400 flex-shrink-0" />
                        <span>{liq.destination}</span>
                      </span>
                      <span className="text-slate-300 font-mono">Total: USD {liq.total_amount.toLocaleString("es-AR")}</span>
                    </div>

                    {liq.total_amount > 0 && (
                      <div className="w-full bg-slate-900 rounded-full h-1 mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isPaid ? "bg-emerald-400" : "bg-gradient-to-r from-amber-500 to-emerald-400"}`}
                          style={{ width: `${Math.min(100, Math.round((liq.total_paid / liq.total_amount) * 100))}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* PANEL DERECHO: Ficha de Liquidación en Tiempo Real (7 columnas de 12) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-5 min-h-[700px]">
            {selectedLiq ? (
              <div className="space-y-5">
                {/* Header Ficha */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase">
                        Preferentia Travel · Ficha
                      </span>
                      <span className="text-xs text-slate-500">{selectedLiq.sheet_name}</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mt-1">{selectedLiq.client_name}</h2>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span className="text-sky-400 font-semibold">{selectedLiq.destination}</span>
                      <span>·</span>
                      <span>{selectedLiq.pax_count} Pasajeros</span>
                    </div>
                  </div>

                  {/* Actions: WhatsApp & Imprimir */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyWhatsApp}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        whatsappCopied
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                      }`}
                    >
                      {whatsappCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{whatsappCopied ? "¡Copiado!" : "Copiar para WhatsApp"}</span>
                    </button>
                    <button
                      onClick={openWhatsAppWeb}
                      className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all"
                      title="Abrir directamente en WhatsApp Web con el resumen listo"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Web</span>
                    </button>
                    <Link
                      href={`/liquidaciones/${selectedLiq.id}`}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      title="Abrir en pantalla completa"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* 3 Status KPI Boxes */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total a Abonar</span>
                    <div className="text-base sm:text-lg font-bold text-white mt-0.5 font-mono">
                      USD {selectedLiq.total_amount.toLocaleString("es-AR")}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Cobrado</span>
                    <div className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5 font-mono">
                      USD {selectedLiq.total_paid.toLocaleString("es-AR")}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30">
                    <span className="text-[10px] text-amber-400/80 uppercase font-semibold">Saldo Pendiente</span>
                    <div className={`text-base sm:text-lg font-black mt-0.5 font-mono ${
                      selectedLiq.pending_balance <= 0.05 ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {selectedLiq.pending_balance <= 0.05 ? "USD 0.00" : `USD ${selectedLiq.pending_balance.toLocaleString("es-AR")}`}
                    </div>
                  </div>
                </div>

                {/* Trip Payment Progress Bar */}
                {selectedLiq.total_amount > 0 && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Progreso de Cobro del Viaje:</span>
                      <span className={`font-mono font-bold ${selectedLiq.pending_balance <= 0.05 ? "text-emerald-400" : "text-amber-400"}`}>
                        {Math.min(100, Math.round((selectedLiq.total_paid / selectedLiq.total_amount) * 100))}% cobrado (USD {selectedLiq.total_paid.toLocaleString("es-AR")} de USD {selectedLiq.total_amount.toLocaleString("es-AR")})
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          selectedLiq.pending_balance <= 0.05 ? "bg-emerald-400" : "bg-gradient-to-r from-amber-500 to-emerald-400"
                        }`}
                        style={{ width: `${Math.min(100, Math.round((selectedLiq.total_paid / selectedLiq.total_amount) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Split: Servicios & Cobros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Servicios Contratados */}
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white uppercase">Servicios Contratados</span>
                      <button
                        onClick={() => setIsAddingService(!isAddingService)}
                        className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        + Agregar
                      </button>
                    </div>

                    {isAddingService && (
                      <form onSubmit={handleAddService} className="p-2.5 bg-slate-900 rounded-lg border border-sky-500/30 space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="Descripción (ej: Vuelo BUE-PUJ)"
                          value={newServiceDesc}
                          onChange={(e) => setNewServiceDesc(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="Precio USD"
                            value={newServicePrice || ""}
                            onChange={(e) => setNewServicePrice(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                          <button type="submit" className="px-3 py-1 bg-sky-600 text-white rounded-lg text-xs font-bold">
                            Guardar
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedLiq.services.length === 0 ? (
                        <p className="text-[11px] text-slate-500 py-3 text-center">No hay servicios detallados.</p>
                      ) : (
                        selectedLiq.services.map((s, idx) => (
                          <div key={idx} className="flex items-start justify-between text-xs py-1.5 border-b border-slate-900 group">
                            <span className="text-slate-300 flex-1 pr-2">{s.description}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-white">USD {s.price.toLocaleString("es-AR")}</span>
                              <button
                                onClick={() => deleteServiceFromLiquidacion(selectedLiq.id, idx)}
                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Cobros Realizados & Pagos */}
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-emerald-400 uppercase">Cobros Registrados</span>
                      <button
                        onClick={() => setIsAddingPayment(!isAddingPayment)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        + Registrar Cobro
                      </button>
                    </div>

                    {isAddingPayment && (
                      <form onSubmit={handleAddPayment} className="p-2.5 bg-slate-900 rounded-lg border border-emerald-500/30 space-y-2">
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="date"
                            required
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                          />
                          <select
                            value={paymentCurrency}
                            onChange={(e) => setPaymentCurrency(e.target.value as "USD" | "ARS")}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                          >
                            <option value="USD">USD Dólares</option>
                            <option value="ARS">ARS Pesos</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder={paymentCurrency === "ARS" ? "Monto ARS" : "Monto USD"}
                            value={paymentAmount || ""}
                            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                          />
                          {paymentCurrency === "ARS" ? (
                            <input
                              type="number"
                              step="1"
                              required
                              placeholder="TC (ej: 1560)"
                              value={paymentTC || ""}
                              onChange={(e) => setPaymentTC(parseFloat(e.target.value) || 1)}
                              className="bg-slate-950 border border-amber-500/40 rounded-lg px-2 py-1 text-xs text-white"
                            />
                          ) : (
                            <input
                              type="text"
                              placeholder="Nota (ej: transf.)"
                              value={paymentNotes}
                              onChange={(e) => setPaymentNotes(e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                            />
                          )}
                        </div>
                        <div className="flex justify-end pt-1">
                          <button type="submit" className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                            Guardar Cobro
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedLiq.payments.length === 0 ? (
                        <p className="text-[11px] text-slate-500 py-3 text-center">No hay cobros registrados.</p>
                      ) : (
                        selectedLiq.payments.map((p, idx) => (
                          <div key={idx} className="flex items-start justify-between text-xs py-1.5 border-b border-slate-900 group">
                            <div className="min-w-0 pr-2">
                              <span className="font-mono font-bold text-emerald-400">USD {p.amount.toLocaleString("es-AR")}</span>
                              <div className="text-[10px] text-slate-500 truncate">{p.notes || p.date || "Cobro"}</div>
                            </div>
                            <button
                              onClick={() => deletePaymentFromLiquidacion(selectedLiq.id, idx)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">
                Seleccioná una liquidación de la lista para ver su detalle.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CERRAR VENTA (Mover de Seguimiento a Ventas Cerradas) */}
      {/* ========================================================================= */}
      {closeSaleModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">¡Felicitaciones por la Venta! 🎉</h3>
              </div>
              <button onClick={() => setCloseSaleModal({ ...closeSaleModal, isOpen: false })} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Esta venta se quitará del panel de seguimiento y pasará al registro oficial de <strong>Ventas Cerradas 2026</strong>.
            </p>

            <form onSubmit={handleConfirmCloseSale} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nombre del Pasajero / Cliente</label>
                <input
                  type="text"
                  required
                  value={closeSaleModal.clientName}
                  onChange={(e) => setCloseSaleModal({ ...closeSaleModal, clientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Servicio o Paquete Cerrado</label>
                <input
                  type="text"
                  required
                  value={closeSaleModal.serviceDesc}
                  onChange={(e) => setCloseSaleModal({ ...closeSaleModal, serviceDesc: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Fecha de Cierre</label>
                <input
                  type="date"
                  required
                  value={closeSaleModal.date}
                  onChange={(e) => setCloseSaleModal({ ...closeSaleModal, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCloseSaleModal({ ...closeSaleModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirmar Venta Cerrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVA LIQUIDACIÓN RÁPIDA */}
      {/* ========================================================================= */}
      {newLiqModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ReceiptText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Nueva Liquidación de Viaje</h3>
              </div>
              <button onClick={() => setNewLiqModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLiq} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nombre Pasajero / Grupo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Perez Garcia, o Grupo Amigos Miami"
                  value={newLiqClient}
                  onChange={(e) => setNewLiqClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Destino / Programa</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Punta Cana, Europa 2026..."
                    value={newLiqDest}
                    onChange={(e) => setNewLiqDest(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Cant. Pasajeros (Pax)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newLiqPax}
                    onChange={(e) => setNewLiqPax(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Total a Abonar (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newLiqTotal || ""}
                  onChange={(e) => setNewLiqTotal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Servicio Principal</label>
                <input
                  type="text"
                  placeholder="Ej: Vuelos Arajet + Hotel Viva Dominicus"
                  value={newLiqInitialService}
                  onChange={(e) => setNewLiqInitialService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNewLiqModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Crear Ficha y Abrir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVO LEGAJO */}
      {/* ========================================================================= */}
      {newLegModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Nuevo Legajo / Cierre en {selectedMonth}</h3>
              </div>
              <button onClick={() => setNewLegModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLegajo} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nombre Pasajero / Expediente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gomez Carlos - Cancun"
                  value={newLegClient}
                  onChange={(e) => setNewLegClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">N° de LEG</label>
                  <input
                    type="text"
                    placeholder="Ej: 42849"
                    value={newLegNum}
                    onChange={(e) => setNewLegNum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Monto Comisión</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newLegAmount || ""}
                    onChange={(e) => setNewLegAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Notas (ej: imprimir leg)</label>
                <input
                  type="text"
                  placeholder="imprimir leg, chequear..."
                  value={newLegNotes}
                  onChange={(e) => setNewLegNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setNewLegModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Guardar en {selectedMonth}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ExecutiveWorkspace() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    }>
      <ExecutiveWorkspaceContent />
    </Suspense>
  );
}
