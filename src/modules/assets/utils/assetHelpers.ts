import { Asset, AssetType, AssetCategory, AssetCriticality } from '../types';

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  plant: 'Planta', area: 'Área', system: 'Sistema', equipment: 'Equipo', component: 'Componente'
};

export const ASSET_TYPE_ICONS: Record<AssetType, string> = {
  plant: '🏭', area: '🗺️', system: '⚙️', equipment: '🔧', component: '🔩'
};

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  rotating: 'Rotativo', static: 'Estático', electrical: 'Eléctrico',
  instrument: 'Instrumentación', civil: 'Civil/Estructural', other: 'Otro'
};

export const CRITICALITY_CONFIG: Record<AssetCriticality, { label: string; badgeVariant: string; color: string }> = {
  low:    { label: 'Baja',  badgeVariant: 'info',   color: '#185fa5' },
  medium: { label: 'Media', badgeVariant: 'ok',     color: '#0f6e56' },
  high:   { label: 'Alta',  badgeVariant: 'danger', color: '#a32d2d' },
};

export function canDeleteAsset(id: string, assets: Asset[]): boolean {
  return assets.filter(a => a.parentId === id).length === 0;
}

export interface DeleteAssetCheck {
  canDelete: boolean;
  linkedPlans: number;
  linkedWorkOrders: number;
  linkedPoints: number;
}

export function checkAssetDeletability(
  id: string,
  assets: Asset[],
  assetPlans: any[],
  workOrders: any[],
  measurementPoints: any[]
): DeleteAssetCheck {
  const hasChildren = assets.some(a => a.parentId === id);
  return {
    canDelete: !hasChildren,
    linkedPlans: (assetPlans || []).filter((ap: any) => ap.assetId === id).length,
    linkedWorkOrders: (workOrders || []).filter((wo: any) => wo.assetId === id).length,
    linkedPoints: (measurementPoints || []).filter((mp: any) => mp.assetId === id).length,
  };
}

export function getDescendantIds(id: string, assets: Asset[]): string[] {
  const descendants: string[] = [];
  assets.filter(a => a.parentId === id).forEach(child => {
    descendants.push(child.id);
    descendants.push(...getDescendantIds(child.id, assets));
  });
  return descendants;
}
