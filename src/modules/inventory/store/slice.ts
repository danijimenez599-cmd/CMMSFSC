import { StateCreator } from 'zustand';
import { InventoryItem, StockMovement, StockAdjustInput, InventoryItemInput } from '../types';
import { generateId } from '../../../shared/utils/utils';
import { supabase } from '../../../lib/supabase';

export interface InventorySlice {
  inventoryItems: InventoryItem[];
  stockMovements: StockMovement[];
  selectedItemId: string | null;
  inventoryLoading: boolean;

  fetchInventory: () => Promise<void>;
  createItem: (input: InventoryItemInput) => Promise<InventoryItem>;
  updateItem: (id: string, input: Partial<InventoryItemInput>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  adjustStock: (itemId: string, adjust: StockAdjustInput) => Promise<void>;
  selectItem: (id: string | null) => void;
}

export const createInventorySlice: StateCreator<InventorySlice, [], []> = (set, get) => ({
  inventoryItems: [],
  stockMovements: [],
  selectedItemId: null,
  inventoryLoading: false,

  fetchInventory: async () => {
    set({ inventoryLoading: true });

    const [itemsRes, movementsRes] = await Promise.all([
      supabase
        .from('inventory_items')
        .select('*')
        // PHASE 4: Only show active items in daily operations.
        // Deactivated parts are hidden but their part_usage / stock_movement
        // history is preserved via the RESTRICT FK constraint in the DB.
        .eq('active', true)
        .order('name'),
      supabase.from('stock_movements').select('*').order('performed_at', { ascending: false }).limit(200),
    ]);

    if (itemsRes.error) {
      console.error('Error fetching inventory:', itemsRes.error);
      set({ inventoryLoading: false });
      return;
    }

    const inventoryItems: InventoryItem[] = (itemsRes.data || []).map(i => ({
      id: i.id,
      name: i.name,
      partNumber: i.part_number,
      description: i.description,
      category: i.category,
      unit: i.unit,
      stockCurrent: i.stock_current,
      stockMin: i.stock_min,
      stockMax: i.stock_max,
      locationBin: i.location_bin,
      unitCost: i.unit_cost,
      supplierId: i.supplier_id,
      active: i.active,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
    }));

    const stockMovements: StockMovement[] = (movementsRes.data || []).map(m => ({
      id: m.id,
      inventoryItemId: m.inventory_item_id,
      type: m.type,
      quantity: m.quantity,
      balanceBefore: m.balance_before,
      balanceAfter: m.balance_after,
      workOrderId: m.work_order_id,
      reason: m.reason,
      performedBy: m.performed_by,
      performedAt: m.performed_at,
    }));

    set({ inventoryItems, stockMovements, inventoryLoading: false });
  },

  createItem: async (input) => {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        id: generateId(),
        name: input.name,
        part_number: input.partNumber || null,
        description: input.description || null,
        category: input.category || null,
        unit: input.unit,
        stock_current: input.stockCurrent ?? 0,
        stock_min: input.stockMin ?? 1,
        stock_max: input.stockMax ?? null,
        location_bin: input.locationBin || null,
        unit_cost: input.unitCost ?? null,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    await get().fetchInventory();
    return get().inventoryItems.find(i => i.id === data.id)!;
  },

  updateItem: async (id, input) => {
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) updates.name = input.name;
    if (input.partNumber !== undefined) updates.part_number = input.partNumber;
    if (input.description !== undefined) updates.description = input.description;
    if (input.category !== undefined) updates.category = input.category;
    if (input.unit !== undefined) updates.unit = input.unit;
    if (input.stockMin !== undefined) updates.stock_min = input.stockMin;
    if (input.stockMax !== undefined) updates.stock_max = input.stockMax;
    if (input.locationBin !== undefined) updates.location_bin = input.locationBin;
    if (input.unitCost !== undefined) updates.unit_cost = input.unitCost;

    const { error } = await supabase.from('inventory_items').update(updates).eq('id', id);
    if (error) throw error;
    await get().fetchInventory();
  },

  deleteItem: async (id) => {
    // PHASE 3 — Soft Delete: never physically remove an inventory item.
    // The DB has ON DELETE RESTRICT on part_usages.inventory_item_id and
    // stock_movements.inventory_item_id, so a hard delete would be blocked
    // anyway if the item has any historical transactions.
    const { error } = await supabase
      .from('inventory_items')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    if (get().selectedItemId === id) set({ selectedItemId: null });
    await get().fetchInventory();
  },

  adjustStock: async (itemId, adjust) => {
    const item = get().inventoryItems.find(i => i.id === itemId);
    if (!item) return;
    const { error } = await supabase.rpc('fn_adjust_stock_tx', {
      p_item_id: itemId,
      p_type: adjust.type,
      p_quantity: adjust.quantity,
      p_work_order_id: adjust.workOrderId || null,
      p_reason: adjust.reason || null,
      p_performed_by: null,
      p_movement_id: generateId(),
    });
    if (error) throw error;

    await get().fetchInventory();
  },

  selectItem: (id) => set({ selectedItemId: id }),
});
