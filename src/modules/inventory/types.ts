export interface InventoryItem {
  id: string;
  name: string;
  partNumber: string | null;
  description: string | null;
  category: string | null;
  unit: string;
  stockCurrent: number;
  stockMin: number;
  stockMax: number | null;
  locationBin: string | null;
  unitCost: number | null;
  supplierId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  type: 'in' | 'out' | 'return' | 'adjustment';
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  workOrderId: string | null;
  reason: string | null;
  performedBy: string | null;
  performedAt: string;
}

export interface StockAdjustInput {
  type: 'in' | 'out' | 'return' | 'adjustment';
  quantity: number;
  workOrderId?: string | null;
  reason?: string | null;
}

export interface InventoryItemInput {
  name: string;
  partNumber?: string | null;
  description?: string | null;
  category?: string | null;
  unit: string;
  stockCurrent?: number;
  stockMin?: number;
  stockMax?: number | null;
  locationBin?: string | null;
  unitCost?: number | null;
}
