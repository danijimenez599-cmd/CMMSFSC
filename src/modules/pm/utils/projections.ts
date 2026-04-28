import { addDays, addWeeks, addMonths, addYears, parseISO, isValid, startOfDay, differenceInDays } from 'date-fns';

export interface ProjectionPoint {
  date: Date | null;
  /** Estimated calendar date for meter-only projections, derived from consumption rate. null if rate unavailable. */
  projectedDate: Date | null;
  meterValue: number | null;
  meterUnit: string | null;
  label: string;
  isMajor: boolean;
  cycleIndex: number;
  /** All unique frequencyMultipliers that fire this cycle, sorted ascending. e.g. [1,2,3] for C6. */
  activeMultipliers: number[];
  /** Highest of activeMultipliers. Kept for backward compat and weight comparisons. */
  maxMultiplier: number;
  tasksNames: string[];
  tasksCount: number;
}

/**
 * Projects the next maintenance events for an AssetPlan.
 *
 * - calendar: advances by date interval; stops at horizonMonths.
 * - meter:    advances by meter threshold; returns the next `meterCycles` events.
 *             No calendar horizon — meter plans have no inherent time axis.
 *             If `meterReadings` contains ≥ 2 data points for the asset's measurement
 *             point, a `projectedDate` is estimated via linear consumption rate
 *             (projectedDate = today + ceil(remainingUnits / dailyRate)).
 * - hybrid:   advances both dimensions; shows events within horizon that fire on
 *             either calendar OR meter (whichever is first for that cycle).
 *
 * Returns only cycles where at least one task fires (cycleIndex % multiplier === 0).
 * Skips past dates so the panel never shows stale projections from overdue plans.
 *
 * @param assetPlan     The asset's plan row (nextDueDate, nextDueMeter, currentCycleIndex…).
 * @param pmPlan        The plan definition (triggerType, intervals, tasks…).
 * @param horizonMonths How far ahead to project calendar/hybrid events (default 24).
 * @param meterCycles   How many future meter cycles to show for meter-only plans (default 8).
 * @param meterReadings Historical meter readings for consumption-rate estimation.
 *                      Only used for meter-only plans; ignored for calendar/hybrid.
 */

const MAX_ITER = 120;

/**
 * Computes the average daily consumption rate for a measurement point from its reading history.
 *
 * Algorithm: (newestValue − oldestValue) / daysBetween
 * Returns null if: no pointId, fewer than 2 readings, zero/negative time span, or
 * non-positive value delta (e.g. counter reset or stationary equipment).
 */
function calcDailyRate(pointId: string | null, meterReadings: any[]): number | null {
  if (!pointId) return null;
  const pts = meterReadings
    .filter((r: any) => r.measurementPointId === pointId && r.value != null)
    .sort((a: any, b: any) => new Date(a.readingAt).getTime() - new Date(b.readingAt).getTime());
  if (pts.length < 2) return null;
  const oldest = pts[0];
  const newest = pts[pts.length - 1];
  const days = differenceInDays(new Date(newest.readingAt), new Date(oldest.readingAt));
  if (days <= 0) return null;
  const delta = newest.value - oldest.value;
  if (delta <= 0) return null;
  return delta / days;
}

