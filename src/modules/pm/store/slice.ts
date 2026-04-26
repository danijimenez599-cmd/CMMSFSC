import { StateCreator } from 'zustand';
import { StoreState } from '../../../store';
import { PmPlan, AssetPlan, MeasurementPoint, MeterReading, PmTask, MeasurementConfig } from '../types';
import { WorkOrder } from '../../workorders/types';
import { runScheduler, calcNextDueDate, SupersededAction } from './pmEngine';
import { generateId } from '../../../shared/utils/utils';
import { supabase } from '../../../lib/supabase';

export interface PmSlice {
  pmPlans: PmPlan[];
  pmTasks: PmTask[];
  assetPlans: AssetPlan[];
  measurementConfigs: MeasurementConfig[];
  measurementPoints: MeasurementPoint[];
  meterReadings: MeterReading[];
  pmLoading: boolean;
  /** Global projection horizon in months. Default 12, max 24. */
  projectionMonths: number;
  setProjectionMonths: (months: number) => void;

  fetchPmData: () => Promise<void>;
  savePlan: (plan: PmPlan, tasks: PmTask[]) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;

  saveAssetPlan: (assetPlan: AssetPlan) => Promise<void>;
  toggleAssetPlan: (id: string, active: boolean) => Promise<void>;
  /** Soft-delete: sets active=false. Never physically deletes. */
  unlinkAssetPlan: (id: string) => Promise<void>;
  /** @deprecated Use unlinkAssetPlan */
  removeAssetPlan: (id: string) => Promise<void>;

  saveMeasurementConfig: (config: MeasurementConfig) => Promise<void>;
  deleteMeasurementConfig: (id: string) => Promise<void>;

  saveMeasurementPoint: (point: MeasurementPoint) => Promise<void>;
  deleteMeasurementPoint: (id: string) => Promise<void>;

  addMeterReading: (reading: Omit<MeterReading, 'id' | 'readingAt'>) => Promise<void>;

  runPmScheduler: (horizonDays: number) => Promise<{ generatedCount: number; skippedCount: number }>;
  recalcNextDue: (assetPlanId: string, completedAt: string, meterValue?: number) => Promise<void>;
}

