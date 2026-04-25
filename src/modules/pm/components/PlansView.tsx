import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store';
import { PmPlan, PmTask } from '../types';
import PmPlanForm from './PmPlanForm';
import { Button, Badge, EmptyState, cn, AlertBanner } from '../../../shared/components';
import { Plus, Search, Calendar, Activity, Zap, Trash2, Edit2, ChevronRight, Clock, Shield, Target, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PlansView() {
  const { 
    pmPlans = [], 
    pmTasks = [], 
    assetPlans = [], 
    assets = [], 
    savePlan, 
    deletePlan, 
    showToast 
  } = useStore() as any;
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedPlan = pmPlans.find((p: PmPlan) => p.id === selectedPlanId);
  const selectedPlanTasks = selectedPlan
    ? pmTasks.filter((t: PmTask) => t.pmPlanId === selectedPlan.id).sort((a: PmTask, b: PmTask) => a.sortOrder - b.sortOrder)
    : [];
  const activeAssetPlans = selectedPlan
    ? assetPlans.filter((ap: any) => ap.pmPlanId === selectedPlan.id)
    : [];

  const filteredPlans = (pmPlans || []).filter((p: PmPlan) =>
    (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleSave = async (plan: PmPlan, tasks: PmTask[]) => {
    try {
      await savePlan(plan, tasks);
      setIsEditing(false);
      setSelectedPlanId(plan.id);
      showToast({ type: 'success', title: 'Protocolo Guardado', message: 'El plan maestro ha sido actualizado en el sistema.' });
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error de Sistema', message: error.message });
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;
    if (!window.confirm(`¿Confirmar eliminación de "${selectedPlan.name}"? Esta acción es irreversible.`)) return;
    try {
      await deletePlan(selectedPlan.id);
      setSelectedPlanId(null);
      showToast({ type: 'success', title: 'Plan Eliminado' });
    } catch (e: any) {
      showToast({ type: 'error', title: 'Error de Sistema', message: e.message });
    }
  };

  const triggerIcon = (type: string) => {
    if (type === 'calendar') return <Calendar size={12} />;
    if (type === 'meter') return <Activity size={12} />;
    return <Zap size={12} />;
  };

  const triggerLabel = (plan: PmPlan) => {
    const unit = (plan.intervalUnit || 'meses').toUpperCase();
    if (plan.triggerType === 'calendar') return `CADA ${plan.intervalValue} ${unit}`;
    if (plan.triggerType === 'meter') return `CADA ${plan.meterIntervalValue} ${plan.meterIntervalUnit?.toUpperCase() || 'UNIT'}`;
    return `MIXTO: ${plan.intervalValue} ${unit}`;
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-50/50">
      {/* ── Left: Plan list ── */}
      <div className="w-full sm:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm relative z-10">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-slate-900 tracking-tight">Planes Maestros</h2>
            <Badge variant="neutral" className="text-[10px] font-bold">{pmPlans.length}</Badge>
          </div>
          <Button 
            variant="primary" 
            className="w-full h-11 shadow-lg shadow-brand/10" 
            icon={<Plus size={16} />} 
            onClick={() => { setSelectedPlanId(null); setIsEditing(true); }}
          >
            Nuevo Protocolo PM
          </Button>
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" />
            <input
              className="w-full pl-9 text-xs h-10 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-brand focus:ring-[4px] focus:ring-brand/5 transition-all font-medium"
              placeholder="Buscar protocolos técnicos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none">
          {filteredPlans.map((plan: PmPlan) => {
            const assignedCount = assetPlans.filter((ap: any) => ap.pmPlanId === plan.id).length;
            const isSelected = selectedPlanId === plan.id;
            return (
              <motion.button
                key={plan.id}
                whileHover={{ x: 4 }}
                onClick={() => { setSelectedPlanId(plan.id); setIsEditing(false); }}
                className={cn(
                  'w-full text-left p-4 rounded-[14px] transition-all relative overflow-hidden group',
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                    : 'bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md'
                )}
              >
                {isSelected && (
                  <motion.div layoutId="plan-active" className="absolute left-0 top-0 w-1.5 h-full bg-brand" />
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-bold text-sm leading-snug tracking-tight truncate', isSelected ? 'text-white' : 'text-slate-900')}>
                      {plan.name}
                    </p>
                    <div className={cn('flex items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-widest', isSelected ? 'text-white/60' : 'text-slate-400')}>
                      <span className="flex items-center gap-1.5">
                        {triggerIcon(plan.triggerType)}
                        {triggerLabel(plan)}
                      </span>
                    </div>
                  </div>
                  {assignedCount > 0 && (
                    <Badge 
                      variant={isSelected ? 'outline' : 'neutral'} 
                      className={cn('text-[9px] px-1.5 border-none', isSelected ? 'bg-white/10 text-white' : 'bg-slate-50')}
                    >
                      {assignedCount} ACT
                    </Badge>
                  )}
                </div>
              </motion.button>
            );
          })}

          {filteredPlans.length === 0 && (
            <div className="py-12 text-center opacity-40">
              <Search className="mx-auto mb-3" size={32} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sin resultados</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Center: Detail / Form ── */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-bold text-brand uppercase tracking-[0.2em] mb-1">Editor de Protocolos</p>
                  <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
                    {selectedPlan ? 'Modificar Plan Maestro' : 'Nuevo Protocolo de Ingeniería'}
                  </h2>
                </div>
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
              </div>
              <PmPlanForm
                initialPlan={selectedPlan}
                initialTasks={selectedPlanTasks}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            </motion.div>
          ) : selectedPlan ? (
            <motion.div 
              key={selectedPlan.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 max-w-4xl mx-auto space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="brand" className="text-[10px] font-black uppercase tracking-widest px-2 py-1 shadow-sm">
                      {selectedPlan.triggerType}
                    </Badge>
                    <span className="text-slate-300">/</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {selectedPlan.id.substring(0, 8)}</span>
                  </div>
                  <h2 className="font-display text-3xl font-bold text-slate-900 tracking-tight leading-none mb-4">{selectedPlan.name}</h2>
                  {selectedPlan.description && (
                    <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{selectedPlan.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-10 px-4 font-bold border-slate-200 hover:border-slate-900 transition-all" 
                    icon={<Edit2 size={14} />} 
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="h-10 px-4 font-bold" 
                    icon={<Trash2 size={14} />} 
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Criticidad', value: selectedPlan.criticality, icon: <Shield size={14} />, variant: 'brand' },
                  { label: 'Duración', value: `${selectedPlan.estimatedDuration} HRS`, icon: <Clock size={14} />, variant: 'default' },
                  { label: 'Método', value: selectedPlan.intervalMode || 'FLOTANTE', icon: <Target size={14} />, variant: 'default' },
                  { 
                    label: 'Ciclo Técnico', 
                    value: triggerLabel(selectedPlan).replace('CADA ', ''), 
                    icon: triggerIcon(selectedPlan.triggerType),
                    variant: 'info' 
                  },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{stat.label}</span>
                      <div className="text-slate-300 group-hover:text-brand transition-colors">{stat.icon}</div>
                    </div>
                    <p className="font-display font-bold text-slate-900 text-sm tracking-tight capitalize">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Technical Alerts */}
              {(selectedPlan.triggerType === 'meter' || selectedPlan.triggerType === 'hybrid') && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4 items-start">
                  <Activity className="text-amber-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Nota Técnica de Medición</p>
                    <p className="text-xs text-amber-700 leading-relaxed font-medium">
                      Este protocolo es acumulativo. El próximo umbral se calculará sumando el intervalo maestro al valor actual registrado en el activo al momento del cierre.
                    </p>
                  </div>
                </div>
              )}

              {/* Checklist Section Agrupado */}
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Checklist de Operaciones por Ciclo</p>
                  <Badge variant="neutral" className="text-[10px] font-bold">{selectedPlanTasks.length} TAREAS TOTALES</Badge>
                </div>
                
                {selectedPlanTasks.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {/* Agrupación por multiplicador */}
                    {Array.from(new Set(selectedPlanTasks.map(t => t.frequencyMultiplier || 1)))
                      .sort((a, b) => a - b)
                      .map(multiplier => {
                        const tasksInGroup = selectedPlanTasks.filter(t => (t.frequencyMultiplier || 1) === multiplier);
                        
                        // Cálculo de valor absoluto
                        const isCalendar = selectedPlan.triggerType === 'calendar' || selectedPlan.triggerType === 'hybrid';
                        const isMeter = selectedPlan.triggerType === 'meter' || selectedPlan.triggerType === 'hybrid';
                        
                        let absoluteInterval = '';
                        if (isCalendar && selectedPlan.intervalValue) {
                          const total = selectedPlan.intervalValue * multiplier;
                          const units: Record<string, string> = { 
                            days: 'Días', weeks: 'Semanas', months: 'Meses', years: 'Años' 
                          };
                          absoluteInterval = `Cada ${total} ${units[selectedPlan.intervalUnit || 'months']}`;
                        } else if (isMeter && selectedPlan.meterIntervalValue) {
                          const total = selectedPlan.meterIntervalValue * multiplier;
                          absoluteInterval = `Cada ${total.toLocaleString()} ${selectedPlan.meterIntervalUnit?.toUpperCase()}`;
                        }

                        return (
                          <div key={multiplier} className="bg-white">
                            <div className="px-6 py-3 bg-slate-50/30 flex items-center justify-between border-b border-slate-50">
                              <div className="flex items-center gap-2">
                                <Badge variant="brand" className="text-[9px] font-black h-5 px-1.5">x{multiplier}</Badge>
                                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">
                                  {multiplier === 1 ? 'Rutina Base' : `Frecuencia Extendida`}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-brand uppercase">{absoluteInterval}</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                              {tasksInGroup.map((t, i) => (
                                <div key={t.id} className="px-8 py-4 flex gap-4 hover:bg-slate-50/50 transition-colors group">
                                  <span className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-brand transition-colors pt-0.5">
                                    {(i + 1).toString().padStart(2, '0')}
                                  </span>
                                  <span className="text-sm text-slate-700 font-medium leading-relaxed">{t.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-xs text-slate-400 italic font-medium">No se han definido tareas técnicas para este protocolo.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center p-12"
            >
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CalendarClock className="text-slate-200" size={32} />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-lg mb-2 tracking-tight">Ingeniería Preventiva</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Seleccione un protocolo técnico de la lista lateral para visualizar sus especificaciones maestros, frecuencias y tareas asignadas.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right: Assignments ── */}
      <AnimatePresence>
        {selectedPlan && !isEditing && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="hidden xl:flex w-72 bg-white border-l border-slate-200 flex-col shrink-0 z-10"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <p className="font-bold text-sm text-slate-900 tracking-tight">Activos Vinculados</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{activeAssetPlans.length} INSTANCIAS ACTIVAS</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
              {activeAssetPlans.length > 0 ? (
                activeAssetPlans.map((ap: any) => {
                  const asset = assets.find((a: any) => a.id === ap.assetId);
                  const isOverdue = ap.nextDueDate && new Date(ap.nextDueDate) <= new Date();
                  return (
                    <div key={ap.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-brand/20 transition-all group">
                      <p className="font-bold text-xs text-slate-900 truncate tracking-tight mb-3">{asset?.name || 'Unidad Técnica'}</p>
                      <div className="space-y-2">
                        {ap.nextDueDate && (
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-400">Vencimiento:</span>
                            <span className={cn('font-mono', isOverdue ? 'text-brand' : 'text-slate-600')}>
                              {ap.nextDueDate ? format(new Date(ap.nextDueDate), 'dd/MM/yy', { locale: es }) : '—'}
                            </span>
                          </div>
                        )}
                        {ap.nextDueMeter && (
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-slate-400">Umbral:</span>
                            <span className="text-slate-900 font-mono">
                              {Number(ap.nextDueMeter).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                        <Badge variant={ap.active ? 'ok' : 'neutral'} className="text-[9px] px-1.5 border-none bg-slate-50">
                          {ap.active ? 'OPERATIVO' : 'EN PAUSA'}
                        </Badge>
                        <span className="text-[9px] font-black text-slate-300 group-hover:text-slate-900 transition-colors">{ap.woCount} OTs</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Sin activos vinculados a este protocolo</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center leading-relaxed">
                Asigne planes desde el Registro de Activos
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
