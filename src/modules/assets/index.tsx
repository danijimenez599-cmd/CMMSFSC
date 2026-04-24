import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import AssetTreePanel from './components/AssetTreePanel';
import AssetDetailPanel from './components/AssetDetailPanel';
import AssetSidePanel from './components/AssetSidePanel';
import AssetForm from './components/AssetForm';
import { canDeleteAsset } from './utils/assetHelpers';

export default function AssetRegistryView() {
  const { fetchAssets, assets, selectedAssetId, deleteAsset, showToast, currentUser } = useStore() as any;
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  useEffect(() => { fetchAssets(); }, []);

  const editingAsset = editingId ? assets.find((a: any) => a.id === editingId) : null;

  const handleDelete = async (id: string) => {
    if (!canDeleteAsset(id, assets)) {
      showToast({ type: 'error', title: 'No se puede eliminar', message: 'El activo tiene sub-activos vinculados.' });
      return;
    }
    // Using simple confirm as requested to not invent logic, but ideally this would be a ConfirmDialog
    if (!window.confirm('¿Eliminar este activo? No se puede deshacer.')) return;
    try {
      await deleteAsset(id);
      showToast({ type: 'success', title: 'Activo eliminado' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleNewAsset = (parentId?: string) => {
    setDefaultParentId(parentId || null);
    setEditingId(null);
    setFormOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex h-full overflow-hidden bg-white"
    >
      <AssetTreePanel
        onNewAsset={handleNewAsset}
        onEditAsset={(id) => { setEditingId(id); setFormOpen(true); }}
        onDeleteAsset={handleDelete}
      />

      <div className="flex-1 min-w-0 flex flex-col relative">
        <AssetDetailPanel
          onEdit={(id) => { setEditingId(id); setFormOpen(true); }}
        />
      </div>

      <AnimatePresence>
        {selectedAssetId && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="w-[400px] border-l border-slate-200 bg-white z-10 hidden xl:block"
          >
            <AssetSidePanel />
          </motion.div>
        )}
      </AnimatePresence>

      <AssetForm
        isOpen={formOpen}
        asset={editingAsset}
        defaultParentId={defaultParentId}
        onClose={() => { setFormOpen(false); setEditingId(null); setDefaultParentId(null); }}
      />
    </motion.div>
  );
}
