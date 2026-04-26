import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store';
import { PmPlan, PmTask, TriggerType } from '../types';
import { Button, FormField, Input, Select, Textarea, Badge, AlertBanner, cn } from '../../../shared/components';
import { Plus, Trash2, GripVertical, Calendar, Activity, Zap, Info, Clock, Target } from 'lucide-react';
import { generateId } from '../../../shared/utils/utils';

interface PmPlanFormProps {
  initialPlan?: PmPlan | null;
  initialTasks?: PmTask[];
  onSave: (plan: PmPlan, tasks: PmTask[]) => void;
  onCancel: () => void;
}

export default function PmPlanForm({ initialPlan, initialTasks = [], onSave, onCancel }: PmPlanFormProps) {
  const { measurementConfigs } = useStore() as any;
  const [plan, setPlan] = useState<PmPlan>(initialPlan ?? {
    id: generateId(),
    name: '',
    description: null,
    triggerType: 'calendar',
    intervalValue: 1,
    intervalUnit: 'months',
    intervalMode: 'floating',
    leadDays: 7,
    meterIntervalValue: null,
    meterIntervalUnit: null,
    estimatedDuration: null,
    criticality: 'medium',
    createdAt: new Date().toISOString(),
  });

  const [tasks, setTasks] = useState<PmTask[]>(
    initialTasks.length > 0 ? initialTasks : []
  );
  const [newTaskText, setNewTaskText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setPlan(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : Number(value)) : (value || null),
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    setTasks(prev => [...prev, {
      id: generateId(),
      pmPlanId: plan.id,
      description: newTaskText.trim(),
      sortOrder: prev.length,
      frequencyMultiplier: 1, // Nuevo: default x1
    }]);
    setNewTaskText('');
  };

  const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!plan.name?.trim()) errs.name = 'El nombre es requerido.';
    if ((plan.triggerType === 'calendar' || plan.triggerType === 'hybrid') && !plan.intervalValue) {
      errs.intervalValue = 'Ingresa el intervalo de tiempo.';
    }
    if ((plan.triggerType === 'meter' || plan.triggerType === 'hybrid') && !plan.meterIntervalValue) {
      errs.meterIntervalValue = 'Ingresa el intervalo de uso.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const finalTasks = tasks.map((t, i) => ({ ...t, sortOrder: i }));
    onSave(plan, finalTasks);
  };

  const isMeter = plan.triggerType === 'meter' || plan.triggerType === 'hybrid';
  const isCalendar = plan.triggerType === 'calendar' || plan.triggerType === 'hybrid';

  return (
    <div className="bg-white rounded-[28px] border border-slate-100 shadow-floating overflow-hidden">
      {/* Form header */}
      <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Protocolo de Ingeniería</p>
        <Badge variant="neutral" className="text-[9px] font-black">{plan.id.substring(0, 8)}</Badge>
      </div>

      <div className="p-8 space-y-10">
        {/* Basic info */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Nombre Maestros del Plan" required error={errors.name} className="sm:col-span-2">
              <Input
                name="name"
                value={plan.name}
                onChange={handleChange}
                placeholder="Ej. Overhaul de Compresor de Gas - 8000 HRS"
                className="text-lg font-bold tracking-tight h-12"
                autoFocus
              />
            </FormField>

            <FormField label="Especificaciones Técnicas / Objetivo" className="sm:col-span-2">
              <Textarea
                name="description"
                value={plan.description || ''}
                onChange={handleChange}
                placeholder="Detalle el alcance técnico del mantenimiento..."
                rows={3}
                className="text-sm leading-relaxed"
              />
            </FormField>

            <FormField label="Nivel de Criticidad">
              <Select name="criticality" value={plan.criticality} onChange={handleChange} className="font-bold">
                <option value="critical">CRÍTICA (Misión Crítica)</option>
                <option value="high">ALTA (Producción)</option>
                <option value="medium">MEDIA (Servicios)</option>
                <option value="low">BAJA (Edificios)</option>
              </Select>
            </FormField>

            <FormField label="Horas Hombre Estimas (HH)">
              <Input
                type="number"
                name="estimatedDuration"
                value={plan.estimatedDuration ?? ''}
                onChange={handleChange}
                min={0}
                step={0.5}
                placeholder="4.0"
                suffix={<Clock size={14} />}
                className="font-mono font-bold"
              />
            </FormField>
          </div>
        </section>

        {/* Trigger type */}
        <section>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Arquitectura de Disparo</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['calendar', 'meter', 'hybrid'] as TriggerType[]).map(type => {
              const labels: Record<TriggerType, { icon: React.ReactNode; title: string; sub: string }> = {
                calendar: { icon: <Calendar size={18} />, title: 'Cronológico', sub: 'Basado en tiempo lineal' },
                meter:    { icon: <Activity size={18} />, title: 'Uso / Horómetro', sub: 'Basado en contadores' },
                hybrid:   { icon: <Zap size={18} />, title: 'Híbrido / Mixto', sub: 'Tiempo y uso (el que ocurra primero)' },
              };
              const info = labels[type];
              const isSelected = plan.triggerType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPlan(prev => ({ ...prev, triggerType: type }))}
                  className={cn(
                    'flex flex-col items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden group',
                    isSelected
                      ? 'border-brand bg-brand/5'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  )}
                >
                  {isSelected && (
                    <motion.div layoutId="trigger-bg" className="absolute inset-0 bg-brand/5 -z-10" />
                  )}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                    isSelected ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-slate-50 text-slate-400 group-hover:text-slate-900'
                  )}>
                    {info.icon}
                  </div>
                  <div>
                    <p className={cn('text-sm font-bold tracking-tight', isSelected ? 'text-slate-900' : 'text-slate-500')}>
                      {info.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase mt-1 leading-tight">{info.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Calendar interval */}
        <AnimatePresence>
          {isCalendar && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-6"
            >
              <div className="flex items-center gap-3">
                <Calendar className="text-brand" size={16} />
                <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Frecuencia Cronológica</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <FormField label="Intervalo" error={errors.intervalValue}>
                  <Input
                    type="number"
                    name="intervalValue"
                    value={plan.intervalValue ?? ''}
                    onChange={handleChange}
                    min={1}
                    placeholder="1"
                    className="font-bold font-mono"
                  />
                </FormField>
                <FormField label="Unidad de Tiempo">
                  <Select name="intervalUnit" value={plan.intervalUnit || 'months'} onChange={handleChange} className="font-bold">
                    <option value="days">DÍAS</option>
                    <option value="weeks">SEMANAS</option>
                    <option value="months">MESES</option>
                    <option value="years">AÑOS</option>
                  </Select>
                </FormField>
                <FormField label="Lógica de Recurrencia">
                  <Select name="intervalMode" value={plan.intervalMode} onChange={handleChange} className="font-bold">
                    <option value="floating">FLOTANTE (Desde cierre)</option>
                    <option value="fixed">FIJO (Calendario maestro)</option>
                  </Select>
                </FormField>
              </div>
              <FormField label="Anticipación de Generación (Lead Time Días)">
                <Input
                  type="number"
                  name="leadDays"
                  value={plan.leadDays ?? 7}
                  onChange={handleChange}
                  min={0}
                  max={90}
                  placeholder="7"
                  className="max-w-[140px] font-mono font-bold"
                  suffix={<Target size={14} />}
                />
              </FormField>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meter interval */}
        <AnimatePresence>
          {isMeter && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-6"
            >
              <div className="flex items-center gap-3">
                <Activity className="text-brand" size={16} />
                <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Frecuencia por Uso (Horómetro)</p>
              </div>
              <AlertBanner
                type="info"
                title="Protocolo Acumulativo"
                message="El sistema avanzará el próximo umbral automáticamente (Lectura actual + Intervalo). El horómetro real del activo no es afectado."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField label="Intervalo de Lectura" error={errors.meterIntervalValue}>
                  <Input
                    type="number"
                    name="meterIntervalValue"
                    value={plan.meterIntervalValue ?? ''}
                    onChange={handleChange}
                    min={1}
                    placeholder="250"
                    className="font-bold font-mono text-lg"
                  />
                </FormField>
                <FormField label="Unidad de Medida (Magnitud Acumulativa)" error={errors.meterIntervalUnit}>
                  <Select
                    name="meterIntervalUnit"
                    value={plan.meterIntervalUnit || ''}
                    onChange={handleChange}
                    className="font-bold uppercase tracking-widest"
                  >
                    <option value="">Seleccionar Magnitud...</option>
                    {measurementConfigs
                      .filter((c: any) => c.isCumulative)
                      .map((config: any) => (
                        <option key={config.id} value={config.unit}>
                          {config.name} ({config.unit})
                        </option>
                      ))
                    }
                  </Select>
                  {measurementConfigs.filter((c: any) => c.isCumulative).length === 0 && (
                    <p className="mt-2 text-[10px] text-brand font-bold uppercase animate-pulse">
                      ⚠️ No hay magnitudes acumulativas en el catálogo. Créalas en Ajustes PM.
                    </p>
                  )}
                </FormField>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks checklist */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Checklist de Operaciones</p>
            <Badge variant="brand" className="text-[9px] px-2">{tasks.length} TAREAS</Badge>
          </div>

          <div className="space-y-3 mb-6">
            {tasks.map((task, idx) => (
              <motion.div
                key={task.id}
                layout
                className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl px-4 py-4 group hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <GripVertical size={14} className="text-slate-300 shrink-0 cursor-grab active:cursor-grabbing" />
                <span className="text-[10px] font-mono font-black text-slate-300 w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                <span className="flex-1 text-sm font-medium text-slate-700">{task.description}</span>
                
                {/* Multiplier — free integer input */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">x</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={task.frequencyMultiplier || 1}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, frequencyMultiplier: val } : t));
                    }}
                    className="w-10 bg-transparent text-[10px] font-black text-brand focus:outline-none text-center"
                  />
                </div>

                <button
                  onClick={() => removeTask(task.id)}
                  className="text-slate-300 hover:text-brand opacity-0 group-hover:opacity-100 transition-all p-1"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}

            {tasks.length === 0 && (
              <div className="border-2 border-dashed border-slate-100 rounded-2xl p-10 text-center">
                <Info className="mx-auto text-slate-200 mb-3" size={24} />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Defina las tareas del protocolo abajo</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              placeholder="Descripción de la tarea técnica..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }}
              className="flex-1 h-11"
            />
            <Button
              type="button"
              variant="outline"
              className="h-11 border-slate-200 font-bold px-6 sm:w-auto w-full"
              icon={<Plus size={14} />}
              onClick={addTask}
              disabled={!newTaskText.trim()}
            >
              Agregar
            </Button>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-8 border-t border-slate-100">
          <Button variant="ghost" onClick={onCancel} className="h-12 px-8 font-bold text-slate-400">Descartar</Button>
          <Button variant="primary" onClick={handleSubmit} className="h-12 px-10 font-bold shadow-lg shadow-brand/20">
            {initialPlan ? 'Actualizar Protocolo' : 'Publicar Plan Maestro'}
          </Button>
        </div>
      </div>
    </div>
  );
}
