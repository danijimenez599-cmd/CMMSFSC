# README.ai.md — APEX CMMS: Documento Base de Contexto para Agentes de IA

> **ESTE ARCHIVO ES PARA AGENTES DE IA, NO PARA HUMANOS.**
> Si eres un agente de IA o LLM que ha recibido acceso a este repositorio, lee este documento completo **antes** de inspeccionar cualquier otro archivo. Contiene las decisiones de diseño críticas y las reglas que gobiernan la integridad del sistema. Ignorar este documento resultará en regresiones de datos irreversibles.

---

## 1. DECLARACIÓN DE PERSONA Y DOMINIO

### Tu Identidad de Trabajo

Cuando operes en este repositorio, debes pensar simultáneamente como dos roles:

1. **Arquitecto de Software Senior** — dominas Zustand, React, TypeScript, Supabase (PostgreSQL), separación de concerns, y patrones de integridad de datos a nivel de motor SQL.
2. **Ingeniero de Mantenimiento y Confiabilidad (CMRP)** — entiendes que los datos de mantenimiento son registros de auditoría legales y financieros. Un error de borrado es como destruir un libro de contabilidad. La historia es sagrada.

### Glosario del Dominio (Business Language)

Usa exactamente este vocabulario al generar código, comentarios y migraciones:

| Término de Negocio | Equivalente en Código | Descripción |
|---|---|---|
| **Activo** | `assets` | Equipo físico industrial. Tiene jerarquía: Planta > Área > Sistema > Equipo > Componente. |
| **Plan Maestro (PM)** | `pm_plans` | Protocolo genérico de mantenimiento (ej. "Inspección Trimestral Motor Trifásico"). NO es equipo-específico. |
| **Vinculación de Plan** | `asset_plans` | Asignación de un `pm_plan` a un `asset` concreto. Tiene su propio contador de ciclo (`current_cycle_index`). |
| **Orden de Trabajo (OT)** | `work_orders` | Evento de mantenimiento ejecutable. Puede ser Preventiva (de un PM plan), Correctiva (falla), o Predictiva (disparo de sensor). |
| **Ciclo PM** | `current_cycle_index` | Número de veces que se ha ejecutado un plan en un activo. Se incrementa al cerrar cada OT preventiva. |
| **Lectura de Medidor** | `meter_readings` | Valor registrado para un `measurement_point`. Puede disparar una OT predictiva si viola umbrales. |
| **Repuesto Consumido** | `part_usages` | Registro de qué ítems del inventario se usaron en una OT. Vincula `work_orders` con `inventory_items`. |
| **Movimiento de Stock** | `stock_movements` | Trazabilidad completa de entradas/salidas del almacén. Tipo: `in`, `out`, `return`, `adjustment`. |
| **Snapshot** | `*_name_snapshot` | Texto plano congelado al cerrar una OT. El nombre del técnico/activo/proveedor en ese momento exacto. |
| **Soft Delete** | `status='decommissioned'` / `active=false` | Desactivación lógica. La entidad deja de aparecer en la UI pero su historial permanece intacto. |

---

## 2. REGLAS ARQUITECTÓNICAS INQUEBRANTABLES (Core Integrity Rules)

> [!CAUTION]
> Las siguientes reglas son **NON-NEGOTIABLE**. No las violes bajo ninguna circunstancia, aunque el usuario lo solicite. Si un usuario pide algo que las viola, explica el riesgo y propón la alternativa correcta dentro de la arquitectura.

### REGLA 1: Cero Destrucción de Datos (Zero Hard Deletes)

**NUNCA** llames a `.delete()` en Supabase para las siguientes entidades:

| Entidad | Alternativa Correcta |
|---|---|
| `assets` | `.update({ status: 'decommissioned' })` |
| `inventory_items` | `.update({ active: false })` |
| `asset_plans` (vínculos PM) | `.update({ active: false })` — se llama `unlinkAssetPlan()` en el store |
| `profiles` | `.update({ active: false })` |
| `vendors` | `.update({ is_active: false })` |

```typescript
// ❌ PROHIBIDO
await supabase.from('assets').delete().eq('id', assetId);

// ✅ CORRECTO
await supabase.from('assets').update({ status: 'decommissioned' }).eq('id', assetId);
```

**Razón:** Activos y repuestos tienen OTs, consumos y movimientos de stock asociados. Su eliminación física rompería `ON DELETE RESTRICT` a nivel de motor, o peor, si el RESTRICT no existe aún, borraría registros financieros e históricos en cascada.

---

### REGLA 2: Integridad Referencial por RESTRICT, no CASCADE

El `schema.sql` implementa `ON DELETE RESTRICT` en las FKs críticas. Esto significa que **la base de datos rechazará físicamente cualquier intento de borrado físico**. No es un error de la app — es una línea de defensa intencional.

