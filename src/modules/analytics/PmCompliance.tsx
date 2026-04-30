import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarClock, Filter } from 'lucide-react';
import { useKpiContext } from './KpiContext';
import { useKpiTargets } from './config/kpiTargets';
import { SectionHeader, StatePill } from './components/ChartComponents';
import { cn } from '../../shared/utils/utils';

export default function PmCompliance() {
  const { pmComplianceByPlan, overview } = useKpiContext();
  const [targets] = useKpiTargets();
  const [stateFilter, setStateFilter] = useState<'all' | 'ok' | 'soon' | 'overdue'>('all');

  const filtered = pmComplianceByPlan.filter((p: any) =>
    stateFilter === 'all' ? true : p.state === stateFilter
  );

  const counts = {
    overdue: pmComplianceByPlan.filter((p: any) => p.state === 'overdue').length,
    soon:    pmComplianceByPlan.filter((p: any) => p.state === 'soon').length,
    ok:      pmComplianceByPlan.filter((p: any) => p.state === 'ok').length,
  };

  return (
    <div className="space-y-8">

      {/* Compliance Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
        <div className="relative shrink-0">
          {/* Big gauge */}
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="12" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={overview.pmCompliance >= targets.pmCompliance ? '#10b981' : overview.pmCompliance >= targets.pmCompliance * 0.75 ? '#f59e0b' : '#ef4444'}
              strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - overview.pmCompliance / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">{overview.pmCompliance}<span className="text-xl">%</span></span>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-0.5">Meta {targets.pmCompliance}%</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4 w-full">
          {[
            { label: 'Vencidos', value: counts.overdue, color: 'text-red-400', bg: 'bg-red-500/10', filter: 'overdue' as const },
            { label: 'Próximos', value: counts.soon,    color: 'text-amber-400', bg: 'bg-amber-500/10', filter: 'soon' as const },
            { label: 'Al Día',   value: counts.ok,      color: 'text-emerald-400', bg: 'bg-emerald-500/10', filter: 'ok' as const },
          ].map(c => (
            <button
              key={c.label}
              onClick={() => setStateFilter(prev => prev === c.filter ? 'all' : c.filter)}
              className={cn('rounded-2xl p-4 text-center transition-all border-2', c.bg,
                stateFilter === c.filter ? 'border-white/30' : 'border-transparent'
              )}
            >
              <p className={`text-3xl font-black ${c.color}`}>{c.value}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{c.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-slate-400" />
        {(['all', 'overdue', 'soon', 'ok'] as const).map(f => (
          <button
            key={f}
            onClick={() => setStateFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border',
              stateFilter === f
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            )}
          >
            {f === 'all' ? 'Todos' : f === 'overdue' ? 'Vencidos' : f === 'soon' ? 'Próximos' : 'Al Día'}
          </button>
        ))}
        <span className="text-[10px] font-bold text-slate-400 ml-2">{filtered.length} planes</span>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <SectionHeader
          icon={<CalendarClock size={16} />}
          title="Estado de Planes Activos"
          subtitle="Haz clic en un plan para ver su historial"
        />
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin planes en este estado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="border-b border-slate-100 bg-slate-50/50">
                <tr>
                  {['Plan PM', 'Activo', 'Ciclo', 'Próx. Vencimiento', 'OTs Completadas', 'Estado'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((plan: any) => (
                  <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-xs">{plan.planName}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{plan.assetName}</td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">#{plan.cycleIndex}</span>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {plan.nextDueDate ? (
                        <div>
                          <p className="font-bold text-slate-700">{format(new Date(plan.nextDueDate), 'dd MMM yyyy', { locale: es })}</p>
                          {plan.daysUntilDue !== null && (
                            <p className={`text-[10px] font-bold ${plan.daysUntilDue < 0 ? 'text-red-500' : plan.daysUntilDue <= 7 ? 'text-amber-500' : 'text-slate-400'}`}>
                              {plan.daysUntilDue < 0 ? `${Math.abs(plan.daysUntilDue)}d vencido` : `en ${plan.daysUntilDue}d`}
                            </p>
                          )}
                        </div>
                      ) : <span className="text-slate-300">Por medidor</span>}
                    </td>
                    <td className="px-5 py-4 text-xs font-black text-slate-900">{plan.completedInPeriod}</td>
                    <td className="px-5 py-4"><StatePill state={plan.state} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
