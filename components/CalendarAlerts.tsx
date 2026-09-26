"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { UrgentTask } from "@/types";
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Plane,
  CreditCard,
  PhoneCall,
  FileCheck,
  Tag,
  Flame,
  CalendarDays,
  CalendarRange,
  X,
  Filter,
} from "lucide-react";

// Helper for local YYYY-MM-DD
function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
}

export function CalendarAlerts() {
  const { data, toggleUrgentTask, addUrgentTask, deleteUrgentTask, postponeUrgentTask } = useApp();

  const todayStr = useMemo(() => getLocalDateString(), []);
  
  // View mode: 'hoy' | 'calendario' | 'agenda'
  const [viewMode, setViewMode] = useState<"hoy" | "calendario" | "agenda">("hoy");

  // Filter by category
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  // Selected date for calendar view and quick adding
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Month navigation for calendar grid
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // New task form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(todayStr);
  const [newTime, setNewTime] = useState("");
  const [newCategory, setNewCategory] = useState<UrgentTask["category"]>("emision");
  const [newPriority, setNewPriority] = useState<UrgentTask["priority"]>("alta");
  const [newNotes, setNewNotes] = useState("");

  const tasks = data.crm.urgencias_hoy;

  // Filtered tasks by category
  const filteredTasks = useMemo(() => {
    if (selectedCategory === "todas") return tasks;
    return tasks.filter((t) => t.category === selectedCategory);
  }, [tasks, selectedCategory]);

  // Counts
  const pendingTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const overdueTasks = useMemo(() => pendingTasks.filter((t) => t.date && t.date < todayStr), [pendingTasks, todayStr]);
  const todayTasks = useMemo(() => pendingTasks.filter((t) => t.date === todayStr || !t.date), [pendingTasks, todayStr]);
  const upcomingTasks = useMemo(() => pendingTasks.filter((t) => t.date && t.date > todayStr), [pendingTasks, todayStr]);

  // Form submission
  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addUrgentTask({
      title: newTitle.trim(),
      date: newDate || todayStr,
      time: newTime || undefined,
      category: newCategory,
      priority: newPriority,
      notes: newNotes.trim() || undefined,
    });

    setNewTitle("");
    setNewTime("");
    setNewNotes("");
    setIsFormOpen(false);
  };

  // Quick date presets
  const setQuickDate = (type: "hoy" | "manana" | "3dias" | "lunes") => {
    const d = new Date();
    if (type === "hoy") {
      // today
    } else if (type === "manana") {
      d.setDate(d.getDate() + 1);
    } else if (type === "3dias") {
      d.setDate(d.getDate() + 3);
    } else if (type === "lunes") {
      const day = d.getDay(); // 0 is Sunday
      const diff = day === 0 ? 1 : 8 - day;
      d.setDate(d.getDate() + diff);
    }
    setNewDate(getLocalDateString(d));
  };

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth(); // 0-indexed

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday is 0, Sunday is 6
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = getLocalDateString(prevDate);
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        tasks: tasks.filter((t) => t.date === dateStr),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const curDate = new Date(year, month, i);
      const dateStr = getLocalDateString(curDate);
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: true,
        tasks: tasks.filter((t) => t.date === dateStr),
      });
    }

    // Next month padding to complete weeks (multiple of 7)
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = getLocalDateString(nextDate);
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: false,
        tasks: tasks.filter((t) => t.date === dateStr),
      });
    }

    return days;
  }, [currentMonth, tasks]);

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleCurrentMonthJump = () => {
    const d = new Date();
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelectedDate(todayStr);
  };

  // Helper for Category styling & icon
  const getCategoryDetails = (cat?: UrgentTask["category"]) => {
    switch (cat) {
      case "emision":
        return { label: "Emisión Aéreo", icon: Plane, color: "text-sky-400 bg-sky-500/10 border-sky-500/30" };
      case "pago":
        return { label: "Cobro / Seña", icon: CreditCard, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
      case "seguimiento":
        return { label: "Seguimiento Pax", icon: PhoneCall, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
      case "voucher":
        return { label: "Vouchers & Docs", icon: FileCheck, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" };
      default:
        return { label: "General", icon: Tag, color: "text-slate-400 bg-slate-800/60 border-slate-700/60" };
    }
  };

  const renderTaskCard = (task: UrgentTask) => {
    const catDetails = getCategoryDetails(task.category);
    const CatIcon = catDetails.icon;
    const isOverdue = task.date && task.date < todayStr && !task.completed;
    const isToday = (!task.date || task.date === todayStr) && !task.completed;

    return (
      <div
        key={task.id}
        className={`group relative flex flex-col p-3 rounded-xl border transition-all ${
          task.completed
            ? "bg-slate-950/40 border-slate-800/40 opacity-55"
            : isOverdue
            ? "bg-rose-950/20 border-rose-500/40 shadow-sm shadow-rose-950/30 hover:border-rose-400/60"
            : isToday
            ? "bg-slate-900/90 border-amber-500/40 shadow-sm shadow-amber-950/20 hover:border-amber-400/60"
            : "bg-slate-950/80 border-slate-800/80 hover:border-slate-700"
        }`}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-start space-x-2.5 flex-1 min-w-0">
            <button
              onClick={() => toggleUrgentTask(task.id)}
              className="mt-0.5 text-slate-400 hover:text-white flex-shrink-0 transition-transform active:scale-90"
              title={task.completed ? "Marcar como pendiente" : "Marcar como realizada"}
            >
              {task.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : isOverdue ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              ) : isToday ? (
                <Flame className="w-4 h-4 text-amber-400" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400 hover:text-sky-400" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                {/* Category Pill */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${catDetails.color}`}>
                  <CatIcon className="w-3 h-3" />
                  {catDetails.label}
                </span>

                {/* Priority Indicator */}
                {task.priority === "alta" && (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    URGENTE
                  </span>
                )}

                {/* Date & Time Badge */}
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                    isOverdue
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : isToday
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  <CalendarIcon className="w-2.5 h-2.5" />
                  {isOverdue ? `⚠️ Venció (${formatDisplayDate(task.date)})` : isToday ? "Hoy" : formatDisplayDate(task.date)}
                  {task.time && <span className="opacity-80 font-mono">· {task.time} hs</span>}
                </span>
              </div>

              <p className={`text-xs font-semibold leading-snug break-words ${task.completed ? "line-through text-slate-500" : "text-white"}`}>
                {task.title}
              </p>

              {task.notes && (
                <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-2">
                  {task.notes}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {!task.completed && (
              <button
                onClick={() => postponeUrgentTask(task.id, 1)}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-300 border border-slate-700 transition-colors"
                title="Postponer al día siguiente (+1 día)"
              >
                +1d
              </button>
            )}
            <button
              onClick={() => deleteUrgentTask(task.id)}
              className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800/80 transition-colors"
              title="Eliminar alerta"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-rose-500 block"></span>
            {overdueTasks.length > 0 && (
              <span className="w-3 h-3 rounded-full bg-rose-500 block absolute top-0 left-0 animate-ping"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-wider uppercase">
                Agenda & Alertas Programadas
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Preferentia CRM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Time-limits de aéreos, vencimiento de señas y seguimientos con calendario
            </p>
          </div>
        </div>

        {/* View Mode Tabs + Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Counters Summary */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            {overdueTasks.length > 0 && (
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                {overdueTasks.length} vencidas
              </span>
            )}
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {todayTasks.length} para hoy
            </span>
            <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 text-slate-400 font-medium border border-slate-700">
              {upcomingTasks.length} próximas
            </span>
          </div>

          {/* View Switchers */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("hoy")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "hoy"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Hoy ({todayTasks.length + overdueTasks.length})</span>
            </button>

            <button
              onClick={() => setViewMode("calendario")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "calendario"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendario</span>
            </button>

            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "agenda"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* New Alert Button */}
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
              isFormOpen
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-rose-600 hover:bg-rose-500 text-white"
            }`}
          >
            {isFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isFormOpen ? "Cerrar" : "Programar Alerta"}</span>
          </button>
        </div>
      </div>

      {/* Programar Alerta Form (Expandable) */}
      {isFormOpen && (
        <form onSubmit={handleCreateAlert} className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 animate-in fade-in slide-in-from-top-3">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Nueva Alerta / Vencimiento Programado
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Se guardará con fecha y se notificará en el display
              </span>
            </div>

            {/* Title & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Título de la alerta o gestión *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Time limit emisión aéreos Silvina Acosta (Iberia)..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Notas adicionales (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Tarifa vence a las 18 hs, cobrar saldo antes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            {/* Date, Quick Presets & Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Date selection */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Fecha programada *
                  </label>
                  {/* Quick pills */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQuickDate("hoy")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                        newDate === todayStr
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate("manana")}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                    >
                      Mañana
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate("3dias")}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                    >
                      +3 días
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate("lunes")}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                    >
                      Próx. Lunes
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                  />
                  <div className="w-32">
                    <input
                      type="time"
                      placeholder="18:00"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                      title="Hora límite (ej: 18:00 para time limits)"
                    />
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  Nivel de Prioridad
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setNewPriority("alta")}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all ${
                      newPriority === "alta"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    🔴 Alta
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPriority("media")}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all ${
                      newPriority === "media"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    🟡 Media
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPriority("baja")}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all ${
                      newPriority === "baja"
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    🔵 Normal
                  </button>
                </div>
              </div>
            </div>

            {/* Category pills */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Tipo de gestión
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "emision", label: "✈️ Emisión Aéreo / Time-Limit", color: "border-sky-500/40 text-sky-300 bg-sky-500/10" },
                  { key: "pago", label: "💳 Vencimiento Cobro / Seña", color: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" },
                  { key: "seguimiento", label: "📞 Seguimiento Comercial", color: "border-amber-500/40 text-amber-300 bg-amber-500/10" },
                  { key: "voucher", label: "🎫 Vouchers & Check-In", color: "border-purple-500/40 text-purple-300 bg-purple-500/10" },
                  { key: "general", label: "📌 Tarea General", color: "border-slate-700 text-slate-300 bg-slate-800" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setNewCategory(item.key as UrgentTask["category"])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      newCategory === item.key
                        ? item.color + " ring-1 ring-white/20"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20"
              >
                Guardar en Calendario
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Content Area based on viewMode */}
      <div className="p-4 sm:p-5">
        
        {/* Category Filters Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-3 mb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Filtrar:</span>
            {[
              { id: "todas", label: "Todas" },
              { id: "emision", label: "✈️ Emisiones" },
              { id: "pago", label: "💳 Pagos / Señas" },
              { id: "seguimiento", label: "📞 Seguimientos" },
              { id: "voucher", label: "🎫 Vouchers" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedCategory(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === f.id
                    ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
            {filteredTasks.filter((t) => !t.completed).length} activas
          </span>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: HOY & URGENCIAS */}
        {/* ======================================================== */}
        {viewMode === "hoy" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Overdue alert banner if any */}
            {overdueTasks.length > 0 && (
              <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3.5 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                    Atención: Tenés {overdueTasks.length} {overdueTasks.length === 1 ? "alerta vencida" : "alertas vencidas"}
                  </h4>
                  <p className="text-[11px] text-rose-200/80 mt-0.5">
                    Gestiones cuya fecha programada ya pasó. Podés posponerlas (+1d) o marcarlas como realizadas.
                  </p>
                </div>
              </div>
            )}

            {/* Overdue Section */}
            {overdueTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tracking-wider uppercase">Vencidas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {overdueTasks.map(renderTaskCard)}
                </div>
              </div>
            )}

            {/* Today's Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tracking-wider uppercase">Para Resolver Hoy ({todayTasks.length})</span>
                </div>
                {todayTasks.length > 0 && (
                  <span className="text-[11px] text-slate-400">
                    Se limpian o posponen con 1 clic
                  </span>
                )}
              </div>

              {todayTasks.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">¡No tenés urgencias pendientes para hoy!</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Todo el trabajo prioritario de hoy está resuelto. Podés revisar las próximas alertas en el calendario o agregar una nueva.
                  </p>
                  <button
                    onClick={() => {
                      setNewDate(todayStr);
                      setIsFormOpen(true);
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-400" />
                    <span>Agregar tarea para hoy</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {todayTasks.map(renderTaskCard)}
                </div>
              )}
            </div>

            {/* Quick Preview of Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-sky-400" />
                    Próximas alertas programadas ({upcomingTasks.length})
                  </span>
                  <button
                    onClick={() => setViewMode("calendario")}
                    className="text-[11px] font-semibold text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>Ver en calendario completo</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {upcomingTasks.slice(0, 3).map(renderTaskCard)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: CALENDARIO MENSUAL */}
        {/* ======================================================== */}
        {viewMode === "calendario" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-black text-white capitalize tracking-wide min-w-[170px] text-center">
                  {monthLabel}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCurrentMonthJump}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors ml-2"
                >
                  Hoy
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                  Vencidas / Hoy
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>
                  Aéreos
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  Pagos
                </span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/60 text-center py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span className="text-slate-500">Sáb</span>
                <span className="text-slate-500">Dom</span>
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/80">
                {calendarDays.map((cell, idx) => {
                  const isTodayCell = cell.dateStr === todayStr;
                  const isSelectedCell = cell.dateStr === selectedDate;
                  const pendingInCell = cell.tasks.filter((t) => !t.completed);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(cell.dateStr)}
                      className={`min-h-[85px] sm:min-h-[95px] p-1.5 flex flex-col justify-between cursor-pointer transition-colors relative ${
                        !cell.isCurrentMonth
                          ? "bg-slate-950/40 text-slate-600"
                          : isTodayCell
                          ? "bg-amber-950/15"
                          : "bg-slate-950/90 hover:bg-slate-900/60"
                      } ${isSelectedCell ? "ring-2 ring-inset ring-sky-500/70 bg-sky-950/20" : ""}`}
                    >
                      {/* Top row of cell: date number */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                            isTodayCell
                              ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                              : isSelectedCell
                              ? "bg-sky-500 text-white font-bold"
                              : cell.isCurrentMonth
                              ? "text-slate-300"
                              : "text-slate-600"
                          }`}
                        >
                          {cell.dayNum}
                        </span>

                        {pendingInCell.length > 0 && (
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                              cell.dateStr < todayStr
                                ? "bg-rose-500/30 text-rose-300 border border-rose-500/40"
                                : cell.dateStr === todayStr
                                ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                                : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            }`}
                          >
                            {pendingInCell.length}
                          </span>
                        )}
                      </div>

                      {/* Task pills on cell */}
                      <div className="space-y-1 my-1 overflow-hidden">
                        {cell.tasks.slice(0, 2).map((t) => {
                          const isTaskDone = t.completed;
                          const catInfo = getCategoryDetails(t.category);
                          return (
                            <div
                              key={t.id}
                              className={`text-[9.5px] truncate px-1 py-0.5 rounded border leading-tight ${
                                isTaskDone
                                  ? "line-through text-slate-500 border-transparent bg-slate-900/40"
                                  : t.priority === "alta" || t.date! < todayStr
                                  ? "bg-rose-950/60 text-rose-300 border-rose-800/60"
                                  : catInfo.color
                              }`}
                              title={t.title}
                            >
                              {t.time ? `${t.time} ` : ""}{t.title}
                            </div>
                          );
                        })}
                        {cell.tasks.length > 2 && (
                          <span className="text-[9px] text-slate-500 block text-right font-medium">
                            +{cell.tasks.length - 2} más
                          </span>
                        )}
                      </div>

                      {/* Hover action to add task */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(cell.dateStr);
                          setNewDate(cell.dateStr);
                          setIsFormOpen(true);
                        }}
                        className="opacity-0 hover:opacity-100 transition-opacity self-end p-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                        title={`Programar alerta para el ${cell.dateStr}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Detail Drawer */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Alertas para el {formatDisplayDate(selectedDate)}
                  </h4>
                  {selectedDate === todayStr && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      HOY
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setNewDate(selectedDate);
                    setIsFormOpen(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3 h-3" />
                  <span>Programar en esta fecha</span>
                </button>
              </div>

              {/* Tasks for selected date */}
              {tasks.filter((t) => t.date === selectedDate).length === 0 ? (
                <p className="text-xs text-slate-500 py-3 italic">
                  No hay alertas ni vencimientos programados para este día.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {tasks.filter((t) => t.date === selectedDate).map(renderTaskCard)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: AGENDA CRONOLÓGICA */}
        {/* ======================================================== */}
        {viewMode === "agenda" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Vencidas */}
            {overdueTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Vencidas ({overdueTasks.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {overdueTasks.map(renderTaskCard)}
                </div>
              </div>
            )}

            {/* Hoy */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Hoy ({todayTasks.length})
              </h4>
              {todayTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">Sin tareas pendientes para hoy.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {todayTasks.map(renderTaskCard)}
                </div>
              )}
            </div>

            {/* Próximos 7 días */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Próximos días ({upcomingTasks.length})
              </h4>
              {upcomingTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No hay alertas futuras programadas.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {upcomingTasks.map(renderTaskCard)}
                </div>
              )}
            </div>

            {/* Completadas recientemente */}
            {tasks.filter((t) => t.completed).length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500/70" />
                  Tareas Realizadas ({tasks.filter((t) => t.completed).length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 opacity-60 hover:opacity-100 transition-opacity">
                  {tasks.filter((t) => t.completed).map(renderTaskCard)}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
