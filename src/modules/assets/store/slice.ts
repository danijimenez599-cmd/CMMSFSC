import { StateCreator } from 'zustand';
import { Asset, AssetInput, AssetTreeNode } from '../types';
import { buildTree } from '../utils/buildTree';
import { generateId } from '../../../shared/utils/generateId';
import { supabase } from '../../../lib/supabase';

export interface AssetSlice {
  assets: Asset[];
  assetTree: AssetTreeNode[];
  selectedAssetId: string | null;
  assetsLoading: boolean;

  fetchAssets: () => Promise<void>;
  createAsset: (input: AssetInput) => Promise<Asset>;
  updateAsset: (id: string, input: Partial<AssetInput>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  selectAsset: (id: string | null) => void;
}

export const createAssetSlice: StateCreator<AssetSlice, [], []> = (set, get) => ({
  assets: [],
  assetTree: [],
  selectedAssetId: null,
  assetsLoading: false,

  fetchAssets: async () => {
    set({ assetsLoading: true });
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching assets:', error);
      set({ assetsLoading: false });
      return;
    }

    const assets: Asset[] = (data || []).map(a => ({
      id: a.id,
      parentId: a.parent_id,
      locationId: a.location_id,
      name: a.name,
      code: a.code,
      assetType: a.asset_type,
      category: a.category,
      manufacturer: a.manufacturer,
      model: a.model,
      serialNumber: a.serial_number,
      installDate: a.install_date,
      warrantyUntil: a.warranty_until,
      criticality: a.criticality,
      status: a.status,
      description: a.description,
      specs: a.specs || {},
      imageUrl: a.image_url,
      createdBy: a.created_by,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));

    set({ assets, assetTree: buildTree(assets), assetsLoading: false });
  },

  createAsset: async (input) => {
    const { data, error } = await supabase
      .from('assets')
      .insert({
        id: generateId(),
        parent_id: input.parentId || null,
        location_id: input.locationId || null,
        name: input.name,
        code: input.code || null,
        asset_type: input.assetType,
        category: input.category || null,
        manufacturer: input.manufacturer || null,
        model: input.model || null,
        serial_number: input.serialNumber || null,
        install_date: input.installDate || null,
        warranty_until: input.warrantyUntil || null,
        criticality: input.criticality,
        status: input.status,
        description: input.description || null,
        specs: input.specs || {},
        image_url: input.imageUrl || null,
      })
      .select()
      .single();

    if (error) throw error;
    await get().fetchAssets();

    const created = get().assets.find(a => a.id === data.id)!;
    return created;
  },

  updateAsset: async (id, input) => {
    const updates: Record<string, any> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.parentId !== undefined) updates.parent_id = input.parentId;
    if (input.locationId !== undefined) updates.location_id = input.locationId;
    if (input.code !== undefined) updates.code = input.code;
    if (input.assetType !== undefined) updates.asset_type = input.assetType;
    if (input.category !== undefined) updates.category = input.category;
    if (input.manufacturer !== undefined) updates.manufacturer = input.manufacturer;
    if (input.model !== undefined) updates.model = input.model;
    if (input.serialNumber !== undefined) updates.serial_number = input.serialNumber;
    if (input.installDate !== undefined) updates.install_date = input.installDate;
    if (input.warrantyUntil !== undefined) updates.warranty_until = input.warrantyUntil;
    if (input.criticality !== undefined) updates.criticality = input.criticality;
    if (input.status !== undefined) updates.status = input.status;
    if (input.description !== undefined) updates.description = input.description;
    if (input.specs !== undefined) updates.specs = input.specs;
    if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase.from('assets').update(updates).eq('id', id);
    if (error) throw error;
    await get().fetchAssets();
  },

  deleteAsset: async (id) => {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) throw error;
    if (get().selectedAssetId === id) set({ selectedAssetId: null });
    await get().fetchAssets();
  },

  selectAsset: (id) => set({ selectedAssetId: id }),
});
