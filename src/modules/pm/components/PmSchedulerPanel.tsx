import React, { useState } from 'react';
import { useStore } from '../../../store';
import { Button, Input, Badge, AlertBanner } from '../../../shared/components';
import { Play, Settings, AlertTriangle, CheckCircle2, Calendar, Activity } from 'lucide-react';
import { format, isBefore, startOfDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PmSchedulerPanel() {
  const store = useStore() as any;
  const { runPmScheduler, assetPlans, pmPlans, workOrders, assets, showToast } = store;
  const [horizonDays, setHorizonDays] = useState(30);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    generatedCount: number;
    skippedCount: number;
    timestamp: Date;
  } | null>(null);

  const today = startOfDay(new Date());

  const pmBacklog = assetPlans.filter((plan: any) => {
    if (!plan.active || !plan.nextDueDate) return false;
    if (!isBefore(parseISO(plan.nextDueDate), today)) return false;
    const hasOpenWo = workOrders.some(
      (w: any) => w.assetPlanId === plan.id && !['completed', 'cancelled'].includes(w.status)
    );
    return !hasOpenWo;
  });

  const handleRun = async () => {
    console.log('>>> [UI] Iniciando ejecución del motor PM desde el panel...');
    setRunning(true);
    try {
      const result = await runPmScheduler(horizonDays);
      console.log('>>> [UI] Ejecución completada con éxito:', result);
      setLastResult({ ...result, timestamp: new Date() });
    } catch (err: any) {
      console.error('>>> [UI] ERROR CRÍTICO al ejecutar el motor:', err);
      if (showToast) {
        showToast({ 
          type: 'error', 
          title: 'Error de Ejecución', 
          message: err.message || 'Error desconocido en el motor' 
        });
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-bg-app p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Debug Stats Monitor */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900 rounded-2xl p-4 text-white">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Planes</p>
            <p className="text-xl font-bold">{pmPlans?.length || 0}</p>
          </div>
          <div className="text-center border-l border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Asignaciones</p>
            <p className="text-xl font-bold">{assetPlans?.length || 0}</p>
          </div>
          <div className="text-center border-l border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Activos</p>
            <p className="text-xl font-bold">{assets?.length || 0}</p>
          </div>
          <div className="text-center border-l border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase">OTs Abiertas</p>
            <p className="text-xl font-bold">
              {workOrders?.filter((w: any) => !['completed', 'cancelled'].includes(w.status)).length || 0}
            </p>
          </div>
        </div>

        {/* Main scheduler card */}
        <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
          {/* Card header */}
          <div className="bg-bg-3 border-b border-border px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white border border-border flex items-center justify-center shadow-sm">
              <Settings size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="font-display font-bold text-tx">Motor Automático de PM</h2>
              <p className="text-xs text-tx-4">Generador de Órdenes Preventivas</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <AlertBanner
              type="info"
              title="¿Cómo funciona?"
              message="El motor evalúa todos los planes activos. Si un plan cumple el criterio de disparo (fecha dentro del horizonte o medidor que alcanza umbral) y no tiene una OT abierta, genera automáticamente una nueva orden."
            />

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-end bg-bg-3 rounded-2xl p-5 border border-border">
              <div className="flex-1">
                <label className="block text-sm font-medium text-tx-2 mb-1.5">
                  Horizonte de planificación (días)
                </label>
                <Input
                  type="number"
                  value={horizonDays}
                  onChange={e => setHorizonDays(Number(e.target.value))}
                  min={1}
                  max={365}
                  className="max-w-[180px]"
                />
                <p className="text-xs text-tx-4 mt-1.5">
                  Considera OTs cuya fecha de vencimiento cae dentro de este período.
                </p>
              </div>
              <Button
                size="lg"
                variant="primary"
                loading={running}
                icon={!running ? <Play size={18} fill="currentColor" /> : undefined}
                onClick={handleRun}
                className="shrink-0 w-full sm:w-auto"
              >
                {running ? 'Ejecutando...' : 'Ejecutar Scheduler'}
              </Button>
            </div>

            {/* Result */}
            {lastResult && (
              <div className={`animate-slide-up rounded-2xl border p-5 flex items-start gap-4 ${
                lastResult.generatedCount > 0
                  ? 'bg-ok-bg border-ok/30'
                  : 'bg-bg-3 border-border'
              }`}>
                {lastResult.generatedCount > 0
                  ? <CheckCircle2 size={20} className="text-ok shrink-0 mt-0.5" />
                  : <Activity size={20} className="text-tx-4 shrink-0 mt-0.5" />
                }
                <div>
                  <p className="font-semibold text-tx">Resultado de la ejecución</p>
                  <p className="text-sm text-tx-2 mt-1">
                    Se generaron{' '}
                    <span className="font-bold text-brand">{lastResult.generatedCount}</span>
                    {' '}nuevas órdenes de trabajo.{' '}
                    {lastResult.skippedCount > 0 && (
                      <span className="text-tx-4">
                        {lastResult.skippedCount} planes no cumplieron criterios.
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-tx-4 mt-2">
                    Ejecutado a las {format(lastResult.timestamp, 'HH:mm:ss')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Backlog section */}
        <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-display font-semibold text-tx">Backlog Preventivo Vencido</h3>
            <Badge variant={pmBacklog.length > 0 ? 'danger' : 'ok'}>
              {pmBacklog.length} {pmBacklog.length === 1 ? 'plan' : 'planes'}
            </Badge>
          </div>

          {pmBacklog.length > 0 ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pmBacklog.map((ap: any) => {
                const asset = assets.find((a: any) => a.id === ap.assetId);
                const plan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
                const daysOverdue = ap.nextDueDate
                  ? Math.floor((today.getTime() - new Date(ap.nextDueDate).getTime()) / 86400000)
                  : 0;

                return (
                  <div key={ap.id} className="border-l-[3px] border-danger border border-border rounded-2xl p-4 bg-danger-bg/20">
                    <p className="font-semibold text-sm text-tx truncate">{plan?.name || 'Plan'}</p>
                    <p className="text-xs text-tx-4 truncate mt-0.5">{asset?.name || 'Activo'}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-danger font-medium">
                        <Calendar size={12} />
                        {ap.nextDueDate
                          ? format(new Date(ap.nextDueDate), 'dd MMM yyyy', { locale: es })
                          : '—'}
                      </div>
                      <Badge variant="danger" className="text-[10px]">
                        +{daysOverdue}d
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center">
              <CheckCircle2 size={32} className="mx-auto text-ok mb-3 opacity-60" />
              <p className="font-semibold text-ok">Backlog al día</p>
              <p className="text-sm text-tx-4 mt-1">No hay mantenimientos vencidos sin OT.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
