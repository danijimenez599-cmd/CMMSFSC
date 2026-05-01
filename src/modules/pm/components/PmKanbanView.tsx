import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, startOfMonth, endOfMonth, startOfDay, endOfDay,
  parseISO, isValid, isSameDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Clock, Activity, Target, Filter, Sparkles, AlertTriangle,
  CheckCircle2, Calendar as CalendarIcon, LayoutList, Wrench, Pause
} from 'lucide-react';
import { useStore } from '../../../store';
import { cn, Badge } from '../../../shared/components';
import { calculateProjections } from '../utils/projections';

const safeLocale = es || undefined;

// ── Helpers ──────────────────────────────────────────────────────────────────

function isOverdueEvent(e: any, today: Date): boolean {
  if (e.type === 'projection') return e.date !== null && e.date < today;
  return (
    e.type === 'wo' &&
    !['completed', 'cancelled'].includes(e.status) &&
    e.date < today
  );
}

function getDescendantIds(rootId: string, assets: any[]): Set<string> {
  const ids = new Set<string>();
  const queue = [rootId];
  while (queue.length) {
    const cur = queue.shift()!;
    ids.add(cur);
    assets.filter((a: any) => a.parentId === cur).forEach((a: any) => queue.push(a.id));
  }
  return ids;
}

// ── Event style ───────────────────────────────────────────────────────────────

interface EventStyle {
  card: string;
  stripe: string;
  stripeExtra?: string;
  badge: string;
  badgeLabel: string;
  isOverdue: boolean;
  isGhost: boolean;
}

function getEventStyle(e: any, today: Date): EventStyle {
  const isProjection = e.type === 'projection';
  const isCompleted = e.status === 'completed';
  const isInProgress = e.status === 'in_progress';
  const isCorrective = e.woType === 'corrective';
  const overdue = isOverdueEvent(e, today);

  if (isProjection) {
    return {
      card: overdue
        ? 'bg-work-overdue-bg border-dashed border-work-overdue-border'
        : 'bg-work-projection-bg border-dashed border-work-projection-border',
      stripe: overdue
        ? 'bg-gradient-to-b from-work-overdue via-work-overdue-border to-transparent'
        : 'bg-gradient-to-b from-work-projection via-work-projection-border to-transparent',
      badge: overdue
        ? 'bg-work-overdue-bg text-work-overdue border border-work-overdue-border'
        : 'bg-work-projection-bg text-work-projection border border-work-projection-border',
      badgeLabel: 'PLAN',
      isOverdue: overdue,
      isGhost: true,
    };
  }

  if (isCompleted) {
    return {
      card: 'bg-work-completed-bg border-work-completed-border',
      stripe: 'bg-work-completed',
      badge: 'bg-work-completed-bg text-work-completed',
      badgeLabel: isCorrective ? 'CORREC' : 'PREV',
      isOverdue: false,
      isGhost: false,
    };
  }

  if (isCorrective) {
    return {
      card: overdue ? 'bg-work-overdue-bg border-work-overdue-border' : 'bg-work-corrective-bg border-work-corrective-border',
      stripe: overdue ? 'bg-work-overdue' : 'bg-work-corrective',
      badge: overdue ? 'bg-work-overdue-bg text-work-overdue' : 'bg-work-corrective-bg text-work-corrective',
      badgeLabel: 'CORREC',
      isOverdue: overdue,
      isGhost: false,
    };
  }

  // preventive / predictive / inspection
  return {
    card: overdue ? 'bg-work-overdue-bg border-work-overdue-border' : 'bg-work-preventive-bg border-work-preventive-border',
    stripe: overdue ? 'bg-work-overdue' : 'bg-work-preventive',
    stripeExtra: isInProgress && !overdue ? 'bg-work-completed' : undefined,
    badge: overdue ? 'bg-work-overdue-bg text-work-overdue' : 'bg-work-preventive-bg text-work-preventive',
    badgeLabel: 'PREV',
    isOverdue: overdue,
    isGhost: false,
  };
}

// ── Column breakdown ──────────────────────────────────────────────────────────

