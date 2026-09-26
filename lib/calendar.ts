// lib/calendar.ts
// Calendar Integrations (Google Calendar 1-Click + iCal Feed Roadmap)

import { UrgentTask } from "@/types";

/**
 * Category friendly names for calendar descriptions
 */
const CATEGORY_NAMES: Record<string, string> = {
  emision: "Emisión de Aéreos / Time Limit ✈️",
  pago: "Cobranza a Pasajero / Pago a Proveedor 💳",
  llamada: "Llamada o Seguimiento de Cotización 📞",
  voucher: "Emisión de Vouchers y Asistencia Médica 📄",
  general: "Gestión Operativa General 🏷️",
};

/**
 * Opción 1: Generador de URL directa para Google Calendar (1-clic)
 * Abre Google Calendar con el evento pre-cargado listo para guardar.
 */
export function generateGoogleCalendarUrl(task: {
  title: string;
  date?: string;
  time?: string;
  category?: UrgentTask["category"] | string;
  priority?: UrgentTask["priority"] | string;
  notes?: string;
}): string {
  const eventTitle = `[Preferentia] ${task.title}`;
  
  // Format dates parameter for Google Calendar:
  // - All-day event: YYYYMMDD/YYYYMMDD (end date is exclusive, day + 1)
  // - Event with time: YYYYMMDDTHHmm00/YYYYMMDDTHHmm00
  let datesParam = "";

  if (task.date && /^\d{4}-\d{2}-\d{2}$/.test(task.date)) {
    const cleanDate = task.date.replace(/-/g, "");

    if (task.time && task.time.includes(":")) {
      const [h, m] = task.time.split(":").map(Number);
      const startH = String(isNaN(h) ? 12 : h).padStart(2, "0");
      const startM = String(isNaN(m) ? 0 : m).padStart(2, "0");
      // Default duration: 1 hour
      const endH = String((isNaN(h) ? 13 : (h + 1) % 24)).padStart(2, "0");
      const endM = startM;
      datesParam = `${cleanDate}T${startH}${startM}00/${cleanDate}T${endH}${endM}00`;
    } else {
      // All day event (Google requires end date to be day + 1)
      const parts = task.date.split("-").map(Number);
      const nextDay = new Date(parts[0], parts[1] - 1, parts[2] + 1);
      const nextClean = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, "0")}${String(nextDay.getDate()).padStart(2, "0")}`;
      datesParam = `${cleanDate}/${nextClean}`;
    }
  } else {
    // Fallback: today
    const now = new Date();
    const todayClean = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrowClean = `${tomorrow.getFullYear()}${String(tomorrow.getMonth() + 1).padStart(2, "0")}${String(tomorrow.getDate()).padStart(2, "0")}`;
    datesParam = `${todayClean}/${tomorrowClean}`;
  }

  // Construct description body
  const detailsParts: string[] = [
    `✈️ PREFERENTIA TRAVEL - GESTIÓN Y ALERTA`,
    ``,
    task.category ? `• Categoría: ${CATEGORY_NAMES[task.category] || task.category}` : "",
    task.priority ? `• Prioridad: ${task.priority.toUpperCase()}` : "",
    task.time ? `• Hora límite: ${task.time} hs` : "",
    task.notes ? `• Notas: ${task.notes}` : "",
    ``,
    `Gestionado desde el Tablero Ejecutivo Preferentia Travel (Lautaro Zeppa).`,
  ].filter(Boolean);

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", eventTitle);
  url.searchParams.set("dates", datesParam);
  url.searchParams.set("details", detailsParts.join("\n"));
  url.searchParams.set("location", "Preferentia Travel");

  return url.toString();
}

/**
 * --------------------------------------------------------------------------
 * ROADMAP: OPCIÓN 2 (Suscripción automática por enlace iCal / .ics)
 * --------------------------------------------------------------------------
 * Para cuando se active la Opción 2:
 * 1. Endpoint en Next.js App Router: `app/api/calendar/route.ts`
 * 2. Genera un contenido text/calendar con cabeceras:
 *    - Content-Type: text/calendar; charset=utf-8
 *    - Content-Disposition: attachment; filename="preferentia-alertas.ics"
 * 3. Permite a Lautaro pegar `webcal://preferentia.travel/api/calendar`
 *    directamente en Google Calendar (Añadir desde URL) para sincronización
 *    automática en vivo en su computadora y celular sin login.
 */
export function formatICalEvent(task: UrgentTask): string {
  const dtStart = task.date ? task.date.replace(/-/g, "") : "";
  return [
    "BEGIN:VEVENT",
    `UID:preferentia-${task.id}@preferentiatravel.com`,
    `SUMMARY:[Preferentia] ${task.title}`,
    `DESCRIPTION:${task.notes || task.title}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
  ].join("\r\n");
}
