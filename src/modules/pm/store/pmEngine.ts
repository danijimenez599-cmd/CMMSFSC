/**
 * VersaMaint — PM Scheduling Engine v2
 *
 * Architecture:
 *  1. Trigger evaluation   — calendar and meter dimensions are independent; hybrid fires on either.
 *  2. Effective cycle      — scans missed intervals to find the heaviest pending cycle.
 *  3. Modular task filter  — cycleIndex % frequencyMultiplier === 0 selects which tasks fire.
 *  4. Anti-stacking        — blocks duplicate WOs; compares weights before blocking.
 *  5. Supersession         — higher-weight cycle absorbs an open lower-weight WO.
 *  6. Date assignment      — calendar plans use nextDueDate; meter/hybrid plans use a
 *                            configurable tolerance window (pm_meter_tolerance table).
 *                            Trigger logic (cycle index, threshold) is never affected by dates.
 *
 * ── Date contract ──────────────────────────────────────────────────────────────
 *  scheduledDate  When the technician should start the work.
 *                 Calendar: nextDueDate − leadDays.
 *                 Meter:    triggerDay + scheduledOffsetDays (default 0 = same day).
 *
 *  dueDate        Hard deadline for the maintenance manager.
 *                 Calendar: nextDueDate.
 *                 Meter:    triggerDay + dueOffsetDays (per criticality, configurable).
 *
 * ── Tolerance defaults (overridable via pm_meter_tolerance) ────────────────────
 *  critical → due in 2 days   high → 5 days   medium → 14 days   low → 30 days
 */

import {
  addDays, addWeeks, addMonths, addYears,
  isBefore, isAfter, differenceInDays,
  startOfDay, parseISO, format, isValid,
} from 'date-fns';
import { PmPlan, AssetPlan, MeterTolerance } from '../types';
import { generateId } from '../../../shared/utils/utils';

// ── Calendar helper ────────────────────────────────────────────────────────

/**
 * Advances the next-due date for a calendar (or hybrid) plan after a WO is completed.
 *
 * - fixed mode:    strides forward from the existing `nextDueDate`, ignoring completion time.
 * - floating mode: strides forward from the actual `completedAt` timestamp.
 * - `cyclesConsumed > 1`: multi-stride catch-up when several missed cycles are consolidated.
 *
 * Not used by pure meter plans — their meter threshold is advanced in the store slice.
 */
export function calcNextDueDate(
  plan: PmPlan,
  assetPlan: Pick<AssetPlan, 'nextDueDate' | 'lastCompletedAt'>,
  completedAt?: string,
  cyclesConsumed: number = 1,
): string {
  if (!plan.intervalValue || !plan.intervalUnit) {
    return addDays(new Date(), 30).toISOString();
  }

  const n = Math.max(1, cyclesConsumed);

  let base: Date;
  if (plan.intervalMode === 'fixed' && assetPlan.nextDueDate) {
    base = new Date(assetPlan.nextDueDate);
    if (isNaN(base.getTime())) base = completedAt ? new Date(completedAt) : new Date();
  } else {
    base = completedAt
      ? new Date(completedAt)
      : assetPlan.nextDueDate
        ? new Date(assetPlan.nextDueDate)
        : new Date();
  }

  switch (plan.intervalUnit) {
    case 'days':   return addDays(base, plan.intervalValue * n).toISOString();
    case 'weeks':  return addWeeks(base, plan.intervalValue * n).toISOString();
    case 'months': return addMonths(base, plan.intervalValue * n).toISOString();
    case 'years':  return addYears(base, plan.intervalValue * n).toISOString();
    default:       return addMonths(base, n).toISOString();
  }
}

// ── UI status helper ───────────────────────────────────────────────────────

/**
 * Derives read-only UI status for an asset plan: overdue badge, progress bar, human label.
 * Pure computation — never mutates plan state or triggers scheduling.
 *
 * - Calendar:  overdue when nextDueDate < now.
 * - Meter:     progress % = (current − cycleStart) / interval × 100;
 *              overdue when currentValue ≥ nextDueMeter.
 * - Hybrid:    either dimension can independently set isOverdue = true.
 */
export interface PlanStatus {
  isOverdue: boolean;
  progress: number;
  reason: string | null;
  label: string;
}

