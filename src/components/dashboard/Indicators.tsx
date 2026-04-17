import { useState } from 'react'
import { useStore } from '@/store'
import { differenceInHours, isAfter } from 'date-fns'
import { Select, Input } from '@/components/ui'

function MetricCard({ title, value, unit, description }: { title: string, value: string | number, unit?: string, description?: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-cmms p-5 shadow-card flex flex-col gap-2">
      <h3 className="text-sm font-bold text-tx-2 tracking-wide uppercase">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="font-display font-bold text-4xl text-tx">{value}</span>
        {unit && <span className="text-sm font-semibold text-tx-3">{unit}</span>}
      </div>
      {description && <p className="text-xs text-tx-3">{description}</p>}
    </div>
  )
}

// Helper para obtener todos los hijos de un activo
function getDescendantAssetIds(assets: {id: string, parentId: string | null}[], rootId: string): string[] {
  const ids = new Set<string>()
  const queue = [rootId]
  while (queue.length > 0) {
    const current = queue.shift()!
    ids.add(current)
    const children = assets.filter(a => a.parentId === current).map(a => a.id)
    queue.push(...children)
  }
  return Array.from(ids)
}

export function Indicators() {
  const db = useStore((s) => s.db)
  const [selectedAssetId, setSelectedAssetId] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')

  const now = new Date()
  const startDateFilter = startDate ? new Date(startDate) : null

  // Collect relevant assets
  let relevantAssets = db.assets
  if (selectedAssetId !== 'all') {
    const descendantIds = getDescendantAssetIds(db.assets, selectedAssetId)
    relevantAssets = db.assets.filter(a => descendantIds.includes(a.id))
  }
  const relevantAssetIds = new Set(relevantAssets.map(a => a.id))

  // Filter Work Orders by Asset
  let relevantWorkOrders = selectedAssetId === 'all' 
    ? db.workOrders 
    : db.workOrders.filter(w => w.assetId && relevantAssetIds.has(w.assetId))

  // Filter Work Orders by Timeframe
  if (startDateFilter) {
    relevantWorkOrders = relevantWorkOrders.filter(w => isAfter(new Date(w.createdAt), startDateFilter) || new Date(w.createdAt).toDateString() === startDateFilter.toDateString())
  }

  // 1. MTTR (Tiempo Medio de Reparación)
  const correctiveCompleted = relevantWorkOrders.filter(
    (w) => w.type === 'CORRECTIVE' && w.status === 'COMPLETED'
  )

  let totalRepairTimeHours = 0
  let mttrCount = 0

  correctiveCompleted.forEach(wo => {
    if (wo.timeSpentMin) {
      totalRepairTimeHours += wo.timeSpentMin / 60
      mttrCount++
    } else if (wo.startedAt && wo.completedAt) {
      totalRepairTimeHours += differenceInHours(new Date(wo.completedAt), new Date(wo.startedAt))
      mttrCount++
    }
  })

  const mttr = mttrCount > 0 ? (totalRepairTimeHours / mttrCount) : 0

  // 2. MTBF (Tiempo Medio Entre Fallos)
  let totalOperationalTimeHours = 0

  relevantAssets.forEach(asset => {
    const installDate = asset.installDate ? new Date(asset.installDate) : new Date(db.workOrders[0]?.createdAt || now)
    
    // El inicio del periodo a medir depende del filtro
    let periodStart = installDate
    if (startDateFilter && isAfter(startDateFilter, installDate)) {
       periodStart = startDateFilter
    }
    
    if (isAfter(periodStart, now)) {
       periodStart = now
    }

    const hours = differenceInHours(now, periodStart)
    if (hours > 0) {
      totalOperationalTimeHours += hours
    }
  })

  // 3. Disponibilidad (Availability)
  const failures = correctiveCompleted.length
  const actualRunningTime = totalOperationalTimeHours - totalRepairTimeHours
  const mtbf = failures > 0 ? (actualRunningTime / failures) : actualRunningTime

  let availability = 100
  if (mtbf + mttr > 0 && failures > 0) {
    availability = (mtbf / (mtbf + mttr)) * 100
  }

  // 4. Backlog de Mantenimiento
  const backlog = relevantWorkOrders.filter(w => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status)).length

  // 5. Cumplimiento de PM (Preventive Maintenance Compliance)
  const pmWOs = relevantWorkOrders.filter(w => w.type === 'PREVENTIVE')
  const pmCompleted = pmWOs.filter(w => w.status === 'COMPLETED').length
  const pmCompliance = pmWOs.length > 0 ? Math.round((pmCompleted / pmWOs.length) * 100) : 100

  // Formateadores
  const formatNum = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(1)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-tx">KPIs e Indicadores</h1>
          <p className="text-sm text-tx-3 mt-1">Métricas clave de rendimiento de mantenimiento</p>
        </div>
        
        <div className="flex items-end gap-3 rounded-lg bg-white p-2 border border-gray-100 shadow-sm">
          {/* Filtro por Tiempo */}
          <div className="w-40 flex flex-col gap-1">
            <label className="text-[10px] font-bold text-tx-3 uppercase tracking-wide px-1">Calculado Desde</label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          {/* Filtro por Activo */}
          <div className="w-56 flex flex-col gap-1">
             <label className="text-[10px] font-bold text-tx-3 uppercase tracking-wide px-1">Filtro de Equipo</label>
            <Select 
              value={selectedAssetId} 
              onChange={(e) => setSelectedAssetId(e.target.value)}
            >
              <option value="all">Todo Planta</option>
              {db.assets.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          </div>

          <button 
            onClick={() => { setStartDate(''); setSelectedAssetId('all'); }}
            className="h-9 px-3 text-xs font-semibold text-brand bg-brand/5 hover:bg-brand/10 transition-colors rounded-md"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard 
          title="MTTR" 
          value={formatNum(mttr)} 
          unit="Horas" 
          description="Tiempo Medio de Reparación (Solo correctivos resueltos)"
        />
        <MetricCard 
          title="MTBF" 
          value={formatNum(mtbf)} 
          unit="Horas" 
          description={startDate ? `Tiempo Medio Entre Fallos desde ${startDate}` : "Tiempo Medio Entre Fallos histórico"}
        />
        <MetricCard 
          title="Disponibilidad" 
          value={formatNum(availability)} 
          unit="%" 
          description="Basado en la fórmula MTBF / (MTBF + MTTR)"
        />
        <MetricCard 
          title="Backlog" 
          value={backlog} 
          unit="Órdenes" 
          description="Trabajos pendientes (Abiertas, Asignadas y En Progreso)"
        />
        <MetricCard 
          title="Cumplimiento PM" 
          value={formatNum(pmCompliance)} 
          unit="%" 
          description="Preventivos completados vs generados"
        />
        <MetricCard 
          title="Fallos Totales" 
          value={failures} 
          unit="Eventos" 
          description="Total de órdenes correctivas completadas"
        />
      </div>

      {/* Breakdown per asset */}
      <div className="bg-white border border-gray-100 rounded-cmms p-5 shadow-card mt-2">
        <h3 className="font-display font-bold text-sm text-tx mb-4">Análisis de Fallos por {selectedAssetId === 'all' ? 'Activo (Top 10)' : 'Equipo o Rama'}</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-3 text-[11px] font-bold text-tx-3 uppercase tracking-wide bg-bg">Activo</th>
              <th className="text-right py-2 px-3 text-[11px] font-bold text-tx-3 uppercase tracking-wide bg-bg">Fallos</th>
              <th className="text-right py-2 px-3 text-[11px] font-bold text-tx-3 uppercase tracking-wide bg-bg">Tiempo Caídos (Hrs)</th>
            </tr>
          </thead>
          <tbody>
            {relevantAssets.map(asset => {
              const assetCorrectives = correctiveCompleted.filter(w => w.assetId === asset.id)
              let assetDowntime = 0
              assetCorrectives.forEach(wo => {
                if (wo.timeSpentMin) assetDowntime += wo.timeSpentMin / 60
                else if (wo.startedAt && wo.completedAt) assetDowntime += differenceInHours(new Date(wo.completedAt), new Date(wo.startedAt))
              })
              return { asset, failures: assetCorrectives.length, downtime: assetDowntime }
            })
            .filter(a => a.failures > 0)
            .sort((a, b) => b.failures - a.failures)
            .slice(0, selectedAssetId === 'all' ? 10 : 50)
            .map(row => (
              <tr key={row.asset.id} className="border-b border-gray-50 hover:bg-bg transition-colors">
                <td className="py-2.5 px-3 font-medium text-tx">{row.asset.name}</td>
                <td className="py-2.5 px-3 text-right text-tx-2 font-bold">{row.failures}</td>
                <td className="py-2.5 px-3 text-right text-tx-3">{formatNum(row.downtime)}</td>
              </tr>
            ))}
            {relevantAssets.filter(asset => {
              const assetCorrectives = correctiveCompleted.filter(w => w.assetId === asset.id)
              return assetCorrectives.length > 0
            }).length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-tx-3 italic bg-gray-50">
                   No se encontraron fallos para este filtro temporal y de equipo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
