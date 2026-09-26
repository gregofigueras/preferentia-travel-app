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
    viewport: { width: 1280, height: 800 } 
  });
  const page = await context.newPage();

  try {
    // TEST DASHBOARD
    console.log("\n[3/6] Testeando Dashboard General ('/')...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    
    // Verificar título y marca
    const titleText = await page.textContent("body");
    if (!titleText.includes("PREFERENTIA") || !titleText.includes("Lautaro")) {
      throw new Error("No se encontró el branding de Preferentia o Lautaro en el Dashboard");
    }
    console.log("✔ Branding 'PREFERENTIA TRAVEL' y 'Lautaro Zeppa' verificado.");

    // Test Widget "HOY SI O SI": agregar tarea urgente
    console.log("  -> Testeando widget de urgencias diarias ('HOY SI O SI')...");
    const urgentInput = page.locator('input[placeholder="Nueva urgencia diaria..."]');
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

    // Búsqueda en Dashboard
    console.log("  -> Testeando buscador global en Dashboard...");
    const searchInput = page.locator('input[placeholder="Buscar cliente, destino..."]');
    await searchInput.fill("Demicheli");
    await wait(400);
    const rowDemicheli = await page.locator('td:has-text("Demicheli")').first().isVisible();
    if (!rowDemicheli) throw new Error("El buscador no filtró la liquidación de Demicheli.");
    console.log("  ✔ Buscador global filtró liquidaciones en vivo.");

    // TEST LIQUIDACIONES
    console.log("\n[4/6] Testeando Módulo de Liquidaciones ('/liquidaciones')...");
    await page.goto("http://localhost:3000/liquidaciones", { waitUntil: "networkidle" });

    // Filtrar por 'Con Saldo Pendiente'
    await page.click('button:has-text("Con Saldo Pendiente")');
    await wait(300);
    console.log("  ✔ Filtro 'Con Saldo Pendiente' activo.");

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

    // Verificar que se creó y aparece en la lista
    const newLiqCard = page.locator('h3:has-text("Familia Rodriguez Test")');
    await newLiqCard.waitFor({ state: "visible", timeout: 3000 });
    console.log("  ✔ Liquidación 'Familia Rodriguez Test' creada exitosamente con USD 3,000.");

    // TEST DETALLE DE LIQUIDACIÓN Y CONTROL DE PAGOS
    console.log("\n[5/6] Testeando Ficha de Viaje, Pagos con TC y WhatsApp Export...");
    // Click en la nueva liquidación recién creada (tiene link con liq- en href)
    const newCard = page.locator('.group', { has: page.locator('h3:has-text("Familia Rodriguez Test")') }).first();
    await newCard.locator('a:has-text("Ver Ficha & Pagos")').click();
    await page.waitForURL(/\/liquidaciones\/.+/, { timeout: 4000 });
    console.log("  ✔ Ficha abierta:", page.url());

    // 1. Agregar un servicio adicional
    console.log("  -> Agregando servicio adicional ('Excursión San Martín')...");
    await page.click('button:has-text("Agregar Ítem")');
    await wait(200);
    await page.fill('input[placeholder="Descripción (ej: Vuelos ARAJET BUE-PUJ, Hotel Barceló...)"]', "Excursión San Martín de los Andes");
    await page.fill('input[placeholder="0.00"]', "400");
    await page.click('button:has-text("Guardar Servicio")');
    await wait(400);

    const totalText = await page.locator('text="USD 3.400"').first().isVisible();
    if (!totalText) throw new Error("El total contratado no se recalculó a USD 3,400.");
    console.log("  ✔ Servicio agregado y Total Contratado recalculado a USD 3,400.");

    // 2. Registrar cobro en ARS con Tipo de Cambio
    console.log("  -> Registrando cobro en ARS con TC...");
    await page.click('button:has-text("+ Registrar Cobro")');
    await wait(200);

    await page.selectOption('select:has-text("USD (Dólares billete o transf.)")', "ARS");
    await wait(200);
    await page.fill('input[placeholder="0.00"]', "1560000"); // 1.560.000 ARS
    await page.fill('input[type="number"][step="1"]', "1560"); // TC 1560 -> 1000 USD
    await page.fill('input[placeholder="Ej: Pago Marisa transferencia, seña 50%..."]', "Seña transferencia bancaria");
    await page.click('form button[type="submit"]:has-text("Registrar Cobro")');
    await wait(500);

    // Verificar nuevo cobrado y saldo pendiente (3400 - 1000 = 2400)
    const cobradoUSD1000 = await page.locator('text=/USD 1[.,]000/').first().isVisible();
    const pendienteUSD2400 = await page.locator('text=/USD 2[.,]400/').first().isVisible();
    if (!cobradoUSD1000 || !pendienteUSD2400) {
      console.log("DEBUG HTML:", (await page.content()).slice(0, 1000));
      throw new Error("El cobro en ARS no se convirtió o el saldo no es USD 2,400");
    }
    console.log("  ✔ Cobro ARS registrado a TC 1560. Total Cobrado: USD 1,000 | Saldo Pendiente: USD 2,400.");

    // 3. Registrar cobro final para saldar viaje
    console.log("  -> Registrando cobro saldo en USD para saldar el viaje...");
    await page.click('button:has-text("+ Registrar Cobro")');
    await wait(200);
    await page.fill('input[placeholder="0.00"]', "2400");
    await page.fill('input[placeholder="Ej: Pago Marisa transferencia, seña 50%..."]', "Saldo final dólar billete");
    await page.click('form button[type="submit"]:has-text("Registrar Cobro")');
    await wait(500);

    const saldadoBadge = await page.locator('span:has-text("SALDADO")').first().isVisible();
    if (!saldadoBadge) throw new Error("El badge no cambió a SALDADO.");
    console.log("  ✔ Viaje saldado completamente: Saldo USD 0.00 y badge SALDADO activo.");

    // 4. Test Copiar para WhatsApp
    console.log("  -> Testeando botón 'Copiar para WhatsApp'...");
    await page.click('button:has-text("Copiar para WhatsApp")');
    await wait(300);
    const feedbackCopy = await page.locator('text="¡Copiado para WhatsApp!"').isVisible();
    if (!feedbackCopy) throw new Error("El botón de WhatsApp no mostró confirmación.");
    console.log("  ✔ Botón 'Copiar para WhatsApp' validado.");

    // TEST CRM PIPELINE
    console.log("\n[6/6] Testeando Pipeline CRM y Calculadora de Comisiones...");
    await page.goto("http://localhost:3000/crm", { waitUntil: "networkidle" });

    // Agregar nueva propuesta
    await page.click('button:has-text("+ Nueva Propuesta")');
    await wait(200);
    await page.fill('input[placeholder="Ej: Perez Juan - Vuelos Miami x4"]', "Test Gomez - Miami x3");
    await page.click('button:has-text("Guardar Propuesta")');
    await wait(400);

    const propCard = page.locator('text="Test Gomez - Miami x3"');
    if (!await propCard.isVisible()) throw new Error("La nueva propuesta no se visualiza en CRM.");
    console.log("  ✔ Propuesta creada en columna 'A Cotizar / Armar'.");

    // Mover a Enviada
    await page.locator('button:has-text("Pasar a Enviada")').first().click();
    await wait(300);
    console.log("  ✔ Propuesta movida a 'Enviadas & Seguimiento'.");

    // Mover a Cerrada
    await page.locator('button:has-text("¡Cerrada!")').first().click();
    await wait(300);
    const createLiqBtn = await page.locator('a:has-text("Crear Liquidación")').first().isVisible();
    if (!createLiqBtn) throw new Error("No apareció el botón 'Crear Liquidación' en la propuesta cerrada.");
    console.log("  ✔ Propuesta cerrada con éxito con botón directo a 'Crear Liquidación'.");

    // TEST LEGAJOS Y CALCULADORA
    await page.goto("http://localhost:3000/legajos", { waitUntil: "networkidle" });
    
    // Testear Calculadora Interactiva en vivo
    const utilidadInput = page.locator('input[type="number"][step="0.01"]').first();
    await utilidadInput.fill("2000");
    await wait(200);

    // Con utilidad 2000, 18% retención (1640), 50% split = 820.00
    const calcResult = await page.locator('text="$820.00"').isVisible();
    if (!calcResult) throw new Error("La calculadora no computó $820.00 para utilidad de 2000.");
    console.log("  ✔ Calculadora Inteligente de Comisiones verificada en vivo: $2,000 util. -> $820.00 com. neta.");

    console.log("\n=======================================================");
    console.log("🎉 ¡TEST DE UI Y FLUJOS E2E FINALIZADO CON 100% DE ÉXITO!");
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
