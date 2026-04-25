import React from 'react';
import { useStore } from '../../../store';
import { Badge, Button, cn } from '../../../shared/components';
import { formatDate, formatRelative, formatCurrency } from '../../../shared/utils/generateId';
import { Package, TrendingDown, TrendingUp, ArrowLeftRight, Edit2 } from 'lucide-react';

interface InventoryDetailPanelProps {
  onEdit: (id: string) => void;
  onAdjust: (id: string) => void;
}

const MOVE_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; variant: string; sign: string }> = {
  in:         { label: 'Entrada',   icon: <TrendingUp size={13} />,    variant: 'ok',      sign: '+' },
  out:        { label: 'Salida',    icon: <TrendingDown size={13} />,  variant: 'danger',  sign: '-' },
  return:     { label: 'Devolución',icon: <ArrowLeftRight size={13} />,variant: 'info',    sign: '+' },
  adjustment: { label: 'Ajuste',    icon: <Edit2 size={13} />,         variant: 'neutral', sign: '→' },
};

export default function InventoryDetailPanel({ onEdit, onAdjust }: InventoryDetailPanelProps) {
  const { inventoryItems, stockMovements, selectedItemId } = useStore() as any;

  if (!selectedItemId) {
    return (
      <div className="w-80 xl:w-96 border-l border-border flex items-center justify-center h-full bg-slate-50/50 shrink-0">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-[24px] bg-white border border-border shadow-sm flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-slate-300" />
          </div>
          <h3 className="font-display font-bold text-tx text-sm">Panel de Control</h3>
          <p className="text-[11px] font-medium text-tx-4 mt-1 leading-relaxed px-4">Seleccione un insumo para gestionar existencias y ver historial.</p>
        </div>
      </div>
    );
  }

  const item = inventoryItems.find((i: any) => i.id === selectedItemId);
  if (!item) return null;

  const movements = stockMovements
    .filter((m: any) => m.inventoryItemId === selectedItemId)
    .slice(0, 20);

  const isLowStock = item.stockCurrent <= item.stockMin;
  const isOutOfStock = item.stockCurrent <= 0;
  const totalValue = item.stockCurrent * (item.unitCost || 0);

  return (
    <div className="w-80 xl:w-96 border-l border-border bg-white flex flex-col h-full shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-bg-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h3 className="font-display font-bold text-tx text-base truncate">{item.name}</h3>
            {item.partNumber && (
              <span className="font-mono text-xs text-tx-4 uppercase">{item.partNumber}</span>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="xs" icon={<Edit2 size={13} />} onClick={() => onEdit(item.id)}>
              Editar
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOutOfStock && <Badge variant="danger">Sin stock</Badge>}
          {isLowStock && !isOutOfStock && <Badge variant="warn">Bajo mínimo</Badge>}
          {!isLowStock && <Badge variant="ok">Stock OK</Badge>}
          {item.category && <Badge variant="neutral" className="text-[10px]">{item.category}</Badge>}
        </div>
      </div>

      {/* Stock stats */}
      <div className="grid grid-cols-3 border-b border-border divide-x divide-border shrink-0">
        {[
          { label: 'Actual', value: item.stockCurrent, variant: isOutOfStock ? 'danger' : isLowStock ? 'warn' : 'ok' },
          { label: 'Mínimo', value: item.stockMin, variant: 'neutral' },
          { label: 'Máximo', value: item.stockMax ?? '—', variant: 'neutral' },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col items-center py-3 bg-white">
            <p className={cn(
              'text-2xl font-display font-bold',
              stat.variant === 'danger' ? 'text-danger' :
              stat.variant === 'warn' ? 'text-warn' :
              stat.variant === 'ok' ? 'text-ok' : 'text-tx'
            )}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
            <p className="text-[10px] font-bold text-tx-4 uppercase tracking-wider">{stat.label}</p>
            <p className="text-[10px] text-tx-4">{item.unit}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="p-4 space-y-2 shrink-0 border-b border-border">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: 'Costo unitario', value: item.unitCost ? formatCurrency(item.unitCost) : '—' },
            { label: 'Valor total', value: item.unitCost ? formatCurrency(totalValue) : '—' },
            { label: 'Ubicación', value: item.locationBin || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-bg-3 rounded-xl px-3 py-2">
              <p className="text-[10px] font-bold text-tx-4 uppercase tracking-wider mb-0.5">{label}</p>
              <p className="font-medium text-tx truncate">{value}</p>
            </div>
          ))}
        </div>
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => onAdjust(item.id)}
        >
          Ajustar stock
        </Button>
      </div>

      {/* Movement history */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-[10px] font-bold text-tx-4 uppercase tracking-wider mb-3">
          Historial de movimientos
        </p>
        {movements.length === 0 ? (
          <div className="text-center text-xs text-tx-4 py-6">Sin movimientos registrados.</div>
        ) : (
          <div className="space-y-2">
            {movements.map((m: any) => {
              const cfg = MOVE_TYPE_CONFIG[m.type] || MOVE_TYPE_CONFIG.adjustment;
              return (
                <div key={m.id} className="flex items-center gap-3 bg-bg-3 rounded-xl px-3 py-2.5">
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white',
                    m.type === 'in' || m.type === 'return' ? 'bg-ok' : m.type === 'out' ? 'bg-danger' : 'bg-tx-3'
                  )}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-tx">{cfg.label}</p>
                    <p className="text-[10px] text-tx-4">{formatRelative(m.performedAt)}</p>
                    {m.reason && <p className="text-[10px] text-tx-4 italic truncate">{m.reason}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      'text-xs font-bold font-mono',
                      m.type === 'in' || m.type === 'return' ? 'text-ok' : m.type === 'out' ? 'text-danger' : 'text-tx-3'
                    )}>
                      {cfg.sign}{m.quantity}
                    </p>
                    <p className="text-[10px] text-tx-4 font-mono">→{m.balanceAfter}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
