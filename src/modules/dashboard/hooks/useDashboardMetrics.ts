import { useMemo } from 'react';
import { useStore } from '../../../store';
import { startOfWeek, subWeeks, isWithinInterval, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export function useDashboardMetrics() {
  const store = useStore() as any;
  const workOrders = store.workOrders || [];
  const inventoryItems = store.inventoryItems || [];
  const assets = store.assets || [];
  const assetPlans = store.assetPlans || [];

  return useMemo(() => {
    const now = new Date();

    // WO metrics
    const wos_open = workOrders.filter((w: any) => w.status === 'open').length;
    const wos_assigned = workOrders.filter((w: any) => w.status === 'assigned').length;
    const wos_in_progress = workOrders.filter((w: any) => w.status === 'in_progress').length;
    const wos_overdue = workOrders.filter((w: any) =>
      !['completed', 'cancelled'].includes(w.status) &&
      w.dueDate &&
      new Date(w.dueDate) < now
    ).length;

    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const wos_completed_month = workOrders.filter((w: any) =>
      w.status === 'completed' &&
      w.completedAt &&
      isWithinInterval(new Date(w.completedAt), { start: monthStart, end: monthEnd })
    ).length;

    // PM compliance
    const preventiveWos = workOrders.filter((w: any) => w.woType === 'preventive');
    const completedPreventive = preventiveWos.filter((w: any) => w.status === 'completed').length;
    const pm_compliance = preventiveWos.length > 0
      ? Math.round((completedPreventive / preventiveWos.length) * 100)
      : 100;

    // PM backlog: active plans with past due date and no open WO
    const pm_backlog = assetPlans.filter((ap: any) => {
      if (!ap.active || !ap.nextDueDate) return false;
      if (new Date(ap.nextDueDate) > now) return false;
      const hasOpen = workOrders.some(
        (w: any) => w.assetPlanId === ap.id && !['completed', 'cancelled'].includes(w.status)
      );
      return !hasOpen;
    }).length;

    // Inventory
    const inventory_low = inventoryItems.filter((i: any) => i.stockCurrent <= i.stockMin).length;
    const inventory_value = inventoryItems.reduce(
      (sum: number, i: any) => sum + (i.stockCurrent * (i.unitCost || 0)), 0
    );

    // Weekly trend (last 8 weeks)
    const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(now, 7 - i));
      const weekEnd = endOfWeek(weekStart);
      const label = `S${i + 1}`;
      const created = workOrders.filter((w: any) =>
        w.createdAt && isWithinInterval(new Date(w.createdAt), { start: weekStart, end: weekEnd })
      ).length;
      const completed = workOrders.filter((w: any) =>
        w.completedAt && isWithinInterval(new Date(w.completedAt), { start: weekStart, end: weekEnd })
      ).length;
      return { label, created, completed };
    });

    // Top assets by WO count (last 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const recentWos = workOrders.filter((w: any) =>
      w.createdAt && new Date(w.createdAt) >= ninetyDaysAgo
    );
    const assetWoCount: Record<string, number> = {};
    recentWos.forEach((w: any) => {
      assetWoCount[w.assetId] = (assetWoCount[w.assetId] || 0) + 1;
    });
    const topAssets = Object.entries(assetWoCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => {
        const asset = assets.find((a: any) => a.id === id);
        return { id, name: asset?.name || id, code: asset?.code, woCount: count };
      });

    return {
      wos_open,
      wos_assigned,
      wos_in_progress,
      wos_overdue,
      wos_completed_month,
      pm_compliance,
      pm_backlog,
      inventory_low,
      inventory_value,
      weeklyTrend,
      topAssets,
    };
  }, [workOrders, inventoryItems, assets, assetPlans]);
}
