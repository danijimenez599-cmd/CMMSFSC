/**
 * APEX CMMS — PM Scheduling Engine
 * Generates Work Orders based on PM Plan triggers.
 * Do NOT modify without updating schema.sql accordingly.
 */

import {
  addDays, addWeeks, addMonths, addYears,
  isBefore, isAfter, startOfDay, parseISO, format
} from 'date-fns';
import { PmPlan, AssetPlan } from '../types';
import { generateId } from '../../../shared/utils/utils';

// ── Helpers ────────────────────────────────────────────────────────────────

export function calcNextDueDate(
  plan: PmPlan,
  assetPlan: Pick<AssetPlan, 'nextDueDate' | 'lastCompletedAt'>,
  completedAt?: string
): string {
  if (!plan.intervalValue || !plan.intervalUnit) {
    return addDays(new Date(), 30).toISOString();
  }

  // FIXED mode: advance from previous due date to maintain a rigid calendar
  // FLOATING mode: advance from completion date (adaptive calendar)
  let base: Date;
  if (plan.intervalMode === 'fixed' && assetPlan.nextDueDate) {
    base = new Date(assetPlan.nextDueDate);
    if (isNaN(base.getTime())) {
      base = completedAt ? new Date(completedAt) : new Date();
    }
  } else {
    base = completedAt
      ? new Date(completedAt)
      : assetPlan.nextDueDate
        ? new Date(assetPlan.nextDueDate)
        : new Date();
  }

  let next: Date;
  switch (plan.intervalUnit) {
    case 'days': next = addDays(base, plan.intervalValue); break;
    case 'weeks': next = addWeeks(base, plan.intervalValue); break;
    case 'months': next = addMonths(base, plan.intervalValue); break;
    case 'years': next = addYears(base, plan.intervalValue); break;
    default: next = addMonths(base, 1);
  }

  return next.toISOString();
}

/**
 * Computes the unified status of an asset plan (Overdue, Progress, etc.)
 * Centralizing this prevents UI crashes and logic discrepancies.
 */
export interface PlanStatus {
  isOverdue: boolean;
  progress: number; // 0 to 100
  reason: string | null;
  label: string;
}

export function computePlanStatus(
  plan: PmPlan | undefined | null,
  assetPlan: AssetPlan | undefined | null,
  currentPointValue: number | null = 0
): PlanStatus {
  if (!plan || !assetPlan || !assetPlan.active) {
    return { isOverdue: false, progress: 0, reason: null, label: 'Inactivo' };
  }

  let isOverdue = false;
  let progress = 0;
  let reasons: string[] = [];

  const now = new Date();

  // 1. Calendar Logic
  if (plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') {
    if (assetPlan.nextDueDate) {
      const dueDate = new Date(assetPlan.nextDueDate);
      if (!isNaN(dueDate.getTime())) {
        if (dueDate < now) {
          isOverdue = true;
          reasons.push('Calendario vencido');
        }
        // Simple linear progress for calendar (optional, usually date is enough)
      }
    }
  }

  // 2. Meter Logic
  if (plan.triggerType === 'meter' || plan.triggerType === 'hybrid') {
    if (assetPlan.nextDueMeter != null && assetPlan.nextDueMeter > 0) {
      const current = Number(currentPointValue) || 0;
      const threshold = Number(assetPlan.nextDueMeter);
      
      progress = Math.min(100, Math.max(0, (current / threshold) * 100));
      
      if (current >= threshold) {
        isOverdue = true;
        reasons.push('Umbral de medidor alcanzado');
      }
    }
  }

  return {
    isOverdue,
    progress,
    reason: reasons.join(' | ') || null,
    label: isOverdue ? 'Crítico' : progress >= 80 ? 'Próximo' : 'Al día'
  };
}

// ── Main Scheduler ─────────────────────────────────────────────────────────

interface SchedulerInput {
  pmPlans: PmPlan[];
  assetPlans: AssetPlan[];
  measurementPoints: any[];
  pmTasks: any[];
  workOrders: any[];
}

interface GeneratedWo {
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
  tasks: { id: string; description: string; sortOrder: number }[];
}

interface SchedulerResult {
  generated: GeneratedWo[];
  skipped: string[];
}