export const createPmSlice: StateCreator<StoreState, [], [], PmSlice> = (set, get) => ({
  pmPlans: [],
  pmTasks: [],
  assetPlans: [],
  measurementConfigs: [],
  measurementPoints: [],
  meterReadings: [],
  pmLoading: false,
  projectionMonths: 12,
  setProjectionMonths: (months: number) => {
    const clamped = Math.min(24, Math.max(1, months));
    set({ projectionMonths: clamped });
  },

  fetchPmData: async () => {
    set({ pmLoading: true });
    const [plansRes, tasksRes, assetPlansRes, configsRes, pointsRes, readingsRes] = await Promise.all([
      supabase.from('pm_plans').select('*').order('name'),
      supabase.from('pm_tasks').select('*').order('sort_order'),
      supabase.from('asset_plans').select('*'),
      supabase.from('measurement_configs').select('*').order('name'),
      supabase.from('measurement_points').select('*'),
      supabase.from('meter_readings').select('*').order('created_at', { ascending: false }),
    ]);

    if (plansRes.error) {
      console.error('Error fetching PM plans:', plansRes.error);
      set({ pmLoading: false });
      return;
    }

    const pmPlans: PmPlan[] = (plansRes.data || []).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      triggerType: p.trigger_type,
      intervalValue: p.interval_value,
      intervalUnit: p.interval_unit,
      intervalMode: p.interval_mode,
      leadDays: p.lead_days,
      meterIntervalValue: p.meter_interval_value,
      meterIntervalUnit: p.meter_interval_unit,
      estimatedDuration: p.estimated_duration,
      criticality: p.criticality,
      createdAt: p.created_at,
    }));

    const pmTasks: PmTask[] = (tasksRes.data || []).map(t => ({
      id: t.id,
      pmPlanId: t.pm_plan_id,
      description: t.description,
      sortOrder: t.sort_order,
      frequencyMultiplier: t.frequency_multiplier || 1, // Nuevo
    }));

    const measurementConfigs: MeasurementConfig[] = (configsRes.data || []).map(c => ({
      id: c.id,
      name: c.name,
      unit: c.unit,
      isCumulative: c.is_cumulative,
      createdAt: c.created_at,
    }));

    const assetPlans: AssetPlan[] = (assetPlansRes.data || []).map(ap => ({
      id: ap.id,
      assetId: ap.asset_id,
      pmPlanId: ap.pm_plan_id,
      measurementPointId: ap.measurement_point_id,
      nextDueDate: ap.next_due_date,
      nextDueMeter: ap.next_due_meter,
      lastCompletedAt: ap.last_completed_at,
      woCount: ap.wo_count,
      currentCycleIndex: ap.current_cycle_index || 1, // Nuevo
      active: ap.active,
      createdAt: ap.created_at,
    }));

    const measurementPoints: MeasurementPoint[] = (pointsRes.data || []).map(mp => ({
      id: mp.id,
      assetId: mp.asset_id,
      configId: mp.config_id,
      name: mp.name,
      unit: mp.unit,
      currentValue: mp.current_value,
      minThreshold: mp.min_threshold,
      maxThreshold: mp.max_threshold,
      triggerWoTitle: mp.trigger_wo_title,
      triggerPriority: mp.trigger_priority || 'high',
      lastTriggerAt: mp.last_trigger_at,
      lastReadingAt: mp.last_reading_at,
    }));

    const meterReadings: MeterReading[] = (readingsRes.data || []).map(mr => ({
      id: mr.id,
      measurementPointId: mr.point_id,
      value: mr.value,
      readingAt: mr.created_at,
      recordedBy: mr.recorded_by,
    }));

    set({ pmPlans, pmTasks, assetPlans, measurementConfigs, measurementPoints, meterReadings, pmLoading: false });

    // After fetching, check non-cumulative readings for alerts
    _checkNonCumulativeAlerts(measurementPoints, measurementConfigs, get);
  },

  savePlan: async (plan, tasks) => {
    const dbPlan = {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      trigger_type: plan.triggerType,
      interval_value: plan.intervalValue,
      interval_unit: plan.intervalUnit,
      interval_mode: plan.intervalMode,
      meter_interval_value: plan.meterIntervalValue,
      meter_interval_unit: plan.meterIntervalUnit,
      estimated_duration: plan.estimatedDuration,
      criticality: plan.criticality,
      lead_days: plan.leadDays,
    };

    const { error: planError } = await supabase.from('pm_plans').upsert(dbPlan);
    if (planError) throw planError;

    await supabase.from('pm_tasks').delete().eq('pm_plan_id', plan.id);

    if (tasks.length > 0) {
      const dbTasks = tasks.map((t, i) => ({
        id: t.id || generateId(),
        pm_plan_id: plan.id,
        description: t.description,
        sort_order: i,
        frequency_multiplier: t.frequencyMultiplier || 1, // Nuevo
      }));
      const { error: tasksError } = await supabase.from('pm_tasks').insert(dbTasks);
      if (tasksError) throw tasksError;
    }

    await get().fetchPmData();
  },

  deletePlan: async (id) => {
    const { error } = await supabase.from('pm_plans').delete().eq('id', id);
    if (error) throw error;
    await get().fetchPmData();
  },

  saveMeasurementConfig: async (config) => {
    const { error } = await supabase.from('measurement_configs').upsert({
      id: config.id || generateId(),
      name: config.name,
      unit: config.unit,
      is_cumulative: config.isCumulative,
    });
    if (error) throw error;
    await get().fetchPmData();
  },

  deleteMeasurementConfig: async (id) => {
    const { error } = await supabase.from('measurement_configs').delete().eq('id', id);
    if (error) throw error;
    await get().fetchPmData();
  },

  saveAssetPlan: async (assetPlan) => {
    const dbAssetPlan = {
      id: assetPlan.id,
      asset_id: assetPlan.assetId,
      pm_plan_id: assetPlan.pmPlanId,
      measurement_point_id: assetPlan.measurementPointId || null,
      next_due_date: assetPlan.nextDueDate,
      next_due_meter: assetPlan.nextDueMeter,
      last_completed_at: assetPlan.lastCompletedAt,
      wo_count: assetPlan.woCount,
      active: assetPlan.active,
      current_cycle_index: assetPlan.currentCycleIndex || 1, // Nuevo
    };
    const { error } = await supabase.from('asset_plans').upsert(dbAssetPlan);
    if (error) throw error;
    await get().fetchPmData();
  },

  toggleAssetPlan: async (id, active) => {
    const { error } = await supabase.from('asset_plans').update({ active }).eq('id', id);
    if (error) throw error;
    await get().fetchPmData();
  },

  /**
   * SOFT DELETE — never physically deletes an asset_plan row.
   * Sets active = false so:
   *  - The scheduler stops generating WOs for it.
   *  - Historical WOs keep their pmPlanNameSnapshot intact.
   *  - The record can be re-activated in the future if needed.
   */
  unlinkAssetPlan: async (id: string) => {
    const { error } = await supabase
      .from('asset_plans')
      .update({ active: false })
      .eq('id', id);
    if (error) throw error;
    await get().fetchPmData();
  },

  /** @deprecated alias kept for backward compatibility — use unlinkAssetPlan */
  removeAssetPlan: async (id: string) => {
    // Redirect to soft delete instead of hard delete
    await (get() as any).unlinkAssetPlan(id);
  },

  saveMeasurementPoint: async (point) => {
    const { error } = await supabase.from('measurement_points').upsert({
      id: point.id,
      asset_id: point.assetId,
      config_id: point.configId || null,
      name: point.name,
      unit: point.unit,
      current_value: point.currentValue,
      min_threshold: point.minThreshold || null,
      max_threshold: point.maxThreshold || null,
      trigger_wo_title: point.triggerWoTitle || null,
      trigger_priority: point.triggerPriority || 'high',
      last_trigger_at: point.lastTriggerAt || null,
      last_reading_at: point.lastReadingAt,
    });
    if (error) throw error;
    await get().fetchPmData();
  },

  deleteMeasurementPoint: async (id) => {
    const { error } = await supabase.from('measurement_points').delete().eq('id', id);
    if (error) throw error;
    await get().fetchPmData();
  },

  addMeterReading: async (readingData) => {
    const now = new Date().toISOString();
    const { error } = await supabase.from('meter_readings').insert({
      id: generateId(),
      point_id: readingData.measurementPointId,
      value: readingData.value,
      recorded_by: get().currentUser?.id,
    });
    if (error) throw error;

    await supabase.from('measurement_points').update({
      current_value: readingData.value,
      last_reading_at: now,
    }).eq('id', readingData.measurementPointId);

    await get().fetchPmData();

    // CBM LOGIC: Trigger Work Order if thresholds are breached
    const point = get().measurementPoints.find(p => p.id === readingData.measurementPointId);
    const config = point ? get().measurementConfigs.find(c => c.id === point.configId) : null;

    // PM trigger for cumulative meters (horometro): check if any linked asset_plan has exceeded nextDueMeter
    if (point && config && config.isCumulative) {
      const linkedPlans = get().assetPlans.filter(
        ap => ap.active && ap.measurementPointId === point.id && ap.nextDueMeter !== null
      );
      for (const ap of linkedPlans) {
        if (readingData.value >= ap.nextDueMeter!) {
          // Only trigger scheduler if there's no open WO for this plan already
          const hasOpenWo = get().workOrders.some(
            (w: any) => w.assetPlanId === ap.id && !['completed', 'cancelled'].includes(w.status)
          );
          if (!hasOpenWo) {
            await get().runPmScheduler(0);
            break;
          }
        }
      }
    }

    if (point && config && !config.isCumulative) {
      const isLow = point.minThreshold !== null && readingData.value < point.minThreshold;
      const isHigh = point.maxThreshold !== null && readingData.value > point.maxThreshold;

      if (isLow || isHigh) {
        // CHECK: If there's an active (not completed/cancelled) WO for this specific sensor, don't trigger another one.
        const { data: activeWos, error: checkError } = await supabase
          .from('work_orders')
          .select('id')
          .eq('source_point_id', point.id)
          .in('status', ['open', 'assigned', 'in_progress', 'on_hold']);

        if (checkError) throw checkError;

        if (!activeWos || activeWos.length === 0) {
          const asset = (get() as any).assets?.find((a: any) => a.id === point.assetId);
          const woTitle = point.triggerWoTitle || `Alerta CBM: ${point.name} fuera de rango`;
          
          // 1. Create Predictive Work Order
          const woId = generateId();
          const timestampStr = new Date().toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' });

          // MODULE 4.9: Set a due date for CBM-triggered WOs.
          // Business rule: corrective actions from sensor alerts must be attended
          // within 3 days by default (prudential response window).
          const scheduledDate = new Date(now);
          const dueDate = new Date(now);
          dueDate.setDate(dueDate.getDate() + 3);
          const scheduledDateStr = scheduledDate.toISOString().split('T')[0];
          const dueDateStr = dueDate.toISOString().split('T')[0];

          const { error: woError } = await supabase.from('work_orders').insert({
            id: woId,
            asset_id: point.assetId,
            title: woTitle,
            description: `Disparo automático por Monitoreo de Condición detectado el ${timestampStr}.\nInstrumento: ${point.name}\nValor detectado: ${readingData.value} ${point.unit}\nRango esperado: ${point.minThreshold ?? '—'} a ${point.maxThreshold ?? '—'}`,
            wo_type: 'predictive',
            priority: point.triggerPriority || 'high',
            status: 'open',
            scheduled_date: scheduledDateStr,  // today
            due_date: dueDateStr,              // today + 3 days (SLA default)
            source_point_id: point.id, // Linking the WO to the sensor
            asset_name_snapshot: asset?.name || 'Activo Desconocido',
            created_by: get().currentUser?.id || null,
          });

          if (!woError) {
            // 2. Add automatic comment to Bitácora
            const authorId = get().currentUser?.id || '00000000-0000-4000-a000-000000000000';
            await supabase.from('wo_comments').insert({
              id: generateId(),
              work_order_id: woId,
              author_id: authorId,
              body: `SISTEMA: Alerta CBM disparada automáticamente. Lectura fuera de rango detectada: ${readingData.value} ${point.unit} en ${point.name}.`,
            });

            // 3. Update Point with last trigger timestamp
            await supabase.from('measurement_points').update({
              last_trigger_at: now
            }).eq('id', point.id);
            
            (get() as any).showToast?.({
              type: 'warning',
              title: 'Alerta de Condición',
              message: `Se ha generado una OT automática para ${asset?.name || 'el activo'}.`
            });
            
            if ((get() as any).fetchWorkOrders) await (get() as any).fetchWorkOrders();
            await get().fetchPmData();
          }
        }
      }
    }
  },

  runPmScheduler: async (horizonDays) => {
    const state = get();
    const dbData = {
      pmPlans: state.pmPlans,
      assetPlans: state.assetPlans,
      measurementPoints: state.measurementPoints,
      pmTasks: state.pmTasks,
      workOrders: state.workOrders,
    };

    const { generated, superseded } = runScheduler(dbData, horizonDays);

    const bestUser = get().currentUser?.id ||
                     get().users.find(u => u.role === 'admin')?.id ||
                     get().users[0]?.id ||
                     null;

    // ── Phase 1: Supersession — cancel absorbed WOs before inserting new ones ──
    if (superseded.length > 0) {
      await _applySupersessions(superseded, bestUser);
    }

    // ── Phase 2: Persist generated Work Orders ────────────────────────────────
    if (generated.length > 0) {
      for (const woWithTasks of generated) {
        const { tasks, ...wo } = woWithTasks;

        const { error: woError } = await supabase.from('work_orders').insert({
          id: wo.id,
          asset_id: wo.assetId,
          asset_plan_id: wo.assetPlanId,
          title: wo.title,
          description: wo.description,
          wo_type: wo.woType,
          status: wo.status,
          priority: wo.priority,
          scheduled_date: wo.scheduledDate,
          due_date: wo.dueDate,
          pm_plan_name_snapshot: wo.pmPlanNameSnapshot,
          pm_cycle_index: wo.pmCycleIndex,
          asset_name_snapshot: (get() as any).assets?.find((a: any) => a.id === wo.assetId)?.name || 'Activo Desconocido',
          created_by: bestUser,
        });

        if (woError) {
          if (woError.code === '23503') {
            throw new Error(`Fallo de Auditoría: Tu usuario no existe en la tabla de perfiles. Por favor, re-ejecuta el SQL con el Backfill.`);
          }
          throw new Error(`Fallo de persistencia en OT: ${woError.message}`);
        }

        if (tasks.length > 0) {
          const dbTasks = tasks.map((t, idx) => ({
            id: generateId(),
            work_order_id: wo.id,
            sort_order: t.sortOrder ?? idx,
            description: t.description,
          }));
          const { error: tasksError } = await supabase.from('wo_tasks').insert(dbTasks);
          if (tasksError) console.error('Error persisting tasks:', tasksError);
        }

        // If asset_plan had no nextDueDate or nextDueMeter, persist the computed values
        // so the scheduler doesn't re-trigger on the same threshold on every run.
        const sourceAp = dbData.assetPlans.find(ap => ap.id === wo.assetPlanId);
        if (sourceAp) {
          const updates: Record<string, unknown> = {};
          if (!sourceAp.nextDueDate && wo.dueDate) updates.next_due_date = wo.dueDate;
          if (sourceAp.nextDueMeter == null && wo.generatedFromMeter) updates.next_due_meter = wo.generatedFromMeter;
          if (Object.keys(updates).length > 0) {
            await supabase.from('asset_plans').update(updates).eq('id', wo.assetPlanId);
          }
        }
      }
    }

    if ((get() as any).fetchWorkOrders) await (get() as any).fetchWorkOrders();
    await get().fetchPmData();

    return {
      generatedCount: generated.length,
      skippedCount: dbData.assetPlans.filter(ap => ap.active).length - generated.length,
    };
  },

  /**
   * Recalculates next due date/meter after a WO is completed.
   *
   * FIXED mode  (intervalMode = 'fixed'):
   *   nextDueMeter = prevThreshold + interval
   *   Maintains rigid 100/200/300h schedule regardless of when maintenance was done.
   *   If the meter already exceeded the new threshold when the WO is closed,
   *   the scheduler fires immediately (catch-up).
   *
   * FLOATING mode (intervalMode = 'floating' or unset):
   *   nextDueMeter = actualReadingAtCompletion + interval
   *   Schedule drifts to always be X hours after the last service.
   */
  recalcNextDue: async (assetPlanId, completedAt, meterValue) => {
    const assetPlan = get().assetPlans.find(ap => ap.id === assetPlanId);
    if (!assetPlan) return;

    const plan = get().pmPlans.find(p => p.id === assetPlan.pmPlanId);
    if (!plan) return;

    const updates: any = {
      last_completed_at: completedAt,
      wo_count: assetPlan.woCount + 1,
      current_cycle_index: (assetPlan.currentCycleIndex || 1) + 1,
    };

    // Calendar trigger: advance next due date (fixed/floating handled inside calcNextDueDate)
    if (plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') {
      updates.next_due_date = calcNextDueDate(plan, assetPlan, completedAt);
    }

    // Meter trigger
    if (plan.triggerType === 'meter' || plan.triggerType === 'hybrid') {
      if (plan.meterIntervalValue) {
        const isFixed = plan.intervalMode === 'fixed';

        if (isFixed && assetPlan.nextDueMeter != null) {
          // FIXED: advance from the previous scheduled threshold, not from actual completion value.
          // Keeps the 100/200/300h cadence rigid.
          updates.next_due_meter = assetPlan.nextDueMeter + plan.meterIntervalValue;
        } else {
          // FLOATING: advance from the actual reading at completion.
          // Falls back to point's current value when no explicit reading is provided.
          const completionValue =
            meterValue !== undefined
              ? meterValue
              : (get().measurementPoints.find(p => p.id === assetPlan.measurementPointId)?.currentValue || 0);
          updates.next_due_meter = completionValue + plan.meterIntervalValue;
        }
      }
    }

    const { error } = await supabase.from('asset_plans').update(updates).eq('id', assetPlanId);
    if (error) throw error;
    await get().fetchPmData();

    // Meter catch-up: if the current reading already exceeds the new threshold (common
    // in FIXED mode when the WO was overdue at close), fire the scheduler immediately.
    if (updates.next_due_meter != null && assetPlan.measurementPointId) {
      const point = get().measurementPoints.find(p => p.id === assetPlan.measurementPointId);
      if (point && point.currentValue != null && point.currentValue >= updates.next_due_meter) {
        const hasOpenWo = get().workOrders.some(
          (w: any) => w.assetPlanId === assetPlanId && !['completed', 'cancelled'].includes(w.status)
        );
        if (!hasOpenWo) {
          await get().runPmScheduler(0);
        }
      }
    }

    // Calendar auto-trigger: run the scheduler with a horizon that spans the full
    // interval so the next due date is always inside the generation window.
    // This removes the need to click "Ejecutar motor" for calendar and hybrid plans.
    if (
      (plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') &&
      updates.next_due_date
    ) {
      const hasOpenWo = get().workOrders.some(
        (w: any) => w.assetPlanId === assetPlanId && !['completed', 'cancelled'].includes(w.status)
      );
      if (!hasOpenWo) {
        const horizonDays =
          _intervalToDays(plan.intervalValue ?? 1, plan.intervalUnit ?? 'months') +
          (plan.leadDays ?? 0);
        await get().runPmScheduler(horizonDays);
      }
    }
  },
});