```sql
-- Las tres FKs críticas que protegen el historial:
work_orders.asset_id               → REFERENCES assets(id)          ON DELETE RESTRICT
part_usages.inventory_item_id      → REFERENCES inventory_items(id)  ON DELETE RESTRICT
stock_movements.inventory_item_id  → REFERENCES inventory_items(id)  ON DELETE RESTRICT
```

Si recibes un error de Supabase tipo `"violates foreign key constraint"` al intentar eliminar un activo o ítem, **es el comportamiento esperado y correcto**. La solución es el soft delete, no deshabilitar la restricción.

---

### REGLA 3: Patrón Snapshot en Cierre de OT

Cuando una OT se cierra (status → `'completed'`), la función `completeWo` en `src/modules/workorders/store/slice.ts` **debe** escribir los nombres en texto plano en estas columnas:

| Columna SQL | Fuente de Datos |
|---|---|
| `asset_name_snapshot` | `assets.name` del activo vinculado |
| `assigned_to_name_snapshot` | `profiles.full_name` del técnico asignado |
| `vendor_name_snapshot` | `vendors.name` del proveedor externo (si aplica) |
| `pm_plan_name_snapshot` | `pm_plans.name` del plan de PM de origen (si aplica) |

```typescript
// Ejemplo del patrón en completeWo():
const asset = assets.find(a => a.id === currentWo.assetId);
const technician = profiles.find(p => p.id === currentWo.assignedTo);
const vendor = vendors.find(v => v.id === currentWo.vendorId);

await supabase.from('work_orders').update({
  status: 'completed',
  asset_name_snapshot: asset?.name ?? 'Activo Desconocido',
  assigned_to_name_snapshot: technician?.fullName ?? 'Técnico Desconocido',
  vendor_name_snapshot: vendor?.name ?? null,
  // ... resto del payload
});
```

**Razón:** Si el técnico es dado de baja del sistema meses después, el reporte histórico de la OT debe seguir mostrando quién ejecutó el trabajo. Los UUIDs solos no son suficientes para auditoría humana.

---

### REGLA 4: Inmutabilidad de OTs Cerradas (Trigger de Base de Datos)

Existe un trigger de PostgreSQL activo:

```sql
-- trigger: trg_prevent_closed_wo_updates
-- función: prevent_closed_wo_updates()
-- Bloquea cualquier UPDATE en work_orders donde OLD.status IN ('completed', 'cancelled').
-- Lanza EXCEPTION. No hay bypass desde el lado del cliente.
CREATE TRIGGER trg_prevent_closed_wo_updates
BEFORE UPDATE ON public.work_orders
FOR EACH ROW
EXECUTE FUNCTION public.prevent_closed_wo_updates();
```

**Implicación para el código:** Si necesitas mostrar datos de una OT cerrada (ej. el `pmPlanNameSnapshot`), léelos directamente de las columnas `_snapshot`. **No intentes actualizar una OT cerrada bajo ninguna circunstancia**, ni siquiera para "corregir" un dato.

En `WoDetailPanel.tsx`, el display de OTs cerradas prioriza el snapshot:
```typescript
// ✅ CORRECTO: mostrar snapshot para OTs completed/cancelled
const displayPmPlan = wo.status === 'completed'
  ? wo.pmPlanNameSnapshot
  : assetPlans.find(ap => ap.id === wo.assetPlanId)?.name;
```

---

## 3. MAPA DE ESTRUCTURA DEL CÓDIGO

### Árbol de Directorios Relevante

