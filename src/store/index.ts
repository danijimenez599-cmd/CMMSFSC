import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppDB, AppView, User, Asset, WorkOrder, PmPlan,
  PmTask, AssetPlan, InventoryItem, WoComment, PartUsage
} from '@/types'
import { DB_DEFAULTS } from '@/data/defaults'

// ── helpers ──────────────────────────────────────────────────────
let _seq = 0
export const uid = (prefix = 'cx') =>
  `${prefix}-${Date.now().toString(36)}-${(++_seq).toString(36)}`

// ── tipos del store ───────────────────────────────────────────────
interface AppState {
  // datos
  db: AppDB
  // navegación
  view: AppView
  // auth
  currentUser: User | null
  // selección activa
  selectedAssetId: string | null
  selectedWOId: string | null
  editingWOId: string | null | false
  woEditorInitial: Partial<WorkOrder> | null
  expandedAssets: string[]
  // filtros OT
  woFilter: { status: string; type: string; priority: string }

  // acciones — navegación
  navigate: (view: AppView) => void
  setSelectedAsset: (id: string | null) => void
  setSelectedWO: (id: string | null) => void
  openWOEditor: (id: string | null, initialData?: Partial<WorkOrder>) => void
  closeWOEditor: () => void
  toggleAssetNode: (id: string) => void

  // acciones — auth
  setCurrentUser: (user: User | null) => void

  // acciones — WO filter
  setWOFilter: (f: Partial<AppState['woFilter']>) => void

  // acciones — assets
  saveAsset: (data: Partial<Asset> & { id?: string }) => void
  deleteAsset: (id: string) => void

  // acciones — work orders
  saveWO: (data: Partial<WorkOrder> & { id?: string }) => void
  deleteWO: (id: string) => void
  updateWOStatus: (id: string, status: WorkOrder['status'], extra?: Partial<WorkOrder>) => void
  toggleWoTask: (taskId: string) => void
  addComment: (woId: string, text: string) => void
  addPartUsage: (woId: string, itemId: string, qty: number) => void
  removePartUsage: (id: string) => void

  // acciones — PM plans
  savePlan: (data: Partial<PmPlan> & { id?: string }, tasks: string[]) => void
  deletePlan: (id: string) => void

  // acciones — asset plans (asignación equipo↔plan)
  assignPlan: (assetId: string, pmPlanId: string) => void
  unassignPlan: (assetId: string, pmPlanId: string) => void
  toggleAssetPlan: (apId: string) => void
  removeAssetPlan: (apId: string) => void
  generateWO: (apId: string) => WorkOrder | null

  // acciones — inventory
  saveInventoryItem: (data: Partial<InventoryItem> & { id?: string }) => void
  deleteInventoryItem: (id: string) => void
  adjustStock: (id: string, newStock: number) => void

  // reset demo
  resetDemo: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      db: JSON.parse(JSON.stringify(DB_DEFAULTS)),
      view: 'dashboard',
      currentUser: DB_DEFAULTS.users[0] ?? null,
      selectedAssetId: null,
      selectedWOId: null,
      editingWOId: false,
      woEditorInitial: null,
      expandedAssets: ['asset-1', 'asset-2', 'asset-11', 'asset-16'],
      woFilter: { status: 'all', type: 'all', priority: 'all' },

      navigate: (view) => set({ view }),
      setSelectedAsset: (id) => set({ selectedAssetId: id }),
      setSelectedWO: (id) => set({ selectedWOId: id }),
      openWOEditor: (id, initialData) => set({ editingWOId: id, woEditorInitial: initialData || null }),
      closeWOEditor: () => set({ editingWOId: false, woEditorInitial: null }),
      toggleAssetNode: (id) =>
        set((s) => ({
          expandedAssets: s.expandedAssets.includes(id)
            ? s.expandedAssets.filter((x) => x !== id)
            : [...s.expandedAssets, id],
        })),

      setCurrentUser: (user) => set({ currentUser: user }),

      setWOFilter: (f) =>
        set((s) => ({ woFilter: { ...s.woFilter, ...f } })),

