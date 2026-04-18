// ================================================================
// APEX CMMS — Zustand Store v2.3 con Supabase integrado
// Patrón: optimistic update (UI rápida) + sync en Supabase
// ================================================================

import { create } from 'zustand'
import type {
  AppDB, AppView, User, Asset, WorkOrder, PmPlan,
  PmTask, AssetPlan, InventoryItem, WoComment, PartUsage
} from '@/types'
import { DB_DEFAULTS } from '@/data/defaults'
import { api } from '@/lib/api'

let _seq = 0
export const uid = (prefix = 'cx') =>
  `${prefix}-${Date.now().toString(36)}-${(++_seq).toString(36)}`

// ── Tipos ─────────────────────────────────────────────────────────
interface AppState {
  db:              AppDB
  view:            AppView
  currentUser:     User | null
  selectedAssetId: string | null
  selectedWOId:    string | null
  editingWOId:     string | null | false
  woEditorInitial: Partial<WorkOrder> | null
  expandedAssets:  string[]
  woFilter:        { status: string; type: string; priority: string }
  isMobileMenuOpen: boolean

  navigate:        (view: AppView) => void
  setSelectedAsset:(id: string | null) => void
  setSelectedWO:   (id: string | null) => void
  openWOEditor:    (id: string | null, initialData?: Partial<WorkOrder>) => void
  closeWOEditor:   () => void
  toggleAssetNode: (id: string) => void
  setCurrentUser:  (user: User | null) => void
  setWOFilter:     (f: Partial<AppState['woFilter']>) => void
  setMobileMenuOpen: (o: boolean) => void

  // Carga inicial desde Supabase
  loadFromSupabase: () => Promise<void>
  autoGeneratePMs: () => Promise<void>

  // Assets
  saveAsset:   (data: Partial<Asset> & { id?: string }) => Promise<void>
  deleteAsset: (id: string) => Promise<void>

  // Work Orders
  saveWO:          (data: Partial<WorkOrder> & { id?: string }) => Promise<void>
  deleteWO:        (id: string) => Promise<void>
  updateWOStatus:  (id: string, status: WorkOrder['status'], extra?: Partial<WorkOrder>) => Promise<void>
  toggleWoTask:    (taskId: string) => Promise<void>
  addComment:      (woId: string, text: string) => Promise<void>
  addPartUsage:    (woId: string, itemId: string, qty: number) => Promise<void>
  removePartUsage: (id: string) => Promise<void>

  // PM Plans
  savePlan:   (data: Partial<PmPlan> & { id?: string }, tasks: string[]) => Promise<void>
  deletePlan: (id: string) => Promise<void>

  // Asset Plans
  assignPlan:      (assetId: string, pmPlanId: string) => Promise<void>
  unassignPlan:    (assetId: string, pmPlanId: string) => Promise<void>
  toggleAssetPlan: (apId: string) => Promise<void>
  removeAssetPlan: (apId: string) => Promise<void>
  generateWO:      (apId: string) => Promise<WorkOrder | null>

  // Inventory
  saveInventoryItem:   (data: Partial<InventoryItem> & { id?: string }) => Promise<void>
  deleteInventoryItem: (id: string) => Promise<void>
  adjustStock:         (id: string, newStock: number) => Promise<void>

  seedSupabase: () => Promise<void>
}

