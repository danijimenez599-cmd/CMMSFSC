import { addDays, addWeeks, addMonths, addYears, parseISO, isValid, isSameDay } from 'date-fns';

export interface ProjectionPoint {
  date: Date;
  label: string;
  isMajor: boolean;
  cycleIndex: number;
  tasksNames: string[];
  tasksCount: number;
}

/**
 * Motor de Simulación de Mantenimiento APEX
 * Proyecta los próximos N meses basándose en el ciclo actual del activo.
 */
export function calculateProjections(
  assetPlan: any,
  pmPlan: any,
  horizonMonths: number = 24
): ProjectionPoint[] {
  const projections: ProjectionPoint[] = [];
  
  try {
    if (!assetPlan || !pmPlan || !pmPlan.intervalValue) return [];

    // Fallback de fecha segura
    let currentSimDate: Date;
    try {
      currentSimDate = assetPlan.nextDueDate ? parseISO(assetPlan.nextDueDate) : new Date();
      if (!isValid(currentSimDate)) currentSimDate = new Date();
    } catch (e) {
      currentSimDate = new Date();
    }

    let currentSimCycle = Number(assetPlan.currentCycleIndex) || 1;
    const horizonDate = addMonths(new Date(), horizonMonths);
    const tasks = Array.isArray(pmPlan.tasks) ? pmPlan.tasks : [];

    // Limit to 100 iterations to prevent infinite loops on misconfigured plans
    let iterations = 0;
    let isFirstIteration = true;

    while (currentSimDate <= horizonDate && iterations < 100) {
      iterations++;

      // First iteration evaluates the current cycle using nextDueDate as-is (the real next event).
      // Subsequent iterations advance the cycle and date before evaluating (Fix 2.2).
      if (!isFirstIteration) {
        switch (pmPlan.intervalUnit) {
          case 'days': currentSimDate = addDays(currentSimDate, pmPlan.intervalValue); break;
          case 'weeks': currentSimDate = addWeeks(currentSimDate, pmPlan.intervalValue); break;
          case 'months': currentSimDate = addMonths(currentSimDate, pmPlan.intervalValue); break;
          case 'years': currentSimDate = addYears(currentSimDate, pmPlan.intervalValue); break;
          default: currentSimDate = addMonths(currentSimDate, 1);
        }
        currentSimCycle++;
        if (!isValid(currentSimDate)) break;
      }
      isFirstIteration = false;

      const cycleTasks = tasks.filter((t: any) => {
        const mult = Number(t.frequencyMultiplier) || 1;
        return currentSimCycle % mult === 0;
      });

      if (cycleTasks.length > 0) {
        const isMajor = cycleTasks.some((t: any) => (Number(t.frequencyMultiplier) || 1) > 1);
        projections.push({
          date: new Date(currentSimDate),
          label: isMajor ? 'Mantenimiento Mayor' : 'Rutina Preventiva',
          isMajor,
          cycleIndex: currentSimCycle,
          tasksNames: cycleTasks.map((t: any) => t.description),
          tasksCount: cycleTasks.length
        });
      }
    }
  } catch (error) {
    console.error('Error en el motor de proyecciones:', error);
    return [];
  }

  return projections;
}
