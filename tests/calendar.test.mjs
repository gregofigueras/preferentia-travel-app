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

console.log("\n=======================================================");
console.log("🎉 ¡TODOS LOS TESTS DE AGENDA & CALENDARIO PASARON (5/5)!");
console.log("=======================================================\n");
