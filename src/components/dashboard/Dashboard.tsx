import { useStore } from '@/store'
import { Badge } from '@/components/ui'
import { format } from 'date-fns'

function StatCard({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-cmms p-5 shadow-card hover:-translate-y-0.5 transition-transform flex flex-col gap-1.5">
      <div className="text-2xl">{icon}</div>
      <div className="font-display font-bold text-4xl text-tx leading-none">{value}</div>
      <div className="text-[11px] font-bold text-tx-3 uppercase tracking-wide">{label}</div>
    </div>
  )
}

export function Dashboard() {
  const db = useStore((s) => s.db)

  const totalAssets  = db.assets.length
  const openWO       = db.workOrders.filter((w) => ['OPEN','ASSIGNED','IN_PROGRESS'].includes(w.status)).length
  const activePlans  = db.pmPlans.filter((p) => p.active).length
  const lowStock     = db.inventoryItems.filter((i) => i.currentStock <= i.minStock).length

  const statusCounts = {
    OPEN:        db.workOrders.filter((o) => o.status === 'OPEN').length,
    ASSIGNED:    db.workOrders.filter((o) => o.status === 'ASSIGNED').length,
    IN_PROGRESS: db.workOrders.filter((o) => o.status === 'IN_PROGRESS').length,
    COMPLETED:   db.workOrders.filter((o) => o.status === 'COMPLETED').length,
    CANCELLED:   db.workOrders.filter((o) => o.status === 'CANCELLED').length,
  }
  const total = db.workOrders.length

  const statusLabels: Record<string, string> = {
    OPEN:'Abiertas', ASSIGNED:'Asignadas', IN_PROGRESS:'En Progreso',
    COMPLETED:'Completadas', CANCELLED:'Canceladas',
  }

  const recentWOs = [...db.workOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  const woBadge: Record<string, 'open'|'scheduled'|'ok'|'paused'> = {
    OPEN:'open', ASSIGNED:'scheduled', IN_PROGRESS:'open', COMPLETED:'ok', CANCELLED:'paused'
  }
  const woLabel: Record<string, string> = {
    OPEN:'Abierta', ASSIGNED:'Asignada', IN_PROGRESS:'En Progreso', COMPLETED:'Completada', CANCELLED:'Cancelada'
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-tx">Dashboard</h1>
        <p className="text-sm text-tx-3 mt-1">Resumen de mantenimiento</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🏭" value={totalAssets}  label="Activos" />
        <StatCard icon="🔧" value={openWO}       label="Órdenes Abiertas" />
        <StatCard icon="🛡️" value={activePlans}  label="Planes Activos" />
        <StatCard icon="⚠️" value={lowStock}     label="Stock Bajo" />
      </div>

      {/* Status bars */}
      <div className="bg-white border border-gray-100 rounded-cmms p-5 shadow-card">
        <h3 className="font-display font-bold text-sm text-tx mb-4">Órdenes por Estado</h3>
        <div className="flex flex-col gap-2.5">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-tx-2 w-24 flex-shrink-0">{statusLabels[status]}</span>
              <div className="flex-1 h-2 bg-bg-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-500"
                  style={{ width: total ? `${Math.round((count/total)*100)}%` : '0%' }}
                />
              </div>
              <span className="text-xs font-bold text-tx-3 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-100 rounded-cmms p-5 shadow-card">
        <h3 className="font-display font-bold text-sm text-tx mb-4">Órdenes Recientes</h3>
        {recentWOs.length === 0 ? (
          <p className="text-sm text-tx-3">No hay órdenes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Orden','Activo','Estado','Fecha'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-[11px] font-bold text-tx-3 uppercase tracking-wide bg-bg">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentWOs.map((wo) => {
                  const asset = db.assets.find((a) => a.id === wo.assetId)
                  return (
                    <tr key={wo.id} className="border-b border-gray-50 hover:bg-bg transition-colors">
                      <td className="py-2.5 px-3 font-medium text-tx">{wo.title}</td>
                      <td className="py-2.5 px-3 text-tx-2">{asset?.name ?? '—'}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={woBadge[wo.status] ?? 'neutral'}>{woLabel[wo.status] ?? wo.status}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-tx-3 text-xs">
                        {format(new Date(wo.createdAt), 'd MMM')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
