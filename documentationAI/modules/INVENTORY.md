# Módulo de Inventario (Inventory)

El módulo de inventario gestiona los repuestos (Stock), costos unitarios, niveles mínimos, y los movimientos transaccionales de almacén (entradas, salidas, ajustes).

### Ubicación del Código
- **Directorio:** `src/modules/inventory/`
- **Store:** `src/modules/inventory/store/slice.ts`
- **Tipos:** `src/modules/inventory/types.ts`

### Reglas Críticas del Módulo

1. **Cero Hard Deletes (RESTRICT)**
   - NUNCA llamar a `.delete()` sobre la tabla `inventory_items`.
   - Si un repuesto se descontinúa, usa la función `softDeleteItem` del store, que hace un `.update({ active: false })`.
   - La base de datos tiene FKs de tipo `RESTRICT` desde `part_usages` (consumos en OTs) y `stock_movements`. Intentar un hard delete crasheará la app.

2. **Movimientos de Stock Transaccionales**
   - El stock no se debe modificar "mágicamente" actualizando el número directamente desde cualquier lado.
   - Cualquier cambio en la cantidad de un ítem DEBE registrar un asiento en la tabla `stock_movements`.
   - Tipos de movimiento: `in` (compra/ingreso), `out` (salida/consumo), `return` (devolución), `adjustment` (conteo físico/corrección).
   - El consumo de piezas dentro de una OT (`addPartUsage` en `workorders/slice.ts`) invoca internamente a `adjustStock` con tipo `out`.

3. **RPCs Obligatorias para Stock**
   - `adjustStock` debe llamar a `fn_adjust_stock_tx`; no debe actualizar `inventory_items` y luego insertar `stock_movements` desde el cliente.
   - `fn_adjust_stock_tx` bloquea sobreconsumo: si `type='out'` y no hay stock suficiente, lanza error. No uses `Math.max(0, stock - qty)` porque oculta faltantes.
   - `addPartUsage` en Work Orders debe usar `fn_add_part_usage_tx`.
   - `removePartUsage` en Work Orders debe usar `fn_remove_part_usage_tx`.
   - `fn_add_part_usage_tx` y `fn_remove_part_usage_tx` modifican `part_usages`, `inventory_items.stock_current` y `stock_movements` en una sola transaccion.

4. **Migracion de Contratos de Inventario**
   - Las RPCs viven en `schema.sql`.
   - La migracion idempotente asociada es `migration_inventory_transactions.sql`.
   - Si cambias la firma de una RPC, actualiza `schema.sql`, la migracion y los sitios que llaman `supabase.rpc(...)`.

### Componentes Principales
- `InventoryTable.tsx`: Tabla principal con buscador y KPIs visuales (advertencia si el stock actual < stock min).
- `InventoryItemForm.tsx`: Modal para crear/editar ítems del catálogo.
- `InventoryDetailPanel.tsx`: Panel que muestra la ficha técnica del repuesto y la lista en tiempo real de sus `stock_movements`.
- `StockAdjustForm.tsx`: Modal para registrar entradas, salidas manuales o ajustes de inventario con motivo obligatorio.
