"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import initialDataJson from "@/data/initialData.json";
import { AppData, Liquidacion, CRMItem, UrgentTask, LegajoItem, PaymentItem, ServiceItem } from "@/types";

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
  addCRMItem: (item: Omit<CRMItem, "id">) => void;
  updateCRMStatus: (id: string, newStatus: CRMItem["status"]) => void;
  deleteCRMItem: (id: string) => void;
  // Urgent Tasks
  toggleUrgentTask: (id: string) => void;
  addUrgentTask: (title: string) => void;
  deleteUrgentTask: (id: string) => void;
  // Legajos
  addLegajo: (item: Omit<LegajoItem, "id">) => void;
  // Utils
  resetToDefaultData: () => void;
}

const LOCAL_STORAGE_KEY = "preferentia_travel_data_v1";

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(initialDataJson as unknown as AppData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading stored data", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage on change
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
    const newLiq: Liquidacion = {
      ...item,
      id,
      total_paid: item.payments.reduce((acc, p) => acc + (p.amount || 0), 0),
      pending_balance: item.total_amount - item.payments.reduce((acc, p) => acc + (p.amount || 0), 0),
    };
    newLiq.status = newLiq.pending_balance <= 0.05 ? "paid" : newLiq.total_paid > 0 ? "partial" : "pending";

    const updated = {
      ...data,
      liquidaciones: [newLiq, ...data.liquidaciones],
    };
    persistData(updated);
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
  };

  const addPaymentToLiquidacion = (liqId: string, payment: PaymentItem) => {
    const liq = data.liquidaciones.find((l) => l.id === liqId);
    if (!liq) return;
    const newPayments = [...liq.payments, payment];
    updateLiquidacion(liqId, { payments: newPayments });
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

  const addCRMItem = (item: Omit<CRMItem, "id">) => {
    const newItem: CRMItem = { ...item, id: `crm-${Date.now()}` };
    const updated = {
      ...data,
      crm: {
        ...data.crm,
        propuestas_enviadas: [newItem, ...data.crm.propuestas_enviadas],
      },
    };
    persistData(updated);
  };

  const updateCRMStatus = (id: string, newStatus: CRMItem["status"]) => {
    // Find in all crm arrays and move appropriately
    const findAndRemove = (list: CRMItem[]) => list.filter((item) => item.id !== id);
    const allItems = [
      ...data.crm.propuestas_a_armar,
      ...data.crm.propuestas_enviadas,
      ...data.crm.cerrados_2026,
    ];
    const target = allItems.find((i) => i.id === id);
    if (!target) return;

    target.status = newStatus;
    const newArmar = findAndRemove(data.crm.propuestas_a_armar);
    const newEnviadas = findAndRemove(data.crm.propuestas_enviadas);
    const newCerradas = findAndRemove(data.crm.cerrados_2026);

    if (newStatus === "armar") newArmar.unshift(target);
    else if (newStatus === "enviada") newEnviadas.unshift(target);
    else if (newStatus === "cerrado") newCerradas.unshift(target);

    persistData({
      ...data,
      crm: {
        ...data.crm,
        propuestas_a_armar: newArmar,
        propuestas_enviadas: newEnviadas,
        cerrados_2026: newCerradas,
      },
    });
  };

  const deleteCRMItem = (id: string) => {
    persistData({
      ...data,
      crm: {
        ...data.crm,
        propuestas_a_armar: data.crm.propuestas_a_armar.filter((i) => i.id !== id),
        propuestas_enviadas: data.crm.propuestas_enviadas.filter((i) => i.id !== id),
        cerrados_2026: data.crm.cerrados_2026.filter((i) => i.id !== id),
      },
    });
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

  const addUrgentTask = (title: string) => {
    const newTask: UrgentTask = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      date: new Date().toISOString().split("T")[0],
    };
    persistData({
      ...data,
      crm: {
        ...data.crm,
        urgencias_hoy: [newTask, ...data.crm.urgencias_hoy],
      },
    });
  };

  const deleteUrgentTask = (id: string) => {
    persistData({
      ...data,
      crm: {
        ...data.crm,
        urgencias_hoy: data.crm.urgencias_hoy.filter((t) => t.id !== id),
      },
    });
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
        addCRMItem,
        updateCRMStatus,
        deleteCRMItem,
        toggleUrgentTask,
        addUrgentTask,
        deleteUrgentTask,
        addLegajo,
        resetToDefaultData,
      }}
    >
      {children}
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
