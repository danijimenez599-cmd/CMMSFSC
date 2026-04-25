import { StateCreator } from 'zustand';
import { WorkOrder, WoTask, WoComment, PartUsage, WoInput, WoStatus, StatusMeta, CompletePayload, Vendor } from '../types';
import { generateId } from '../../../shared/utils/utils';
import { canTransition } from '../utils/statusHelpers';
import { supabase } from '../../../lib/supabase';

export interface WoSlice {
  workOrders: WorkOrder[];
  woTasks: WoTask[];
  woComments: WoComment[];
  partUsages: PartUsage[];
  vendors: Vendor[];
  selectedWoId: string | null;
  woLoading: boolean;

  fetchWorkOrders: () => Promise<void>;
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

export const createWoSlice: StateCreator<WoSlice & { currentUser?: any; inventoryItems?: any[]; adjustStock?: any; recalcNextDue?: any; assetPlans?: any[]; measurementPoints?: any[]; showToast?: any }, [], []> = (set, get) => ({
  workOrders: [],
  woTasks: [],
  woComments: [],
  partUsages: [],
  vendors: [],
  selectedWoId: null,
  woLoading: false,

  fetchWorkOrders: async () => {
    set({ woLoading: true });

    // Only fetch active WOs + last 90 days of closed ones to avoid unbounded growth (Fix 5.1)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffIso = cutoff.toISOString();

    const [activeRes, historicRes, vendorRes] = await Promise.all([
      supabase.from('work_orders')
        .select('*')
        .not('status', 'in', '("completed","cancelled")')
        .order('created_at', { ascending: false }),
      supabase.from('work_orders')
        .select('*')
        .in('status', ['completed', 'cancelled'])
        .gte('completed_at', cutoffIso)
        .order('completed_at', { ascending: false })
        .limit(200),
      supabase.from('vendors').select('*').order('name'),
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
      pmCycleIndex: w.pm_cycle_index,
      sourcePointId: w.source_point_id,
      vendorId: w.vendor_id,
      externalServiceCost: w.external_service_cost,
      externalInvoiceRef: w.external_invoice_ref,
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

  fetchVendors: async () => {
    const { data, error } = await supabase.from('vendors').select('*').order('name');
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
      is_active: vendor.isActive,
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
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    if (error) {
      get().showToast?.({ type: 'error', title: 'Error', message: 'No se pudo eliminar el proveedor' });
      return;
    }
    get().showToast?.({ type: 'success', title: 'Éxito', message: 'Proveedor eliminado' });
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

    const updates: any = {
      status: 'completed',
      actual_hours: payload.actualHours,
      completed_at: completedAt,
      updated_at: completedAt,
      failure_code: payload.failureCode || null,
      root_cause: payload.rootCause || null,
      resolution: payload.resolution || null,
      vendor_id: payload.vendorId || null,
      external_service_cost: payload.externalServiceCost || 0,
      external_invoice_ref: payload.externalInvoiceRef || null,
    };

    const { error } = await supabase.from('work_orders').update(updates).eq('id', id);
    if (error) throw error;

    // If this WO was generated by a PM plan, recalculate next due
    if (wo.assetPlanId && get().recalcNextDue) {
      const assetPlan = get().assetPlans?.find((ap: any) => ap.id === wo.assetPlanId);

      // Prioritize the meterValue passed from the form; fall back to current state value
      let finalMeterValue: number | undefined = meterValue;
      if (finalMeterValue === undefined && assetPlan?.measurementPointId) {
        const point = get().measurementPoints?.find((p: any) => p.id === assetPlan.measurementPointId);
        finalMeterValue = point?.currentValue;
      }

      // If user entered a meter reading at completion, persist it
      if (meterValue !== undefined && assetPlan?.measurementPointId) {
        await supabase.from('measurement_points').update({
          current_value: meterValue,
          last_reading_at: completedAt,
        }).eq('id', assetPlan.measurementPointId);
        await supabase.from('meter_readings').insert({
          id: generateId(),
          point_id: assetPlan.measurementPointId,
          value: meterValue,
          recorded_by: get().currentUser?.id,
        });
      }

      try {
        await get().recalcNextDue!(wo.assetPlanId, completedAt, finalMeterValue);
      } catch (e) {
        console.error('recalcNextDue failed:', e);
      }
    }

    await get().fetchWorkOrders();
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
    const { error } = await supabase.from('wo_comments').insert({
      id: generateId(),
      work_order_id: woId,
      author_id: get().currentUser?.id,
      body,
      attachment_url: attachment || null,
    });
    if (error) throw error;
    await get().fetchWorkOrders();
  },

  addPartUsage: async (woId, itemId, qty) => {
    // Iteration 2: Capture current cost to ensure historical integrity
    const item = get().inventoryItems?.find((i: any) => i.id === itemId);
    const unitCost = item?.unitCost || 0;

    const { error } = await supabase.from('part_usages').insert({
      id: generateId(),
      work_order_id: woId,
      inventory_item_id: itemId,
      quantity: qty,
      unit_cost: unitCost,
      added_by: get().currentUser?.id,
    });
    if (error) throw error;

    if (get().adjustStock) {
      await get().adjustStock(itemId, { type: 'out', quantity: qty, workOrderId: woId });
    }
    await get().fetchWorkOrders();
  },

  removePartUsage: async (woId, usageId) => {
    const usage = get().partUsages.find(u => u.id === usageId);
    if (!usage) return;

    const { error } = await supabase.from('part_usages').delete().eq('id', usageId);
    if (error) throw error;

    if (get().adjustStock) {
      await get().adjustStock(usage.inventoryItemId, { type: 'return', quantity: usage.quantity, workOrderId: woId });
    }
    await get().fetchWorkOrders();
  },

  selectWo: (id) => set({ selectedWoId: id }),
});
