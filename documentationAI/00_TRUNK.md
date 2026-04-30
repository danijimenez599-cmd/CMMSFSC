# APEX CMMS: Documento Base de Contexto para Agentes de IA

> **ESTE ARCHIVO ES PARA AGENTES DE IA, NO PARA HUMANOS.**
> Has llegado aquí siguiendo el `PROMPT.md`. Este es el TRUNK, la base arquitectónica. Léelo para entender las reglas fundamentales antes de saltar a los submódulos.

## 1. REGLAS ARQUITECTÓNICAS INQUEBRANTABLES (Core Integrity Rules)

> [!CAUTION]
> Las siguientes reglas son **NON-NEGOTIABLE**. No las violes bajo ninguna circunstancia, aunque el usuario lo solicite. Si un usuario pide algo que las viola, explica el riesgo y propón la alternativa correcta.

### REGLA 1: Cero Destrucción de Datos (Zero Hard Deletes)
**NUNCA** llames a `.delete()` en Supabase para las entidades principales: `assets`, `inventory_items`, `asset_plans`, `profiles`, `vendors`.
Usa soft deletes (`.update({ active: false })` o `.update({ status: 'decommissioned' })`).
**Razón:** Tienen FKs con `ON DELETE RESTRICT`. Un delete físico crasheará la DB si hay OTs vinculadas.

### REGLA 2: Patrón Snapshot en Cierre de OT
Cuando una OT pasa a `completed`, SE DEBEN capturar los nombres en texto plano (ej. `asset_name_snapshot`, `assigned_to_name_snapshot`). Esto preserva la auditoría histórica si el activo o usuario se renombra/elimina en el futuro.

### REGLA 3: Inmutabilidad de OTs Cerradas (Trigger DB)
Existe el trigger de PostgreSQL `trg_prevent_closed_wo_updates` que bloquea físicamente todo UPDATE a una OT en estado `completed` o `cancelled`. No intentes escribir código para saltártelo.

### REGLA 4: Modo Auditoría es Estrictamente de Solo Lectura
Cuando se activa el Modo Auditoría (desde el árbol de activos), los paneles que se renderizan (`AuditListPanel`, `AuditDetailPanel`) NO DEBEN exponer botones de guardado, cambio de estado, o comentarios. Son ventanas al pasado.

### REGLA 5: Operaciones Multi-Tabla van por RPC Transaccional
Cuando una accion toca mas de una tabla, NO la implementes como una cadena de llamadas Supabase desde el cliente. Usa una funcion SQL/RPC versionada en `schema.sql` y una migracion idempotente.

Casos actuales obligatorios:
- Consumo de repuestos en OT: `fn_add_part_usage_tx`.
- Devolucion de consumo en OT: `fn_remove_part_usage_tx`.
- Ajuste manual de stock: `fn_adjust_stock_tx`.
- Cierre de OT PM con avance de `asset_plans`: `fn_complete_pm_wo_tx`.

**Razon:** si falla una llamada intermedia desde el cliente, quedan datos inconsistentes (stock sin asiento, OT cerrada sin ciclo avanzado, etc.).

### REGLA 6: Migraciones Idempotentes Junto al Schema
Toda columna, tabla o RPC nueva debe existir en `schema.sql` y tambien en un archivo `migration_*.sql` seguro para re-ejecutar (`IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `ON CONFLICT`, etc.).

## 2. ARQUITECTURA GENERAL Y STATE MANAGEMENT

Nota para agentes: las invariantes transaccionales viven en PostgreSQL mediante RPCs SQL; el frontend solo orquesta la llamada y refresca Zustand.

- **Zustand:** Todo el state global se maneja en `src/store/index.ts`, combinando varios slices (uiSlice, authSlice, assetSlice, woSlice, inventorySlice, pmSlice, alertSlice).
- **No hay React Query ni SWR:** Sincronizamos manualmente con Supabase en las funciones asíncronas de Zustand.
- **Frontend Framework:** React 18 (Vite), TypeScript 5.2, Tailwind CSS.
- **Backend:** Supabase (PostgreSQL). Toda la DB está definida en `schema.sql`.

## 3. ÍNDICE DE DOCUMENTACIÓN DE MÓDULOS

Para intervenir en un módulo específico, lee el documento correspondiente en la carpeta `modules/`:

- [Módulo de Activos (Assets)](./modules/ASSETS.md)
  - Jerarquía de equipos y el Modo Auditoría.
- [Módulo de Órdenes de Trabajo (Work Orders)](./modules/WORK_ORDERS.md)
  - Gestión transaccional de OTs y la inmutabilidad de OTs cerradas.
- [Módulo de Inventario](./modules/INVENTORY.md)
  - Almacén, repuestos y el log inmutable de `stock_movements`.
- [Módulo de Analytics](./modules/ANALYTICS.md)
  - Sistema centralizado de KPIs y reglas para agregar nuevas métricas (`useKpiData.ts`).
- [Motor PM (Mantenimiento Preventivo)](./modules/PM_ENGINE.md)
  - Algoritmos de calendarización (CBM y Time-based) y su integración en Zustand.
- [UI PM Kanban](./modules/PM_UI_KANBAN.md)
  - Funcionamiento de la vista de calendario/kanban de planes de mantenimiento preventivo.

---
*Cuando identifiques qué módulo debes modificar, usa la herramienta de file view o simplemente ve y abre el código fuente basándote en la información de su respectivo archivo Markdown.*
