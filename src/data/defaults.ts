import { User } from '../shared/types';

export const defaultUsers: User[] = [
  { id: '00000000-0000-4000-a000-000000000001', fullName: 'Admin Principal', role: 'admin', avatarUrl: null, specialty: null, active: true },
  { id: '00000000-0000-4000-a000-000000000002', fullName: 'Supervisor Vega', role: 'supervisor', avatarUrl: null, specialty: 'Operaciones', active: true },
  { id: '00000000-0000-4000-a000-000000000003', fullName: 'Supervisora Clara', role: 'supervisor', avatarUrl: null, specialty: 'Mantenimiento', active: true },
  { id: '00000000-0000-4000-a000-000000000004', fullName: 'Técnico Martínez', role: 'technician', avatarUrl: null, specialty: 'Mecánico', active: true },
  { id: '00000000-0000-4000-a000-000000000005', fullName: 'Técnico López', role: 'technician', avatarUrl: null, specialty: 'Eléctrico', active: true },
  { id: '00000000-0000-4000-a000-000000000006', fullName: 'Técnico Ramírez', role: 'technician', avatarUrl: null, specialty: 'Instrumentación', active: true },
  { id: '00000000-0000-4000-a000-000000000007', fullName: 'Gerente (Viewer)', role: 'viewer', avatarUrl: null, specialty: null, active: true },
];
