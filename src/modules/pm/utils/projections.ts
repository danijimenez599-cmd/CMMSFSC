import { addDays, addWeeks, addMonths, addYears, parseISO, isValid, isSameDay } from 'date-fns';

export interface ProjectionPoint {
  date: Date | null;
  meterValue: number | null;
  label: string;
  isMajor: boolean;
  cycleIndex: number;
  tasksNames: string[];
  tasksCount: number;
}

/**
 * Motor de Simulación de Mantenimiento APEX
 * Proyecta los próximos N meses/ciclos basándose en el tipo de trigger del plan.
 *
 * - calendar: avanza por fecha calendario
 * - meter: avanza por umbral acumulativo (nextDueMeter + interval * n)
 * - hybrid: proyecta el trigger que ocurra PRIMERO en cada ciclo (fecha vs medidor)
 */
export function calculateProjections(
  assetPlan: any,
  pmPlan: any,
  horizonMonths: number = 24
): ProjectionPoint[] {
  const projections: ProjectionPoint[] = [];

  try {
    if (!assetPlan || !pmPlan) return [];

    const triggerType: string = pmPlan.triggerType || 'calendar';
    const isMeter = triggerType === 'meter' || triggerType === 'hybrid';
    const isCalendar = triggerType === 'calendar' || triggerType === 'hybrid';

    // Guard: need at least one valid interval
    if (isCalendar && !pmPlan.intervalValue) return [];
    if (triggerType === 'meter' && !pmPlan.meterIntervalValue) return [];

    const tasks = Array.isArray(pmPlan.tasks) ? pmPlan.tasks : [];
    let currentSimCycle = Number(assetPlan.currentCycleIndex) || 1;
    const horizonDate = addMonths(new Date(), horizonMonths);
    const MAX_ITER = 120;

    // ── CALENDAR-only ───────────────────────────────────────────────────────
    if (triggerType === 'calendar') {
      let currentSimDate: Date;
      try {
        currentSimDate = assetPlan.nextDueDate ? parseISO(assetPlan.nextDueDate) : new Date();
        if (!isValid(currentSimDate)) currentSimDate = new Date();
      } catch {
        currentSimDate = new Date();
      }

      let iterations = 0;
      let isFirst = true;

      while (currentSimDate <= horizonDate && iterations < MAX_ITER) {
        iterations++;
        if (!isFirst) {
          switch (pmPlan.intervalUnit) {
            case 'days':   currentSimDate = addDays(currentSimDate, pmPlan.intervalValue); break;
            case 'weeks':  currentSimDate = addWeeks(currentSimDate, pmPlan.intervalValue); break;
            case 'months': currentSimDate = addMonths(currentSimDate, pmPlan.intervalValue); break;
            case 'years':  currentSimDate = addYears(currentSimDate, pmPlan.intervalValue); break;
            default:       currentSimDate = addMonths(currentSimDate, 1);
          }
          currentSimCycle++;
          if (!isValid(currentSimDate)) break;
        }
        isFirst = false;

        const cycleTasks = tasks.filter((t: any) => currentSimCycle % (Number(t.frequencyMultiplier) || 1) === 0);
        if (cycleTasks.length > 0) {
          projections.push({
            date: new Date(currentSimDate),
            meterValue: null,
            label: cycleTasks.some((t: any) => (Number(t.frequencyMultiplier) || 1) > 1) ? 'Mantenimiento Mayor' : 'Rutina Preventiva',
            isMajor: cycleTasks.some((t: any) => (Number(t.frequencyMultiplier) || 1) > 1),
            cycleIndex: currentSimCycle,
            tasksNames: cycleTasks.map((t: any) => t.description),
            tasksCount: cycleTasks.length,
          });
        }
      }
      return projections;
    }

    // ── METER-only ──────────────────────────────────────────────────────────
    if (triggerType === 'meter') {
      const interval = Number(pmPlan.meterIntervalValue);
      if (!interval) return [];

      let currentMeter = Number(assetPlan.nextDueMeter) || interval;
      let iterations = 0;

      // Project up to MAX_ITER cycles (no calendar horizon for pure meter)
      while (iterations < MAX_ITER) {
        iterations++;

        const cycleTasks = tasks.filter((t: any) => currentSimCycle % (Number(t.frequencyMultiplier) || 1) === 0);
        if (cycleTasks.length > 0) {
          projections.push({
            date: null,
            meterValue: currentMeter,
            label: cycleTasks.some((t: any) => (Number(t.frequencyMultiplier) || 1) > 1) ? 'Mantenimiento Mayor' : 'Rutina Preventiva',
            isMajor: cycleTasks.some((t: any) => (Number(t.frequencyMultiplier) || 1) > 1),
            cycleIndex: currentSimCycle,
            tasksNames: cycleTasks.map((t: any) => t.description),
            tasksCount: cycleTasks.length,
          });
        }

        currentMeter += interval;
        currentSimCycle++;

        // Limit to ~24 future events for readability
        if (projections.length >= 24) break;
      }
      return projections;
    }

    // ── HYBRID (calendar OR meter — whichever first) ─────────────────────────
    {
      const meterInterval = Number(pmPlan.meterIntervalValue);
      if (!meterInterval) return [];

      let currentMeter = Number(assetPlan.nextDueMeter) || meterInterval;

      let currentSimDate: Date;
      try {
        currentSimDate = assetPlan.nextDueDate ? parseISO(assetPlan.nextDueDate) : new Date();
        if (!isValid(currentSimDate)) currentSimDate = new Date();
      } catch {
        currentSimDate = new Date();
      }

      let iterations = 0;
      let isFirst = true;

      while (iterations < MAX_ITER) {
        iterations++;

        if (!isFirst) {
          // Advance calendar
          switch (pmPlan.intervalUnit) {
            case 'days':   currentSimDate = addDays(currentSimDate, pmPlan.intervalValue); break;
            case 'weeks':  currentSimDate = addWeeks(currentSimDate, pmPlan.intervalValue); break;
            case 'months': currentSimDate = addMonths(currentSimDate, pmPlan.intervalValue); break;
            case 'years':  currentSimDate = addYears(currentSimDate, pmPlan.intervalValue); break;
            default:       currentSimDate = addMonths(currentSimDate, 1);
          }
          // Advance meter
          currentMeter += meterInterval;
          currentSimCycle++;
          if (!isValid(currentSimDate)) break;
        }
        isFirst = false;

        if (currentSimDate > horizonDate) break;

        const cycleTasks = tasks.filter((t: any) => currentSimCycle % (Number(t.frequencyMultiplier) || 1) === 0);
        if (cycleTasks.length > 0) {
          const isMajor = cycleTasks.some((t: any) => (Number(t.frequencyMultiplier) || 1) > 1);
          projections.push({
            date: new Date(currentSimDate),
            meterValue: currentMeter,
            label: isMajor ? 'Mantenimiento Mayor' : 'Rutina Preventiva',
            isMajor,
            cycleIndex: currentSimCycle,
            tasksNames: cycleTasks.map((t: any) => t.description),
            tasksCount: cycleTasks.length,
          });
        }
      }
      return projections;
    }
  } catch (error) {
    console.error('Error en el motor de proyecciones:', error);
    return [];
  }
}
