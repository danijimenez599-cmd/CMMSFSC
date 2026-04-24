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
  Plus, Play, Pause, RotateCcw, UserPlus, CheckCircle, XCircle
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
      {/* Industrial Header */}
      <div className="bg-slate-50/50 border-b border-slate-200 px-8 py-6 shrink-0 relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Wrench size={160} />
        </div>

        <div className="flex items-start justify-between gap-6 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-[11px] font-bold text-brand bg-brand/10 px-2 py-1 rounded uppercase tracking-wider">#{wo.woNumber}</span>
              {overdue && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-brand text-white rounded text-[10px] font-bold uppercase tracking-widest animate-pulse shadow-sm">
                  <AlertTriangle size={12} />
                  Vencida
                </div>
              )}
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight line-clamp-2 leading-tight">{wo.title}</h2>
            
            <div className="flex items-center flex-wrap gap-2 mt-4">
              <Badge variant={wo.status as any} dot>{WO_STATUS_LABELS[wo.status]}</Badge>
              <Badge variant={wo.priority === 'critical' ? 'danger' : wo.priority === 'high' ? 'warn' : 'info'}>
                Prioridad: {prioConfig.label}
              </Badge>
              <Badge variant={wo.woType === 'preventive' ? 'ok' : wo.woType === 'corrective' ? 'danger' : 'neutral'}>
                Tipo: {WO_TYPE_LABELS[wo.woType]}
              </Badge>
            </div>
          </div>
          <button
            onClick={() => selectWo(null)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all shadow-sm border border-transparent hover:border-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Technical Data Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group hover:border-brand/30 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={12} className="text-slate-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activo Vinculado</p>
            </div>
            <p className="text-[13px] font-bold text-slate-900 truncate tracking-tight">{asset?.name || '—'}</p>
            <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5 uppercase">{asset?.code || 'S/T'}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-2">
              <User size={12} className="text-slate-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Técnico Asignado</p>
            </div>
            <div className="flex items-center gap-2">
              {assignee ? (
                <>
                  <Avatar name={assignee.fullName} size="xs" />
                  <span className="text-[13px] font-bold text-slate-900 truncate tracking-tight">{assignee.fullName}</span>
                </>
              ) : (
                <span className="text-[13px] font-bold text-slate-400 italic">No asignada</span>
              )}
            </div>
          </div>

          <div className={cn('border rounded-xl p-4 shadow-sm group transition-all', overdue ? 'bg-brand/5 border-brand/20' : 'bg-white border-slate-200')}>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={12} className={overdue ? 'text-brand' : 'text-slate-400'} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha Compromiso</p>
            </div>
            <p className={cn('text-[13px] font-bold tracking-tight', overdue ? 'text-brand' : 'text-slate-900')}>
              {wo.dueDate ? formatDate(wo.dueDate) : '—'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm group">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={12} className="text-slate-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Esfuerzo Est.</p>
            </div>
            <p className="text-[13px] font-bold text-slate-900 tracking-tight">
              {wo.estimatedHours ? `${wo.estimatedHours} Horas Hombre` : 'No definido'}
            </p>
          </div>
        </div>

        {/* Description Box */}
        {wo.description && (
          <div className="mt-6 p-4 bg-slate-900 rounded-xl text-slate-300 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 opacity-50">
              <FileText size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Detalles del Requerimiento</span>
            </div>
            <p className="text-sm font-medium leading-relaxed italic">"{wo.description}"</p>
          </div>
        )}

        {/* Workflow Stepper */}
        {!isCancelled && (
          <div className="mt-8 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progreso del Ciclo de Vida</span>
            </div>
            <div className="flex items-center w-full max-w-2xl">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isCurrent = wo.status === step;
                const isPast = WORKFLOW_STEPS.indexOf(wo.status as any) > idx || isCompleted;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center group relative">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-2',
                        isPast ? 'bg-emerald-500 border-emerald-500 text-white' : 
                        isCurrent ? 'bg-brand border-brand text-white shadow-lg shadow-brand/30 scale-110' : 
                        'bg-white border-slate-200 text-slate-300'
                      )}>
                        {isPast ? <CheckCircle size={16} /> : <span className="text-[11px] font-bold">{idx + 1}</span>}
                      </div>
                      <span className={cn(
                        'absolute -bottom-6 whitespace-nowrap text-[9px] font-bold uppercase tracking-widest transition-colors',
                        isCurrent ? 'text-brand' : isPast ? 'text-emerald-600' : 'text-slate-400'
                      )}>
                        {WO_STATUS_LABELS[step]}
                      </span>
                    </div>
                    {idx < WORKFLOW_STEPS.length - 1 && (
                      <div className="flex-1 h-[2px] mx-2 bg-slate-100 overflow-hidden">
                        <motion.div 
                          className="h-full bg-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: isPast ? '100%' : '0%' }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Workflow Actions */}
        {!isCompleted && !isCancelled && (
          <div className="flex flex-wrap items-center gap-3 mt-12 pt-6 border-t border-slate-200/60 relative">
            {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor') && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white shadow-sm border-slate-200"
                  icon={<UserPlus size={14} />}
                  onClick={() => setShowAssign(!showAssign)}
                >
                  {assignee ? 'Reasignar' : 'Asignar Técnico'}
                  <ChevronDown size={12} className={cn('transition-transform', showAssign && 'rotate-180')} />
                </Button>
                <AnimatePresence>
                  {showAssign && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-[20px] shadow-floating z-[100] py-2 overflow-hidden"
                    >
                      {users.map((u: any) => (
                        <button
                          key={u.id}
                          onClick={() => handleAssign(u.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-slate-50',
                            u.id === wo.assignedTo ? 'bg-brand/[0.03] text-brand' : 'text-slate-600'
                          )}
                        >
                          <Avatar name={u.fullName} size="xs" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold truncate">{u.fullName}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</p>
                          </div>
                          {u.id === wo.assignedTo && <div className="w-1.5 h-1.5 rounded-full bg-brand" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="h-4 w-px bg-slate-200 hidden md:block" />

            {nextStatuses.map((status: string) => {
              const theme = WO_ACTION_THEME[status as any] || { variant: 'outline', icon: 'ArrowRight' };
              const IconComp = {
                Play, Pause, RotateCcw, UserPlus, CheckCircle, XCircle, ArrowRight, CheckSquare
              }[theme.icon] || ArrowRight;

              if (status === 'completed') {
                return (
                  <Button
                    key={status}
                    size="sm"
                    variant="success"
                    className="shadow-lg shadow-green-500/20 border-green-600/20"
                    icon={<IconComp size={14} />}
                    onClick={() => setShowComplete(true)}
                  >
                    {WO_ACTION_LABELS[status as any]}
                  </Button>
                );
              }

              return (
                <Button
                  key={status}
                  size="sm"
                  variant={theme.variant as any}
                  className={cn(
                    'shadow-sm', 
                    theme.variant === 'outline' ? 'bg-white border-slate-200' : 'border-transparent'
                  )}
                  icon={<IconComp size={14} />}
                  onClick={() => handleStatusChange(status)}
                >
                  {WO_ACTION_LABELS[status as any]}
                </Button>
              );
            })}
          </div>
        )}

        {/* Completion Evidence */}
        {isCompleted && (
          <div className="mt-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none rotate-12">
                <ShieldCheck size={120} />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900">Protocolo de Cierre Completado</p>
                  {wo.completedAt && <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Finalizado el {formatDate(wo.completedAt)}</p>}
                </div>
              </div>
              {wo.resolution && (
                <div className="bg-white/80 rounded-xl p-4 border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <MessageSquare size={10} />
                    Reporte de Resolución
                  </p>
                  <p className="text-sm font-medium text-emerald-900/80 leading-relaxed italic">"{wo.resolution}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-8">
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
                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1', sectionTab === t.id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200')}>
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

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={sectionTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl"
          >
            {/* TASKS */}
            {sectionTab === 'tasks' && (
              <div className="space-y-3">
                {woTaskList.length === 0 && (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[24px] p-16 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <ListChecks size={32} className="text-slate-200" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">Sin Protocolo de Tareas</h4>
                    <p className="text-xs text-slate-500 mt-2">No se han definido pasos específicos para esta orden de trabajo.</p>
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
                      task.completed ? 'bg-slate-50/50 border-slate-100' : 'border-slate-200 shadow-sm hover:border-brand/40'
                    )}
                  >
                    <button
                      onClick={() => !isCompleted && toggleTask(wo.id, task.id)}
                      disabled={isCompleted}
                      className={cn(
                        'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all border-2 mt-0.5',
                        task.completed 
                          ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20' 
                          : 'border-slate-200 text-transparent hover:border-brand/40'
                      )}
                    >
                      <CheckSquare size={14} className={cn(!task.completed && 'opacity-0 group-hover:opacity-20')} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-bold tracking-tight leading-relaxed transition-all', task.completed ? 'line-through text-slate-400' : 'text-slate-900')}>
                        {task.description}
                      </p>
                      {task.notes && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-slate-500 italic opacity-80">
                          <Info size={12} />
                          {task.notes}
                        </div>
                      )}
                      {task.completedAt && (
                        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-brand uppercase tracking-widest">
                          <History size={10} />
                          Completado {formatRelative(task.completedAt)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* BITÁCORA */}
            {sectionTab === 'comments' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {commentList.map((c: any) => {
                    const author = users.find((u: any) => u.id === c.authorId);
                    const isMe = author?.id === currentUser?.id;
                    return (
                      <div key={c.id} className={cn('flex gap-4 max-w-[85%]', isMe && 'ml-auto flex-row-reverse')}>
                        <Avatar name={author?.fullName || '?'} size="sm" className="shrink-0 mt-1" />
                        <div className={cn(
                          'p-5 rounded-[24px] shadow-sm relative group',
                          isMe 
                            ? 'bg-brand text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 rounded-tl-none'
                        )}>
                          <div className={cn('flex items-center justify-between mb-2 gap-4', isMe ? 'text-white/80' : 'text-slate-400')}>
                            <span className="text-[10px] font-bold uppercase tracking-widest">{author?.fullName || 'Personal Técnico'}</span>
                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest whitespace-nowrap">{formatRelative(c.createdAt)}</span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed leading-snug">{c.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!isCompleted && !isCancelled && (
                  <div className="sticky bottom-0 bg-white/80 backdrop-blur-md pt-6 pb-2">
                    <div className="flex gap-3 bg-white p-2 border border-slate-200 rounded-[20px] shadow-lg focus-within:border-brand/40 focus-within:ring-4 focus-within:ring-brand/10 transition-all">
                      <input
                        value={commentBody}
                        onChange={e => setCommentBody(e.target.value)}
                        placeholder="Registrar entrada en bitácora..."
                        className="flex-1 bg-transparent px-4 py-2.5 text-sm font-medium outline-none placeholder:text-slate-400"
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleComment())}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        className="rounded-xl px-5"
                        icon={<Send size={16} />}
                        onClick={handleComment}
                        disabled={!commentBody.trim()}
                      >
                        Registrar
                      </Button>
                    </div>
                  </div>
                )}

                {commentList.length === 0 && (
                  <div className="text-center py-10 opacity-30 flex flex-col items-center gap-3">
                    <MessageSquare size={48} className="text-slate-300" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sin entradas en la bitácora técnica</p>
                  </div>
                )}
              </div>
            )}

            {/* SUMINISTROS */}
            {sectionTab === 'parts' && (
              <div className="space-y-8">
                {!isCompleted && !isCancelled && (
                  <div className="bg-slate-900 rounded-[24px] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
                      <Package size={120} className="text-white" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Plus size={14} className="text-brand" />
                        Requerir Insumos del Almacén
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Artículo / Referencia</p>
                          <select
                            value={selectedItemId}
                            onChange={e => setSelectedItemId(e.target.value)}
                            className="w-full h-11 px-4 text-sm font-bold bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-brand transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Buscar en Inventario...</option>
                            {inventoryItems?.map((item: any) => (
                              <option key={item.id} value={item.id} className="bg-slate-900">
                                {item.name} • Stock: {item.stockCurrent} {item.unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Cantidad</p>
                          <input
                            type="number"
                            value={partQty}
                            onChange={e => setPartQty(Number(e.target.value))}
                            min={1}
                            className="w-full h-11 px-4 text-sm font-bold bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-brand transition-all text-center"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="primary"
                            className="w-full h-11"
                            onClick={handleAddPart}
                            disabled={!selectedItemId || partQty < 1}
                          >
                            Consumir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                    <Layers size={14} />
                    Desglose de Materiales Consumidos
                  </h4>
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
                                  <button
                                    onClick={() => removePartUsage(wo.id, usage.id)}
                                    className="text-slate-300 hover:text-brand transition-colors"
                                  >
                                    ✕
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                      <div className="flex items-center gap-2">
                        <DollarSign size={20} className="text-brand" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Inversión Materiales</span>
                      </div>
                      <span className="text-2xl font-display font-bold tracking-tight font-mono text-white">${totalParts.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {partList.length === 0 && (
                  <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                    <Package size={64} className="text-slate-300" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Sin registros de consumo de repuestos</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Complete form modal */}
      {showComplete && (
        <WoCompleteForm
          wo={wo}
          onClose={() => setShowComplete(false)}
        />
      )}
    </div>
  );
}

