import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store';
import { Modal, Button, FormField, Input, Select, Textarea, AlertBanner } from '../../../shared/components';
import { WorkOrder, CompletePayload } from '../types';
import { Gauge, CheckCircle2, AlertTriangle, Clock, History, FileCheck, Layers, Truck } from 'lucide-react';

interface WoCompleteFormProps {
  wo: WorkOrder;
  onClose: () => void;
}

export default function WoCompleteForm({ wo, onClose }: WoCompleteFormProps) {
  const store = useStore() as any;
  const { completeWo, showToast, assetPlans = [], measurementPoints = [] } = store;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [meterValueInput, setMeterValueInput] = useState('');

  const [formData, setFormData] = useState<CompletePayload>({
    actualHours: wo.estimatedHours || null,
    failureCode: '',
    rootCause: '',
    resolution: '',
  });

  // Find linked asset plan and measurement point
  const linkedPlan = wo.assetPlanId
    ? assetPlans.find((ap: any) => ap.id === wo.assetPlanId)
    : null;
  const linkedPoint = linkedPlan?.measurementPointId
    ? measurementPoints.find((mp: any) => mp.id === linkedPlan.measurementPointId)
    : null;
  const isMeterBased = linkedPlan && (
    // Check the pm plan trigger type from store
    store.pmPlans?.find((p: any) => p.id === linkedPlan.pmPlanId)?.triggerType !== 'calendar'
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.resolution || formData.resolution.trim().length < 10) {
      newErrors.resolution = 'El reporte técnico de resolución debe ser más detallado (min. 10 car.).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const meterVal = meterValueInput ? parseFloat(meterValueInput) : undefined;
      await completeWo(wo.id, formData, meterVal);
      showToast({
        type: 'success',
        title: 'CIERRE TÉCNICO EXITOSO',
        message: 'Protocolo de resolución registrado y ciclos preventivos actualizados.',
      });
      onClose();
    } catch (err: any) {
      showToast({ type: 'error', title: 'FALLO EN CIERRE', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <FileCheck size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Protocolo de Cierre Técnico</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Orden de Trabajo: {wo.woNumber}</p>
          </div>
        </div>
      }
      onClose={onClose}
      footer={
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="ghost" className="flex-1 sm:flex-none font-bold uppercase tracking-widest text-[11px]" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="success" className="flex-1 sm:flex-none font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20" onClick={handleSubmit} loading={loading}>
            Certificar y Cerrar OT
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="p-2 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
              <History size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumen de Actividad</p>
              <h4 className="text-sm font-bold text-slate-900 truncate max-w-[240px]">{wo.title}</h4>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Presupuesto</p>
            <p className="text-xs font-mono font-bold text-brand">{wo.estimatedHours || 0} H/H</p>
          </div>
        </motion.div>

        {/* Resolution (required) */}
        <FormField
          label={<span className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] text-slate-400"><CheckCircle2 size={12} className="text-emerald-500"/>Reporte de Resolución</span>}
          required
          error={errors.resolution}
          hint={<span className="text-[9px] font-bold uppercase opacity-40">{formData.resolution.length} caracteres</span>}
        >
          <Textarea
            name="resolution"
            value={formData.resolution}
            onChange={handleChange}
            placeholder="Describa detalladamente el procedimiento técnico aplicado, ajustes efectuados y pruebas de funcionamiento..."
            className="p-5 rounded-2xl font-medium text-sm border-slate-200 focus:ring-emerald-500/10 focus:border-emerald-500"
            rows={5}
            autoFocus
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label={<span className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] text-slate-400"><Clock size={12}/>Horas Reales Invertidas</span>}>
            <Input
              type="number"
              name="actualHours"
              value={formData.actualHours || ''}
              onChange={handleChange}
              min={0}
              step={0.5}
              placeholder={wo.estimatedHours ? String(wo.estimatedHours) : '0.0'}
              className="font-bold text-sm h-11 text-center bg-slate-50 border-slate-200"
            />
          </FormField>

          <FormField label={<span className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] text-slate-400"><AlertTriangle size={12}/>Codificación de Fallo</span>}>
            <Select 
              name="failureCode" 
              value={formData.failureCode || ''} 
              onChange={handleChange}
              className="font-bold text-sm h-11 bg-slate-50 border-slate-200"
            >
              <option value="">SIN CODIFICACIÓN</option>
              <option value="FC-LUB">FC-LUB • FALLO LUBRICACIÓN</option>
              <option value="FC-ELC">FC-ELC • FALLA ELÉCTRICA</option>
              <option value="FC-MEC">FC-MEC • DESGASTE MECÁNICO</option>
              <option value="FC-CAL">FC-CAL • DESCALIBRACIÓN</option>
              <option value="FC-VIB">FC-VIB • VIBRACIÓN EXCESIVA</option>
              <option value="FC-TEM">FC-TEM • TEMPERATURA CRÍTICA</option>
              <option value="FC-OTH">FC-OTH • OTROS FACTORES</option>
            </Select>
          </FormField>
        </div>

        <FormField label={<span className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] text-slate-400"><Layers size={12}/>Análisis de Causa Raíz</span>}>
          <Textarea
            name="rootCause"
            value={formData.rootCause || ''}
            onChange={handleChange}
            placeholder="Identifique el origen técnico del problema para evitar recurrencias..."
            className="p-4 rounded-xl font-medium text-sm border-slate-200"
            rows={2}
          />
        </FormField>

        {/* EXTERNAL SERVICES SECTION */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Servicios Externos y Subcontratación</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label={<span className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Proveedor / Empresa</span>}>
              <Select
                name="vendorId"
                value={formData.vendorId || ''}
                onChange={handleChange}
                className="font-bold text-sm h-11 bg-slate-50 border-slate-200"
              >
                <option value="">MANO DE OBRA INTERNA</option>
                {store.vendors?.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label={<span className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Costo Facturado</span>}>
                <Input
                  type="number"
                  name="externalServiceCost"
                  value={formData.externalServiceCost || ''}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="font-bold text-sm h-11 text-center bg-slate-50 border-slate-200"
                />
              </FormField>
              <FormField label={<span className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Referencia Factura</span>}>
                <Input
                  name="externalInvoiceRef"
                  value={formData.externalInvoiceRef || ''}
                  onChange={handleChange}
                  placeholder="Factura #"
                  className="font-bold text-sm h-11 bg-slate-50 border-slate-200"
                />
              </FormField>
            </div>
          </div>
          <p className="text-[9px] font-medium text-slate-400 mt-2 italic">* Registre el costo de servicios externos. Este monto se sumará al total de repuestos de la OT.</p>
        </div>

        {/* Meter reading at completion (for meter-based PMs) */}
        {isMeterBased && linkedPoint && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 pt-4 border-t border-slate-100"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <Gauge size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">Sincronización de Odómetro / Horómetro</p>
                <p className="text-[11px] font-medium text-blue-700 mt-1 leading-relaxed">
                  Esta orden pertenece a un plan basado en uso. Registre la lectura actual de <strong>{linkedPoint.name}</strong> para recalcular el próximo ciclo técnico.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Última Lectura Registrada</p>
                <p className="text-lg font-mono font-bold text-white tracking-tight">{linkedPoint.currentValue} <span className="text-slate-500 text-xs">{linkedPoint.unit}</span></p>
              </div>
              <div className="w-full sm:w-48">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Lectura de Cierre</p>
                <Input
                  type="number"
                  value={meterValueInput}
                  onChange={e => setMeterValueInput(e.target.value)}
                  placeholder="0.00"
                  className="bg-white/10 border-white/10 text-white font-mono font-bold text-center text-lg h-12 focus:ring-white/20 focus:border-white/40"
                  step="any"
                />
              </div>
            </div>
          </motion.div>
        )}
      </form>
    </Modal>
  );
}