      // ── Assets ──────────────────────────────────────────────────
      saveAsset: (data) =>
        set((s) => {
          const now = new Date().toISOString()
          const db = { ...s.db }
          if (data.id) {
            db.assets = db.assets.map((a) =>
              a.id === data.id ? { ...a, ...data, updatedAt: now } : a
            )
          } else {
            const newAsset: Asset = {
              id: uid('ast'), parentId: null, name: '', category: 'equip',
              locationId: null, brand: '', model: '', serialNumber: '',
              criticality: 'MEDIUM', status: 'OPERATIONAL', installDate: null,
              photoUrl: null, notes: '', qrCode: null,
              createdAt: now, updatedAt: now, ...data,
            }
            db.assets = [...db.assets, newAsset]
          }
          return { db }
        }),

      deleteAsset: (id) =>
        set((s) => {
          const toDelete = new Set<string>()
          const collect = (aid: string) => {
            toDelete.add(aid)
            s.db.assets.filter((a) => a.parentId === aid).forEach((c) => collect(c.id))
          }
          collect(id)
          return {
            db: {
              ...s.db,
              assets: s.db.assets.filter((a) => !toDelete.has(a.id)),
              assetPlans: s.db.assetPlans.filter((ap) => !toDelete.has(ap.assetId)),
              workOrders: s.db.workOrders.filter((wo) => !toDelete.has(wo.assetId ?? '')),
            },
            selectedAssetId: null,
          }
        }),