function _intervalToDays(value: number, unit: string): number {
  switch (unit) {
    case 'days':   return value;
    case 'weeks':  return value * 7;
    case 'months': return Math.ceil(value * 31);
    case 'years':  return Math.ceil(value * 366);
    default:       return 30;
  }
}

/**
 * Applies supersession actions: marks each absorbed open WO as 'cancelled' and
 * writes an audit comment explaining which higher-weight cycle replaced it.
 *
 * Uses 'cancelled' status (existing DB value) so no schema migration is required.
 * The audit comment provides the full trace for compliance reviews.
 */
async function _applySupersessions(
  actions: SupersededAction[],
  authorId: string | null,
): Promise<void> {
  const systemAuthor = authorId ?? '00000000-0000-4000-a000-000000000000';

  for (const action of actions) {
    // Mark absorbed WO as cancelled
    const { error: cancelError } = await supabase
      .from('work_orders')
      .update({ status: 'cancelled' })
      .eq('id', action.oldWoId);

    if (cancelError) {
      console.error(`[Engine] Error al cancelar OT absorbida ${action.oldWoId}:`, cancelError);
      continue;
    }

    // Write audit comment for compliance trail
    await supabase.from('wo_comments').insert({
      id: generateId(),
      work_order_id: action.oldWoId,
      author_id: systemAuthor,
      body: `SISTEMA — Supersesión por mantenimiento mayor: ${action.auditNote}`,
    });
  }
}

