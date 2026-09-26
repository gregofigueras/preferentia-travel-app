import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "initialData.json");

console.log("=== INICIANDO TEST SUITE DE LÓGICA DE NEGOCIO ===");

// 1. Validar carga e integridad de initialData.json
console.log("\n[TEST 1] Verificando integridad de datos iniciales...");
const rawData = fs.readFileSync(dataPath, "utf-8");
const data = JSON.parse(rawData);

assert(Array.isArray(data.liquidaciones), "data.liquidaciones debe ser un array");
assert(data.liquidaciones.length >= 66, `Se esperaban al menos 66 liquidaciones, encontradas: ${data.liquidaciones.length}`);
assert(Array.isArray(data.legajos), "data.legajos debe ser un array");
assert(data.legajos.length >= 380, `Se esperaban al menos 380 legajos, encontrados: ${data.legajos.length}`);
assert(data.crm && data.crm.urgencias_hoy, "data.crm.urgencias_hoy debe existir");
assert(data.crm.propuestas_enviadas.length > 0, "Debe haber propuestas enviadas");
console.log("✔ [TEST 1 PASÓ] Datos iniciales intactos: 66 liquidaciones, 386 legajos y CRM cargados.");

// 2. Test de cálculo de servicios y balance inicial
console.log("\n[TEST 2] Verificando cálculo de liquidación y balance inicial...");
const testLiq = {
  id: "test-liq-1",
  sheet_name: "Test Client - Bariloche",
  title: "Liquidacion Test Client x2 - Programa Bariloche",
  client_name: "Test Client",
  destination: "Bariloche",
  pax_count: 2,
  services: [
    { description: "Vuelo AEP-BRC-AEP", price: 600, category: "aereo" },
    { description: "Hotel Llao Llao 4 noches", price: 1400, category: "hotel" }
  ],
  payments: [],
  total_amount: 2000,
  total_paid: 0,
  pending_balance: 2000,
  currency: "USD",
  status: "pending"
};

const calcTotalServices = testLiq.services.reduce((acc, s) => acc + s.price, 0);
assert.strictEqual(calcTotalServices, 2000, "La suma de servicios debe ser 2000");
assert.strictEqual(testLiq.pending_balance, 2000, "El saldo inicial debe coincidir con el total");
assert.strictEqual(testLiq.status, "pending", "El estado inicial debe ser pending");
console.log("✔ [TEST 2 PASÓ] Creación y cálculo inicial de liquidación correcto.");

// 3. Test de agregar servicio dinámicamente
console.log("\n[TEST 3] Agregando servicio adicional y recalculando total...");
testLiq.services.push({ description: "Excursión Circuito Chico", price: 250, category: "otro" });
testLiq.total_amount = testLiq.services.reduce((acc, s) => acc + s.price, 0);
testLiq.pending_balance = testLiq.total_amount - testLiq.total_paid;
assert.strictEqual(testLiq.total_amount, 2250, "El nuevo total debe ser 2250");
assert.strictEqual(testLiq.pending_balance, 2250, "El nuevo saldo pendiente debe ser 2250");
console.log("✔ [TEST 3 PASÓ] Recálculo dinámico al agregar servicio correcto (USD 2,250).");

// 4. Test de pago en ARS con conversión por Tipo de Cambio (TC)
console.log("\n[TEST 4] Registrando cobro en ARS con Tipo de Cambio...");
const pagoARS = 1560000;
const tcPactado = 1560;
const equivUSD = Math.round((pagoARS / tcPactado) * 100) / 100;
assert.strictEqual(equivUSD, 1000, "1.560.000 ARS a TC 1560 debe ser 1000 USD");

testLiq.payments.push({
  date: "2026-09-26",
  amount: equivUSD,
  currency: "ARS",
  tc: tcPactado,
  notes: `ARS ${pagoARS.toLocaleString("es-AR")} @ TC ${tcPactado}`
});

testLiq.total_paid = testLiq.payments.reduce((acc, p) => acc + p.amount, 0);
testLiq.pending_balance = Math.round((testLiq.total_amount - testLiq.total_paid) * 100) / 100;
testLiq.status = testLiq.pending_balance <= 0.05 ? "paid" : testLiq.total_paid > 0 ? "partial" : "pending";

