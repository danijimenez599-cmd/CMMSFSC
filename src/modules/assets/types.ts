export type AssetType = 'plant' | 'area' | 'system' | 'equipment' | 'component';
export type AssetCategory = 'rotating' | 'static' | 'electrical' | 'instrument' | 'civil' | 'other';
export type AssetCriticality = 'high' | 'medium' | 'low';
export type AssetStatus = 'active' | 'standby' | 'decommissioned';

export interface Asset {
  id: string;
  parentId: string | null;
  locationId: string | null;
  name: string;
  code: string | null;
  assetType: AssetType;
  category: AssetCategory | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  installDate: string | null;
  warrantyUntil: string | null;
  criticality: AssetCriticality;
  status: AssetStatus;
  description: string | null;
  specs: Record<string, string | number>;
  imageUrl: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetTreeNode extends Asset {
  children: AssetTreeNode[];
  depth: number;
  path: string[];
}

export interface AssetInput {
  name: string;
  parentId?: string | null;
  locationId?: string | null;
  assetType: AssetType;
  category?: AssetCategory | null;
  criticality: AssetCriticality;
  status: AssetStatus;
  code?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  installDate?: string | null;
  warrantyUntil?: string | null;
  description?: string | null;
  specs?: Record<string, string | number>;
  imageUrl?: string | null;
}
