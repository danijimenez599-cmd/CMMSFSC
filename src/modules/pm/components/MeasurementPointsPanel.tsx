import React, { useState } from 'react';
import { useStore } from '../../../store';
import { MeasurementPoint } from '../types';
import { Button, Input, Badge, AlertBanner, Select } from '../../../shared/components';
import { Activity, Plus, History, Info, Gauge, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateId, cn } from '../../../shared/utils/generateId';
import { computePlanStatus } from '../store/pmEngine';
import { motion } from 'framer-motion';

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
    addMeterReading,
    currentUser,
  } = useStore() as any;

  const [showAddPoint, setShowAddPoint] = useState(false);
  const [newPointName, setNewPointName] = useState('');
  const [newPointConfigId, setNewPointConfigId] = useState('');
  const [readingPointId, setReadingPointId] = useState<string | null>(null);
  const [readingValue, setReadingValue] = useState('');

  const points: MeasurementPoint[] = measurementPoints.filter(
    (mp: MeasurementPoint) => mp.assetId === assetId
  );

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPointName || !newPointConfigId) return;
    const config = measurementConfigs.find((c: any) => c.id === newPointConfigId);
    saveMeasurementPoint({
      id: generateId(),
      assetId,
      configId: newPointConfigId,
      name: newPointName,
      unit: config?.unit || '?',
      currentValue: 0,
      lastReadingAt: null,
    });
    setNewPointName('');
    setNewPointConfigId('');
    setShowAddPoint(false);
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold text-tx flex items-center gap-2">
            <Gauge size={18} className="text-brand" />
            Puntos de Medición
          </h3>
          <p className="text-xs text-tx-3 mt-0.5">
            Horómetros, odómetros, presiones y otros indicadores.
          </p>
        </div>
        <Button
          variant={showAddPoint ? 'ghost' : 'outline'}
          size="sm"
          icon={<Plus size={14} className={showAddPoint ? 'rotate-45 transition-transform' : 'transition-transform'} />}
          onClick={() => setShowAddPoint(!showAddPoint)}
        >
          {showAddPoint ? 'Cerrar' : 'Nuevo punto'}
        </Button>
      </div>

      {/* Add form */}
      {showAddPoint && (
        <form
          onSubmit={handleAddPoint}
          className="bg-brand-light border border-brand/20 rounded-2xl p-4 space-y-3 animate-slide-up"
        >
          <div className="flex items-start gap-2">
            <Info size={14} className="text-brand mt-0.5 shrink-0" />
            <p className="text-xs text-tx-2">
              Los puntos <strong>acumulativos</strong> (horas, km) disparan OTs cuando alcanzan el umbral del plan PM.
              Los <strong>no acumulativos</strong> (presión, temperatura) generan alertas informativas.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newPointName}
              onChange={e => setNewPointName(e.target.value)}
              placeholder="Ej. Horómetro Motor #1"
              className="flex-1"
              autoFocus
            />
            <select
              className="flex-1 h-10 px-3 rounded-xl border border-border bg-white text-sm focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none"
              value={newPointConfigId}
              onChange={e => setNewPointConfigId(e.target.value)}
            >
              <option value="">Tipo de magnitud...</option>
              {measurementConfigs.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.unit}) {c.isCumulative ? '📈' : '📊'}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!newPointConfigId || !newPointName}
            >
              Guardar
            </Button>
          </div>
          {measurementConfigs.length === 0 && (
            <p className="text-xs text-danger">
              ⚠️ Defina magnitudes en Configuración → Catálogo Medidores antes de continuar.
            </p>
          )}
        </form>
      )}

      {/* Points grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {points.map((point: MeasurementPoint) => {
          const config = measurementConfigs.find((c: any) => c.id === point.configId);
          const isCumulative = config?.isCumulative ?? true;
          const readingsForPoint = meterReadings.filter(
            (mr: any) => mr.measurementPointId === point.id
          );
          const isTakingReading = readingPointId === point.id;

          const linkedPlan = assetPlans?.find(
            (ap: any) => ap.measurementPointId === point.id && ap.active
          );
          
          const pmPlan = linkedPlan ? pmPlans?.find((p: any) => p.id === linkedPlan.pmPlanId) : null;
          const status = computePlanStatus(pmPlan, linkedPlan, point.currentValue);
          const progress = linkedPlan ? status.progress : null;

          return (
            <div
              key={point.id}
              className={cn(
                "bg-white border rounded-[24px] p-6 flex flex-col shadow-sm transition-all duration-300",
                isTakingReading ? "border-brand ring-4 ring-brand/5 shadow-xl" : "border-slate-100 hover:border-slate-300 hover:shadow-md"
              )}
            >
              {/* Point header */}
              <div className="flex items-start justify-between mb-6">
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 truncate tracking-tight">{point.name}</h4>
                  <div className="mt-1.5">
                    <Badge variant={isCumulative ? 'brand' : 'warn'} className="text-[9px] font-black tracking-widest px-2">
                      {isCumulative ? 'ACUMULATIVO' : 'LÍMITE / CONTROL'}
                    </Badge>
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl text-slate-400 group-hover:text-brand transition-colors">
                  <Gauge size={20} />
                </div>
              </div>

              {/* Main Value Display */}
              <div className="mb-6 flex items-baseline gap-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                <span className="text-4xl font-display font-black text-slate-900 tracking-tighter">
                  {point.currentValue != null
                    ? Number(point.currentValue).toLocaleString('es-SV')
                    : '0'}
                </span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{point.unit}</span>
              </div>

              {/* Progress bar */}
              {isCumulative && progress !== null && (
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">Progreso Operativo</span>
                    <span className={cn(progress >= 90 ? 'text-brand' : 'text-slate-900')}>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={cn(
                        'h-full rounded-full transition-all duration-1000',
                        progress >= 90 ? 'bg-brand' : progress >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                    />
                  </div>
                  {linkedPlan?.nextDueMeter && (
                    <p className="text-[10px] font-bold text-slate-400 tracking-wide text-right">
                      UMBRAL PM: {Number(linkedPlan.nextDueMeter).toLocaleString()} {point.unit}
                    </p>
                  )}
                </div>
              )}

              {/* Status / History row */}
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 px-1">
                <div className="flex items-center gap-1.5">
                  <History size={12} className="text-slate-300" />
                  {point.lastReadingAt
                    ? formatDistanceToNow(new Date(point.lastReadingAt), { locale: es, addSuffix: true })
                    : 'Sin registros'}
                </div>
                <span>{readingsForPoint.length} entradas</span>
              </div>

              {/* Actions Section */}
              <div className="mt-auto pt-4 border-t border-slate-50">
                {isTakingReading ? (
                  <form onSubmit={handleSaveReading} className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="relative">
                      <Input
                        type="number"
                        value={readingValue}
                        onChange={e => setReadingValue(e.target.value)}
                        placeholder="Nueva lectura..."
                        className="h-14 text-xl font-bold font-mono text-brand border-brand/30 bg-brand/[0.02] pr-12 focus:ring-brand/20"
                        autoFocus
                        step="any"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand/40 font-bold">
                        {point.unit}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" variant="primary" className="flex-1 h-11 font-bold shadow-lg shadow-brand/20">
                        Confirmar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-11 h-11 p-0 rounded-xl hover:bg-slate-100"
                        onClick={() => setReadingPointId(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-11 font-bold border-slate-200 hover:border-brand hover:text-brand transition-all"
                    icon={<TrendingUp size={16} />}
                    onClick={() => setReadingPointId(point.id)}
                  >
                    Registrar Lectura
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {points.length === 0 && !showAddPoint && (
          <div className="col-span-full border-2 border-dashed border-border rounded-2xl p-10 text-center bg-white/50">
            <Gauge size={32} className="mx-auto text-tx-4 opacity-30 mb-3" />
            <p className="text-sm text-tx-2 font-medium">Sin puntos de medición</p>
            <p className="text-xs text-tx-4 mt-1">
              Agrega contadores para llevar historial de uso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
