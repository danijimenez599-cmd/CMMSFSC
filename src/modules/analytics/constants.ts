export const WO_TYPE_COLORS: Record<string, string> = {
  preventive: '#3b82f6',
  corrective: '#f59e0b',
  predictive: '#a855f7',
  inspection: '#10b981',
};

export const WO_TYPE_LABELS: Record<string, string> = {
  preventive: 'Preventiva',
  corrective: 'Correctiva',
  predictive: 'Predictiva',
  inspection: 'Inspección',
};

export const WO_STATUS_COLORS: Record<string, string> = {
  open: '#94a3b8',
  assigned: '#3b82f6',
  in_progress: '#f59e0b',
  on_hold: '#8b5cf6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

export const WO_STATUS_LABELS: Record<string, string> = {
  open: 'Abierta',
  assigned: 'Asignada',
  in_progress: 'En Progreso',
  on_hold: 'En Espera',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export const BACKLOG_STATUSES = ['open', 'assigned', 'in_progress', 'on_hold'] as const;

/** Tolerancia de SLA para PM Compliance — completado a tiempo si completedAt <= dueDate */
export const PM_ON_TIME_TOLERANCE_DAYS = 0;

/** Ventana (en días) para considerar Schedule Compliance: |completedAt - scheduledDate| <= N */
export const SCHEDULE_COMPLIANCE_WINDOW_DAYS = 3;