export function computePlanStatus(
  plan: PmPlan | undefined | null,
  assetPlan: AssetPlan | undefined | null,
  currentPointValue: number | null = 0,
): PlanStatus {
  if (!plan || !assetPlan || !assetPlan.active) {
    return { isOverdue: false, progress: 0, reason: null, label: 'Inactivo' };
  }

  let isOverdue = false;
  let progress = 0;
  const reasons: string[] = [];
  const now = new Date();

  if (plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') {
    if (assetPlan.nextDueDate) {
      const dueDate = new Date(assetPlan.nextDueDate);
      if (!isNaN(dueDate.getTime()) && dueDate < now) {
        isOverdue = true;
        reasons.push('Calendario vencido');
      }
    }
  }

  if (plan.triggerType === 'meter' || plan.triggerType === 'hybrid') {
    const current = Number(currentPointValue) || 0;
    const interval = Number(plan.meterIntervalValue) || 0;

    let targetMeter = assetPlan.nextDueMeter;
    if ((targetMeter == null || targetMeter <= 0) && interval > 0) {
      const currentMultiple = Math.floor(current / interval);
      targetMeter = Math.max(interval, currentMultiple * interval);
    }

    if (targetMeter != null && targetMeter > 0 && interval > 0) {
      const cycleStart = Math.max(0, targetMeter - interval);
      progress = Math.min(100, Math.max(0, ((current - cycleStart) / interval) * 100));
      if (current >= targetMeter) {
        isOverdue = true;
        reasons.push(`Umbral de medidor alcanzado (${current}/${targetMeter})`);
      }
    }
  }

  return {
    isOverdue,
    progress,
    reason: reasons.join(' | ') || null,
    label: isOverdue ? 'Crítico' : progress >= 80 ? 'Próximo' : 'Al día',
  };
}

// ── Cycle weight ───────────────────────────────────────────────────────────

/**
 * The "weight" of a cycle is the highest frequency_multiplier among the tasks
 * that fire at that cycle index.  A cycle-12 annual (max multiplier = 12) is
 * heavier than a cycle-1 routine (max multiplier = 1).
 */
function calcCycleWeight(planTasks: any[], cycleIndex: number): number {
  const multipliers = planTasks
    .filter(t => cycleIndex % (t.frequencyMultiplier || 1) === 0)
    .map(t => t.frequencyMultiplier || 1);
  return multipliers.length > 0 ? Math.max(...multipliers) : 0;
}

// ── Effective cycle calculation ────────────────────────────────────────────

/**
 * Scans [from..to] and returns the cycle with the highest task weight.
 * On ties (equal weight) prefers the latest cycle — the most overdue critical event.
 * This guarantees that a skipped x12 annual is found even if the arithmetic
 * extreme lands on a lighter cycle (e.g. range [1..13] → picks 12, not 13).
 */
function heaviestCycleInRange(planTasks: any[], from: number, to: number): number {
  let heaviest = from;
  let maxWeight = calcCycleWeight(planTasks, from);

  for (let c = from + 1; c <= to; c++) {
    const w = calcCycleWeight(planTasks, c);
    if (w >= maxWeight) {
      maxWeight = w;
      heaviest = c;
    }
  }

  return heaviest;
}

/**
 * Returns the cycle index the engine should use for WO generation.
 *
 * When multiple intervals have elapsed (WO left open or maintenance skipped),
 * it scans the full range of reachable cycles and returns the one with the
 * highest task weight — so a skipped x12 annual always takes priority over
 * a lighter cycle that happens to be the arithmetic extreme.
 *
 * Example (meter, interval = 500 h):
 *   base = 1, nextDueMeter = 500, currentMeter = 6000
 *   range [1..12] → heaviest cycle = 12 (if x12 task exists) ✓
 *
 * Example (calendar, interval = 1 month, tasks x1/x3/x12):
 *   base = 1, nextDueDate 12 months ago → range [1..13]
 *   heaviest = cycle 12 (annual), not cycle 13 (routine) ✓
 */