      // ── Work Orders ──────────────────────────────────────────────
      saveWO: (data) =>
        set((s) => {
          const now = new Date().toISOString()
          const db = { ...s.db }
          if (data.id) {
            db.workOrders = db.workOrders.map((w) =>
              w.id === data.id ? { ...w, ...data, updatedAt: now } : w
            )
            // Mejora C: Two-Way Sync al Reprogramar
            // Si la OT es preventiva y se cambió su dueDate
            const updatedWO = db.workOrders.find(w => w.id === data.id)
            if (updatedWO && updatedWO.pmPlanId && data.dueDate !== undefined) {
              db.assetPlans = db.assetPlans.map(ap => 
                ap.id === updatedWO.pmPlanId ? { ...ap, nextDueDate: data.dueDate! } : ap
              )
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
            db.workOrders = [...db.workOrders, newWO]
          }
          return { db }
        }),

      deleteWO: (id) =>
        set((s) => ({
          db: { ...s.db, workOrders: s.db.workOrders.filter((w) => w.id !== id) },
          selectedWOId: s.selectedWOId === id ? null : s.selectedWOId,
        })),

      updateWOStatus: (id, status, extra = {}) =>
        set((s) => {
          const now = new Date().toISOString()
          let dbOut = { ...s.db }
          
          dbOut.workOrders = dbOut.workOrders.map((w) => {
            if (w.id !== id) return w
            
            const updates: Partial<WorkOrder> = { status, updatedAt: now, ...extra }
            
            if (status === 'IN_PROGRESS' && !w.startedAt) {
              updates.startedAt = now
            }
            if (status === 'COMPLETED' && !w.completedAt) {
              updates.completedAt = now
              if (w.startedAt && !updates.timeSpentMin && !w.timeSpentMin) {
                updates.timeSpentMin = Math.round((new Date(now).getTime() - new Date(w.startedAt).getTime()) / 60000)
              }

              // MEJORA D: RECALCULAR nextDueDate AQUI PARA OTs PREVENTIVAS CERRADAS CON BASELINE
              if (w.pmPlanId) {
                const ap = dbOut.assetPlans.find(a => a.id === w.pmPlanId)
                if (ap) {
                  const plan = dbOut.pmPlans.find(p => p.id === ap.pmPlanId)
                  if (plan) {
                    // Usar dueDate de la OT como baseline, sino fallback a now
                    const baseDate = w.dueDate ? new Date(w.dueDate) : new Date(now)
                    const next = new Date(baseDate)
                    next.setDate(next.getDate() + plan.frequencyDays)
                    dbOut.assetPlans = dbOut.assetPlans.map(a => 
                      a.id === ap.id ? { ...a, nextDueDate: next.toISOString() } : a
                    )
                  }
                }
              }
            }
            
            return { ...w, ...updates }
          })

          return { db: dbOut }
        }),

      toggleWoTask: (taskId) =>
        set((s) => ({
          db: {
            ...s.db,
            woTasks: s.db.woTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
          }
        })),

      addComment: (woId, text) =>
        set((s) => {
          const comment: WoComment = {
            id: uid('cmt'), workOrderId: woId,
            userId: s.currentUser?.id ?? '',
            text, createdAt: new Date().toISOString(),
          }
          return { db: { ...s.db, woComments: [...s.db.woComments, comment] } }
        }),

      addPartUsage: (woId, itemId, qty) =>
        set((s) => {
          const item = s.db.inventoryItems.find((i) => i.id === itemId)
          if (!item || item.currentStock < qty) return s
          const usage: PartUsage = {
            id: uid('pu'), workOrderId: woId, inventoryItemId: itemId,
            quantity: qty, usedAt: new Date().toISOString(),
          }
          return {
            db: {
              ...s.db,
              partUsages: [...s.db.partUsages, usage],
              inventoryItems: s.db.inventoryItems.map((i) =>
                i.id === itemId
                  ? { ...i, currentStock: i.currentStock - qty, updatedAt: new Date().toISOString() }
                  : i
              ),
            },
          }
        }),

      removePartUsage: (id) =>
        set((s) => {
          const pu = s.db.partUsages.find((p) => p.id === id)
          return {
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
          }
        }),

      // ── PM Plans ─────────────────────────────────────────────────
      savePlan: (data, taskDescriptions) =>
        set((s) => {
          const now = new Date().toISOString()
          const db = { ...s.db }
          let planId = data.id ?? uid('pm')

          if (data.id) {
            db.pmPlans = db.pmPlans.map((p) =>
              p.id === data.id ? { ...p, ...data, updatedAt: now } : p
            )
          } else {
            const newPlan: PmPlan = {
              id: planId, name: '', triggerType: 'TIME_BASED', frequencyDays: 30,
              meterUnit: null, meterInterval: null, defaultAssignId: null,
              active: true, notes: '', createdAt: now, updatedAt: now, ...data,
            }
            db.pmPlans = [...db.pmPlans, newPlan]
          }

          // reemplazar tareas del plan
          const newTasks: PmTask[] = taskDescriptions
            .filter((d) => d.trim())
            .map((desc, i) => ({
              id: uid('tsk'), pmPlanId: planId, description: desc.trim(), order: i + 1,
            }))
          db.pmTasks = [...db.pmTasks.filter((t) => t.pmPlanId !== planId), ...newTasks]
          return { db }
        }),

      deletePlan: (id) =>
        set((s) => ({
          db: {
            ...s.db,
            pmPlans: s.db.pmPlans.filter((p) => p.id !== id),
            pmTasks: s.db.pmTasks.filter((t) => t.pmPlanId !== id),
            assetPlans: s.db.assetPlans.filter((ap) => ap.pmPlanId !== id),
          },
        })),

      // ── Asset Plans ──────────────────────────────────────────────
      assignPlan: (assetId, pmPlanId) =>
        set((s) => {
          const already = s.db.assetPlans.some(
            (ap) => ap.assetId === assetId && ap.pmPlanId === pmPlanId
          )
          if (already) return s
          const plan = s.db.pmPlans.find((p) => p.id === pmPlanId)
          const next = new Date()
          next.setDate(next.getDate() + (plan?.frequencyDays ?? 30))
          const ap: AssetPlan = {
            id: uid('ap'), assetId, pmPlanId,
            nextDueDate: next.toISOString(), active: true,
            createdAt: new Date().toISOString(),
          }
          return { db: { ...s.db, assetPlans: [...s.db.assetPlans, ap] } }
        }),

      unassignPlan: (assetId, pmPlanId) =>
        set((s) => ({
          db: {
            ...s.db,
            assetPlans: s.db.assetPlans.filter(
              (ap) => !(ap.assetId === assetId && ap.pmPlanId === pmPlanId)
            ),
          },
        })),

      toggleAssetPlan: (apId) =>
        set((s) => ({
          db: {
            ...s.db,
            assetPlans: s.db.assetPlans.map((ap) =>
              ap.id === apId ? { ...ap, active: !ap.active } : ap
            ),
          },
        })),

      removeAssetPlan: (apId) =>
        set((s) => ({
          db: { ...s.db, assetPlans: s.db.assetPlans.filter((ap) => ap.id !== apId) },
        })),

      generateWO: (apId) => {
        let createdWO: WorkOrder | null = null
        set((s) => {
          // Bloqueo Antibugging: Comprobar si ya existe una OT activa para este apId
          const existingActive = s.db.workOrders.find(w => 
            w.pmPlanId === apId && 
            ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status)
          )
          
          if (existingActive) {
            ;(window as any)._toast?.('Bloqueado', `Ya existe una OT preventiva en curso (#${existingActive.id.slice(0,6)})`, 'err')
            return s
          }

          const ap    = s.db.assetPlans.find((a) => a.id === apId)
          const plan  = ap ? s.db.pmPlans.find((p) => p.id === ap.pmPlanId) : null
          const asset = ap ? s.db.assets.find((a) => a.id === ap.assetId)   : null
          if (!ap || !plan || !asset) return s

          const now = new Date()
          // MEJORA A: Heredar exactamente la fecha estipulada en el plan
          const due = ap.nextDueDate ? new Date(ap.nextDueDate) : new Date()

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
          createdWO = wo
          
          // Snapshot de tareas
          const pmTasks = s.db.pmTasks.filter(t => t.pmPlanId === plan.id).sort((a,b) => a.order - b.order)
          const snapshots = pmTasks.map(t => ({
            id: uid('wot'), woId: wo.id, description: t.description, completed: false, order: t.order
          }))

          return {
            db: {
              ...s.db,
              workOrders: [...s.db.workOrders, wo],
              woTasks: [...(s.db.woTasks || []), ...snapshots],
              // NOTA: No recalculamos nextDueDate aquí. Ocurrirá en updateWOStatus -> COMPLETED.
            },
          }
        })
        return createdWO
      },

