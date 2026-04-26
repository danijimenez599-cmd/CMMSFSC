/**
 * APEX CMMS — PM Scheduling Engine v2
 *
 * Redesigned architecture:
 *  1. Trigger evaluation (calendar + meter independent for hybrid)
 *  2. Effective cycle calculation — accounts for missed intervals while a WO was open
 *  3. Modular task filtering — cycle % multiplier == 0
 *  4. Hierarchical Anti-stacking — weight comparison before blocking or superseding
 *  5. Supersession — higher-weight cycle absorbs a lower-weight open WO
 */

import {
  addDays, addWeeks, addMonths, addYears,
  isBefore, isAfter, differenceInDays,
  startOfDay, parseISO, format, isValid,
} from 'date-fns';
import { PmPlan, AssetPlan } from '../types';
import { generateId } from '../../../shared/utils/utils';

// ── Calendar helper ────────────────────────────────────────────────────────

export function calcNextDueDate(
  plan: PmPlan,
  assetPlan: Pick<AssetPlan, 'nextDueDate' | 'lastCompletedAt'>,
  completedAt?: string,
): string {
  if (!plan.intervalValue || !plan.intervalUnit) {
    return addDays(new Date(), 30).toISOString();
  }

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
    case 'days':   return addDays(base, plan.intervalValue).toISOString();
    case 'weeks':  return addWeeks(base, plan.intervalValue).toISOString();
    case 'months': return addMonths(base, plan.intervalValue).toISOString();
    case 'years':  return addYears(base, plan.intervalValue).toISOString();
    default:       return addMonths(base, 1).toISOString();
  }
}

// ── UI status helper ───────────────────────────────────────────────────────

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
 * Returns the cycle index the engine should use for WO generation, accounting
 * for intervals that elapsed while a previous WO was left open.
 *
 * Example (meter plan, interval = 500 h):
 *   currentCycleIndex = 1, nextDueMeter = 500, currentMeter = 6000
 *   overshoot = 6000 - 500 = 5500 → extraCycles = floor(5500/500) = 11
 *   effectiveCycle = 1 + 11 = 12  → annual maintenance fires
 *
 * Example (calendar plan, interval = 1 month):
 *   currentCycleIndex = 1, nextDueDate = 2025-01-01, today = 2026-01-01
 *   daysPast = 365 → extraCycles = floor(365/30.44) = 11 → effectiveCycle = 12
 */
function calcEffectiveCycleIndex(
  assetPlan: AssetPlan,
  plan: PmPlan,
  today: Date,
  currentMeterValue: number,
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
      return base + Math.floor(overshoot / plan.meterIntervalValue);
    }
    return base;
  }

  // Calendar dimension (calendar-only plans)
  if (
    plan.triggerType === 'calendar' &&
    assetPlan.nextDueDate &&
    plan.intervalValue &&
    plan.intervalUnit
  ) {
    const nextDue = parseISO(assetPlan.nextDueDate);
    if (isValid(nextDue) && isBefore(nextDue, today)) {
      const daysPast = differenceInDays(today, nextDue);
      const intervalDays = intervalToDays(plan.intervalValue, plan.intervalUnit);
      if (intervalDays > 0) {
        return base + Math.floor(daysPast / intervalDays);
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

interface SchedulerInput {
  pmPlans: PmPlan[];
  assetPlans: AssetPlan[];
  measurementPoints: any[];
  pmTasks: any[];
  workOrders: any[];
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

export function runScheduler(
  { pmPlans, assetPlans, measurementPoints, pmTasks, workOrders }: SchedulerInput,
  horizonDays: number,
): SchedulerResult {
  const generated: GeneratedWo[] = [];
  const skipped: string[] = [];
  const superseded: SupersededAction[] = [];

  const today = startOfDay(new Date());
  const horizon = addDays(today, horizonDays);

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

    // ── Step 2: Effective cycle index ────────────────────────────────────
    const effectiveCycle = calcEffectiveCycleIndex(assetPlan, plan, today, currentMeterValue);

    // ── Step 3: Task list for this cycle (modular arithmetic) ────────────
    const planTasks = pmTasks.filter((t: any) => t.pmPlanId === plan.id);
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

    const scheduledDate = buildScheduledDate(assetPlan, plan, today, meterTriggered);
    const dueDate = buildDueDate(assetPlan, plan, today, meterTriggered);
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

function buildScheduledDate(
  assetPlan: AssetPlan,
  plan: PmPlan,
  today: Date,
  meterTriggeredHybrid: boolean,
): string {
  if (meterTriggeredHybrid) return format(today, 'yyyy-MM-dd');

  if (assetPlan.nextDueDate) {
    const nextDue = parseISO(assetPlan.nextDueDate);
    if (isValid(nextDue)) {
      return format(addDays(nextDue, -(plan.leadDays || 0)), 'yyyy-MM-dd');
    }
  }

  return format(today, 'yyyy-MM-dd');
}

function buildDueDate(
  assetPlan: AssetPlan,
  plan: PmPlan,
  today: Date,
  meterTriggeredHybrid: boolean,
): string | null {
  if (meterTriggeredHybrid) return format(today, 'yyyy-MM-dd');
  if (plan.triggerType === 'meter' && !assetPlan.nextDueDate) return null;
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
