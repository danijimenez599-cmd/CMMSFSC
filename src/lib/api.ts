// ================================================================
// APEX CMMS — Capa de acceso a datos (Supabase API)
// Solución definitiva: sb() castea el cliente a unknown primero,
// evitando que TypeScript infiera `never` en insert/update/upsert.
// ================================================================

import { supabase } from './supabase'
import type {
  Asset, WorkOrder, WoComment, PmPlan, PmTask,
  AssetPlan, InventoryItem, PartUsage, User, WoTask,
} from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

// ── Wrapper que bypasea el sistema de tipos de Supabase ───────────
// Necesario porque PostgrestVersion "12" infiere `never` en tablas
// con tipos genéricos. Al pasar por `unknown` primero, TypeScript
// no puede inferir el tipo destino y acepta cualquier objeto.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any

// ── Ejecutar query y lanzar error legible si falla ─────────────────
async function run<T = AnyRecord>(query: Promise<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as T
}

// ── Mappers (snake_case DB → camelCase App) ───────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAsset  = (r: any): Asset         => ({ id: r.id, parentId: r.parent_id, name: r.name, locationId: r.location_id, category: r.category, brand: r.brand, model: r.model, serialNumber: r.serial_number, criticality: r.criticality, status: r.status, installDate: r.install_date, photoUrl: r.photo_url, notes: r.notes, qrCode: r.qr_code, createdAt: r.created_at, updatedAt: r.updated_at })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapWO     = (r: any): WorkOrder     => ({ id: r.id, title: r.title, description: r.description, assetId: r.asset_id, reportedById: r.reported_by_id, assignedToId: r.assigned_to_id, priority: r.priority, status: r.status, type: r.type, dueDate: r.due_date, startedAt: r.started_at, completedAt: r.completed_at, timeSpentMin: r.time_spent_min, resolutionNotes: r.resolution_notes, pmPlanId: r.pm_plan_id, createdAt: r.created_at, updatedAt: r.updated_at })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPlan   = (r: any): PmPlan        => ({ id: r.id, name: r.name, triggerType: r.trigger_type, frequencyDays: r.frequency_days, meterUnit: r.meter_unit, meterInterval: r.meter_interval, defaultAssignId: r.default_assign_id, active: r.active, notes: r.notes, createdAt: r.created_at, updatedAt: r.updated_at })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapAP     = (r: any): AssetPlan     => ({ id: r.id, assetId: r.asset_id, pmPlanId: r.pm_plan_id, nextDueDate: r.next_due_date, active: r.active, createdAt: r.created_at })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapItem   = (r: any): InventoryItem => ({ id: r.id, name: r.name, sku: r.sku, category: r.category, currentStock: r.current_stock, minStock: r.min_stock, unit: r.unit, unitCost: r.unit_cost, location: r.location, supplier: r.supplier, notes: r.notes, createdAt: r.created_at, updatedAt: r.updated_at })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapWoTask = (r: any): WoTask        => ({ id: r.id, woId: r.wo_id, description: r.description, completed: r.completed, order: r.order })

