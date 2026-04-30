# Módulo de Analytics y Reportes

El módulo de Analytics es el dashboard inteligente central del sistema. Calcula todos los KPIs de la operación leyendo datos directamente desde el state global (Zustand) y los expone a través de un **Contexto de React** compartido por todas las sub-vistas. Utiliza `recharts` para las visualizaciones.

---

## 1. Estructura de Archivos

```
src/modules/analytics/
├── index.tsx                    ← Punto de entrada: cabecera, filtros globales, KpiProvider
├── KpiContext.tsx               ← Context de React que ejecuta useKpiData UNA sola vez
├── KpiOverview.tsx              ← Resumen ejecutivo: gauges + 12 tarjetas KPI
├── WoAnalytics.tsx              ← OTs por semana, backlog, técnicos, vencidas
├── PmCompliance.tsx             ← Gauge y tabla de estado de planes PM
├── CostAnalysis.tsx             ← Costo total, desglose servicios/repuestos, Pareto
├── InventoryKpis.tsx            ← Valorización y alertas de stock crítico
├── constants.ts                 ← Colores y etiquetas compartidos (WO_TYPE_COLORS, etc.)
├── config/
│   └── kpiTargets.ts            ← Metas configurables persistidas en localStorage
├── components/
│   ├── ChartComponents.tsx      ← Primitivos: KpiCard, DonutChart, StackedBarChart, etc.
│   ├── TargetsModal.tsx         ← Modal para editar las metas de KPI
├── hooks/
│   └── useKpiData.ts            ← Hook maestro de cálculo (toda la lógica aquí)
└── reports/
    └── ReportsHub.tsx           ← Sección Reportes: tablas planas filtradas
```

---

## 2. Reglas Críticas del Módulo

### REGLA A: Un Solo Cálculo por Render (KpiContext)

`useKpiData` es computacionalmente intensivo (10+ `useMemo`). Para evitar que cada sub-vista lo ejecute por separado, **el hook vive exclusivamente en el `KpiProvider`** y los componentes hijos consumen los datos via `useKpiContext()`.

```tsx
// ✅ CORRECTO — en cualquier sub-vista
import { useKpiContext } from './KpiContext';
const { overview, costByType, backlog } = useKpiContext();

// ❌ INCORRECTO — invocar el hook directamente en una sub-vista
import { useKpiData } from './hooks/useKpiData';
const data = useKpiData(period, custom, ...);  // ← esto crea un segundo cálculo paralelo
```

El `KpiProvider` se renderiza en `index.tsx` envolviendo todas las sub-vistas KPI. **Nunca** agregues una llamada directa a `useKpiData` dentro de los archivos de vista.

### REGLA B: Toda Lógica de Cálculo va en `useKpiData.ts`

Si necesitas una nueva métrica:
1. Agrega un bloque `useMemo` dentro de `useKpiData.ts`.
2. Retórnalo en el objeto final del hook.
3. Conúmelo en el componente visual via `useKpiContext()`.

Los componentes visuales solo renderizan. **Nunca** hacen `.filter()`, `.reduce()` ni cálculos derivados sobre los datos crudos del store.

### REGLA C: Solo Lectura

Este módulo **nunca** despacha acciones ni modifica el store. Lee `workOrders`, `partUsages`, `assetPlans`, `pmPlans`, `inventoryItems`, `assets`, `users` en modo lectura pura.

### REGLA D: Constantes Compartidas desde `constants.ts`

Los colores y etiquetas de tipo/estado de OT son usados en múltiples archivos. **Siempre** impórtalos desde `constants.ts`:

```ts
import { WO_TYPE_COLORS, WO_TYPE_LABELS, WO_STATUS_COLORS, BACKLOG_STATUSES } from '../constants';
```

No duplicar estas constantes inline en los componentes.

---

## 3. Flujo de Datos