function calcEffectiveCycleIndex(
  assetPlan: AssetPlan,
  plan: PmPlan,
  today: Date,
  currentMeterValue: number,
  planTasks: any[],
): number {
  const base = assetPlan.currentCycleIndex || 1;

  // Meter dimension (takes precedence for meter and hybrid plans)
  if (
    (plan.triggerType === 'meter' || plan.triggerType === 'hybrid') &&
    assetPlan.nextDueMeter != null &&
    plan.meterIntervalValue &&
    plan.meterIntervalValue > 0
  ) {
    const overshoot = currentMeterValue - assetPlan.nextDueMeter;
    if (overshoot > 0) {
      const maxCycle = base + Math.floor(overshoot / plan.meterIntervalValue);
      return heaviestCycleInRange(planTasks, base, maxCycle);
    }
    // Pure meter plan: meter hasn't fired, nothing more to check.
    // Hybrid plan: meter hasn't fired — fall through to calendar dimension scan
    // so a skipped heavy cycle (e.g. x12 annual) is still detected.
    if (plan.triggerType === 'meter') return base;
  }

  // Calendar dimension (calendar-only plans and hybrid when meter hasn't fired)
  if (
    (plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') &&
    assetPlan.nextDueDate &&
    plan.intervalValue &&
    plan.intervalUnit
  ) {
    const nextDue = parseISO(assetPlan.nextDueDate);
    if (isValid(nextDue) && isBefore(nextDue, today)) {
      const daysPast = differenceInDays(today, nextDue);
      const intervalDays = intervalToDays(plan.intervalValue, plan.intervalUnit);
      if (intervalDays > 0) {
        const maxCycle = base + Math.floor(daysPast / intervalDays);
        return heaviestCycleInRange(planTasks, base, maxCycle);
      }
    }
  }

  return base;
}

function intervalToDays(value: number, unit: string): number {
  switch (unit) {
    case 'days':   return value;
    case 'weeks':  return value * 7;
    case 'months': return value * 30.44;
    case 'years':  return value * 365.25;
    default:       return 30;
  }
}

// ── Scheduler types ────────────────────────────────────────────────────────

/** All data the scheduler needs for one evaluation pass. */
interface SchedulerInput {
  pmPlans: PmPlan[];
  assetPlans: AssetPlan[];
  measurementPoints: any[];
  pmTasks: any[];
  workOrders: any[];
  /** Rows from pm_meter_tolerance. Absent or empty → hardcoded safe defaults apply. */
  meterTolerances?: MeterTolerance[];
}

export interface GeneratedWo {
  id: string;
  assetId: string;
  assetPlanId: string;
  title: string;
  description: string | null;
  woType: string;
  status: string;
  priority: string;
  scheduledDate: string | null;
  dueDate: string | null;
  pmPlanIdSnapshot: string | null;
  pmPlanNameSnapshot: string | null;
  pmCycleIndex: number;
  generatedFromMeter: number | null;
  tasks: { id: string; description: string; sortOrder: number }[];
}

export interface SupersededAction {
  oldWoId: string;
  assetPlanId: string;
  oldCycleIndex: number;
  newCycleIndex: number;
  auditNote: string;
}

export interface SchedulerResult {
  generated: GeneratedWo[];
  skipped: string[];
  superseded: SupersededAction[];
}

// ── Terminal statuses ──────────────────────────────────────────────────────

const TERMINAL_STATUSES = ['completed', 'cancelled', 'cancelled_superseded'];

// ── Main scheduler ─────────────────────────────────────────────────────────

/**
 * Evaluates all active asset plans and generates Work Orders for those that have fired.
 *
 * Per-plan pipeline:
 *  1. Trigger evaluation  — calendar window and meter threshold checked independently.
 *  2. Task list build     — fetched upfront so cycle-weight scans have full task data.
 *  3. Effective cycle     — heaviest missed cycle in the elapsed range (skip-safe).
 *  4. Candidate tasks     — filtered by cycleIndex % frequencyMultiplier === 0.
 *  5. Anti-stacking       — blocks duplicate WO; supersedes open WO if new cycle is heavier.
 *  6. Date assignment     — calendar → nextDueDate; meter/hybrid-meter → today + tolerance.
 *                           Cycle index and threshold logic are never affected by dates.
 *
 * @param input        Plans, asset plans, measurement points, tasks, open WOs, and
 *                     optional pm_meter_tolerance rows for configurable grace windows.
 * @param horizonDays  Look-ahead window for calendar trigger evaluation (meter fires immediately).
 */
export function runScheduler(
  { pmPlans, assetPlans, measurementPoints, pmTasks, workOrders, meterTolerances = [] }: SchedulerInput,
  horizonDays: number,
): SchedulerResult {
  const generated: GeneratedWo[] = [];
  const skipped: string[] = [];
  const superseded: SupersededAction[] = [];

  const today = startOfDay(new Date());
  const horizon = addDays(today, horizonDays);

  // Build a quick lookup: criticality → tolerance row (fallback to safe defaults)
  const toleranceMap: Record<string, { scheduledOffset: number; dueOffset: number }> = {
    critical: { scheduledOffset: 0, dueOffset: 2 },
    high:     { scheduledOffset: 0, dueOffset: 5 },
    medium:   { scheduledOffset: 0, dueOffset: 14 },
    low:      { scheduledOffset: 0, dueOffset: 30 },
  };
  for (const t of meterTolerances) {
    toleranceMap[t.criticality] = {
      scheduledOffset: t.scheduledOffsetDays,
      dueOffset: t.dueOffsetDays,
    };
  }

  for (const assetPlan of assetPlans.filter(ap => ap.active)) {
    const plan = pmPlans.find(p => p.id === assetPlan.pmPlanId);
    if (!plan) {
      skipped.push(assetPlan.id);
      continue;
    }

    const point = assetPlan.measurementPointId
      ? measurementPoints.find((p: any) => p.id === assetPlan.measurementPointId)
      : null;
    const currentMeterValue: number = point?.currentValue ?? 0;

    // ── Step 1: Trigger evaluation ───────────────────────────────────────
    // Calendar and meter are evaluated independently so hybrid fires on either.

    let calendarFires = false;
    let meterFires = false;

    if (plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') {
      calendarFires = evalCalendarTrigger(assetPlan, plan, today, horizon);
    }

    if (plan.triggerType === 'meter' || plan.triggerType === 'hybrid') {
      meterFires = evalMeterTrigger(assetPlan, plan, currentMeterValue);
    }

    const shouldGenerate = calendarFires || meterFires;
    // For hybrid: meter wins the due-date calculation if it fires before calendar
    const meterTriggered = meterFires && plan.triggerType === 'hybrid';

    if (!shouldGenerate) {
      skipped.push(assetPlan.id);
      continue;
    }

    // ── Step 2: Task list for this plan ──────────────────────────────────
    // Must be computed before calcEffectiveCycleIndex so the range scan
    // can evaluate task weights when looking for the heaviest missed cycle.
    const planTasks = pmTasks.filter((t: any) => t.pmPlanId === plan.id);

    // ── Step 3: Effective cycle index ────────────────────────────────────
    const effectiveCycle = calcEffectiveCycleIndex(assetPlan, plan, today, currentMeterValue, planTasks);

    // ── Step 4: Candidate tasks for this cycle (modular arithmetic) ──────
    const candidateTasks = planTasks
      .filter((t: any) => effectiveCycle % (t.frequencyMultiplier || 1) === 0)
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
      .map((t: any, idx: number) => ({
        id: generateId(),
        description: t.description,
        sortOrder: idx,
      }));

    if (candidateTasks.length === 0) {
      skipped.push(assetPlan.id);
      continue;
    }

    // ── Step 4: Hierarchical anti-stacking ───────────────────────────────
    const existingOpenWo = workOrders.find(
      (w: any) =>
        w.assetPlanId === assetPlan.id &&
        !TERMINAL_STATUSES.includes(w.status),
    );

    if (existingOpenWo) {
      const existingCycle = existingOpenWo.pmCycleIndex ?? (assetPlan.currentCycleIndex || 1);
      const existingWeight = calcCycleWeight(planTasks, existingCycle);
      const newWeight = calcCycleWeight(planTasks, effectiveCycle);

      if (newWeight <= existingWeight) {
        // Same or lower maintenance scope — block as pure duplicate
        skipped.push(assetPlan.id);
        continue;
      }

      // New cycle is heavier — supersede the open WO and generate the critical one
      superseded.push({
        oldWoId: existingOpenWo.id,
        assetPlanId: assetPlan.id,
        oldCycleIndex: existingCycle,
        newCycleIndex: effectiveCycle,
        auditNote:
          `Ciclo ${effectiveCycle} (peso ${newWeight}) absorbió Ciclo ${existingCycle} ` +
          `(peso ${existingWeight}). Mantenimiento mayor generado automáticamente.`,
      });
      // Fall through — generate the higher-weight WO below
    }

    // ── Step 5: Build Work Order ─────────────────────────────────────────
    const priority = (
      { critical: 'critical', high: 'high', medium: 'medium', low: 'low' } as Record<string, string>
    )[plan.criticality] ?? 'medium';

    const tol = toleranceMap[plan.criticality] ?? toleranceMap['medium'];
    const scheduledDate = buildScheduledDate(assetPlan, plan, today, meterTriggered, tol.scheduledOffset);
    const dueDate = buildDueDate(assetPlan, plan, today, meterTriggered, tol.dueOffset);
    const generatedFromMeter = meterFires
      ? snapMeterTarget(plan, currentMeterValue, assetPlan.nextDueMeter)
      : null;

    generated.push({
      id: generateId(),
      assetId: assetPlan.assetId,
      assetPlanId: assetPlan.id,
      title: `PM — ${plan.name}`,
      description: plan.description,
      woType: 'preventive',
      status: 'open',
      priority,
      scheduledDate,
      dueDate,
      pmPlanIdSnapshot: plan.id,
      pmPlanNameSnapshot: plan.name,
      pmCycleIndex: effectiveCycle,
      generatedFromMeter,
      tasks: candidateTasks,
    });
  }

  return { generated, skipped, superseded };
}

// ── Trigger evaluators ─────────────────────────────────────────────────────

function evalCalendarTrigger(
  assetPlan: AssetPlan,
  plan: PmPlan,
  today: Date,
  horizon: Date,
): boolean {
  if (!assetPlan.nextDueDate) return true; // No date set → generate immediately

  const nextDue = parseISO(assetPlan.nextDueDate);
  if (!isValid(nextDue)) return false;
  if (isBefore(nextDue, today)) return true; // Already overdue

  const effectiveLeadDays = Math.min(plan.leadDays || 0, differenceInDays(horizon, today));
  const leadDate = addDays(nextDue, -effectiveLeadDays);
  return !isAfter(leadDate, today) || !isAfter(nextDue, horizon);
}

function evalMeterTrigger(
  assetPlan: AssetPlan,
  plan: PmPlan,
  currentValue: number,
): boolean {
  if (!assetPlan.measurementPointId) return false;

  const interval = plan.meterIntervalValue || 0;
  if (interval <= 0) return false;

  let target = assetPlan.nextDueMeter;
  if (target == null || target <= 0) {
    const multiple = Math.floor(currentValue / interval);
    target = Math.max(interval, multiple * interval);
  }

  return currentValue >= target;
}

// ── Date builders ──────────────────────────────────────────────────────────

/**
 * Returns the ISO-formatted scheduled start date for a WO (when the technician should begin).
 *
 * Calendar / calendar-dimension of hybrid:
 *   nextDueDate − leadDays  (technician preparation window before the hard deadline)
 *
 * Meter-only / hybrid where meter fired first:
 *   today + meterScheduledOffset  (0 = start on the trigger day; configurable per criticality)
 *
 * The offset comes from the pm_meter_tolerance row for the plan's criticality.
 */
function buildScheduledDate(
  assetPlan: AssetPlan,
  plan: PmPlan,
  today: Date,
  meterTriggeredHybrid: boolean,
  meterScheduledOffset: number = 0,
): string {
  // Meter-only or hybrid where meter fired: anchor to today + configured offset
  if (plan.triggerType === 'meter' || meterTriggeredHybrid) {
    return format(addDays(today, meterScheduledOffset), 'yyyy-MM-dd');
  }

  // Calendar plan: start work leadDays before the due date
  if (assetPlan.nextDueDate) {
    const nextDue = parseISO(assetPlan.nextDueDate);
    if (isValid(nextDue)) {
      return format(addDays(nextDue, -(plan.leadDays || 0)), 'yyyy-MM-dd');
    }
  }

  return format(today, 'yyyy-MM-dd');
}

/**
 * Returns the ISO-formatted hard deadline date for a WO (the manager's SLA).
 *
 * Calendar / calendar-dimension of hybrid:
 *   nextDueDate  (the plan's contractual maintenance date)
 *
 * Meter-only / hybrid where meter fired first:
 *   today + meterDueOffset  (grace window per criticality from pm_meter_tolerance)
 *   Defaults — critical: 2 d · high: 5 d · medium: 14 d · low: 30 d
 *
 * Always returns a non-null string so Kanban and Calendar can always display the WO.
 */
function buildDueDate(
  assetPlan: AssetPlan,
  plan: PmPlan,
  today: Date,
  meterTriggeredHybrid: boolean,
  meterDueOffset: number = 14,
): string {
  // Meter-only or hybrid where meter fired: due = today + tolerance window
  if (plan.triggerType === 'meter' || meterTriggeredHybrid) {
    return format(addDays(today, meterDueOffset), 'yyyy-MM-dd');
  }

  // Calendar plan: due date is the nextDueDate itself
  return assetPlan.nextDueDate ?? format(today, 'yyyy-MM-dd');
}

function snapMeterTarget(
  plan: PmPlan,
  currentValue: number,
  storedTarget: number | null,
): number | null {
  if (storedTarget != null && storedTarget > 0) return storedTarget;
  const interval = plan.meterIntervalValue;
  if (!interval || interval <= 0) return null;
  const multiple = Math.floor(currentValue / interval);
  return Math.max(interval, multiple * interval);
}
