import { Package, AlertTriangle } from 'lucide-react';
import { useKpiData, Period } from './hooks/useKpiData';
import { SectionHeader, KpiCard, HorizontalBar } from './components/ChartComponents';

interface Props { period: Period; custom?: { from: string; to: string }; filterPlant?: string; filterArea?: string; }

export default function InventoryKpis({ period, custom, filterPlant, filterArea }: Props) {
  const { inventoryKpis } = useKpiData(period, custom, filterPlant, filterArea);
  const { total, belowMin, totalValue, belowMinItems } = inventoryKpis;
  const maxStock = Math.max(...belowMinItems.map((i: any) => i.stockMin), 1);

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          label="Total Ítems Activos"
          value={total}
          icon={<Package size={20} />}
          color="bg-slate-700"
          accent="text-slate-900"
        />
        <KpiCard
          label="Bajo Mínimo"
          value={belowMin}
          sub="requieren reposición"
          icon={<AlertTriangle size={20} />}
          color={belowMin > 0 ? 'bg-orange-500' : 'bg-emerald-500'}
          accent={belowMin > 0 ? 'text-orange-600' : 'text-emerald-600'}
        />
        <KpiCard
          label="Valor Total en Stock"
          value={`$${totalValue.toLocaleString('es-SV', { maximumFractionDigits: 0 })}`}
          icon={<Package size={20} />}
          color="bg-teal-500"
          accent="text-teal-700"
        />
      </div>

      {belowMinItems.length > 0 && (
        <div className="bg-white rounded-3xl border border-orange-100 p-6 shadow-sm">
          <SectionHeader
            icon={<AlertTriangle size={16} />}
            title="Ítems que Requieren Reposición"
            subtitle="Stock actual ≤ mínimo configurado"
          />
          <div className="space-y-4">
            {belowMinItems.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    Stock actual: <span className="text-orange-600">{item.stockCurrent} {item.unit}</span>
                    {' · '}Mínimo: {item.stockMin} {item.unit}
                    {item.partNumber && <span className="ml-2 font-mono text-slate-300">#{item.partNumber}</span>}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[9px] font-black text-orange-600 uppercase tracking-wider">Reponer</p>
                  <p className="text-sm font-black text-slate-900">{Math.max(0, item.stockMin - item.stockCurrent + (item.stockMax || item.stockMin))} {item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {belowMinItems.length === 0 && (
        <div className="py-16 text-center bg-emerald-50 rounded-3xl border border-emerald-100">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm font-bold text-emerald-700">Inventario saludable</p>
          <p className="text-xs text-emerald-500 mt-1">Todos los ítems están por encima del mínimo requerido</p>
        </div>
      )}
    </div>
  );
}
