import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store';
import { Badge, Button, cn, AlertBanner } from '../../../shared/components';
import MeasurementPointsPanel from '../../pm/components/MeasurementPointsPanel';
import {
  Settings, Activity, Info, ChevronRight, Package, Gauge,
  Calendar, Layers, Factory, Cpu, ShieldCheck, Database, Wrench,
  Target, FileText, CalendarClock, CheckCircle2, Unlink, Plus,
  ChevronDown, ChevronUp, History, Search
} from 'lucide-react';
import { formatDate, generateId } from '../../../shared/utils/utils';
import { ASSET_TYPE_LABELS, CATEGORY_LABELS, CRITICALITY_CONFIG } from '../utils/assetHelpers';
import { AssetType, AssetCategory, AssetCriticality } from '../types';
import { calcNextDueDate, computePlanStatus } from '../../pm/store/pmEngine';
import { calculateProjections } from '../../pm/utils/projections';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal, Select, FormField } from '../../../shared/components';

const safeLocale = es || undefined;

// --- COMPONENTE: TARJETA DE PROYECCIÓN PREMIUM (From SidePanel) ---
const ProjectionCard = ({ proj }: { proj: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative pl-10 pb-8 last:pb-0 group">
      <div className="absolute left-[15px] top-4 bottom-0 w-0.5 bg-slate-100 group-last:hidden" />
      <div className={cn(
        "absolute left-0 top-1.5 w-8 h-8 rounded-2xl border-4 bg-white z-10 flex items-center justify-center transition-all duration-500 shadow-sm",
        proj.isMajor ? "border-brand scale-110 shadow-lg shadow-brand/20" : "border-slate-100 group-hover:border-slate-300"
      )}>
        {proj.isMajor ? <Target size={12} className="text-brand animate-pulse" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
      </div>

      <div className={cn(
        "flex flex-col rounded-[24px] border transition-all duration-300 overflow-hidden",
        proj.isMajor ? "bg-white border-brand/20 shadow-xl shadow-brand/5" : "bg-white border-slate-100 shadow-sm"
      )}>
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between p-5 text-left w-full group/btn">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {proj.date instanceof Date && isValid(proj.date)
                ? format(proj.date, 'EEEE, dd MMMM', { locale: safeLocale })
                : proj.meterValue != null
                  ? `A las ${Number(proj.meterValue).toLocaleString()} unidades`
                  : 'Pendiente'}
            </p>
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">{proj.label}</h4>
              <Badge variant={proj.isMajor ? 'brand' : 'neutral'} className="text-[8px] px-2 py-0.5 font-black uppercase">
                {proj.isMajor ? 'MAYOR' : 'RUTINA'}
              </Badge>
            </div>
          </div>
          <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", isExpanded ? "bg-slate-900 text-white rotate-180" : "bg-slate-50 text-slate-400")}>
            <ChevronDown size={18} />
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-5 pb-6 pt-2 border-t border-slate-50 space-y-4">
                <div className="grid gap-2">
                  {(proj.tasksNames || []).map((tn: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">{idx + 1}</div>
                      <span className="text-[11px] font-bold text-slate-700 leading-tight">{tn}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TABS = [
  { id: 'info', label: 'Información', icon: <Info size={14} /> },
  { id: 'medidores', label: 'Medidores', icon: <Gauge size={14} /> },
  { id: 'maint', label: 'Órdenes de mantenimiento', icon: <Wrench size={14} /> },
] as const;
type TabId = typeof TABS[number]['id'];

interface AssetDetailPanelProps {
  onEdit: (id: string) => void;
}

export default function AssetDetailPanel({ onEdit }: AssetDetailPanelProps) {
  const {
    assets, selectedAssetId, workOrders, setModule, selectWo, updateAsset, showToast,
    pmPlans = [], assetPlans = [], measurementPoints = [], measurementConfigs = [], pmTasks = [],
    saveAssetPlan = () => {}, unlinkAssetPlan, projectionMonths
  } = useStore() as any;

  const [tab, setTab] = useState<TabId>('info');
  const [editingSpecs, setEditingSpecs] = useState(false);
  const [specsDraft, setSpecsDraft] = useState<{ key: string; value: string }[]>([]);

  // State for Linking Plans (from SidePanel)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPointId, setSelectedPointId] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customStartMeter, setCustomStartMeter] = useState('');

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

  // --- Logic from SidePanel ---
  const assetPoints = measurementPoints.filter((mp: any) => mp.assetId === selectedAssetId);
  const cumulativeAssetPoints = assetPoints.filter((mp: any) => {
    const cfg = measurementConfigs.find((c: any) => c.id === mp.configId);
    return cfg?.isCumulative === true;
  });
  const selectedPlan = pmPlans.find((p: any) => p.id === selectedPlanId);
  const isMeterOnly = selectedPlan?.triggerType === 'meter';
  const isHybrid = selectedPlan?.triggerType === 'hybrid';
  const needsMeter = isMeterOnly || isHybrid;
  const needsDate = !isMeterOnly;

  const activePlans = (assetPlans || []).filter((ap: any) => ap.assetId === selectedAssetId && ap.active);
  const activePMs = (activePlans || []).map((ap: any) => {
    try {
      const plan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
      const point = measurementPoints.find((p: any) => p.id === ap.measurementPointId);
      const status = computePlanStatus(plan, ap, point?.currentValue || 0);
      return { ...ap, planName: plan?.name || 'Plan Técnico', triggerType: plan?.triggerType || 'calendar', isOverdue: !!status?.isOverdue, progress: Number(status?.progress) || 0, statusLabel: status?.label || 'Pendiente' };
    } catch (e) { return null; }
  }).filter(Boolean);

  const selectedPoint = cumulativeAssetPoints.find((mp: any) => mp.id === selectedPointId);
  const pointHasReading = selectedPoint != null && selectedPoint.currentValue != null && selectedPoint.currentValue > 0;
  const canLink = !!selectedPlanId && ((!needsDate || !!customStartDate) && (!needsMeter || (!!selectedPointId && pointHasReading && !!customStartMeter)));

  const handleAssignPlan = async () => {
    if (!selectedPlanId) return;
    const plan = pmPlans.find((p: any) => p.id === selectedPlanId);
    if (!plan) return;
    const planIsMeterOnly = plan.triggerType === 'meter';
    const planIsHybrid = plan.triggerType === 'hybrid';
    const planNeedsMeter = planIsMeterOnly || planIsHybrid;

    if (planNeedsMeter && !selectedPointId) {
      showToast({ type: 'error', title: 'Instrumento requerido', message: 'Selecciona el instrumento acumulador para este plan.' });
      return;
    }
    if (planNeedsMeter && selectedPoint && !pointHasReading) {
      showToast({ type: 'error', title: 'Sin lectura base', message: `"${selectedPoint.name}" no tiene ninguna lectura registrada.` });
      return;
    }
    if (!planIsMeterOnly && !customStartDate) {
      showToast({ type: 'error', title: 'Fecha de inicio requerida' });
      return;
    }
    if (planNeedsMeter && !customStartMeter) {
      showToast({ type: 'error', title: 'Umbral de inicio requerido' });
      return;
    }

    try {
      const today = new Date().toISOString();
      const nextDueDate = planIsMeterOnly ? null : new Date(customStartDate).toISOString().split('T')[0];
      await saveAssetPlan({
        id: generateId(), assetId: selectedAssetId, pmPlanId: selectedPlanId,
        measurementPointId: planNeedsMeter ? (selectedPointId || null) : null,
        nextDueDate, nextDueMeter: customStartMeter ? Number(customStartMeter) : null,
        lastCompletedAt: null, woCount: 0, currentCycleIndex: 1, active: true, createdAt: today,
      });
      showToast({ type: 'success', title: 'Plan vinculado' });
      setShowAssignModal(false);
      setSelectedPlanId(''); setSelectedPointId(''); setCustomStartDate(''); setCustomStartMeter('');
    } catch (err: any) { showToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Premium Header */}
      <div className="bg-slate-50/50 border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
          <Factory size={120} />
        </div>
        
        {/* Breadcrumb - Hidden on Mobile */}
        <div className="hidden sm:flex items-center gap-2 mb-2">
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
            <div className="flex items-center gap-2 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/20 border border-brand-dark/10 shrink-0">
                  <Cpu size={16} />
                </div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate leading-tight">{asset.name}</h2>
              </div>
              
              {/* Vistosos Metrics in Header */}
              <div className="flex items-center gap-3 ml-2 border-l border-slate-200 pl-3 sm:pl-4">
                <div className="flex flex-col">
                  <span className="text-[12px] sm:text-[14px] font-display font-black text-brand leading-none">{openWos.length}</span>
                  <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ABIERTAS</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] sm:text-[14px] font-display font-black text-slate-900 leading-none">{completedWos.length}</span>
                  <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">CERRADAS</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mt-2">
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

        {/* Spacer for better layout */}
        <div className="h-2" />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8">
        <div className="flex gap-8">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 py-2 sm:py-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] relative transition-all',
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
                {asset.description && (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
                    <Info className="absolute -top-2 -right-2 text-slate-200/50" size={64} />
                    <p className="text-sm text-slate-600 leading-relaxed font-medium relative z-10">{asset.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* General Info */}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

                  {/* Ficha Técnica (Formerly Tab 3) */}
                  <div className="bg-slate-50/50 rounded-[24px] p-6 border border-slate-100 h-fit">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Settings size={14} /> Ficha Técnica
                      </h4>
                      {!editingSpecs ? (
                        <Button size="xs" variant="ghost" onClick={startEditingSpecs}>Editar</Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="xs" variant="ghost" onClick={() => setEditingSpecs(false)}>X</Button>
                          <Button size="xs" variant="primary" onClick={saveSpecs}>OK</Button>
                        </div>
                      )}
                    </div>

                    {editingSpecs ? (
                      <div className="space-y-2">
                        {specsDraft.map((row, idx) => (
                          <div key={idx} className="flex flex-col gap-1 bg-white p-3 rounded-xl border border-slate-200">
                            <input className="text-[10px] font-black uppercase text-brand outline-none" value={row.key} onChange={e => setSpecsDraft(d => d.map((r, i) => i === idx ? { ...r, key: e.target.value } : r))} />
                            <input className="text-xs font-mono outline-none" value={row.value} onChange={e => setSpecsDraft(d => d.map((r, i) => i === idx ? { ...r, value: e.target.value } : r))} />
                          </div>
                        ))}
                        <Button variant="outline" size="xs" className="w-full mt-2" onClick={() => setSpecsDraft(d => [...d, { key: '', value: '' }])}>+ Parámetro</Button>
                      </div>
                    ) : specsEntries.length > 0 ? (
                      <div className="space-y-4">
                        {specsEntries.map(([key, val]) => (
                          <div key={key}>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{key}</p>
                            <p className="text-xs font-mono font-bold text-slate-900">{String(val)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Sin datos técnicos.</p>
                    )}
                  </div>
                </div>

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
              <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <MeasurementPointsPanel assetId={asset.id} />
              </div>
            )}

            {tab === 'maint' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Estado Actual */}
                <div className="space-y-8">
                  <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Wrench size={16} className="text-brand" /> Órdenes en Curso ({openWos.length})
                    </h4>
                    {openWos.length > 0 ? (
                      <div className="space-y-3">
                        {openWos.map((wo: any) => (
                          <motion.div 
                            key={wo.id} 
                            whileHover={{ scale: 1.01, x: 4 }} 
                            className="bg-slate-50 border border-slate-100 rounded-[20px] p-4 hover:border-brand/30 transition-all cursor-pointer group" 
                            onClick={() => { selectWo(wo.id); setModule('workorders'); }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-[9px] font-black text-brand bg-brand/5 px-2 py-0.5 rounded-lg border border-brand/10">#{wo.woNumber}</span>
                              <Badge variant={wo.status as any} className="text-[8px] px-2">{wo.status}</Badge>
                            </div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-brand transition-colors">{wo.title}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[20px] p-8 text-center">
                        <CheckCircle2 size={24} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin OTs activas</p>
                      </div>
                    )}
                  </section>

                  <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <CalendarClock size={16} className="text-brand" /> Planes Activos ({activePMs.length})
                      </h4>
                      <Button variant="outline" size="xs" onClick={() => setShowAssignModal(true)} icon={<Plus size={14} />}>Nuevo</Button>
                    </div>
                    {activePMs.length > 0 ? (
                      <div className="space-y-4">
                        {activePMs.map((pm: any) => (
                          <div key={pm.id} className="bg-slate-50 border border-slate-100 rounded-[20px] p-5 relative group">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{pm.planName}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Disparador: {pm.triggerType}</p>
                              </div>
                              <Badge variant={pm.isOverdue ? 'danger' : 'ok'} className="text-[8px] font-black">{pm.statusLabel}</Badge>
                            </div>
                            <button
                              onClick={() => unlinkAssetPlan?.(pm.id)}
                              className="text-[9px] font-bold text-slate-400 hover:text-brand transition-colors uppercase mt-3 flex items-center gap-1.5"
                            >
                              <Unlink size={10} /> Desvincular
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[20px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin estrategia</p>
                      </div>
                    )}
                  </section>
                </div>

                {/* Right Column: Proyección */}
                <div className="space-y-6">
                  <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
                    <Activity size={48} className="absolute -right-4 -bottom-4 text-brand/10 rotate-12" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <Target size={16} className="text-brand" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">Análisis Predictivo</p>
                      </div>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed">Proyección para los próximos {projectionMonths || 12} meses basada en ciclos de ingeniería.</p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-none">
                    {Array.isArray(activePlans) && activePlans.length > 0 ? activePlans.map((ap: any) => {
                      try {
                        const basePlan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
                        if (!basePlan) return null;
                        const planWithTasks = { ...basePlan, tasks: (Array.isArray(pmTasks) ? pmTasks : []).filter((t: any) => t.pmPlanId === basePlan.id) };
                        const projections = calculateProjections(ap, planWithTasks, projectionMonths || 12);
                        return (
                          <div key={ap.id} className="pt-4 first:pt-0">
                            <div className="flex items-center justify-between mb-6 px-2">
                              <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-brand pl-3">{basePlan.name}</h5>
                              <Badge variant="neutral" className="text-[8px] font-black uppercase">{(projections || []).length} HITOS</Badge>
                            </div>
                            <div className="space-y-0">
                              {(projections || []).map((proj, idx) => (
                                <ProjectionCard key={idx} proj={proj} />
                              ))}
                            </div>
                          </div>
                        );
                      } catch (err) { return null; }
                    }) : (
                      <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-[32px]">
                        <Calendar size={32} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay proyecciones</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <Modal 
        isOpen={showAssignModal} 
        onClose={() => setShowAssignModal(false)} 
        title="Vincular Estrategia" 
        size="sm" 
        footer={
          <div className="flex gap-4 w-full">
            <Button variant="ghost" onClick={() => setShowAssignModal(false)} className="flex-1">Cancelar</Button>
            <Button variant="primary" onClick={handleAssignPlan} disabled={!canLink} className="flex-1 bg-slate-900 hover:bg-brand disabled:opacity-40 disabled:cursor-not-allowed">Vincular</Button>
          </div>
        }
      >
        <div className="space-y-5 py-4">
          <FormField label="Plan Maestro">
            <Select value={selectedPlanId} onChange={e => { setSelectedPlanId(e.target.value); setSelectedPointId(''); setCustomStartDate(''); setCustomStartMeter(''); }}>
              <option value="">Elegir estrategia...</option>
              {pmPlans.map((p: any) => <option key={p.id} value={p.id}>{p.name} — {p.triggerType === 'meter' ? 'Por horas' : p.triggerType === 'hybrid' ? 'Híbrido' : 'Por fecha'}</option>)}
            </Select>
          </FormField>

          {selectedPlan && (
            <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 space-y-4">
              {needsDate && (
                <FormField label={<span>Fecha de primera OT <span className="text-red-500">*</span></span>}>
                  <input
                    type="date"
                    className={`w-full h-12 px-4 text-xs font-bold border rounded-xl outline-none bg-white ${!customStartDate ? 'border-red-300 focus:border-red-500' : 'border-slate-200'}`}
                    value={customStartDate}
                    onChange={e => setCustomStartDate(e.target.value)}
                  />
                </FormField>
              )}

              {needsMeter && (
                <>
                  <FormField label={<span>Instrumento Acumulador <span className="text-red-500">*</span></span>}>
                    {cumulativeAssetPoints.length === 0 ? (
                      <p className="text-xs text-amber-600 font-bold py-2">Sin instrumentos acumuladores.</p>
                    ) : (
                      <select
                        className={`w-full h-12 px-4 text-xs font-bold border rounded-xl outline-none bg-white ${!selectedPointId ? 'border-red-300' : 'border-slate-200'}`}
                        value={selectedPointId}
                        onChange={e => setSelectedPointId(e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {cumulativeAssetPoints.map((mp: any) => (
                          <option key={mp.id} value={mp.id}>{mp.name}</option>
                        ))}
                      </select>
                    )}
                  </FormField>

                  <FormField label={<span>Primera OT en (unidades) <span className="text-red-500">*</span></span>}>
                    <input
                      type="number"
                      className={`w-full h-12 px-4 text-xs font-bold border rounded-xl outline-none bg-white ${!customStartMeter ? 'border-red-300 focus:border-red-500' : 'border-slate-200'}`}
                      value={customStartMeter}
                      onChange={e => setCustomStartMeter(e.target.value)}
                    />
                  </FormField>
                </>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

