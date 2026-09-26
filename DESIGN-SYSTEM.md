# Preferentia Travel · UI Design System

**Proyecto**: Preferentia Travel - Tablero Operativo & CRM  
**Perfil de Usuario**: Lautaro Zeppa (Ventas & Operaciones) & Juanjo (Optimización & Control)  
**Estándar de Accesibilidad**: WCAG AA Compliance (4.5:1 ratio de contraste mínimo)  
**Fecha de Publicación**: Septiembre 2026  
**Diseñador Responsable**: UI Designer (Specialist Agent)

---

## 🎨 Design Foundations

### 1. Color System & Semantic Tokens

El sistema cromático está optimizado para interfaces oscuras profesionales de alta densidad operativa (baja fatiga visual durante jornadas continuas y alta legibilidad para operaciones financieras).

#### Brand Primary (Preferentia Sky)
* `--brand-primary`: `#0284c7` (Sky 600 - Acción principal)
* `--brand-primary-hover`: `#0369a1` (Sky 700 - Hover de botones primarios)
* `--brand-light`: `#38bdf8` (Sky 400 - Acentos, bordes activos, foco accesible)
* `--brand-glow`: `rgba(56, 189, 248, 0.25)` (Sombra de elevación sutil)

#### Surface Elevation Hierarchy (Dark Mode Surfaces)
* `--surface-ground`: `#020617` (Slate 950 - Fondo base del canvas)
* `--surface-card`: `rgba(15, 23, 42, 0.85)` (Slate 900 con 85% opacidad y blur)
* `--surface-elevated`: `#1e293b` (Slate 800 - Modales, menús flotantes, inputs activos)
* `--surface-hover`: `rgba(30, 41, 59, 0.88)` (Micro-interacción hover)

#### Semantic Status Tokens (Significado Comercial & Financiero)
| Estado | Token Color | Fondo (12% opacity) | Borde (35% opacity) | Uso en Preferentia |
|---|---|---|---|---|
| **Saldado / Cobrado** | `#10b981` (Emerald 500) | `rgba(16, 185, 129, 0.12)` | `rgba(16, 185, 129, 0.35)` | Cobranza completa (Saldo USD 0.00), ventas cerradas |
| **Pendiente / Con Saldo** | `#f59e0b` (Amber 500) | `rgba(245, 158, 11, 0.12)` | `rgba(245, 158, 11, 0.35)` | Viajes con saldo parcial, propuestas a armar, hoy |
| **Urgente / Vencido** | `#f43f5e` (Rose 500) | `rgba(244, 63, 94, 0.12)` | `rgba(244, 63, 94, 0.35)` | Time-limits aéreos vencidos, alertas críticas |
| **En Curso / Emisión** | `#0ea5e9` (Sky 500) | `rgba(14, 165, 233, 0.12)` | `rgba(14, 165, 233, 0.35)` | Cotizaciones enviadas, emisiones de vuelo |
| **Legajos / Comisiones**| `#818cf8` (Indigo 400) | `rgba(129, 140, 248, 0.12)`| `rgba(129, 140, 248, 0.35)`| Expedientes oficiales de comisión, retención |

---

### 2. Typography System

* **Primary Font**: Geist Sans (`var(--font-geist-sans)`), Fallback: `system-ui, -apple-system, sans-serif`.
* **Monospace / Numerical Font**: Geist Mono (`var(--font-geist-mono)`), Fallback: `ui-monospace, monospace`.
* **Alineación Numérica Tabular**: Todas las celdas, importes contables y porcentajes utilizan `font-variant-numeric: tabular-nums` para garantizar que los importes en dólares y pesos no oscilen visualmente al actualizarse.

#### Escala Tipográfica:
* `xs` (11px - 12px): Metadatos, hotkeys `[1]`, badges de estado, time tags (`18:00 hs`).
* `sm` (13px - 14px): Textos de tablas, nombres de pasajeros, items de servicio, inputs de formulario.
* `base` (15px - 16px): Títulos de tarjetas secundarias, nombres de clientes destacados.
* `lg` (18px): Títulos de paneles, subtotales de liquidación.
* `xl` (20px - 24px): Encabezados de espacios de trabajo, métricas KPI principales.
* `2xl / 3xl` (28px - 36px): Indicador principal de comisiones mensuales y saldos consolidados.

---

### 3. Spacing System & Grid Rhythm

