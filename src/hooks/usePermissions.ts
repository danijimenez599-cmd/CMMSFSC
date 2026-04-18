// ================================================================
// APEX CMMS — Control de Acceso Basado en Roles (RBAC)
// ================================================================
// ADMIN      → Acceso total: configuración, usuarios, borrar cualquier cosa
// SUPERVISOR → Crea/edita OTs, planes, activos, ve inventario, no borra activos/planes
// TECHNICIAN → Ve sus OTs asignadas, puede iniciar/completar/comentar, ve inventario (read-only)
// ================================================================

import { useStore } from '@/store'
import type { Role } from '@/types'

export interface Permissions {
  // Navegación
  canView: {
    dashboard: boolean
    indicators: boolean
    assets: boolean
    plans: boolean
    schedule: boolean
    workorders: boolean
    inventory: boolean
  }

  // Work Orders
  canCreateWO: boolean
  canEditWO: boolean
  canDeleteWO: boolean
  canAssignWO: boolean
  canChangeWOStatus: boolean  // asignar, iniciar, completar, cancelar (acciones de flujo)
  canReopenWO: boolean
  canAddComments: boolean
  canAddParts: boolean
  canRemoveParts: boolean

  // Assets
  canEditAssets: boolean
  canDeleteAssets: boolean
  canAssignPlansToAssets: boolean

  // PM Plans
  canCreatePlans: boolean
  canEditPlans: boolean
  canDeletePlans: boolean
  canGenerateWOFromPlan: boolean

  // Inventory
  canEditInventory: boolean
  canAdjustStock: boolean

  // Admin
  canManageUsers: boolean
  canResetDemo: boolean
  canSwitchUser: boolean   // Selector de usuario en topbar
}

const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  ADMIN: {
    canView: {
      dashboard: true, indicators: true, assets: true, plans: true,
      schedule: true, workorders: true, inventory: true,
    },
    canCreateWO: true, canEditWO: true, canDeleteWO: true,
    canAssignWO: true, canChangeWOStatus: true, canReopenWO: true,
    canAddComments: true, canAddParts: true, canRemoveParts: true,
    canEditAssets: true, canDeleteAssets: true, canAssignPlansToAssets: true,
    canCreatePlans: true, canEditPlans: true, canDeletePlans: true, canGenerateWOFromPlan: true,
    canEditInventory: true, canAdjustStock: true,
    canManageUsers: true, canResetDemo: true, canSwitchUser: true,
  },

  SUPERVISOR: {
    canView: {
      dashboard: true, indicators: true, assets: true, plans: true,
      schedule: true, workorders: true, inventory: true,
    },
    canCreateWO: true, canEditWO: true, canDeleteWO: false,
    canAssignWO: true, canChangeWOStatus: true, canReopenWO: true,
    canAddComments: true, canAddParts: true, canRemoveParts: false,
    canEditAssets: true, canDeleteAssets: false, canAssignPlansToAssets: true,
    canCreatePlans: true, canEditPlans: true, canDeletePlans: false, canGenerateWOFromPlan: true,
    canEditInventory: true, canAdjustStock: true,
    canManageUsers: false, canResetDemo: false, canSwitchUser: true,
  },

  TECHNICIAN: {
    canView: {
      dashboard: true, indicators: false, assets: false, plans: false,
      schedule: true, workorders: true, inventory: false,
    },
    canCreateWO: true,   // puede reportar averías
    canEditWO: false,
    canDeleteWO: false,
    canAssignWO: false,
    canChangeWOStatus: true,  // puede iniciar y completar sus propias OTs
    canReopenWO: false,
    canAddComments: true,
    canAddParts: true,
    canRemoveParts: false,
    canEditAssets: false, canDeleteAssets: false, canAssignPlansToAssets: false,
    canCreatePlans: false, canEditPlans: false, canDeletePlans: false, canGenerateWOFromPlan: false,
    canEditInventory: false, canAdjustStock: false,
    canManageUsers: false, canResetDemo: false, canSwitchUser: true,
  },
}

export function usePermissions(): Permissions {
  const role = useStore((s) => s.currentUser?.role ?? 'TECHNICIAN')
  return ROLE_PERMISSIONS[role]
}

export function useRole(): Role {
  return useStore((s) => s.currentUser?.role ?? 'TECHNICIAN')
}

/** Retorna true si la OT pertenece al usuario actual (solo relevante para TECHNICIAN) */
export function useIsMyWO(assignedToId: string | null): boolean {
  const currentUserId = useStore((s) => s.currentUser?.id)
  const role = useRole()
  // Supervisors y Admins ven todo; técnicos solo las suyas
  if (role !== 'TECHNICIAN') return true
  return assignedToId === currentUserId
}
