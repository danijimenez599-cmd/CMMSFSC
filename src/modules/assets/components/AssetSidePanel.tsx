import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CalendarClock, Plus, Activity, ChevronRight, Gauge, Calendar } from 'lucide-react';
import { useStore } from '../../../store';
import { Badge, Button, cn, Modal, Select, FormField } from '../../../shared/components';
import { formatDate, generateId } from '../../../shared/utils/generateId';
import { calcNextDueDate, computePlanStatus } from '../../pm/store/pmEngine';

export default function AssetSidePanel() {
  const store = useStore() as any;
  const {
    selectedAssetId,
    setModule,
    workOrders = [],
    pmPlans = [],
    assetPlans = [],
    measurementPoints = [],
    saveAssetPlan,
    showToast,
  } = store;

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPointId, setSelectedPointId] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customStartMeter, setCustomStartMeter] = useState('');

  if (!selectedAssetId) return null;

  const assetPoints = measurementPoints.filter((mp: any) => mp.assetId === selectedAssetId);
  const selectedPlan = pmPlans.find((p: any) => p.id === selectedPlanId);
  const isMeterBased = selectedPlan?.triggerType === 'meter' || selectedPlan?.triggerType === 'hybrid';

  const openWorkOrders = workOrders
    .filter((wo: any) =>
      wo.assetId === selectedAssetId &&
      !['completed', 'cancelled'].includes(wo.status)
    )
    .slice(0, 5);

  const activePMs = (assetPlans || [])
    .filter((ap: any) => ap.assetId === selectedAssetId && ap.active)
    .map((ap: any) => {
      const plan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
      const point = measurementPoints.find((p: any) => p.id === ap.measurementPointId);
      
      // Iteration 2: Delegating intelligence to the engine
      const status = computePlanStatus(plan, ap, point?.currentValue);

      return {
        ...ap,
        planName: plan?.name || 'Plan Técnico',
        triggerType: plan?.triggerType || 'calendar',
        isOverdue: status.isOverdue,
        progress: status.progress,
        statusLabel: status.label,
        currentValue: Number(point?.currentValue) || 0,
        unit: point?.unit || '',
      };
    });

  const handleAssignPlan = async () => {
    if (!selectedPlanId) return;
    if (isMeterBased && !selectedPointId) {
      showToast({ type: 'warning', title: 'Medidor requerido', message: 'Selecciona un medidor para planes por uso.' });
      return;
    }

    const plan = pmPlans.find((p: any) => p.id === selectedPlanId);
    if (!plan) return;

    try {
      const today = new Date().toISOString();
      const firstDueDate = customStartDate 
        ? new Date(customStartDate).toISOString().split('T')[0] 
        : calcNextDueDate(plan, { nextDueDate: null } as any, today);

      let initialMeter = customStartMeter ? Number(customStartMeter) : null;
      if (!customStartMeter && isMeterBased && selectedPointId) {
        const point = assetPoints.find((p: any) => p.id === selectedPointId);
        if (point) {
          initialMeter = (point.currentValue || 0) + (plan.meterIntervalValue || 0);
        }
      }

      await saveAssetPlan({
        id: generateId(),
        assetId: selectedAssetId,
        pmPlanId: selectedPlanId,
        measurementPointId: selectedPointId || null,
        nextDueDate: firstDueDate,
        nextDueMeter: initialMeter,
        lastCompletedAt: null,
        woCount: 0,
        active: true,
        createdAt: today,
      });

      showToast({ type: 'success', title: 'Plan asignado', message: `${plan.name} vinculado al activo.` });
      setShowAssignModal(false);
      setSelectedPlanId('');
      setSelectedPointId('');
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error', message: error.message });
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-white shrink-0">
        <h3 className="font-display font-bold text-slate-900 tracking-tight text-sm flex items-center gap-2">
          <Activity size={14} className="text-brand" />
          Inteligencia de Activo
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        {/* Open WOs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
              <FileText size={12} className="text-brand" />
              Órdenes Activas ({openWorkOrders.length})
            </h4>
          </div>

          {openWorkOrders.length > 0 ? (
            <div className="space-y-2.5">
              {openWorkOrders.map((wo: any) => (
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
                      <span className="flex items-center gap-1.5"><Calendar size={10} />Vencimiento</span>
                      <span className="text-slate-600 font-mono">{formatDate(wo.dueDate)}</span>
                    </div>
                  )}
                </motion.div>
              ))}
              <button
                className="w-full py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand transition-colors flex items-center justify-center gap-1.5 group"
                onClick={() => setModule('workorders')}
              >
                Ver Historial Completo
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin tareas pendientes</p>
            </div>
          )}
        </section>

        {/* Active PMs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
              <CalendarClock size={12} className="text-brand" />
              Estrategia Preventiva ({activePMs.length})
            </h4>
          </div>

          {activePMs.length > 0 ? (
            <div className="space-y-3 mb-4">
              {activePMs.map((pm: any) => (
                <div
                  key={pm.id}
                  className={cn(
                    'bg-white border rounded-xl p-4 shadow-sm relative overflow-hidden',
                    pm.isOverdue ? 'border-brand/20' : 'border-slate-200'
                  )}
                >
                  {pm.isOverdue && (
                    <div className="absolute top-0 right-0 w-1 h-full bg-brand" />
                  )}

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 tracking-tight line-clamp-1">{pm.planName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{pm.triggerType}</p>
                    </div>
                    <Badge variant={pm.isOverdue ? 'danger' : pm.progress >= 80 ? 'warn' : 'ok'} className="text-[9px] px-1.5 shrink-0">
                      {pm.statusLabel}
                    </Badge>
                  </div>

                  {/* Ciclo Info & Auditoría Tools */}
                  <div className="flex items-center justify-between mb-3 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ciclo Actual:</span>
                      <Badge variant="neutral" className="text-[10px] font-mono h-5 px-1.5">{pm.currentCycleIndex}</Badge>
                    </div>
                    {store.currentUser?.role === 'admin' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('¿Auditoría: Avanzar ciclo manualmente para pruebas?')) {
                            saveAssetPlan({ ...pm, currentCycleIndex: pm.currentCycleIndex + 1 });
                          }
                        }}
                        className="text-[9px] font-bold text-brand hover:underline uppercase tracking-tighter"
                      >
                        Salto de Ciclo
                      </button>
                    )}
                  </div>

                  {pm.triggerType !== 'meter' && pm.nextDueDate && (
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-400">Próxima Fecha:</span>
                      <span className={cn(pm.isOverdue ? 'text-brand' : 'text-slate-700')}>
                        {formatDate(pm.nextDueDate)}
                      </span>
                    </div>
                  )}

                  {pm.triggerType !== 'calendar' && pm.nextDueMeter != null && (
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">Horómetro / Uso:</span>
                        <span className="text-slate-900 font-mono">
                          {Number(pm.currentValue).toLocaleString()} <span className="text-slate-400 font-sans">/ {Number(pm.nextDueMeter).toLocaleString()} {pm.unit}</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pm.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn(
                            'h-full rounded-full',
                            pm.isOverdue ? 'bg-brand shadow-[0_0_8px_rgba(153,27,27,0.3)]' : 'bg-slate-400'
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center mb-4 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                <Gauge size={20} className="text-slate-200" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin monitoreo activo</p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full h-10 border-slate-200 border-dashed hover:bg-white hover:border-brand/40 group transition-all"
            icon={<Plus size={14} className="group-hover:rotate-90 transition-transform" />}
            onClick={() => setShowAssignModal(true)}
          >
            Vincular Nueva Estrategia
          </Button>
        </section>
      </div>

      {/* Assign modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Vincular Plan Estratégico"
        size="sm"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="ghost" onClick={() => setShowAssignModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignPlan}
              disabled={!selectedPlanId || (isMeterBased && !selectedPointId)}
              className="flex-1"
            >
              Confirmar Vínculo
            </Button>
          </div>
        }
      >
        <div className="space-y-6 py-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              Seleccione un plan maestro de mantenimiento. El sistema generará automáticamente las órdenes de trabajo correspondientes según la frecuencia definida.
            </p>
          </div>

          <FormField label="Plan Maestro de Mantenimiento">
            <Select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}>
              <option value="">Seleccione un plan...</option>
              {pmPlans.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} • {p.triggerType === 'calendar' ? 'Calendario' : p.triggerType === 'meter' ? 'Medidor' : 'Híbrido'}
                </option>
              ))}
            </Select>
          </FormField>
          {isMeterBased && (
            <FormField label="Fuente de Datos (Medidor)" error={!selectedPointId ? 'Campo requerido' : ''}>
              <Select value={selectedPointId} onChange={e => setSelectedPointId(e.target.value)}>
                <option value="">Seleccionar contador del activo...</option>
                {assetPoints.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Actual: {p.currentValue} {p.unit})
                  </option>
                ))}
              </Select>
              {assetPoints.length === 0 && (
                <div className="mt-3 p-3 bg-brand/5 border border-brand/10 rounded-lg">
                  <p className="text-[10px] font-bold text-brand uppercase tracking-wider">
                    Advertencia: El activo no posee puntos de medición registrados.
                  </p>
                </div>
              )}
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Primer Vencimiento (Fecha)">
              <input 
                type="date" 
                className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg focus:border-brand outline-none"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
              />
            </FormField>

            {isMeterBased && (
              <FormField label="Primer Umbral (Lectura)">
                <input 
                  type="number" 
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-lg focus:border-brand outline-none"
                  placeholder="Ej: 5000"
                  value={customStartMeter}
                  onChange={e => setCustomStartMeter(e.target.value)}
                />
              </FormField>
            )}
          </div>

          {pmPlans.length === 0 && (
            <div className="p-4 bg-brand/5 rounded-xl border border-brand/10 text-center">
              <p className="text-xs font-bold text-brand uppercase tracking-widest">
                No hay planes preventivos configurados en el sistema.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

