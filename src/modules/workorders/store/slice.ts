import { StateCreator } from 'zustand';
import { WorkOrder, WoTask, WoComment, PartUsage, WoInput, WoStatus, StatusMeta, CompletePayload } from '../types';
import { generateId } from '../../../shared/utils/generateId';
import { canTransition } from '../utils/statusHelpers';
import { supabase } from '../../../lib/supabase';

export interface WoSlice {
  workOrders: WorkOrder[];
  woTasks: WoTask[];
  woComments: WoComment[];
  partUsages: PartUsage[];
  selectedWoId: string | null;
  woLoading: boolean;

  fetchWorkOrders: () => Promise<void>;
  createWo: (input: WoInput, tasks?: string[]) => Promise<WorkOrder>;
  updateWoStatus: (id: string, status: WoStatus, meta?: StatusMeta) => Promise<void>;
  assignWo: (id: string, userId: string) => Promise<void>;
  completeWo: (id: string, payload: CompletePayload) => Promise<void>;

  addTask: (woId: string, description: string) => Promise<void>;
  toggleTask: (woId: string, taskId: string) => Promise<void>;
  deleteTask: (woId: string, taskId: string) => Promise<void>;
  updateTaskNotes: (woId: string, taskId: string, notes: string) => Promise<void>;

  addComment: (woId: string, body: string, attachment?: string) => Promise<void>;
  addPartUsage: (woId: string, itemId: string, qty: number) => Promise<void>;
  removePartUsage: (woId: string, usageId: string) => Promise<void>;

  selectWo: (id: string | null) => void;
}

export const createWoSlice: StateCreator<WoSlice & { currentUser?: any; inventoryItems?: any[]; adjustStock?: any; recalcNextDue?: any; assetPlans?: any[]; measurementPoints?: any[] }, [], []> = (set, get) => ({
  workOrders: [],
  woTasks: [],
  woComments: [],
  partUsages: [],
  selectedWoId: null,
  woLoading: false,

  fetchWorkOrders: async () => {
    set({ woLoading: true });

    const [woRes, taskRes, commentRes, usageRes] = await Promise.all([
      supabase.from('work_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('wo_tasks').select('*').order('sort_order'),
      supabase.from('wo_comments').select('*').order('created_at'),
      supabase.from('part_usages').select('*').order('created_at'),
    ]);

    if (woRes.error) {
      console.error('Error fetching WOs:', woRes.error);
      set({ woLoading: false });
      return;
    }

    const workOrders: WorkOrder[] = (woRes.data || []).map(w => ({
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
      createdBy: w.created_by,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    }));

    const woTasks: WoTask[] = (taskRes.data || []).map(t => ({
      id: t.id,
      workOrderId: t.work_order_id,
      sortOrder: t.sort_order,
      description: t.description,
      completed: t.completed,
      completedAt: t.completed_at,
      completedBy: t.completed_by,
      notes: t.notes,
    }));

    const woComments: WoComment[] = (commentRes.data || []).map(c => ({
      id: c.id,
      workOrderId: c.work_order_id,
      authorId: c.author_id,
      body: c.body,
      attachmentUrl: c.attachment_url,
      createdAt: c.created_at,
    }));

    const partUsages: PartUsage[] = (usageRes.data || []).map(u => ({
      id: u.id,
      workOrderId: u.work_order_id,
      inventoryItemId: u.inventory_item_id,
      quantity: u.quantity,
      unitCost: u.unit_cost,
      addedBy: u.added_by,
      addedAt: u.added_at,
    }));

    set({ workOrders, woTasks, woComments, partUsages, woLoading: false });
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

  completeWo: async (id, payload) => {
    const wo = get().workOrders.find(w => w.id === id);
    if (!wo) return;

    const completedAt = new Date().toISOString();

    const updates: any = {
      status: 'completed',
      actual_hours: payload.actualHours,
      completed_at: completedAt,
      updated_at: completedAt,
      failure_code: payload.failureCode || null,
      root_cause: payload.rootCause || null,
      resolution: payload.resolution || null,
    };

    const { error } = await supabase.from('work_orders').update(updates).eq('id', id);
    if (error) throw error;

    // If this WO was generated by a PM plan, recalculate next due
    if (wo.assetPlanId && get().recalcNextDue) {
      // Try to get the meter value from the linked measurement point
      const assetPlan = get().assetPlans?.find((ap: any) => ap.id === wo.assetPlanId);
      let meterValue: number | undefined;

      if (assetPlan?.measurementPointId) {
        const point = get().measurementPoints?.find((p: any) => p.id === assetPlan.measurementPointId);
        meterValue = point?.currentValue;
      }

      try {
        await get().recalcNextDue!(wo.assetPlanId, completedAt, meterValue);
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
    const { error } = await supabase.from('wo_tasks').update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      completed_by: completed ? get().currentUser?.id : null,
    }).eq('id', taskId);

    if (error) throw error;
    await get().fetchWorkOrders();
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
    const { error } = await supabase.from('part_usages').insert({
      id: generateId(),
      work_order_id: woId,
      inventory_item_id: itemId,
      quantity: qty,
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
