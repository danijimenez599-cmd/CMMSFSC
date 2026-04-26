import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store';
import { Badge, Avatar, cn } from '../../../shared/components';
import {
  WO_STATUS_LABELS, WO_TYPE_LABELS, WO_PRIORITY_CONFIG, FAILURE_CODE_LABELS,
} from '../../workorders/utils/statusHelpers';
import { WoStatus } from '../../workorders/types';
import { formatDate } from '../../../shared/utils/utils';
import {
  Search, History, Activity, User, Calendar, CheckSquare, MessageSquare,
  Package, ShieldCheck, Layers, CheckCircle, AlertTriangle, FileText, X, Truck,
} from 'lucide-react';

const TABS = [
  { id: 'tasks',    label: 'Plan de Trabajo', icon: <CheckSquare size={14} /> },
  { id: 'comments', label: 'Bitácora',        icon: <MessageSquare size={14} /> },
  { id: 'parts',    label: 'Suministros',     icon: <Package size={14} /> },
] as const;
type Tab = typeof TABS[number]['id'];

export default function AuditDetailPanel() {
  const {
    assetHistory, workOrders, selectedWoId, selectWo,
    woTasks, woComments, partUsages, assets, users, inventoryItems,
  } = useStore() as any;

  const [tab, setTab] = useState<Tab>('tasks');

  if (!selectedWoId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center bg-slate-50 text-slate-400">
        <Search size={48} className="mb-4 opacity-20" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Seleccione una OT</h4>
        <p className="text-[10px] mt-2 leading-relaxed max-w-xs">
          Haga clic en una orden de la lista para ver sus detalles técnicos, causa raíz y resolución.
        </p>
      </div>
    );
  }

  const wo = [...(assetHistory || []), ...(workOrders || [])].find((w: any) => w.id === selectedWoId);
  if (!wo) return null;

  const asset = assets?.find((a: any) => a.id === wo.assetId);
  const taskList = (woTasks || [])
    .filter((t: any) => t.workOrderId === wo.id)
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  const commentList = (woComments || []).filter((c: any) => c.workOrderId === wo.id);
  const partList = (partUsages || []).filter((p: any) => p.workOrderId === wo.id);

  const prioConfig = WO_PRIORITY_CONFIG[wo.priority] || WO_PRIORITY_CONFIG.medium;
  const completedTaskCount = taskList.filter((t: any) => t.completed).length;
  const totalParts = partList.reduce((sum: number, p: any) => sum + p.quantity * (p.unitCost || 0), 0);
  const totalInvestment = totalParts + (wo.externalServiceCost || 0);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-slate-50 border-b border-slate-200 shrink-0">
        {/* Title row */}
        <div className="px-8 py-4 flex items-start justify-between bg-white gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <span className="font-mono text-[11px] font-bold text-brand bg-brand/10 px-2 py-1 rounded tracking-wider shrink-0 mt-0.5">
              #{wo.woNumber}
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold text-slate-900 truncate tracking-tight leading-tight">
                {wo.title}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-2 flex-wrap">
                {WO_TYPE_LABELS[wo.woType] || wo.woType}
                {wo.pmPlanNameSnapshot && (
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 flex items-center gap-1 font-black">
                    <History size={9} />
                    {wo.pmPlanNameSnapshot}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={wo.status as any} dot>{WO_STATUS_LABELS[wo.status as WoStatus]}</Badge>
            <Badge variant={wo.priority === 'critical' ? 'danger' : wo.priority === 'high' ? 'warn' : 'info'}>
              {prioConfig.label}
            </Badge>
            <button
              onClick={() => selectWo(null)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200 ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Read-only badge */}
        <div className="px-8 pb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-700">
            <ShieldCheck size={11} />
            <span className="text-[9px] font-black uppercase tracking-[0.15em]">Modo Auditoría — Solo Lectura</span>
          </div>
        </div>

        {/* Info grid */}
        <div className="px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 bg-white/50">
          {/* Asset */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              <Activity size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Activo Principal</p>
              <p className="text-[13px] font-bold text-slate-900 truncate tracking-tight">
                {asset?.name || wo.assetNameSnapshot || '—'}
              </p>
              <p className="text-[9px] font-mono font-bold text-slate-400 truncate">{asset?.code || '—'}</p>
            </div>
          </div>

          {/* Assignee / Vendor */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              {wo.vendorNameSnapshot ? <Truck size={18} className="text-brand" /> : <User size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                {wo.vendorNameSnapshot ? 'Contratista / Proveedor' : 'Responsable'}
              </p>
              <p className="text-[13px] font-bold text-slate-900 truncate tracking-tight">
                {wo.vendorNameSnapshot || wo.assignedToNameSnapshot || 'Sin asignar'}
              </p>
              {wo.vendorNameSnapshot && wo.assignedToNameSnapshot && (
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  Supervisión: {wo.assignedToNameSnapshot}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cronología</p>
              {wo.dueDate && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 w-12">Vence:</span>
                  <span className="text-[13px] font-bold text-slate-900 tracking-tight">{formatDate(wo.dueDate)}</span>
                </div>
              )}
              {wo.completedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 w-12">Cierre:</span>
                  <span className="text-[13px] font-bold text-emerald-600 tracking-tight">{formatDate(wo.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-8 shrink-0">
        <div className="flex gap-10">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 py-4 text-[11px] font-bold uppercase tracking-[0.2em] relative transition-all',
                tab === t.id ? 'text-brand' : 'text-slate-400 hover:text-slate-900'
              )}
            >
              {t.icon}
              {t.label}
              {t.id === 'tasks' && taskList.length > 0 && (
                <span className={cn(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1',
                  tab === t.id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-400'
                )}>
                  {completedTaskCount}/{taskList.length}
                </span>
              )}
              {tab === t.id && (
                <motion.div layoutId="auditTabIndicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-brand" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-8 max-w-5xl mx-auto"
          >
            {/* TASKS */}
            {tab === 'tasks' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10 items-start">
                <div className="lg:col-span-2 space-y-3">
                  {taskList.length === 0 && (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[24px] p-16 text-center">
                      <CheckSquare size={32} className="text-slate-200 mx-auto mb-4" />
                      <p className="text-sm font-bold text-slate-400">Sin protocolo de tareas registrado</p>
                    </div>
                  )}
                  {taskList.map((task: any) => (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-start gap-4 bg-white border rounded-2xl p-4',
                        task.completed ? 'bg-slate-50/50 border-slate-100 opacity-70' : 'border-slate-200'
                      )}
                    >
                      <div className={cn(
                        'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border-2 mt-0.5',
                        task.completed ? 'bg-brand border-brand text-white' : 'border-slate-200'
                      )}>
                        {task.completed && <CheckSquare size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-bold tracking-tight leading-relaxed',
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        )}>
                          {task.description}
                        </p>
                        {task.notes && (
                          <p className="text-[11px] font-medium text-slate-500 italic mt-1">{task.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sidebar: specs + service report */}
                <aside className="space-y-6">
                  {wo.description && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                          <FileText size={12} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Especificaciones</span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{wo.description}"</p>
                    </div>
                  )}

                  {(wo.resolution || wo.rootCause || wo.failureCode) && (
                    <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-2xl p-5 space-y-5 shadow-sm">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Reporte de Servicio</span>
                      </div>

                      {wo.resolution && (
                        <div>
                          <p className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-tight mb-1.5 flex items-center gap-1.5">
                            <CheckCircle size={10} /> Resolución
                          </p>
                          <p className="text-[11px] font-medium text-slate-700 leading-relaxed italic border-l-2 border-emerald-200 pl-3 ml-1">
                            "{wo.resolution}"
                          </p>
                        </div>
                      )}

                      {wo.rootCause && (
                        <div className="pt-4 border-t border-emerald-100/40">
                          <p className="text-[9px] font-bold text-amber-600 uppercase tracking-tight mb-1.5 flex items-center gap-1.5">
                            <Layers size={10} /> Causa Raíz
                          </p>
                          <p className="text-[11px] font-medium text-slate-700 leading-relaxed italic border-l-2 border-amber-200 pl-3 ml-1">
                            "{wo.rootCause}"
                          </p>
                        </div>
                      )}

                      {wo.failureCode && (
                        <div className="pt-3 border-t border-emerald-100/40">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center">
                              <AlertTriangle size={8} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-900 uppercase">
                              {FAILURE_CODE_LABELS[wo.failureCode] || wo.failureCode}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </aside>
              </div>
            )}

            {/* COMMENTS */}
            {tab === 'comments' && (
              <div className="space-y-4 pb-10">
                {commentList.length === 0 && (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[24px] p-16 text-center">
                    <MessageSquare size={32} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400">Sin entradas en bitácora</p>
                  </div>
                )}
                {commentList.map((c: any) => {
                  const author = users?.find((u: any) => u.id === c.authorId);
                  return (
                    <div key={c.id} className="flex gap-4 max-w-[85%]">
                      <Avatar name={author?.fullName || '?'} size="sm" className="shrink-0 mt-1" />
                      <div className="p-5 rounded-[24px] shadow-sm bg-white border border-slate-200">
                        <div className="flex items-center gap-4 mb-2 text-slate-400">
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {author?.fullName || 'Desconocido'}
                          </span>
                          <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">
                            {c.createdAt ? formatDate(c.createdAt) : ''}
                          </span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-slate-700">{c.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PARTS */}
            {tab === 'parts' && (
              <div className="space-y-8 pb-10">
                <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-400 uppercase tracking-widest">Referencia</th>
                        <th className="px-6 py-4 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">Uds</th>
                        <th className="px-6 py-4 text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">C. Unitario</th>
                        <th className="px-6 py-4 text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {partList.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                            Sin suministros registrados
                          </td>
                        </tr>
                      )}
                      {partList.map((usage: any) => {
                        const item = inventoryItems?.find((i: any) => i.id === usage.inventoryItemId);
                        return (
                          <tr key={usage.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-[13px] font-bold text-slate-900 tracking-tight">
                                {item?.name || 'Insumo Eliminado'}
                              </p>
                              <p className="text-[9px] font-mono text-slate-400 uppercase">
                                {usage.inventoryItemId.slice(0, 8)}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                                {usage.quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-xs font-bold text-slate-400">
                                ${(usage.unitCost || 0).toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-bold text-slate-900 font-mono">
                                ${(usage.quantity * (usage.unitCost || 0)).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {wo.externalServiceCost > 0 && (
                        <tr className="bg-amber-50/30 border-t-2 border-slate-100">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Truck size={14} className="text-amber-600" />
                              <p className="text-[13px] font-bold text-slate-900">
                                Servicio Externo: {wo.vendorNameSnapshot || 'Proveedor'}
                              </p>
                            </div>
                            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">
                              REF: {wo.externalInvoiceRef || 'S/FACTURA'}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-xs font-bold bg-amber-100 text-slate-900 px-2 py-1 rounded-lg">GLB</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-xs font-bold text-slate-400">
                              ${(wo.externalServiceCost || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-bold text-slate-900 font-mono">
                              ${(wo.externalServiceCost || 0).toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Inversión Total Acumulada</span>
                    <span className="text-2xl font-display font-bold tracking-tight font-mono">${totalInvestment.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
