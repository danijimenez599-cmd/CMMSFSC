import React from 'react';
import { useStore } from '../../../store';
import { Badge, Avatar, cn } from '../../../shared/components';
import { WO_STATUS_LABELS, WO_PRIORITY_CONFIG, isOverdue } from '../../workorders/utils/statusHelpers';
import { formatDate } from '../../../shared/utils/generateId';
import { AlertTriangle } from 'lucide-react';

export default function CriticalWoTable() {
  const { workOrders, assets, users, selectWo, setModule } = useStore() as any;

  const criticalWos = workOrders
    .filter((wo: any) =>
      !['completed', 'cancelled'].includes(wo.status) &&
      (wo.priority === 'critical' || wo.priority === 'high' || isOverdue(wo))
    )
    .sort((a: any, b: any) => {
      const pw: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return pw[a.priority] - pw[b.priority];
    })
    .slice(0, 8);

  if (criticalWos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-ok-bg flex items-center justify-center mb-3">
          <span className="text-ok text-xl">✓</span>
        </div>
        <p className="font-semibold text-ok">Sin OTs críticas</p>
        <p className="text-sm text-tx-4 mt-1">No hay órdenes de alta prioridad pendientes.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] text-tx-4 uppercase font-bold tracking-wider">
            <th className="text-left px-2 py-2">OT</th>
            <th className="text-left px-2 py-2 hidden sm:table-cell">Activo</th>
            <th className="text-left px-2 py-2">Estado</th>
            <th className="text-left px-2 py-2 hidden md:table-cell">Asignado</th>
            <th className="text-left px-2 py-2 hidden lg:table-cell">Vencimiento</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {criticalWos.map((wo: any) => {
            const asset = assets.find((a: any) => a.id === wo.assetId);
            const assignee = users.find((u: any) => u.id === wo.assignedTo);
            const overdue = isOverdue(wo);
            const prioConfig = WO_PRIORITY_CONFIG[wo.priority];

            return (
              <tr
                key={wo.id}
                onClick={() => { selectWo(wo.id); setModule('workorders'); }}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-bg-3/50 border-l-2',
                  prioConfig.textColor.replace('text-', 'border-')
                )}
              >
                <td className="px-2 py-3">
                  <div className="flex items-center gap-1.5">
                    {wo.priority === 'critical' && <AlertTriangle size={13} className="text-danger shrink-0" />}
                    <div>
                      <p className="font-mono text-[10px] font-bold text-brand">{wo.woNumber}</p>
                      <p className="font-medium text-tx truncate max-w-[120px] sm:max-w-none">{wo.title}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 text-tx-3 hidden sm:table-cell">
                  <p className="truncate max-w-[100px]">{asset?.name || '—'}</p>
                </td>
                <td className="px-2 py-3">
                  <Badge variant={wo.status as any} className="text-[10px]">
                    {WO_STATUS_LABELS[wo.status]}
                  </Badge>
                </td>
                <td className="px-2 py-3 hidden md:table-cell">
                  {assignee ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar name={assignee.fullName} size="xs" />
                      <span className="text-xs truncate max-w-[80px]">{assignee.fullName}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-tx-4 italic">Sin asignar</span>
                  )}
                </td>
                <td className={cn('px-2 py-3 text-xs font-medium hidden lg:table-cell', overdue ? 'text-danger' : 'text-tx-3')}>
                  {wo.dueDate ? (overdue ? `⚠️ ${formatDate(wo.dueDate)}` : formatDate(wo.dueDate)) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
