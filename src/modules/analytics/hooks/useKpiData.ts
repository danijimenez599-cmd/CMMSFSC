import { useMemo } from 'react';
import { useStore } from '../../../store';
import {
  startOfDay, differenceInHours, differenceInCalendarDays,
  parseISO, isValid, format, subDays, startOfMonth, endOfMonth,
  eachWeekOfInterval, startOfWeek, endOfWeek, endOfDay,
} from 'date-fns';
import { getDescendantIds } from '../../assets/utils/assetHelpers';
import {
  WO_TYPE_COLORS, WO_TYPE_LABELS,
  WO_STATUS_COLORS, WO_STATUS_LABELS,
  BACKLOG_STATUSES, SCHEDULE_COMPLIANCE_WINDOW_DAYS,
} from '../constants';

export type Period = '7d' | '30d' | '90d' | 'month' | 'custom';

function safeParse(d: string | null | undefined): Date | null {
  if (!d) return null;
  const p = parseISO(d);
  return isValid(p) ? p : null;
}

function periodRange(period: Period, custom?: { from: string; to: string }): { from: Date; to: Date } {
  const today = startOfDay(new Date());
  const nowEnd = endOfDay(new Date());

  if (period === '7d')    return { from: subDays(today, 6),  to: nowEnd };
  if (period === '30d')   return { from: subDays(today, 29), to: nowEnd };
  if (period === '90d')   return { from: subDays(today, 89), to: nowEnd };
  if (period === 'month') return { from: startOfMonth(today), to: endOfMonth(today) };
  if (period === 'custom' && custom) {
    const cFrom = safeParse(custom.from);
    const cTo = safeParse(custom.to);
    if (cFrom && cTo) {
      const fromD = startOfDay(cFrom);
      const toD = endOfDay(cTo);
      return fromD <= toD ? { from: fromD, to: toD } : { from: startOfDay(cTo), to: endOfDay(cFrom) };
    }
  }
  return { from: subDays(today, 29), to: nowEnd };
}

/** Período inmediatamente anterior, de la misma duración. */
function previousRange(range: { from: Date; to: Date }): { from: Date; to: Date } {
  const ms = range.to.getTime() - range.from.getTime();
  const prevTo = new Date(range.from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - ms);
  return { from: prevFrom, to: prevTo };
}

/** Cambio porcentual; null si la base es 0 (no comparable). */
function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

interface CoreInput {
  workOrders: any[];
  partUsages: any[];
  filteredAssetIds: Set<string> | null;
  range: { from: Date; to: Date };
}

/** Mapa woId → costo total de repuestos. */
function buildPartsCostMap(partUsages: any[]): Map<string, number> {
  const m = new Map<string, number>();
  partUsages.forEach((u: any) => {
    const cost = (u.quantity || 0) * (u.unitCost || 0);
    m.set(u.workOrderId, (m.get(u.workOrderId) || 0) + cost);
  });
  return m;
}

/** Costo total de una OT = servicios externos + repuestos consumidos. */
function woCost(w: any, partsMap: Map<string, number>): number {
  return (w.externalServiceCost || 0) + (partsMap.get(w.id) || 0);
}

