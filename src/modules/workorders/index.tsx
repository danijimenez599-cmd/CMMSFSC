import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import WoListPanel from './components/WoListPanel';
import WoDetailPanel from './components/WoDetailPanel';
import WoForm from './components/WoForm';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../shared/components';

export default function WorkOrdersView() {
  const { fetchWorkOrders, fetchAssets, fetchInventory, selectedWoId } = useStore() as any;
  const [formOpen, setFormOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    if (selectedWoId) setMobileView('detail');
  }, [selectedWoId]);

  useEffect(() => {
    fetchWorkOrders();
    fetchAssets();
    fetchInventory();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex h-full overflow-hidden bg-white"
    >
      {/* Lista de OTs — visible en móvil solo cuando mobileView es list */}
      <div className={cn(
        'h-full flex-col',
        mobileView === 'list' ? 'flex w-full' : 'hidden',
        'lg:flex lg:w-auto'
      )}>
        <WoListPanel onNewWo={() => setFormOpen(true)} />
      </div>

      {/* Detalle de OT — visible en móvil solo cuando mobileView es detail */}
      <div className={cn(
        'h-full flex-col flex-1 min-w-0 relative bg-slate-50/30',
        mobileView === 'detail' ? 'flex' : 'hidden',
        'lg:flex'
      )}>
        {/* Botón volver — solo visible en móvil */}
        <div className="lg:hidden flex items-center px-4 py-2 bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setMobileView('list')}
            className="flex items-center gap-1 text-sm font-bold text-brand"
          >
            <ChevronLeft size={18} /> Volver a OTs
          </button>
        </div>
        <WoDetailPanel />
      </div>

      {formOpen && (
        <WoForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
      )}
    </motion.div>
  );
}
