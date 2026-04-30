import { StateCreator } from 'zustand';
import { WorkOrder, WoTask, WoComment, PartUsage, WoInput, WoStatus, StatusMeta, CompletePayload, Vendor } from '../types';
import { generateId } from '../../../shared/utils/utils';
import { canTransition } from '../utils/statusHelpers';
import { supabase } from '../../../lib/supabase';
import { calcNextDueDate } from '../../pm/store/pmEngine';

export interface WoSlice {
  workOrders: WorkOrder[];
  woTasks: WoTask[];
  woComments: WoComment[];
  partUsages: PartUsage[];
  vendors: Vendor[];
  selectedWoId: string | null;
  woLoading: boolean;
  assetHistory: WorkOrder[];

  fetchWorkOrders: () => Promise<void>;
  fetchAssetHistory: (assetId: string) => Promise<void>;
  fetchVendors: () => Promise<void>;
  saveVendor: (vendor: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;

  createWo: (input: WoInput, tasks?: string[]) => Promise<WorkOrder>;
  updateWoStatus: (id: string, status: WoStatus, meta?: StatusMeta) => Promise<void>;
  assignWo: (id: string, userId: string) => Promise<void>;
  completeWo: (id: string, payload: CompletePayload, meterValue?: number) => Promise<void>;

  addTask: (woId: string, description: string) => Promise<void>;
  toggleTask: (woId: string, taskId: string) => Promise<void>;
  deleteTask: (woId: string, taskId: string) => Promise<void>;
  updateTaskNotes: (woId: string, taskId: string, notes: string) => Promise<void>;

  addComment: (woId: string, body: string, attachment?: string) => Promise<void>;
  addPartUsage: (woId: string, itemId: string, qty: number) => Promise<void>;
  removePartUsage: (woId: string, usageId: string) => Promise<void>;

  selectWo: (id: string | null) => void;
}

export const createWoSlice: StateCreator<WoSlice & { currentUser?: any; inventoryItems?: any[]; adjustStock?: any; fetchInventory?: any; recalcNextDue?: any; runPmScheduler?: any; fetchPmData?: any; pmPlans?: any[]; assetPlans?: any[]; measurementPoints?: any[]; showToast?: any }, [], []> = (set, get) => ({
  workOrders: [],
  woTasks: [],
  woComments: [],
  partUsages: [],
  vendors: [],
  selectedWoId: null,
  woLoading: false,
  assetHistory: [],

  fetchWorkOrders: async () => {
    set({ woLoading: true });

    const [activeRes, historicRes, vendorRes] = await Promise.all([
      supabase.from('work_orders')
        .select('*')
        .not('status', 'in', '("completed","cancelled")')
        .order('created_at', { ascending: false }),
      supabase.from('work_orders')
        .select('*')
        .in('status', ['completed', 'cancelled'])
        .order('completed_at', { ascending: false, nullsFirst: false })
        .limit(50), // Standard limit for the general list
      supabase.from('vendors').select('*').eq('is_active', true).order('name'),
    ]);

    if (activeRes.error) {
      console.error('Error fetching WOs:', activeRes.error);
      set({ woLoading: false });
      return;
    }

    const allWoData = [...(activeRes.data || []), ...(historicRes.data || [])];
    const woIds = allWoData.map(w => w.id);

    const [taskRes, commentRes, usageRes] = await Promise.all([
      woIds.length > 0
        ? supabase.from('wo_tasks').select('*').in('work_order_id', woIds).order('sort_order')
        : Promise.resolve({ data: [], error: null }),
      woIds.length > 0
        ? supabase.from('wo_comments').select('*').in('work_order_id', woIds).order('created_at')
        : Promise.resolve({ data: [], error: null }),
      woIds.length > 0
        ? supabase.from('part_usages').select('*').in('work_order_id', woIds).order('added_at')
        : Promise.resolve({ data: [], error: null }),
    ]);

    const workOrders: WorkOrder[] = allWoData.map(w => ({
      id: w.id,
      assetId: w.asset_id,
      assetPlanId: w.asset_plan_id,
      woNumber: w.wo_number,
      title: w.title,
      description: w.description,
      woType: w.wo_type,
      status: w.status,
      priority: w.priority,
      assignedTo: w.assigned_to,
      scheduledDate: w.scheduled_date,
      dueDate: w.due_date,
      startedAt: w.started_at,
      completedAt: w.completed_at,
      estimatedHours: w.estimated_hours,
      actualHours: w.actual_hours,
      failureCode: w.failure_code,
      rootCause: w.root_cause,
      resolution: w.resolution,
      generatedFromPlanId: w.generated_from_plan_id,
      pmPlanNameSnapshot: w.pm_plan_name_snapshot,
      assetNameSnapshot: w.asset_name_snapshot,
      assignedToNameSnapshot: w.assigned_to_name_snapshot,
      vendorNameSnapshot: w.vendor_name_snapshot,
      pmCycleIndex: w.pm_cycle_index,
      sourcePointId: w.source_point_id,
      vendorId: w.vendor_id,
      externalServiceCost: w.external_service_cost,
      externalInvoiceRef: w.external_invoice_ref,
      completedMeterValue: w.completed_meter_value ?? null,
      createdBy: w.created_by,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    }));

    const vendors: Vendor[] = (vendorRes.data || []).map(v => ({
      id: v.id,
      name: v.name,
      contactName: v.contact_name,
      email: v.email,
      phone: v.phone,
      taxId: v.tax_id,
      isActive: v.is_active,
      createdAt: v.created_at,
    }));

    set({ 
      workOrders, 
      woTasks: (taskRes.data || []).map(t => ({
        id: t.id,
        workOrderId: t.work_order_id,
        sortOrder: t.sort_order,
        description: t.description,
        completed: t.completed,
        completedAt: t.completed_at,
        completedBy: t.completed_by,
        notes: t.notes,
      })),
      woComments: (commentRes.data || []).map(c => ({
        id: c.id,
        workOrderId: c.work_order_id,
        authorId: c.author_id,
        body: c.body,
        attachmentUrl: c.attachment_url,
        createdAt: c.created_at,
      })),
      partUsages: (usageRes.data || []).map(u => ({
        id: u.id,
        workOrderId: u.work_order_id,
        inventoryItemId: u.inventory_item_id,
        quantity: u.quantity,
        unitCost: u.unit_cost,
        addedBy: u.added_by,
        addedAt: u.added_at,
      })),
      vendors,
      woLoading: false 
    });
  },

  fetchAssetHistory: async (assetId: string) => {
    set({ woLoading: true });
    const { data: woData, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('asset_id', assetId)
      .in('status', ['completed', 'cancelled'])
      .order('completed_at', { ascending: false, nullsFirst: false })
      .limit(200);

    if (error) {
      console.error('Error fetching asset history:', error);
      set({ woLoading: false });
      return;
    }

    const allWoData = woData || [];
    const woIds = allWoData.map(w => w.id);

    // Fetch related data for these specific historical WOs
    const [taskRes, commentRes, usageRes] = await Promise.all([
      woIds.length > 0
        ? supabase.from('wo_tasks').select('*').in('work_order_id', woIds).order('sort_order')
        : Promise.resolve({ data: [], error: null }),
      woIds.length > 0
        ? supabase.from('wo_comments').select('*').in('work_order_id', woIds).order('created_at')
        : Promise.resolve({ data: [], error: null }),
      woIds.length > 0
        ? supabase.from('part_usages').select('*').in('work_order_id', woIds).order('added_at')
        : Promise.resolve({ data: [], error: null }),
    ]);

    const history: WorkOrder[] = allWoData.map(w => ({
      id: w.id,
      assetId: w.asset_id,
      assetPlanId: w.asset_plan_id,
      woNumber: w.wo_number,
      title: w.title,
      description: w.description,
      woType: w.wo_type,
      status: w.status,
      priority: w.priority,
      assignedTo: w.assigned_to,
      scheduledDate: w.scheduled_date,
      dueDate: w.due_date,
      startedAt: w.started_at,
      completedAt: w.completed_at,
      estimatedHours: w.estimated_hours,
      actualHours: w.actual_hours,
      failureCode: w.failure_code,
      rootCause: w.root_cause,
      resolution: w.resolution,
      generatedFromPlanId: w.generated_from_plan_id,
      pmPlanNameSnapshot: w.pm_plan_name_snapshot,
      assetNameSnapshot: w.asset_name_snapshot,
      assignedToNameSnapshot: w.assigned_to_name_snapshot,
      vendorNameSnapshot: w.vendor_name_snapshot,
      pmCycleIndex: w.pm_cycle_index,
      sourcePointId: w.source_point_id,
      vendorId: w.vendor_id,
      externalServiceCost: w.external_service_cost,
      externalInvoiceRef: w.external_invoice_ref,
      completedMeterValue: w.completed_meter_value ?? null,
      createdBy: w.created_by,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    }));

    // Merge new tasks/comments/usages without duplicating
    const existingTaskIds = new Set(get().woTasks.map(t => t.id));
    const newTasks = (taskRes.data || [])
      .filter(t => !existingTaskIds.has(t.id))
      .map(t => ({
        id: t.id,
        workOrderId: t.work_order_id,
        sortOrder: t.sort_order,
        description: t.description,
        completed: t.completed,
        completedAt: t.completed_at,
        completedBy: t.completed_by,
        notes: t.notes,
      }));

    const existingCommentIds = new Set(get().woComments.map(c => c.id));
    const newComments = (commentRes.data || [])
      .filter(c => !existingCommentIds.has(c.id))
      .map(c => ({
        id: c.id,
        workOrderId: c.work_order_id,
        authorId: c.author_id,
        body: c.body,
        attachmentUrl: c.attachment_url,
        createdAt: c.created_at,
      }));

    const existingUsageIds = new Set(get().partUsages.map(u => u.id));
    const newUsages = (usageRes.data || [])
      .filter(u => !existingUsageIds.has(u.id))
      .map(u => ({
        id: u.id,
        workOrderId: u.work_order_id,
        inventoryItemId: u.inventory_item_id,
        quantity: u.quantity,
        unitCost: u.unit_cost,
        addedBy: u.added_by,
        addedAt: u.added_at,
      }));

    set({ 
      assetHistory: history,
      woTasks: [...get().woTasks, ...newTasks],
      woComments: [...get().woComments, ...newComments],
      partUsages: [...get().partUsages, ...newUsages],
      woLoading: false 
    });
  },

  fetchVendors: async () => {
    const { data, error } = await supabase.from('vendors').select('*').eq('is_active', true).order('name');
    if (error) return;
    set({ vendors: data.map(v => ({
      id: v.id,
      name: v.name,
      contactName: v.contact_name,
      email: v.email,
      phone: v.phone,
      taxId: v.tax_id,
      isActive: v.is_active,
      createdAt: v.created_at,
    }))});
  },

  saveVendor: async (vendor) => {
    const isNew = !vendor.id;
    const payload = {
      name: vendor.name,
      contact_name: vendor.contactName,
      email: vendor.email,
      phone: vendor.phone,
      tax_id: vendor.taxId,
      is_active: vendor.isActive ?? true,
    };

    const { error } = isNew 
      ? await supabase.from('vendors').insert({ ...payload, id: generateId() })
      : await supabase.from('vendors').update(payload).eq('id', vendor.id);

    if (error) {
      get().showToast?.({ type: 'error', title: 'Error', message: 'No se pudo guardar el proveedor' });
      return;
    }

    get().showToast?.({ type: 'success', title: 'Éxito', message: 'Proveedor guardado correctamente' });
    await get().fetchVendors();
  },

  deleteVendor: async (id) => {
    const { error } = await supabase
      .from('vendors')
      .update({ is_active: false })
      .eq('id', id);
    if (error) {
      get().showToast?.({ type: 'error', title: 'Error', message: 'No se pudo desactivar el proveedor' });
      return;
    }
    get().showToast?.({ type: 'success', title: 'Exito', message: 'Proveedor desactivado' });
    await get().fetchVendors();
  },

  createWo: async (input, tasks) => {
    const { currentUser } = get();
    const newWoId = generateId();

    const dbWo = {
      id: newWoId,
      asset_id: input.assetId,
      title: input.title,
      description: input.description || null,
      wo_type: input.woType,
      priority: input.priority,
      assigned_to: input.assignedTo || null,
      scheduled_date: input.scheduledDate || null,
      due_date: input.dueDate || null,
      estimated_hours: input.estimatedHours || null,
      status: input.assignedTo ? 'assigned' : 'open',
      vendor_id: input.vendorId || null,
      external_service_cost: input.externalServiceCost || 0,
      external_invoice_ref: input.externalInvoiceRef || null,
      asset_name_snapshot: (get() as any).assets?.find((a: any) => a.id === input.assetId)?.name || 'Activo Desconocido',
      created_by: currentUser?.id || null,
    };

    const { error: woError } = await supabase.from('work_orders').insert(dbWo);
    if (woError) throw woError;

    if (tasks && tasks.length > 0) {
      const dbTasks = tasks.map((desc, i) => ({
        id: generateId(),
        work_order_id: newWoId,
        sort_order: i,
        description: desc,
      }));
      await supabase.from('wo_tasks').insert(dbTasks);
    }

    await get().fetchWorkOrders();
    return get().workOrders.find(w => w.id === newWoId)!;
  },

  updateWoStatus: async (id, status, meta) => {
    const { workOrders, currentUser } = get();
    const wo = workOrders.find(w => w.id === id);
    if (!wo) return;
    if (!currentUser) throw new Error('No user authenticated');

    const isAssignee = wo.assignedTo === currentUser.id;
    if (!canTransition(wo.status, status, currentUser.role, isAssignee)) {
      throw new Error(`No puedes cambiar de ${wo.status} a ${status}`);
    }

    const updates: any = { status, updated_at: new Date().toISOString() };
    if (meta?.startedAt) updates.started_at = meta.startedAt;
    if (meta?.completedAt) updates.completed_at = meta.completedAt;

    const { error } = await supabase.from('work_orders').update(updates).eq('id', id);
    if (error) throw error;

    await get().fetchWorkOrders();
  },

  assignWo: async (id, userId) => {
    const wo = get().workOrders.find(w => w.id === id);
    if (!wo) return;

    const { error } = await supabase.from('work_orders').update({
      assigned_to: userId,
      status: wo.status === 'open' ? 'assigned' : wo.status,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (error) throw error;
    await get().fetchWorkOrders();
  },

  completeWo: async (id, payload, meterValue) => {
    const wo = get().workOrders.find(w => w.id === id);
    if (!wo) return;

    const { currentUser } = get();
    if (currentUser) {
      const isAssignee = wo.assignedTo === currentUser.id;
      if (!canTransition(wo.status, 'completed', currentUser.role as any, isAssignee)) {
        throw new Error('No tienes permisos para cerrar esta orden de trabajo.');
      }
    }

    const completedAt = new Date().toISOString();

    // PHASE 3 — History Snapshot: capture the live human-readable names of the
    // technician, vendor and asset as plain text BEFORE closing the WO.
    // These text values are frozen permanently in the DB so the historical record
    // survives even if the related profile, vendor or asset is later deactivated.

    // The form may have changed vendorId at close time, so resolve in priority order:
    //   payload.vendorId (chosen in form) → wo.vendorId (pre-existing) → null
    const effectiveVendorId = payload.vendorId || wo.vendorId || null;

    const assignedProfile = (get() as any).users?.find((u: any) => u.id === wo.assignedTo);
    const assignedVendor  = (get() as any).vendors?.find((v: any) => v.id === effectiveVendorId);
    const assignedAsset   = (get() as any).assets?.find((a: any) => a.id === wo.assetId);

    const updates: any = {
      status:                   'completed',
      actual_hours:             payload.actualHours,
      completed_at:             completedAt,
      updated_at:               completedAt,
      failure_code:             payload.failureCode    || null,
      root_cause:               payload.rootCause      || null,
      resolution:               payload.resolution     || null,
      vendor_id:                effectiveVendorId,
      external_service_cost:    payload.externalServiceCost  || 0,
      external_invoice_ref:     payload.externalInvoiceRef   || null,
      // ── Snapshot columns — frozen at time of closure ──────────────────────
      // Falls back to any pre-existing snapshot in case the profile was already
      // deactivated before this WO was closed (edge case).
      assigned_to_name_snapshot: assignedProfile?.fullName  || wo.assignedToNameSnapshot || null,
      vendor_name_snapshot:      assignedVendor?.name       || wo.vendorNameSnapshot     || null,
      asset_name_snapshot:       assignedAsset?.name        || wo.assetNameSnapshot      || null,
      // Meter snapshot: real horómetro reading entered by the technician at closure.
      // Stored as an immutable fact — survives plan unlinking and sensor reconfiguration.
      completed_meter_value:     meterValue ?? null,
    };

    if (wo.assetPlanId) {
      const assetPlan = get().assetPlans?.find((ap: any) => ap.id === wo.assetPlanId);
      const plan = get().pmPlans?.find((p: any) => p.id === assetPlan?.pmPlanId);
      if (!assetPlan || !plan) {
        throw new Error('No se encontro el plan PM vinculado para cerrar esta OT.');
      }

      // Prioritize the meterValue passed from the form; fall back to current state value
      let finalMeterValue: number | undefined = meterValue;
      if (finalMeterValue === undefined && assetPlan?.measurementPointId) {
        const point = get().measurementPoints?.find((p: any) => p.id === assetPlan.measurementPointId);
        finalMeterValue = point?.currentValue;
      }

      // Compute the next thresholds before the atomic closure transaction.
      const completedCycle = wo.pmCycleIndex ?? assetPlan.currentCycleIndex ?? 1;
      const nextBase = completedCycle + 1;
      const cyclesConsumed = plan.intervalMode === 'fixed'
        ? Math.max(1, completedCycle - (assetPlan.currentCycleIndex ?? 1) + 1)
        : 1;

      let nextDueDate: string | null = null;
      let nextDueMeter: number | null = null;

      if (plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') {
        nextDueDate = calcNextDueDate(plan, assetPlan, completedAt, cyclesConsumed).split('T')[0];
      }

      if ((plan.triggerType === 'meter' || plan.triggerType === 'hybrid') && plan.meterIntervalValue) {
        if (plan.intervalMode === 'fixed' && assetPlan.nextDueMeter != null) {
          nextDueMeter = assetPlan.nextDueMeter + cyclesConsumed * plan.meterIntervalValue;
        } else {
          nextDueMeter = (finalMeterValue ?? 0) + plan.meterIntervalValue;
        }
      }

      // Close the WO and advance the asset plan together.
      const { error } = await supabase.rpc('fn_complete_pm_wo_tx', {
        p_wo_id: id,
        p_asset_plan_id: wo.assetPlanId,
        p_completed_at: completedAt,
        p_actual_hours: updates.actual_hours,
        p_failure_code: updates.failure_code,
        p_root_cause: updates.root_cause,
        p_resolution: updates.resolution,
        p_vendor_id: updates.vendor_id,
        p_external_service_cost: updates.external_service_cost,
        p_external_invoice_ref: updates.external_invoice_ref,
        p_assigned_to_name_snapshot: updates.assigned_to_name_snapshot,
        p_vendor_name_snapshot: updates.vendor_name_snapshot,
        p_asset_name_snapshot: updates.asset_name_snapshot,
        p_completed_meter_value: updates.completed_meter_value,
        p_measurement_point_id: assetPlan.measurementPointId,
        p_meter_reading_id: generateId(),
        p_recorded_by: get().currentUser?.id || null,
        p_last_completed_at: completedAt,
        p_wo_count: (assetPlan.woCount || 0) + 1,
        p_current_cycle_index: nextBase,
        p_next_due_date: nextDueDate,
        p_next_due_meter: nextDueMeter,
      });
      if (error) throw error;

      await get().fetchWorkOrders();
      if (get().fetchPmData) await get().fetchPmData();

      if (nextDueMeter != null && assetPlan.measurementPointId && get().runPmScheduler) {
        const point = get().measurementPoints?.find((p: any) => p.id === assetPlan.measurementPointId);
        const hasOpenWo = get().workOrders.some(
          (w: any) => w.assetPlanId === wo.assetPlanId && !['completed', 'cancelled'].includes(w.status)
        );
        if (point && point.currentValue != null && point.currentValue >= nextDueMeter && !hasOpenWo) {
          await get().runPmScheduler(0);
        }
      }

      if (
        (plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') &&
        nextDueDate &&
        get().runPmScheduler
      ) {
        const hasOpenWo = get().workOrders.some(
          (w: any) => w.assetPlanId === wo.assetPlanId && !['completed', 'cancelled'].includes(w.status)
        );
        if (!hasOpenWo) {
          const horizonDays =
            _intervalToDaysForWo(plan.intervalValue ?? 1, plan.intervalUnit ?? 'months') +
            (plan.leadDays ?? 0);
          await get().runPmScheduler(horizonDays);
        }
      }
    } else {
      const { error } = await supabase.from('work_orders').update(updates).eq('id', id);
      if (error) throw error;
      await get().fetchWorkOrders();
    }
  },

  addTask: async (woId, description) => {
    const tasks = get().woTasks.filter(t => t.workOrderId === woId);
    const { error } = await supabase.from('wo_tasks').insert({
      id: generateId(),
      work_order_id: woId,
      sort_order: tasks.length,
      description,
    });
    if (error) throw error;
    await get().fetchWorkOrders();
  },

  toggleTask: async (woId, taskId) => {
    const task = get().woTasks.find(t => t.id === taskId);
    if (!task) return;

    const completed = !task.completed;
    const now = new Date().toISOString();

    // Optimistic update — reflect change instantly without a full refetch (Fix 5.2)
    set(state => ({
      woTasks: state.woTasks.map(t =>
        t.id === taskId
          ? { ...t, completed, completedAt: completed ? now : null, completedBy: completed ? get().currentUser?.id ?? null : null }
          : t
      ),
    }));

    const { error } = await supabase.from('wo_tasks').update({
      completed,
      completed_at: completed ? now : null,
      completed_by: completed ? get().currentUser?.id : null,
    }).eq('id', taskId);

    if (error) {
      // Revert on failure
      set(state => ({
        woTasks: state.woTasks.map(t =>
          t.id === taskId
            ? { ...t, completed: task.completed, completedAt: task.completedAt, completedBy: task.completedBy }
            : t
        ),
      }));
      console.error('Error toggling task:', error);
    }
  },

  deleteTask: async (woId, taskId) => {
    const { error } = await supabase.from('wo_tasks').delete().eq('id', taskId);
    if (error) throw error;
    await get().fetchWorkOrders();
  },

  updateTaskNotes: async (woId, taskId, notes) => {
    const { error } = await supabase.from('wo_tasks').update({ notes }).eq('id', taskId);
    if (error) throw error;
    await get().fetchWorkOrders();
  },

  addComment: async (woId, body, attachment) => {
    const userId = get().currentUser?.id;
    if (!userId) throw new Error('Usuario no autenticado');

    const { error } = await supabase.from('wo_comments').insert({
      id: generateId(),
      work_order_id: woId,
      author_id: userId,
      body,
      attachment_url: attachment || null,
    });
    if (error) throw error;
    await get().fetchWorkOrders();
  },

  addPartUsage: async (woId, itemId, qty) => {
    const { error } = await supabase.rpc('fn_add_part_usage_tx', {
      p_usage_id: generateId(),
      p_work_order_id: woId,
      p_item_id: itemId,
      p_quantity: qty,
      p_added_by: get().currentUser?.id || null,
      p_movement_id: generateId(),
    });
    if (error) throw error;
    if (get().fetchInventory) await get().fetchInventory();
    await get().fetchWorkOrders();
  },

  removePartUsage: async (woId, usageId) => {
    const usage = get().partUsages.find(u => u.id === usageId);
    if (!usage) return;

    const { error } = await supabase.rpc('fn_remove_part_usage_tx', {
      p_usage_id: usageId,
      p_work_order_id: woId,
      p_performed_by: get().currentUser?.id || null,
      p_movement_id: generateId(),
    });
    if (error) throw error;
    if (get().fetchInventory) await get().fetchInventory();
    await get().fetchWorkOrders();
  },

  selectWo: (id) => set({ selectedWoId: id }),
});

function _intervalToDaysForWo(value: number, unit: string): number {
  switch (unit) {
    case 'days': return value;
    case 'weeks': return value * 7;
    case 'months': return Math.ceil(value * 31);
    case 'years': return Math.ceil(value * 366);
    default: return 30;
  }
}