function ColumnBreakdown({ events, today }: { events: any[]; today: Date }) {
  if (events.length === 0) return null;
  const corrective = events.filter(e => e.type === 'wo' && e.woType === 'corrective').length;
  const preventive = events.filter(e => e.type === 'wo' && e.woType !== 'corrective').length;
  const projections = events.filter(e => e.type === 'projection').length;
  const overdue = events.filter(e => isOverdueEvent(e, today)).length;

  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
      {corrective > 0 && (
        <span className="text-[8px] font-black text-work-corrective bg-work-corrective-bg px-1.5 py-0.5 rounded-md uppercase">
          {corrective} correc
        </span>
      )}
      {preventive > 0 && (
        <span className="text-[8px] font-black text-work-preventive bg-work-preventive-bg px-1.5 py-0.5 rounded-md uppercase">
          {preventive} prev
        </span>
      )}
      {projections > 0 && (
        <span className="text-[8px] font-black text-work-projection bg-work-projection-bg px-1.5 py-0.5 rounded-md uppercase">
          {projections} plan
        </span>
      )}
      {overdue > 0 && (
        <span className="text-[8px] font-black text-work-overdue bg-work-overdue-bg px-1.5 py-0.5 rounded-md uppercase flex items-center gap-0.5">
          <AlertTriangle size={7} /> {overdue} venc
        </span>
      )}
    </div>
  );
}

// ── Event Detail Panel ────────────────────────────────────────────────────────

