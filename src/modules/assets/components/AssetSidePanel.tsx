import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CalendarClock, 
  Plus, 
  Activity, 
  ChevronRight, 
  Gauge, 
  Calendar, 
  Clock, 
  LayoutList, 
  ChevronDown, 
  ChevronUp,
  Target,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Unlink
} from 'lucide-react';
import { useStore } from '../../../store';
import { Badge, Button, cn, Modal, Select, FormField } from '../../../shared/components';
import { formatDate, generateId } from '../../../shared/utils/utils';
import { calcNextDueDate, computePlanStatus } from '../../pm/store/pmEngine';
import { calculateProjections } from '../../pm/utils/projections';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

const safeLocale = es || undefined;

// --- COMPONENTE: TARJETA DE PROYECCIÓN PREMIUM ---
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
              {proj.date instanceof Date && isValid(proj.date) ? format(proj.date, 'EEEE, dd MMMM', { locale: safeLocale }) : 'Fecha Pendiente'}
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

export default function AssetSidePanel() {
  const store = useStore() as any;
  const {
    selectedAssetId, setModule = () => {}, workOrders = [], pmPlans = [],
    assetPlans = [], measurementPoints = [], pmTasks = [],
    saveAssetPlan = () => {}, unlinkAssetPlan, showToast = () => {},
  } = store;
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPointId, setSelectedPointId] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customStartMeter, setCustomStartMeter] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'schedule'>('info');

  if (!selectedAssetId) return null;

  const assetPoints = measurementPoints.filter((mp: any) => mp.assetId === selectedAssetId);
  const selectedPlan = pmPlans.find((p: any) => p.id === selectedPlanId);
  const isMeterBased = selectedPlan?.triggerType === 'meter' || selectedPlan?.triggerType === 'hybrid';
  const openWorkOrders = (workOrders || []).filter((wo: any) => wo.assetId === selectedAssetId && !['completed', 'cancelled'].includes(wo.status)).slice(0, 5);
  const activePlans = (assetPlans || []).filter((ap: any) => ap.assetId === selectedAssetId && ap.active);

  const activePMs = (activePlans || []).map((ap: any) => {
    try {
      const plan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
      const point = measurementPoints.find((p: any) => p.id === ap.measurementPointId);
      const status = computePlanStatus(plan, ap, point?.currentValue || 0);
      return { ...ap, planName: plan?.name || 'Plan Técnico', triggerType: plan?.triggerType || 'calendar', isOverdue: !!status?.isOverdue, progress: Number(status?.progress) || 0, statusLabel: status?.label || 'Pendiente' };
    } catch (e) { return null; }
  }).filter(Boolean);

  const handleAssignPlan = async () => {
    if (!selectedPlanId) return;
    const plan = pmPlans.find((p: any) => p.id === selectedPlanId);
    if (!plan) return;
    try {
      const today = new Date().toISOString();
      const firstDueDate = customStartDate ? new Date(customStartDate).toISOString().split('T')[0] : calcNextDueDate(plan, { nextDueDate: null } as any, today);
      await saveAssetPlan({ id: generateId(), assetId: selectedAssetId, pmPlanId: selectedPlanId, measurementPointId: selectedPointId || null, nextDueDate: firstDueDate, nextDueMeter: customStartMeter ? Number(customStartMeter) : null, lastCompletedAt: null, woCount: 0, currentCycleIndex: 1, active: true, createdAt: today });
      showToast({ type: 'success', title: 'Plan vinculado', message: `${plan.name} activado.` });
      setShowAssignModal(false);
    } catch (err: any) { showToast({ type: 'error', title: 'Error', message: err.message }); }
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      <div className="px-6 py-5 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between">
        <h3 className="font-display font-black text-slate-900 tracking-tight text-sm uppercase flex items-center gap-2"><Target size={16} className="text-brand" /> Inteligencia de Activo</h3>
        <Badge variant="neutral" className="text-[8px] font-black uppercase">v2.1</Badge>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-10 scrollbar-none">
        <div className="flex gap-1 p-1.5 bg-slate-200/50 rounded-[20px] border border-slate-200/50 w-full shadow-inner">
          <button onClick={() => setActiveTab('info')} className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all", activeTab === 'info' ? "bg-white text-brand shadow-md" : "text-slate-400")}>Estado Actual</button>
          <button onClick={() => setActiveTab('schedule')} className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all", activeTab === 'schedule' ? "bg-white text-brand shadow-md" : "text-slate-400")}>Proyección</button>
        </div>

        {activeTab === 'info' ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2"><FileText size={14} className="text-brand" /> Trabajos en Curso ({openWorkOrders.length})</h4>
              {openWorkOrders.length > 0 ? (
                <div className="space-y-3">
                  {openWorkOrders.map((wo: any) => (
                    <motion.div key={wo.id} whileHover={{ scale: 1.01, x: 4 }} className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm hover:border-brand/30 transition-all cursor-pointer group" onClick={() => setModule('workorders')}>
                      <div className="flex items-center justify-between mb-3"><span className="font-mono text-[10px] font-black text-brand bg-brand/5 px-2.5 py-1 rounded-xl border border-brand/10">#{wo.woNumber}</span><Badge variant={wo.status as any} className="text-[8px] px-2">{wo.status}</Badge></div>
                      <p className="text-xs font-black text-slate-900 group-hover:text-brand transition-colors">{wo.title}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-10 text-center">
                  <CheckCircle2 size={24} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activo Disponible</p>
                </div>
              )}
            </section>

            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2"><CalendarClock size={14} className="text-brand" /> Planes de Mantenimiento Preventivo ({activePMs.length})</h4>
              {activePMs.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {activePMs.map((pm: any) => (
                    <div key={pm.id} className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm relative overflow-hidden group">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0"><p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{pm.planName}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Disparador: {pm.triggerType}</p></div>
                        <Badge variant={pm.isOverdue ? 'danger' : 'ok'} className="font-black px-3 py-1">{pm.statusLabel}</Badge>
                      </div>
                      {/* Desvincular Plan — Soft Delete (active = false) */}
                      <button
                        onClick={async () => {
                          if (!window.confirm(`¿Desvincular el plan "${pm.planName}" de este activo?\n\nEl historial de OTs generadas se conservará intacto.`)) return;
                          try {
                            await unlinkAssetPlan?.(pm.id);
                            showToast({ type: 'success', title: 'Plan desvinculado', message: `"${pm.planName}" fue desactivado. El historial permanece intacto.` });
                          } catch (err: any) {
                            showToast({ type: 'error', title: 'Error', message: err.message });
                          }
                        }}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 hover:text-brand transition-colors uppercase tracking-widest mt-1"
                      >
                        <Unlink size={10} />
                        Desvincular Plan
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-10 text-center mb-6"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin estrategia definida</p></div>
              )}
              <Button variant="outline" size="sm" className="w-full border-slate-300 border-dashed rounded-2xl h-12 text-[10px] font-black uppercase tracking-[0.2em]" icon={<Plus size={16} />} onClick={() => setShowAssignModal(true)}>Configurar Nuevo Plan</Button>
            </section>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-10">
            <div className="p-6 bg-slate-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10"><div className="flex items-center gap-2 mb-3"><Activity size={16} className="text-brand" /><p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">Análisis Predictivo</p></div><p className="text-xs font-medium text-slate-300 leading-relaxed">Línea de tiempo calculada para los próximos 24 meses basada en ciclos de ingeniería.</p></div>
            </div>

            <div className="space-y-2">
              {Array.isArray(activePlans) && activePlans.length > 0 ? activePlans.map((ap: any) => {
                try {
                  const basePlan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
                  if (!basePlan) return null;
                  const planWithTasks = { ...basePlan, tasks: (Array.isArray(pmTasks) ? pmTasks : []).filter((t: any) => t.pmPlanId === basePlan.id) };
                  const projections = calculateProjections(ap, planWithTasks, 24);
                  return (
                    <div key={ap.id} className="pt-4">
                      <div className="flex items-center justify-between mb-8 px-2"><h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-brand pl-3">{basePlan.name}</h5><Badge variant="neutral" className="text-[9px] font-black">{(projections || []).length} HITOS</Badge></div>
                      <div className="space-y-0">{(projections || []).map((proj, idx) => (<ProjectionCard key={idx} proj={proj} />))}</div>
                    </div>
                  );
                } catch (err) { return null; }
              }) : (
                <div className="py-24 text-center"><Calendar size={32} className="mx-auto text-slate-200 mb-4" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay proyecciones</p></div>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Vincular Estrategia" size="sm" footer={<div className="flex gap-4 w-full"><Button variant="ghost" onClick={() => setShowAssignModal(false)} className="flex-1">Cancelar</Button><Button variant="primary" onClick={handleAssignPlan} disabled={!selectedPlanId} className="flex-1 bg-slate-900 hover:bg-brand">Vincular</Button></div>}>
        <div className="space-y-5 py-4">
          <FormField label="Plan Maestro"><Select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}><option value="">Elegir estrategia...</option>{pmPlans.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></FormField>
          <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 space-y-4">
            <FormField label="Fecha de Inicio"><input type="date" className="w-full h-12 px-4 text-xs font-bold border border-slate-200 rounded-xl outline-none" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} /></FormField>
          </div>
        </div>
      </Modal>
    </div>
  );
}