// ── API ───────────────────────────────────────────────────────────
export const api = {

  // ── ASSETS ──────────────────────────────────────────────────────
  assets: {
    async list(): Promise<Asset[]> {
      const rows = await run<AnyRecord[]>(db.from('assets').select('*').order('name'))
      return rows.map(mapAsset)
    },
    async upsert(a: Partial<Asset> & { id?: string }): Promise<Asset> {
      const row: AnyRecord = {
        parent_id:     a.parentId     ?? null,
        name:          a.name         ?? '',
        location_id:   a.locationId   ?? null,
        category:      a.category     ?? 'equip',
        brand:         a.brand        ?? '',
        model:         a.model        ?? '',
        serial_number: a.serialNumber ?? '',
        criticality:   a.criticality  ?? 'MEDIUM',
        status:        a.status       ?? 'OPERATIONAL',
        install_date:  a.installDate  ?? null,
        photo_url:     a.photoUrl     ?? null,
        notes:         a.notes        ?? '',
        qr_code:       a.qrCode       ?? null,
      }
      if (a.id) row.id = a.id
      const saved = await run<AnyRecord>(db.from('assets').upsert(row).select().single())
      return mapAsset(saved)
    },
    async delete(id: string): Promise<void> {
      await run(db.from('assets').delete().eq('id', id))
    },
  },

  // ── WORK ORDERS ─────────────────────────────────────────────────
  workOrders: {
    async list(): Promise<WorkOrder[]> {
      const rows = await run<AnyRecord[]>(db.from('work_orders').select('*').order('created_at', { ascending: false }))
      return rows.map(mapWO)
    },
    async upsert(w: Partial<WorkOrder> & { id?: string }): Promise<WorkOrder> {
      const row: AnyRecord = {
        title:            w.title           ?? '',
        description:      w.description     ?? '',
        asset_id:         w.assetId         ?? null,
        reported_by_id:   w.reportedById    ?? null,
        assigned_to_id:   w.assignedToId    ?? null,
        priority:         w.priority        ?? 'NORMAL',
        status:           w.status          ?? 'OPEN',
        type:             w.type            ?? 'CORRECTIVE',
        due_date:         w.dueDate         ?? null,
        started_at:       w.startedAt       ?? null,
        completed_at:     w.completedAt     ?? null,
        time_spent_min:   w.timeSpentMin    ?? null,
        resolution_notes: w.resolutionNotes ?? null,
        pm_plan_id:       w.pmPlanId        ?? null,
      }
      if (w.id) row.id = w.id
      const saved = await run<AnyRecord>(db.from('work_orders').upsert(row).select().single())
      return mapWO(saved)
    },
    async delete(id: string): Promise<void> {
      await run(db.from('work_orders').delete().eq('id', id))
    },
    async updateStatus(id: string, status: WorkOrder['status'], extra: Partial<WorkOrder> = {}): Promise<WorkOrder> {
      const row: AnyRecord = { status }
      if (extra.startedAt       !== undefined) row.started_at       = extra.startedAt
      if (extra.completedAt     !== undefined) row.completed_at     = extra.completedAt
      if (extra.timeSpentMin    !== undefined) row.time_spent_min   = extra.timeSpentMin
      if (extra.resolutionNotes !== undefined) row.resolution_notes = extra.resolutionNotes
      if (extra.assignedToId    !== undefined) row.assigned_to_id   = extra.assignedToId
      const saved = await run<AnyRecord>(db.from('work_orders').update(row).eq('id', id).select().single())
      return mapWO(saved)
    },
  },

  // ── WO COMMENTS ─────────────────────────────────────────────────
  woComments: {
    async listForWO(woId: string): Promise<WoComment[]> {
      return run<WoComment[]>(db.from('wo_comments').select('*').eq('work_order_id', woId).order('created_at'))
    },
    async insert(woId: string, userId: string, text: string): Promise<WoComment> {
      const row: AnyRecord = { id: crypto.randomUUID(), work_order_id: woId, user_id: userId, text }
      return run<WoComment>(db.from('wo_comments').insert(row).select().single())
    },
  },

  // ── WO TASKS ────────────────────────────────────────────────────
  woTasks: {
    async listForWO(woId: string): Promise<WoTask[]> {
      const rows = await run<AnyRecord[]>(db.from('wo_tasks').select('*').eq('wo_id', woId).order('order'))
      return rows.map(mapWoTask)
    },
    async insertMany(tasks: WoTask[]): Promise<void> {
      if (tasks.length === 0) return
      const rows: AnyRecord[] = tasks.map(t => ({
        id: t.id, wo_id: t.woId, description: t.description,
        completed: t.completed, order: t.order,
      }))
      await run(db.from('wo_tasks').insert(rows))
    },
    async toggle(taskId: string, completed: boolean): Promise<void> {
      await run(db.from('wo_tasks').update({ completed }).eq('id', taskId))
    },
  },

  // ── PM PLANS ────────────────────────────────────────────────────
  pmPlans: {
    async list(): Promise<PmPlan[]> {
      const rows = await run<AnyRecord[]>(db.from('pm_plans').select('*').order('name'))
      return rows.map(mapPlan)
    },
    async upsert(p: Partial<PmPlan> & { id?: string }): Promise<PmPlan> {
      const row: AnyRecord = {
        name:              p.name            ?? '',
        trigger_type:      p.triggerType     ?? 'TIME_BASED',
        frequency_days:    p.frequencyDays   ?? 30,
        meter_unit:        p.meterUnit       ?? null,
        meter_interval:    p.meterInterval   ?? null,
        default_assign_id: p.defaultAssignId ?? null,
        active:            p.active          ?? true,
        notes:             p.notes           ?? '',
      }
      if (p.id) row.id = p.id
      const saved = await run<AnyRecord>(db.from('pm_plans').upsert(row).select().single())
      return mapPlan(saved)
    },
    async delete(id: string): Promise<void> {
      await run(db.from('pm_plans').delete().eq('id', id))
    },
  },

  // ── PM TASKS ────────────────────────────────────────────────────
  pmTasks: {
    async listForPlan(pmPlanId: string): Promise<PmTask[]> {
      return run<PmTask[]>(db.from('pm_tasks').select('*').eq('pm_plan_id', pmPlanId).order('order'))
    },
    async replaceForPlan(pmPlanId: string, descriptions: string[]): Promise<void> {
      await run(db.from('pm_tasks').delete().eq('pm_plan_id', pmPlanId))
      if (descriptions.length === 0) return
      const rows: AnyRecord[] = descriptions
        .filter(d => d.trim())
        .map((desc, i) => ({ id: crypto.randomUUID(), pm_plan_id: pmPlanId, description: desc.trim(), order: i + 1 }))
      await run(db.from('pm_tasks').insert(rows))
    },
  },

  // ── ASSET PLANS ─────────────────────────────────────────────────
  assetPlans: {
    async list(): Promise<AssetPlan[]> {
      const rows = await run<AnyRecord[]>(db.from('asset_plans').select('*'))
      return rows.map(mapAP)
    },
    async insert(assetId: string, pmPlanId: string, nextDueDate: string): Promise<AssetPlan> {
      const row: AnyRecord = { id: crypto.randomUUID(), asset_id: assetId, pm_plan_id: pmPlanId, next_due_date: nextDueDate, active: true }
      const saved = await run<AnyRecord>(db.from('asset_plans').insert(row).select().single())
      return mapAP(saved)
    },
    async delete(id: string): Promise<void> {
      await run(db.from('asset_plans').delete().eq('id', id))
    },
    async deleteByAssetAndPlan(assetId: string, pmPlanId: string): Promise<void> {
      await run(db.from('asset_plans').delete().eq('asset_id', assetId).eq('pm_plan_id', pmPlanId))
    },
    async toggle(id: string, active: boolean): Promise<void> {
      await run(db.from('asset_plans').update({ active }).eq('id', id))
    },
    async updateDueDate(id: string, nextDueDate: string): Promise<void> {
      await run(db.from('asset_plans').update({ next_due_date: nextDueDate }).eq('id', id))
    },
  },

  // ── INVENTORY ────────────────────────────────────────────────────
  inventory: {
    async list(): Promise<InventoryItem[]> {
      const rows = await run<AnyRecord[]>(db.from('inventory_items').select('*').order('name'))
      return rows.map(mapItem)
    },
    async upsert(item: Partial<InventoryItem> & { id?: string }): Promise<InventoryItem> {
      const row: AnyRecord = {
        name:          item.name         ?? '',
        sku:           item.sku          ?? '',
        category:      item.category     ?? 'consumable',
        current_stock: item.currentStock ?? 0,
        min_stock:     item.minStock     ?? 0,
        unit:          item.unit         ?? 'pcs',
        unit_cost:     item.unitCost     ?? 0,
        location:      item.location     ?? '',
        supplier:      item.supplier     ?? '',
        notes:         item.notes        ?? '',
      }
      if (item.id) row.id = item.id
      const saved = await run<AnyRecord>(db.from('inventory_items').upsert(row).select().single())
      return mapItem(saved)
    },
    async delete(id: string): Promise<void> {
      await run(db.from('inventory_items').delete().eq('id', id))
    },
    async adjustStock(id: string, newStock: number): Promise<void> {
      await run(db.from('inventory_items').update({ current_stock: newStock }).eq('id', id))
    },
  },

  // ── PART USAGES ─────────────────────────────────────────────────
  partUsages: {
    async listForWO(woId: string): Promise<PartUsage[]> {
      return run<PartUsage[]>(db.from('part_usages').select('*').eq('work_order_id', woId))
    },
    async insert(woId: string, itemId: string, quantity: number): Promise<PartUsage> {
      const row: AnyRecord = { id: crypto.randomUUID(), work_order_id: woId, inventory_item_id: itemId, quantity, used_at: new Date().toISOString() }
      return run<PartUsage>(db.from('part_usages').insert(row).select().single())
    },
    async delete(id: string): Promise<void> {
      await run(db.from('part_usages').delete().eq('id', id))
    },
  },

  // ── USERS ────────────────────────────────────────────────────────
  users: {
    async list(): Promise<User[]> {
      return run<User[]>(db.from('users').select('*').order('name'))
    },
  },

  // ── CARGA INICIAL ─────────────────────────────────────────────────
  async loadAll() {
    const [assets, workOrders, pmPlans, assetPlans, inventoryItems, users] = await Promise.all([
      api.assets.list(),
      api.workOrders.list(),
      api.pmPlans.list(),
      api.assetPlans.list(),
      api.inventory.list(),
      api.users.list(),
    ])
    return { assets, workOrders, pmPlans, assetPlans, inventoryItems, users }
  },
}
