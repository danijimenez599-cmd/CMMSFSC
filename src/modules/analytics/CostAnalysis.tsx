import { DollarSign, TrendingUp, Package, Truck } from 'lucide-react';
import { useKpiContext } from './KpiContext';
import { SectionHeader, HorizontalBar, ChartTooltip, KpiCard } from './components/ChartComponents';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart, Line, Cell, Legend,
} from 'recharts';

export default function CostAnalysis() {
  const kpi = useKpiContext();
  const { costByType, topAssetsByCost, overview } = kpi;

  const totalCost = overview.totalCost;
  const trend = overview.trends.totalCost;

  const maxAssetCost = Math.max(...topAssetsByCost.map((a: any) => a.cost), 1);

  // Pareto sobre topAssetsByCost (ya ordenado por costo)
  let cumulative = 0;
  const paretoData = topAssetsByCost.map((a: any) => {
    cumulative += a.cost;
    return {
      name: a.name.length > 14 ? a.name.slice(0, 14) + '…' : a.name,
      cost: a.cost,
      cumPct: totalCost > 0 ? Math.round((cumulative / totalCost) * 100) : 0,
    };
  });

  return (
    <div className="space-y-8">

      {/* Hero + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Costo Total del Período</p>
            <p className="text-4xl xl:text-5xl font-black text-white tracking-tighter">
              ${totalCost.toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {trend !== null && trend !== undefined && (
              <p className={`text-[11px] font-black mt-2 uppercase tracking-widest ${
                trend <= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs período anterior
              </p>
            )}
          </div>
          <p className="text-[10px] font-bold text-white/40 mt-4 uppercase tracking-widest">
            Servicios externos + repuestos consumidos en OTs completadas
          </p>
        </div>

        <KpiCard
          label="Servicios Externos"
          value={`$${overview.externalCost.toLocaleString('es-SV', { maximumFractionDigits: 0 })}`}
          sub="proveedores y contratistas"
          icon={<Truck size={20} />}
          color="bg-teal-600"
          accent="text-teal-700"
          trend={overview.trends.externalCost}
          trendDirection="lower"
        />
        <KpiCard
          label="Repuestos Consumidos"
          value={`$${overview.partsCost.toLocaleString('es-SV', { maximumFractionDigits: 0 })}`}
          sub="ítems usados en OTs"
          icon={<Package size={20} />}
          color="bg-orange-500"
          accent="text-orange-600"
          trend={overview.trends.partsCost}
          trendDirection="lower"
        />
      </div>

      {/* Cost by type stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <SectionHeader icon={<DollarSign size={16} />} title="Costo por Tipo de Mantenimiento" subtitle="Servicios + Repuestos" />
          {costByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={costByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                <Bar dataKey="external" name="Servicios" stackId="a" fill="#0f766e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="parts" name="Repuestos" stackId="a" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <SectionHeader
            icon={<TrendingUp size={16} />}
            title="Pareto de Activos por Costo"
            subtitle="80% del costo suele venir del 20% de activos"
          />
          {paretoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={paretoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} unit="%" />
                <Tooltip content={<ChartTooltip />} />
                <Bar yAxisId="left" dataKey="cost" name="Costo ($)" fill="#0f766e" radius={[4, 4, 0, 0]}>
                  {paretoData.map((_: any, i: number) => (
                    <Cell key={i} fill={i < 3 ? '#0f766e' : '#14b8a6'} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="cumPct" name="Acumulado %" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>
      </div>

      {/* Cost ranking horizontal */}
      {topAssetsByCost.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <SectionHeader icon={<DollarSign size={16} />} title="Ranking de Costo por Activo" subtitle="Top 10 activos más costosos del período" />
          <div className="space-y-3">
            {topAssetsByCost.map((a: any) => (
              <HorizontalBar
                key={a.name}
                name={a.name}
                value={Math.round(a.cost)}
                max={maxAssetCost}
                color="#0f766e"
                sub={`${a.count} OTs`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return <div className="py-12 text-center"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin costos registrados en el período</p></div>;
}
