# Módulo de Analytics y Reportes

El módulo de Analytics es el dashboard inteligente central del sistema. Calcula todos los KPIs de la operación leyendo datos directamente desde el state global (Zustand) y proporciona visualizaciones interactivas utilizando `recharts`.

### Ubicación del Código
- **Directorio:** `src/modules/analytics/`
- **Hook Central:** `src/modules/analytics/hooks/useKpiData.ts`
- **Componentes Gráficos Base:** `src/modules/analytics/components/ChartComponents.tsx`

### Reglas Críticas del Módulo

1. **Computación Centralizada (El Hook Único)**
   - **TODOS** los cálculos de KPIs y filtrado de datos ocurren dentro del hook `useKpiData.ts` usando `useMemo`.
   - **Bajo ninguna circunstancia** debes calcular métricas dentro de los componentes visuales (como `WoAnalytics.tsx` o `PmCompliance.tsx`).
   - Los componentes de vista solo reciben los datos pre-calculados del hook y los renderizan mediante props o desestructuración.
   - Si un usuario pide una nueva métrica, debes:
     1. Agregar el cálculo en un nuevo bloque `useMemo` dentro de `useKpiData.ts`.
     2. Retornar el valor en el objeto principal del hook.
     3. Consumirlo en el componente visual correspondiente.

2. **Filtros Globales de Jerarquía y Periodo**
   - El módulo tiene un selector de Rango de Fechas (Periodo) y filtros por Planta y Área en la cabecera.
   - Estos valores se pasan como parámetros al hook `useKpiData(period, custom, filterPlant, filterArea)`.
   - El hook se encarga de determinar qué `assetIds` cumplen con los filtros y filtra las `workOrders` y `assetPlans` globalmente antes de computar los KPIs de sección.

3. **Solo Lectura**
   - Este módulo no despacha acciones ni modifica datos. Es puramente de lectura (`select`) sobre el estado ya existente de las entidades.

### Vistas Secundarias (Tabs)
El módulo se divide en dos secciones principales (KPIs y Reportes) e internamente los KPIs tienen sub-vistas:
- `KpiOverview.tsx`: Resumen ejecutivo, medidores de salud (SLA, PM) y tarjetas métricas (MTTR, MTBF, Costo).
- `WoAnalytics.tsx`: Distribución semanal de OTs (Barras apiladas con Drill-Down), rendimiento técnico y OTs vencidas.
- `PmCompliance.tsx`: Gauge de cumplimiento general y estado semaforizado por planes individuales (`ok`, `soon`, `overdue`).
- `CostAnalysis.tsx`: Costo por tipo de mantenimiento y análisis de Pareto (Top Activos por Costo).
- `InventoryKpis.tsx`: Valorización del almacén y alertas de stock bajo el mínimo.
- `ReportsHub.tsx`: (Sección Reportes) Tablas planas exportables filtradas por el contexto.