export function calculateProjections(
  assetPlan: any,
  pmPlan: any,
  horizonMonths: number = 24,
  meterCycles: number = 8,
  meterReadings: any[] = [],
): ProjectionPoint[] {
  const projections: ProjectionPoint[] = [];

  try {
    if (!assetPlan || !pmPlan) return [];

    const triggerType: string = pmPlan.triggerType || 'calendar';
    const tasks = Array.isArray(pmPlan.tasks) ? pmPlan.tasks : [];
    const today = startOfDay(new Date());
    const horizonDate = addMonths(today, horizonMonths);

    // Daily consumption rate for meter-based date projection (null = not enough data)
    const dailyRate = calcDailyRate(assetPlan.measurementPointId ?? null, meterReadings);
    const currentMeterForRate: number = Number(assetPlan.nextDueMeter != null
      ? (assetPlan.nextDueMeter - (pmPlan.meterIntervalValue || 0))
      : 0) || 0;

    let currentSimCycle = Number(assetPlan.currentCycleIndex) || 1;

    // ── helpers ──────────────────────────────────────────────────────────────

    function advanceDate(base: Date): Date {
      switch (pmPlan.intervalUnit) {
        case 'days':   return addDays(base, pmPlan.intervalValue);
        case 'weeks':  return addWeeks(base, pmPlan.intervalValue);
        case 'months': return addMonths(base, pmPlan.intervalValue);
        case 'years':  return addYears(base, pmPlan.intervalValue);
        default:       return addMonths(base, 1);
      }
    }

    function cycleTasksFor(cycleIdx: number) {
      return tasks.filter((t: any) => cycleIdx % (Number(t.frequencyMultiplier) || 1) === 0);
    }

    function makePoint(
      date: Date | null,
      meterValue: number | null,
      cycleTasks: any[],
      cycleIdx: number,
      projectedDate: Date | null = null,
    ): ProjectionPoint {
      // Deduplicate and sort all multipliers that fire at this cycle.
      // C6 with T1(x1)+T2(x2)+T3(x3) → [1, 2, 3], not just 3.
      const activeMultipliers = [
        ...new Set(cycleTasks.map((t: any) => Number(t.frequencyMultiplier) || 1)),
      ].sort((a, b) => a - b);

      const maxMult = activeMultipliers.length > 0 ? Math.max(...activeMultipliers) : 1;
      const isMajor = maxMult > 1;

      return {
        date,
        projectedDate,
        meterValue,
        meterUnit: pmPlan.meterIntervalUnit ?? null,
        label: isMajor ? 'Mantenimiento Mayor' : 'Rutina Preventiva',
        isMajor,
        cycleIndex: cycleIdx,
        activeMultipliers,
        maxMultiplier: maxMult,
        tasksNames: cycleTasks.map((t: any) => t.description),
        tasksCount: cycleTasks.length,
      };
    }

    // ── CALENDAR-only ─────────────────────────────────────────────────────────
    if (triggerType === 'calendar') {
      if (!pmPlan.intervalValue) return [];

      let simDate: Date;
      try {
        simDate = assetPlan.nextDueDate ? parseISO(assetPlan.nextDueDate) : today;
        if (!isValid(simDate)) simDate = today;
      } catch { simDate = today; }

      // If nextDueDate is in the past, fast-forward to the next future threshold
      // so we never show stale past projections.
      while (simDate < today) {
        simDate = advanceDate(simDate);
        currentSimCycle++;
      }

      let iterations = 0;
      while (simDate <= horizonDate && iterations < MAX_ITER) {
        iterations++;
        if (!isValid(simDate)) break;

        const cycleTasks = cycleTasksFor(currentSimCycle);
        if (cycleTasks.length > 0) {
          projections.push(makePoint(new Date(simDate), null, cycleTasks, currentSimCycle, null));
        }

        simDate = advanceDate(simDate);
        currentSimCycle++;
      }
      return projections;
    }

    // ── METER-only ────────────────────────────────────────────────────────────
    if (triggerType === 'meter') {
      const interval = Number(pmPlan.meterIntervalValue);
      if (!interval) return [];

      let currentMeter = Number(assetPlan.nextDueMeter) || interval;
      const currentValue = Number(assetPlan.nextDueMeter ?? 0) - interval;
      let iterations = 0;

      while (iterations < MAX_ITER) {
        iterations++;
        const cycleTasks = cycleTasksFor(currentSimCycle);
        if (cycleTasks.length > 0) {
          // Project a calendar date if we have a reliable consumption rate
          let projectedDate: Date | null = null;
          if (dailyRate && dailyRate > 0) {
            const gap = currentMeter - Math.max(currentValue, 0);
            const daysUntil = Math.ceil(gap / dailyRate);
            const candidate = addDays(today, daysUntil);
            projectedDate = candidate > today ? candidate : null;
          }
          projections.push(makePoint(null, currentMeter, cycleTasks, currentSimCycle, projectedDate));
          if (projections.length >= meterCycles) break;
        }
        currentMeter += interval;
        currentSimCycle++;
      }
      return projections;
    }

    // ── HYBRID ────────────────────────────────────────────────────────────────
    {
      const meterInterval = Number(pmPlan.meterIntervalValue);
      if (!meterInterval) return [];

      let currentMeter = Number(assetPlan.nextDueMeter) || meterInterval;

      let simDate: Date;
      try {
        simDate = assetPlan.nextDueDate ? parseISO(assetPlan.nextDueDate) : today;
        if (!isValid(simDate)) simDate = today;
      } catch { simDate = today; }

      // Fast-forward past dates when calendar is behind
      while (simDate < today) {
        simDate = advanceDate(simDate);
        currentMeter += meterInterval;
        currentSimCycle++;
      }

      let iterations = 0;
      while (simDate <= horizonDate && iterations < MAX_ITER) {
        iterations++;
        if (!isValid(simDate)) break;

        const cycleTasks = cycleTasksFor(currentSimCycle);
        if (cycleTasks.length > 0) {
          projections.push(makePoint(new Date(simDate), currentMeter, cycleTasks, currentSimCycle, null));
        }

        simDate = advanceDate(simDate);
        currentMeter += meterInterval;
        currentSimCycle++;
      }
      return projections;
    }
  } catch (error) {
    console.error('Error en el motor de proyecciones:', error);
    return [];
  }
}
