import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, TrendingUp,
  DollarSign, Package, Wrench, Target, CalendarCheck, Layers, Hourglass,
} from 'lucide-react';
import { KpiCard, SectionHeader, DonutChart } from './components/ChartComponents';
import { useKpiContext } from './KpiContext';
import { useKpiTargets } from './config/kpiTargets';

interface Props {
  onNavigate?: (view: string) => void;
}

function GaugeRing({ value, color, label, target }: { value: number; color: string; label: string; target?: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;
  const targetAngle = target !== undefined ? (target / 100) * circ : null;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-20 h-20 sm:w-28 sm:h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <motion.circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          {targetAngle !== null && (
            <circle
              cx="50" cy="50" r={r} fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              strokeDasharray={`2 ${circ}`}
              strokeDashoffset={circ - targetAngle}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl font-black text-white">{value}<span className="text-xs sm:text-sm">%</span></span>
        </div>
      </div>
      <p className="text-[8px] sm:text-[9px] font-black text-white/50 uppercase tracking-widest text-center leading-tight">{label}</p>
      {target !== undefined && (
        <p className="text-[8px] font-bold text-white/30 uppercase tracking-wider">Meta {target}%</p>
      )}
    </div>
  );
}

export default function KpiOverview({ onNavigate }: Props) {
  const kpi = useKpiContext();
  const [targets] = useKpiTargets();
  const { overview, woTypeDonut, woStatusDonut } = kpi;
  const t = overview.trends;

  const preventiveRatio = overview.total > 0
    ? Math.round((overview.preventives / overview.total) * 100)
    : 0;

  // Puntualidad real: 1 - vencidas / backlogActivo
  const punctuality = overview.backlogCount > 0
    ? Math.max(0, Math.round((1 - overview.overdueCount / overview.backlogCount) * 100))
    : 100;

  const cards = [
    {
      label: 'OTs en el Período',
      value: overview.total,
      sub: `${overview.completed} completadas`,
      icon: <Wrench size={20} />,
      color: 'bg-blue-600',
      accent: 'text-slate-900',
      trend: t.total,
      trendDirection: 'higher' as const,
      onClick: () => onNavigate?.('workorders'),
    },
    {
      label: 'Cumplimiento PM',
      value: `${overview.pmCompliance}%`,
      sub: 'preventivas a tiempo',
      icon: <Target size={20} />,
      color: overview.pmCompliance >= targets.pmCompliance ? 'bg-emerald-500' : overview.pmCompliance >= targets.pmCompliance * 0.75 ? 'bg-amber-500' : 'bg-red-500',
      accent: overview.pmCompliance >= targets.pmCompliance ? 'text-emerald-600' : overview.pmCompliance >= targets.pmCompliance * 0.75 ? 'text-amber-600' : 'text-red-600',
      trend: t.pmCompliance,
      trendDirection: 'higher' as const,
      targetHint: `Meta ${targets.pmCompliance}%`,
      targetMet: overview.pmCompliance >= targets.pmCompliance,
      onClick: () => onNavigate?.('pm'),
    },
    {
      label: 'SLA Cumplido',
      value: `${overview.slaCompliance}%`,
      sub: 'completadas dentro del dueDate',
      icon: <CheckCircle2 size={20} />,
      color: overview.slaCompliance >= targets.slaCompliance ? 'bg-blue-500' : 'bg-amber-500',
      accent: overview.slaCompliance >= targets.slaCompliance ? 'text-blue-600' : 'text-amber-600',
      trend: t.slaCompliance,
      trendDirection: 'higher' as const,
      targetHint: `Meta ${targets.slaCompliance}%`,
      targetMet: overview.slaCompliance >= targets.slaCompliance,
      onClick: () => onNavigate?.('workorders'),
    },
    {
      label: 'Schedule Compliance',
      value: `${overview.scheduleCompliance}%`,
      sub: 'ejecutadas en fecha planeada',
      icon: <CalendarCheck size={20} />,
      color: overview.scheduleCompliance >= targets.scheduleCompliance ? 'bg-emerald-500' : 'bg-amber-500',
      accent: overview.scheduleCompliance >= targets.scheduleCompliance ? 'text-emerald-600' : 'text-amber-600',
      trend: t.scheduleCompliance,
      trendDirection: 'higher' as const,
      targetHint: `Meta ${targets.scheduleCompliance}%`,
      targetMet: overview.scheduleCompliance >= targets.scheduleCompliance,
      onClick: () => onNavigate?.('workorders'),
    },
    {
      label: 'OTs Vencidas',
      value: overview.overdueCount,
      sub: 'requieren atención',
      icon: <AlertTriangle size={20} />,
      color: overview.overdueCount > targets.overdueMax ? 'bg-red-500' : 'bg-emerald-500',
      accent: overview.overdueCount > targets.overdueMax ? 'text-red-600' : 'text-emerald-600',
      targetMet: overview.overdueCount <= targets.overdueMax,
      onClick: () => onNavigate?.('workorders'),
    },
    {
      label: 'MTTR Correctivo',
      value: `${overview.mttr}h`,
      sub: 'tiempo medio de reparación',
      icon: <Clock size={20} />,
      color: overview.mttr <= targets.mttrHours ? 'bg-violet-500' : 'bg-amber-500',
      accent: overview.mttr <= targets.mttrHours ? 'text-violet-600' : 'text-amber-600',
      trend: t.mttr,
      trendDirection: 'lower' as const,
      targetHint: `Meta ≤${targets.mttrHours}h`,
      targetMet: overview.mttr <= targets.mttrHours,
    },
    {
      label: 'Backlog (horas)',
      value: `${overview.backlogHours}h`,
      sub: `${overview.backlogCount} OTs · prom. ${overview.backlogAvgAge}d`,
      icon: <Hourglass size={20} />,
      color: 'bg-slate-700',
      accent: 'text-slate-900',
      onClick: () => onNavigate?.('workorders'),
    },
    {
      label: 'Costo Total Período',
      value: overview.totalCost > 0 ? `$${overview.totalCost.toLocaleString()}` : '$0',
      sub: `Servicios $${Math.round(overview.externalCost).toLocaleString()} · Repuestos $${Math.round(overview.partsCost).toLocaleString()}`,
      icon: <DollarSign size={20} />,
      color: 'bg-teal-500',
      accent: 'text-teal-600',
      trend: t.totalCost,
      trendDirection: 'lower' as const,
      onClick: () => onNavigate?.('costs'),
    },
    {
      label: '% Preventivo',
      value: `${preventiveRatio}%`,
      sub: `${overview.preventives} prev. / ${overview.correctives} corr.`,
      icon: <Layers size={20} />,
      color: preventiveRatio >= targets.preventiveRatio ? 'bg-blue-500' : 'bg-amber-500',
      accent: preventiveRatio >= targets.preventiveRatio ? 'text-blue-600' : 'text-amber-600',
      targetHint: `Meta ${targets.preventiveRatio}%`,
      targetMet: preventiveRatio >= targets.preventiveRatio,
      onClick: () => onNavigate?.('workorders'),
    },
    {
      label: 'MTBF',
      value: overview.mtbf > 0 ? `${overview.mtbf}h` : '—',
      sub: 'tiempo medio entre fallos',
      icon: <TrendingUp size={20} />,
      color: 'bg-indigo-500',
      accent: 'text-indigo-600',
    },
    {
      label: 'Adherencia a Estimación',
      value: overview.estimateAdherence > 0 ? `${overview.estimateAdherence}%` : '—',
      sub: 'horas reales / estimadas',
      icon: <Hourglass size={20} />,
      color: 'bg-fuchsia-500',
      accent: 'text-fuchsia-600',
    },
    {
      label: 'Stock Crítico',
      value: overview.stockCritical,
      sub: 'ítems bajo mínimo',
      icon: <Package size={20} />,
      color: overview.stockCritical > 0 ? 'bg-orange-500' : 'bg-emerald-500',
      accent: overview.stockCritical > 0 ? 'text-orange-600' : 'text-emerald-600',
      onClick: () => onNavigate?.('inventory'),
    },
  ];

  return (
    <div className="space-y-10">
      {/* Gauge Row */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8">
        <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.25em] mb-6">Índices Clave de Salud</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 justify-items-center">
          <GaugeRing value={overview.pmCompliance} color="#10b981" label="Cumplimiento PM" target={targets.pmCompliance} />
          <GaugeRing value={overview.slaCompliance} color="#3b82f6" label="SLA OTs" target={targets.slaCompliance} />
          <GaugeRing value={preventiveRatio} color="#a855f7" label="% Preventivo" target={targets.preventiveRatio} />
          <GaugeRing value={punctuality} color="#f59e0b" label="Puntualidad Backlog" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div>
        <SectionHeader icon={<TrendingUp size={18} />} title="Indicadores de Período" subtitle="Tendencia vs período anterior · clic para drill-down" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <KpiCard {...c} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Donut Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <SectionHeader icon={<Wrench size={16} />} title="Por Tipo de OT" />
          {woTypeDonut.length > 0
            ? <DonutChart data={woTypeDonut as { name: string; value: number; color: string }[]} total={overview.total} label="Total" />
            : <EmptyChart />}
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <SectionHeader icon={<Target size={16} />} title="Estado Actual del Backlog" />
          {woStatusDonut.length > 0
            ? <DonutChart data={woStatusDonut as { name: string; value: number; color: string }[]} />
            : <EmptyChart />}
        </div>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="py-12 text-center">
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin datos en el período</p>
    </div>
  );
}