```
apex-cmms/
│
├── schema.sql                  ← FUENTE DE VERDAD del esquema SQL. Archivo único.
├── seed_data.sql               ← Datos de prueba. Incluye jerarquía de activos.
│
└── src/
    ├── App.tsx                 ← Shell principal: sidebar, routing por activeModule, auth guard.
    ├── store/
    │   ├── index.ts            ← Combinación de todos los slices de Zustand en un store unificado.
    │   ├── uiSlice.ts          ← Estado de UI: módulo activo (AppModule), sidebar, toasts.
    │   ├── authSlice.ts        ← Autenticación Supabase, usuario actual, perfiles.
    │   └── alertSlice.ts       ← Alertas CBM en memoria (no persisten en DB).
    │
    └── modules/
        │
        ├── assets/             ← Módulo de Activos
        │   ├── store/slice.ts  ← fetchAssets (soporta includeDecommissioned), saveAsset,
        │   │                      decommissionAsset (soft delete)
        │   ├── types.ts        ← Asset, AssetType, Criticality, AssetStatus
        │   └── components/
        │       ├── AssetTreePanel.tsx      ← Árbol jerárquico + toggle "Modo Archivo"
        │       ├── AssetDetailPanel.tsx    ← Ficha técnica, tabs de datos de ingeniería
        │       └── AssetSidePanel.tsx      ← PM Plans vinculados + botón "Desvincular"
        │
        ├── workorders/         ← Módulo de Órdenes de Trabajo
        │   ├── store/slice.ts  ← completeWo (captura snapshots), updateWoStatus, createWo
        │   ├── types.ts        ← WorkOrder, WoStatus, WoType, WoPriority
        │   └── components/
        │       ├── WoListPanel.tsx         ← Filtro jerárquico por Plant/Area (recursivo)
        │       ├── WoDetailPanel.tsx       ← Muestra pmPlanNameSnapshot para OTs completadas
        │       ├── WoCompleteForm.tsx      ← Formulario de cierre: horas, resolución, costos
        │       └── VendorsPanel.tsx        ← CRUD de proveedores externos
        │
        ├── inventory/          ← Módulo de Inventario
        │   ├── store/slice.ts  ← saveItem, softDeleteItem (.update({active:false})), addMovement
        │   ├── types.ts        ← InventoryItem, StockMovement, PartUsage
        │   └── components/InventoryView.tsx
        │
        ├── pm/                 ← Módulo de Mantenimiento Preventivo
        │   ├── store/
        │   │   ├── slice.ts    ← savePlan, unlinkAssetPlan (soft delete), runPmScheduler,
        │   │   │                  addMeterReading (CBM trigger), projectionMonths,
        │   │   │                  setProjectionMonths (clamp 1-24)
        │   │   └── pmEngine.ts ← Scheduling: calcula nextDueDate, genera WOs
        │   ├── utils/
        │   │   └── projections.ts ← calculateProjections(assetPlan, pmPlan, horizonMonths)
        │   ├── types.ts        ← PmPlan, PmTask, AssetPlan, MeasurementPoint, MeterReading
        │   └── components/
        │       ├── PmCalendarView.tsx          ← Calendario: OTs reales (negro) + ghost (azul)
        │       ├── PmSchedulerPanel.tsx         ← Motor de generación manual
        │       ├── PmSettingsView.tsx           ← Tabs: Magnitudes, Proveedores, Motor PM
        │       └── MeasurementPointsPanel.tsx   ← Instrumentos CBM; empty state si catálogo vacío
        │
        ├── dashboard/          ← KPIs y métricas agregadas (solo lectura)
        ├── settings/           ← Wrapper de PmSettingsView
        └── help/               ← PURAMENTE PRESENTACIONAL. Sin store. Sin Supabase.
            └── HelpView.tsx    ← Trainer interactivo de 7 módulos para usuarios finales
```

### Arquitectura del State Management (Zustand)

```
useStore() → StoreState = UiSlice & AuthSlice & AssetSlice & WoSlice & InventorySlice & PmSlice & AlertSlice
```

- Cada módulo tiene su `slice.ts` con interfaz tipada y función creadora.
- Se combinan en `src/store/index.ts`.
- **No existe React Query ni SWR.** Todo el estado del servidor reside en Zustand y se sincroniza manualmente con Supabase en los métodos del slice.

---

## 4. GUÍA DE INTERVENCIÓN (Modification Playbook)

Antes de escribir código, localiza tu tarea en esta tabla.

| Si el usuario pide... | Archivos a tocar | Riesgo a verificar |
|---|---|---|
| **Filtro UI en lista de OTs** | `WoListPanel.tsx` (estado local + `useMemo`) | Que el filtro no borre datos, solo filtre el array en memoria |
| **Nuevo campo en una OT** | `schema.sql` + `workorders/types.ts` + `WoCompleteForm.tsx` + payload `.update()` en `slice.ts` | El campo no puede modificarse si la OT está `completed`/`cancelled` (trigger) |
| **Nuevo campo en Activos** | `schema.sql` + `assets/types.ts` + `AssetDetailPanel.tsx` + `saveAsset()` | Que `fetchAssets` incluya el campo en el SELECT |
| **Eliminar un vínculo PM** | `unlinkAssetPlan(id)` → `.update({ active: false })` | NUNCA `.delete()` en `asset_plans` |
| **Eliminar un activo** | `.update({ status: 'decommissioned' })` | RESTRICT bloqueará el DELETE si tiene OTs |
| **Eliminar un repuesto** | `.update({ active: false })` | RESTRICT bloqueará el DELETE si tiene `part_usages` |
| **Agregar tabla SQL** | `schema.sql` (append al final, no DROP/CREATE en prod) | FKs hacia entidades con historial deben ser RESTRICT |
| **Modificar el scheduler** | `pm/store/pmEngine.ts` + `slice.ts` (`runPmScheduler`) | OT generada debe incluir `scheduled_date` y `due_date` |
| **Modificar proyecciones** | `pm/utils/projections.ts` + `PmCalendarView.tsx` | `projectionMonths` debe venir del store, nunca hardcodeado |
| **Agregar disparo CBM** | `addMeterReading()` en `pm/store/slice.ts` (bloque CBM LOGIC) | OT predictiva debe tener `due_date` = hoy + 3 días (SLA) |
| **Modificar el cierre de OT** | `completeWo()` en `workorders/store/slice.ts` | Los 4 campos `*_name_snapshot` se escriben ANTES del update de status |
| **Agregar módulo de navegación** | `AppModule` en `shared/types/index.ts` + `App.tsx` | Módulos presentacionales NO deben importar `useStore` |
| **Resetear el schema** | `schema.sql` completo en SQL Editor (solo DEV) | En producción: migraciones incrementales. NUNCA `DROP SCHEMA` |

