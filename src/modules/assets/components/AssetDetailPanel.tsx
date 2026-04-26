import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store';
import { Badge, Button, cn, AlertBanner } from '../../../shared/components';
import MeasurementPointsPanel from '../../pm/components/MeasurementPointsPanel';
import {
  Settings, Activity, Info, ChevronRight, Package, Gauge,
  Calendar, Layers, Factory, Cpu, ShieldCheck, Database, Wrench
} from 'lucide-react';
import { formatDate } from '../../../shared/utils/utils';
import { ASSET_TYPE_LABELS, CATEGORY_LABELS, CRITICALITY_CONFIG } from '../utils/assetHelpers';
import { AssetType, AssetCategory, AssetCriticality } from '../types';

const TABS = [
  { id: 'info', label: 'Información', icon: <Info size={14} /> },
  { id: 'medidores', label: 'Medidores', icon: <Gauge size={14} /> },
  { id: 'specs', label: 'Ficha Técnica', icon: <Settings size={14} /> },
] as const;
type TabId = typeof TABS[number]['id'];

interface AssetDetailPanelProps {
  onEdit: (id: string) => void;
}

export default function AssetDetailPanel({ onEdit }: AssetDetailPanelProps) {
  const { assets, selectedAssetId, workOrders, setModule, selectWo, updateAsset, showToast } = useStore() as any;
  const [tab, setTab] = useState<TabId>('info');
  const [editingSpecs, setEditingSpecs] = useState(false);
  const [specsDraft, setSpecsDraft] = useState<{ key: string; value: string }[]>([]);

  const [expandedAssets] = useState(() => {
    try {
      const stored = sessionStorage.getItem('apex-asset-expanded');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (err) {
      console.warn('Error reading asset expansion state:', err);
    }
    return new Set();
  });

  if (!selectedAssetId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50/30 p-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-[20px] bg-white border border-slate-200 shadow-floating flex items-center justify-center mx-auto mb-6">
            <Factory size={32} className="text-slate-300" />
          </div>
          <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight">Registro de Activos</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">Seleccione un elemento de la jerarquía técnica para visualizar su ficha detallada, telemetría y planes de mantenimiento.</p>
        </motion.div>
      </div>
    );
  }

  const asset = assets.find((a: any) => a.id === selectedAssetId);
  if (!asset) return (
    <div className="flex-1 flex items-center justify-center bg-slate-50/30">
      <div className="text-center animate-pulse">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cargando datos del activo...</p>
      </div>
    </div>
  );

  const parent = asset.parentId ? assets.find((a: any) => a.id === asset.parentId) : null;
  const children = assets.filter((a: any) => a.parentId === asset.id);
  const critConfig = CRITICALITY_CONFIG[asset.criticality as AssetCriticality] || CRITICALITY_CONFIG.medium;

  const assetWos = workOrders?.filter((w: any) => w.assetId === asset.id) || [];
  const openWos = assetWos.filter((w: any) => !['completed', 'cancelled'].includes(w.status));
  const completedWos = assetWos.filter((w: any) => w.status === 'completed');

  const specsEntries = Object.entries(asset.specs || {});

  const startEditingSpecs = () => {
    setSpecsDraft(specsEntries.map(([key, value]) => ({ key, value: String(value) })));
    setEditingSpecs(true);
  };

  const saveSpecs = async () => {
    const specs: Record<string, string> = {};
    specsDraft.forEach(({ key, value }) => { if (key.trim()) specs[key.trim()] = value; });
    try {
      await updateAsset(asset.id, { specs });
      setEditingSpecs(false);
      showToast?.({ type: 'success', title: 'Ficha técnica actualizada' });
    } catch (e: any) {
      showToast?.({ type: 'error', title: 'Error al guardar', message: e.message });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Premium Header */}
      <div className="bg-slate-50/50 border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-6 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Factory size={160} />
        </div>
        
        {/* Breadcrumb - Hidden on Mobile */}
        <div className="hidden sm:flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand cursor-pointer transition-colors">Sistema</span>
          <ChevronRight size={10} className="text-slate-300" />
          {parent && (
            <>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand cursor-pointer transition-colors truncate max-w-[150px]">{parent.name}</span>
              <ChevronRight size={10} className="text-slate-300" />
            </>
          )}
          <span className="text-[10px] font-bold text-brand uppercase tracking-widest truncate">{asset.name}</span>
        </div>

        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20 border border-brand-dark/10">
                <Cpu size={16} className="sm:hidden" />
                <Cpu size={20} className="hidden sm:block" />
              </div>
              <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">{asset.name}</h2>
            </div>
            
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              {asset.code && (
                <div className="flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-slate-900 text-white rounded-md sm:rounded-lg shadow-sm">
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest opacity-60">TAG:</span>
                  <span className="font-mono text-[8px] sm:text-[10px] font-bold">{asset.code}</span>
                </div>
              )}
              <Badge variant={critConfig.badgeVariant as any} dot className="text-[8px] sm:text-[10px] px-1.5 sm:px-2.5">
                {critConfig.label}
              </Badge>
              <Badge variant={asset.status === 'active' ? 'ok' : asset.status === 'standby' ? 'warn' : 'neutral'} className="text-[8px] sm:text-[10px] px-1.5 sm:px-2.5">
                {asset.status}
              </Badge>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white h-8 w-8 p-0 sm:h-10 sm:w-auto sm:px-4"
            icon={<Settings size={14} />} 
            onClick={() => onEdit(asset.id)}
          >
            <span className="hidden sm:inline ml-2">Configurar</span>
          </Button>
        </div>

        {/* Quick Stats Grid - Hidden on Mobile Header */}
        <div className="hidden sm:grid grid-cols-3 gap-8 mt-8 py-6 border-t border-slate-200/60">
          <div>
            <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">{openWos.length}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">OTs Abiertas</p>
          </div>
          <div className="border-l border-slate-200 pl-8">
            <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">{completedWos.length}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">Cerradas</p>
          </div>
          <div className="border-l border-slate-200 pl-8">
            <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">{children.length}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">Componentes</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8">
        <div className="flex gap-8">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 py-3 sm:py-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] relative transition-all',
                tab === t.id ? 'text-brand' : 'text-slate-400 hover:text-slate-900'
              )}
            >
              {React.cloneElement(t.icon as React.ReactElement, { size: 12, className: 'sm:w-3.5 sm:h-3.5' })}
              {t.label}
              {tab === t.id && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-brand"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-5xl"
          >
            {tab === 'info' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Stats Grid for Mobile (Hidden on Desktop Header) */}
                <div className="sm:hidden grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                  <div className="text-center">
                    <p className="text-lg font-display font-bold text-slate-900 leading-none">{openWos.length}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">OTs Abiertas</p>
                  </div>
                  <div className="text-center border-l border-slate-200">
                    <p className="text-lg font-display font-bold text-slate-900 leading-none">{completedWos.length}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">Cerradas</p>
                  </div>
                  <div className="text-center border-l border-slate-200">
                    <p className="text-lg font-display font-bold text-slate-900 leading-none">{children.length}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">Componentes</p>
                  </div>
                </div>

                {asset.description && (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
                    <Info className="absolute -top-2 -right-2 text-slate-200/50" size={64} />
                    <p className="text-sm text-slate-600 leading-relaxed font-medium relative z-10">{asset.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'Tipo de Activo', value: ASSET_TYPE_LABELS[asset.assetType as AssetType], icon: <Layers size={14} /> },
                    { label: 'Categoría Operativa', value: asset.category ? CATEGORY_LABELS[asset.category as AssetCategory] : 'Sin categoría', icon: <Package size={14} /> },
                    { label: 'Fabricante / OEM', value: asset.manufacturer || 'Desconocido', icon: <ShieldCheck size={14} /> },
                    { label: 'Modelo Técnico', value: asset.model || 'No especificado', icon: <Settings size={14} /> },
                    { label: 'Identificador Serial', value: asset.serialNumber || 'N/A', icon: <Info size={14} /> },
                    { label: 'Fecha Instalación', value: asset.installDate ? formatDate(asset.installDate) : '—', icon: <Calendar size={14} /> },
                    { label: 'Activo de Referencia', value: parent?.name || 'Sistema Raíz', icon: <Database size={14} /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-400">{icon}</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900 tracking-tight">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Open Work Orders Preview */}
                {openWos.length > 0 && (
                  <div className="mt-6 sm:mt-10">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Wrench size={14} />
                      Órdenes Abiertas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {openWos.map((wo: any) => (
                        <motion.div
                          key={wo.id}
                          whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                          className="bg-white/60 border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-brand/30 hover:shadow-md transition-all cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectWo(wo.id);
                            setModule('workorders');
                          }}
                        >
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="font-mono text-[10px] font-bold text-brand uppercase tracking-wider bg-brand/5 px-2 py-0.5 rounded border border-brand/10">#{wo.woNumber}</span>
                            <Badge variant={wo.status as any} className="text-[9px] px-2 py-0.5">{wo.status}</Badge>
                          </div>
                          <p className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-snug tracking-tight group-hover:text-brand transition-colors">
                            {wo.title}
                          </p>
                          {wo.dueDate && (
                            <div className="mt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 border-t border-slate-100 pt-2.5">
                              <span className="flex items-center gap-1.5"><Calendar size={10}/>Vencimiento</span>
                              <span className="text-slate-600 font-mono">{formatDate(wo.dueDate)}</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {children.length > 0 && (
                  <div className="mt-10">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Layers size={14} />
                      Sub-componentes Vinculados
                    </h4>
                    <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
                      {children.map((child: any) => (
                        <div key={child.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                            <Activity size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{child.name}</p>
                            {child.code && <p className="text-[10px] font-mono font-bold text-slate-400 uppercase mt-0.5">{child.code}</p>}
                          </div>
                          <Badge variant={CRITICALITY_CONFIG[child.criticality as AssetCriticality]?.badgeVariant as any} className="text-[9px]">
                            {CRITICALITY_CONFIG[child.criticality as AssetCriticality]?.label}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'medidores' && (
              <div className="w-full">
                <MeasurementPointsPanel assetId={asset.id} />
              </div>
            )}

            {tab === 'specs' && (
              <div className="max-w-3xl space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ficha Técnica de Ingeniería</p>
                  {!editingSpecs ? (
                    <Button size="sm" variant="ghost" onClick={startEditingSpecs} icon={<Settings size={13} />}>
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingSpecs(false)}>Cancelar</Button>
                      <Button size="sm" variant="primary" onClick={saveSpecs}>Guardar</Button>
                    </div>
                  )}
                </div>

                {editingSpecs ? (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-100">
                      {specsDraft.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-4 py-2">
                          <input
                            className="w-1/3 text-[11px] font-bold text-slate-600 uppercase bg-transparent border-b border-slate-200 focus:border-brand outline-none py-1"
                            placeholder="Parámetro"
                            value={row.key}
                            onChange={e => setSpecsDraft(d => d.map((r, i) => i === idx ? { ...r, key: e.target.value } : r))}
                          />
                          <input
                            className="flex-1 text-xs font-mono text-slate-900 bg-transparent border-b border-slate-200 focus:border-brand outline-none py-1"
                            placeholder="Valor"
                            value={row.value}
                            onChange={e => setSpecsDraft(d => d.map((r, i) => i === idx ? { ...r, value: e.target.value } : r))}
                          />
                          <button
                            onClick={() => setSpecsDraft(d => d.filter((_, i) => i !== idx))}
                            className="text-slate-300 hover:text-red-500 transition-colors text-sm px-1"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setSpecsDraft(d => [...d, { key: '', value: '' }])}
                      className="w-full py-3 text-[10px] font-black text-brand uppercase tracking-widest border-t border-dashed border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      + Añadir parámetro
                    </button>
                  </div>
                ) : specsEntries.length > 0 ? (
                  <div className="w-full border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-100">
                        {specsEntries.map(([key, val]) => (
                          <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-wider w-1/3">{key}</td>
                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">{String(val)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white border border-dashed border-slate-200 rounded-[24px] p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Settings size={32} className="text-slate-200" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">Sin Datos Técnicos</h4>
                    <p className="text-xs text-slate-500 mt-2">Haz clic en <strong>Editar</strong> para añadir parámetros de ingeniería.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

