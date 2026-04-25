import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import InventoryTable from './components/InventoryTable';
import InventoryDetailPanel from './components/InventoryDetailPanel';
import InventoryItemForm from './components/InventoryItemForm';
import StockAdjustForm from './components/StockAdjustForm';
import { ChevronLeft } from 'lucide-react';
import { cn, MobilePanelTransition } from '../../shared/components';

export default function InventoryView() {
  const { fetchInventory, selectedItemId, inventoryItems, selectItem } = useStore() as any;
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  useEffect(() => { fetchInventory(); }, []);

  const handleSelectItem = (id: string) => {
    selectItem(id);
    setMobileView('detail');
  };

  const editingItem = editingId ? inventoryItems.find((i: any) => i.id === editingId) : null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Tabla */}
      <MobilePanelTransition 
        activePanel={mobileView} 
        panelKey="list" 
        className="lg:flex-1"
      >
        <InventoryTable
          onSelect={handleSelectItem}
          onNew={() => { setEditingId(null); setFormOpen(true); }}
          onEdit={(id) => { setEditingId(id); setFormOpen(true); }}
          onAdjust={(id) => setAdjustingId(id)}
        />
      </MobilePanelTransition>

      {/* Detalle */}
      <MobilePanelTransition 
        activePanel={mobileView} 
        panelKey="detail" 
        className="lg:w-auto"
      >
        {/* Botón volver — solo visible en móvil */}
        <div className="lg:hidden flex items-center px-4 py-2 bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setMobileView('list')}
            className="flex items-center gap-1 text-sm font-bold text-brand"
          >
            <ChevronLeft size={18} /> Inventario
          </button>
        </div>
        <InventoryDetailPanel
          onEdit={(id) => { setEditingId(id); setFormOpen(true); }}
          onAdjust={(id) => setAdjustingId(id)}
        />
      </MobilePanelTransition>

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