function EventDetailPanel({ event, today, onClose, onAction }: any) {
  if (!event) return null;
  const isWo = event.type === 'wo';
  const style = getEventStyle(event, today);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
      />
      <motion.div
        key="panel"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[110] border-l border-slate-200 flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md shrink-0">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              {isWo ? 'GESTIÓN OPERATIVA' : 'ANÁLISIS DE INGENIERÍA'}
            </p>
            <h3 className="font-display font-black text-slate-900 text-lg">
              {isWo ? 'Orden de Trabajo' : 'Proyección Predictiva'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all border border-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-none">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={isWo ? (event.status as any) : 'brand'} className="uppercase text-[9px] font-black px-3 py-1">
                {isWo ? event.status : 'SIMULACIÓN'}
              </Badge>
              {!isWo && (
                <Badge variant="neutral" className="text-[9px] font-black">Ciclo {event.cycleIndex}</Badge>
              )}
              {style.isOverdue && (
                <Badge variant="danger" className="text-[9px] font-black">VENCIDA</Badge>
              )}
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900 leading-tight tracking-tight">
              {event.title}
            </h2>
            <div className="flex items-center gap-2 p-3.5 bg-slate-50 rounded-[24px] border border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-brand shadow-sm border border-slate-100">
                <Activity size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Activo Vinculado</p>
                <p className="text-xs font-bold text-slate-900">{event.assetName}</p>
                <p className="text-[9px] font-mono font-black text-brand uppercase">[{event.assetCode}]</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <CalendarIcon size={12} /> Fecha
              </p>
              <p className="text-sm font-black text-slate-900 uppercase">
                {event.date
                  ? format(event.date, 'dd MMM yyyy', { locale: safeLocale })
                  : event.projectedDate
                    ? `~${format(event.projectedDate, 'dd MMM yyyy', { locale: safeLocale })}`
                    : event.meterValue != null
                      ? `≥ ${event.meterValue.toLocaleString()} ${event.meterUnit || 'h'}`
                      : 'Por medidor'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Clock size={12} /> Tipo
              </p>
              <p className="text-sm font-black text-slate-900 uppercase">
                {isWo ? (event.woType === 'corrective' ? 'Correctivo' : 'Preventivo') : (event.isMajor ? 'Hito Mayor' : 'Rutina')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <LayoutList size={14} className="text-brand" /> Alcance Técnico Sugerido
            </p>
            <div className="grid gap-2.5">
              {(event.tasksNames || []).length > 0 ? (
                event.tasksNames.map((tn: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 group">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm border border-slate-100 group-hover:text-brand transition-colors">
                      {idx + 1}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 leading-tight">{tn}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-black text-slate-300 uppercase">No hay tareas detalladas</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={() => onAction(isWo ? 'wo' : 'scheduler', event.id)}
              className="w-full h-14 bg-slate-900 text-white rounded-[20px] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-200 hover:bg-brand transition-all hover:scale-[1.02]"
            >
              {isWo ? 'Ir a la Orden' : 'Configurar Plan Maestro'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-1 md:pb-0 w-full md:w-auto shrink-0">
      {[
        { color: 'bg-work-corrective', label: 'Correctiva' },
        { color: 'bg-work-preventive', label: 'Preventiva' },
        { color: 'bg-work-completed', label: 'Completada' },
        { color: 'bg-work-projection', label: 'Proyección' },
        { color: 'bg-work-overdue', label: 'Vencida' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5 shrink-0">
          <div className={cn('w-2.5 h-2.5 rounded-full', color)} />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

type TypeFilter = 'all' | 'corrective' | 'preventive' | 'projection';

function FilterBar({
  plants, areas, filterPlant, filterArea, onPlant, onArea,
  startDate, endDate, onStartDate, onEndDate,
  typeFilter, onTypeFilter,
}: any) {
  const selectClass = cn(
    'h-8 px-3 text-[10px] font-bold border border-slate-200 rounded-xl bg-white',
    'focus:outline-none focus:border-brand focus:ring-[2px] focus:ring-brand/10 transition-all',
    'text-slate-600 cursor-pointer'
  );

  const hasFilters = filterPlant || filterArea || typeFilter !== 'all';

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full pb-1 md:pb-0 shrink-0">
      <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1 shrink-0">
        <input
          type="date"
          value={startDate}
          onChange={e => onStartDate(e.target.value)}
          className={selectClass}
        />
        <span className="text-slate-400 text-[10px] font-bold">—</span>
        <input
          type="date"
          value={endDate}
          onChange={e => onEndDate(e.target.value)}
          className={selectClass}
        />
      </div>

      {plants.length > 0 && (
        <select
          value={filterPlant}
          onChange={e => { onPlant(e.target.value); onArea(''); }}
          className={cn(selectClass, "shrink-0")}
        >
          <option value="">Todas las plantas</option>
          {plants.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}

      {plants.length > 0 && (
        <select
          value={filterArea}
          onChange={e => onArea(e.target.value)}
          className={cn(selectClass, "shrink-0", !filterPlant && areas.length === 0 && 'opacity-40')}
          disabled={!filterPlant && areas.length === 0}
        >
          <option value="">Todas las áreas</option>
          {areas.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      )}

      <select
        value={typeFilter}
        onChange={e => onTypeFilter(e.target.value as TypeFilter)}
        className={cn(selectClass, "shrink-0")}
      >
        <option value="all">Todos los tipos</option>
        <option value="corrective">Correctivos</option>
        <option value="preventive">Preventivos</option>
        <option value="projection">Proyecciones</option>
      </select>

      {hasFilters && (
        <button
          onClick={() => { onPlant(''); onArea(''); onTypeFilter('all'); }}
          className="text-[9px] font-black text-slate-400 hover:text-danger uppercase tracking-widest transition-colors shrink-0 ml-1"
        >
          ✕ Limpiar
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PmKanbanView() {
  const store = useStore() as any;
  const {
    workOrders = [], assetPlans = [], assets = [], pmPlans = [], pmTasks = [],
    meterReadings = [],
    selectWo = () => {}, setModule = () => {},
    projectionMonths = 12, meterProjectionCycles = 8,
  } = store;

  const today = startOfDay(new Date());

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filterPlant, setFilterPlant] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [startDate, setStartDate] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [showFilters, setShowFilters] = useState(false);

  const plants = useMemo(
    () => assets.filter((a: any) => a.assetType === 'plant'),
    [assets]
  );

  const areas = useMemo(() => {
    const all = assets.filter((a: any) => a.assetType === 'area');
    return filterPlant ? all.filter((a: any) => a.parentId === filterPlant) : all;
  }, [assets, filterPlant]);

  // ── All events ──────────────────────────────────────────────────────────────
  const events = useMemo(() => {
    try {
      const evs: any[] = [];

      (workOrders || []).forEach((wo: any) => {
        if (!wo || !wo.dueDate) return;
        const d = parseISO(wo.dueDate);
        if (!isValid(d)) return;
        if (wo.status === 'cancelled') return;
        const asset = assets.find((a: any) => a.id === wo.assetId);
        evs.push({
          id: wo.id, type: 'wo', woType: wo.woType,
          date: d, title: wo.title || 'OT', status: wo.status,
          assetId: wo.assetId,
          assetName: asset?.name || 'Activo', assetCode: asset?.code || 'S/T',
          woNumber: wo.woNumber,
          priority: wo.priority,
        });
      });

      (assetPlans || []).forEach((ap: any) => {
        if (!ap || !ap.active) return;
        const basePlan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
        if (!basePlan) return;
        const asset = assets.find((a: any) => a.id === ap.assetId);
        const planWithTasks = {
          ...basePlan,
          tasks: (pmTasks || []).filter((t: any) => t.pmPlanId === basePlan.id),
        };
        const projections = calculateProjections(ap, planWithTasks, projectionMonths, meterProjectionCycles, meterReadings);
        (projections || []).forEach(proj => {
          if (proj.date !== null && !isValid(proj.date)) return;
          const hasWo = proj.date !== null && (workOrders || []).some((wo: any) => {
            if (!wo.dueDate || wo.assetPlanId !== ap.id) return false;
            const d = parseISO(wo.dueDate);
            return isValid(d) && isSameDay(d, proj.date!);
          });
          if (!hasWo) {
            evs.push({
              id: `${ap.id}-${proj.cycleIndex}`, type: 'projection',
              date: proj.date, title: `${basePlan.name || 'PM'} — ${proj.label}`,
              assetId: ap.assetId,
              assetName: asset?.name || 'Activo', assetCode: asset?.code || 'S/T',
              tasksNames: proj.tasksNames, isMajor: proj.isMajor, cycleIndex: proj.cycleIndex,
              meterValue: proj.meterValue, meterUnit: proj.meterUnit,
              projectedDate: proj.projectedDate ?? null,
            });
          }
        });
      });

      // Null dates (meter-only projections without history) sort to the end
      return evs.sort((a, b) => {
        const da = a.date ?? a.projectedDate ?? null;
        const db = b.date ?? b.projectedDate ?? null;
        if (da === null && db === null) return 0;
        if (da === null) return 1;
        if (db === null) return -1;
        return da.getTime() - db.getTime();
      });
    } catch { return []; }
  }, [workOrders, assetPlans, assets, pmPlans, pmTasks, projectionMonths, meterProjectionCycles]);

  // ── Plant / area / type filter ──────────────────────────────────────────────
  const filteredByScope = useMemo(() => {
    let result = events;

    if (filterPlant || filterArea) {
      const rootId = filterArea || filterPlant;
      const validIds = getDescendantIds(rootId, assets);
      result = result.filter((e: any) => validIds.has(e.assetId));
    }

    if (typeFilter !== 'all') {
      result = result.filter((e: any) => {
        if (typeFilter === 'corrective') return e.type === 'wo' && e.woType === 'corrective';
        if (typeFilter === 'preventive') return e.type === 'wo' && e.woType !== 'corrective';
        if (typeFilter === 'projection') return e.type === 'projection';
        return true;
      });
    }

    return result;
  }, [events, filterPlant, filterArea, assets, typeFilter]);

  // ── Date filter — overdue events are always visible ─────────────────────────
  const displayedEvents = useMemo(() => {
    const s = parseISO(startDate);
    const e = parseISO(endDate);
    const validRange = isValid(s) && isValid(e);

    return filteredByScope.filter(ev => {
      const displayDate = ev.date ?? ev.projectedDate ?? null;
      if (displayDate === null) return true; // meter-only projections without any history — always show
      if (isOverdueEvent(ev, today)) return true;
      if (!validRange) return true;
      return displayDate >= startOfDay(s) && displayDate <= endOfDay(e);
    });
  }, [filteredByScope, startDate, endDate, today]);

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      id: 'planned',
      title: 'Planificado',
      icon: <Sparkles size={14} className="text-work-projection" />,
      bg: 'bg-work-projection-bg',
      headerClass: 'text-work-projection',
      events: displayedEvents.filter(e => e.type === 'projection'),
    },
    {
      id: 'open',
      title: 'Abierta',
      icon: <Clock size={14} className="text-status-open" />,
      bg: 'bg-status-open-bg',
      headerClass: 'text-status-open',
      events: displayedEvents.filter(e => e.type === 'wo' && e.status === 'open'),
    },
    {
      id: 'assigned',
      title: 'Asignada',
      icon: <Wrench size={14} className="text-status-assigned" />,
      bg: 'bg-status-assigned-bg',
      headerClass: 'text-status-assigned',
      events: displayedEvents.filter(e => e.type === 'wo' && ['assigned', 'on_hold'].includes(e.status)),
    },
    {
      id: 'in_progress',
      title: 'En Proceso',
      icon: <Activity size={14} className="text-status-progress" />,
      bg: 'bg-status-progress-bg',
      headerClass: 'text-status-progress',
      events: displayedEvents.filter(e => e.type === 'wo' && e.status === 'in_progress'),
    },
    {
      id: 'completed',
      title: 'Completada',
      icon: <CheckCircle2 size={14} className="text-status-completed" />,
      bg: 'bg-status-completed-bg',
      headerClass: 'text-status-completed',
      events: displayedEvents.filter(e => e.type === 'wo' && e.status === 'completed'),
    },
  ], [displayedEvents]);

  // ── Card renderer ─────────────────────────────────────────────────────────────
  const renderEventCard = (event: any, index: number) => {
    const style = getEventStyle(event, today);
    const isOnHold = event.status === 'on_hold';
    const isMeterOnly = event.date === null;

    const dateLabel = isMeterOnly
      ? event.projectedDate
        ? `≥ ${(event.meterValue ?? 0).toLocaleString()}${event.meterUnit || 'h'} (~${format(event.projectedDate, 'dd MMM', { locale: safeLocale })})`
        : `≥ ${(event.meterValue ?? 0).toLocaleString()} ${event.meterUnit || 'h'}`
      : format(event.date, 'dd MMM', { locale: safeLocale });

    return (
      <motion.button
        key={event.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.03, 0.3) }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setSelectedEvent(event)}
        className={cn(
          'w-full rounded-xl border overflow-hidden flex text-left relative bg-white shadow-sm hover:shadow-md transition-all mb-2.5',
          style.card,
          style.isGhost && 'opacity-90'
        )}
      >
        {style.isOverdue && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-work-overdue z-10" />
        )}

        <div className="flex shrink-0">
          <div className={cn('w-[3px]', style.stripe)} />
          {style.stripeExtra && <div className={cn('w-[2px]', style.stripeExtra)} />}
        </div>

        <div className="p-3 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              {dateLabel}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {style.isOverdue && (
                <span className="text-[8px] font-black bg-work-overdue text-white px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                  VENCIDA
                </span>
              )}
              {isOnHold && (
                <span className="text-[8px] font-black bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-0.5">
                  <Pause size={7} /> ESPERA
                </span>
              )}
              <span className={cn('text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wide', style.badge)}>
                {style.isGhost ? (
                  isMeterOnly
                    ? <span className="flex items-center gap-1"><Activity size={8} />MEDIDOR</span>
                    : <span className="flex items-center gap-1"><Sparkles size={8} />PLAN</span>
                ) : style.badgeLabel}
              </span>
            </div>
          </div>

          <h5 className={cn(
            'text-[11px] font-bold tracking-tight leading-snug line-clamp-2',
            style.isGhost
              ? (style.isOverdue ? 'text-work-overdue italic' : 'text-work-projection italic')
              : 'text-slate-900'
          )}>
            {event.title}
          </h5>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <Activity size={10} className="text-slate-400 shrink-0" />
              <span className="text-[9px] text-slate-400 font-bold truncate tracking-tight uppercase">
                {event.assetCode} · {event.assetName}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {event.isMajor && (
                <Badge variant="brand" className="text-[8px] font-black px-1 py-0 bg-brand text-white border-none">
                  MAYOR
                </Badge>
              )}
              {event.woNumber && (
                <span className="text-[8px] font-mono font-black text-slate-300">
                  #{event.woNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col px-4 sm:px-6 py-3 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl font-black text-slate-900 capitalize tracking-tighter flex items-center gap-2">
            <Target size={20} className="text-brand" /> Kanban
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Legend />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                showFilters 
                  ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                  : ((filterPlant || filterArea || typeFilter !== 'all') 
                      ? "bg-brand/10 text-brand border-brand/20 shadow-sm" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")
              )}
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Filtros</span>
              {(filterPlant || filterArea || typeFilter !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-brand" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <FilterBar
                  plants={plants} areas={areas}
                  filterPlant={filterPlant} filterArea={filterArea}
                  onPlant={setFilterPlant} onArea={setFilterArea}
                  startDate={startDate} endDate={endDate}
                  onStartDate={setStartDate} onEndDate={setEndDate}
                  typeFilter={typeFilter} onTypeFilter={setTypeFilter}
                />
                <div className="md:hidden pt-3 border-t border-slate-50">
                  <Legend />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-thin">
        <div className="flex h-full p-4 gap-4 min-w-max">
          {columns.map(col => (
            <div key={col.id} className="w-[85vw] sm:w-[300px] max-w-[320px] flex flex-col max-h-full snap-center shrink-0">
              <div className={cn('px-4 py-3 rounded-t-2xl', col.bg)}>
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h3 className={cn('text-[11px] font-black uppercase tracking-[0.2em]', col.headerClass)}>
                    {col.title}{' '}
                    <span className="opacity-60 ml-1">({col.events.length})</span>
                  </h3>
                </div>
                <ColumnBreakdown events={col.events} today={today} />
              </div>
              <div className="flex-1 overflow-y-auto p-2 bg-slate-100/50 border border-slate-100 border-t-0 rounded-b-2xl scrollbar-none">
                <AnimatePresence>
                  {col.events.map((e, idx) => renderEventCard(e, idx))}
                </AnimatePresence>
                {col.events.length === 0 && (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl m-2 opacity-50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vacío</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <EventDetailPanel
        event={selectedEvent}
        today={today}
        onClose={() => setSelectedEvent(null)}
        onAction={(type: any, id: any) => {
          if (type === 'wo') selectWo(id);
          setModule(type === 'wo' ? 'workorders' : 'scheduler');
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}
