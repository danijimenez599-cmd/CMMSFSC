import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import WoListPanel from './components/WoListPanel';
import WoDetailPanel from './components/WoDetailPanel';
import WoForm from './components/WoForm';

export default function WorkOrdersView() {
  const { fetchWorkOrders, fetchAssets, fetchInventory } = useStore() as any;
  const [formOpen, setFormOpen] = useState(false);

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
      <WoListPanel onNewWo={() => setFormOpen(true)} />
      
      <div className="flex-1 min-w-0 flex flex-col relative bg-slate-50/30">
        <WoDetailPanel />
      </div>

      {formOpen && (
        <WoForm isOpen={formOpen} onClose={() => setFormOpen(false)} />
      )}
    </motion.div>
  );
}
