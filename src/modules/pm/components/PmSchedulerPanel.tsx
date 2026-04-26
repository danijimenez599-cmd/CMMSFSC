import React, { useState, useMemo } from 'react';
import { useStore } from '../../../store';
import { Button, Input, Badge, AlertBanner } from '../../../shared/components';
import { Play, Settings, AlertTriangle, CheckCircle2, Calendar, Activity } from 'lucide-react';
import { format, isBefore, startOfDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PmSchedulerPanel() {
  const store = useStore() as any;
  const { 
    runPmScheduler, 
    assetPlans = [], 
    pmPlans = [], 
    workOrders = [], 
    assets = [], 
    measurementPoints = [], 
    showToast 
  } = store;

  const [horizonDays, setHorizonDays] = useState(30);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    generatedCount: number;
    skippedCount: number;
    timestamp: Date;
  } | null>(null);

  // 1. Memoized today date to prevent constant re-renders
  const today = useMemo(() => startOfDay(new Date()), []);

  // 2. Memoized backlog calculation with extreme defensive checks
  const pmBacklog = useMemo(() => {
    try {
      if (!Array.isArray(assetPlans) || !Array.isArray(pmPlans)) return [];

      return assetPlans.filter((assetPlan: any) => {
        if (!assetPlan || !assetPlan.active) return false;
        
        const plan = pmPlans.find((p: any) => p.id === assetPlan.pmPlanId);
        if (!plan) return false;

        let isOverdue = false;

        // Calendar check
        if (plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') {
          if (assetPlan.nextDueDate) {
            try {
              const dueDate = parseISO(assetPlan.nextDueDate);
              if (!isNaN(dueDate.getTime()) && isBefore(dueDate, today)) {
                isOverdue = true;
              }
            } catch (e) {
              console.error('[Backlog] Error parsing date:', assetPlan.nextDueDate);
            }
          }
        }

        // Meter check
        if (!isOverdue && (plan.triggerType === 'meter' || plan.triggerType === 'hybrid')) {
          const point = measurementPoints.find((p: any) => p.id === assetPlan.measurementPointId);
          const current = Number(point?.currentValue) || 0;
          const interval = Number(plan.meterIntervalValue) || 0;

          if (point && interval > 0) {
            let targetMeter = assetPlan.nextDueMeter;
            if (targetMeter == null || targetMeter <= 0) {
              const currentMultiple = Math.floor(current / interval);
              targetMeter = Math.max(interval, currentMultiple * interval);
            }
            if (targetMeter != null && current >= targetMeter) {
              isOverdue = true;
            }
          }
        }

        if (!isOverdue) return false;

        // Check if there is already an open work order
        const hasOpenWo = workOrders.some(
          (w: any) => w.assetPlanId === assetPlan.id && !['completed', 'cancelled', 'closed'].includes(w.status)
        );
        return !hasOpenWo;
      });
    } catch (err) {
      console.error('[Backlog] Error crítico en el cálculo:', err);
      return [];
    }
  }, [assetPlans, pmPlans, workOrders, measurementPoints, today]);

  const handleRun = async () => {
    console.log('>>> [UI] Iniciando ejecución del motor PM...');
    setRunning(true);
    try {
      // Safety check for horizon days
      const days = isNaN(Number(horizonDays)) ? 30 : Number(horizonDays);
      const result = await runPmScheduler(days);
      
      if (result) {
        setLastResult({ 
          generatedCount: result.generatedCount || 0, 
          skippedCount: result.skippedCount || 0, 
          timestamp: new Date() 
        });
      }
    } catch (err: any) {
      console.error('>>> [UI] ERROR en el motor:', err);
      if (showToast) {
        showToast({ 
          type: 'error', 
          title: 'Falla del Motor', 
          message: err.message || 'Error inesperado' 
        });
      }
    } finally {
      setRunning(false);
    }
  };

  if (!assetPlans || !pmPlans) {
    return (
      <div className="p-12 text-center">
        <Activity size={40} className="mx-auto text-slate-200 animate-pulse mb-4" />
        <p className="text-slate-400 font-medium">Cargando inteligencia de mantenimiento...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-bg-app p-4 sm:p-6 scrollbar-none">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Monitor de Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900 rounded-[24px] p-5 text-white shadow-2xl">
          {[
            { label: 'Planes Maestros', val: pmPlans.length },
            { label: 'Asignaciones', val: assetPlans.length },
            { label: 'Puntos de Control', val: measurementPoints.length },
            { label: 'Órdenes Pendientes', val: workOrders.filter((w: any) => !['completed', 'closed', 'cancelled'].includes(w.status)).length }
          ].map((stat, idx) => (
            <div key={stat.label} className={cn("text-center", idx > 0 && "border-l border-slate-800")}>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-display font-black text-white">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Card Principal del Motor */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/60">
          <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-[18px] bg-white border border-slate-100 flex items-center justify-center shadow-sm text-brand">
              <Settings size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-display font-black text-slate-900 text-lg tracking-tight">Motor de Mantenimiento Preventivo</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Algoritmo de Generación Automática</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex gap-4 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl items-start">
              <Activity size={18} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                El motor analiza todos los activos ligados. Si se detecta un vencimiento por fecha o se alcanza un umbral de horómetro, 
                se generará una nueva Orden de Trabajo si no existe una abierta actualmente.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-end bg-slate-50 p-6 rounded-[24px] border border-slate-100">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                  Horizonte de Proyección (Días)
                </label>
                <Input
                  type="number"
                  value={horizonDays}
                  onChange={e => setHorizonDays(Number(e.target.value))}
                  min={1}
                  max={365}
                  className="max-w-[200px] h-12 text-sm font-bold bg-white"
                />
              </div>
              <Button
                size="lg"
                variant="primary"
                loading={running}
                icon={!running ? <Play size={18} fill="currentColor" /> : undefined}
                onClick={handleRun}
                className="shrink-0 w-full sm:w-auto h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand/20"
              >
                {running ? 'Procesando...' : 'Ejecutar Algoritmo'}
              </Button>
            </div>

            {lastResult && (
              <div className="animate-in slide-in-from-top-4 duration-500 rounded-3xl border p-6 flex items-start gap-5 bg-emerald-50 border-emerald-100">
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-emerald-900 text-sm">Ejecución Exitosa</p>
                  <div className="grid grid-cols-2 gap-8 mt-3">
                    <div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Órdenes Creadas</p>
                      <p className="text-2xl font-display font-black text-emerald-900">{lastResult.generatedCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Frecuencia</p>
                      <p className="text-sm font-bold text-emerald-800 mt-1">{format(lastResult.timestamp, "HH:mm:ss 'HRS'", { locale: es })}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Backlog */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-black text-slate-900 text-base tracking-tight uppercase">Backlog Preventivo</h3>
              <Badge variant={pmBacklog.length > 0 ? 'danger' : 'ok'} className="px-3 py-1 font-black text-[10px]">
                {pmBacklog.length} {pmBacklog.length === 1 ? 'ALERTA' : 'ALERTAS'}
              </Badge>
            </div>
          </div>

          {pmBacklog.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
              {pmBacklog.map((ap: any) => {
                const asset = assets.find((a: any) => a.id === ap.assetId);
                const plan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
                const point = measurementPoints.find((p: any) => p.id === ap.measurementPointId);
                
                const dueDate = ap.nextDueDate ? new Date(ap.nextDueDate) : null;
                const daysOverdue = dueDate && !isNaN(dueDate.getTime())
                  ? Math.floor((today.getTime() - dueDate.getTime()) / 86400000)
                  : 0;

                return (
                  <div key={ap.id} className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <p className="font-black text-xs text-slate-900 truncate tracking-tight uppercase mb-1">{plan?.name || 'Protocolo'}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{asset?.name || 'Activo'}</p>
                    
                    <div className="mt-6 flex items-end justify-between">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado de Disparo</p>
                        <div className="flex items-center gap-2 text-brand font-black text-xs">
                          {ap.nextDueDate ? (
                            <>
                              <Calendar size={14} />
                              <span className="font-mono">{format(new Date(ap.nextDueDate), 'dd MMM yyyy', { locale: es })}</span>
                            </>
                          ) : (
                            <>
                              <Activity size={14} />
                              <span className="font-mono">
                                {Number(point?.currentValue || 0).toLocaleString()} / {Number(ap.nextDueMeter || (plan?.meterIntervalValue ? Math.max(plan.meterIntervalValue, Math.floor((Number(point?.currentValue) || 0) / plan.meterIntervalValue) * plan.meterIntervalValue) : 0)).toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="danger" className="text-[9px] font-black px-2 py-1 bg-red-50 text-red-600 border-none">
                        {ap.nextDueDate ? `VENCIDO +${daysOverdue}D` : 'MÉTRICA'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-[40px] p-16 text-center shadow-sm">
              <div className="w-20 h-20 rounded-[30px] bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h4 className="font-display font-black text-slate-900 text-lg mb-2">Ingeniería al Día</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                No se detectaron activos con mantenimientos preventivos vencidos en este momento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