      // ── Inventory ────────────────────────────────────────────────
      saveInventoryItem: (data) =>
        set((s) => {
          const now = new Date().toISOString()
          const db = { ...s.db }
          if (data.id) {
            db.inventoryItems = db.inventoryItems.map((i) =>
              i.id === data.id ? { ...i, ...data, updatedAt: now } : i
            )
          } else {
            const item: InventoryItem = {
              id: uid('inv'), name: '', sku: '', category: 'consumable',
              currentStock: 0, minStock: 0, unit: 'pcs', unitCost: 0,
              location: '', supplier: '', notes: '', createdAt: now, updatedAt: now, ...data,
            }
            db.inventoryItems = [...db.inventoryItems, item]
          }
          return { db }
        }),

      deleteInventoryItem: (id) =>
        set((s) => ({
          db: { ...s.db, inventoryItems: s.db.inventoryItems.filter((i) => i.id !== id) },
        })),

      adjustStock: (id, newStock) =>
        set((s) => ({
          db: {
            ...s.db,
            inventoryItems: s.db.inventoryItems.map((i) =>
              i.id === id
                ? { ...i, currentStock: newStock, updatedAt: new Date().toISOString() }
                : i
            ),
          },
        })),

      resetDemo: () => {
        set({
          db: JSON.parse(JSON.stringify(DB_DEFAULTS)),
          selectedAssetId: null,
          selectedWOId: null,
          view: 'dashboard',
          currentUser: DB_DEFAULTS.users[0] ?? null,
        })
      },
    }),
    {
      name: 'apex-cmms-db',
      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (version < 4) {
          // Migrando a v4: Forzar nueva inyección de data limpia
          return { ...persistedState, db: JSON.parse(JSON.stringify(DB_DEFAULTS)) } as any
        }
        return persistedState as any
      },
      partialize: (s) => ({ db: s.db, currentUser: s.currentUser }),
    }
  )
)

// ── Selectores derivados (evitan recalcular en cada render) ───────
export const useActiveWOCount = () =>
  useStore((s) =>
    s.db.workOrders.filter(
      (w) => w.status !== 'COMPLETED' && w.status !== 'CANCELLED'
    ).length
  )

export const useLowStockCount = () =>
  useStore((s) =>
    s.db.inventoryItems.filter((i) => i.currentStock <= i.minStock).length
  )

export const useStockStatus = (item: InventoryItem) => {
  if (item.currentStock === 0) return 'er'
  if (item.currentStock < item.minStock) return 'er'
  if (item.currentStock === item.minStock) return 'wn'
  return 'ok'
}
