import { create } from 'zustand';
import { UiSlice, createUiSlice } from './uiSlice';
import { AuthSlice, createAuthSlice } from './authSlice';
import { AssetSlice, createAssetSlice } from '../modules/assets/store/slice';
import { WoSlice, createWoSlice } from '../modules/workorders/store/slice';
import { InventorySlice, createInventorySlice } from '../modules/inventory/store/slice';
import { PmSlice, createPmSlice } from '../modules/pm/store/slice';
import { AlertSlice, createAlertSlice } from './alertSlice';

export type StoreState = UiSlice & AuthSlice & AssetSlice & WoSlice & InventorySlice & PmSlice & AlertSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createUiSlice(...a),
  ...createAuthSlice(...a),
  ...createAssetSlice(...a),
  ...createWoSlice(...a),
  ...createInventorySlice(...a),
  ...createPmSlice(...a),
  ...createAlertSlice(...a),
}));
