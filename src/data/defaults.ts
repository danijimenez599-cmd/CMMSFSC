import { User, Location } from '../shared/types';
import { Asset } from '../modules/assets/types';
import { PmPlan, AssetPlan, PmTask } from '../modules/pm/types';

export const defaultPmPlans: PmPlan[] = [
  {
    id: '00000000-0000-4000-b000-000000000001',
    name: 'Mantenimiento Mensual de Bomba',
    description: 'Revisión preventiva de vibraciones y lubricación',
    triggerType: 'calendar',
    intervalValue: 1,
    intervalUnit: 'months',
    intervalMode: 'fixed',
    leadDays: 5,
    meterIntervalValue: null,
    meterIntervalUnit: null,
    estimatedDuration: 2,
    criticality: 'high',
    createdAt: new Date().toISOString()
  },
  {
    id: '00000000-0000-4000-b000-000000000002',
    name: 'Inspección Eléctrica Anual',
    description: 'Termografía y revisión de tableros',
    triggerType: 'calendar',
    intervalValue: 12,
    intervalUnit: 'months',
    intervalMode: 'floating',
    leadDays: 14,
    meterIntervalValue: null,
    meterIntervalUnit: null,
    estimatedDuration: 6,
    criticality: 'critical',
    createdAt: new Date().toISOString()
  }
];

export const defaultAssetPlans: AssetPlan[] = [];
export const defaultPmTasks: PmTask[] = [];

export const defaultUsers: User[] = [
  { id: '00000000-0000-4000-a000-000000000001', fullName: 'Admin Principal', role: 'admin', avatarUrl: null, specialty: null, active: true },
  { id: '00000000-0000-4000-a000-000000000002', fullName: 'Supervisor Vega', role: 'supervisor', avatarUrl: null, specialty: 'Operaciones', active: true },
  { id: '00000000-0000-4000-a000-000000000003', fullName: 'Supervisora Clara', role: 'supervisor', avatarUrl: null, specialty: 'Mantenimiento', active: true },
  { id: '00000000-0000-4000-a000-000000000004', fullName: 'Técnico Martínez', role: 'technician', avatarUrl: null, specialty: 'Mecánico', active: true },
  { id: '00000000-0000-4000-a000-000000000005', fullName: 'Técnico López', role: 'technician', avatarUrl: null, specialty: 'Eléctrico', active: true },
  { id: '00000000-0000-4000-a000-000000000006', fullName: 'Técnico Ramírez', role: 'technician', avatarUrl: null, specialty: 'Instrumentación', active: true },
  { id: '00000000-0000-4000-a000-000000000007', fullName: 'Gerente (Viewer)', role: 'viewer', avatarUrl: null, specialty: null, active: true },
];

export const defaultLocations: Location[] = [];

const baseAsset = {
  status: 'active' as const, manufacturer: null, model: null, serialNumber: null,
  installDate: '2025-01-01', warrantyUntil: null, description: null, specs: {},
  imageUrl: null, createdBy: '00000000-0000-4000-a000-000000000001', createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z', locationId: null
};

export const defaultAssets: Asset[] = [
  { id: '00000000-0000-4000-c000-000000000001', parentId: null, name: 'Planta LPG El Pacífico', code: 'PL-LPG', assetType: 'plant', category: 'civil', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000002', parentId: '00000000-0000-4000-c000-000000000001', name: 'Área de Almacenamiento', code: 'AREA-ALM', assetType: 'area', category: 'civil', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000003', parentId: '00000000-0000-4000-c000-000000000001', name: 'Área de Compresión', code: 'AREA-COMP', assetType: 'area', category: 'civil', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000004', parentId: '00000000-0000-4000-c000-000000000001', name: 'Área de Despacho', code: 'AREA-DESP', assetType: 'area', category: 'civil', criticality: 'medium', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000005', parentId: '00000000-0000-4000-c000-000000000002', name: 'Tanque TK-001 GLP', code: 'TK-001', assetType: 'equipment', category: 'static', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000006', parentId: '00000000-0000-4000-c000-000000000002', name: 'Tanque TK-002 GLP', code: 'TK-002', assetType: 'equipment', category: 'static', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000007', parentId: '00000000-0000-4000-c000-000000000003', name: 'Compresor A — Ariel JGC/4', code: 'COMP-A', assetType: 'equipment', category: 'rotating', criticality: 'high', ...baseAsset, manufacturer: 'Ariel', model: 'JGC/4' },
  { id: '00000000-0000-4000-c000-000000000008', parentId: '00000000-0000-4000-c000-000000000003', name: 'Compresor B — Ariel JGC/4', code: 'COMP-B', assetType: 'equipment', category: 'rotating', criticality: 'high', ...baseAsset, manufacturer: 'Ariel', model: 'JGC/4' },
  { id: '00000000-0000-4000-c000-000000000009', parentId: '00000000-0000-4000-c000-000000000002', name: 'Bomba de transferencia P-01', code: 'P-01', assetType: 'equipment', category: 'rotating', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000010', parentId: '00000000-0000-4000-c000-000000000005', name: 'Válvula de seguridad PSV-101', code: 'PSV-101', assetType: 'component', category: 'instrument', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000011', parentId: '00000000-0000-4000-c000-000000000004', name: 'Brazo de Carga 1', code: 'BC-01', assetType: 'equipment', category: 'rotating', criticality: 'medium', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000012', parentId: '00000000-0000-4000-c000-000000000004', name: 'Brazo de Carga 2', code: 'BC-02', assetType: 'equipment', category: 'rotating', criticality: 'medium', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000013', parentId: '00000000-0000-4000-c000-000000000007', name: 'Motor C-A 500HP', code: 'MTR-COMP-A', assetType: 'component', category: 'electrical', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000014', parentId: '00000000-0000-4000-c000-000000000008', name: 'Motor C-B 500HP', code: 'MTR-COMP-B', assetType: 'component', category: 'electrical', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000015', parentId: '00000000-0000-4000-c000-000000000009', name: 'Motor Bomba P-01', code: 'MTR-P-01', assetType: 'component', category: 'electrical', criticality: 'medium', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000016', parentId: '00000000-0000-4000-c000-000000000001', name: 'Sistema de Control (DCS)', code: 'DCS-01', assetType: 'system', category: 'instrument', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000017', parentId: '00000000-0000-4000-c000-000000000016', name: 'PLC Principal', code: 'PLC-01', assetType: 'component', category: 'instrument', criticality: 'high', ...baseAsset, manufacturer: 'Allen-Bradley' },
  { id: '00000000-0000-4000-c000-000000000018', parentId: '00000000-0000-4000-c000-000000000001', name: 'Subestación Principal', code: 'SE-01', assetType: 'area', category: 'electrical', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000019', parentId: '00000000-0000-4000-c000-000000000018', name: 'Transformador TX-01', code: 'TX-01', assetType: 'equipment', category: 'electrical', criticality: 'high', ...baseAsset },
  { id: '00000000-0000-4000-c000-000000000020', parentId: '00000000-0000-4000-c000-000000000018', name: 'Tablero de Distribución D-01', code: 'TD-01', assetType: 'equipment', category: 'electrical', criticality: 'medium', ...baseAsset },
];
