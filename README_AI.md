# APEX CMMS — Manual Técnico y Arquitectónico para IA

Este documento es la referencia definitiva para entender la arquitectura, los motores de cálculo y los estándares de desarrollo de APEX CMMS. Su objetivo es proporcionar un contexto profundo sin necesidad de realizar un escaneo completo de la base de código.

---

## 1. Visión General del Sistema
APEX CMMS es una plataforma de gestión de mantenimiento industrial diseñada para entornos de alta complejidad. A diferencia de un CMMS genérico, APEX utiliza un **Motor de Proyecciones de Ingeniería** que simula el ciclo de vida de los activos para predecir intervenciones antes de que se conviertan en Órdenes de Trabajo reales.

---

## 2. Arquitectura de Módulos (Separation of Concerns)

El proyecto se divide en módulos funcionales localizados en `src/modules/`:

### A. Módulo de Activos (`src/modules/assets/`)
- **Gestión de Jerarquías:** Maneja la relación padre-hijo de los activos (Sistemas > Equipos > Componentes).
- **Inteligencia de Activo:** Centralizada en `AssetSidePanel.tsx`. Este es el punto de control donde el usuario ve el historial, el estado actual y las proyecciones.
- **Puntos de Medición:** Gestión de medidores vinculados a activos.

### B. Módulo de Mantenimiento Preventivo (PM) (`src/modules/pm/`)
- **Planes Maestros (`pm_plans`)**: Definiciones genéricas de "Cómo" se mantiene un equipo.
- **Planes de Activo (`asset_plans`)**: La instancia específica de un plan aplicada a un equipo real.
- **Motores de Cálculo:** Ubicados en `store/pmEngine.ts` y `utils/projections.ts`.

### C. Módulo de Órdenes de Trabajo (`src/modules/workorders/`)
- **Ciclo de Vida:** `open` -> `in_progress` -> `completed` / `cancelled`.
- **Tareas:** Listados técnicos que deben completarse. Se generan dinámicamente según el ciclo del plan.

---

## 3. Lógica Profunda de los Motores

### A. El Motor de Programación (`pmEngine.ts`)
Es el proceso que transforma un "Plan" en una "OT Real".

1.  **Cálculo de Próxima Fecha (`calcNextDueDate`)**:
    - Si el plan es por calendario, suma el intervalo (días/meses/años) a la `lastCompletedAt` o `nextDueDate` anterior.
    - Maneja el concepto de `leadDays`: si un plan vence en 10 días pero tiene 5 días de "lead", la OT se generará hoy para dar tiempo de preparación.

2.  **Cálculo de Tareas por Multiplicador de Ciclo**:
    - **Concepto Crítico:** No todos los mantenimientos son iguales. El `currentCycleIndex` del `asset_plan` determina qué tareas se incluyen.
    - **Fórmula:** `Include Task IF (currentCycleIndex % task.frequencyMultiplier == 0)`.
    - *Ejemplo:* En el Ciclo 4, se incluirán las tareas de frecuencia 1, 2 y 4. Esto permite manejar mantenimientos Mayores/Overhauls de forma automática.

3.  **Lógica de Medidores (Meter Triggers)**:
    - Compara `measurementPoints.currentValue` contra `asset_plan.nextDueMeter`.
    - Si el valor actual >= umbral, el motor dispara la generación de la OT.

### B. El Motor de Proyecciones (`projections.ts`)
Simula el futuro sin persistir datos en la base de datos.

1.  **Algoritmo de Simulación:**
    - Toma el estado actual del `asset_plan`.
    - Itera N meses hacia el futuro (por defecto 24).
    - En cada iteración, "finge" que la fecha de vencimiento ha pasado e incrementa virtualmente el `cycleIndex`.
    - Genera una lista de "Hitos Proyectados" con su respectivo listado de tareas simuladas.

2.  **Filtro de Colisión:**
    - En la UI (`PmCalendarView.tsx`), las proyecciones se filtran contra las OTs reales. Si ya existe una OT real para una fecha similar, la proyección se oculta para evitar redundancia.

