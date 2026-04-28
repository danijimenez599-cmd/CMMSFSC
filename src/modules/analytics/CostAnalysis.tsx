import { DollarSign, TrendingUp } from 'lucide-react';
import { useKpiData, Period } from './hooks/useKpiData';
import { SectionHeader, HorizontalBar, ChartTooltip } from './components/ChartComponents';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ComposedChart, Line,
} from 'recharts';

interface Props { period: Period; custom?: { from: string; to: string }; filterPlant?: string; filterArea?: string; }

export default function CostAnalysis({ period, custom, filterPlant, filterArea }: Props) {
  const { costByType, topAssetsByWo, completedWos } = useKpiData(period, custom, filterPlant, filterArea);

  const totalCost = costByType.reduce((s: number, c: any) => s + c.cost, 0);
  const maxAssetCost = Math.max(...topAssetsByWo.map((a: any) => a.cost), 1);

  // Pareto data: assets sorted by cost with cumulative %
  const assetsCost = [...topAssetsByWo]
    .sort((a: any, b: any) => b.cost - a.cost)
    .filter((a: any) => a.cost > 0);
  let cumulative = 0;
  const paretoData = assetsCost.map((a: any) => {
    cumulative += a.cost;
    return {
      name: a.name.length > 14 ? a.name.slice(0, 14) + '…' : a.name,
      cost: a.cost,
      cumPct: totalCost > 0 ? Math.round((cumulative / totalCost) * 100) : 0,
    };
  });

  return (
    <div className="space-y-8">

      {/* Total cost hero */}
      <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl p-8">
        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Costo Total del Período</p>
        <p className="text-5xl font-black text-white tracking-tighter">
          ${totalCost.toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-[10px] font-bold text-white/40 mt-2 uppercase tracking-widest">
          Servicios externos + contratos registrados en OTs completadas
        </p>
        {/* placeholder for PDF */}
        <button
          disabled
          title="Disponible en Fase 2"
          className="mt-4 px-4 py-2 rounded-xl border border-teal-700/50 text-[10px] font-black text-teal-600 uppercase tracking-widest cursor-not-allowed opacity-50"
        >
          📥 Exportar PDF — Próximamente
        </button>
      </div>

      {/* Cost by type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <SectionHeader icon={<DollarSign size={16} />} title="Costo por Tipo de Mantenimiento" />
          {costByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={costByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="cost" name="Costo ($)" radius={[6, 6, 0, 0]}>
                  {costByType.map((c: any, i: number) => (
                    <rect key={i} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>

        {/* Pareto chart */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <SectionHeader
            icon={<TrendingUp size={16} />}
            title="Pareto de Activos por Costo"
            subtitle="80% del costo suele venir del 20% de activos"
          />
          {paretoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={paretoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} unit="%" />
                <Tooltip content={<ChartTooltip />} />
                <Bar yAxisId="left" dataKey="cost" name="Costo ($)" fill="#0f766e" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cumPct" name="Acumulado %" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>
      </div>

      {/* Cost ranking horizontal */}
      {topAssetsByWo.some((a: any) => a.cost > 0) && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <SectionHeader icon={<DollarSign size={16} />} title="Ranking de Costo por Activo" />
          <div className="space-y-3">
            {topAssetsByWo.filter((a: any) => a.cost > 0).map((a: any) => (
              <HorizontalBar
                key={a.name}
                name={a.name}
                value={a.cost}
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