---

## 5. PATRONES DE CÓDIGO ESTABLECIDOS

### Patrón A: Soft Delete de Asset Plan

```typescript
unlinkAssetPlan: async (assetPlanId: string) => {
  const { error } = await supabase
    .from('asset_plans')
    .update({ active: false })
    .eq('id', assetPlanId);
  if (error) throw error;
  set(state => ({
    assetPlans: state.assetPlans.map(ap =>
      ap.id === assetPlanId ? { ...ap, active: false } : ap
    ),
  }));
},
```

### Patrón B: Fetch Condicional con Archivados

```typescript
fetchAssets: async (includeDecommissioned = false) => {
  let query = supabase.from('assets').select('*');
  if (!includeDecommissioned) {
    query = query.neq('status', 'decommissioned');
  }
  const { data, error } = await query;
  // ...
},
```

### Patrón C: Filtro Jerárquico Recursivo

```typescript
const getDescendantIds = (nodeId: string, assets: Asset[]): string[] => {
  const children = assets.filter(
    a => a.parentId === nodeId || a.locationId === nodeId
  );
  return [nodeId, ...children.flatMap(c => getDescendantIds(c.id, assets))];
};
```

### Patrón D: OT Predictiva con SLA de Fecha (CBM)

```typescript
const dueDate = new Date(now);
dueDate.setDate(dueDate.getDate() + 3); // SLA: 3 días por defecto

await supabase.from('work_orders').insert({
  scheduled_date: new Date(now).toISOString().split('T')[0],
  due_date: dueDate.toISOString().split('T')[0],
  wo_type: 'predictive',
  source_point_id: point.id,
  status: 'open',
  asset_name_snapshot: asset?.name ?? 'Activo Desconocido',
});
```

---

## 6. ANTI-PATRONES PROHIBIDOS

> [!WARNING]
> Si encuentras cualquiera de estos patrones en el codebase, es un bug de integridad que debe corregirse antes de continuar.

| Anti-patrón | Por qué es un error |
|---|---|
| `supabase.from('assets').delete()` | Rompe RESTRICT, destruye historial de OTs |
| `supabase.from('inventory_items').delete()` | Rompe RESTRICT, destruye historial de consumos |
| `.update({ status: 'completed' })` sin snapshots | Los reportes históricos perderán contexto cuando las entidades padre se desactiven |
| `.update(...)` sobre OT con `status = 'completed'` | El trigger `trg_prevent_closed_wo_updates` lo rechazará con EXCEPTION |
| `calculateProjections(ap, plan, 24)` hardcodeado | Ignora la configuración global `projectionMonths` del usuario |
| `ON DELETE CASCADE` hacia `work_orders` o `part_usages` | Destruiría el historial completo al borrar un activo o repuesto |
| `import { useStore }` en `help/HelpView.tsx` | El módulo de ayuda debe permanecer sin lógica de datos |

> [!NOTE]
> El trigger `trg_assign_wo_number` auto-genera el campo `wo_number` en formato `WO-YY-MM-XXXXX`. **No asignes `wo_number` desde el cliente.** Déjalo fuera del INSERT; el trigger lo completará automáticamente.

---

## 7. ENTORNO Y DEPENDENCIAS

| Tecnología | Notas |
|---|---|
| **React 18** | JSX, functional components, hooks |
| **TypeScript** | Strict mode activo |
| **Zustand** | Store unificado. Slices combinados en `store/index.ts`. |
| **Supabase JS v2** | Cliente singleton en `src/lib/supabase.ts` |
| **PostgreSQL** | Supabase managed. Triggers activos en producción. |
| **Framer Motion** | Animaciones UI. No usar en efectos secundarios de datos. |
| **date-fns** | Toda manipulación de fechas. Locale `es`. |
| **Recharts** | Gráficas en Instrumentación y Dashboard. |
| **Lucide React** | Iconografía exclusiva del proyecto. |
| **Vite** | Build tool. Dev: `npm run dev`. |

---

*Documento generado para uso de agentes de IA. Arquitectura: Soft Deletes + Snapshots + RESTRICT FKs + Trigger de Inmutabilidad. Última actualización: Abril 2026.*
