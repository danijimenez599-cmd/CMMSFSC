import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, RotateCcw } from 'lucide-react';
import { KpiTargets, DEFAULT_TARGETS, useKpiTargets } from '../config/kpiTargets';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FIELDS: { key: keyof KpiTargets; label: string; suffix: string; help: string }[] = [
  { key: 'pmCompliance',       label: 'Cumplimiento PM',     suffix: '%',  help: 'Meta de OTs preventivas completadas a tiempo' },
  { key: 'slaCompliance',      label: 'SLA',                 suffix: '%',  help: 'Meta de OTs cerradas dentro del dueDate' },
  { key: 'scheduleCompliance', label: 'Schedule Compliance', suffix: '%',  help: 'Meta de OTs ejecutadas en la fecha planeada' },
  { key: 'preventiveRatio',    label: '% Preventivo',        suffix: '%',  help: 'Meta de proporción preventivo vs total (clase mundial: 80%)' },
  { key: 'mttrHours',          label: 'MTTR máximo',         suffix: 'h',  help: 'Tiempo medio de reparación tolerable' },
  { key: 'overdueMax',         label: 'OTs vencidas máx.',   suffix: '',   help: 'Cantidad tolerable; 0 = ninguna' },
];

export function TargetsModal({ open, onClose }: Props) {
  const [targets, setTargets] = useKpiTargets();
  const [draft, setDraft] = useState<KpiTargets>(targets);

  const handleSave = () => {
    setTargets(draft);
    onClose();
  };

  const handleReset = () => setDraft(DEFAULT_TARGETS);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full pointer-events-auto overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                  <Target size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-black text-slate-900">Objetivos de KPI</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Umbrales de semaforización</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {FIELDS.map(f => (
                  <div key={f.key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-black text-slate-700">{f.label}</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={draft[f.key]}
                          onChange={e => setDraft({ ...draft, [f.key]: Number(e.target.value) || 0 })}
                          className="w-20 h-8 px-2 text-xs font-black text-right border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                        />
                        {f.suffix && <span className="text-[10px] font-bold text-slate-400 w-4">{f.suffix}</span>}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400">{f.help}</p>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest"
                >
                  <RotateCcw size={12} /> Restaurar default
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 hover:bg-slate-100 uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
