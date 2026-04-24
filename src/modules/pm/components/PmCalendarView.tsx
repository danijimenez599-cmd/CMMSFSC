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

    // Track which asset plans already have an active WO to avoid duplicates
    const activeWoByAssetPlan: Record<string, boolean> = {};

    // Add Work Orders
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

    // Add Asset Plans (Future projections)
    assetPlans.forEach((ap: any) => {
      // Logic: Only show the planned projection IF there isn't already an active WO for this plan
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

    return evs;
  }, [workOrders, assetPlans, assets, pmPlans, monthStart]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-display font-bold text-slate-900 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={prevMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
              <ChevronLeft size={18} />
            </button>
            <button onClick={goToToday} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
              Hoy
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand shadow-[0_0_8px_rgba(153,27,27,0.3)]" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Correctivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preventivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan PM (Sin OT)</span>
          </div>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-slate-50/30">
        <div className="grid grid-cols-7 h-full min-h-[600px]">
          {calendarDays.map((day, idx) => {
            const dayEvents = events.filter(e => isSameDay(e.date, day));
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDay = isToday(day);

            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "min-h-[120px] p-2 border-b border-r border-slate-100 transition-all relative group",
                  !isCurrentMonth ? "bg-slate-50/50 opacity-40" : "bg-white",
                  isTodayDay && "bg-brand/[0.02]",
                  dayEvents.length > 5 && "ring-1 ring-inset ring-brand/10 bg-brand/[0.01]"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={cn(
                    "text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                    isTodayDay ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-slate-400 group-hover:text-slate-900",
                    dayEvents.length > 5 && !isTodayDay && "ring-2 ring-brand ring-offset-1"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{dayEvents.length} Act.</span>
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-none">
                  {dayEvents.map(event => {
                    const isClosed = event.status === 'completed' || event.status === 'cancelled';
                    const isCorrective = event.woType === 'corrective';
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={cn(
                          "w-full text-left px-1.5 py-1 rounded-md text-[10px] font-bold truncate transition-all border-l-2",
                          event.type === 'pm' 
                            ? "bg-amber-50 text-amber-700 border-amber-400 hover:bg-amber-500 hover:text-white"
                            : isClosed
                              ? "bg-slate-100 text-slate-400 border-slate-300 opacity-60"
                              : isCorrective
                                ? "bg-brand/10 text-brand border-brand hover:bg-brand hover:text-white"
                                : "bg-blue-50 text-blue-700 border-blue-400 hover:bg-blue-500 hover:text-white"
                        )}
                        title={`${event.title} [${event.assetCode}] - ${event.assetName}`}
                      >
                        <div className="flex items-center gap-1.5">
                          {event.type === 'pm' ? (
                            event.isOverdue ? <AlertTriangle size={10} className="text-danger" /> : <Clock size={10} />
                          ) : isClosed ? (
                            <CheckCircle size={10} />
                          ) : isCorrective ? (
                            <Wrench size={10} />
                          ) : (
                            <CalendarClock size={10} />
                          )}
                          <span className="truncate flex-1">
                            <span className="opacity-50 font-mono mr-1">[{event.assetCode}]</span>
                            {event.title}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
