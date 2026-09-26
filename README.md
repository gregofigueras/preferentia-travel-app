# Preferentia Travel · Sistema Operativo de Liquidaciones & CRM

Aplicación web desarrollada a medida para **Lautaro Zeppa**, vendedor y gestor de viajes en **Preferentia Travel**, diseñada para reemplazar y modernizar su flujo operativo en Excel.

---

## 🚀 Características Principales

### 1. 📊 Dashboard Centralizado (Cabina de Control)
- **Métricas Financieras en Tiempo Real:** Total facturado en USD, total cobrado y saldo total pendiente de cobro.
- **Widget "HOY SI O SI":** Tareas operativas y urgencias del día (reprogramaciones, consultas de aerolíneas, entregas).
- **Control de Cobranzas Prioritarias:** Acceso directo a pasajeros con saldo pendiente.
- **Directorio Rápido:** Búsqueda instantánea entre las 66 liquidaciones activas importadas de su Excel.

### 2. 🧾 Módulo de Liquidaciones & Ficha de Pasajeros (`/liquidaciones`)
- **66 Fichas de Viaje Reales Importadas:** Incluyendo viajes grupales (Demicheli, Pico Elias, Grupo Iridoy) e individuales (Europa 2026, Punta Cana, Maceio, etc.).
- **Desglose Detallado de Servicios:** Vuelos, hoteles, traslados, seguros de viaje (Coris/Assist Card), autos y excursiones.
- **Registro de Cobros Multidivisa:** Cobros en USD o en ARS con conversión automática por Tipo de Cambio (`TC`).
- **Estado de Pago en Vivo:** Cálculo dinámico de saldo pendiente (`SALDADO` vs. `EN COBRO`).
- **Exportación para Pasajeros:**
  - 📋 **1-Click "Copiar para WhatsApp":** Genera un mensaje formateado con emojis, desglose de servicios y saldo listo para enviar al cliente.
  - 🖨️ **Impresión / PDF:** Formato limpio y profesional con marca de Preferentia Travel.

### 3. 📌 Pipeline de Cotizaciones CRM (`/crm`)
- Tablero Kanban interactivo con 3 columnas clave:
  1. **A Cotizar / Armar:** Cotizaciones pendientes solicitadas por clientes.
  2. **Enviadas & Seguimiento:** Propuestas enviadas que requieren seguimiento.
  3. **Cerradas / En Operación:** Ventas concretadas (+280 cierres históricos).
- **Conversión Directa:** Botón para crear una liquidación a partir de una cotización sin reescribir datos.

### 4. 🧮 Legajos & Comisiones Mensuales (`/legajos`)
- Historial de **+380 legajos oficiales** (`LEG XXXXX`) clasificados por mes de cierre (Enero a Diciembre).
- **Calculadora Inteligente de Comisiones:**
  - Reemplaza las fórmulas manuales de Excel tipo `=(Utilidad*0.82)*50%` o `*(1-0.06)*30%`.
  - Permite configurar retenciones (18% retención, 6% IIBB o 0%) y porcentaje de comisión (50%, 30%, 35%, 25%).

---

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Iconografía:** Lucide React
- **Persistencia:** LocalStorage persistente con carga de datos iniciales en JSON (`/data/initialData.json`).

---

## 💻 Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd preferentia-travel-app

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ☁️ Deploy en Vercel

1. Sube este repositorio a tu cuenta de **GitHub** (`gregofigueras`).
2. Entra a [Vercel](https://vercel.com/) y selecciona **"Add New Project"**.
3. Importa el repositorio `preferentia-travel-app`.
4. El framework se detectará automáticamente como **Next.js**. Haz clic en **Deploy**.
5. ¡Listo! Vercel te dará una URL pública tipo `https://preferentia-travel-app.vercel.app` para compartirle a Lautaro.