/** KPIs base calculables para cualquier período (usado para período actual y anterior). */
function computeCore({ workOrders, partUsages, filteredAssetIds, range }: CoreInput) {
  const partsMap = buildPartsCostMap(partUsages);

  const periodWos = workOrders.filter((w: any) => {
    const d = safeParse(w.createdAt);
    if (!d || d < range.from || d > range.to) return false;
    if (filteredAssetIds && !filteredAssetIds.has(w.assetId)) return false;
    return true;
  });

  const completedWos = periodWos.filter((w: any) => w.status === 'completed');

  const correctives = periodWos.filter((w: any) => w.woType === 'corrective');
  const preventives = periodWos.filter((w: any) => w.woType === 'preventive');

  const total = periodWos.length;
  const completed = completedWos.length;

  // ── MTTR (correctivas únicamente, basado en tiempo real de reparación) ──
  // Tiempo desde startedAt (o createdAt si no hay) hasta completedAt
  const correctivesCompleted = completedWos.filter((w: any) => w.woType === 'corrective');
  const mttrSamples = correctivesCompleted
    .map((w: any) => {
      const end = safeParse(w.completedAt);
      const start = safeParse(w.startedAt) || safeParse(w.createdAt);
      if (!end || !start || end <= start) return null;
      return differenceInHours(end, start);
    })
    .filter((h: number | null): h is number => h !== null && h >= 0);

  const mttr = mttrSamples.length > 0
    ? mttrSamples.reduce((s: number, h: number) => s + h, 0) / mttrSamples.length
    : 0;

  // ── PM Compliance: OTs PM vencidas en el período cumplidas a tiempo ──
  // Denominador: OTs preventivas con dueDate dentro del rango
  // Numerador: completadas con completedAt <= dueDate
  const pmDue = workOrders.filter((w: any) => {
    if (!w.assetPlanId) return false;
    const due = safeParse(w.dueDate);
    if (filteredAssetIds && !filteredAssetIds.has(w.assetId)) return false;
    return due && due >= range.from && due <= range.to;
  });
  const pmOnTime = pmDue.filter((w: any) => {
    if (w.status !== 'completed') return false;
    const c = safeParse(w.completedAt);
    const d = safeParse(w.dueDate);
    return c && d && c <= endOfDay(d);
  }).length;
  const pmCompliance = pmDue.length > 0 ? Math.round((pmOnTime / pmDue.length) * 100) : 0;

  // ── SLA: completadas a tiempo / completadas con dueDate ──
  const slaEligible = completedWos.filter((w: any) => safeParse(w.dueDate) && safeParse(w.completedAt));
  const slaOnTime = slaEligible.filter((w: any) => parseISO(w.completedAt) <= endOfDay(parseISO(w.dueDate))).length;
  const slaCompliance = slaEligible.length > 0 ? Math.round((slaOnTime / slaEligible.length) * 100) : 0;

  // ── Schedule Compliance: |completedAt - scheduledDate| <= N días ──
  const schedEligible = completedWos.filter((w: any) => safeParse(w.scheduledDate) && safeParse(w.completedAt));
  const schedOnTime = schedEligible.filter((w: any) => {
    const c = parseISO(w.completedAt);
    const s = parseISO(w.scheduledDate);
    return Math.abs(differenceInCalendarDays(c, s)) <= SCHEDULE_COMPLIANCE_WINDOW_DAYS;
  }).length;
  const scheduleCompliance = schedEligible.length > 0
    ? Math.round((schedOnTime / schedEligible.length) * 100)
    : 0;

  // ── Costos totales (servicios externos + repuestos) ──
  const externalCost = completedWos.reduce((s: number, w: any) => s + (w.externalServiceCost || 0), 0);
  const partsCost = completedWos.reduce((s: number, w: any) => s + (partsMap.get(w.id) || 0), 0);
  const totalCost = externalCost + partsCost;

  // ── MTBF (tiempo entre fallos correctivos del mismo activo) ──
  const correctivesByAsset: Record<string, Date[]> = {};
  correctives.forEach((w: any) => {
    const d = safeParse(w.createdAt);
    if (d) {
      if (!correctivesByAsset[w.assetId]) correctivesByAsset[w.assetId] = [];
      correctivesByAsset[w.assetId].push(d);
    }
  });
  let totalGapsHours = 0;
  let gapCount = 0;
  Object.values(correctivesByAsset).forEach(dates => {
    if (dates.length > 1) {
      dates.sort((a, b) => a.getTime() - b.getTime());
      for (let i = 1; i < dates.length; i++) {
        totalGapsHours += differenceInHours(dates[i], dates[i - 1]);
        gapCount++;
      }
    }
  });
  const mtbf = gapCount > 0 ? Math.round(totalGapsHours / gapCount) : 0;

  // ── Adherencia a estimación: actual / estimated en completadas ──
  const estEligible = completedWos.filter((w: any) =>
    (w.estimatedHours || 0) > 0 && (w.actualHours || 0) > 0
  );
  const estTotal = estEligible.reduce((s: number, w: any) => s + w.estimatedHours, 0);
  const actTotal = estEligible.reduce((s: number, w: any) => s + w.actualHours, 0);
  const estimateAdherence = estTotal > 0 ? Math.round((actTotal / estTotal) * 100) : 0;

  return {
    periodWos, completedWos, partsMap,
    total, completed,
    correctives: correctives.length, preventives: preventives.length,
    mttr: Math.round(mttr * 10) / 10,
    mtbf,
    pmCompliance, slaCompliance, scheduleCompliance,
    externalCost, partsCost, totalCost,
    estimateAdherence,
  };
}

