import { StateCreator } from 'zustand';
import { StoreState } from '../../../store';
import { PmPlan, AssetPlan, MeasurementPoint, MeterReading, PmTask, MeasurementConfig } from '../types';
import { WorkOrder } from '../../workorders/types';
import { runScheduler, calcNextDueDate } from './pmEngine';
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

  fetchPmData: () => Promise<void>;
  savePlan: (plan: PmPlan, tasks: PmTask[]) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;

  saveAssetPlan: (assetPlan: AssetPlan) => Promise<void>;
  toggleAssetPlan: (id: string, active: boolean) => Promise<void>;
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

  removeAssetPlan: async (id) => {
    const { error } = await supabase.from('asset_plans').delete().eq('id', id);
    if (error) throw error;
    await get().fetchPmData();
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
          const { error: woError } = await supabase.from('work_orders').insert({
            id: woId,
            asset_id: point.assetId,
            title: woTitle,
            description: `Disparo automático por Monitoreo de Condición detectado el ${timestampStr}.\nInstrumento: ${point.name}\nValor detectado: ${readingData.value} ${point.unit}\nRango esperado: ${point.minThreshold ?? '—'} a ${point.maxThreshold ?? '—'}`,
            wo_type: 'predictive',
            priority: point.triggerPriority || 'high',
            status: 'open',
            source_point_id: point.id, // Linking the WO to the sensor
            created_by: get().currentUser?.id || null,
          });

          if (!woError) {
            // 2. Add automatic comment to Bitácora
            await supabase.from('wo_comments').insert({
              id: generateId(),
              work_order_id: woId,
              body: `SISTEMA: Alerta CBM disparada automáticamente. Lectura fuera de rango detectada: ${readingData.value} ${point.unit} en ${point.name}.`,
              created_by: get().currentUser?.id || null,
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
    console.warn('>> ENTRANDO AL MOTOR PM (Slice)');
    const state = get();
    const dbData = {
      pmPlans: state.pmPlans,
      assetPlans: state.assetPlans,
      measurementPoints: state.measurementPoints,
      pmTasks: state.pmTasks,
      workOrders: state.workOrders,
    };

    console.log('Ejecutando motor PM con horizonte:', horizonDays);
    console.log('Datos de entrada:', { 
      planes: dbData.pmPlans.length, 
      asignaciones: dbData.assetPlans.length,
      activas: dbData.assetPlans.filter(ap => ap.active).length,
      userId: get().currentUser?.id || 'NO_USER'
    });

    const { generated } = runScheduler(dbData, horizonDays);
    console.log('Motor PM terminó. Generadas:', generated.length);

    if (generated.length > 0) {
      // Find the best user for audit: current user, or the first admin in the list
      const bestUser = get().currentUser?.id || 
                       get().users.find(u => u.role === 'admin')?.id || 
                       get().users[0]?.id ||
                       null;

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
          created_by: bestUser,
        });

        if (woError) {
          console.error('Error persisting WO:', woError);
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

        // Fix 6.2: If asset_plan had no nextDueDate, persist the computed dueDate so
        // the scheduler doesn't generate a new WO on every subsequent run
        const sourceAp = dbData.assetPlans.find(ap => ap.id === wo.assetPlanId);
        if (sourceAp && !sourceAp.nextDueDate && wo.dueDate) {
          await supabase.from('asset_plans').update({
            next_due_date: wo.dueDate,
          }).eq('id', wo.assetPlanId);
        }
      }

      if ((get() as any).fetchWorkOrders) await (get() as any).fetchWorkOrders();
      await get().fetchPmData();
    }

    return {
      generatedCount: generated.length,
      skippedCount: dbData.assetPlans.filter(ap => ap.active).length - generated.length,
    };
  },

  /**
   * Recalculates next due date/meter after a WO is completed.
   * For cumulative meters: resets threshold to currentValue + interval
   * (i.e., keeps accumulating — does NOT reset to zero).
   */
  recalcNextDue: async (assetPlanId, completedAt, meterValue) => {
    const assetPlan = get().assetPlans.find(ap => ap.id === assetPlanId);
    if (!assetPlan) return;

    const plan = get().pmPlans.find(p => p.id === assetPlan.pmPlanId);
    if (!plan) return;

    const updates: any = {
      last_completed_at: completedAt,
      wo_count: assetPlan.woCount + 1,
      current_cycle_index: (assetPlan.currentCycleIndex || 1) + 1, // Incremento de ciclo
    };

    // Calendar trigger: advance next due date
    if (plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') {
      updates.next_due_date = calcNextDueDate(plan, assetPlan, completedAt);
    }

    // Meter trigger: set next threshold = current reading + interval
    // This is the KEY fix: we don't reset to 0, we advance the threshold
    if (plan.triggerType === 'meter' || plan.triggerType === 'hybrid') {
      if (meterValue !== undefined && plan.meterIntervalValue) {
        updates.next_due_meter = meterValue + plan.meterIntervalValue;
      } else if (assetPlan.measurementPointId && plan.meterIntervalValue) {
        // Fallback: get current value from state
        const point = get().measurementPoints.find(p => p.id === assetPlan.measurementPointId);
        if (point) {
          updates.next_due_meter = (point.currentValue || 0) + plan.meterIntervalValue;
        }
      }
    }

    const { error } = await supabase.from('asset_plans').update(updates).eq('id', assetPlanId);
    if (error) throw error;
    await get().fetchPmData();
  },
});

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