---

## 4. Gestión de Estado (Zustand)

El store central en `src/store/index.ts` actúa como el bus de datos del sistema.

- **Persistencia de Acción:** Al completar una OT, el store debe actualizar simultáneamente:
    - El estado de la OT (`status: 'completed'`).
    - El `asset_plan` vinculado (`currentCycleIndex++`, `nextDueDate = calcNext()`).
- **Reactividad:** Los componentes como el Calendario reaccionan automáticamente a estos cambios de estado, recalculando las proyecciones al vuelo.

---

## 5. Estándares de Diseño y UI (The Premium Standard)

APEX CMMS sigue un estándar estético de alta gama diseñado para ingenieros senior.

### A. Paleta de Colores y Significado
- **Pizarra/Slate (#0f172a):** Autoridad, Ejecución Real, Órdenes de Trabajo.
- **Brand/Naranja (#f97316):** Alertas, Criticidad, Marca.
- **Índigo (#6366f1):** Ingeniería, Proyecciones, Futuro, Análisis.
- **Esmeralda (#10b981):** Éxito, Completado, Historial.

### B. Resiliencia de UI (Anti-Crash Patterns)
Debido a la volatilidad de los cálculos de fechas, se aplican estas reglas:
1.  **Safe Date Parsing:** Siempre usar `parseISO` y validar con `isValid` de `date-fns`.
2.  **Try/Catch en Mapeos:** Cualquier `.map()` que involucre lógica calculada (como `activePMs`) DEBE estar envuelto en un bloque de seguridad.
3.  **Default Values:** Nunca confiar en que un ID o una Fecha existan. Proporcionar fallbacks (`|| 'S/T'`, `|| new Date()`).

### C. Componentes de UI Clave
- **`Badge`**: Usa variantes semánticas (`danger`, `warn`, `ok`, `brand`, `info`).
- **`AssetSidePanel`**: El componente más complejo. Usa `AnimatePresence` para transiciones de pestañas.
- **`PmCalendarView`**: Implementa scroll interno para evitar desbordes de página. Usa una barra lateral segmentada en Operación e Ingeniería.

---

## 6. Flujo de Datos SQL (`schema.sql`)

Relaciones críticas que la IA debe respetar:
- `asset_plans.pm_plan_id` -> `pm_plans.id` (Estrategia).
- `asset_plans.asset_id` -> `assets.id` (Ubicación).
- `work_orders.asset_plan_id` -> `asset_plans.id` (Origen).
- `pm_tasks.pm_plan_id` -> `pm_plans.id` (Alcance).

---

## 7. Guía de Desarrollo para la IA (Rules of Engagement)

1.  **No Atajos en Fechas:** Nunca uses `new Date(string)` directamente; usa las utilidades de `date-fns`.
2.  **Mantén la Estética:** Si creas un componente nuevo, usa bordes redondeados amplios (`rounded-[24px]`), sombras suaves (`shadow-xl shadow-slate-200`) y tipografía con espaciado tracking-widest para etiquetas.
3.  **Documenta los Motores:** Si modificas la lógica en `pmEngine.ts`, actualiza este README.
4.  **Diferencia Ejecución de Proyección:** Nunca mezcles visualmente una OT (real) con una Proyección (simulada). La proyección debe ser siempre visualmente más ligera o estilísticamente distinta (índigo, bordes punteados).

---

## 8. Glosario de Términos
- **Hito Mayor:** Un mantenimiento que ocurre con poca frecuencia (ej: cada 4 ciclos) e involucra tareas pesadas.
- **Proyección Fantasma:** Un evento de calendario que no existe en la DB, generado puramente por lógica de simulación.
- **Lead Days:** Tiempo de amortiguación para preparar materiales antes de un mantenimiento.
- **Hybrid Trigger:** Un plan que se dispara tanto por fecha como por lectura de medidor (lo que ocurra primero).

---
*Fin del Manual Técnico — Última actualización: Abril 2026*
