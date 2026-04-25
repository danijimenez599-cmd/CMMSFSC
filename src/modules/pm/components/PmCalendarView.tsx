import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Wrench, Clock, AlertTriangle, CheckCircle, CalendarClock } from 'lucide-react';
import { useStore } from '../../../store';
import { cn, Badge } from '../../../shared/components';

export default function PmCalendarView() {
  const { workOrders = [], assetPlans = [], assets = [], pmPlans = [], selectWo, setModule, users = [] } = useStore() as any;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const events = useMemo(() => {
    const evs: any[] = [];
    const activeWoByAssetPlan: Record<string, boolean> = {};

    workOrders.forEach((wo: any) => {
      if (wo.dueDate) {
        if (wo.assetPlanId && !['completed', 'cancelled'].includes(wo.status)) {
          activeWoByAssetPlan[wo.assetPlanId] = true;
        }
        const asset = assets.find((a: any) => a.id === wo.assetId);
        evs.push({
          id: wo.id,
          type: 'wo',
          woType: wo.woType,
          date: parseISO(wo.dueDate),
          title: wo.title,
          status: wo.status,
          number: wo.woNumber,
          assetName: asset?.name || 'Activo',
          assetCode: asset?.code || 'S/T'
        });
      }
    });

    assetPlans.forEach((ap: any) => {
      if (ap.nextDueDate && ap.active && !activeWoByAssetPlan[ap.id]) {
        const plan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
        const asset = assets.find((a: any) => a.id === ap.assetId);
        evs.push({
          id: ap.id,
          type: 'pm',
          date: parseISO(ap.nextDueDate),
          title: plan?.name || 'Mantenimiento Programado',
          assetName: asset?.name || 'Activo',
          assetCode: asset?.code || 'S/T',
          isOverdue: parseISO(ap.nextDueDate) < new Date() && isSameMonth(parseISO(ap.nextDueDate), monthStart)
        });
      }
    });

    return evs.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [workOrders, assetPlans, assets, pmPlans, monthStart]);

  // Stats for the sidebar
  const monthStats = useMemo(() => {
    const monthEvents = events.filter(e => isSameMonth(e.date, currentDate));
    const completed = monthEvents.filter(e => e.status === 'completed').length;
    const pending = monthEvents.filter(e => e.status && e.status !== 'completed' && e.status !== 'cancelled').length;
    const planned = monthEvents.filter(e => e.type === 'pm').length;
    const total = monthEvents.length;

    return { total, completed, pending, planned, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [events, currentDate]);

  const upcomingEvents = events
    .filter(e => e.date >= new Date() && e.status !== 'completed')
    .slice(0, 6);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden shadow-xl">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-display font-black text-slate-900 capitalize tracking-tight">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
                <ChevronLeft size={18} />
              </button>
              <button onClick={goToToday} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
                Hoy
              </button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-brand" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correctivo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preventivo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan PM</span>
            </div>
          </div>
        </div>

        {/* Grid Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
            <div key={day} className="py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto bg-slate-50/30 scrollbar-thin">
          <div className="grid grid-cols-7 min-w-[800px]">
            {calendarDays.map((day, idx) => {
              const dayEvents = events.filter(e => isSameDay(e.date, day));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDay = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  className={cn(
                    "min-h-[140px] p-2 border-b border-r border-slate-100 transition-all relative group",
                    !isCurrentMonth ? "bg-slate-50/50 opacity-40" : "bg-white",
                    isTodayDay && "bg-brand/[0.02]"
                  )}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={cn(
                      "text-[11px] font-bold w-7 h-7 flex items-center justify-center rounded-xl transition-all",
                      isTodayDay ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-50"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{dayEvents.length} Actividades</span>
                    )}
                  </div>

                  <div className="space-y-1.5 overflow-hidden">
                    {dayEvents.slice(0, 4).map(event => {
                      const isClosed = event.status === 'completed' || event.status === 'cancelled';
                      const isCorrective = event.woType === 'corrective';
                      
                      return (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 rounded-lg text-[9px] font-bold truncate transition-all border-l-[3px] shadow-sm",
                            event.type === 'pm' 
                              ? "bg-amber-50 text-amber-700 border-amber-400 hover:scale-[1.02]"
                              : isClosed
                                ? "bg-slate-50 text-slate-400 border-slate-200 opacity-60"
                                : isCorrective
                                  ? "bg-brand/5 text-brand border-brand hover:scale-[1.02]"
                                  : "bg-blue-50 text-blue-700 border-blue-400 hover:scale-[1.02]"
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="truncate opacity-90">{event.title}</span>
                          </div>
                        </button>
                      );
                    })}
                    {dayEvents.length > 4 && (
                      <button className="w-full text-[8px] font-black text-slate-400 uppercase tracking-widest text-center py-1 hover:text-brand transition-colors">
                        + {dayEvents.length - 4} más...
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Control Panel */}
      <aside className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
            <CalendarIcon size={16} className="text-brand" />
            Sumario Operativo
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Estrategia Mensual</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
          {/* Progress Chart Simple */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cumplimiento</p>
                <h4 className="text-3xl font-display font-black text-slate-900">{monthStats.percent}%</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{monthStats.completed} Completadas</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{monthStats.total} Totales</p>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${monthStats.percent}%` }}
                className="h-full bg-brand"
              />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pendientes</p>
              <p className="text-xl font-bold text-slate-900">{monthStats.pending}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Planeadas</p>
              <p className="text-xl font-bold text-slate-900">{monthStats.planned}</p>
            </div>
          </div>

          {/* Upcoming List */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Wrench size={12} className="text-brand" />
              Próximos en Agenda
            </h4>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full group text-left p-3 rounded-2xl border border-slate-100 hover:border-brand/30 hover:bg-brand/[0.02] transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{format(event.date, 'dd MMM')}</span>
                    <Badge variant={event.type === 'pm' ? 'warn' : 'info'} className="text-[8px] px-1.5 uppercase font-black">
                      {event.type === 'pm' ? 'PLAN' : 'OT'}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-brand transition-colors">
                    {event.title}
                  </p>
                  <p className="text-[9px] font-mono font-bold text-slate-400 mt-1">[{event.assetCode}] {event.assetName}</p>
                </button>
              )) : (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sin próximos eventos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => setModule('workorders')}
            className="w-full h-11 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
          >
            Ir al Listado Maestro
          </button>
        </div>
      </aside>

      <SidePanel 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)}
        assets={assets}
        users={users}
        onAction={(type: string, id: string) => {
          if (type === 'wo') {
            selectWo(id);
            setModule('workorders');
          } else if (type === 'scheduler') {
            setModule('scheduler');
          }
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}

function SidePanel({ event, onClose, onAction, assets, users }: any) {
  const isWo = event?.type === 'wo';
  
  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Detalles de Actividad</p>
                <h3 className="font-display font-bold text-slate-900">
                  {isWo ? 'Orden de Trabajo' : 'Plan Preventivo'}
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {isWo ? (
                    <Badge variant={event.status} className="uppercase text-[9px] font-black">
                      {event.status}
                    </Badge>
                  ) : (
                    <Badge variant="brand" className="uppercase text-[9px] font-black">PLANIFICADO</Badge>
                  )}
                  <span className="text-slate-200">/</span>
                  <span className="font-mono text-[10px] font-bold text-slate-400">ID: {event.id.substring(0, 8)}</span>
                </div>
                <h2 className="text-2xl font-display font-bold text-slate-900 leading-tight tracking-tight">
                  {event.title}
                </h2>
              </div>

              {/* Technical Specs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <CalendarIcon size={10} /> Fecha Programada
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {format(event.date, 'PPPP', { locale: es })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Wrench size={10} /> Equipo Vinculado
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">{event.assetName}</p>
                  <p className="text-[10px] font-mono font-bold text-brand mt-0.5 uppercase">[{event.assetCode}]</p>
                </div>
              </div>

              {/* Additional context based on type */}
              {isWo ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle size={12} /> Prioridad y Tipo
                    </p>
                    <div className="flex gap-2">
                      <Badge variant={event.woType === 'corrective' ? 'danger' : 'info'}>
                        {event.woType.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900 rounded-[24px] text-white/90 relative overflow-hidden">
                     <Wrench className="absolute -bottom-4 -right-4 opacity-10 rotate-12" size={80} />
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Descripción Técnica</p>
                     <p className="text-sm font-medium leading-relaxed italic leading-snug">
                       "Protocolo de intervención programado según cronograma de ingeniería."
                     </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <button 
                      onClick={() => onAction('wo', event.id)}
                      className="w-full h-12 bg-brand text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-brand/20 hover:scale-[1.02] transition-all"
                    >
                      Gestionar Orden Completa
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-blue-800 text-xs font-medium leading-relaxed">
                    <strong>Proyección de Ingeniería:</strong> Esta actividad aún no es una Orden de Trabajo. Es una proyección calculada por el motor PM.
                  </div>
                  
                  <div className="p-6 bg-amber-50 border border-amber-100 rounded-[24px] text-amber-900 relative overflow-hidden">
                     <Clock className="absolute -bottom-4 -right-4 opacity-10 rotate-12 text-amber-900" size={80} />
                     <p className="text-[10px] font-bold text-amber-700/60 uppercase tracking-widest mb-3">Nota de Programación</p>
                     <p className="text-sm font-medium leading-relaxed">
                       El sistema sugiere realizar esta intervención en la fecha indicada para mantener la integridad operativa del activo [{event.assetCode}].
                     </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <button 
                      onClick={() => onAction('scheduler')}
                      className="w-full h-12 bg-amber-500 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
                    >
                      Ir al Motor para Generar OT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
