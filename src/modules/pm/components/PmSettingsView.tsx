import React, { useState } from 'react';
import { useStore } from '../../../store';
import { Button, Input, Badge, AlertBanner } from '../../../shared/components';
import { Gauge, Plus, Trash2, CheckCircle2, AlertCircle, Truck, Settings2, CalendarClock, Sliders, ShieldAlert } from 'lucide-react';
import { generateId } from '../../../shared/utils/utils';
import VendorsPanel from '../../workorders/components/VendorsPanel';
import { cn } from '../../../shared/utils/utils';

const CRITICALITY_LABELS: Record<string, { label: string; color: string }> = {
  critical: { label: 'Crítico',  color: 'text-red-600 bg-red-50 border-red-200' },
  high:     { label: 'Alto',     color: 'text-orange-600 bg-orange-50 border-orange-200' },
  medium:   { label: 'Medio',    color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  low:      { label: 'Bajo',     color: 'text-green-600 bg-green-50 border-green-200' },
};

export default function PmSettingsView() {
  const [activeTab, setActiveTab] = useState<'magnitudes' | 'vendors' | 'motor' | 'tolerances'>('magnitudes');
  const { measurementConfigs, saveMeasurementConfig, deleteMeasurementConfig, showToast,
    projectionMonths, setProjectionMonths, meterProjectionCycles, setMeterProjectionCycles,
    meterTolerances, saveMeterTolerance } = useStore() as any;
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [isCumulative, setIsCumulative] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unit) return;
    try {
      await saveMeasurementConfig({
        id: generateId(),
        name,
        unit,
        isCumulative,
        createdAt: new Date().toISOString(),
      });
      setName('');
      setUnit('');
      setIsCumulative(true);
      setShowAdd(false);
      showToast({ type: 'success', title: 'Magnitud guardada', message: 'Añadida al catálogo.' });
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error', message: error.message });
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-bg-2 rounded-2xl border border-border w-fit">
        <button
          onClick={() => setActiveTab('magnitudes')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === 'magnitudes' 
              ? "bg-white text-brand shadow-sm" 
              : "text-tx-4 hover:text-tx hover:bg-white/50"
          )}
        >
          <Gauge size={16} />
          Magnitudes
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === 'vendors' 
              ? "bg-white text-brand shadow-sm" 
              : "text-tx-4 hover:text-tx hover:bg-white/50"
          )}
        >
          <Truck size={16} />
          Proveedores
        </button>
        <button
          onClick={() => setActiveTab('motor')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === 'motor'
              ? "bg-white text-brand shadow-sm"
              : "text-tx-4 hover:text-tx hover:bg-white/50"
          )}
        >
          <Sliders size={16} />
          Proyecciones
        </button>
        <button
          onClick={() => setActiveTab('tolerances')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === 'tolerances'
              ? "bg-white text-brand shadow-sm"
              : "text-tx-4 hover:text-tx hover:bg-white/50"
          )}
        >
          <ShieldAlert size={16} />
          Tolerancias
        </button>
      </div>

      {activeTab === 'magnitudes' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-tx tracking-tight">Catálogo de Magnitudes</h2>
              <p className="text-sm text-tx-4 mt-0.5">
                Define los tipos de medición disponibles para tus equipos.
              </p>
            </div>
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowAdd(!showAdd)}>
              Nueva magnitud
            </Button>
          </div>

          <AlertBanner
            type="info"
            title="Tipos de magnitud"
            message="Las magnitudes acumulativas (horas, km, ciclos) disparan OTs preventivas al alcanzar umbrales. Las de límite (presión, temperatura) generan alertas informativas para que el ingeniero evalúe."
          />

          {showAdd && (
            <form
              onSubmit={handleSave}
              className="bg-white border border-border rounded-2xl shadow-card p-5 space-y-4 animate-slide-up"
            >
              <h3 className="font-semibold text-tx">Nueva magnitud</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Horas de Motor"
                  autoFocus
                />
                <Input
                  label="Unidad"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="Ej. hrs, km, psi"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-tx-2 mb-2">Comportamiento</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCumulative(true)}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      isCumulative
                        ? 'border-brand bg-brand-light text-brand'
                        : 'border-border text-tx-3 hover:border-brand/30'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                    Acumulativa
                    <span className="text-xs font-normal opacity-70">Dispara PM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCumulative(false)}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      !isCumulative
                        ? 'border-warn bg-warn-bg text-warn'
                        : 'border-border text-tx-3 hover:border-warn/30'
                    }`}
                  >
                    <AlertCircle size={18} />
                    Límite
                    <span className="text-xs font-normal opacity-70">Solo alerta</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={!name || !unit}>
                  Guardar
                </Button>
              </div>
            </form>
          )}

          <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
            {measurementConfigs.length > 0 ? (
              <table className="w-full text-sm min-w-[400px]">
                <thead className="bg-bg-3 border-b border-border">
                  <tr>
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-tx-4 uppercase tracking-wider">Nombre</th>
                    <th className="text-center px-5 py-3 text-[10px] font-bold text-tx-4 uppercase tracking-wider hidden sm:table-cell">Unidad</th>
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-tx-4 uppercase tracking-wider">Tipo</th>
                    <th className="px-5 py-3 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {measurementConfigs.map((config: any) => (
                    <tr key={config.id} className="hover:bg-bg-3/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-bg-3 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors text-tx-3">
                            <Gauge size={15} />
                          </div>
                          <div>
                            <p className="font-medium text-tx">{config.name}</p>
                            <p className="text-xs text-tx-4 font-mono sm:hidden">{config.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center font-mono text-tx-3 hidden sm:table-cell">
                        {config.unit}
                      </td>
                      <td className="px-5 py-4">
                        {config.isCumulative ? (
                          <Badge variant="ok" dot>Acumulativa</Badge>
                        ) : (
                          <Badge variant="warn" dot>Límite</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => deleteMeasurementConfig(config.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-tx-4 hover:text-danger hover:bg-danger-bg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            </div>
          </div>
        </div>
      ) : activeTab === 'vendors' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <VendorsPanel />
        </div>
      ) : activeTab === 'motor' ? (
        /* ── Motor PM Tab ─────────────────────────────────────────────── */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div>
            <h2 className="font-display text-xl font-bold text-tx tracking-tight">Parámetros de Proyección</h2>
            <p className="text-sm text-tx-4 mt-0.5">Configura el horizonte visual del calendario y las vistas predictivas.</p>
          </div>

          <AlertBanner
            type="info"
            title="Horizonte de Proyección"
            message="Este valor controla cuántos meses hacia el futuro se calculan las proyecciones en el Calendario y en la pestaña 'Proyección' de cada activo. Un horizonte mayor muestra más eventos pero puede afectar el rendimiento de renderizado."
          />

          <div className="bg-white border border-border rounded-2xl shadow-card p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand/5 border border-brand/20 flex items-center justify-center">
                <CalendarClock size={24} className="text-brand" />
              </div>
              <div>
                <p className="font-bold text-tx">Meses de Proyección</p>
                <p className="text-xs text-tx-4 mt-0.5">Horizonte visual del calendario predictivo</p>
              </div>
            </div>

            <div className="flex items-end gap-6">
              <div className="flex-1 max-w-[220px]">
                <label className="block text-sm font-medium text-tx-2 mb-1.5">
                  Meses (1 – 24)
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={projectionMonths ?? 12}
                  onChange={e => setProjectionMonths(Number(e.target.value))}
                  className="w-full h-11 px-4 text-sm font-bold border border-border rounded-xl focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
                />
              </div>
              {/* Visual indicator */}
              <div className="flex-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-tx-4 uppercase tracking-widest mb-2">
                  <span>1 mes</span>
                  <span className="text-brand">{projectionMonths ?? 12} meses activos</span>
                  <span>24 meses</span>
                </div>
                <div className="h-2 bg-bg-3 rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${((projectionMonths ?? 12) / 24) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-tx-4 border-t border-border pt-4">
              <strong className="text-tx">Nota:</strong> El cambio es inmediato — recarga la vista del Calendario para ver los nuevos horizontes aplicados.
            </p>
          </div>

          <div className="bg-white border border-border rounded-2xl shadow-card p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand/5 border border-brand/20 flex items-center justify-center">
                <Sliders size={24} className="text-brand" />
              </div>
              <div>
                <p className="font-bold text-tx">Ciclos de Proyección — Medidor</p>
                <p className="text-xs text-tx-4 mt-0.5">Cuántos ciclos futuros mostrar en planes activados por horómetro</p>
              </div>
            </div>

            <div className="flex items-end gap-6">
              <div className="flex-1 max-w-[220px]">
                <label className="block text-sm font-medium text-tx-2 mb-1.5">
                  Ciclos (4 – 24)
                </label>
                <input
                  type="number"
                  min={4}
                  max={24}
                  value={meterProjectionCycles ?? 8}
                  onChange={e => setMeterProjectionCycles(Number(e.target.value))}
                  className="w-full h-11 px-4 text-sm font-bold border border-border rounded-xl focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-tx-4 uppercase tracking-widest mb-2">
                  <span>4</span>
                  <span className="text-brand">{meterProjectionCycles ?? 8} ciclos activos</span>
                  <span>24</span>
                </div>
                <div className="h-2 bg-bg-3 rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${(((meterProjectionCycles ?? 8) - 4) / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-tx-4 border-t border-border pt-4">
              <strong className="text-tx">Nota:</strong> Los planes de calendario usan el horizonte en meses. Los planes por medidor no tienen eje de tiempo, por eso se configura por número de ciclos.
            </p>
          </div>
        </div>
      ) : activeTab === 'tolerances' ? (
        /* ── Tolerancias Tab ──────────────────────────────────────────── */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div>
            <h2 className="font-display text-xl font-bold text-tx tracking-tight">Ventana de Tolerancia por Medidor</h2>
            <p className="text-sm text-tx-4 mt-0.5">
              Cuando una OT se dispara por acumulador, estas ventanas determinan cuándo debe ser programada y completada.
            </p>
          </div>

          <AlertBanner
            type="info"
            title="¿Cómo funciona?"
            message="scheduledDate = día del disparo + offset de programación. dueDate = día del disparo + ventana de tolerancia. Un equipo crítico con offset 0 y tolerancia 2 significa: programar hoy, completar en máximo 2 días."
          />

          <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-3 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 text-[10px] font-bold text-tx-4 uppercase tracking-wider">Criticidad</th>
                  <th className="text-center px-6 py-3 text-[10px] font-bold text-tx-4 uppercase tracking-wider">Offset Programación (días)</th>
                  <th className="text-center px-6 py-3 text-[10px] font-bold text-tx-4 uppercase tracking-wider">Ventana Tolerancia (días)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {['critical', 'high', 'medium', 'low'].map(crit => {
                  const row = (meterTolerances || []).find((t: any) => t.criticality === crit);
                  const meta = CRITICALITY_LABELS[crit];
                  const scheduled = row?.scheduledOffsetDays ?? { critical: 0, high: 0, medium: 0, low: 0 }[crit];
                  const due = row?.dueOffsetDays ?? { critical: 2, high: 5, medium: 14, low: 30 }[crit];
                  return (
                    <tr key={crit} className="hover:bg-bg-3/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className={cn('text-[11px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider', meta.color)}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          min={0}
                          max={30}
                          defaultValue={scheduled}
                          onBlur={async e => {
                            try {
                              await saveMeterTolerance({ criticality: crit, scheduledOffsetDays: Number(e.target.value), dueOffsetDays: due });
                              showToast({ type: 'success', title: 'Guardado', message: `Tolerancia ${meta.label} actualizada.` });
                            } catch (err: any) {
                              showToast({ type: 'error', title: 'Error', message: err.message });
                            }
                          }}
                          className="w-20 h-9 text-center text-sm font-bold border border-border rounded-xl mx-auto block focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          min={1}
                          max={90}
                          defaultValue={due}
                          onBlur={async e => {
                            try {
                              await saveMeterTolerance({ criticality: crit, scheduledOffsetDays: scheduled, dueOffsetDays: Number(e.target.value) });
                              showToast({ type: 'success', title: 'Guardado', message: `Tolerancia ${meta.label} actualizada.` });
                            } catch (err: any) {
                              showToast({ type: 'error', title: 'Error', message: err.message });
                            }
                          }}
                          className="w-20 h-9 text-center text-sm font-bold border border-border rounded-xl mx-auto block focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-tx-4">
            Los cambios se aplican a las próximas OTs generadas por medidor. Las OTs ya creadas conservan sus fechas originales.
          </p>
        </div>
      ) : null}
    </div>
  );
}
