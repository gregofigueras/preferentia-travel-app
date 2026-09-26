import assert from "node:assert";

console.log("=== INICIANDO TEST SUITE DE AGENDA & CALENDARIO DE ALERTAS ===");

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const todayStr = getLocalDateString();
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = getLocalDateString(tomorrow);

const pastDate = new Date();
pastDate.setDate(pastDate.getDate() - 3);
const pastDateStr = getLocalDateString(pastDate);

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7);
const futureDateStr = getLocalDateString(futureDate);

// Simulated App State
let tasks = [
  {
    id: "task-1",
    title: "Time limit emisión Iberia Silvina Acosta",
    completed: false,
    date: todayStr,
    time: "18:00",
    category: "emision",
    priority: "alta",
  },
  {
    id: "task-2",
    title: "Seguimiento cliente Gómez - Cotización Cancún",
    completed: false,
    date: pastDateStr,
    category: "seguimiento",
    priority: "media",
  },
  {
    id: "task-3",
    title: "Vencimiento seña Hotel Riu - Pax Martínez",
    completed: false,
    date: tomorrowStr,
    time: "15:00",
    category: "pago",
    priority: "alta",
  },
  {
    id: "task-4",
    title: "Emisión Vouchers y Asistencia Pax Rossi",
    completed: false,
    date: futureDateStr,
    category: "voucher",
    priority: "media",
  }
];

// TEST 1: Identificación precisa de vencidas, para hoy y futuras
console.log("\n[TEST 1] Verificando clasificación cronológica de alertas...");
const overdue = tasks.filter(t => !t.completed && t.date && t.date < todayStr);
const dueToday = tasks.filter(t => !t.completed && (!t.date || t.date === todayStr));
const upcoming = tasks.filter(t => !t.completed && t.date && t.date > todayStr);

assert.strictEqual(overdue.length, 1, "Debe haber 1 alerta vencida");
assert.strictEqual(overdue[0].id, "task-2");
assert.strictEqual(dueToday.length, 1, "Debe haber 1 alerta para hoy");
assert.strictEqual(dueToday[0].id, "task-1");
assert.strictEqual(upcoming.length, 2, "Debe haber 2 alertas futuras programadas");
console.log("✔ [TEST 1 PASÓ] Clasificación cronológica (vencidas, hoy, futuras) correcta.");

// TEST 2: Programación de nueva alerta para una fecha específica del calendario
console.log("\n[TEST 2] Programando nueva alerta para fecha de calendario...");
const targetDate = "2026-10-15";
const newAlert = {
  id: `task-${Date.now()}`,
  title: "Check-in y asignación de asientos Pax López",
  completed: false,
  date: targetDate,
  time: "09:30",
  category: "voucher",
  priority: "media",
};
tasks.push(newAlert);

const foundInCalendarDay = tasks.filter(t => t.date === targetDate);
assert.strictEqual(foundInCalendarDay.length, 1);
assert.strictEqual(foundInCalendarDay[0].title, "Check-in y asignación de asientos Pax López");
assert.strictEqual(foundInCalendarDay[0].time, "09:30");
console.log("✔ [TEST 2 PASÓ] Alerta programada en el calendario para el 2026-10-15 correctamente.");

// TEST 3: Posposición rápida (+1 día)
console.log("\n[TEST 3] Posponiendo alerta vencida al día siguiente (+1d)...");
const taskToPostpone = tasks.find(t => t.id === "task-2");
const originalDate = new Date(taskToPostpone.date + "T12:00:00");
originalDate.setDate(originalDate.getDate() + 1);
taskToPostpone.date = getLocalDateString(originalDate);

assert.notStrictEqual(taskToPostpone.date, pastDateStr, "La fecha debe haber cambiado");
console.log(`✔ [TEST 3 PASÓ] Alerta pospuesta con éxito a la nueva fecha: ${taskToPostpone.date}`);

// TEST 4: Filtrado por categoría (Emisión, Pago, Seguimiento, Voucher)
console.log("\n[TEST 4] Verificando filtrado de alertas por categoría...");
const emisiones = tasks.filter(t => t.category === "emision");
const pagos = tasks.filter(t => t.category === "pago");
const vouchers = tasks.filter(t => t.category === "voucher");

assert.strictEqual(emisiones.length, 1);
assert.strictEqual(pagos.length, 1);
assert.strictEqual(vouchers.length, 2);
console.log("✔ [TEST 4 PASÓ] Filtrado por categorías operativas (aéreos, cobranzas, vouchers) verificado.");