Basado en múltiplos de **4px** con escala armónica:
* `space-1`: 4px (micro-separación de badges e iconos)
* `space-2`: 8px (padding interno de chips, botones compactos)
* `space-3`: 12px (separación entre campos de formulario y tarjetas kanban)
* `space-4`: 16px (padding estándar de tarjetas y contenedores)
* `space-6`: 24px (separación entre columnas del display)
* `space-8`: 32px (margen entre macro-secciones del dashboard)

---

## 🧱 Component Library

### 1. Botones & Acciones Interactivas
* **`.btn-primary`**: Fondo `#0284c7`, texto blanco, sombra con tinte cyan (`shadow-sky-600/25`), efecto `active:scale-[0.98]`.
* **`.btn-secondary`**: Fondo `#1e293b`, borde sutil `#334155`, texto `#e2e8f0`.
* **`.btn-success`**: Fondo `#059669`, para acciones comerciales de éxito (`Cerrar Venta`, `Registrar Cobro`).
* **`.btn-danger`**: Fondo `#e11d48`, reservado para eliminaciones y cancelaciones críticas.
* **`.btn-ghost`**: Fondo transparente con hover `#1e293b`, para micro-acciones (postponer `+1d`, copiar resumen).

### 2. Form Controls & Selectores
* **Inputs & Selectores**: Alto consistente (38px - 42px), radio de 12px (`rounded-xl`), borde Slate 800, fondo Slate 950.
* **Anillo de Foco Accesible**: Al pulsar Tab, el elemento recibe `outline: 2px solid #38bdf8; outline-offset: 2px;` con ratio de contraste WCAG AA.
* **Píldoras Rápidas (Quick Presets)**: Chips de 1 clic para fechas (`Hoy`, `Mañana`, `+3d`, `Próx. Lunes`) y porcentajes impositivos (`18% Gan.`, `6% IIBB`, `50% Split`).

### 3. Cards & Glassmorphism Surfaces
* **Panel Base (`.glass-panel`)**: Fondo oscuro con desenfoque de fondo (`backdrop-filter: blur(14px)`), borde Slate 800 de 1px y sombra de profundidad (`shadow-2xl`).
* **Hover State (`.glass-panel-hover`)**: Elevación de -1.5px en el eje Y y aumento del resplandor del borde a `rgba(56, 189, 248, 0.45)`.

### 4. Feedback & Notificaciones
* **Toast Flotante Unificado**: Renderizado en el vértice inferior derecho (`fixed bottom-6 right-6`), con animación slide-up, icono semántico animado, mensaje conciso y botón de cierre táctil.
* **Barra de Progreso de Cobranza Global**: Indicador de doble capa (fondo Slate 950 con canal de gradiente animado Sky-Indigo-Emerald) para visualizar el porcentaje real cobrado de la cartera.

---

## 📱 Responsive Strategy & Breakpoints

* **Mobile (320px - 639px)**:
  - Navegación colapsable en menú hamburguesa accesible con botón de acción rápida a pantalla completa.
  - Vistas apiladas verticalmente con touch targets mínimos de 44px de alto.
* **Tablet (640px - 1023px)**:
  - Grilla de 2 columnas para propuestas y tarjetas de liquidación.
  - Calendario mensual con celdas compactas optimizadas para toque táctil.
* **Desktop (1024px+)**:
  - Tablero Unificado de 3 columnas para seguimiento comercial (Armar -> Enviadas -> Cerradas).
  - Split-view Master-Detail para liquidaciones: navegación izquierda de fichas + panel derecho de inspección y cobros simultáneo sin recargar la página.
  - Atajos de teclado en vivo (`1`, `2`, `3`) para cambio instantáneo entre pestañas.

---

## ♿ Accessibility & WCAG AA Compliance

1. **Contraste de Color**:
   - Todo el texto estándar supera el ratio mínimo de 4.5:1 frente al fondo Slate 950.
   - Textos de gran tamaño y títulos superan el ratio 3:1.
2. **Navegación por Teclado**:
   - Tabulación secuencial lógica en todos los formularios y modales.
   - Indicador de foco visible de alta visibilidad (`#38bdf8`).
3. **Screen Readers & ARIA**:
   - Atributos `aria-label` en botones de iconos (cierre de modales, eliminar alerta, toggle menú).
   - Roles semánticos `role="status"` y `aria-live="polite"` en alertas y notificaciones toast.
4. **Respeto a Preferencias de Movimiento**:
   - Soporte para `@media (prefers-reduced-motion: reduce)` evitando transiciones bruscas.

---

**Estado de Implementación**: 100% integrado en código fuente Next.js 14, Tailwind CSS y componentes de Preferentia Travel App.
