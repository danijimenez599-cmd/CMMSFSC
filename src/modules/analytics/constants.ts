export const WO_TYPE_COLORS: Record<string, string> = {
  preventive: '#2563EB',
  corrective: '#D97706',
  predictive: '#7C3AED',
  inspection: '#00C8B8',
};

export const WO_TYPE_LABELS: Record<string, string> = {
  preventive: 'Preventiva',
  corrective: 'Correctiva',
  predictive: 'Predictiva',
  inspection: 'Inspección',
};

export const WO_STATUS_COLORS: Record<string, string> = {
  open: '#2563EB',
  assigned: '#4F46E5',
  in_progress: '#D97706',
  on_hold: '#64748B',
  completed: '#15803D',
  cancelled: '#64748B',
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