// ── Store ─────────────────────────────────────────────────────────
export const useStore = create<AppState>()((set, get) => ({
      db: {
         users: [], locations: [], assets: [], workOrders: [], woComments: [], woAttachments: [],
         woTasks: [], pmPlans: [], pmTasks: [], assetPlans: [], meterReadings: [], inventoryItems: [],
         partUsages: [], notifications: []
      },
      view:            'dashboard',
      currentUser:     null,
      selectedAssetId: null,
      selectedWOId:    null,
      editingWOId:     false,
      woEditorInitial: null,
      expandedAssets:  ['asset-1', 'asset-2', 'asset-11', 'asset-16'],
      woFilter:        { status: 'all', type: 'all', priority: 'all' },
      isMobileMenuOpen: false,

      navigate:        (view) => set({ view, isMobileMenuOpen: false }),
      setSelectedAsset:(id)   => set({ selectedAssetId: id }),
      setSelectedWO:   (id)   => set({ selectedWOId: id }),
      openWOEditor:    (id, d)=> set({ editingWOId: id, woEditorInitial: d ?? null }),
      closeWOEditor:   ()     => set({ editingWOId: false, woEditorInitial: null }),
      toggleAssetNode: (id)   => set((s) => ({
        expandedAssets: s.expandedAssets.includes(id)
          ? s.expandedAssets.filter((x) => x !== id)
          : [...s.expandedAssets, id],
      })),
      setCurrentUser: (user) => set({ currentUser: user }),
      setWOFilter:    (f)    => set((s) => ({ woFilter: { ...s.woFilter, ...f } })),
      setMobileMenuOpen: (o) => set({ isMobileMenuOpen: o }),

      // ── Carga inicial desde Supabase ─────────────────────────────
      loadFromSupabase: async () => {
        try {
          const data = await api.loadAll()
          set((s) => ({
            db: {
              ...s.db,
              assets:         data.assets,
              workOrders:     data.workOrders,
              pmPlans:        data.pmPlans,
              assetPlans:     data.assetPlans,
              inventoryItems: data.inventoryItems,
              users:          data.users,
              locations:      data.locations,
              woTasks:        data.woTasks,
              pmTasks:        data.pmTasks,
              woComments:     data.woComments,
              partUsages:     data.partUsages,
            },
            currentUser: s.currentUser?.id ? s.currentUser : (data.users?.[0] ?? null)
          }))
        } catch (e) {
          console.warn('Error fetching Supabase, verificando si está vacía', e)
        }
      },

      autoGeneratePMs: async () => {
        const s = get()
        const HorizonDays = 7
        const now = new Date()
        const horizonDate = new Date()
        horizonDate.setDate(now.getDate() + HorizonDays)

        s.db.assetPlans.forEach(ap => {
          if (!ap.active || !ap.nextDueDate) return
          const due = new Date(ap.nextDueDate)
          if (due <= horizonDate) {
            // Revisar si ya hay una OT abierta (OPEN, ASSIGNED, IN_PROGRESS, o COMPLETED) que pertenezca a esta ocurrencia
            // Podemos usar la regla de si hay una OT asociada a este plan que no esté CANCELLED
            const isLatestWOPending = s.db.workOrders
                 .filter(w => w.pmPlanId === ap.id)
                 .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            
            // Si no hay OTs en absoluto, generamos
            if (!isLatestWOPending) {
               s.generateWO(ap.id)
               return
            }

            // Si hay una OT, y esta no pertenece al mismo ciclo (ej completada hace mucho) -
            // el store updateWOStatus adelanta la fecha del nextDueDate, pero nosotros vemos la ap.nextDueDate.
            // Si la OT viva más reciente ya está completada pero we haven't reached the new plan, 
            // the date would have advanced to the future. If it's still before the horizon, we should generate it.
            // Note: If the nextDueDate is in the horizon, and there are NO OPEN/ASSIGNED/IN_PROGRESS WOs, we generate it.
            const hasActiveOrRecentWO = s.db.workOrders.find(w => w.pmPlanId === ap.id && ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status))
            if (!hasActiveOrRecentWO) {
              s.generateWO(ap.id)
            }
          }
        })
      },

      // ── ASSETS ──────────────────────────────────────────────────
      saveAsset: async (data) => {
        const now = new Date().toISOString()
        const snapshot = get().db

        // 1. Optimistic update
        if (data.id) {
          set((s) => ({
            db: {
              ...s.db,
              assets: s.db.assets.map((a) =>
                a.id === data.id ? { ...a, ...data, updatedAt: now } : a
              ),
            },
          }))
        } else {
          const tmp: Asset = {
            id: uid('ast'), parentId: null, name: '', category: 'equip',
            locationId: null, brand: '', model: '', serialNumber: '',
            criticality: 'MEDIUM', status: 'OPERATIONAL', installDate: null,
            photoUrl: null, notes: '', qrCode: null,
            createdAt: now, updatedAt: now, ...data,
          }
          set((s) => ({ db: { ...s.db, assets: [...s.db.assets, tmp] } }))
          data = { ...data, id: tmp.id }
        }

        // 2. Persistir en Supabase
        try {
          const saved = await api.assets.upsert(data)
          set((s) => ({
            db: {
              ...s.db,
              assets: s.db.assets.map((a) =>
                a.id === data.id || a.id === saved.id ? saved : a
              ),
            },
          }))
        } catch (e) {
          console.error('Error guardando activo:', e)
          set({ db: snapshot })
        }
      },

      deleteAsset: async (id) => {
        const snapshot = get().db
        const toDelete = new Set<string>()
        const collect  = (aid: string) => {
          toDelete.add(aid)
          get().db.assets.filter((a) => a.parentId === aid).forEach((c) => collect(c.id))
        }
        collect(id)

        set((s) => ({
          db: {
            ...s.db,
            assets:     s.db.assets.filter((a)  => !toDelete.has(a.id)),
            assetPlans: s.db.assetPlans.filter((ap) => !toDelete.has(ap.assetId)),
            workOrders: s.db.workOrders.filter((wo) => !toDelete.has(wo.assetId ?? '')),
          },
          selectedAssetId: null,
        }))

        try {
          for (const aid of toDelete) await api.assets.delete(aid)
        } catch (e) {
          console.error('Error eliminando activo:', e)
          set({ db: snapshot })
        }
      },

      // ── WORK ORDERS ─────────────────────────────────────────────
      saveWO: async (data) => {
        const now      = new Date().toISOString()
        const snapshot = get().db

        if (data.id) {
          set((s) => ({
            db: {
              ...s.db,
              workOrders: s.db.workOrders.map((w) =>
                w.id === data.id ? { ...w, ...data, updatedAt: now } : w
              ),
            },
          }))
          // Two-way sync: si cambia dueDate de una OT preventiva
          const wo = get().db.workOrders.find((w) => w.id === data.id)
          if (wo?.pmPlanId && data.dueDate !== undefined) {
            set((s) => ({
              db: {
                ...s.db,
                assetPlans: s.db.assetPlans.map((ap) =>
                  ap.id === wo.pmPlanId ? { ...ap, nextDueDate: data.dueDate! } : ap
                ),
              },
            }))
            try { await api.assetPlans.updateDueDate(wo.pmPlanId, data.dueDate!) }
            catch (e) { console.error('Error sync dueDate:', e) }
          }
        } else {
          const newWO: WorkOrder = {
            id: uid('wo'), title: '', description: '', assetId: null,
            reportedById: get().currentUser?.id ?? null, assignedToId: null,
            priority: 'NORMAL', status: 'OPEN', type: 'CORRECTIVE',
            dueDate: null, startedAt: null, completedAt: null,
            timeSpentMin: null, resolutionNotes: null, pmPlanId: null,
            createdAt: now, updatedAt: now, ...data,
          }
          set((s) => ({ db: { ...s.db, workOrders: [...s.db.workOrders, newWO] } }))
          data = { ...data, id: newWO.id }
        }

        try {
          const saved = await api.workOrders.upsert(data)
          set((s) => ({
            db: {
              ...s.db,
              workOrders: s.db.workOrders.map((w) =>
                w.id === data.id || w.id === saved.id ? saved : w
              ),
            },
          }))
        } catch (e) {
          console.error('Error guardando OT:', e)
          set({ db: snapshot })
        }
      },

      deleteWO: async (id) => {
        const snapshot = get().db
        set((s) => ({
          db: { ...s.db, workOrders: s.db.workOrders.filter((w) => w.id !== id) },
          selectedWOId: s.selectedWOId === id ? null : s.selectedWOId,
        }))
        try { await api.workOrders.delete(id) }
        catch (e) { console.error('Error eliminando OT:', e); set({ db: snapshot }) }
      },

      updateWOStatus: async (id, status, extra = {}) => {
        const now      = new Date().toISOString()
        const snapshot = get().db

        // Calcular nextDueDate ANTES del set() para evitar problema de tipos
        let nextDueDateUpdate: { apId: string; date: string } | null = null
        if (status === 'COMPLETED' || status === 'CANCELLED') {
          const wo = snapshot.workOrders.find((w) => w.id === id)
          if (wo?.pmPlanId) {
            const ap   = snapshot.assetPlans.find((a) => a.id === wo.pmPlanId)
            const plan = ap ? snapshot.pmPlans.find((p) => p.id === ap.pmPlanId) : null
            if (ap && plan) {
              const base = (status === 'CANCELLED' && ap.nextDueDate) ? new Date(ap.nextDueDate) : (wo.dueDate ? new Date(wo.dueDate) : new Date(now))
              const next = new Date(base)
              next.setDate(next.getDate() + plan.frequencyDays)
              nextDueDateUpdate = { apId: ap.id, date: next.toISOString() }
            }
          }
        }

        set((s) => {
          let dbOut = { ...s.db }
          dbOut.workOrders = dbOut.workOrders.map((w) => {
            if (w.id !== id) return w
            const updates: Partial<WorkOrder> = { status, updatedAt: now, ...extra }
            if (status === 'IN_PROGRESS' && !w.startedAt) updates.startedAt = now
            if (status === 'COMPLETED' && !w.completedAt) {
              updates.completedAt = now
              if (w.startedAt && !updates.timeSpentMin && !w.timeSpentMin) {
                updates.timeSpentMin = Math.round(
                  (new Date(now).getTime() - new Date(w.startedAt).getTime()) / 60000
                )
              }
            }
            return { ...w, ...updates }
          })
          // Actualizar nextDueDate en assetPlans si corresponde
          if (nextDueDateUpdate) {
            dbOut.assetPlans = dbOut.assetPlans.map((a) =>
              a.id === nextDueDateUpdate!.apId
                ? { ...a, nextDueDate: nextDueDateUpdate!.date }
                : a
            )
          }
          return { db: dbOut }
        })

        try {
          await api.workOrders.updateStatus(id, status, extra)
          if (nextDueDateUpdate) {
            await api.assetPlans.updateDueDate(nextDueDateUpdate.apId, nextDueDateUpdate.date)
          }
        } catch (e) {
          console.error('Error actualizando estado OT:', e)
          set({ db: snapshot })
        }
      },

      toggleWoTask: async (taskId) => {
        const task = get().db.woTasks.find((t) => t.id === taskId)
        if (!task) return
        const newVal = !task.completed
        set((s) => ({
          db: {
            ...s.db,
            woTasks: s.db.woTasks.map((t) =>
              t.id === taskId ? { ...t, completed: newVal } : t
            ),
          },
        }))
        try { await api.woTasks.toggle(taskId, newVal) }
        catch (e) { console.error('Error toggling tarea:', e) }
      },

      addComment: async (woId, text) => {
        const userId  = get().currentUser?.id ?? ''
        const comment: WoComment = {
          id: uid('cmt'), workOrderId: woId,
          userId, text, createdAt: new Date().toISOString(),
        }
        set((s) => ({ db: { ...s.db, woComments: [...s.db.woComments, comment] } }))
        try { await api.woComments.insert(woId, userId, text) }
        catch (e) { console.error('Error guardando comentario:', e) }
      },

      addPartUsage: async (woId, itemId, qty) => {
        const snapshot = get().db
        const item = get().db.inventoryItems.find((i) => i.id === itemId)
        if (!item || item.currentStock < qty) return
        const usage: PartUsage = {
          id: uid('pu'), workOrderId: woId, inventoryItemId: itemId,
          quantity: qty, usedAt: new Date().toISOString(),
        }
        set((s) => ({
          db: {
            ...s.db,
            partUsages: [...s.db.partUsages, usage],
            inventoryItems: s.db.inventoryItems.map((i) =>
              i.id === itemId
                ? { ...i, currentStock: i.currentStock - qty, updatedAt: new Date().toISOString() }
                : i
            ),
          },
        }))
        try {
          await api.partUsages.insert(woId, itemId, qty)
          await api.inventory.adjustStock(itemId, item.currentStock - qty)
        } catch (e) {
          console.error('Error registrando parte:', e)
          set({ db: snapshot })
        }
      },

      removePartUsage: async (id) => {
        const snapshot = get().db
        const pu = get().db.partUsages.find((p) => p.id === id)
        set((s) => ({
          db: {
            ...s.db,
            partUsages: s.db.partUsages.filter((p) => p.id !== id),
            inventoryItems: pu
              ? s.db.inventoryItems.map((i) =>
                  i.id === pu.inventoryItemId
                    ? { ...i, currentStock: i.currentStock + pu.quantity }
                    : i
                )
              : s.db.inventoryItems,
          },
        }))
        try {
          await api.partUsages.delete(id)
          if (pu) {
            const item = get().db.inventoryItems.find((i) => i.id === pu.inventoryItemId)
            if (item) await api.inventory.adjustStock(item.id, item.currentStock)
          }
        } catch (e) {
          console.error('Error eliminando parte:', e)
          set({ db: snapshot })
        }
      },

      // ── PM PLANS ────────────────────────────────────────────────
      savePlan: async (data, taskDescriptions) => {
        const now      = new Date().toISOString()
        const snapshot = get().db
        let planId     = data.id ?? uid('pm')

        if (data.id) {
          set((s) => ({
            db: {
              ...s.db,
              pmPlans: s.db.pmPlans.map((p) =>
                p.id === data.id ? { ...p, ...data, updatedAt: now } : p
              ),
            },
          }))
        } else {
          const newPlan: PmPlan = {
            id: planId, name: '', triggerType: 'TIME_BASED', frequencyDays: 30, toleranceDays: 3,
            meterUnit: null, meterInterval: null, defaultAssignId: null,
            active: true, notes: '', createdAt: now, updatedAt: now, ...data,
          }
          set((s) => ({ db: { ...s.db, pmPlans: [...s.db.pmPlans, newPlan] } }))
        }

        // Tareas locales
        const newTasks: PmTask[] = taskDescriptions
          .filter((d) => d.trim())
          .map((desc, i) => ({ id: uid('tsk'), pmPlanId: planId, description: desc.trim(), order: i + 1 }))
        set((s) => ({
          db: {
            ...s.db,
            pmTasks: [...s.db.pmTasks.filter((t) => t.pmPlanId !== planId), ...newTasks],
          },
        }))

        try {
          const saved = await api.pmPlans.upsert({ ...data, id: planId })
          await api.pmTasks.replaceForPlan(saved.id, taskDescriptions)
          set((s) => ({
            db: {
              ...s.db,
              pmPlans: s.db.pmPlans.map((p) => p.id === planId ? saved : p),
            },
          }))
        } catch (e) {
          console.error('Error guardando plan:', e)
          set({ db: snapshot })
        }
      },

      deletePlan: async (id) => {
        const snapshot = get().db
        set((s) => ({
          db: {
            ...s.db,
            pmPlans:    s.db.pmPlans.filter((p)  => p.id !== id),
            pmTasks:    s.db.pmTasks.filter((t)  => t.pmPlanId !== id),
            assetPlans: s.db.assetPlans.filter((ap) => ap.pmPlanId !== id),
          },
        }))
        try { await api.pmPlans.delete(id) }
        catch (e) { console.error('Error eliminando plan:', e); set({ db: snapshot }) }
      },

      // ── ASSET PLANS ─────────────────────────────────────────────
      assignPlan: async (assetId, pmPlanId) => {
        const already = get().db.assetPlans.some(
          (ap) => ap.assetId === assetId && ap.pmPlanId === pmPlanId
        )
        if (already) return
        const plan = get().db.pmPlans.find((p) => p.id === pmPlanId)
        const next = new Date()
        next.setDate(next.getDate() + (plan?.frequencyDays ?? 30))
        const nextStr = next.toISOString()
        const tmpAp: AssetPlan = {
          id: uid('ap'), assetId, pmPlanId,
          nextDueDate: nextStr, active: true,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ db: { ...s.db, assetPlans: [...s.db.assetPlans, tmpAp] } }))
        try {
          const saved = await api.assetPlans.insert(assetId, pmPlanId, nextStr)
          set((s) => ({
            db: {
              ...s.db,
              assetPlans: s.db.assetPlans.map((ap) => ap.id === tmpAp.id ? saved : ap),
            },
          }))
        } catch (e) {
          console.error('Error asignando plan:', e)
          set((s) => ({
            db: {
              ...s.db,
              assetPlans: s.db.assetPlans.filter((ap) => ap.id !== tmpAp.id),
            },
          }))
        }
      },

      unassignPlan: async (assetId, pmPlanId) => {
        set((s) => ({
          db: {
            ...s.db,
            assetPlans: s.db.assetPlans.filter(
              (ap) => !(ap.assetId === assetId && ap.pmPlanId === pmPlanId)
            ),
          },
        }))
        try { await api.assetPlans.deleteByAssetAndPlan(assetId, pmPlanId) }
        catch (e) { console.error('Error desasignando plan:', e) }
      },

      toggleAssetPlan: async (apId) => {
        const ap = get().db.assetPlans.find((a) => a.id === apId)
        if (!ap) return
        const newVal = !ap.active
        set((s) => ({
          db: {
            ...s.db,
            assetPlans: s.db.assetPlans.map((a) =>
              a.id === apId ? { ...a, active: newVal } : a
            ),
          },
        }))
        try { await api.assetPlans.toggle(apId, newVal) }
        catch (e) { console.error('Error toggling plan:', e) }
      },

      removeAssetPlan: async (apId) => {
        set((s) => ({
          db: { ...s.db, assetPlans: s.db.assetPlans.filter((ap) => ap.id !== apId) },
        }))
        try { await api.assetPlans.delete(apId) }
        catch (e) { console.error('Error eliminando asignación:', e) }
      },

      generateWO: async (apId) => {
        const s = get()
        const existingActive = s.db.workOrders.find(
          (w) => w.pmPlanId === apId && ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status)
        )
        if (existingActive) {
          return null
        }

        const ap    = s.db.assetPlans.find((a) => a.id === apId)
        const plan  = ap ? s.db.pmPlans.find((p) => p.id === ap.pmPlanId) : null
        const asset = ap ? s.db.assets.find((a) => a.id === ap.assetId)   : null
        if (!ap || !plan || !asset) return null

        const now = new Date()
        const due = ap.nextDueDate ? new Date(ap.nextDueDate) : now

        const wo: WorkOrder = {
          id: uid('wo'), title: `PM: ${plan.name}`,
          description: `Mantenimiento preventivo para ${asset.name}`,
          assetId: asset.id, reportedById: s.currentUser?.id ?? null,
          assignedToId: plan.defaultAssignId,
          priority: 'NORMAL', status: 'OPEN', type: 'PREVENTIVE',
          dueDate: due.toISOString(), startedAt: null, completedAt: null,
          timeSpentMin: null, resolutionNotes: null, pmPlanId: apId,
          createdAt: now.toISOString(), updatedAt: now.toISOString(),
        }

        // Snapshot de tareas
        const pmTasks   = s.db.pmTasks.filter((t) => t.pmPlanId === plan.id).sort((a, b) => a.order - b.order)
        const snapshots = pmTasks.map((t) => ({
          id: uid('wot'), woId: wo.id, description: t.description, completed: false, order: t.order,
        }))

        set((ss) => ({
          db: {
            ...ss.db,
            workOrders: [...ss.db.workOrders, wo],
            woTasks:    [...(ss.db.woTasks || []), ...snapshots],
          },
        }))

        try {
          const saved = await api.workOrders.upsert(wo)
          if (snapshots.length > 0) await api.woTasks.insertMany(snapshots)
          set((ss) => ({
            db: {
              ...ss.db,
              workOrders: ss.db.workOrders.map((w) => w.id === wo.id ? saved : w),
            },
          }))
          return saved
        } catch (e) {
          console.error('Error generando OT:', e)
          return wo
        }
      },

      // ── INVENTORY ────────────────────────────────────────────────
      saveInventoryItem: async (data) => {
        const now      = new Date().toISOString()
        const snapshot = get().db

        if (data.id) {
          set((s) => ({
            db: {
              ...s.db,
              inventoryItems: s.db.inventoryItems.map((i) =>
                i.id === data.id ? { ...i, ...data, updatedAt: now } : i
              ),
            },
          }))
        } else {
          const tmp: InventoryItem = {
            id: uid('inv'), name: '', sku: '', category: 'consumable',
            currentStock: 0, minStock: 0, unit: 'pcs', unitCost: 0,
            location: '', supplier: '', notes: '', createdAt: now, updatedAt: now, ...data,
          }
          set((s) => ({ db: { ...s.db, inventoryItems: [...s.db.inventoryItems, tmp] } }))
          data = { ...data, id: tmp.id }
        }

        try {
          const saved = await api.inventory.upsert(data)
          set((s) => ({
            db: {
              ...s.db,
              inventoryItems: s.db.inventoryItems.map((i) =>
                i.id === data.id || i.id === saved.id ? saved : i
              ),
            },
          }))
        } catch (e) {
          console.error('Error guardando ítem:', e)
          set({ db: snapshot })
        }
      },

      deleteInventoryItem: async (id) => {
        const snapshot = get().db
        set((s) => ({
          db: { ...s.db, inventoryItems: s.db.inventoryItems.filter((i) => i.id !== id) },
        }))
        try { await api.inventory.delete(id) }
        catch (e) { console.error('Error eliminando ítem:', e); set({ db: snapshot }) }
      },

      adjustStock: async (id, newStock) => {
        set((s) => ({
          db: {
            ...s.db,
            inventoryItems: s.db.inventoryItems.map((i) =>
              i.id === id ? { ...i, currentStock: newStock, updatedAt: new Date().toISOString() } : i
            ),
          },
        }))
        try { await api.inventory.adjustStock(id, newStock) }
        catch (e) { console.error('Error ajustando stock:', e) }
      },

      // ── Reset demo ───────────────────────────────────────────────
      seedSupabase: async () => {
        ;(window as any)._toast?.('Borrando datos y restaurando demo...', 'info')
        try {
          await api.seedDatabase(DB_DEFAULTS)
          ;(window as any)._toast?.('Restauración completa. Obteniendo datos...', 'success')
          await get().loadFromSupabase()
        } catch (e: any) {
          ;(window as any)._toast?.('Error al restaurar datos: ' + e.message, 'error')
        }
      },
    })
)

// ── Selectores derivados ──────────────────────────────────────────
export const useActiveWOCount = () =>
  useStore((s) => s.db.workOrders.filter((w) => w.status !== 'COMPLETED' && w.status !== 'CANCELLED').length)

export const useLowStockCount = () =>
  useStore((s) => s.db.inventoryItems.filter((i) => i.currentStock <= i.minStock).length)

export const useStockStatus = (item: InventoryItem) => {
  if (item.currentStock === 0)             return 'er'
  if (item.currentStock < item.minStock)   return 'er'
  if (item.currentStock === item.minStock) return 'wn'
  return 'ok'
}