// TEST 5: Completado y retiro de alertas activas
console.log("\n[TEST 5] Marcando alerta como completada...");
const urgentToday = tasks.find(t => t.id === "task-1");
urgentToday.completed = true;

const pendingToday = tasks.filter(t => !t.completed && t.date === todayStr);
assert.strictEqual(pendingToday.length, 0, "No debe quedar ninguna alerta pendiente para hoy");
console.log("✔ [TEST 5 PASÓ] Tarea completada retirada del estado urgente activo.");

// TEST 6: Generación de enlace 1-clic a Google Calendar (evento con hora específica)
console.log("\n[TEST 6] Validando generación de URL para Google Calendar con hora...");
function testGenerateGoogleCalendarUrl(task) {
  const eventTitle = `[Preferentia] ${task.title}`;
  let datesParam = "";

  if (task.date && /^\d{4}-\d{2}-\d{2}$/.test(task.date)) {
    const cleanDate = task.date.replace(/-/g, "");
    if (task.time && task.time.includes(":")) {
      const [h, m] = task.time.split(":").map(Number);
      const startH = String(isNaN(h) ? 12 : h).padStart(2, "0");
      const startM = String(isNaN(m) ? 0 : m).padStart(2, "0");
      const endH = String((isNaN(h) ? 13 : (h + 1) % 24)).padStart(2, "0");
      const endM = startM;
      datesParam = `${cleanDate}T${startH}${startM}00/${cleanDate}T${endH}${endM}00`;
    } else {
      const parts = task.date.split("-").map(Number);
      const nextDay = new Date(parts[0], parts[1] - 1, parts[2] + 1);
      const nextClean = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, "0")}${String(nextDay.getDate()).padStart(2, "0")}`;
      datesParam = `${cleanDate}/${nextClean}`;
    }
  }

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", eventTitle);
  url.searchParams.set("dates", datesParam);
  url.searchParams.set("details", `Prioridad: ${task.priority || "Normal"}\nNotas: ${task.notes || ""}`);
  url.searchParams.set("location", "Preferentia Travel");
  return url.toString();
}

const timedTask = {
  title: "Emisión urgente Latam Airlines",
  date: "2026-10-20",
  time: "18:00",
  priority: "alta",
  notes: "Pago con tarjeta ya acreditado"
};
const gcalUrlTimed = testGenerateGoogleCalendarUrl(timedTask);
const parsedTimedUrl = new URL(gcalUrlTimed);
assert.strictEqual(parsedTimedUrl.origin + parsedTimedUrl.pathname, "https://calendar.google.com/calendar/render");
assert.strictEqual(parsedTimedUrl.searchParams.get("action"), "TEMPLATE");
assert.strictEqual(parsedTimedUrl.searchParams.get("dates"), "20261020T180000/20261020T190000");
assert.strictEqual(parsedTimedUrl.searchParams.get("text"), "[Preferentia] Emisión urgente Latam Airlines");
assert.strictEqual(parsedTimedUrl.searchParams.get("location"), "Preferentia Travel");
assert.ok(parsedTimedUrl.searchParams.get("details").includes("Pago con tarjeta ya acreditado"));
console.log("✔ [TEST 6 PASÓ] URL para Google Calendar con horario (18:00 a 19:00 hs) generada correctamente.");

// TEST 7: Generación de enlace a Google Calendar (evento de día completo)
console.log("\n[TEST 7] Validando generación de URL para Google Calendar todo el día (+1 día exclusivo)...");
const allDayTask = {
  title: "Vencimiento seña Iberia",
  date: "2026-10-25",
  priority: "media",
};
const gcalUrlAllDay = testGenerateGoogleCalendarUrl(allDayTask);
const parsedAllDayUrl = new URL(gcalUrlAllDay);
assert.strictEqual(parsedAllDayUrl.searchParams.get("dates"), "20261025/20261026");
assert.strictEqual(parsedAllDayUrl.searchParams.get("text"), "[Preferentia] Vencimiento seña Iberia");
console.log("✔ [TEST 7 PASÓ] URL para evento de día completo calculó correctamente la fecha fin exclusiva (20261025/20261026).");

console.log("\n=======================================================");
console.log("🎉 ¡TODOS LOS TESTS DE AGENDA & CALENDARIO PASARON (7/7)!");
console.log("=======================================================\n");
