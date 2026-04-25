# Plan de Rectificación de Ingeniería — Post-Auditoría APEX CMMS

Este documento detalla el **Qué** y el **Cómo** de la rectificación del sistema tras la auditoría técnica de Abril 2026.

---

## 🟢 Fase 1: Blindaje Crítico (Estabilidad Inmediata)

### 1.1 Saneamiento de Tipos (`ToastPayload`)
- **Qué:** Reparar el archivo `src/shared/types/index.ts` truncado.
- **Cómo:** Completar la interfaz añadiendo `title: string; message?: string; }` y cerrar la llave. Revisar que no haya otros tipos truncados en el archivo.

### 1.2 Importación Faltante (`CheckCircle`)
- **Qué:** `AssetSidePanel.tsx` crashea al intentar usar un componente no importado.
- **Cómo:** Añadir `CheckCircle` (o `CheckCircle2`) a la desestructuración de la importación de `'lucide-react'` en la cabecera del archivo.

### 1.3 Firma de `computePlanStatus`
- **Qué:** Colapso por `undefined` cuando no hay plan vinculado.
- **Cómo:** Añadir una guarda defensiva al inicio de la función: `if (!assetPlan) return { isOverdue: false, progress: 0, label: 'Sin Plan' };`.

### 1.4 Captura de `meterValue` en Cierre de OT
- **Qué:** El valor del medidor ingresado por el técnico se pierde.
- **Cómo:** Modificar la acción `completeWo` en el slice para aceptar un objeto `payload` que incluya `meterValue`. Actualizar `WoCompleteForm.tsx` para que pase este valor en la llamada.

---

## 🟡 Fase 2: Lógica de Motores y Mantenimiento

### 2.1 Ajuste de Lead Days (`pmEngine.ts`)
- **Qué:** Generación prematura de OTs por lógica de horizonte invertida.
- **Cómo:** Refactorizar el condicional: La OT debe generarse si `now >= leadDate` O si la fecha de vencimiento es inminente dentro del horizonte de 1-3 días, independientemente del lead exagerado.

### 2.2 Reparación de Proyecciones (`projections.ts`)
- **Qué:** El ciclo 0 (próximo evento real) se salta en la simulación.
- **Cómo:** Ajustar el bucle `while`. La primera iteración debe usar el `currentCycleIndex` actual para proyectar el hito inmediato antes de realizar el primer incremento del contador de simulación.

### 2.3 Soporte `intervalMode` ('fixed' vs 'floating')
- **Qué:** El sistema ignora si el mantenimiento debe recalcularse desde la fecha real o la teórica.
- **Cómo:** En `calcNextDueDate`, añadir un condicional: 
    - `floating`: calcular desde `completedAt`.
    - `fixed`: calcular desde `oldNextDueDate` (teórica).

---

## 🟠 Fase 3: Optimización y Performance

### 3.1 Estrategia de Fetching Eficiente
- **Qué:** Sobrecarga de datos al re-descargar todo el historial en cada toggle.
- **Cómo:** Implementar una actualización optimista (Optimistic UI) en el store de Zustand para el `toggleTask`. Solo realizar el fetch de la fila afectada en lugar de todo el dataset de OTs.

### 3.2 Memoización del Calendario
- **Qué:** Recálculo masivo de proyecciones en cada render.
- **Cómo:** En `PmCalendarView.tsx`, extraer el cálculo de `monthStart` a un `useMemo` con dependencia en `currentDate.getMonth()`. Esto evitará que la referencia del objeto Date cambie en cada render innecesariamente.

---

## 🔴 Fase 4: Integridad de Datos y Schema (DB)

### 4.1 Race Condition en `wo_number`
- **Qué:** Números de OT duplicados en inserciones concurrentes (Scheduler).
- **Cómo:** Sustituir la lógica de `MAX()` en el trigger por un objeto `SEQUENCE` de PostgreSQL o usar un bloqueo consultivo (`pg_try_advisory_lock`) durante la generación del número para serializar las transacciones.

### 4.2 Consistencia `profiles.role`
- **Qué:** Discrepancia entre los roles permitidos en SQL y los tipos de TS.
- **Cómo:** Sincronizar el `UserRole` en TS para que incluya `manager` y actualizar el `CHECK constraint` en la base de datos para aceptar `supervisor` si es necesario, o estandarizar ambos en un solo set.

---

## 🔵 Fase 5: UX y Refinamiento Final

### 5.1 Botón de Pre-configuración en Proyecciones
- **Qué:** El botón en la UI es decorativo.
- **Cómo:** Implementar un `onClick` que redirija al módulo `scheduler` pasando el `assetId` y el `pmPlanId` como parámetros de estado para pre-cargar el formulario de generación de OT.

### 5.2 Restauración de Scroll en Modales
- **Qué:** El body queda bloqueado con `overflow: hidden` si el modal se desmonta abruptamente.
- **Cómo:** En el `useEffect` del componente `Modal`, asegurar que la función de limpieza (`cleanup`) use un `setTimeout` o una validación extra para garantizar que el `overflow: auto` se restaure incluso durante las animaciones de salida de Framer Motion.

---

## Resumen de Prioridades (Matriz de Riesgo)

| Riesgo | Impacto | Acción Recomendada |
| :--- | :--- | :--- |
| **Pérdida de datos** | Crítico | Arreglar `completeWo` y `meterValue` (1.4). |
| **Crasheos de App** | Alto | Reparar imports y tipos (1.1, 1.2, 1.3). |
| **Lógica Errónea** | Medio | Ajustar motores de ciclos y lead days (2.1, 2.2). |

---
*Manual de Rectificación — Última revisión: 24 Abril 2026*
