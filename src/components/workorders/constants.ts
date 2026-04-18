export const STATUS_LABEL: Record<string, string> = {
  OPEN:'Abierta', ASSIGNED:'Asignada', IN_PROGRESS:'En Progreso',
  COMPLETED:'Completada', CANCELLED:'Cancelada',
}
export const STATUS_BADGE: Record<string, 'open'|'scheduled'|'ok'|'paused'> = {
  OPEN:'open', ASSIGNED:'scheduled', IN_PROGRESS:'open',
  COMPLETED:'ok', CANCELLED:'paused',
}
export const PRIORITY_LABEL: Record<string, string> = {
  URGENT:'Urgente', HIGH:'Alta', NORMAL:'Normal', LOW:'Baja',
}
export const PRIORITY_BADGE: Record<string, 'err'|'warn'|'ok'|'neutral'> = {
  URGENT:'err', HIGH:'err', NORMAL:'warn', LOW:'ok',
}
export const TYPE_ICON: Record<string, string> = { PREVENTIVE:'🛡️', CORRECTIVE:'🔧' }

export const ACTIONS: Record<string, string[]> = {
  OPEN:        ['asignar','cancelar'],
  ASSIGNED:    ['iniciar','reasignar','cancelar'],
  IN_PROGRESS: ['completar','cancelar'],
  COMPLETED:   ['reabrir'],
  CANCELLED:   ['reabrir'],
}
