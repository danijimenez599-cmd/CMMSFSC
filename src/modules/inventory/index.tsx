import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import InventoryTable from './components/InventoryTable';
import InventoryDetailPanel from './components/InventoryDetailPanel';
import InventoryItemForm from './components/InventoryItemForm';
import StockAdjustForm from './components/StockAdjustForm';

export default function InventoryView() {
  const { fetchInventory } = useStore() as any;
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const { inventoryItems } = useStore() as any;

  useEffect(() => { fetchInventory(); }, []);

  const editingItem = editingId ? inventoryItems.find((i: any) => i.id === editingId) : null;

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <InventoryTable
          onNew={() => { setEditingId(null); setFormOpen(true); }}
          onEdit={(id) => { setEditingId(id); setFormOpen(true); }}
          onAdjust={(id) => setAdjustingId(id)}
        />
      </div>

      <InventoryDetailPanel
        onEdit={(id) => { setEditingId(id); setFormOpen(true); }}
        onAdjust={(id) => setAdjustingId(id)}
      />

      {formOpen && (
        <InventoryItemForm
          isOpen={formOpen}
          item={editingItem}
          onClose={() => { setFormOpen(false); setEditingId(null); }}
        />
      )}

      {adjustingId && (
        <StockAdjustForm
          itemId={adjustingId}
          isOpen={!!adjustingId}
          onClose={() => setAdjustingId(null)}
        />
      )}
    </div>
  );
}