```
Zustand Store (workOrders, partUsages, assets, inventoryItems...)
        │
        ▼
  useKpiData(period, custom, filterPlant, filterArea)
        │  → computeCore(range)       ← KPIs del período actual
        │  → computeCore(prevRange)   ← KPIs del período anterior (tendencias)
        │  → backlog                  ← Estado actual de OTs abiertas
        │  → pmComplianceByPlan
        │  → costByType, topAssetsByCost, techPerformance, inventoryKpis...
        │
        ▼
  KpiProvider (context)
        │
        ├─ KpiOverview      → useKpiContext()
        ├─ WoAnalytics      → useKpiContext()
        ├─ PmCompliance     → useKpiContext()
        ├─ CostAnalysis     → useKpiContext()
        └─ InventoryKpis    → useKpiContext()
```

---

## 4. Filtros Globales

La cabecera de `index.tsx` expone tres dimensiones de filtrado que se pasan al `KpiProvider`:

| Filtro | Estado | Descripción |
|--------|--------|-------------|
| `period` | `'7d' \| '30d' \| '90d' \| 'month' \| 'custom'` | Ventana temporal |
| `filterPlant` | `string` (asset id) | Limita a una planta |
| `filterArea` | `string` (asset id) | Limita a un área dentro de la planta |

Cuando `filterPlant` o `filterArea` están activos, `useKpiData` construye un `Set<string>` con el nodo raíz y todos sus descendientes (via `getDescendantIds`) y lo aplica como máscara sobre `workOrders` y `assetPlans`.

El **backlog** siempre refleja el estado actual (independiente de la ventana temporal seleccionada).

---

## 5. Definiciones de KPIs y sus Fórmulas

### 5.1 PM Compliance
Nota de implementacion para agentes: `useKpiData.ts` calcula el denominador de PM Compliance desde `workOrders` completo usando `dueDate`, no desde `periodWos` filtrado por `createdAt`. Una OT creada antes del periodo pero vencida dentro del periodo debe contar. La comparacion de puntualidad usa el final del dia (`endOfDay(dueDate)`), no la medianoche de `dueDate`.
> **No confundir con tasa de cierre.** Esta es la métrica ISO 14224 / SMRP.

```
Denominador: OTs con assetPlanId, cuyo dueDate cae dentro del período seleccionado.
Numerador:   OTs del denominador donde status='completed' y completedAt <= endOfDay(dueDate).
Result:      round(numerador / denominador * 100)%
```

Una OT preventiva completada **después** de su `dueDate` NO cuenta como cumplida.

### 5.2 SLA Compliance
Nota de implementacion para agentes: la comparacion SLA tambien debe usar `endOfDay(dueDate)` para no penalizar cierres ocurridos durante el mismo dia calendario del vencimiento.
```
Denominador (slaEligible): OTs completadas que tienen tanto dueDate como completedAt.
Numerador:   slaEligible donde completedAt <= endOfDay(dueDate).
Result:      round(numerador / denominador * 100)%
```

OTs sin `dueDate` están excluidas de ambos lados (no inflan ni penalizan).

### 5.3 MTTR (Mean Time To Repair)
> Aplica **solo a OTs correctivas completadas**.

```
Muestra: OTs correctivas completadas con startedAt (o createdAt como fallback) y completedAt.
Valor:   differenceInHours(completedAt, startedAt || createdAt)
MTTR:    promedio de todos los valores de la muestra
```

No usa `actualHours` (horas-hombre) porque eso no representa el tiempo de indisponibilidad del activo.

### 5.4 MTBF (Mean Time Between Failures)
```
Por cada activo: lista de fechas createdAt de sus OTs correctivas en el período.
Gaps: differenceInHours entre ocurrencias consecutivas del mismo activo.
MTBF: promedio de todos los gaps entre activos.
```

### 5.5 Schedule Compliance
```
Denominador: OTs completadas con scheduledDate definido.
Numerador:   |differenceInCalendarDays(completedAt, scheduledDate)| <= SCHEDULE_COMPLIANCE_WINDOW_DAYS (3d).
Result:      round(numerador / denominador * 100)%
```

