import React, { useState } from 'react';
import { useStore } from '../../../store';
import { Button, Input, Badge, AlertBanner } from '../../../shared/components';
import { Gauge, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateId } from '../../../shared/utils/generateId';

export default function PmSettingsView() {
  const { measurementConfigs, saveMeasurementConfig, deleteMeasurementConfig, showToast } = useStore() as any;
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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-tx">Catálogo de Magnitudes</h2>
          <p className="text-sm text-tx-4 mt-0.5">
            Define los tipos de medición disponibles para tus equipos.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowAdd(!showAdd)}>
          Nueva magnitud
        </Button>
      </div>

      {/* Info about cumulative vs limit */}
      <AlertBanner
        type="info"
        title="Tipos de magnitud"
        message="Las magnitudes acumulativas (horas, km, ciclos) disparan OTs preventivas al alcanzar umbrales. Las de límite (presión, temperatura) generan alertas informativas para que el ingeniero evalúe."
      />

      {/* Add form */}
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

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
        {measurementConfigs.length > 0 ? (
          <table className="w-full text-sm">
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
        ) : (
          <div className="py-12 text-center text-tx-4 text-sm">
            <Gauge size={32} className="mx-auto mb-3 opacity-20" />
            Sin magnitudes definidas.
          </div>
        )}
      </div>
    </div>
  );
}
