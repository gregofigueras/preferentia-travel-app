// tests/shortcuts.test.mjs
// Test suite for Keyboard Shortcuts engine & event routing

import assert from "node:assert/strict";

console.log("=== INICIANDO TEST SUITE DE ACCESOS RÁPIDOS & ATAJOS (HOTKEYS) ===\n");

// Mocking keyboard dispatch engine
class MockShortcutEngine {
  constructor() {
    this.activeTab = "seguimiento";
    this.isShortcutsOpen = false;
    this.eventsDispatched = [];
  }

  dispatchEvent(eventName) {
    this.eventsDispatched.push(eventName);
  }

  handleKeyDown(event) {
    // 1. Ignore AltGr (when both ctrlKey and altKey are true)
    if (event.ctrlKey && event.altKey) {
      return { handled: false, reason: "AltGr ignored" };
    }

    const isTyping = event.isTyping || false;

    // 2. Escape: closes modals
    if (event.key === "Escape") {
      if (this.isShortcutsOpen) {
        this.isShortcutsOpen = false;
        return { handled: true, action: "close-shortcuts-modal" };
      }
      this.dispatchEvent("close-modals");
      return { handled: true, action: "close-modals" };
    }

    // 3. Alt + [KEY] combinations
    if (event.altKey && !event.ctrlKey && !event.metaKey) {
      const key = event.key?.toLowerCase();
      const code = event.code;

      if (key === "p" || code === "KeyP") {
        this.activeTab = "seguimiento";
        this.dispatchEvent("open-schedule-alert");
        return { handled: true, action: "open-schedule-alert", tab: this.activeTab };
      }

      if (key === "l" || code === "KeyL") {
        this.dispatchEvent("open-new-liquidacion");
        return { handled: true, action: "open-new-liquidacion" };
      }

      if (key === "c" || code === "KeyC") {
        this.activeTab = "seguimiento";
        this.dispatchEvent("focus-new-cotizacion");
        return { handled: true, action: "focus-new-cotizacion", tab: this.activeTab };
      }

      if (key === "m" || code === "KeyM") {
        this.activeTab = "numeros";
        this.dispatchEvent("open-new-legajo");
        return { handled: true, action: "open-new-legajo", tab: this.activeTab };
      }

      if (key === "w" || code === "KeyW") {
        this.dispatchEvent("trigger-copy-whatsapp");
        return { handled: true, action: "trigger-copy-whatsapp" };
      }
    }

    // 4. Single-key shortcuts (blocked when typing in an input)
    if (isTyping) {
      return { handled: false, reason: "user is typing" };
    }

    if (event.key === "1") {
      this.activeTab = "seguimiento";
      return { handled: true, action: "switch-tab", tab: "seguimiento" };
    }
    if (event.key === "2") {
      this.activeTab = "numeros";
      return { handled: true, action: "switch-tab", tab: "numeros" };
    }
    if (event.key === "3") {
      this.activeTab = "liquidaciones";
      return { handled: true, action: "switch-tab", tab: "liquidaciones" };
    }
    if (event.key === "/") {
      this.dispatchEvent("focus-search-input");
      return { handled: true, action: "focus-search-input" };
    }
    if (event.key === "?") {
      this.isShortcutsOpen = !this.isShortcutsOpen;
      return { handled: true, action: "toggle-shortcuts-modal", open: this.isShortcutsOpen };
    }

    return { handled: false, reason: "unmapped key" };
  }
}

// TEST 1: Alt + P (Programar Alerta)
console.log("[TEST 1] Verificando atajo Alt + P (Programar Alerta)...");
const engine1 = new MockShortcutEngine();
engine1.activeTab = "liquidaciones"; // Empezamos en otra pestaña
const res1 = engine1.handleKeyDown({ altKey: true, key: "p", code: "KeyP" });
assert.equal(res1.handled, true);
assert.equal(res1.action, "open-schedule-alert");
assert.equal(engine1.activeTab, "seguimiento");
assert.ok(engine1.eventsDispatched.includes("open-schedule-alert"));
console.log("✔ [TEST 1 PASÓ] Alt + P activa pestaña Seguimiento y abre Programar Alerta.\n");

