// ================================================================
// APEX CMMS — Tipos del dominio
// Equivalente tipado de los Enums y esquemas de db.js
// ================================================================

export type Role        = 'ADMIN' | 'SUPERVISOR' | 'TECHNICIAN'
export type Criticality = 'HIGH' | 'MEDIUM' | 'LOW'
export type AssetStatus = 'OPERATIONAL' | 'IN_REPAIR' | 'OUT_OF_SERVICE'
export type Priority    = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'
export type WoStatus    = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type WoType      = 'CORRECTIVE' | 'PREVENTIVE'
export type PmTrigger   = 'TIME_BASED' | 'METER_BASED'
export type AssetCategory = 'plant' | 'area' | 'equip'

export interface User {
  id: string
  email: string
  passwordHash: string
  name: string
  role: Role
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Location {
  id: string
  name: string
  description: string | null
}

export interface Asset {
  id: string
  parentId: string | null
  name: string
  locationId: string | null
  category: AssetCategory
  brand: string
  model: string
  serialNumber: string
  criticality: Criticality
  status: AssetStatus
  installDate: string | null
  photoUrl: string | null
  notes: string
  qrCode: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkOrder {
  id: string
  title: string
  description: string
  assetId: string | null
  reportedById: string | null
  assignedToId: string | null
  priority: Priority
  status: WoStatus
  type: WoType
  dueDate: string | null
  startedAt: string | null
  completedAt: string | null
  timeSpentMin: number | null
  resolutionNotes: string | null
  pmPlanId: string | null   // apunta a assetPlan.id para trazabilidad
  createdAt: string
  updatedAt: string
}

export interface WoComment {
  id: string
  workOrderId: string
  userId: string
  text: string
  createdAt: string
}

export interface WoAttachment {
  id: string
  workOrderId: string
  fileName: string
  filePath: string
  fileSize: number
  uploadedBy: string | null
  createdAt: string
}

/** Plan genérico — define QUÉ se hace. Sin referencia a activo. */
export interface PmPlan {
  id: string
  name: string
  triggerType: PmTrigger
  frequencyDays: number
  toleranceDays: number
  meterUnit: string | null
  meterInterval: number | null
  defaultAssignId: string | null
  active: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

/** Tarea / actividad del checklist de un plan */
export interface PmTask {
  id: string
  pmPlanId: string
  description: string
  order: number
}

/** Tarea/checklist en una OT, snapshot de un PmTask o tarea nativa de la OT */
export interface WoTask {
  id: string
  woId: string
  description: string
  completed: boolean
  order: number
}

/**
 * Asignación equipo ↔ plan (muchos a muchos).
 * nextDueDate es por instancia — cada equipo tiene su propia fecha.
 */
export interface AssetPlan {
  id: string
  assetId: string
  pmPlanId: string
  nextDueDate: string | null
  active: boolean
  createdAt: string
}

export interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  minStock: number
  unit: string
  unitCost: number
  location: string
  supplier: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface PartUsage {
  id: string
  workOrderId: string
  inventoryItemId: string
  quantity: number
  usedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

/** Base de datos completa en memoria */
export interface AppDB {
  users: User[]
  locations: Location[]
  assets: Asset[]
  workOrders: WorkOrder[]
  woComments: WoComment[]
  woAttachments: WoAttachment[]
  woTasks: WoTask[]
  pmPlans: PmPlan[]
  pmTasks: PmTask[]
  assetPlans: AssetPlan[]
  meterReadings: unknown[]
  inventoryItems: InventoryItem[]
  partUsages: PartUsage[]
  notifications: Notification[]
}

/** Vista de navegación */
export type AppView = 'dashboard' | 'assets' | 'plans' | 'schedule' | 'workorders' | 'inventory' | 'indicators'