### 5.6 Costo Total
> `externalServiceCost` (campo de la OT) + repuestos consumidos via `partUsages`.

```
partsCostMap: Map<woId, Σ(quantity × unitCost)>  ← construido desde partUsages del store
woCost(w):   (w.externalServiceCost || 0) + (partsCostMap.get(w.id) || 0)
Total:        Σ woCost sobre completedWos del período
```

**No existe tarifa de mano de obra interna.** El costo se limita a servicios de proveedores + valor de repuestos.

### 5.7 Puntualidad del Backlog (Gauge)
```
backlogCount: OTs en estado {open, assigned, in_progress, on_hold}
overdueCount: backlogCount donde dueDate < hoy
Puntualidad:  max(0, round((1 - overdueCount / backlogCount) * 100))
```

Reemplaza la fórmula heurística anterior `100 - overdueCount * 10`.

### 5.8 Backlog
```
count:      OTs abiertas (estados BACKLOG_STATUSES) aplicando el filtro de activo
totalHours: Σ estimatedHours del backlog
avgAge:     promedio de differenceInCalendarDays(hoy, createdAt) por OT
oldest:     max de las edades
```

El backlog no está acotado por el período seleccionado — siempre es el estado actual.

### 5.9 Adherencia a Estimación
```
Muestra: OTs completadas con estimatedHours > 0 y actualHours > 0.
Result:  round(Σ actualHours / Σ estimatedHours * 100)%
```

Valor < 100%: las OTs se cierran en menos tiempo del estimado. Valor > 100%: subestimación.

### 5.10 Tendencias (Período Anterior)
Cada KPI numérico incluye un campo `trend: number | null`:

```
prevRange:  rango inmediatamente anterior de igual duración al período actual
trend:      pctChange(valorActual, valorAnterior)
            → null si valorAnterior === 0 (no comparable)
            → positivo = subió, negativo = bajó
```

`KpiCard` acepta `trendDirection: 'higher' | 'lower'` para determinar si subir es bueno (verde) o malo (rojo). Costos y MTTR usan `'lower'`.

---

## 6. Metas Configurables (`kpiTargets.ts`)

Las metas de semaforización se persisten en `localStorage` bajo la clave `apex.kpiTargets.v1`.

| Campo | Default | Semántica |
|-------|---------|-----------|
| `pmCompliance` | 80% | OTs preventivas completadas a tiempo |
| `slaCompliance` | 80% | OTs cerradas dentro del dueDate |
| `scheduleCompliance` | 80% | OTs ejecutadas en fecha planeada |
| `preventiveRatio` | 70% | Proporción preventivo/total |
| `mttrHours` | 8h | MTTR máximo tolerable |
| `overdueMax` | 0 | Vencidas aceptables |

```ts
// Lectura en cualquier componente
import { useKpiTargets } from './config/kpiTargets';
const [targets] = useKpiTargets();
```

El hook escucha el evento `apex:kpiTargets:changed` para sincronizar entre pestañas del navegador.

El botón **"Metas"** en la cabecera del módulo abre `TargetsModal.tsx`. Los gauges del Overview muestran un tick blanco en la posición de cada meta.

---

## 7. `ChartComponents.tsx` — Primitivos Disponibles

| Componente | Props clave | Uso |
|------------|-------------|-----|
| `KpiCard` | `label, value, sub, icon, color, accent, trend, trendDirection, targetHint, targetMet, onClick` | Tarjeta métrica principal |
| `DonutChart` | `data[{name,value,color}], total, label, onSliceClick` | Gráfico de dona con leyenda interactiva |
| `StackedBarChart` | `data, bars[{key,name,color}], xKey, onBarClick` | Barras apiladas semanales |
| `HorizontalBar` | `name, value, max, color, sub` | Barra de ranking horizontal animada |
| `PeriodSelector` | `value, onChange, custom, onCustomChange` | Selector de período con fechas personalizadas |
| `SectionHeader` | `icon, title, subtitle` | Cabecera de sección uniforme |
| `StatePill` | `state: 'ok'│'soon'│'overdue'` | Pill de estado para tablas PM |
| `ChartTooltip` | _(Recharts custom tooltip)_ | Tooltip oscuro con leyenda de series |