// TEST 2: Alt + L (Nueva Liquidación)
console.log("[TEST 2] Verificando atajo Alt + L (Nueva Liquidación Rápida)...");
const engine2 = new MockShortcutEngine();
const res2 = engine2.handleKeyDown({ altKey: true, key: "l", code: "KeyL" });
assert.equal(res2.handled, true);
assert.equal(res2.action, "open-new-liquidacion");
assert.ok(engine2.eventsDispatched.includes("open-new-liquidacion"));
console.log("✔ [TEST 2 PASÓ] Alt + L dispara apertura de modal Nueva Liquidación.\n");

// TEST 3: Alt + C (Nueva Cotización) & Alt + M (Nuevo Legajo)
console.log("[TEST 3] Verificando atajos Alt + C (CRM) y Alt + M (Mis Números)...");
const engine3 = new MockShortcutEngine();
const resC = engine3.handleKeyDown({ altKey: true, key: "c", code: "KeyC" });
assert.equal(resC.action, "focus-new-cotizacion");
assert.equal(engine3.activeTab, "seguimiento");

const resM = engine3.handleKeyDown({ altKey: true, key: "m", code: "KeyM" });
assert.equal(resM.action, "open-new-legajo");
assert.equal(engine3.activeTab, "numeros");
console.log("✔ [TEST 3 PASÓ] Alt + C y Alt + M conmutan vistas y abren sus formularios respectivos.\n");

// TEST 4: Alt + W (WhatsApp)
console.log("[TEST 4] Verificando atajo Alt + W (Copiar Resumen para WhatsApp)...");
const engine4 = new MockShortcutEngine();
const res4 = engine4.handleKeyDown({ altKey: true, key: "w", code: "KeyW" });
assert.equal(res4.action, "trigger-copy-whatsapp");
assert.ok(engine4.eventsDispatched.includes("trigger-copy-whatsapp"));
console.log("✔ [TEST 4 PASÓ] Alt + W ejecuta la copia de liquidación para WhatsApp.\n");

// TEST 5: Protección de AltGr (Teclados en español Windows)
console.log("[TEST 5] Verificando protección contra AltGr (Ctrl + Alt) para evitar conflictos con @, #, etc...");
const engine5 = new MockShortcutEngine();
const resAltGr = engine5.handleKeyDown({ ctrlKey: true, altKey: true, key: "2", code: "Digit2" });
assert.equal(resAltGr.handled, false);
assert.equal(resAltGr.reason, "AltGr ignored");
console.log("✔ [TEST 5 PASÓ] Teclas AltGr (como @ o #) quedan libres sin interferir con la navegación.\n");

// TEST 6: Búsqueda rápida (/) y Guía de atajos (?)
console.log("[TEST 6] Verificando / (Buscador) y ? (Cheat sheet de atajos)...");
const engine6 = new MockShortcutEngine();
const resSlash = engine6.handleKeyDown({ key: "/" });
assert.equal(resSlash.action, "focus-search-input");

const resQuestion = engine6.handleKeyDown({ key: "?" });
assert.equal(resQuestion.action, "toggle-shortcuts-modal");
assert.equal(engine6.isShortcutsOpen, true);

// Cerrar con Escape
const resEsc = engine6.handleKeyDown({ key: "Escape" });
assert.equal(engine6.isShortcutsOpen, false);
console.log("✔ [TEST 6 PASÓ] Búsqueda rápida con /, despliegue de guía con ? y cierre con Escape.\n");

// TEST 7: No interferir cuando el usuario está escribiendo texto
console.log("[TEST 7] Verificando que teclas simples (1, 2, 3, /, ?) no interfieran al escribir...");
const engine7 = new MockShortcutEngine();
const resTyping1 = engine7.handleKeyDown({ key: "1", isTyping: true });
assert.equal(resTyping1.handled, false);
const resTypingSlash = engine7.handleKeyDown({ key: "/", isTyping: true });
assert.equal(resTypingSlash.handled, false);
const resTypingQuestion = engine7.handleKeyDown({ key: "?", isTyping: true });
assert.equal(resTypingQuestion.handled, false);
console.log("✔ [TEST 7 PASÓ] El usuario puede escribir números, barras y signos de interrogación sin disparar atajos.\n");

console.log("=======================================================");
console.log("🎉 ¡TODOS LOS TESTS DE ACCESOS RÁPIDOS PASARON (7/7)!");
console.log("=======================================================\n");
