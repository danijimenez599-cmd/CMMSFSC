import { addMonths, addDays, addWeeks, addYears, parseISO, isAfter, isValid } from 'date-fns';

export interface ProjectedOccurrence {
  date: Date;
  cycleIndex: number;
  isMajor: boolean;
  tasksCount: number;
  label: string;
  tasksNames?: string[];
}

export function calculateProjections(
  assetPlan: any, 
  pmPlan: any, 
  horizonMonths: number = 12
): ProjectedOccurrence[] {
  try {
    if (!pmPlan || !assetPlan || !assetPlan.active) return [];

    const projections: ProjectedOccurrence[] = [];
    const horizonDate = addMonths(new Date(), horizonMonths);
    
    // Fallback de fecha segura
    let currentSimDate: Date;
    try {
      currentSimDate = assetPlan.nextDueDate ? parseISO(assetPlan.nextDueDate) : new Date();
      if (!isValid(currentSimDate)) currentSimDate = new Date();
    } catch (e) {
      currentSimDate = new Date();
    }

    let currentSimCycle = Number(assetPlan.currentCycleIndex) || 0;

    let iterations = 0;
    const maxIterations = 100;

    while (isAfter(horizonDate, currentSimDate) && iterations < maxIterations) {
      iterations++;
      currentSimCycle++;

      const tasks = Array.isArray(pmPlan.tasks) ? pmPlan.tasks : [];
      const triggeringTasks = tasks.filter((t: any) => {
        const multiplier = Math.max(1, Number(t.frequencyMultiplier) || 1);
        return currentSimCycle % multiplier === 0;
      });

      if (triggeringTasks.length > 0) {
        const maxMult = Math.max(...triggeringTasks.map((t: any) => Number(t.frequencyMultiplier) || 1));
        let typeLabel = 'Rutinario';
        if (maxMult >= 12) typeLabel = 'ANUAL';
        else if (maxMult >= 3) typeLabel = 'TRIMESTRAL';
        else if (maxMult >= 2) typeLabel = 'SEMESTRAL';

        projections.push({
          date: new Date(currentSimDate),
          cycleIndex: currentSimCycle,
          isMajor: maxMult > 1,
          tasksCount: triggeringTasks.length,
          label: `${typeLabel} (Ciclo ${currentSimCycle})`,
          tasksNames: triggeringTasks.map((t: any) => t.description || 'Tarea sin descripción')
        });
      }

      // Avance de fecha seguro
      const val = Math.max(1, Number(pmPlan.intervalValue) || 1);
      const unit = pmPlan.intervalUnit;

      if (unit === 'days') currentSimDate = addDays(currentSimDate, val);
      else if (unit === 'weeks') currentSimDate = addWeeks(currentSimDate, val);
      else if (unit === 'months') currentSimDate = addMonths(currentSimDate, val);
      else if (unit === 'years') currentSimDate = addYears(currentSimDate, val);
      else currentSimDate = addMonths(currentSimDate, 1);

      if (!isValid(currentSimDate)) break;
    }

    return projections;
  } catch (criticalError) {
    console.error('Error crítico en motor de proyecciones:', criticalError);
    return [];
  }
}
