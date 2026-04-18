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
  woFilter:        { status: string; type: string; priority: string; plantId: string; areaId: string }
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
      woFilter:        { status: 'all', type: 'all', priority: 'all', plantId: 'all', areaId: 'all' },
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
        // ================================================================
        // Motor de generación automática de OTs preventivas
        //
        // Regla: generar OT cuando nextDueDate ≤ hoy + toleranceDays,
        // siempre que no exista OT activa ni el ciclo ya esté completado.
        //
        // IMPORTANTE: leemos get().db en cada iteración (no snapshot inicial)
        // para que el estado post-generateWO sea visible y no generemos
        // duplicados cuando múltiples planes vencen simultáneamente.
        // ================================================================
        const now   = new Date()
        const apIds = get().db.assetPlans.map((ap) => ap.id)

        for (const apId of apIds) {
          const current = get().db
          const ap      = current.assetPlans.find((a) => a.id === apId)
          if (!ap || !ap.active || !ap.nextDueDate) continue

          const plan = current.pmPlans.find((p) => p.id === ap.pmPlanId)
          if (!plan || !plan.active) continue

          // Solo activos operacionales reciben OTs preventivas
          const asset = current.assets.find((a) => a.id === ap.assetId)
          if (!asset || asset.status !== 'OPERATIONAL') continue

          const due         = new Date(ap.nextDueDate)
          const horizonDays = Math.max(plan.toleranceDays ?? 0, 1)
          const horizonDate = new Date(now)
          horizonDate.setDate(horizonDate.getDate() + horizonDays)

          if (due > horizonDate) continue

          const hasActiveWO = current.workOrders.some(
            (w) => w.pmPlanId === ap.id && ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status)
          )
          if (hasActiveWO) continue

          const cycleStartDate = new Date(due)
          cycleStartDate.setDate(cycleStartDate.getDate() - (plan.frequencyDays ?? 30))

          const cycleAlreadyDone = current.workOrders.some((w) => {
            if (w.pmPlanId !== ap.id || w.status !== 'COMPLETED') return false
            if (!w.completedAt) return false
            return new Date(w.completedAt) >= cycleStartDate
          })
          if (cycleAlreadyDone) continue

          await get().generateWO(ap.id)
        }
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
        const now = new Date().toISOString()

        // Recolectar el activo y todos sus descendientes
        const toDelete = new Set<string>()
        const collect  = (aid: string) => {
          toDelete.add(aid)
          get().db.assets.filter((a) => a.parentId === aid).forEach((c) => collect(c.id))
        }
        collect(id)

        // 1. Pausar todos los AssetPlans afectados (no se generarán más OTs)
        // 2. Cancelar las OTs activas (OPEN/ASSIGNED/IN_PROGRESS) de los activos
        //    a eliminar — las completadas se conservan en el historial hasta que
        //    se eliminen las OTs individualmente.
        // 3. Devolver al inventario las partes de OTs que se van a cancelar.
        const activeStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS']
        const affectedWOs    = get().db.workOrders.filter(
          (w) => toDelete.has(w.assetId ?? '') && activeStatuses.includes(w.status)
        )

        // Devolver partes de OTs canceladas al stock
        const partUsagesToReverse = get().db.partUsages.filter(
          (pu) => affectedWOs.some((w) => w.id === pu.workOrderId)
        )

        set((s) => {
          // Reconstruir inventario con devolución de partes
          let inventoryItems = s.db.inventoryItems
          partUsagesToReverse.forEach((pu) => {
            inventoryItems = inventoryItems.map((i) =>
              i.id === pu.inventoryItemId
                ? { ...i, currentStock: i.currentStock + pu.quantity, updatedAt: now }
                : i
            )
          })

          return {
            db: {
              ...s.db,
              assets:     s.db.assets.filter((a) => !toDelete.has(a.id)),
              assetPlans: s.db.assetPlans.map((ap) =>
                toDelete.has(ap.assetId) ? { ...ap, active: false } : ap
              ).filter((ap) => !toDelete.has(ap.assetId)),
              workOrders: s.db.workOrders.map((w) =>
                toDelete.has(w.assetId ?? '') && activeStatuses.includes(w.status)
                  ? { ...w, status: 'CANCELLED' as const, updatedAt: now }
                  : w
              ),
              inventoryItems,
            },
            selectedAssetId: null,
          }
        })

        try {
          // Cancelar OTs activas en Supabase antes de borrar el activo
          for (const wo of affectedWOs) {
            await api.workOrders.updateStatus(wo.id, 'CANCELLED')
          }
          // Devolver stock en Supabase
          for (const pu of partUsagesToReverse) {
            const item = get().db.inventoryItems.find((i) => i.id === pu.inventoryItemId)
            if (item) await api.inventory.adjustStock(item.id, item.currentStock)
          }
          // Borrar activos (Supabase borrará AssetPlans y WOs orphans por FK cascade si está configurado)
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
          // Solo sincronizar cuando hay una fecha real — no propagar null,
          // porque borrar la dueDate de una OT no debe borrar nextDueDate del plan.
          const wo = get().db.workOrders.find((w) => w.id === data.id)
          if (wo?.pmPlanId && data.dueDate !== undefined && data.dueDate !== null) {
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
        const now = new Date().toISOString()

        // Devolver stock de partes al inventario antes de borrar la OT
        const partUsagesToReturn = snapshot.partUsages.filter((pu) => pu.workOrderId === id)

        set((s) => {
          let inventoryItems = s.db.inventoryItems
          partUsagesToReturn.forEach((pu) => {
            inventoryItems = inventoryItems.map((i) =>
              i.id === pu.inventoryItemId
                ? { ...i, currentStock: i.currentStock + pu.quantity, updatedAt: now }
                : i
            )
          })
          return {
            db: {
              ...s.db,
              workOrders:     s.db.workOrders.filter((w) => w.id !== id),
              woComments:     s.db.woComments.filter((c) => c.workOrderId !== id),
              woTasks:        s.db.woTasks.filter((t) => t.woId !== id),
              partUsages:     s.db.partUsages.filter((p) => p.workOrderId !== id),
              inventoryItems,
            },
            selectedWOId: s.selectedWOId === id ? null : s.selectedWOId,
          }
        })

        try {
          // Devolver stock en Supabase (part_usages se borran en cascada por FK)
          for (const pu of partUsagesToReturn) {
            const item = get().db.inventoryItems.find((i) => i.id === pu.inventoryItemId)
            if (item) await api.inventory.adjustStock(item.id, item.currentStock)
          }
          await api.workOrders.delete(id)
        } catch (e) {
          console.error('Error eliminando OT:', e)
          set({ db: snapshot })
        }
      },

      updateWOStatus: async (id, status, extra = {}) => {
        const now      = new Date().toISOString()
        const snapshot = get().db

        // ── Calcular nextDueDate ANTES del set() ─────────────────────
        let nextDueDateUpdate: { apId: string; date: string } | null = null
        if (status === 'COMPLETED' || status === 'CANCELLED') {
          const wo = snapshot.workOrders.find((w) => w.id === id)
          if (wo?.pmPlanId) {
            const ap   = snapshot.assetPlans.find((a) => a.id === wo.pmPlanId)
            const plan = ap ? snapshot.pmPlans.find((p) => p.id === ap.pmPlanId) : null
            if (ap && plan) {
              // CANCELLED: respeta la fecha original del ciclo (nextDueDate del plan)
              // COMPLETED: avanza desde la dueDate real de la OT
              const base = (status === 'CANCELLED' && ap.nextDueDate)
                ? new Date(ap.nextDueDate)
                : (wo.dueDate ? new Date(wo.dueDate) : new Date(now))
              const next = new Date(base)
              next.setDate(next.getDate() + plan.frequencyDays)
              nextDueDateUpdate = { apId: ap.id, date: next.toISOString() }
            }
          }
        }

        // ── Devolver stock si se cancela una OT con partes registradas ──
        // Las partes se descontaron al registrarse. Si la OT se cancela,
        // los materiales no se usaron y deben volver al inventario.
        const partUsagesToReturn = (status === 'CANCELLED')
          ? snapshot.partUsages.filter((pu) => pu.workOrderId === id)
          : []

        // ── Determinar nuevo estado del activo ────────────────────────
        // Reglas:
        //   IN_PROGRESS (correctivo) → activo pasa a IN_REPAIR
        //   COMPLETED / CANCELLED    → revisar si quedan otras OTs correctivas
        //                              activas para ese activo; si no, OPERATIONAL
        //   OPEN / ASSIGNED          → sin cambio (la falla está reportada pero
        //                              el equipo aún puede estar funcionando)
        const wo = snapshot.workOrders.find((w) => w.id === id)
        let assetStatusUpdate: { assetId: string; status: Asset['status'] } | null = null
        if (wo?.assetId && wo.type === 'CORRECTIVE') {
          if (status === 'IN_PROGRESS') {
            assetStatusUpdate = { assetId: wo.assetId, status: 'IN_REPAIR' }
          } else if (status === 'COMPLETED' || status === 'CANCELLED') {
            // ¿Quedan otras OTs correctivas activas para este activo?
            const stillActive = snapshot.workOrders.some(
              (w) =>
                w.id !== id &&
                w.assetId === wo.assetId &&
                w.type === 'CORRECTIVE' &&
                ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status)
            )
            if (!stillActive) {
              assetStatusUpdate = { assetId: wo.assetId, status: 'OPERATIONAL' }
            }
          }
        }

        set((s) => {
          let dbOut = { ...s.db }

          // Actualizar OT
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

          // Avanzar nextDueDate del plan preventivo si corresponde
          if (nextDueDateUpdate) {
            dbOut.assetPlans = dbOut.assetPlans.map((a) =>
              a.id === nextDueDateUpdate!.apId
                ? { ...a, nextDueDate: nextDueDateUpdate!.date }
                : a
            )
          }

          // Devolver stock de partes al cancelar
          if (partUsagesToReturn.length > 0) {
            partUsagesToReturn.forEach((pu) => {
              dbOut.inventoryItems = dbOut.inventoryItems.map((i) =>
                i.id === pu.inventoryItemId
                  ? { ...i, currentStock: i.currentStock + pu.quantity, updatedAt: now }
                  : i
              )
            })
          }

          // Sincronizar estado del activo
          if (assetStatusUpdate) {
            dbOut.assets = dbOut.assets.map((a) =>
              a.id === assetStatusUpdate!.assetId
                ? { ...a, status: assetStatusUpdate!.status, updatedAt: now }
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

          // Devolver stock en Supabase al cancelar
          for (const pu of partUsagesToReturn) {
            const item = get().db.inventoryItems.find((i) => i.id === pu.inventoryItemId)
            if (item) await api.inventory.adjustStock(item.id, item.currentStock)
          }

          // Sincronizar estado del activo en Supabase (método dedicado para
          // no sobrescribir campos con vacíos al hacer upsert parcial)
          if (assetStatusUpdate) {
            await api.assets.updateStatus(assetStatusUpdate.assetId, assetStatusUpdate.status)
          }

          // Re-evaluar generación de PMs tras cerrar ciclo
          if (status === 'COMPLETED' || status === 'CANCELLED') {
            await get().autoGeneratePMs()
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
        const newStock = item.currentStock - qty
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
                ? { ...i, currentStock: newStock, updatedAt: new Date().toISOString() }
                : i
            ),
          },
        }))

        // Notificar si el stock cae al punto de reorden o por debajo
        if (newStock <= item.minStock) {
          const level = newStock === 0 ? '🔴 SIN STOCK' : '⚠️ Stock bajo'
          ;(window as any)._toast?.(
            `${level}: ${item.name} — quedan ${newStock} ${item.unit}. Punto de reorden: ${item.minStock}.`,
            newStock === 0 ? 'error' : 'warn'
          )
        }

        try {
          await api.partUsages.insert(woId, itemId, qty)
          await api.inventory.adjustStock(itemId, newStock)
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
        const now = new Date().toISOString()

        // Obtener los IDs de assetPlans afectados
        const affectedApIds = new Set(
          snapshot.assetPlans.filter((ap) => ap.pmPlanId === id).map((ap) => ap.id)
        )

        // Cancelar OTs activas vinculadas a este plan para no dejarlas huérfanas
        const activeStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS']
        const woToCancel = snapshot.workOrders.filter(
          (w) => w.pmPlanId && affectedApIds.has(w.pmPlanId) && activeStatuses.includes(w.status)
        )

        set((s) => ({
          db: {
            ...s.db,
            pmPlans:    s.db.pmPlans.filter((p) => p.id !== id),
            pmTasks:    s.db.pmTasks.filter((t) => t.pmPlanId !== id),
            assetPlans: s.db.assetPlans.filter((ap) => ap.pmPlanId !== id),
            // Cancelar OTs activas — las completadas se conservan para histórico
            workOrders: s.db.workOrders.map((w) =>
              w.pmPlanId && affectedApIds.has(w.pmPlanId) && activeStatuses.includes(w.status)
                ? { ...w, status: 'CANCELLED' as const, updatedAt: now }
                : w
            ),
          },
        }))

        try {
          for (const wo of woToCancel) {
            await api.workOrders.updateStatus(wo.id, 'CANCELLED')
          }
          await api.pmPlans.delete(id)
        } catch (e) {
          console.error('Error eliminando plan:', e)
          set({ db: snapshot })
        }
      },

      // ── ASSET PLANS ─────────────────────────────────────────────
      assignPlan: async (assetId, pmPlanId) => {
        const already = get().db.assetPlans.some(
          (ap) => ap.assetId === assetId && ap.pmPlanId === pmPlanId
        )
        if (already) return

        // No asignar planes preventivos a activos que no están operacionales.
        // Un activo OUT_OF_SERVICE o IN_REPAIR no debe recibir OTs de PM —
        // contaminan el backlog y el calendario con trabajo no ejecutable.
        const asset = get().db.assets.find((a) => a.id === assetId)
        if (asset && asset.status !== 'OPERATIONAL') {
          ;(window as any)._toast?.(
            `No se puede asignar un plan a "${asset.name}" porque su estado es "${asset.status === 'IN_REPAIR' ? 'En Reparación' : 'Fuera de Servicio'}". Cambia el estado a Operacional primero.`,
            'error'
          )
          return
        }

        const plan = get().db.pmPlans.find((p) => p.id === pmPlanId)

        // No asignar planes inactivos — generarían OTs de un programa suspendido
        if (plan && !plan.active) {
          ;(window as any)._toast?.(
            `El plan "${plan.name}" está inactivo. Actívalo en Programas de Mtto antes de asignarlo.`,
            'warn'
          )
          return
        }

        // nextDueDate inicial = hoy + frequencyDays.
        // Esto refleja que el primer mantenimiento aún no se ha hecho
        // y debe planificarse al primer ciclo completo desde hoy.
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

          // FIX Bug 5: si el nextDueDate asignado ya cae dentro del horizonte
          // de tolerancia del plan, generar la OT de inmediato en lugar de
          // esperar al próximo arranque de la aplicación.
          const toleranceDays = Math.max(plan?.toleranceDays ?? 0, 1)
          const horizon = new Date()
          horizon.setDate(horizon.getDate() + toleranceDays)
          if (next <= horizon) {
            await get().generateWO(saved.id)
          }
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
        const snapshot = get().db
        const now = new Date().toISOString()

        // Encontrar el assetPlan específico que se está desvinculando
        const ap = snapshot.assetPlans.find(
          (a) => a.assetId === assetId && a.pmPlanId === pmPlanId
        )

        // Cancelar la OT activa de este ciclo si existe — no dejarla huérfana
        const activeStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS']
        const activeWO = ap
          ? snapshot.workOrders.find(
              (w) => w.pmPlanId === ap.id && activeStatuses.includes(w.status)
            )
          : null

        set((s) => ({
          db: {
            ...s.db,
            assetPlans: s.db.assetPlans.filter(
              (a) => !(a.assetId === assetId && a.pmPlanId === pmPlanId)
            ),
            workOrders: activeWO
              ? s.db.workOrders.map((w) =>
                  w.id === activeWO.id
                    ? { ...w, status: 'CANCELLED' as const, updatedAt: now }
                    : w
                )
              : s.db.workOrders,
          },
        }))

        try {
          if (activeWO) await api.workOrders.updateStatus(activeWO.id, 'CANCELLED')
          await api.assetPlans.deleteByAssetAndPlan(assetId, pmPlanId)
        } catch (e) {
          console.error('Error desasignando plan:', e)
          set({ db: snapshot })
        }
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
        try {
          await api.assetPlans.toggle(apId, newVal)
          // Si se reactiva un plan, evaluar inmediatamente si hay una OT que generar
          // (el plan puede haber estado pausado mientras vencía su nextDueDate)
          if (newVal) await get().autoGeneratePMs()
        } catch (e) {
          console.error('Error toggling plan:', e)
        }
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
        // Si nextDueDate ya pasó, usar hoy como fecha límite de la OT.
        // Una OT generada tardíamente no debería nacer ya vencida —
        // el técnico necesita tiempo real para ejecutarla.
        const rawDue  = ap.nextDueDate ? new Date(ap.nextDueDate) : now
        const due     = rawDue < now ? now : rawDue

        // Prioridad de la OT preventiva basada en la criticidad del activo:
        //   HIGH criticality  → priority HIGH  (no diferir, impacto alto en producción)
        //   MEDIUM criticality → priority NORMAL
        //   LOW criticality   → priority LOW
        const critToPriority: Record<string, WorkOrder['priority']> = {
          HIGH: 'HIGH', MEDIUM: 'NORMAL', LOW: 'LOW',
        }
        const woPriority = critToPriority[asset.criticality] ?? 'NORMAL'

        const wo: WorkOrder = {
          id: uid('wo'), title: `PM: ${plan.name}`,
          description: `Mantenimiento preventivo para ${asset.name}`,
          assetId: asset.id, reportedById: s.currentUser?.id ?? null,
          assignedToId: plan.defaultAssignId,
          priority: woPriority, status: 'OPEN', type: 'PREVENTIVE',
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
