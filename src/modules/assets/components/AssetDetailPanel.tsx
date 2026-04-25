import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store';
import { Badge, Button, cn, AlertBanner } from '../../../shared/components';
import MeasurementPointsPanel from '../../pm/components/MeasurementPointsPanel';
import {
  Settings, Activity, Info, ChevronRight, Package, Gauge,
  Calendar, Layers, Factory, Cpu, ShieldCheck, Database
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
  const { assets, selectedAssetId, workOrders, setModule } = useStore() as any;
  const [tab, setTab] = useState<TabId>('info');

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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Premium Header */}
      <div className="bg-slate-50/50 border-b border-slate-200 px-8 py-6 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Factory size={160} />
        </div>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
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

        <div className="flex items-start justify-between gap-6 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20 border border-brand-dark/10">
                <Cpu size={20} />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight truncate">{asset.name}</h2>
            </div>
            
            <div className="flex items-center flex-wrap gap-2 mt-3">
              {asset.code && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white rounded-lg shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">TAG:</span>
                  <span className="font-mono text-[10px] font-bold">{asset.code}</span>
                </div>
              )}
              <Badge variant={critConfig.badgeVariant as any} dot>
                {critConfig.label} Criticidad
              </Badge>
              <Badge variant={asset.status === 'active' ? 'ok' : asset.status === 'standby' ? 'warn' : 'neutral'}>
                Estado: {asset.status}
              </Badge>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white"
            icon={<Settings size={14} />} 
            onClick={() => onEdit(asset.id)}
          >
            Configurar Activo
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-8 mt-8 py-6 border-t border-slate-200/60">
          <div>
            <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">{openWos.length}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">OTs Pendientes</p>
          </div>
          <div className="border-l border-slate-200 pl-8">
            <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">{completedWos.length}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">Órdenes Cerradas</p>
          </div>
          <div className="border-l border-slate-200 pl-8">
            <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">{children.length}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">Sub-componentes</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-8">
        <div className="flex gap-8">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 py-4 text-[11px] font-bold uppercase tracking-[0.2em] relative transition-all',
                tab === t.id ? 'text-brand' : 'text-slate-400 hover:text-slate-900'
              )}
            >
              {t.icon}
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
              <div className="space-y-8">
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
                  <div className="mt-10">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Órdenes Abiertas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {openWos.map((wo: any) => (
                        <motion.div
                          key={wo.id}
                          whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                          className="bg-white/60 border border-slate-200 rounded-xl p-3.5 shadow-sm hover:border-brand/30 hover:shadow-md transition-all cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
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
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <MeasurementPointsPanel assetId={asset.id} />
              </div>
            )}

            {tab === 'specs' && (
              <div className="max-w-3xl">
                {specsEntries.length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Ficha Técnica de Ingeniería</p>
                    </div>
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
                    <p className="text-xs text-slate-500 mt-2">No se han registrado parámetros de ingeniería para este activo.</p>
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

