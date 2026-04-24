import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store';
import { Badge, Button, Avatar, cn, AlertBanner } from '../../../shared/components';
import { 
  WO_STATUS_LABELS, WO_TYPE_LABELS, WO_PRIORITY_CONFIG, 
  isOverdue, getNextStatuses, WO_ACTION_LABELS, WO_ACTION_THEME 
} from '../utils/statusHelpers';
import { formatDate, formatRelative, generateId } from '../../../shared/utils/generateId';
import {
  CheckSquare, Square, Send, Clock, User,
  Wrench, Package, MessageSquare, ChevronDown, AlertTriangle,
  History, Settings, Activity, Gauge, DollarSign, Briefcase,
  FileText, ArrowRight, ShieldCheck, Shield, Layers, Info, ListChecks,
  Plus, Play, Pause, RotateCcw, UserPlus, CheckCircle, XCircle, X, Calendar
} from 'lucide-react';
import WoCompleteForm from './WoCompleteForm';

const WORKFLOW_STEPS = ['open', 'assigned', 'in_progress', 'completed'] as const;

const SECTION_TABS = [
  { id: 'tasks', label: 'Plan de Trabajo', icon: <CheckSquare size={14} /> },
  { id: 'comments', label: 'Bitácora', icon: <MessageSquare size={14} /> },
  { id: 'parts', label: 'Suministros', icon: <Package size={14} /> },
] as const;
type SectionTab = typeof SECTION_TABS[number]['id'];

