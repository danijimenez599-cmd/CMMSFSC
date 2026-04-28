# Módulo de Activos (Assets)

El módulo de activos maneja la jerarquía de equipos industriales de la planta.
Los activos forman un árbol recursivo: Planta > Área > Sistema > Equipo > Componente.

### Ubicación del Código
- **Directorio:** `src/modules/assets/`
- **Store:** `src/modules/assets/store/slice.ts`
- **Tipos:** `src/modules/assets/types.ts`

### Reglas Críticas del Módulo

1. **Cero Hard Deletes (RESTRICT)**
   - NUNCA se borra un activo físicamente. Si se hace un delete en UI, se debe llamar a `.update({ status: 'decommissioned' })`.
   - Si se intenta borrar físicamente, la base de datos lanzará un error de Foreign Key Constraint (RESTRICT) debido a OTs o historiales asociados.

2. **Modo Auditoría (Audit Mode)**
   - El árbol de activos tiene un "Modo Auditoría de Historial".
   - Cuando se activa, el UI pasa de los paneles de edición (`AssetDetailPanel`, `AssetSidePanel`) a paneles de solo lectura (`AuditListPanel`, `AuditDetailPanel`).
   - El Store usa un estado separado para el historial de OTs (`assetHistory[]` poblado mediante `fetchAssetHistory`) para no mezclar con las OTs activas del módulo de Work Orders.
   - **Bajo ninguna circunstancia** se deben exponer acciones de escritura (cerrar OT, cambiar estado, etc.) en los paneles de Auditoría. Son 100% solo lectura.
   - Siempre llama a `selectWo(null)` en el store antes de cargar un nuevo activo en modo auditoría para evitar data bleeding visual.

3. **Inclusión de Activos Retirados**
   - El fetch principal `fetchAssets(includeDecommissioned)` acepta un booleano. Por defecto es falso. Si es verdadero, trae también los que tienen `status: 'decommissioned'`.

### Componentes Principales
- `AssetTreePanel.tsx`: Árbol jerárquico recursivo interactivo. Contiene el toggle del Modo Auditoría.
- `AssetDetailPanel.tsx`: Ficha técnica de edición.
- `AssetSidePanel.tsx`: Lista de planes PM vinculados (`asset_plans`).
- `AuditListPanel.tsx` / `AuditDetailPanel.tsx`: Componentes para inspeccionar el historial (solo lectura).
