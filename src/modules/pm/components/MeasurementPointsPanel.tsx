import React, { useState } from 'react';
import { useStore } from '../../../store';
import { MeasurementPoint } from '../types';
import { Button, Input, Badge, Select } from '../../../shared/components';
import { Activity, Plus, History, Info, Gauge, TrendingUp, Bell, AlertTriangle, Settings2, Trash2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateId, cn } from '../../../shared/utils/utils';
import { computePlanStatus } from '../store/pmEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ReferenceLine 
} from 'recharts';

interface MeasurementPointsPanelProps {
  assetId: string;
}

export default function MeasurementPointsPanel({ assetId }: MeasurementPointsPanelProps) {
  const {
    measurementPoints = [],
    meterReadings = [],
    measurementConfigs = [],
    assetPlans = [],
    pmPlans = [],
    saveMeasurementPoint,
    deleteMeasurementPoint,
    addMeterReading,
    currentUser,
    setModule,
  } = useStore() as any;

  const [showAddPoint, setShowAddPoint] = useState(false);
  const [showCatalogEmpty, setShowCatalogEmpty] = useState(false);
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'trends'>('cards');
  const [selectedTrendPoint, setSelectedTrendPoint] = useState<string | null>(null);
  
  const [pointForm, setPointForm] = useState<Partial<MeasurementPoint>>({
    name: '',
    configId: '',
    minThreshold: null,
    maxThreshold: null,
    triggerWoTitle: '',
    triggerPriority: 'high'
  });

  const [readingPointId, setReadingPointId] = useState<string | null>(null);
  const [readingValue, setReadingValue] = useState('');

  const points: MeasurementPoint[] = measurementPoints.filter(
    (mp: MeasurementPoint) => mp.assetId === assetId
  );

  const handleSavePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointForm.name || !pointForm.configId) return;
    
    const config = measurementConfigs.find((c: any) => c.id === pointForm.configId);
    const isEdit = !!editingPointId;

    saveMeasurementPoint({
      ...pointForm,
      id: isEdit ? editingPointId : generateId(),
      assetId,
      unit: config?.unit || '?',
      currentValue: isEdit ? points.find(p => p.id === editingPointId)?.currentValue : 0,
      lastReadingAt: isEdit ? points.find(p => p.id === editingPointId)?.lastReadingAt : null,
    });

    resetForm();
  };

  const resetForm = () => {
    setPointForm({
      name: '',
      configId: '',
      minThreshold: null,
      maxThreshold: null,
      triggerWoTitle: '',
      triggerPriority: 'high'
    });
    setEditingPointId(null);
    setShowAddPoint(false);
    setShowCatalogEmpty(false);
  };

  const handleEditPoint = (point: MeasurementPoint) => {
    setPointForm({
      name: point.name,
      configId: point.configId,
      minThreshold: point.minThreshold,
      maxThreshold: point.maxThreshold,
      triggerWoTitle: point.triggerWoTitle,
      triggerPriority: point.triggerPriority
    });
    setEditingPointId(point.id);
    setShowAddPoint(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readingPointId || !readingValue) return;
    addMeterReading({
      measurementPointId: readingPointId,
      assetId,
      value: parseFloat(readingValue),
      recordedBy: currentUser?.id || 'unknown',
    });
    setReadingPointId(null);
    setReadingValue('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h3 className="font-display font-black text-slate-900 flex items-center gap-2 text-base tracking-tight">
              <Gauge size={20} className="text-brand" />
              Instrumentación
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Control de Condición y Tendencias
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('cards')}
              className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", viewMode === 'cards' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              Tablero
            </button>
            <button 
              onClick={() => setViewMode('trends')}
              className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", viewMode === 'trends' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
            >
              Tendencias
            </button>
          </div>
        </div>
        {!showAddPoint && !showCatalogEmpty && (
          <Button
            variant="primary"
            size="sm"
            className="rounded-full font-bold text-[10px] uppercase tracking-widest px-6"
            icon={<Plus size={14} />}
            onClick={() => {
              if (measurementConfigs.length === 0) {
                // MODULE 4.8: Catalog empty — show empty state instead of broken form
                setShowCatalogEmpty(true);
              } else {
                setShowAddPoint(true);
              }
            }}
          >
            Nuevo Punto
          </Button>
        )}
      </div>

      {/* MODULE 4.8: Empty State — no catalog entries */}
      <AnimatePresence>
        {showCatalogEmpty && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-50 border border-amber-200/60 rounded-[32px] p-10 text-center relative"
          >
            <button
              onClick={() => setShowCatalogEmpty(false)}
              className="absolute top-4 right-4 text-amber-400 hover:text-amber-700 transition-colors text-sm font-bold"
            >
              ✕
            </button>
            <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <Gauge size={32} className="text-amber-600" />
            </div>
            <h4 className="font-display font-black text-slate-900 text-base tracking-tight mb-2">
              Catálogo de Magnitudes Vacío
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto mb-6">
              Debe crear al menos una{' '}
              <strong className="text-amber-700">variable de medición</strong>{' '}
              en el catálogo general antes de poder crear un instrumento.
            </p>
            <Button
              variant="primary"
              icon={<ArrowRight size={16} />}
              onClick={() => {
                setShowCatalogEmpty(false);
                // Navigate to Settings → Magnitudes tab
                setModule?.('settings');
              }}
              className="bg-amber-600 hover:bg-amber-700 shadow-amber-200"
            >
              Ir al Catálogo de Magnitudes
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Point Form — only rendered when catalog has entries */}
      <AnimatePresence>
        {showAddPoint && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSavePoint}
            className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 shadow-sm relative"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                  <Settings2 size={18} />
                </div>
                <h4 className="font-display font-black text-slate-900 text-sm">
                  {editingPointId ? 'Configurar Instrumento' : 'Nuevo Instrumento'}
                </h4>
              </div>
              <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Identificación</label>
                  <Input value={pointForm.name} onChange={e => setPointForm({...pointForm, name: e.target.value})} placeholder="Ej. Nivel de Vibración" className="h-11 bg-white border-slate-200 font-bold text-sm" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Magnitud</label>
                  <select className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold outline-none" value={pointForm.configId || ''} onChange={e => setPointForm({...pointForm, configId: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {measurementConfigs.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.unit}) — {c.isCumulative ? '📈 Acum.' : '📊 Instant.'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-5">
                {pointForm.configId && !measurementConfigs.find((c: any) => c.id === pointForm.configId)?.isCumulative && (
                  <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-brand">
                      <Bell size={14} />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Configuración de Alerta</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 mb-1 uppercase">Mínimo</p>
                        <Input type="number" value={pointForm.minThreshold ?? ''} step="any" onChange={e => setPointForm({...pointForm, minThreshold: e.target.value ? parseFloat(e.target.value) : null})} className="h-9 text-xs font-bold" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 mb-1 uppercase">Máximo</p>
                        <Input type="number" value={pointForm.maxThreshold ?? ''} step="any" onChange={e => setPointForm({...pointForm, maxThreshold: e.target.value ? parseFloat(e.target.value) : null})} className="h-9 text-xs font-bold" />
                      </div>
                    </div>
                    <Input value={pointForm.triggerWoTitle || ''} onChange={e => setPointForm({...pointForm, triggerWoTitle: e.target.value})} placeholder="Título OT Automática" className="h-9 text-[10px] font-bold" />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" variant="primary" className="flex-1 h-11 font-black uppercase tracking-widest text-[9px]">{editingPointId ? 'Actualizar Cambios' : 'Crear Instrumento'}</Button>
                  {editingPointId && <Button type="button" variant="danger" className="w-11 h-11 p-0 rounded-xl" onClick={() => { if(confirm('¿Eliminar?')) deleteMeasurementPoint(editingPointId); resetForm(); }}><Trash2 size={16} /></Button>}
                </div>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {points.map((point: MeasurementPoint) => {
            const config = measurementConfigs.find((c: any) => c.id === point.configId);
            const isCumulative = config?.isCumulative ?? true;
            const readings = meterReadings
              .filter((mr: any) => mr.measurementPointId === point.id)
              .sort((a: any, b: any) => new Date(a.readingAt).getTime() - new Date(b.readingAt).getTime());
            
            const isTakingReading = readingPointId === point.id;
            const linkedPlan = assetPlans?.find((ap: any) => ap.measurementPointId === point.id && ap.active);
            const status = computePlanStatus(linkedPlan ? pmPlans?.find((p: any) => p.id === linkedPlan.pmPlanId) : null, linkedPlan, point.currentValue);
            const progress = linkedPlan ? status.progress : null;

            return (
              <div key={point.id} className={cn("bg-white border rounded-[28px] p-6 flex flex-col transition-all duration-300 relative overflow-hidden", isTakingReading ? "border-brand ring-8 ring-brand/5 shadow-xl" : "border-slate-100 hover:border-slate-300 shadow-sm")}>
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate tracking-tight">{point.name}</h4>
                    <span className={cn("text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase mt-1 inline-block", isCumulative ? "bg-slate-900 text-white" : "bg-brand/10 text-brand")}>{isCumulative ? 'Contador' : 'Monitor'}</span>
                  </div>
                  <button onClick={() => handleEditPoint(point)} className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-slate-900 hover:text-white transition-all"><Settings2 size={14} /></button>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display font-black text-slate-900 tracking-tighter">{point.currentValue != null ? Number(point.currentValue).toLocaleString('es-SV') : '0'}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{point.unit}</span>
                  </div>
                  {!isCumulative && (point.minThreshold !== null || point.maxThreshold !== null) && (
                    <div className="mt-2 flex items-center gap-3">
                      {point.minThreshold !== null && <span className="text-[9px] font-bold text-slate-400">MIN: {point.minThreshold}</span>}
                      {point.maxThreshold !== null && <span className="text-[9px] font-bold text-slate-400">MAX: {point.maxThreshold}</span>}
                    </div>
                  )}
                </div>

                {/* Sparkline (Mini-tendencia) */}
                {!isCumulative && readings.length > 1 && (
                  <div className="h-12 w-full mb-4 opacity-50 hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={readings.slice(-10)}>
                        <Line type="monotone" dataKey="value" stroke="var(--color-brand)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {isCumulative && progress !== null && (
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span>Vida Útil</span>
                      <span className={cn(progress >= 90 ? 'text-brand' : 'text-slate-900')}>{Math.round(100 - progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-50">
                      <div className={cn('h-full rounded-full transition-all duration-1000', progress >= 90 ? 'bg-brand' : 'bg-emerald-500')} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mb-6">
                  <div className="flex items-center gap-1.5"><History size={12} className="text-slate-200" />{point.lastReadingAt ? formatDistanceToNow(new Date(point.lastReadingAt), { locale: es, addSuffix: true }) : '—'}</div>
                  <span className="uppercase tracking-widest opacity-60">{readings.length} Lecturas</span>
                </div>

                <div className="mt-auto">
                  {isTakingReading ? (
                    <form onSubmit={handleSaveReading} className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                      <Input type="number" value={readingValue} onChange={e => setReadingValue(e.target.value)} placeholder="0.00" className="h-10 text-xl font-display font-black text-brand border-brand/20" autoFocus step="any" />
                      <div className="flex gap-2">
                        <Button type="submit" variant="primary" className="flex-1 h-9 font-black uppercase text-[9px]">Confirmar</Button>
                        <button type="button" onClick={() => setReadingPointId(null)} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-900">✕</button>
                      </div>
                    </form>
                  ) : (
                    <Button variant="outline" className="w-full h-10 font-black uppercase text-[9px] border-slate-100 hover:border-slate-900" icon={<TrendingUp size={14} />} onClick={() => setReadingPointId(point.id)}>Registrar</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {points.map((point: MeasurementPoint) => {
            const config = measurementConfigs.find((c: any) => c.id === point.configId);
            const isCumulative = config?.isCumulative ?? true;
            const readings = meterReadings
              .filter((mr: any) => mr.measurementPointId === point.id)
              .sort((a: any, b: any) => new Date(a.readingAt).getTime() - new Date(b.readingAt).getTime());

            if (readings.length === 0) return null;

            return (
              <div key={point.id} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="font-display font-black text-slate-900 text-lg tracking-tight">{point.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Análisis de Tendencia Histórica ({point.unit})</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor Actual</p>
                      <p className="text-xl font-display font-black text-slate-900 tracking-tighter">{point.currentValue} {point.unit}</p>
                    </div>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={readings}>
                      <defs>
                        <linearGradient id={`grad-${point.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="readingAt" 
                        tickFormatter={(str) => new Date(str).toLocaleDateString('es-SV', { day: '2-digit', month: 'short' })}
                        tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={30}
                      />
                      <YAxis 
                        tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        labelFormatter={(label) => new Date(label).toLocaleString('es-SV')}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="var(--color-brand)" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill={`url(#grad-${point.id})`} 
                      />
                      {!isCumulative && point.maxThreshold !== null && (
                        <ReferenceLine y={point.maxThreshold} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'MAX', position: 'right', fontSize: 8, fontWeight: 900, fill: '#ef4444' }} />
                      )}
                      {!isCumulative && point.minThreshold !== null && (
                        <ReferenceLine y={point.minThreshold} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'MIN', position: 'right', fontSize: 8, fontWeight: 900, fill: '#3b82f6' }} />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
          {points.every(p => meterReadings.filter((mr: any) => mr.measurementPointId === p.id).length === 0) && (
            <div className="p-20 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100">
              <TrendingUp size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">Sin datos históricos</p>
              <p className="text-xs text-slate-400 mt-1">Registre algunas mediciones para ver gráficas de tendencia.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
