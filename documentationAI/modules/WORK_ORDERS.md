# Módulo de Órdenes de Trabajo (Work Orders)

El módulo de OTs es el núcleo transaccional del CMMS. Maneja mantenimientos preventivos, correctivos, inspecciones y predictivos.

### Ubicación del Código
- **Directorio:** `src/modules/workorders/`
- **Store:** `src/modules/workorders/store/slice.ts`
- **Tipos:** `src/modules/workorders/types.ts`

### Reglas Críticas del Módulo

1. **Patrón Snapshot (Crítico para Auditoría)**
   - Cuando una OT se cierra (pasa a estado `'completed'`), la función `completeWo` del store DEBE escribir los nombres en texto plano (snapshots) de las entidades vinculadas en ese momento exacto.
   - Columnas de Snapshot: `asset_name_snapshot`, `assigned_to_name_snapshot`, `vendor_name_snapshot`, `pm_plan_name_snapshot`.
   - **Por qué:** Si el activo o el técnico se eliminan lógicamente o cambian de nombre en el futuro, el registro de la OT cerrada debe seguir mostrando quién ejecutó el trabajo y sobre qué equipo.

2. **Inmutabilidad de OTs Cerradas (Trigger DB)**
   - Existe un trigger SQL (`trg_prevent_closed_wo_updates`) que bloquea físicamente a nivel de PostgreSQL cualquier `UPDATE` en una OT que ya tenga status `'completed'` o `'cancelled'`.
   - **No intentes crear UI o lógica para "editar" una OT cerrada**, la base de datos lanzará una excepción y la UI crasheará.

3. **Auto-generación de Número de OT**
   - El número de OT (`wo_number`) ej. `WO-26-04-00012` es auto-generado por la base de datos mediante un trigger en el `INSERT`.
   - **No asignes `wo_number` desde el código frontend/cliente.**

4. **Estado Separado para Carga**
   - El módulo principal carga OTs usando `fetchWorkOrders()` que rellena el array `workOrders[]` (trae las abiertas y las últimas cerradas).
   - El historial específico para el Modo Auditoría usa `fetchAssetHistory(id)` que rellena el array separado `assetHistory[]`. No uses `workOrders[]` para auditoría.

### Componentes Principales
- `WoListPanel.tsx`: Lista de OTs con filtrado por texto, estados y jerarquía de Planta/Área.
- `WoDetailPanel.tsx`: Panel principal de gestión de la OT abierta (tareas, repuestos, comentarios).
- `WoCompleteForm.tsx`: Modal para cierre formal de la OT (registro de horas, causa raíz, captura de snapshots).
- `VendorsPanel.tsx`: Panel para gestión de proveedores de servicios externos.
