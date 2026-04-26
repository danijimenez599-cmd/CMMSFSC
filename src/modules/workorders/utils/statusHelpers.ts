import { WorkOrder, WoStatus } from '../types';
import { UserRole } from '../../../shared/types';

export const WO_STATUS_LABELS: Record<WoStatus, string> = {
  open:        'Abierta',
  assigned:    'Asignada',
  in_progress: 'En progreso',
  on_hold:     'En espera',
  completed:   'Completada',
  cancelled:   'Cancelada',
};

export const WO_STATUS_BADGE: Record<WoStatus, string> = {
  open:        'info',
  assigned:    'warn',
  in_progress: 'brand',
  on_hold:     'neutral',
  completed:   'ok',
  cancelled:   'neutral',
};

export const WO_ACTION_LABELS: Record<WoStatus, string> = {
  open:        'Liberar / Abrir',
  assigned:    'Asignar Personal',
  in_progress: 'Iniciar Trabajo',
  on_hold:     'Poner en Espera',
  completed:   'Finalizar y Cerrar',
  cancelled:   'Anular Orden',
};

export const WO_ACTION_THEME: Record<WoStatus, { variant: string; icon: string }> = {
  open:        { variant: 'outline', icon: 'RotateCcw' },
  assigned:    { variant: 'outline', icon: 'UserPlus' },
  in_progress: { variant: 'primary', icon: 'Play' },
  on_hold:     { variant: 'outline', icon: 'Pause' },
  completed:   { variant: 'success', icon: 'CheckCircle' },
  cancelled:   { variant: 'danger', icon: 'XCircle' },
};

export const WO_TYPE_LABELS: Record<string, string> = {
  preventive:  'Preventiva',
  corrective:  'Correctiva',
  predictive:  'Predictiva',
  inspection:  'Inspección',
};

export const WO_PRIORITY_CONFIG: Record<string, { label: string; color: string; textColor: string }> = {
  critical: { label: 'Crítica',  color: '#7f1d1d', textColor: 'text-danger' },
  high:     { label: 'Alta',     color: '#b45309', textColor: 'text-warn' },
  medium:   { label: 'Media',    color: '#1d4ed8', textColor: 'text-info' },
  low:      { label: 'Baja',     color: '#166534', textColor: 'text-ok' },
};

// Allowed transitions per role
const TRANSITIONS: Record<WoStatus, WoStatus[]> = {
  open:        ['assigned', 'cancelled'],
  assigned:    ['in_progress', 'open', 'cancelled'],
  in_progress: ['on_hold', 'completed', 'cancelled'],
  on_hold:     ['in_progress', 'cancelled'],
  completed:   [],
  cancelled:   [],
};

export function canTransition(
  from: WoStatus,
  to: WoStatus,
  role: UserRole,
  isAssignee: boolean
): boolean {
  if (!TRANSITIONS[from].includes(to)) return false;
  if (role === 'admin' || role === 'supervisor') return true;
  if (role === 'technician' && isAssignee) {
    // Assigned technicians can start, pause, and complete their own work orders
    return ['in_progress', 'on_hold', 'completed'].includes(to);
  }
  return false;
}

export function isOverdue(wo: WorkOrder): boolean {
  if (['completed', 'cancelled'].includes(wo.status)) return false;
  if (!wo.dueDate) return false;
  return new Date(wo.dueDate) < new Date();
}

export function getNextStatuses(current: WoStatus, role: UserRole, isAssignee: boolean): WoStatus[] {
  return TRANSITIONS[current].filter(s => canTransition(current, s, role, isAssignee));
}

export const FAILURE_CODE_LABELS: Record<string, string> = {
  'FC-LUB': 'Fallo Lubricación',
  'FC-ELC': 'Falla Eléctrica',
  'FC-MEC': 'Desgaste Mecánico',
  'FC-CAL': 'Descalibración',
  'FC-VIB': 'Vibración Excesiva',
  'FC-TEM': 'Temperatura Crítica',
  'FC-OTH': 'Otros Factores',
};
