"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import initialDataJson from "@/data/initialData.json";
import { AppData, Liquidacion, CRMItem, UrgentTask, LegajoItem, PaymentItem, ServiceItem } from "@/types";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

interface AppContextType {
  data: AppData;
  isLoaded: boolean;
  // Liquidaciones
  addLiquidacion: (item: Omit<Liquidacion, "id">) => string;
  updateLiquidacion: (id: string, item: Partial<Liquidacion>) => void;
  deleteLiquidacion: (id: string) => void;
  addPaymentToLiquidacion: (liqId: string, payment: PaymentItem) => void;
  deletePaymentFromLiquidacion: (liqId: string, paymentIndex: number) => void;
  addServiceToLiquidacion: (liqId: string, service: ServiceItem) => void;
  deleteServiceFromLiquidacion: (liqId: string, serviceIndex: number) => void;
  // CRM
  addCRMProposal: (title: string, column: "armar" | "enviada") => void;
  addCRMItem: (item: Omit<CRMItem, "id">) => void;
  updateCRMStatus: (id: string, newStatus: CRMItem["status"]) => void;
  moveCRMToSeguimiento: (id: string) => void;
  cerrarVentaCRM: (id: string, date: string, title: string) => void;
  deleteCRMItem: (id: string) => void;
  // Urgent Tasks / Agenda
  toggleUrgentTask: (id: string) => void;
  addUrgentTask: (taskOrTitle: string | { title: string; date?: string; time?: string; category?: UrgentTask["category"]; priority?: UrgentTask["priority"]; notes?: string }) => void;
  updateUrgentTask: (id: string, updates: Partial<UrgentTask>) => void;
  deleteUrgentTask: (id: string) => void;
  postponeUrgentTask: (id: string, days?: number) => void;
  // Legajos
  addLegajo: (item: Omit<LegajoItem, "id">) => void;
  // Notifications / Toast
  showToast: (message: string, type?: "success" | "info" | "warning") => void;
  // Utils
  resetToDefaultData: () => void;
}

