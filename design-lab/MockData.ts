export const MOCK_USER = {
  fullName: 'Admin User',
  role: 'Mantenimiento Manager',
  email: 'admin@apex-cmms.com'
};

export const MOCK_STATS = [
  { title: 'Órdenes Abiertas', value: 24, description: '+4 desde ayer', variant: 'danger' },
  { title: 'Activos Críticos', value: 152, description: '98% disponibilidad', variant: 'ok' },
  { title: 'Stock Bajo', value: 8, description: 'Requiere atención', variant: 'warn' },
  { title: 'Presupuesto', value: '$12,400', description: 'Mes actual', variant: 'info' },
];

export const MOCK_WORK_ORDERS = [
  { id: 'WO-1001', title: 'Falla Motor Principal A1', priority: 'high', status: 'open', asset: 'Motor Siemens 50HP' },
  { id: 'WO-1002', title: 'Mantenimiento Preventivo Mensual', priority: 'medium', status: 'assigned', asset: 'Compresor Atlas Copco' },
  { id: 'WO-1003', title: 'Cambio de Aceite Reductor', priority: 'low', status: 'completed', asset: 'Cinta Transportadora 4' },
];

export const MOCK_ASSETS = [
  { id: 'AS-01', name: 'Torno CNC Mazak', category: 'Producción', status: 'active' },
  { id: 'AS-02', name: 'Bomba Centrifuga P-101', category: 'Utilidades', status: 'active' },
  { id: 'AS-03', name: 'Montacargas Toyota', category: 'Logística', status: 'maintenance' },
];
