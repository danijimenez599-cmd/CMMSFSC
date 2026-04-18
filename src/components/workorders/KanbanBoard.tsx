import { clsx } from 'clsx'
import { useStore } from '@/store'
import { Badge } from '@/components/ui'
import { format, isPast } from 'date-fns'
import { PRIORITY_LABEL, PRIORITY_BADGE, TYPE_ICON } from './constants'
import type { WorkOrder } from '@/types'

const COLUMNS = [
  { id: 'OPEN', label: 'Abiertas', color: 'bg-gray-100', border: 'border-gray-200' },
  { id: 'ASSIGNED', label: 'Asignadas', color: 'bg-red-50', border: 'border-red-200' },
  { id: 'IN_PROGRESS', label: 'En Progreso', color: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'COMPLETED', label: 'Completadas', color: 'bg-green-50', border: 'border-green-200' },
]

export function KanbanBoard({ 
  workOrders, 
  onSelect 
}: { 
  workOrders: WorkOrder[]
  onSelect: (id: string) => void 
}) {
  const { db, updateWOStatus } = useStore()

  const handleDragStart = (e: React.DragEvent, woId: string) => {
    e.dataTransfer.setData('woId', woId)
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const woId = e.dataTransfer.getData('woId')
    if (!woId) return
    const wo = workOrders.find((w) => w.id === woId)
    if (!wo) return

    // Prevenir transiciones ilógicas o que requieran modales
    // Por ejemplo, para completar se requiere tiempo y notas (desde botón)
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      ;(window as any)._toast?.('Use el panel de detalles para completar o cancelar la orden.', 'info')
      return
    }

    if (wo.status !== status) {
      if (status === 'IN_PROGRESS') {
        updateWOStatus(wo.id, 'IN_PROGRESS', { startedAt: new Date().toISOString() })
      } else {
        updateWOStatus(wo.id, status as any)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="flex flex-1 h-full gap-4 overflow-x-auto p-4 hide-scrollbar snap-x snap-mandatory">
      {COLUMNS.map((col) => {
        const colWOs = workOrders.filter((w) => w.status === col.id)
        
        return (
          <div
            key={col.id}
            className={clsx(
              "flex-shrink-0 w-[85vw] max-w-[320px] flex flex-col rounded-2xl border snap-center",
              col.color, col.border
            )}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-black/5">
              <h3 className="font-display font-bold text-sm text-tx">{col.label}</h3>
              <span className="text-[10px] font-bold bg-white text-tx-2 px-2 py-0.5 rounded-full shadow-sm">
                {colWOs.length}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
              {colWOs.map((wo) => {
                const asset = db.assets.find((a) => a.id === wo.assetId)
                const assignee = db.users.find((u) => u.id === wo.assignedToId)
                const overdue = wo.dueDate && wo.status !== 'COMPLETED' && isPast(new Date(wo.dueDate))

                return (
                  <div
                    key={wo.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, wo.id)}
                    onClick={() => onSelect(wo.id)}
                    className={clsx(
                      "bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:border-brand/40 transition-colors",
                      overdue && "border-red-200"
                    )}
                  >
                      <div className="flex flex-col gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs">{TYPE_ICON[wo.type]}</span>
                          <Badge variant={PRIORITY_BADGE[wo.priority] ?? 'neutral'}>{PRIORITY_LABEL[wo.priority]}</Badge>
                        </div>
                        <div className="flex flex-col w-full min-w-0">
                          <div className="text-sm font-bold text-tx leading-tight break-words text-wrap overflow-wrap-anywhere">
                            {wo.title}
                          </div>
                          {asset && <div className="text-[11px] text-tx-3 mt-1.5 truncate font-medium border-t border-gray-50 pt-1.5 line-clamp-2 white-space-normal">🏭 {asset.name}</div>}
                        </div>
                      </div>
                    
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-50">
                      <div className="flex gap-1.5 items-center">
                        {assignee && (
                          <div className="w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center text-[9px] font-bold" title={assignee.name}>
                            {assignee.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {wo.dueDate && (
                        <span className={clsx("text-[9px] font-semibold", overdue ? "text-red-600" : "text-tx-3")}>
                          {format(new Date(wo.dueDate), 'd MMM')}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
