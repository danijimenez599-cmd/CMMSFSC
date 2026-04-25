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
  parseISO,
  isValid
} from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Wrench, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  CalendarClock, 
  Eye,
  Activity,
  LayoutList,
  Target,
  History,
  BrainCircuit,
  ClipboardList
} from 'lucide-react';
import { useStore } from '../../../store';
import { cn, Badge } from '../../../shared/components';
import { calculateProjections } from '../utils/projections';

const safeLocale = es || undefined;

// --- COMPONENTE: PANEL LATERAL DE DETALLES (SIDEBAR OVERLAY) ---
function EventDetailPanel({ event, onClose, onAction }: any) {
  if (!event) return null;
  const isWo = event.type === 'wo';
  
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[110] border-l border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-md shrink-0">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{isWo ? 'GESTIÓN OPERATIVA' : 'ANÁLISIS DE INGENIERÍA'}</p>
            <h3 className="font-display font-black text-slate-900 text-lg">{isWo ? 'Orden de Trabajo' : 'Proyección Predictiva'}</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-none">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={isWo ? (event.status as any) : 'brand'} className="uppercase text-[9px] font-black px-3 py-1">{isWo ? event.status : 'SIMULACIÓN'}</Badge>
              {!isWo && <Badge variant="neutral" className="text-[9px] font-black">Ciclo {event.cycleIndex}</Badge>}
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900 leading-tight tracking-tight">{event.title}</h2>
            <div className="flex items-center gap-2 p-3.5 bg-slate-50 rounded-[24px] border border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-brand shadow-sm border border-slate-100"><Activity size={22} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Activo Vinculado</p>
                <p className="text-xs font-bold text-slate-900">{event.assetName}</p>
                <p className="text-[9px] font-mono font-black text-brand uppercase">[{event.assetCode}]</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><CalendarIcon size={12}/> Fecha</p><p className="text-sm font-black text-slate-900 uppercase">{isValid(event.date) ? format(event.date, 'dd MMM yyyy', { locale: safeLocale }) : 'N/A'}</p></div>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={12}/> Tipo</p><p className="text-sm font-black text-slate-900 uppercase">{isWo ? (event.woType || 'Preventivo') : (event.isMajor ? 'Hito Mayor' : 'Rutina')}</p></div>
          </div>

          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><LayoutList size={14} className="text-brand" /> Alcance Técnico Sugerido</p>
             <div className="grid gap-2.5">
                {(event.tasksNames || []).length > 0 ? (event.tasksNames || []).map((tn: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100 group">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm border border-slate-100 group-hover:text-brand transition-colors">{idx + 1}</div>
                    <span className="text-[11px] font-bold text-slate-700 leading-tight">{tn}</span>
                  </div>
                )) : (
                  <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200"><p className="text-[10px] font-black text-slate-300 uppercase">No hay tareas detalladas</p></div>
                )}
             </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button onClick={() => onAction(isWo ? 'wo' : 'scheduler', event.id)} className="w-full h-14 bg-slate-900 text-white rounded-[20px] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-200 hover:bg-brand transition-all hover:scale-[1.02]">
              {isWo ? 'Ir a la Orden' : 'Configurar Plan Maestro'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function PmCalendarView() {
  const store = useStore() as any;
  const {
    workOrders = [], assetPlans = [], assets = [], pmPlans = [], pmTasks = [],
    selectWo = () => {}, setModule = () => {},
    projectionMonths = 12,
  } = store;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Use primitive deps so memo isn't invalidated on every render (Fix 3.5)
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentMonth, currentYear]);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: startDate, end: endDate }),
    [currentMonth, currentYear]
  );

  const events = useMemo(() => {
    try {
      const evs: any[] = [];
      (workOrders || []).forEach((wo: any) => {
        if (!wo || !wo.dueDate) return;
        const d = parseISO(wo.dueDate);
        if (!isValid(d)) return;
        const asset = assets.find((a: any) => a.id === wo.assetId);
        evs.push({ id: wo.id, type: 'wo', woType: wo.woType, date: d, title: wo.title || 'OT', status: wo.status, assetName: asset?.name || 'Activo', assetCode: asset?.code || 'S/T' });
      });

      (assetPlans || []).forEach((ap: any) => {
        if (!ap || !ap.active) return;
        const basePlan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
        if (!basePlan) return;
        const asset = assets.find((a: any) => a.id === ap.assetId);
        const planWithTasks = { ...basePlan, tasks: (pmTasks || []).filter((t: any) => t.pmPlanId === basePlan.id) };
        // Read projection horizon from global store setting (default 12 months)
        const projections = calculateProjections(ap, planWithTasks, projectionMonths);
        (projections || []).forEach(proj => {
          if (!proj.date || !isValid(proj.date)) return;
          const hasWo = (workOrders || []).some((wo: any) => {
            if (!wo.dueDate || wo.assetPlanId !== ap.id) return false;
            const d = parseISO(wo.dueDate);
            return isValid(d) && isSameDay(d, proj.date);
          });
          if (!hasWo) {
            evs.push({ id: `${ap.id}-${proj.cycleIndex}`, type: 'projection', date: proj.date, title: `${basePlan.name || 'PM'} - ${proj.label}`, assetName: asset?.name || 'Activo', assetCode: asset?.code || 'S/T', tasksNames: proj.tasksNames, isMajor: proj.isMajor, cycleIndex: proj.cycleIndex });
          }
        });
      });
      return evs.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (e) { return []; }
  }, [workOrders, assetPlans, assets, pmPlans, pmTasks, currentMonth, currentYear, projectionMonths]);

  const pendingWOs = events.filter(e => e.type === 'wo' && !['completed', 'cancelled'].includes(e.status) && isSameMonth(e.date, currentDate));
  const completedWOs = events.filter(e => e.type === 'wo' && e.status === 'completed' && isSameMonth(e.date, currentDate));
  const projectionEvents = events.filter(e => e.type === 'projection' && isSameMonth(e.date, currentDate));

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-900 capitalize tracking-tighter">{format(currentDate, 'MMMM yyyy', { locale: safeLocale })}</h2>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-brand"><ChevronLeft size={16} /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest hover:bg-white rounded-lg transition-all text-slate-500">Hoy</button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-brand"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ingeniería</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ejecución</span></div>
          </div>
        </div>

        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100 shrink-0">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (<div key={d} className="py-2 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</div>))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none bg-slate-50/20">
          <div className="grid grid-cols-7 h-full">
            {calendarDays.map((day) => {
              const dayEvents = events.filter(e => isSameDay(e.date, day));
              return (
                <div key={day.toString()} className={cn("min-h-[110px] p-2 border-b border-r border-slate-100 transition-all", !isSameMonth(day, monthStart) ? "bg-slate-50/30 opacity-30" : "bg-white", isToday(day) && "bg-brand/[0.02]")}>
                  <span className={cn("text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-lg mb-2", isToday(day) ? "bg-slate-900 text-white shadow-lg" : "text-slate-400")}>{format(day, 'd')}</span>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(e => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEvent(e)}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded-lg text-[9px] font-black truncate transition-all",
                          e.type === 'projection'
                            // MODULE 3.6: Ghost style for projections — clearly "planned, not real"
                            ? "bg-blue-500/10 text-blue-700 border border-blue-300/50 hover:bg-blue-500/20 shadow-none"
                            : "bg-slate-900 text-white shadow-sm hover:bg-brand"
                        )}
                      >
                        {e.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && <div className="text-[8px] font-black text-slate-300 text-center uppercase tracking-widest pt-1">+ {dayEvents.length - 3} más</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="font-display font-black text-slate-900 text-sm uppercase tracking-widest">Dashboard Mensual</h3></div>
        <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-none">
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><ClipboardList size={12} className="text-brand" /> Pendientes ({pendingWOs.length})</h4>
            <div className="space-y-2">
              {pendingWOs.slice(0, 5).map(wo => (<div key={wo.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-brand/20 cursor-pointer transition-all" onClick={() => setSelectedEvent(wo)}><p className="text-[10px] font-black text-slate-900 truncate">{wo.title}</p><p className="text-[8px] font-mono font-bold text-slate-400 mt-1">[{wo.assetCode}] {wo.assetName}</p></div>))}
            </div>
          </section>
          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><History size={12} className="text-emerald-500" /> Completados ({completedWOs.length})</h4>
            <div className="space-y-2">
              {completedWOs.slice(0, 3).map(wo => (<div key={wo.id} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl shadow-sm"><p className="text-[10px] font-black text-emerald-800 truncate">{wo.title}</p><p className="text-[8px] font-bold text-emerald-600/70 mt-1 uppercase tracking-widest">Finalizado {format(wo.date, 'dd MMM')}</p></div>))}
            </div>
          </section>
          <section className="pt-4 border-t border-slate-100">
            {/* MODULE 3.7: Fix contrast — was dark bg with low-contrast text */}
            <div className="bg-blue-50 border border-blue-200/60 rounded-[24px] p-5 relative overflow-hidden group">
              <BrainCircuit className="absolute -bottom-4 -right-4 text-blue-200/40 rotate-12" size={80} />
              <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <BrainCircuit size={14} className="text-blue-600" />
                Ingeniería ({projectionEvents.length})
              </h4>
              <div className="space-y-2 relative z-10">
                {projectionEvents.slice(0, 4).map(proj => (
                  <div
                    key={proj.id}
                    className="p-2.5 bg-white/70 border border-blue-200/50 rounded-xl hover:bg-white transition-all cursor-pointer shadow-sm"
                    onClick={() => setSelectedEvent(proj)}
                  >
                    <p className="text-[9px] font-black text-blue-900 truncate">{proj.title}</p>
                    <p className="text-[8px] font-bold text-blue-600 mt-1 uppercase tracking-tighter">
                      Sugerido {format(proj.date, 'dd MMM')}
                    </p>
                  </div>
                ))}
                {projectionEvents.length === 0 && (
                  <p className="text-[9px] font-bold text-blue-500/60 uppercase tracking-widest text-center py-3">Sin proyecciones este mes</p>
                )}
              </div>
            </div>
          </section>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50"><button onClick={() => setModule('workorders')} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand transition-all">Listado Maestro</button></div>
      </aside>

      <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} onAction={(type: any, id: any) => { if (type === 'wo') selectWo(id); setModule(type === 'wo' ? 'workorders' : 'scheduler'); setSelectedEvent(null); }} />
    </div>
  );
}
