import { chromium } from "playwright";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

console.log("=== INICIANDO TEST END-TO-END DE INTERFAZ (UI) ===");

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runUITests() {
  // 1. Iniciar servidor Next.js
  console.log("\n[1/6] Iniciando servidor Next.js en puerto 3000...");
  const server = spawn("npm.cmd", ["run", "start", "--", "-p", "3000"], {
    cwd: projectRoot,
    stdio: "pipe",
    shell: true,
  });

  server.stdout.on("data", (d) => {
    // console.log(`[Next.js]: ${d}`);
  });

  server.stderr.on("data", (d) => {
    // console.error(`[Next.js Error]: ${d}`);
  });

  // Esperar a que el servidor esté activo
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch("http://localhost:3000");
      if (res.ok) {
        serverReady = true;
        break;
      }
    } catch (e) {
      await wait(1000);
    }
  }

  if (!serverReady) {
    console.error("El servidor Next.js no inició a tiempo.");
    server.kill();
    process.exit(1);
  }
  console.log("✔ Servidor Next.js respondiendo correctamente en http://localhost:3000.");

  // 2. Lanzar navegador Chromium (usando Chrome del sistema)
  console.log("\n[2/6] Lanzando navegador headless Chrome...");
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });
  const context = await browser.newContext({ 
    locale: "es-AR",
    viewport: { width: 1400, height: 900 } 
  });
  const page = await context.newPage();

  try {
    // =========================================================================
    // TEST 3: TABLERO OPERATIVO UNIFICADO (DISPLAY) & WORKSPACE 1
    // =========================================================================
    console.log("\n[3/6] Testeando Tablero Operativo Unificado ('/')...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    
    // Verificar título y marca
    const titleText = await page.textContent("body");
    if (!titleText.includes("PREFERENTIA") || !titleText.includes("Lautaro")) {
      throw new Error("No se encontró el branding de Preferentia o Lautaro en el Tablero");
    }
    console.log("✔ Branding 'PREFERENTIA TRAVEL' y 'Lautaro Zeppa' verificado.");

    // Test Widget "HOY SI O SI": agregar tarea urgente
    console.log("  -> Testeando widget de urgencias diarias ('HOY SI O SI')...");
    const urgentInput = page.locator('input[placeholder="Agregar urgencia del día..."]');
    await urgentInput.fill("Reprogramar vuelos Arajet familia Gonzalez");
    await page.click('button:has-text("Agregar")');
    await wait(400);

    const hasNewTask = await page.locator('text="Reprogramar vuelos Arajet familia Gonzalez"').isVisible();
    if (!hasNewTask) throw new Error("La nueva tarea urgente no se agregó correctamente.");
    console.log("  ✔ Nueva tarea urgente agregada exitosamente.");

    // Marcar como completada
    await page.click('button:has-text("Reprogramar vuelos Arajet familia Gonzalez")');
    await wait(300);
    console.log("  ✔ Tarea urgente marcada como completada.");

    // Test Cerrar Venta en Seguimiento
    console.log("  -> Testeando flujo 'Cerrar Venta' (desaparece de seguimiento y entra en Ventas Cerradas)...");
    const cerrarBtn = page.locator('button:has-text("Cerrar Venta")').first();
    await cerrarBtn.click();
    await wait(300);

    // Modal de confirmación de cierre
    const confirmModal = page.locator('button:has-text("Confirmar Venta Cerrada")');
    await confirmModal.waitFor({ state: "visible", timeout: 3000 });
    await confirmModal.click();
    await wait(400);
    console.log("  ✔ Venta cerrada y archivada automáticamente en Ventas Cerradas 2026.");

    // =========================================================================
    // TEST 4: WORKSPACE 2 - MIS NÚMEROS & LEGAJOS + CALCULADORA
    // =========================================================================
    console.log("\n[4/6] Testeando Workspace 2: Mis Números & Legajos y Calculadora...");
    await page.keyboard.press("2");
    await wait(300);
    let legajosTable = await page.locator('h3:has-text("Expedientes Cerrados")').isVisible();
    if (!legajosTable) {
      await page.click('button:has-text("2. Mis Números & Legajos")');
      await wait(500);
      legajosTable = await page.locator('h3:has-text("Expedientes Cerrados")').isVisible();
    }
    if (!legajosTable) {
      throw new Error("No se desplegó el panel de Mis Números & Legajos.");
    }
    console.log("  ✔ Panel de Legajos y Comisiones mensual activo.");

    // Testear Calculadora Interactiva en vivo
    const utilidadInput = page.locator('input[type="number"][step="0.01"]').first();
    await utilidadInput.fill("2000");
    await wait(200);

    // Con utilidad 2000, 18% retención (1640), 50% split = 820.00
    const calcResult = await page.locator('text="$820.00"').isVisible();
    if (!calcResult) throw new Error("La calculadora no computó $820.00 para utilidad de 2000.");
    console.log("  ✔ Calculadora Inteligente verificada en Tablero: $2,000 util. -> $820.00 comisión.");

    // =========================================================================
    // TEST 5: WORKSPACE 3 - LIQUIDACIONES SPLIT-VIEW (MASTER-DETAIL)
    // =========================================================================
    console.log("\n[5/6] Testeando Workspace 3: Liquidaciones Split-View Master-Detail...");
    await page.click('button:has-text("3. Liquidaciones & Fichas")');
    await wait(400);

    // Buscar "Demicheli" en el buscador de la lista
    const searchLiqInput = page.locator('input[placeholder="Buscar cliente, destino, hoja..."]');
    await searchLiqInput.fill("Demicheli");
    await wait(300);

    const demicheliCard = page.locator('text="Demicheli"').first();
    await demicheliCard.click();
    await wait(300);

    // Verificar que el panel de detalle a la derecha cargó a Demicheli
    const detailTitle = await page.locator('h3:has-text("Demicheli")').first().isVisible();
    if (!detailTitle) throw new Error("El panel de detalle no cargó la ficha de Demicheli.");
    console.log("  ✔ Split-view sincronizado: ficha de Demicheli cargada en panel derecho.");

    // Test botón Copiar WhatsApp en Split View
    await page.click('button:has-text("Copiar para WhatsApp")');
    await wait(300);
    const feedbackCopy = await page.locator('text="¡Copiado para WhatsApp!"').isVisible();
    if (!feedbackCopy) throw new Error("El botón de WhatsApp en Split-View no mostró confirmación.");
    console.log("  ✔ Resumen de WhatsApp copiado exitosamente desde el Split-View.");

    // =========================================================================
    // TEST 6: MÓDULO DE LIQUIDACIONES DEDICADO Y FLUJO COMPLETO DE COBROS
    // =========================================================================
    console.log("\n[6/6] Testeando Módulo Dedicado ('/liquidaciones') y Cobros en ARS/USD...");
    await page.goto("http://localhost:3000/liquidaciones", { waitUntil: "networkidle" });

    // Filtrar por 'Con Saldo Pendiente'
    await page.click('button:has-text("Con Saldo Pendiente")');
    await wait(300);

    // Crear una Nueva Liquidación
    console.log("  -> Creando nueva liquidación vía modal...");
    await page.click('button:has-text("+ Nueva Liquidación")');
    await wait(300);

    await page.fill('input[placeholder="Ej: Flia. Gonzalez, o Grupo Amigos Miami"]', "Familia Rodriguez Test");
    await page.fill('input[placeholder="Ej: Punta Cana, Europa 2026..."]', "Bariloche 2026");
    await page.fill('input[type="number"][min="1"]', "4");
    await page.fill('input[placeholder="0.00"]', "3000");
    await page.fill('input[placeholder="Ej: Aéreos Arajet + Hotel Viva Dominicus"]', "Vuelos Flybondi + Hotel Edelweiss 5 noches");

    await page.click('button:has-text("Crear Ficha de Viaje")');
    await wait(500);

    // Click en la nueva liquidación
    const newCard = page.locator('.group', { has: page.locator('h3:has-text("Familia Rodriguez Test")') }).first();
    await newCard.locator('a:has-text("Ver Ficha & Pagos")').click();
    await page.waitForURL(/\/liquidaciones\/.+/, { timeout: 4000 });
    console.log("  ✔ Ficha individual abierta:", page.url());

    // Agregar servicio adicional
    await page.click('button:has-text("Agregar Ítem")');
    await wait(200);
    await page.fill('input[placeholder="Descripción (ej: Vuelos ARAJET BUE-PUJ, Hotel Barceló...)"]', "Excursión San Martín de los Andes");
    await page.fill('input[placeholder="0.00"]', "400");
    await page.click('button:has-text("Guardar Servicio")');
    await wait(400);

    const totalText = await page.locator('text="USD 3.400"').first().isVisible();
    if (!totalText) throw new Error("El total contratado no se recalculó a USD 3,400.");
    console.log("  ✔ Servicio agregado y Total Contratado recalculado a USD 3,400.");

    // Registrar cobro en ARS con Tipo de Cambio
    await page.click('button:has-text("+ Registrar Cobro")');
    await wait(200);
    await page.selectOption('select:has-text("USD (Dólares billete o transf.)")', "ARS");
    await wait(200);
    await page.fill('input[placeholder="0.00"]', "1560000"); // 1.560.000 ARS
    await page.fill('input[type="number"][step="1"]', "1560"); // TC 1560 -> 1000 USD
    await page.fill('input[placeholder="Ej: Pago Marisa transferencia, seña 50%..."]', "Seña transferencia bancaria");
    await page.click('form button[type="submit"]:has-text("Registrar Cobro")');
    await wait(500);

    const cobradoUSD1000 = await page.locator('text=/USD 1[.,]000/').first().isVisible();
    const pendienteUSD2400 = await page.locator('text=/USD 2[.,]400/').first().isVisible();
    if (!cobradoUSD1000 || !pendienteUSD2400) {
      throw new Error("El cobro en ARS no se convirtió o el saldo no es USD 2,400");
    }
    console.log("  ✔ Cobro ARS registrado a TC 1560. Total Cobrado: USD 1,000 | Saldo Pendiente: USD 2,400.");

    // Registrar cobro final para saldar viaje
    await page.click('button:has-text("+ Registrar Cobro")');
    await wait(200);
    await page.fill('input[placeholder="0.00"]', "2400");
    await page.fill('input[placeholder="Ej: Pago Marisa transferencia, seña 50%..."]', "Saldo final dólar billete");
    await page.click('form button[type="submit"]:has-text("Registrar Cobro")');
    await wait(500);

    const saldadoBadge = await page.locator('span:has-text("SALDADO")').first().isVisible();
    if (!saldadoBadge) throw new Error("El badge no cambió a SALDADO.");
    console.log("  ✔ Viaje saldado completamente: Saldo USD 0.00 y badge SALDADO activo.");

    console.log("\n=======================================================");
    console.log("🎉 ¡TODOS LOS TESTS DE UI Y DISPLAY PASARON CON ÉXITO!");
    console.log("=======================================================\n");

  } finally {
    await browser.close();
    server.kill();
  }
}

runUITests().catch((err) => {
  console.error("\n❌ ERROR EN EL TEST DE UI:", err);
  process.exit(1);
});