export function runScheduler(
  { pmPlans, assetPlans, measurementPoints, pmTasks, workOrders }: SchedulerInput,
  horizonDays: number
): SchedulerResult {
  const generated: GeneratedWo[] = [];
  const skipped: string[] = [];
  const today = startOfDay(new Date());
  const horizon = addDays(today, horizonDays);

  const activeAssetPlans = assetPlans.filter(ap => ap.active);

  for (const assetPlan of activeAssetPlans) {
    const plan = pmPlans.find(p => p.id === assetPlan.pmPlanId);
    if (!plan) {
      console.log(`[Engine] Saltando AP ${assetPlan.id}: Plan no encontrado`);
      skipped.push(assetPlan.id);
      continue;
    }

    // Check for existing open WO for this asset plan
    const existingOpenWo = workOrders.find(
      (w: any) => w.assetPlanId === assetPlan.id && !['completed', 'cancelled'].includes(w.status)
    );
    if (existingOpenWo) {
      console.log(`[Engine] Saltando AP ${assetPlan.id}: Ya tiene OT abierta (${existingOpenWo.woNumber})`);
      skipped.push(assetPlan.id);
      continue;
    }

    let shouldGenerate = false;
    let reason = '';

    // Calendar trigger
    if (plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') {
      if (assetPlan.nextDueDate) {
        const nextDue = parseISO(assetPlan.nextDueDate);
        if (isNaN(nextDue.getTime())) {
          reason = 'Fecha de vencimiento inválida';
        } else if (isBefore(nextDue, today)) {
          shouldGenerate = true;
          reason = `Vencida desde ${assetPlan.nextDueDate}`;
        } else {
          // Lead days cannot exceed the horizon to prevent premature generation
          const effectiveLeadDays = Math.min(plan.leadDays || 0, horizonDays);
          const leadDate = addDays(nextDue, -effectiveLeadDays);
          if (!isAfter(leadDate, today)) {
            shouldGenerate = true;
            reason = `Vencimiento ${assetPlan.nextDueDate} con lead ${effectiveLeadDays}d — en ventana de generación`;
          } else if (!isAfter(nextDue, horizon)) {
            shouldGenerate = true;
            reason = `Vencimiento ${assetPlan.nextDueDate} dentro del horizonte de ${horizonDays}d`;
          } else {
            reason = `Vencimiento ${assetPlan.nextDueDate} fuera del horizonte`;
          }
        }
      } else {
        shouldGenerate = true; // No due date = generate now
        reason = 'Sin fecha de vencimiento previa';
      }
    }

    // Meter trigger
    if (!shouldGenerate && (plan.triggerType === 'meter' || plan.triggerType === 'hybrid')) {
      if (assetPlan.measurementPointId && assetPlan.nextDueMeter !== null) {
        const point = measurementPoints.find((p: any) => p.id === assetPlan.measurementPointId);
        if (point && point.currentValue !== null && point.currentValue >= assetPlan.nextDueMeter) {
          shouldGenerate = true;
          reason = `Medidor ${point.currentValue} >= Umbral ${assetPlan.nextDueMeter}`;
        } else if (point) {
          reason = `Medidor ${point.currentValue} < Umbral ${assetPlan.nextDueMeter}`;
        }
      }
    }

    if (!shouldGenerate) {
      console.log(`[Engine] Saltando AP ${assetPlan.id} (${plan.name}): No cumple criterios. Razón: ${reason}`);
      skipped.push(assetPlan.id);
      continue;
    }

    console.log(`[Engine] GENERANDO OT para AP ${assetPlan.id} (${plan.name}). Razón: ${reason}`);

    // Build WO tasks based on cycle multiplier
    const currentCycle = assetPlan.currentCycleIndex || 1;
    const planTasks = pmTasks
      .filter((t: any) => {
        if (t.pmPlanId !== plan.id) return false;
        // Logic: Include task if (Current Cycle % Multiplier == 0)
        return currentCycle % (t.frequencyMultiplier || 1) === 0;
      })
      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
      .map((t: any, idx: number) => ({
        id: generateId(),
        description: t.description,
        sortOrder: idx,
      }));

    // If no tasks match this cycle (rare but possible), we still generate the WO 
    // or we could skip. Industrial preference: Always have at least the x1 tasks.
    if (planTasks.length === 0) {
      console.log(`[Engine] Saltando AP ${assetPlan.id}: No hay tareas para el ciclo ${currentCycle}`);
      skipped.push(assetPlan.id);
      continue;
    }

    // Priority based on criticality
    const priorityMap: Record<string, string> = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };

    const priority = priorityMap[plan.criticality] || 'medium';

    const scheduledDate = assetPlan.nextDueDate
      ? format(addDays(parseISO(assetPlan.nextDueDate), -(plan.leadDays || 0)), 'yyyy-MM-dd')
      : format(today, 'yyyy-MM-dd');

    // If no nextDueDate and not purely meter-based, calculate first due date to
    // prevent the scheduler from generating a new WO on every run (Fix 6.2)
    let dueDate: string | null;
    if (assetPlan.nextDueMeter && !assetPlan.nextDueDate) {
      dueDate = null;
    } else if (assetPlan.nextDueDate) {
      dueDate = assetPlan.nextDueDate;
    } else {
      const computedNext = calcNextDueDate(plan, assetPlan, format(today, "yyyy-MM-dd'T'HH:mm:ss"));
      dueDate = format(new Date(computedNext), 'yyyy-MM-dd');
    }

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
      pmCycleIndex: currentCycle,
      tasks: planTasks,
    });
  }

  return { generated, skipped: skipped };
}