const LOCAL_STORAGE_KEY = "preferentia_travel_data_v2";

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(initialDataJson as unknown as AppData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; type: "success" | "info" | "warning" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = String(Date.now());
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3200);
  };

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.liquidaciones && parsed.crm) {
          setData(parsed);
        }
      }
    } catch (e) {
      console.error("Error loading stored data", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const persistData = (newData: AppData) => {
    setData(newData);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error("Error saving data", e);
    }
  };

  const addLiquidacion = (item: Omit<Liquidacion, "id">) => {
    const id = `liq-${Date.now()}`;
    const total_paid = item.payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const pending_balance = Math.max(0, item.total_amount - total_paid);
    const status: Liquidacion["status"] = pending_balance <= 0.05 ? "paid" : total_paid > 0 ? "partial" : "pending";

    const newLiq: Liquidacion = {
      ...item,
      id,
      total_paid,
      pending_balance,
      status,
    };

    const updated = {
      ...data,
      liquidaciones: [newLiq, ...data.liquidaciones],
    };
    persistData(updated);
    showToast(`Ficha de "${item.client_name}" creada con éxito`, "success");
    return id;
  };

  const updateLiquidacion = (id: string, updates: Partial<Liquidacion>) => {
    const updatedLiqs = data.liquidaciones.map((l) => {
      if (l.id !== id) return l;
      const merged = { ...l, ...updates };
      const total_paid = merged.payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const total_amount = merged.services && merged.services.length > 0
        ? merged.services.reduce((acc, s) => acc + (Number(s.price) || 0), 0)
        : merged.total_amount;
      const pending_balance = Math.max(0, total_amount - total_paid);
      const status: Liquidacion["status"] = pending_balance <= 0.05 ? "paid" : total_paid > 0 ? "partial" : "pending";
      return {
        ...merged,
        total_amount: Math.round(total_amount * 100) / 100,
        total_paid: Math.round(total_paid * 100) / 100,
        pending_balance: Math.round(pending_balance * 100) / 100,
        status,
      };
    });
    persistData({ ...data, liquidaciones: updatedLiqs });
  };

  const deleteLiquidacion = (id: string) => {
    persistData({
      ...data,
      liquidaciones: data.liquidaciones.filter((l) => l.id !== id),
    });
    showToast("Liquidación eliminada", "warning");
  };

  const addPaymentToLiquidacion = (liqId: string, payment: PaymentItem) => {
    const liq = data.liquidaciones.find((l) => l.id === liqId);
    if (!liq) return;
    const newPayments = [...liq.payments, payment];
    updateLiquidacion(liqId, { payments: newPayments });
    showToast(`Cobro registrado: USD ${payment.amount.toLocaleString("es-AR")}`, "success");
  };

  const deletePaymentFromLiquidacion = (liqId: string, paymentIndex: number) => {
    const liq = data.liquidaciones.find((l) => l.id === liqId);
    if (!liq) return;
    const newPayments = liq.payments.filter((_, idx) => idx !== paymentIndex);
    updateLiquidacion(liqId, { payments: newPayments });
  };

  const addServiceToLiquidacion = (liqId: string, service: ServiceItem) => {
    const liq = data.liquidaciones.find((l) => l.id === liqId);
    if (!liq) return;
    const newServices = [...liq.services, service];
    updateLiquidacion(liqId, { services: newServices });
  };

  const deleteServiceFromLiquidacion = (liqId: string, serviceIndex: number) => {
    const liq = data.liquidaciones.find((l) => l.id === liqId);
    if (!liq) return;
    const newServices = liq.services.filter((_, idx) => idx !== serviceIndex);
    updateLiquidacion(liqId, { services: newServices });
  };

  // CRM: Propuestas y Cierre de Ventas
  const addCRMProposal = (title: string, column: "armar" | "enviada") => {
    const newItem: CRMItem = {
      id: `crm-${Date.now()}`,
      title,
      status: column,
      date: new Date().toISOString().split("T")[0],
    };
    if (column === "armar") {
      persistData({
        ...data,
        crm: {
          ...data.crm,
          propuestas_a_armar: [newItem, ...data.crm.propuestas_a_armar],
        },
      });
    } else {
      persistData({
        ...data,
        crm: {
          ...data.crm,
          propuestas_enviadas: [newItem, ...data.crm.propuestas_enviadas],
        },
      });
    }
  };

  const addCRMItem = (item: Omit<CRMItem, "id">) => {
    const newItem: CRMItem = { ...item, id: `crm-${Date.now()}` };
    persistData({
      ...data,
      crm: {
        ...data.crm,
        propuestas_enviadas: [newItem, ...data.crm.propuestas_enviadas],
      },
    });
  };

  const updateCRMStatus = (id: string, newStatus: CRMItem["status"]) => {
    if (newStatus === "cerrado") {
      const item = data.crm.propuestas_enviadas.find(i => i.id === id) || data.crm.propuestas_a_armar.find(i => i.id === id);
      if (item) {
        cerrarVentaCRM(id, new Date().toISOString().split("T")[0], item.title);
      }
    } else if (newStatus === "enviada") {
      moveCRMToSeguimiento(id);
    }
  };

  const moveCRMToSeguimiento = (id: string) => {
    const item = data.crm.propuestas_a_armar.find((i) => i.id === id);
    if (!item) return;
    const newArmar = data.crm.propuestas_a_armar.filter((i) => i.id !== id);
    const newEnviadas = [{ ...item, status: "enviada" as const }, ...data.crm.propuestas_enviadas];
    persistData({
      ...data,
      crm: {
        ...data.crm,
        propuestas_a_armar: newArmar,
        propuestas_enviadas: newEnviadas,
      },
    });
  };

  // Al cerrar una venta, SE SACA de seguimiento y pasa a Ventas Cerradas
  const cerrarVentaCRM = (id: string, date: string, title: string) => {
    const newEnviadas = data.crm.propuestas_enviadas.filter((i) => i.id !== id);
    const newArmar = data.crm.propuestas_a_armar.filter((i) => i.id !== id);
    const newCerrada: CRMItem = {
      id: `cerrada-${Date.now()}`,
      date: date || new Date().toISOString().split("T")[0],
      title: title.trim(),
      status: "cerrado",
      year: "2026",
    };
    persistData({
      ...data,
      crm: {
        ...data.crm,
        propuestas_enviadas: newEnviadas,
        propuestas_a_armar: newArmar,
        ventas_cerradas_2026: [newCerrada, ...data.crm.ventas_cerradas_2026],
      },
    });
    showToast("¡Venta confirmada y archivada en Ventas Cerradas! 🎉", "success");
  };

  const deleteCRMItem = (id: string) => {
    persistData({
      ...data,
      crm: {
        ...data.crm,
        propuestas_a_armar: data.crm.propuestas_a_armar.filter((i) => i.id !== id),
        propuestas_enviadas: data.crm.propuestas_enviadas.filter((i) => i.id !== id),
        ventas_cerradas_2026: data.crm.ventas_cerradas_2026.filter((i) => i.id !== id),
      },
    });
    showToast("Elemento eliminado del CRM", "info");
  };

  const toggleUrgentTask = (id: string) => {
    const updatedTasks = data.crm.urgencias_hoy.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    persistData({
      ...data,
      crm: {
        ...data.crm,
        urgencias_hoy: updatedTasks,
      },
    });
  };

  const getLocalDateString = (d: Date = new Date()): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const addUrgentTask = (
    param: string | { title: string; date?: string; time?: string; category?: UrgentTask["category"]; priority?: UrgentTask["priority"]; notes?: string }
  ) => {
    const isObj = typeof param === "object";
    const title = (isObj ? param.title : param) || "";
    const date = (isObj && param.date) ? param.date : getLocalDateString();
    const time = isObj ? param.time : undefined;
    const category = isObj ? param.category || "general" : "general";
    const priority = isObj ? param.priority || "media" : "media";
    const notes = isObj ? param.notes : undefined;

    const newTask: UrgentTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      completed: false,
      date,
      time,
      category,
      priority,
      notes,
    };
    persistData({
      ...data,
      crm: {
        ...data.crm,
        urgencias_hoy: [newTask, ...data.crm.urgencias_hoy],
      },
    });
    showToast(`Alerta programada (${date}) 📅`, "info");
  };

  const updateUrgentTask = (id: string, updates: Partial<UrgentTask>) => {
    const updatedTasks = data.crm.urgencias_hoy.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    persistData({
      ...data,
      crm: {
        ...data.crm,
        urgencias_hoy: updatedTasks,
      },
    });
  };

  const postponeUrgentTask = (id: string, days: number = 1) => {
    const task = data.crm.urgencias_hoy.find((t) => t.id === id);
    if (!task) return;
    const baseDate = task.date ? new Date(`${task.date}T12:00:00`) : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    const newDateStr = getLocalDateString(baseDate);
    updateUrgentTask(id, { date: newDateStr });
    showToast(`Alerta pospuesta al ${newDateStr} (+${days}d) ⏰`, "info");
  };

  const deleteUrgentTask = (id: string) => {
    persistData({
      ...data,
      crm: {
        ...data.crm,
        urgencias_hoy: data.crm.urgencias_hoy.filter((t) => t.id !== id),
      },
    });
    showToast("Alerta eliminada", "info");
  };

  const addLegajo = (item: Omit<LegajoItem, "id">) => {
    const newLeg: LegajoItem = { ...item, id: `leg-${Date.now()}` };
    persistData({
      ...data,
      legajos: [newLeg, ...data.legajos],
    });
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setData(initialDataJson as unknown as AppData);
  };

  return (
    <AppContext.Provider
      value={{
        data,
        isLoaded,
        addLiquidacion,
        updateLiquidacion,
        deleteLiquidacion,
        addPaymentToLiquidacion,
        deletePaymentFromLiquidacion,
        addServiceToLiquidacion,
        deleteServiceFromLiquidacion,
        addCRMProposal,
        addCRMItem,
        updateCRMStatus,
        moveCRMToSeguimiento,
        cerrarVentaCRM,
        deleteCRMItem,
        toggleUrgentTask,
        addUrgentTask,
        updateUrgentTask,
        deleteUrgentTask,
        postponeUrgentTask,
        addLegajo,
        showToast,
        resetToDefaultData,
      }}
    >
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-center space-x-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-white text-xs max-w-sm ring-1 ring-white/10"
        >
          {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
          {toast.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
          {toast.type === "info" && <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />}
          <span className="font-medium flex-1 text-slate-100">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Cerrar notificación"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