export default function WoDetailPanel() {
  const store = useStore() as any;
  const {
    workOrders, woTasks, woComments, partUsages,
    selectedWoId, selectWo, users, assets, inventoryItems,
    currentUser, updateWoStatus, assignWo, toggleTask,
    addComment, addPartUsage, removePartUsage,
    showToast,
  } = store;

  const [sectionTab, setSectionTab] = useState<SectionTab>('tasks');
  const [commentBody, setCommentBody] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [partQty, setPartQty] = useState(1);

  if (!selectedWoId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-50/30 p-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-[24px] bg-white border border-slate-200 shadow-floating flex items-center justify-center mx-auto mb-6">
            <Wrench size={32} className="text-slate-300" />
          </div>
          <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight">Centro de Operaciones</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">Seleccione una orden de trabajo para gestionar tareas, asignar recursos y monitorear el progreso técnico en tiempo real.</p>
        </motion.div>
      </div>
    );
  }

  const wo = workOrders.find((w: any) => w.id === selectedWoId);
  if (!wo) return null;

  const asset = assets.find((a: any) => a.id === wo.assetId);
  const assignee = users.find((u: any) => u.id === wo.assignedTo);
  const creator = users.find((u: any) => u.id === wo.createdBy);
  const woTaskList = woTasks.filter((t: any) => t.workOrderId === wo.id).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  const commentList = woComments.filter((c: any) => c.workOrderId === wo.id);
  const partList = partUsages.filter((p: any) => p.workOrderId === wo.id);

  const isAssignee = wo.assignedTo === currentUser?.id;
  const nextStatuses = getNextStatuses(wo.status, currentUser?.role, isAssignee);
  const isCompleted = wo.status === 'completed';
  const isCancelled = wo.status === 'cancelled';
  const overdue = isOverdue(wo);
  const completedTaskCount = woTaskList.filter((t: any) => t.completed).length;
  const totalParts = partList.reduce((sum: number, p: any) => sum + (p.quantity * (p.unitCost || 0)), 0);

  const handleStatusChange = async (status: string) => {
    try {
      await updateWoStatus(wo.id, status, {
        startedAt: status === 'in_progress' ? new Date().toISOString() : undefined,
      });
      showToast({ type: 'success', title: 'Estado actualizado' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleAssign = async (userId: string) => {
    try {
      await assignWo(wo.id, userId);
      setShowAssign(false);
      showToast({ type: 'success', title: 'Técnico asignado' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleComment = async () => {
    if (!commentBody.trim()) return;
    await addComment(wo.id, commentBody.trim());
    setCommentBody('');
  };

  const handleAddPart = async () => {
    if (!selectedItemId || partQty < 1) return;
    try {
      await addPartUsage(wo.id, selectedItemId, partQty);
      setSelectedItemId('');
      setPartQty(1);
      showToast({ type: 'success', title: 'Repuesto registrado' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const prioConfig = WO_PRIORITY_CONFIG[wo.priority] || WO_PRIORITY_CONFIG.medium;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* 1. Header Industrial Pro */}
      <div className="bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="px-8 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4 min-w-0">
            <span className="font-mono text-[11px] font-bold text-brand bg-brand/10 px-2 py-1 rounded tracking-wider shrink-0">#{wo.woNumber}</span>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold text-slate-900 truncate tracking-tight leading-tight">{wo.title}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{WO_TYPE_LABELS[wo.woType]} • {wo.assetPlanId ? 'Planificado' : 'Manual'}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Badge variant={wo.status as any} dot>{WO_STATUS_LABELS[wo.status]}</Badge>
              <Badge variant={wo.priority === 'critical' ? 'danger' : wo.priority === 'high' ? 'warn' : 'info'}>
                {prioConfig.label}
              </Badge>
            </div>
          </div>
          <button
            onClick={() => selectWo(null)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Full Info Grid */}
        <div className="px-8 py-5 grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-slate-100 bg-white/50">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><Activity size={18} /></div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Activo Principal</p>
                <p className="text-[13px] font-bold text-slate-900 truncate tracking-tight">{asset?.name || '—'}</p>
                <p className="text-[9px] font-mono font-bold text-slate-400 truncate">{asset?.code || 'S/CODE'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><User size={18} /></div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Responsable</p>
                {assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar name={assignee.fullName} size="xs" />
                    <span className="text-[13px] font-bold text-slate-900 truncate">{assignee.fullName}</span>
                  </div>
                ) : (
                  <span className="text-[13px] font-bold text-slate-400 italic">No asignado</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', overdue ? 'bg-brand/10 text-brand' : 'bg-slate-100 text-slate-500')}>
                <Calendar size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Vencimiento</p>
                <p className={cn('text-[13px] font-bold tracking-tight', overdue ? 'text-brand' : 'text-slate-900')}>
                  {wo.dueDate ? formatDate(wo.dueDate) : '—'}
                </p>
                <p className="text-[9px] font-bold text-slate-400">Creada: {formatDate(wo.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-2">
            {!isCompleted && !isCancelled ? (
              <>
                <div className="flex items-center gap-2">
                  {nextStatuses.map((status: string) => {
                    const theme = WO_ACTION_THEME[status as any] || { variant: 'outline', icon: 'ArrowRight' };
                    return (
                      <Button
                        key={status}
                        size="sm"
                        variant={status === 'completed' ? 'success' : theme.variant as any}
                        className="flex-1"
                        onClick={() => status === 'completed' ? setShowComplete(true) : handleStatusChange(status)}
                      >
                        {WO_ACTION_LABELS[status as any]}
                      </Button>
                    );
                  })}
                </div>
                {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor') && (
                  <Button variant="ghost" size="xs" className="text-slate-400 hover:text-brand" onClick={() => setShowAssign(true)} icon={<UserPlus size={14} />}>
                    Reasignar Personal
                  </Button>
                )}
              </>
            ) : (
              <div className="bg-slate-100 rounded-lg px-4 py-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Orden Cerrada</span>
                {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor') && (
                  <button onClick={() => handleStatusChange('open')} className="text-[10px] font-bold text-brand hover:underline">Re-abrir Orden</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stepper y Ruta de Control */}
        {!isCancelled && (
          <div className="px-8 py-3 bg-slate-50/80 flex items-center gap-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck size={14} />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Ruta de Control:</span>
            </div>
            <div className="flex items-center gap-3 flex-1 overflow-x-auto no-scrollbar">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isCurrent = wo.status === step;
                const isPast = WORKFLOW_STEPS.indexOf(wo.status as any) > idx || isCompleted;
                return (
                  <React.Fragment key={step}>
                    <div className={cn(
                      'flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap',
                      isCurrent ? 'bg-brand text-white shadow-lg shadow-brand/20' : isPast ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300'
                    )}>
                      <div className={cn('w-1.5 h-1.5 rounded-full', isCurrent ? 'bg-white animate-pulse' : isPast ? 'bg-emerald-500' : 'bg-slate-200')} />
                      {WO_STATUS_LABELS[step]}
                    </div>
                    {idx < WORKFLOW_STEPS.length - 1 && <div className="h-px w-6 bg-slate-200 shrink-0" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Reporte de Resolución (Si existe) */}
        {isCompleted && wo.resolution && (
          <div className="px-8 py-3 bg-emerald-50/50 border-t border-emerald-100 flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5"><CheckCircle size={14} /></div>
            <div>
              <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mb-0.5">Reporte de Cierre</p>
              <p className="text-xs font-medium text-slate-700 italic">"{wo.resolution}"</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-8 shrink-0">
        <div className="flex gap-10">
          {SECTION_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setSectionTab(t.id)}
              className={cn(
                'flex items-center gap-2 py-4 text-[11px] font-bold uppercase tracking-[0.2em] relative transition-all group',
                sectionTab === t.id ? 'text-brand' : 'text-slate-400 hover:text-slate-900'
              )}
            >
              {t.icon}
              {t.label}
              {t.id === 'tasks' && woTaskList.length > 0 && (
                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1', sectionTab === t.id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-400')}>
                  {completedTaskCount}/{woTaskList.length}
                </span>
              )}
              {sectionTab === t.id && (
                <motion.div layoutId="detailTabIndicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-brand" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tab Content (Expandido) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={sectionTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-8 max-w-5xl mx-auto"
          >
            {/* TASKS */}
            {sectionTab === 'tasks' && (
              <div className="space-y-3 pb-10">
                {woTaskList.length === 0 && (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[24px] p-16 text-center">
                    <ListChecks size={32} className="text-slate-200 mx-auto mb-4" />
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">Sin Protocolo de Tareas</h4>
                  </div>
                )}
                {woTaskList.map((task: any, idx: number) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      'flex items-start gap-4 bg-white border rounded-2xl p-4 transition-all group',
                      task.completed ? 'bg-slate-50/50 border-slate-100 opacity-70' : 'border-slate-200 shadow-sm hover:border-brand/40'
                    )}
                  >
                    <button
                      onClick={() => !isCompleted && toggleTask(wo.id, task.id)}
                      disabled={isCompleted}
                      className={cn(
                        'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all border-2 mt-0.5',
                        task.completed ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20' : 'border-slate-200 text-transparent hover:border-brand/40'
                      )}
                    >
                      <CheckSquare size={14} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-bold tracking-tight leading-relaxed', task.completed ? 'line-through text-slate-400' : 'text-slate-900')}>
                        {task.description}
                      </p>
                      {task.notes && <p className="text-[11px] font-medium text-slate-500 italic mt-1">{task.notes}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* BITÁCORA */}
            {sectionTab === 'comments' && (
              <div className="space-y-6 pb-20">
                <div className="space-y-4">
                  {commentList.map((c: any) => {
                    const author = users.find((u: any) => u.id === c.authorId);
                    const isMe = author?.id === currentUser?.id;
                    return (
                      <div key={c.id} className={cn('flex gap-4 max-w-[85%]', isMe && 'ml-auto flex-row-reverse')}>
                        <Avatar name={author?.fullName || '?'} size="sm" className="shrink-0 mt-1" />
                        <div className={cn('p-5 rounded-[24px] shadow-sm', isMe ? 'bg-brand text-white' : 'bg-white border border-slate-200')}>
                          <div className={cn('flex items-center gap-4 mb-2', isMe ? 'text-white/80' : 'text-slate-400')}>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{author?.fullName}</span>
                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{formatRelative(c.createdAt)}</span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed">{c.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!isCompleted && !isCancelled && (
                  <div className="sticky bottom-0 bg-white/80 backdrop-blur-md pt-6 pb-2">
                    <div className="flex gap-3 bg-white p-2 border border-slate-200 rounded-[20px] shadow-lg focus-within:border-brand/40 transition-all">
                      <input
                        value={commentBody}
                        onChange={e => setCommentBody(e.target.value)}
                        placeholder="Registrar entrada en bitácora..."
                        className="flex-1 bg-transparent px-4 py-2.5 text-sm font-medium outline-none"
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleComment())}
                      />
                      <Button variant="primary" size="sm" icon={<Send size={16} />} onClick={handleComment} disabled={!commentBody.trim()}>
                        Registrar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUMINISTROS */}
            {sectionTab === 'parts' && (
              <div className="space-y-8 pb-10">
                {!isCompleted && !isCancelled && (
                  <div className="bg-slate-900 rounded-[24px] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
                      <Package size={120} className="text-white" />
                    </div>
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Insumo del Almacén</p>
                        <select
                          value={selectedItemId}
                          onChange={e => setSelectedItemId(e.target.value)}
                          className="w-full h-11 px-4 text-sm font-bold bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-brand transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Buscar en Inventario...</option>
                          {inventoryItems?.map((item: any) => (
                            <option key={item.id} value={item.id} className="bg-slate-900">{item.name} • Stock: {item.stockCurrent} {item.unit}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Cantidad</p>
                        <input
                          type="number" value={partQty} onChange={e => setPartQty(Number(e.target.value))}
                          min={1} className="w-full h-11 px-4 text-sm font-bold bg-slate-800 border border-slate-700 rounded-xl text-white text-center outline-none focus:border-brand"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button variant="primary" className="w-full h-11" onClick={handleAddPart} disabled={!selectedItemId || partQty < 1}>
                          Consumir
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-400 uppercase tracking-widest">Referencia</th>
                        <th className="px-6 py-4 text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">Uds</th>
                        <th className="px-6 py-4 text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">C. Unitario</th>
                        <th className="px-6 py-4 text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">Subtotal</th>
                        {!isCompleted && <th className="px-6 py-4 w-10"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {partList.map((usage: any) => {
                        const item = inventoryItems?.find((i: any) => i.id === usage.inventoryItemId);
                        return (
                          <tr key={usage.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-[13px] font-bold text-slate-900 tracking-tight">{item?.name || 'Insumo Eliminado'}</p>
                              <p className="text-[9px] font-mono text-slate-400 uppercase">{usage.inventoryItemId.slice(0, 8)}</p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">{usage.quantity}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-xs font-bold text-slate-400">${(usage.unitCost || 0).toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-bold text-slate-900 font-mono">${(usage.quantity * (usage.unitCost || 0)).toFixed(2)}</span>
                            </td>
                            {!isCompleted && (
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => removePartUsage(wo.id, usage.id)} className="text-slate-300 hover:text-brand transition-colors">✕</button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Inversión Total</span>
                    <span className="text-2xl font-display font-bold tracking-tight font-mono text-white">${totalParts.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modales */}
      {showComplete && <WoCompleteForm wo={wo} onClose={() => setShowComplete(false)} />}
      <AnimatePresence>
        {showAssign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl py-4">
              <div className="px-4 pb-4 border-b border-slate-100 mb-2 flex justify-between items-center">
                <h3 className="font-bold text-sm">Asignar Técnico</h3>
                <button onClick={() => setShowAssign(false)} className="text-slate-400 hover:text-slate-900">✕</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {users.map((u: any) => (
                  <button key={u.id} onClick={() => handleAssign(u.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-all">
                    <Avatar name={u.fullName} size="sm" />
                    <div>
                      <p className="text-xs font-bold">{u.fullName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