export function useKpiData(
  period: Period,
  custom?: { from: string; to: string },
  filterPlant?: string,
  filterArea?: string,
) {
  const store = useStore() as any;
  const {
    workOrders = [], assetPlans = [], pmPlans = [], inventoryItems = [],
    assets = [], users = [], partUsages = [],
  } = store;

  const range = useMemo(() => periodRange(period, custom), [period, custom]);
  const prevRange = useMemo(() => previousRange(range), [range]);

  const filteredAssetIds = useMemo(() => {
    if (!filterPlant && !filterArea) return null;
    const rootId = filterArea || filterPlant;
    if (!rootId) return null;
    const subtreeIds = new Set(getDescendantIds(rootId, assets));
    subtreeIds.add(rootId);
    return subtreeIds;
  }, [assets, filterPlant, filterArea]);

  // ── Núcleo: período actual + anterior ──
  const core = useMemo(
    () => computeCore({ workOrders, partUsages, filteredAssetIds, range }),
    [workOrders, partUsages, filteredAssetIds, range]
  );

  const prevCore = useMemo(
    () => computeCore({ workOrders, partUsages, filteredAssetIds, range: prevRange }),
    [workOrders, partUsages, filteredAssetIds, prevRange]
  );

  const { periodWos, completedWos, partsMap } = core;

  // ── Backlog (estado actual, no del período) ──
  const backlog = useMemo(() => {
    const today = new Date();
    const open = workOrders.filter((w: any) => {
      if (!BACKLOG_STATUSES.includes(w.status)) return false;
      if (filteredAssetIds && !filteredAssetIds.has(w.assetId)) return false;
      return true;
    });
    const totalHours = open.reduce((s: number, w: any) => s + (w.estimatedHours || 0), 0);
    const ages = open.map((w: any) => {
      const c = safeParse(w.createdAt);
      return c ? differenceInCalendarDays(today, c) : 0;
    });
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((s: number, a: number) => s + a, 0) / ages.length) : 0;
    const oldest = ages.length > 0 ? Math.max(...ages) : 0;

    const overdue = open.filter((w: any) => {
      const due = safeParse(w.dueDate);
      return due && due < today;
    });

    return {
      count: open.length,
      totalHours: Math.round(totalHours * 10) / 10,
      avgAge,
      oldest,
      overdueCount: overdue.length,
      overdueWos: overdue.sort((a: any, b: any) => {
        const da = parseISO(a.dueDate).getTime();
        const db = parseISO(b.dueDate).getTime();
        return da - db;
      }),
    };
  }, [workOrders, filteredAssetIds]);

  // ── OVERVIEW expuesto ──
  const overview = useMemo(() => {
    const stockCritical = inventoryItems.filter((i: any) => i.stockCurrent <= i.stockMin && i.active).length;

    const trends = {
      total: pctChange(core.total, prevCore.total),
      completed: pctChange(core.completed, prevCore.completed),
      pmCompliance: pctChange(core.pmCompliance, prevCore.pmCompliance),
      slaCompliance: pctChange(core.slaCompliance, prevCore.slaCompliance),
      scheduleCompliance: pctChange(core.scheduleCompliance, prevCore.scheduleCompliance),
      mttr: pctChange(core.mttr, prevCore.mttr),
      totalCost: pctChange(core.totalCost, prevCore.totalCost),
      externalCost: pctChange(core.externalCost, prevCore.externalCost),
      partsCost: pctChange(core.partsCost, prevCore.partsCost),
      correctives: pctChange(core.correctives, prevCore.correctives),
      preventives: pctChange(core.preventives, prevCore.preventives),
    };

    return {
      total: core.total,
      completed: core.completed,
      correctives: core.correctives,
      preventives: core.preventives,
      mttr: core.mttr,
      mtbf: core.mtbf,
      pmCompliance: core.pmCompliance,
      slaCompliance: core.slaCompliance,
      scheduleCompliance: core.scheduleCompliance,
      estimateAdherence: core.estimateAdherence,
      externalCost: core.externalCost,
      partsCost: core.partsCost,
      totalCost: core.totalCost,
      stockCritical,
      overdueCount: backlog.overdueCount,
      backlogHours: backlog.totalHours,
      backlogCount: backlog.count,
      backlogAvgAge: backlog.avgAge,
      trends,
      previous: {
        total: prevCore.total,
        completed: prevCore.completed,
        pmCompliance: prevCore.pmCompliance,
        slaCompliance: prevCore.slaCompliance,
        scheduleCompliance: prevCore.scheduleCompliance,
        mttr: prevCore.mttr,
        totalCost: prevCore.totalCost,
      },
    };
  }, [core, prevCore, inventoryItems, backlog]);

  // ── WO DISTRIBUTION by week ──
  const woByWeek = useMemo(() => {
    const weeks = eachWeekOfInterval({ start: range.from, end: range.to }, { weekStartsOn: 1 });
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const label = format(weekStart, 'dd MMM');
      const wos = periodWos.filter((w: any) => {
        const d = safeParse(w.createdAt);
        return d && d >= startOfWeek(weekStart, { weekStartsOn: 1 }) && d <= weekEnd;
      });
      return {
        label,
        preventive: wos.filter((w: any) => w.woType === 'preventive').length,
        corrective: wos.filter((w: any) => w.woType === 'corrective').length,
        predictive: wos.filter((w: any) => w.woType === 'predictive').length,
        inspection: wos.filter((w: any) => w.woType === 'inspection').length,
      };
    });
  }, [periodWos, range]);

  const woTypeDonut = useMemo(() => {
    const types = ['preventive', 'corrective', 'predictive', 'inspection'];
    return types
      .map(t => ({
        name: WO_TYPE_LABELS[t],
        value: periodWos.filter((w: any) => w.woType === t).length,
        color: WO_TYPE_COLORS[t],
      }))
      .filter(t => t.value > 0);
  }, [periodWos]);

  const woStatusDonut = useMemo(() => {
    const statuses = Object.keys(WO_STATUS_LABELS);
    return statuses
      .map(s => ({
        name: WO_STATUS_LABELS[s],
        value: periodWos.filter((w: any) => w.status === s).length,
        color: WO_STATUS_COLORS[s],
      }))
      .filter(s => s.value > 0);
  }, [periodWos]);

  // ── PM COMPLIANCE per plan ──
  const pmComplianceByPlan = useMemo(() => {
    return assetPlans
      .filter((ap: any) => {
        if (!ap.active) return false;
        if (filteredAssetIds && !filteredAssetIds.has(ap.assetId)) return false;
        return true;
      })
      .map((ap: any) => {
        const plan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
        const asset = assets.find((a: any) => a.id === ap.assetId);

        const wosInPeriod = workOrders.filter((w: any) => {
          if (w.assetPlanId !== ap.id) return false;
          const d = safeParse(w.createdAt);
          return d && d >= range.from && d <= range.to;
        });

        const completedInPeriod = wosInPeriod.filter((w: any) => w.status === 'completed').length;

        const today = new Date();
        const due = safeParse(ap.nextDueDate);
        const daysUntilDue = due ? differenceInCalendarDays(due, today) : null;
        let state: 'ok' | 'soon' | 'overdue' = 'ok';
        if (daysUntilDue !== null) {
          if (daysUntilDue < 0) state = 'overdue';
          else if (daysUntilDue <= 7) state = 'soon';
        }
        return {
          id: ap.id,
          planName: plan?.name || ap.pmPlanId,
          assetName: asset?.name || ap.assetId,
          cycleIndex: ap.currentCycleIndex,
          nextDueDate: ap.nextDueDate,
          daysUntilDue,
          completedInPeriod,
          totalWos: wosInPeriod.length,
          state,
        };
      })
      .sort((a: any, b: any) => {
        const stateOrder: Record<string, number> = { overdue: 0, soon: 1, ok: 2 };
        return (stateOrder[a.state] ?? 3) - (stateOrder[b.state] ?? 3);
      });
  }, [assetPlans, pmPlans, assets, workOrders, range, filteredAssetIds]);

  // ── COST by TYPE (servicio externo + repuestos) ──
  const costByType = useMemo(() => {
    const types = ['preventive', 'corrective', 'predictive', 'inspection'];
    return types
      .map(t => {
        const wos = completedWos.filter((w: any) => w.woType === t);
        const external = wos.reduce((s: number, w: any) => s + (w.externalServiceCost || 0), 0);
        const parts = wos.reduce((s: number, w: any) => s + (partsMap.get(w.id) || 0), 0);
        return {
          name: WO_TYPE_LABELS[t],
          external,
          parts,
          cost: external + parts,
          color: WO_TYPE_COLORS[t],
        };
      })
      .filter(t => t.cost > 0);
  }, [completedWos, partsMap]);

  // ── TOP ASSETS ──
  // Mantenemos dos rankings independientes: por cantidad y por costo
  const topAssetsByWo = useMemo(() => {
    const map: Record<string, { name: string; count: number; cost: number }> = {};
    periodWos.forEach((w: any) => {
      const id = w.assetId;
      if (!map[id]) map[id] = { name: w.assetNameSnapshot || id, count: 0, cost: 0 };
      map[id].count++;
      map[id].cost += woCost(w, partsMap);
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [periodWos, partsMap]);

  const topAssetsByCost = useMemo(() => {
    const map: Record<string, { name: string; count: number; cost: number }> = {};
    completedWos.forEach((w: any) => {
      const c = woCost(w, partsMap);
      if (c <= 0) return;
      const id = w.assetId;
      if (!map[id]) map[id] = { name: w.assetNameSnapshot || id, count: 0, cost: 0 };
      map[id].count++;
      map[id].cost += c;
    });
    return Object.values(map).sort((a, b) => b.cost - a.cost).slice(0, 10);
  }, [completedWos, partsMap]);

  // ── TECHNICIAN performance ──
  const techPerformance = useMemo(() => {
    const map: Record<string, { name: string; assigned: number; completed: number; totalHours: number }> = {};
    periodWos.forEach((w: any) => {
      const id = w.assignedTo || 'unassigned';
      const name = w.assignedToNameSnapshot || (id === 'unassigned' ? 'Sin asignar' : id);
      if (!map[id]) map[id] = { name, assigned: 0, completed: 0, totalHours: 0 };
      map[id].assigned++;
      if (w.status === 'completed') {
        map[id].completed++;
        map[id].totalHours += w.actualHours || 0;
      }
    });
    return Object.values(map)
      .sort((a, b) => b.assigned - a.assigned)
      .slice(0, 8)
      .map(t => ({ ...t, efficiency: t.assigned > 0 ? Math.round((t.completed / t.assigned) * 100) : 0 }));
  }, [periodWos]);

  // ── INVENTORY KPIs ──
  const inventoryKpis = useMemo(() => {
    const active = inventoryItems.filter((i: any) => i.active);
    const belowMin = active.filter((i: any) => i.stockCurrent <= i.stockMin);
    const totalValue = active.reduce((s: number, i: any) => s + (i.stockCurrent * (i.unitCost || 0)), 0);
    return { total: active.length, belowMin: belowMin.length, totalValue, belowMinItems: belowMin };
  }, [inventoryItems]);

  return {
    range,
    prevRange,
    overview,
    backlog,
    woByWeek,
    woTypeDonut,
    woStatusDonut,
    pmComplianceByPlan,
    costByType,
    topAssetsByWo,
    topAssetsByCost,
    techPerformance,
    inventoryKpis,
    overdueWos: backlog.overdueWos,
    periodWos,
    completedWos,
    partsMap,
    assets,
    users,
  };
}

export type KpiData = ReturnType<typeof useKpiData>;