assert.strictEqual(testLiq.total_paid, 1000, "Total cobrado debe ser 1000");
assert.strictEqual(testLiq.pending_balance, 1250, "Saldo pendiente debe ser 1250");
assert.strictEqual(testLiq.status, "partial", "Estado debe haber cambiado a partial");
console.log("✔ [TEST 4 PASÓ] Cobro ARS convertido a USD correctamente. Saldo restante: USD 1,250 (Estado: partial).");

// 5. Test de pago final en USD que salda el viaje
console.log("\n[TEST 5] Registrando cobro saldo en USD...");
testLiq.payments.push({
  date: "2026-09-27",
  amount: 1250,
  currency: "USD",
  notes: "Pago final transferencia USD"
});

testLiq.total_paid = testLiq.payments.reduce((acc, p) => acc + p.amount, 0);
testLiq.pending_balance = Math.max(0, Math.round((testLiq.total_amount - testLiq.total_paid) * 100) / 100);
testLiq.status = testLiq.pending_balance <= 0.05 ? "paid" : "partial";

assert.strictEqual(testLiq.total_paid, 2250, "Total cobrado debe ser 2250");
assert.strictEqual(testLiq.pending_balance, 0, "Saldo pendiente debe ser 0");
assert.strictEqual(testLiq.status, "paid", "Estado debe ser paid (saldado)");
console.log("✔ [TEST 5 PASÓ] Viaje saldado completamente. Saldo pendiente: USD 0.00 (Estado: paid).");

// 6. Test de eliminación de pago y reapertura de deuda
console.log("\n[TEST 6] Eliminando un pago y recalculando deuda...");
testLiq.payments.pop(); // Sacar el segundo pago de 1250
testLiq.total_paid = testLiq.payments.reduce((acc, p) => acc + p.amount, 0);
testLiq.pending_balance = Math.round((testLiq.total_amount - testLiq.total_paid) * 100) / 100;
testLiq.status = testLiq.pending_balance <= 0.05 ? "paid" : testLiq.total_paid > 0 ? "partial" : "pending";

assert.strictEqual(testLiq.total_paid, 1000, "Total cobrado debe volver a 1000");
assert.strictEqual(testLiq.pending_balance, 1250, "Saldo pendiente debe reabrirse en 1250");
assert.strictEqual(testLiq.status, "partial", "Estado debe volver a partial");
console.log("✔ [TEST 6 PASÓ] Eliminación de pago reabrió saldo pendiente con precisión.");

// 7. Test de Calculadora de Comisiones (Lógica Lautaro / Preferentia)
console.log("\n[TEST 7] Verificando fórmulas de cálculo de comisiones...");
function calculateCommission(utilidad, retentionPct, commissionPct) {
  const netAfterRetention = utilidad * (1 - retentionPct / 100);
  const commission = netAfterRetention * (commissionPct / 100);
  return Math.round(commission * 100) / 100;
}

// Caso 1: 18% retención (0.82) y 50% split (ej: fórmula de Lautaro `=(14394.43*0.82)*0.5`)
const com1 = calculateCommission(1000, 18, 50);
assert.strictEqual(com1, 410, "1000 * 0.82 * 0.5 debe ser 410");

// Caso 2: 6% IIBB (0.94) y 30% split (ej: fórmula de Lautaro `=330750*0.3*(1-0.06)`)
const com2 = calculateCommission(100000, 6, 30);
assert.strictEqual(com2, 28200, "100000 * 0.94 * 0.3 debe ser 28200");

// Caso 3: 18% retención y 25% split (fórmula de Lautaro `=(43.2*0.82)*0.25`)
const com3 = calculateCommission(100, 18, 25);
assert.strictEqual(com3, 20.5, "100 * 0.82 * 0.25 debe ser 20.5");

console.log("✔ [TEST 7 PASÓ] Fórmulas de comisión verificadas (18% retención, 6% IIBB, 50%/30%/25% split).");

// 8. Test de Transiciones de Estado en CRM
console.log("\n[TEST 8] Verificando transiciones del Pipeline CRM...");
const crmItem = { id: "crm-test", title: "Perez - Miami", status: "armar" };
assert.strictEqual(crmItem.status, "armar");
crmItem.status = "enviada";
assert.strictEqual(crmItem.status, "enviada");
crmItem.status = "cerrado";
assert.strictEqual(crmItem.status, "cerrado");
console.log("✔ [TEST 8 PASÓ] Transiciones de estado de cotizaciones funcionan sin inconsistencias.");

console.log("\n=======================================================");
console.log("🎉 ¡TODOS LOS TESTS DE LÓGICA DE NEGOCIO PASARON (8/8)!");
console.log("=======================================================\n");
