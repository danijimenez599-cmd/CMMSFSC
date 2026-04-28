import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStore } from '../../../store';
import {
  FileText, Wrench, CalendarClock, DollarSign,
  Users, Package, AlertTriangle, Clock, ChevronRight, Download,
} from 'lucide-react';
import { cn } from '../../../shared/utils/utils';

const REPORT_TYPES = [
  { id: 'wo-history',         label: 'Historial de OTs',        icon: <Wrench size={20} />,        color: 'bg-blue-500',   desc: 'Todas las OTs filtradas por tipo, estado y activo' },
  { id: 'pm-compliance',      label: 'Cumplimiento PM',         icon: <CalendarClock size={20} />,  color: 'bg-emerald-500', desc: 'Planes preventivos: completados, pendientes, vencidos' },
  { id: 'overdue-wo',         label: 'OTs Vencidas',            icon: <AlertTriangle size={20} />,  color: 'bg-red-500',    desc: 'Órdenes fuera de SLA para revisión gerencial' },
  { id: 'cost-analysis',      label: 'Análisis de Costos',      icon: <DollarSign size={20} />,     color: 'bg-teal-500',   desc: 'Desglose de costos por tipo y activo' },
  { id: 'technician-perf',    label: 'Rendimiento Técnico',     icon: <Users size={20} />,          color: 'bg-violet-500', desc: 'OTs por técnico: asignadas, completadas, eficiencia' },
  { id: 'upcoming-pm',        label: 'Agenda Preventiva',       icon: <Clock size={20} />,          color: 'bg-amber-500',  desc: 'OTs preventivas proyectadas próximas' },
  { id: 'inventory-usage',    label: 'Estado de Inventario',    icon: <Package size={20} />,        color: 'bg-orange-500', desc: 'Ítems bajo mínimo y valor total en stock' },
] as const;

type ReportId = typeof REPORT_TYPES[number]['id'];

