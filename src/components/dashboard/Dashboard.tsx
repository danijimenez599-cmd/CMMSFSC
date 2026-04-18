import { useStore } from '@/store'
import { Badge } from '@/components/ui'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import { Settings, Wrench, AlertTriangle, Clock, Activity, FileText } from 'lucide-react'

function BentoCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx(
      "bg-surface dark:bg-bg-2 border border-gray-100 dark:border-white/5 rounded-3xl p-5 shadow-cardHov flex flex-col snap-start min-w-0 overflow-hidden",
      className
    )}>
      {children}
    </div>
  )
}

function StatCard({ icon, value, label, className }: { icon: JSX.Element; value: number; label: string; className?: string }) {
  return (
    <BentoCard className={clsx("justify-between min-w-0 transition-transform hover:-translate-y-1", className)}>
      <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-2">
        {icon}
      </div>
      <div>
        <div className="font-display font-bold text-4xl text-tx leading-none">{value}</div>
        <div className="text-xs font-bold text-tx-3 uppercase tracking-wide mt-1">{label}</div>
      </div>
    </BentoCard>
  )
}

export function Dashboard() {
  const db = useStore((s) => s.db)

  const totalAssets  = db.assets.filter((a) => a.category === 'equip').length
  const openWO       = db.workOrders.filter((w) => ['OPEN','ASSIGNED','IN_PROGRESS'].includes(w.status)).length
  const lowStock     = db.inventoryItems.filter((i) => i.currentStock <= i.minStock).length
  const overdueWOs   = db.workOrders.filter((w) =>
    !['COMPLETED','CANCELLED'].includes(w.status) && w.dueDate && new Date(w.dueDate) < new Date()
  ).length

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
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto min-w-0">
      <div>
        <h1 className="font-display font-bold text-3xl tracking-tight text-tx">Dashboard</h1>
        <p className="text-sm text-tx-3 mt-1 font-medium">Resumen general de mantenimiento</p>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-min md:auto-rows-[160px]">
        
        {/* Main large block for recent orders -> in grid spans 2x2 */}
        <BentoCard className="col-span-1 md:col-span-2 xl:col-span-2 row-span-2 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-tx flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand" /> Órdenes Recientes
            </h3>
            <span className="text-xs font-bold bg-brand/10 text-brand px-2 py-1 rounded-full">{recentWOs.length}</span>
          </div>
          {recentWOs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-tx-3">
              <FileText className="w-12 h-12 opacity-20 mb-2" />
              <p className="text-sm">No hay órdenes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1 hide-scrollbar">
              <table className="w-full text-sm border-collapse min-w-[320px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5">
                    {['Orden','Activo','Estado','Fecha'].map((h) => (
                      <th key={h} className="text-left py-2 px-2 text-[10px] font-bold text-tx-3 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentWOs.map((wo) => {
                    const asset = db.assets.find((a) => a.id === wo.assetId)
                    return (
                      <tr key={wo.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-bg/50 transition-colors">
                        <td className="py-3 px-2 font-semibold text-tx leading-tight break-words text-wrap overflow-wrap-anywhere whitespace-normal min-w-[120px]">{wo.title}</td>
                        <td className="py-3 px-2 text-tx-2 text-xs truncate max-w-[100px]">{asset?.name ?? '—'}</td>
                        <td className="py-3 px-2">
                          <Badge variant={woBadge[wo.status] ?? 'neutral'}>{woLabel[wo.status] ?? wo.status}</Badge>
                        </td>
                        <td className="py-3 px-2 text-tx-3 text-xs">
                          {format(new Date(wo.createdAt), 'd MMM')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </BentoCard>

        {/* Small metric blocks */}
        <StatCard icon={<Wrench className="w-5 h-5" />} value={openWO} label="OTs Activas" className="bg-brand text-white [&_*]:text-white border-transparent" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} value={lowStock} label="Stock Bajo" className={lowStock > 0 ? "bg-red-50 dark:bg-red-950/20" : ""} />
        <StatCard icon={<Settings className="w-5 h-5" />} value={totalAssets} label="Equipos" />
        <StatCard icon={<Clock className="w-5 h-5" />} value={overdueWOs} label="OTs Vencidas" />
        
        {/* Status bars block spans 1x2 or 2x1 */}
        <BentoCard className="col-span-1 md:col-span-2 xl:col-span-2 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-brand" />
            <h3 className="font-display font-bold text-tx">Salud de Operación</h3>
          </div>
          <div className="flex flex-col justify-center gap-4 flex-1">
            {Object.entries(statusCounts).map(([status, count]) => {
              if (count === 0 && !['OPEN','IN_PROGRESS'].includes(status)) return null;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-tx-2 w-24 flex-shrink-0">{statusLabels[status]}</span>
                  <div className="flex-1 h-3 bg-bg-3 rounded-full overflow-hidden">
                    <div
                      className={clsx("h-full rounded-full transition-all duration-1000 ease-out", status === 'COMPLETED' ? 'bg-green-500' : 'bg-brand')}
                      style={{ width: total ? `${Math.round((count/total)*100)}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs font-bold text-tx-3 w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </BentoCard>

      </div>
    </div>
  )
}
