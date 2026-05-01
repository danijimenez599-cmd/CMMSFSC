# APEX CMMS — UI & Kanban Reference

Este documento describe la lógica de visualización y el comportamiento de la interfaz de usuario para el módulo de Mantenimiento Preventivo (PM), específicamente enfocado en la vista **Agenda Kanban** (`PmKanbanView.tsx`).

---

## 1. KANBAN Y PROYECCIONES DE FECHAS (UI)

### Paleta Operativa VersaMaint
- **PREV / Preventiva:** `#2563EB`. OTs planificadas: preventivo, predictivo e inspeccion.
- **CORREC / Correctiva:** `#D97706`. OTs reactivas o creadas manualmente por falla.
- **PLAN / Proyeccion:** `#7C3AED`. Proyecciones futuras no materializadas como OT.
- **Completada:** `#15803D`. Trabajo cerrado exitosamente.
- **Vencida:** `#DC2626`. Sobrescribe cualquier tipo cuando `date < hoy`.
- **En espera / cancelada:** `#64748B`. Estado operativo pausado o terminal no exitoso.

Las variantes de fondo y borde viven como tokens CSS en `src/index.css`: `--color-work-*-bg`, `--color-work-*-border`, `--color-status-*-bg` y `--color-status-*-border`.

La vista principal de gestión operativa de Mantenimientos Preventivos es la **Agenda Kanban**. Esta interfaz unifica las Órdenes de Trabajo (OTs) activas y las proyecciones futuras (simulaciones de lo que el PM Engine generará) en un solo flujo cronológico interactivo.

### Filosofía Visual
- **Tarjetas Azules (PREV):** Órdenes de Trabajo generadas automáticamente por el motor (Preventivo, Predictivo, Inspección). Todo se agrupa visualmente como "PREV" para evitar confusión, ya que todas comparten la naturaleza de ser planificadas.
- **Tarjetas Ámbar (CORREC):** Órdenes creadas manualmente de naturaleza correctiva o reactiva (fallos, roturas inesperadas).
- **Tarjetas Verdes (Cerradas):** Órdenes que han sido completadas exitosamente.
- **Tarjetas Violáceas (PLAN):** Proyecciones a futuro calculadas en tiempo real. Son "fantasmas", lo que significa que no existen en la base de datos como Órdenes de Trabajo activas todavía, pero se muestran para propósitos de planificación de recursos.
- **Elementos Rojos (VENCIDA):** Cualquier tarjeta cuya fecha de vencimiento haya pasado (`date < hoy`). Estas reciben máxima prioridad visual, sobreescribiendo el color base de la tarjeta (por ejemplo, una OT preventiva azul se vuelve roja si expira).

---

## 2. Proyección de Fechas para Planes por Medidor

El motor PM (`pmEngine.ts`) exporta una función `calculateProjections` que la UI utiliza para generar las tarjetas "PLAN".
Para los mantenimientos basados estrictamente en medidor (donde no hay una fecha de calendario definida por el plan, solo horas o ciclos), el sistema proyecta en qué momento del tiempo se alcanzará la próxima lectura objetivo usando un algoritmo de tendencia:

1. **Historial de Consumo:** Se analizan los registros históricos de lecturas del medidor asociado al activo.
2. **Tasa Diaria:** Se calcula un promedio de consumo diario (ej. horas consumidas por día a partir de la tasa de incremento).
3. **Días Restantes:** Se calcula la brecha entre la meta (siguiente lectura a alcanzar) y la lectura actual. Esta brecha se divide entre la tasa diaria calculada en el paso anterior.
4. **Fecha Estimada (`projectedDate`):** Se suman esos "días restantes" a la fecha actual para ubicar la proyección en el espacio del calendario (ej. `~24 Abr`).

Si el activo es muy nuevo y carece de lecturas históricas (tasa de uso no determinable), el sistema muestra la meta del medidor sin una fecha de calendario proyectada en la tarjeta (ej. `≥ 5,000 h`).

---

## 3. Filtrado y Ordenamiento Cronológico

En el Kanban, el filtro de fechas principal en el panel superior (ej. Rango de Fechas) funciona de la siguiente manera:

- **Órdenes de Trabajo:** Utilizan su `dueDate` (fecha de vencimiento).
- **Proyecciones de Calendario/Híbridas:** Utilizan su `date` programada.
- **Proyecciones Estrictas de Medidor:** Utilizan su **`projectedDate`** calculado a partir de la regresión de consumo histórico.

Esto permite visualizar el mantenimiento predictivo integrado sin problemas en un horizonte de tiempo cronológico junto con el mantenimiento preventivo estándar, respondiendo a los mismos filtros de rango de fecha.
Las proyecciones puramente por medidor que no tengan historial suficiente para tener una `projectedDate` se muestran siempre ignorando el filtro de fechas (ya que su aparición no puede garantizarse dentro de una ventana temporal).
