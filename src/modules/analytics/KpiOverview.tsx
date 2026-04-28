import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, AlertTriangle, TrendingUp,
  DollarSign, Package, Wrench, Target,
} from 'lucide-react';
import { KpiCard, SectionHeader, DonutChart } from './components/ChartComponents';
import { useKpiData, Period } from './hooks/useKpiData';
import { cn } from '../../shared/utils/utils';

interface Props {
  period: Period;
  custom?: { from: string; to: string };
  filterPlant?: string;
  filterArea?: string;
  onNavigate?: (view: string) => void;
}

function GaugeRing({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
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
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl font-black text-white">{value}<span className="text-xs sm:text-sm">%</span></span>
        </div>
      </div>
      <p className="text-[8px] sm:text-[9px] font-black text-white/50 uppercase tracking-widest text-center leading-tight">{label}</p>
    </div>
  );
}

export default function KpiOverview({ period, custom, filterPlant, filterArea, onNavigate }: Props) {
  const kpi = useKpiData(period, custom, filterPlant, filterArea);
  const { overview, woTypeDonut, woStatusDonut } = kpi;

  const cards = [
    {
      label: 'OTs en el Período',
      value: overview.total,
      sub: `${overview.completed} completadas`,
      icon: <Wrench size={20} />,
      color: 'bg-blue-600',
      accent: 'text-slate-900',
      onClick: () => onNavigate?.('workorders'),
    },
    {
      label: 'Cumplimiento PM',
      value: `${overview.pmCompliance}%`,
      sub: 'órdenes preventivas',
      icon: <Target size={20} />,
      color: overview.pmCompliance >= 80 ? 'bg-emerald-500' : overview.pmCompliance >= 60 ? 'bg-amber-500' : 'bg-red-500',
      accent: overview.pmCompliance >= 80 ? 'text-emerald-600' : overview.pmCompliance >= 60 ? 'text-amber-600' : 'text-red-600',
      onClick: () => onNavigate?.('pm'),
    },
    {
      label: 'SLA Cumplido',
      value: `${overview.slaCompliance}%`,
      sub: 'completadas a tiempo',
      icon: <CheckCircle2 size={20} />,
      color: overview.slaCompliance >= 80 ? 'bg-blue-500' : 'bg-amber-500',
      accent: overview.slaCompliance >= 80 ? 'text-blue-600' : 'text-amber-600',
      onClick: () => onNavigate?.('workorders'),
    },
    {
      label: 'OTs Vencidas',
      value: overview.overdueCount,
      sub: 'requieren atención',
      icon: <AlertTriangle size={20} />,
      color: overview.overdueCount > 0 ? 'bg-red-500' : 'bg-emerald-500',
      accent: overview.overdueCount > 0 ? 'text-red-600' : 'text-emerald-600',
      onClick: () => onNavigate?.('workorders'),
    },
    {
      label: 'MTTR Promedio',
      value: `${overview.mttr}h`,
      sub: 'tiempo medio de reparación',
      icon: <Clock size={20} />,
      color: 'bg-violet-500',
      accent: 'text-violet-600',
    },
    {
      label: 'Costo Externo',
      value: overview.externalCost > 0 ? `$${overview.externalCost.toLocaleString()}` : '$0',
      sub: 'servicios y contratistas',
      icon: <DollarSign size={20} />,
      color: 'bg-teal-500',
      accent: 'text-teal-600',
      onClick: () => onNavigate?.('costs'),
    },
    {
      label: 'Correctivas vs Prev.',
      value: overview.total > 0 ? `${Math.round((overview.correctives / overview.total) * 100)}%` : '0%',
      sub: `${overview.correctives} correctivas / ${overview.preventives} prev.`,
      icon: <TrendingUp size={20} />,
      color: 'bg-amber-500',
      accent: 'text-amber-600',
      onClick: () => onNavigate?.('workorders'),
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
          <GaugeRing value={overview.pmCompliance} color="#10b981" label="Cumplimiento PM" />
          <GaugeRing value={overview.slaCompliance} color="#3b82f6" label="SLA OTs" />
          <GaugeRing
            value={overview.total > 0 ? Math.round((overview.preventives / overview.total) * 100) : 0}
            color="#a855f7"
            label="% Preventivo"
          />
          <GaugeRing
            value={overview.overdueCount === 0 ? 100 : Math.max(0, 100 - overview.overdueCount * 10)}
            color="#f59e0b"
            label="Puntualidad"
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div>
        <SectionHeader icon={<TrendingUp size={18} />} title="Indicadores de Período" subtitle="Haz clic en una tarjeta para navegar al módulo correspondiente" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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