export default function ReportsHub() {
  const store = useStore() as any;
  const { workOrders = [], assetPlans = [], pmPlans = [], assets = [], users = [], inventoryItems = [] } = store;

  const [selected, setSelected] = useState<ReportId | null>(null);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return format(d, 'yyyy-MM-dd');
  });
  const [dateTo, setDateTo] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const reportData = useMemo(() => {
    if (!selected) return [];
    const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
    const to   = new Date(dateTo);   to.setHours(23, 59, 59, 999);

    const inRange = (d: string | null) => {
      if (!d) return false;
      const dt = new Date(d);
      return dt >= from && dt <= to;
    };

    if (selected === 'wo-history') {
      return workOrders
        .filter((w: any) => inRange(w.createdAt))
        .filter((w: any) => filterType === 'all' || w.woType === filterType)
        .filter((w: any) => filterStatus === 'all' || w.status === filterStatus);
    }
    if (selected === 'overdue-wo') {
      const today = new Date();
      return workOrders.filter((w: any) =>
        !['completed', 'cancelled'].includes(w.status) && w.dueDate && new Date(w.dueDate) < today
      );
    }
    if (selected === 'pm-compliance') {
      return assetPlans.filter((ap: any) => ap.active).map((ap: any) => {
        const plan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
        const asset = assets.find((a: any) => a.id === ap.assetId);
        const today = new Date();
        const due = ap.nextDueDate ? new Date(ap.nextDueDate) : null;
        const daysUntil = due ? Math.floor((due.getTime() - today.getTime()) / 86400000) : null;
        return { planName: plan?.name, assetName: asset?.name, cycleIndex: ap.currentCycleIndex, nextDueDate: ap.nextDueDate, daysUntil };
      });
    }
    if (selected === 'cost-analysis') {
      return workOrders
        .filter((w: any) => w.status === 'completed' && inRange(w.completedAt) && (w.externalServiceCost || 0) > 0);
    }
    if (selected === 'technician-perf') {
      const map: Record<string, any> = {};
      workOrders.filter((w: any) => inRange(w.createdAt)).forEach((w: any) => {
        const id = w.assignedTo || 'unassigned';
        const name = w.assignedToNameSnapshot || 'Sin asignar';
        if (!map[id]) map[id] = { name, assigned: 0, completed: 0 };
        map[id].assigned++;
        if (w.status === 'completed') map[id].completed++;
      });
      return Object.values(map).sort((a: any, b: any) => b.assigned - a.assigned);
    }
    if (selected === 'upcoming-pm') {
      const toDate = new Date(); toDate.setDate(toDate.getDate() + 60);
      return assetPlans
        .filter((ap: any) => ap.active && ap.nextDueDate && new Date(ap.nextDueDate) <= toDate)
        .map((ap: any) => {
          const plan = pmPlans.find((p: any) => p.id === ap.pmPlanId);
          const asset = assets.find((a: any) => a.id === ap.assetId);
          return { planName: plan?.name, assetName: asset?.name, nextDueDate: ap.nextDueDate, criticality: plan?.criticality };
        })
        .sort((a: any, b: any) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
    }
    if (selected === 'inventory-usage') {
      return inventoryItems.filter((i: any) => i.active && i.stockCurrent <= i.stockMin);
    }
    return [];
  }, [selected, dateFrom, dateTo, filterType, filterStatus, workOrders, assetPlans, pmPlans, assets, inventoryItems]);

  const selectedMeta = REPORT_TYPES.find(r => r.id === selected);

  return (
    <div className="space-y-8">
      {/* Report type selector */}
      {!selected ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_TYPES.map(r => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className="bg-white border border-slate-100 rounded-3xl p-6 text-left hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-4 shadow-sm', r.color)}>
                {r.icon}
              </div>
              <p className="font-black text-slate-900 text-sm mb-1">{r.label}</p>
              <p className="text-xs text-slate-400">{r.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-700 transition-colors">
                Generar <ChevronRight size={12} />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-widest">
              ← Volver
            </button>
            <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center text-white', selectedMeta?.color)}>
              {selectedMeta?.icon}
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900">{selectedMeta?.label}</h3>
              <p className="text-xs text-slate-400">{reportData.length} registros</p>
            </div>
            <div className="ml-auto">
              <button
                disabled
                title="Disponible en Fase 2"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50 cursor-not-allowed"
              >
                <Download size={12} /> Exportar PDF
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            {['wo-history', 'cost-analysis'].includes(selected) && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desde</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 px-3 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasta</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 px-3 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500" />
                </div>
              </>
            )}
            {selected === 'wo-history' && (
              <>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-8 px-3 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500">
                  <option value="all">Todos los tipos</option>
                  <option value="preventive">Preventiva</option>
                  <option value="corrective">Correctiva</option>
                  <option value="predictive">Predictiva</option>
                  <option value="inspection">Inspección</option>
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-8 px-3 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500">
                  <option value="all">Todos los estados</option>
                  <option value="open">Abierta</option>
                  <option value="completed">Completada</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </>
            )}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {reportData.length === 0 ? (
              <div className="py-20 text-center">
                <FileText className="mx-auto text-slate-200 mb-3" size={40} />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin registros con los filtros actuales</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <ReportTable reportId={selected} data={reportData} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportTable({ reportId, data }: { reportId: ReportId; data: any[] }) {
  if (reportId === 'wo-history' || reportId === 'overdue-wo' || reportId === 'cost-analysis') {
    return (
      <table className="w-full text-sm min-w-[700px]">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {['OT#', 'Título', 'Activo', 'Tipo', 'Estado', 'Prioridad', 'Vence', reportId === 'cost-analysis' ? 'Costo' : 'Asignado'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((w: any) => (
            <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3 font-mono text-[10px] text-slate-400">#{w.woNumber}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-800 max-w-[180px] truncate">{w.title}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{w.assetNameSnapshot}</td>
              <td className="px-4 py-3 text-xs text-slate-500 capitalize">{w.woType}</td>
              <td className="px-4 py-3">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                  w.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                  w.status === 'open'      ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'
                }`}>{w.status}</span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 capitalize">{w.priority}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{w.dueDate ? format(new Date(w.dueDate), 'dd MMM yy', { locale: es }) : '—'}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-700">
                {reportId === 'cost-analysis' ? `$${(w.externalServiceCost || 0).toLocaleString()}` : (w.assignedToNameSnapshot || '—')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (reportId === 'pm-compliance' || reportId === 'upcoming-pm') {
    return (
      <table className="w-full text-sm min-w-[500px]">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {['Plan PM', 'Activo', 'Ciclo', 'Próx. Vencimiento', reportId === 'upcoming-pm' ? 'Criticidad' : 'Días restantes'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((p: any, i: number) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3 text-xs font-bold text-slate-800">{p.planName || '—'}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{p.assetName || '—'}</td>
              <td className="px-4 py-3 text-xs text-slate-400">#{p.cycleIndex}</td>
              <td className="px-4 py-3 text-xs text-slate-700 font-bold">{p.nextDueDate ? format(new Date(p.nextDueDate), 'dd MMM yyyy', { locale: es }) : 'Por medidor'}</td>
              <td className="px-4 py-3 text-xs">
                {reportId === 'upcoming-pm'
                  ? <span className="capitalize text-slate-600">{p.criticality}</span>
                  : <span className={p.daysUntil !== null && p.daysUntil < 0 ? 'text-red-600 font-black' : 'text-slate-600'}>
                      {p.daysUntil !== null ? (p.daysUntil < 0 ? `${Math.abs(p.daysUntil)}d vencido` : `${p.daysUntil}d`) : '—'}
                    </span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (reportId === 'technician-perf') {
    return (
      <table className="w-full text-sm min-w-[400px]">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {['Técnico', 'Asignadas', 'Completadas', 'Eficiencia'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((t: any) => (
            <tr key={t.name} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3 text-xs font-bold text-slate-800">{t.name}</td>
              <td className="px-4 py-3 text-xs text-slate-600">{t.assigned}</td>
              <td className="px-4 py-3 text-xs text-slate-600">{t.completed}</td>
              <td className="px-4 py-3">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  (t.assigned > 0 ? (t.completed / t.assigned) * 100 : 0) >= 80
                    ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {t.assigned > 0 ? Math.round((t.completed / t.assigned) * 100) : 0}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (reportId === 'inventory-usage') {
    return (
      <table className="w-full text-sm min-w-[400px]">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {['Ítem', 'Stock Actual', 'Mínimo', 'Unidad', 'Reponer'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((i: any) => (
            <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3 text-xs font-bold text-slate-800">{i.name}</td>
              <td className="px-4 py-3 text-xs font-black text-orange-600">{i.stockCurrent}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{i.stockMin}</td>
              <td className="px-4 py-3 text-xs text-slate-500">{i.unit}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-700">{Math.max(0, i.stockMin - i.stockCurrent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return null;
}