/**
 * After fetching measurement points, generate alerts for non-cumulative
 * readings that may need attention (no associated PM plan trigger).
 */
function _checkNonCumulativeAlerts(
  points: MeasurementPoint[],
  configs: MeasurementConfig[],
  get: () => StoreState
) {
  const nonCumulative = points.filter(p => {
    const config = configs.find(c => c.id === p.configId);
    return config && !config.isCumulative && p.currentValue !== undefined && p.currentValue !== null;
  });

  // Only alert if reading exists and there's no active asset_plan linked to this point
  for (const point of nonCumulative) {
    const linkedPlan = get().assetPlans.find(
      ap => ap.measurementPointId === point.id && ap.active
    );
    // If there's no PM plan driving this, it's purely informational — alert engineer
    if (!linkedPlan && point.currentValue !== undefined && point.currentValue !== null) {
      const asset = (get() as any).assets?.find((a: any) => a.id === point.assetId);
      (get() as any).addMeterAlert?.({
        type: 'limit',
        title: `Lectura de control: ${point.name}`,
        message: `${asset?.name || 'Activo'}: ${point.name} = ${point.currentValue} ${point.unit}. Sin plan PM vinculado — evalúe si se requiere acción.`,
        assetId: point.assetId,
        assetName: asset?.name || 'Activo',
        pointId: point.id,
        pointName: point.name,
        value: point.currentValue!,
        unit: point.unit,
      });
    }
  }
}