---

## 8. Cómo Agregar una Nueva Métrica

**Ejemplo:** añadir "Tasa de Reincidencia" (mismo activo con 2+ correctivas en el período).

**Paso 1 — `useKpiData.ts`:** nuevo bloque `useMemo`
```ts
const recidivismRate = useMemo(() => {
  const map: Record<string, number> = {};
  periodWos.filter(w => w.woType === 'corrective').forEach(w => {
    map[w.assetId] = (map[w.assetId] || 0) + 1;
  });
  const recidivists = Object.values(map).filter(c => c >= 2).length;
  const totalAssets = Object.keys(map).length;
  return totalAssets > 0 ? Math.round((recidivists / totalAssets) * 100) : 0;
}, [periodWos]);
```

**Paso 2 — retornar en el hook:**
```ts
return {
  // ...resto...
  recidivismRate,
};
```

**Paso 3 — consumir en la vista:**
```tsx
const { recidivismRate } = useKpiContext();
<KpiCard label="Reincidencia" value={`${recidivismRate}%`} ... />
```

---

## 9. Sub-vistas: Responsabilidades

### `KpiOverview.tsx`
- 4 gauges animados con tick de meta: PM Compliance, SLA, %Preventivo, Puntualidad Backlog.
- Grid de 12 tarjetas `KpiCard` con trend y semaforización contra targets.
- 2 DonutCharts: distribución por tipo de OT y estado del backlog.

### `WoAnalytics.tsx`
- Row de 4 tarjetas: Backlog count/horas, OTs vencidas, Edad promedio, Schedule Compliance.
- Gráfico de barras apiladas por semana con drill-down (click en barra filtra lista inferior).
- Top 8 activos por volumen de OTs y ranking de técnicos por eficiencia.
- Tabla de OTs vencidas (ordenadas por `dueDate` asc, limitadas a 15 con contador).

### `PmCompliance.tsx`
- Gauge grande del % de PM Compliance (color dinámico respecto al target configurado).
- Contadores clicables (Vencidos/Próximos/Al Día) que actúan como filtro rápido.
- Tabla completa de planes activos con estado semaforizado (`StatePill`).

### `CostAnalysis.tsx`
- Hero con costo total, tendencia vs período anterior y desglose Servicios/Repuestos.
- Gráfico de barras **apiladas** por tipo (Servicios + Repuestos por tipo de mantenimiento).
- Pareto de activos por costo (usa `topAssetsByCost`, ordenado por costo real, no por volumen).
- Ranking horizontal de top 10 activos más costosos.
- **No hay botón "Exportar" deshabilitado** — se elimina hasta que exista implementación real.

### `InventoryKpis.tsx`
- 3 tarjetas: total ítems activos, bajo mínimo, valor total en stock.
- Lista detallada de ítems que requieren reposición con cantidad sugerida.

### `ReportsHub.tsx`
- Selector de tipo de reporte (7 tipos disponibles) con filtros de fecha/tipo/estado.
- Genera tablas ad-hoc desde el store sin pasar por `useKpiData`.
- **Nota:** Este componente no consume `KpiContext` — tiene su propia lógica de filtrado local con `useMemo` porque sus tablas son independientes del período global del módulo.

---

## 10. Dependencias Externas

| Librería | Uso |
|----------|-----|
| `recharts` | Todos los gráficos (BarChart, PieChart, ComposedChart, LineChart) |
| `date-fns` | Cálculo de rangos, diferencias de fechas, formato |
| `framer-motion` | Animaciones de gauges, cards y transiciones de tab |
| `lucide-react` | Íconos de todas las tarjetas y cabeceras |
