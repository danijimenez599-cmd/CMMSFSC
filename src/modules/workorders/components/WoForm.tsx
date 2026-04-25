import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store';
import { Modal, Button, FormField, Input, Select, Textarea } from '../../../shared/components';
import { WoInput } from '../types';
import { ClipboardList, AlertCircle, Clock, User, Activity, FileText, Settings } from 'lucide-react';

interface WoFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAssetId?: string;
}

export default function WoForm({ isOpen, onClose, defaultAssetId }: WoFormProps) {
  const { assets, users, createWo, showToast } = useStore() as any;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<WoInput>({
    assetId: defaultAssetId || '',
    title: '',
    description: '',
    woType: 'corrective',
    priority: 'medium',
    assignedTo: null,
    scheduledDate: null,
    dueDate: null,
    estimatedHours: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : Number(value)) : (value || null),
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.assetId) errs.assetId = 'El activo es mandatorio para el registro técnico.';
    if (!form.title?.trim()) errs.title = 'Se requiere un título descriptivo para la orden.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createWo(form);
      showToast({ type: 'success', title: 'ORDEN REGISTRADA', message: `OT para ${form.title} generada correctamente.` });
      onClose();
    } catch (err: any) {
      showToast({ type: 'error', title: 'FALLO EN REGISTRO', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const sortedAssets = [...assets].sort((a: any, b: any) => a.name.localeCompare(b.name));

  return (
    <Modal
      isOpen={isOpen}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
            <ClipboardList size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Nueva Orden de Trabajo</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Registro de Mantenimiento</p>
          </div>
        </div>
      }
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="ghost" className="flex-1 sm:flex-none font-bold uppercase tracking-widest text-[11px]" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" className="flex-1 sm:flex-none font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-brand/20" onClick={handleSubmit} loading={loading}>
            Generar OT
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-2">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5"
        >
          {/* Main Info */}
          <div className="sm:col-span-2 space-y-5 bg-slate-50 p-6 rounded-[24px] border border-slate-100">
            <FormField 
              label={<span className="flex items-center gap-2"><Activity size={12} className="text-brand"/>Activo Industrial</span>} 
              required 
              error={errors.assetId}
            >
              <Select 
                name="assetId" 
                value={form.assetId} 
                onChange={handleChange}
                className="bg-white font-bold text-sm h-11"
              >
                <option value="">Seleccione el equipo o ubicación...</option>
                {sortedAssets.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name} {a.code ? `[${a.code}]` : ''}</option>
                ))}
              </Select>
            </FormField>

            <FormField 
              label={<span className="flex items-center gap-2"><FileText size={12} className="text-brand"/>Título del Requerimiento</span>} 
              required 
              error={errors.title}
            >
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ej. Vibración excesiva en rodamiento principal"
                className="bg-white font-bold text-sm h-11"
                autoFocus
              />
            </FormField>
          </div>

          {/* Classification */}
          <div className="space-y-5">
            <FormField label={<span className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><Settings size={12}/>Tipo de Intervención</span>}>
              <Select name="woType" value={form.woType} onChange={handleChange} className="font-bold text-sm h-11">
                <option value="corrective">CORRECTIVA</option>
                <option value="preventive">PREVENTIVA</option>
                <option value="predictive">PREDICTIVA</option>
                <option value="inspection">INSPECCIÓN</option>
              </Select>
            </FormField>

            <FormField label={<span className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><AlertCircle size={12}/>Nivel de Prioridad</span>}>
              <Select name="priority" value={form.priority} onChange={handleChange} className="font-bold text-sm h-11">
                <option value="critical">CRÍTICA (PRODUCCIÓN DETENIDA)</option>
                <option value="high">ALTA (RIESGO INMINENTE)</option>
                <option value="medium">MEDIA (ESTÁNDAR)</option>
                <option value="low">BAJA (PROGRAMABLE)</option>
              </Select>
            </FormField>
          </div>

          {/* Logistics */}
          <div className="space-y-5">
            <FormField label={<span className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><User size={12}/>Técnico Responsable</span>}>
              <Select name="assignedTo" value={form.assignedTo || ''} onChange={handleChange} className="font-bold text-sm h-11">
                <option value="">SIN ASIGNAR (POOL)</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.fullName.toUpperCase()} • {u.role.toUpperCase()}</option>
                ))}
              </Select>
            </FormField>

            <FormField label={<span className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><Clock size={12}/>Esfuerzo Estimado (Horas)</span>}>
              <Input
                type="number"
                name="estimatedHours"
                value={form.estimatedHours ?? ''}
                onChange={handleChange}
                min={0}
                step={0.5}
                placeholder="Ej. 4.0"
                className="font-bold text-sm h-11 text-center"
              />
            </FormField>
          </div>

          {/* Dates */}
          <div className="bg-slate-900/5 p-5 rounded-[20px] border border-slate-900/10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:col-span-2">
            <FormField label={<span className="font-bold uppercase tracking-widest text-[9px] text-slate-500">Fecha Programada</span>}>
              <Input type="date" name="scheduledDate" value={form.scheduledDate || ''} onChange={handleChange} className="bg-white font-bold text-xs h-10 border-transparent shadow-sm" />
            </FormField>

            <FormField label={<span className="font-bold uppercase tracking-widest text-[9px] text-slate-500">Fecha Límite</span>}>
              <Input type="date" name="dueDate" value={form.dueDate || ''} onChange={handleChange} className="bg-white font-bold text-xs h-10 border-transparent shadow-sm" />
            </FormField>
          </div>

          {/* Description */}
          <FormField label={<span className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><FileText size={12}/>Especificaciones Técnicas</span>} className="sm:col-span-2">
            <Textarea
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              rows={4}
              placeholder="Detalle el protocolo de seguridad, herramientas requeridas o síntomas técnicos observados..."
              className="font-medium text-sm p-4 rounded-2xl"
            />
          </FormField>
        </motion.div>
      </form>
    </Modal>
  );
}

