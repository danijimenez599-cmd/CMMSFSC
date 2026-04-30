import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Wrench, Users, AlertTriangle, Clock, Hourglass, CalendarCheck } from 'lucide-react';
import { useKpiContext } from './KpiContext';
import {
  SectionHeader, StackedBarChart, HorizontalBar, KpiCard,
} from './components/ChartComponents';
import { WO_TYPE_COLORS, WO_TYPE_LABELS } from './constants';

export default function WoAnalytics() {
  const kpi = useKpiContext();
  const { woByWeek, topAssetsByWo, techPerformance, overdueWos, periodWos, overview, backlog } = kpi;

  const [drillType, setDrillType] = useState<string | null>(null);

  const drillWos = drillType
    ? periodWos.filter((w: any) => w.woType === drillType)
    : [];

  const maxAsset = Math.max(...topAssetsByWo.map((a: any) => a.count), 1);
  const maxTech  = Math.max(...techPerformance.map((t: any) => t.assigned), 1);

  return (
    <div className="space-y-10">

      {/* Backlog summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Backlog total"
          value={backlog.count}
          sub={`${backlog.totalHours}h estimadas`}
          icon={<Hourglass size={20} />}
          color="bg-slate-700"
          accent="text-slate-900"
        />
        <KpiCard
          label="OTs Vencidas"
          value={backlog.overdueCount}
          sub="fuera de SLA"
          icon={<AlertTriangle size={20} />}
          color={backlog.overdueCount > 0 ? 'bg-red-500' : 'bg-emerald-500'}
          accent={backlog.overdueCount > 0 ? 'text-red-600' : 'text-emerald-600'}
        />
        <KpiCard
          label="Edad promedio"
          value={`${backlog.avgAge}d`}
          sub={`más antigua: ${backlog.oldest}d`}
          icon={<Clock size={20} />}
          color="bg-amber-500"
          accent="text-amber-600"
        />
        <KpiCard
          label="Schedule Compliance"
          value={`${overview.scheduleCompliance}%`}
          sub="ejecutadas en fecha planeada"
          icon={<CalendarCheck size={20} />}
          color={overview.scheduleCompliance >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}
          accent={overview.scheduleCompliance >= 80 ? 'text-emerald-600' : 'text-amber-600'}
          trend={overview.trends.scheduleCompliance}
          trendDirection="higher"
        />
      </div>

      {/* Stacked Bars by week */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <SectionHeader
          icon={<Wrench size={16} />}
          title="OTs por Semana"
          subtitle="Haz clic en una barra para ver el desglose"
        />
        {woByWeek.length > 0 ? (
          <StackedBarChart
            data={woByWeek}
            xKey="label"
            bars={[
              { key: 'preventive', name: 'Preventiva', color: WO_TYPE_COLORS.preventive },
              { key: 'corrective', name: 'Correctiva', color: WO_TYPE_COLORS.corrective },
              { key: 'predictive', name: 'Predictiva', color: WO_TYPE_COLORS.predictive },
              { key: 'inspection', name: 'Inspección', color: WO_TYPE_COLORS.inspection },
            ]}
            onBarClick={(d) => {
              if (d?.activePayload?.[0]) {
                const key = d.activePayload[0].dataKey;
                setDrillType(prev => prev === key ? null : key);
              }
            }}
          />
        ) : <EmptyState />}

        {drillType && drillWos.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              {WO_TYPE_LABELS[drillType]} — {drillWos.length} órdenes
            </p>
            <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-none">
              {drillWos.slice(0, 20).map((w: any) => (
                <div key={w.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: WO_TYPE_COLORS[drillType] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{w.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{w.assetNameSnapshot}</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                    w.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    w.status === 'open' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'
                  }`}>{w.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Assets + Technicians */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <SectionHeader icon={<AlertTriangle size={16} />} title="Activos con más OTs" subtitle="Pareto de carga de trabajo" />
          {topAssetsByWo.length > 0 ? (
            <div className="space-y-3">
              {topAssetsByWo.map((a: any) => (
                <HorizontalBar
                  key={a.name}
                  name={a.name}
                  value={a.count}
                  max={maxAsset}
                  color="#3b82f6"
                  sub={a.cost > 0 ? `$${Math.round(a.cost).toLocaleString()}` : undefined}
                />
              ))}
            </div>
          ) : <EmptyState />}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <SectionHeader icon={<Users size={16} />} title="Rendimiento por Técnico" subtitle="Asignadas vs completadas" />
          {techPerformance.length > 0 ? (
            <div className="space-y-4">
              {techPerformance.map((t: any) => (
                <div key={t.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 truncate flex-1 mr-2">{t.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400">{t.completed}/{t.assigned}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        t.efficiency >= 80 ? 'bg-emerald-50 text-emerald-700' :
                        t.efficiency >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                      }`}>{t.efficiency}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(t.assigned / maxTech) * 100}%`, background: '#3b82f6' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState />}
        </div>
      </div>

      {/* Overdue Table */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <SectionHeader
          icon={<Clock size={16} />}
          title="OTs Vencidas"
          subtitle={`${overdueWos.length} órdenes fuera de SLA`}
        />
        {overdueWos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {['OT#', 'Título', 'Activo', 'Vencía', 'Días retraso', 'Prioridad'].map(h => (
                    <th key={h} className="text-left pb-3 text-[9px] font-black text-slate-400 uppercase tracking-widest pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {overdueWos.slice(0, 15).map((w: any) => {
                  const dueDate = new Date(w.dueDate);
                  const days = Math.floor((Date.now() - dueDate.getTime()) / 86400000);
                  return (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 font-mono text-[10px] text-slate-400">#{w.woNumber}</td>
                      <td className="py-3 pr-4 font-bold text-slate-800 text-xs truncate max-w-[160px]">{w.title}</td>
                      <td className="py-3 pr-4 text-xs text-slate-500">{w.assetNameSnapshot}</td>
                      <td className="py-3 pr-4 text-xs text-slate-500">{format(dueDate, 'dd MMM', { locale: es })}</td>
                      <td className="py-3 pr-4">
                        <span className="bg-red-50 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-full">+{days}d</span>
                      </td>
                      <td className="py-3">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                          w.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          w.priority === 'high'     ? 'bg-orange-50 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{w.priority}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {overdueWos.length > 15 && (
              <p className="text-[10px] font-bold text-slate-400 text-center mt-3">
                Mostrando 15 de {overdueWos.length} OTs vencidas
              </p>
            )}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-sm font-bold text-emerald-600">¡Sin OTs vencidas!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return <div className="py-12 text-center"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin datos en el período</p></div>;
}
