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

5. **Cierre PM Atomico**
   - Si una OT tiene `assetPlanId`, `completeWo` NO debe cerrar la OT con `work_orders.update()` y luego recalcular el plan por separado.
   - Debe calcular `nextDueDate`, `nextDueMeter`, `currentCycleIndex` y llamar a la RPC `fn_complete_pm_wo_tx`.
   - `fn_complete_pm_wo_tx` cierra la OT, escribe snapshots, actualiza `asset_plans`, y opcionalmente inserta `meter_readings` en una sola transaccion.
   - Despues de la RPC se refrescan `fetchWorkOrders()` y `fetchPmData()`, y recien entonces se puede ejecutar `runPmScheduler(...)` para catch-up/auto-trigger.

6. **Snapshot de Medidor al Cierre**
   - `completed_meter_value` existe en `work_orders` y se expone como `completedMeterValue`.
   - Es el horometro real capturado al cierre; no lo recalcules desde el plan despues.
   - Migracion asociada: `migration_completed_meter_value.sql`.

7. **Consumo de Repuestos en OT**
   - `addPartUsage` debe usar `fn_add_part_usage_tx`; no insertar directo en `part_usages` ni llamar `adjustStock` despues.
   - `removePartUsage` debe usar `fn_remove_part_usage_tx`; no borrar directo en `part_usages`.
   - Las RPCs actualizan stock y escriben `stock_movements` atomicamente.

8. **Proveedores son Soft Delete**
   - `deleteVendor(id)` desactiva con `vendors.is_active=false`.
   - Los fetch operativos (`fetchWorkOrders`, `fetchVendors`) cargan solo proveedores activos.
   - Nunca uses `.delete()` sobre `vendors`.

9. **No Reabrir OTs Cerradas**
   - La UI no debe ofrecer "reabrir" OTs `completed` o `cancelled`.
   - El trigger `trg_prevent_closed_wo_updates` bloqueara cualquier UPDATE posterior a una OT cerrada.

### Componentes Principales
Nota para agentes: debajo de estos componentes hay contratos DB que tambien deben mantenerse en `schema.sql` y migraciones.
RPCs/migraciones relacionadas: `fn_complete_pm_wo_tx` (`migration_complete_pm_wo_tx.sql`), `fn_add_part_usage_tx` y `fn_remove_part_usage_tx` (`migration_inventory_transactions.sql`), `completed_meter_value` (`migration_completed_meter_value.sql`).

- `WoListPanel.tsx`: Lista de OTs con filtrado por texto, estados y jerarquía de Planta/Área.
- `WoDetailPanel.tsx`: Panel principal de gestión de la OT abierta (tareas, repuestos, comentarios).
- `WoCompleteForm.tsx`: Modal para cierre formal de la OT (registro de horas, causa raíz, captura de snapshots).
- `VendorsPanel.tsx`: Panel para gestión de proveedores de servicios externos.
