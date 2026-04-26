import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { ConfirmDialog } from '../../shared/components';
import AssetTreePanel from './components/AssetTreePanel';
import AssetDetailPanel from './components/AssetDetailPanel';
import AssetSidePanel from './components/AssetSidePanel';
import AssetForm from './components/AssetForm';
import { checkAssetDeletability } from './utils/assetHelpers';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn, MobilePanelTransition } from '../../shared/components';
import WoDetailPanel from '../workorders/components/WoDetailPanel';
import WoListPanel from '../workorders/components/WoListPanel';

export default function AssetRegistryView() {
  const { 
    fetchAssets, assets, selectedAssetId, selectAsset, deleteAsset, 
    decommissionAsset, showToast, currentUser, assetPlans, workOrders, 
    measurementPoints, isAuditMode, setAuditMode, selectedWoId,
    assetHistory, selectWo
  } = useStore() as any;

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'tree' | 'detail' | 'side'>('tree');

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    danger?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  useEffect(() => { 
    fetchAssets(); 
    return () => {
      setAuditMode(false);
      selectWo(null);
    };
  }, []);

  // Sync history if asset changes while in audit mode
  useEffect(() => {
    if (isAuditMode && selectedAssetId) {
      fetchAssetHistory(selectedAssetId);
    }
  }, [selectedAssetId, isAuditMode]);

  const editingAsset = editingId ? assets.find((a: any) => a.id === editingId) : null;

  const handleDelete = async (id: string) => {
    const check = checkAssetDeletability(id, assets, assetPlans || [], workOrders || [], measurementPoints || []);

    if (check.hasChildren) {
      showToast({ type: 'error', title: 'No se puede eliminar', message: 'El activo tiene sub-activos vinculados.' });
      return;
    }

    if (check.hasCompletedWos) {
      showToast({ 
        type: 'error', 
        title: 'Acción bloqueada', 
        message: 'Este activo tiene historial técnico (OTs cerradas). Para mantener la integridad, debe darlo de "Baja Técnica" en lugar de eliminarlo.' 
      });
      return;
    }

    const warnings: string[] = [];
    if (check.linkedPlans > 0) warnings.push(`${check.linkedPlans} plan(es) PM`);
    if (check.linkedWorkOrders > 0) warnings.push(`${check.linkedWorkOrders} orden(es) de trabajo (canceladas/abiertas)`);
    if (check.linkedPoints > 0) warnings.push(`${check.linkedPoints} punto(s) de medición`);

    const msg = warnings.length > 0
      ? `Estás a punto de ELIMINAR PERMANENTEMENTE este equipo. Se borrarán también: ${warnings.join(', ')}. Esta acción NO se puede deshacer.`
      : '¿Deseas eliminar permanentemente este activo? Esta acción no se puede deshacer.';

    setConfirmConfig({
      isOpen: true,
      title: 'Eliminar Activo',
      description: msg,
      danger: true,
      onConfirm: async () => {
        try {
          await deleteAsset(id);
          showToast({ type: 'success', title: 'Activo eliminado permanentemente' });
        } catch (err: any) {
          showToast({ type: 'error', title: 'Error', message: err.message });
        }
      }
    });
  };

  const handleNewAsset = (parentId?: string) => {
    setDefaultParentId(parentId || null);
    setEditingId(null);
    setFormOpen(true);
  };

  const handleSelectAsset = (id: string) => {
    selectAsset(id);
    setMobileView('detail');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex h-full overflow-hidden bg-white"
    >
      {/* Panel árbol */}
      <MobilePanelTransition 
        activePanel={mobileView} 
        panelKey="tree" 
        className="lg:w-72 xl:w-80"
      >
        <AssetTreePanel
          onSelect={handleSelectAsset}
          onNewAsset={handleNewAsset}
          onEditAsset={(id) => { setEditingId(id); setFormOpen(true); }}
          onDeleteAsset={handleDelete}
        />
      </MobilePanelTransition>

      {/* Panel detalle / Lista de Auditoría */}
      <MobilePanelTransition 
        activePanel={mobileView} 
        panelKey="detail" 
        className={cn(
          "min-w-0", 
          isAuditMode 
            ? "xl:w-[450px] xl:border-r xl:border-slate-200" 
            : "flex-1"
        )}
      >
        <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setMobileView('tree')}
            className="flex items-center gap-1 text-sm font-bold text-brand"
          >
            <ChevronLeft size={18} /> Activos
          </button>
        </div>
        {isAuditMode ? (
          <WoListPanel 
            customWorkOrders={assetHistory}
            onSelect={selectWo}
            onNewWo={() => {}}
            title="Auditoría: Historial Total"
            hideNewButton
          />
        ) : (
          <AssetDetailPanel onEdit={(id) => { setEditingId(id); setFormOpen(true); }} />
        )}
      </MobilePanelTransition>

      {/* Panel lateral Planes PM / Detalle OT en Auditoría */}
      <MobilePanelTransition 
        activePanel={mobileView} 
        panelKey="side" 
        className={cn(
          isAuditMode ? "flex-1" : (selectedAssetId ? "xl:w-[450px] xl:border-l xl:border-slate-200" : "w-0 overflow-hidden")
        )}
      >
        {/* Botón volver — solo visible en móvil */}
        <div className="xl:hidden flex items-center px-4 py-2 bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setMobileView('detail')}
            className="flex items-center gap-1 text-sm font-bold text-brand"
          >
            <ChevronLeft size={18} /> {isAuditMode ? 'Lista de Auditoría' : 'Detalle del Activo'}
          </button>
        </div>
        {isAuditMode ? (
          selectedWoId ? (
            <WoDetailPanel />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center bg-slate-50 text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Seleccione una OT</h4>
              <p className="text-[10px] mt-2 leading-relaxed">Haga clic en una orden de la lista central para auditar sus detalles técnicos, causa raíz y resolución.</p>
            </div>
          )
        ) : (
          selectedAssetId ? <AssetSidePanel /> : null
        )}
      </MobilePanelTransition>

      <AssetForm
        isOpen={formOpen}
        asset={editingAsset}
        defaultParentId={defaultParentId}
        onClose={() => { setFormOpen(false); setEditingId(null); setDefaultParentId(null); }}
      />

      <ConfirmDialog
        {...confirmConfig}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </motion.div>
  );
}
