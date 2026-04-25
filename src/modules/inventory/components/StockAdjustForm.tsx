import React, { useState } from 'react';
import { useStore } from '../../../store';
import { Modal, Button, FormField, Input, Select } from '../../../shared/components';
import { StockAdjustInput } from '../types';
import { TrendingUp, TrendingDown, RotateCcw, Settings } from 'lucide-react';

interface StockAdjustFormProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ADJUST_TYPES = [
  { value: 'in',         label: 'Entrada',    icon: <TrendingUp size={16} />,    desc: 'Compra o recepción',   color: 'text-ok'   },
  { value: 'out',        label: 'Salida',     icon: <TrendingDown size={16} />,  desc: 'Uso en mantenimiento', color: 'text-danger' },
  { value: 'return',     label: 'Devolución', icon: <RotateCcw size={16} />,     desc: 'Regreso a bodega',     color: 'text-info'  },
  { value: 'adjustment', label: 'Ajuste',     icon: <Settings size={16} />,      desc: 'Corrección de conteo', color: 'text-warn'  },
];

export default function StockAdjustForm({ itemId, isOpen, onClose }: StockAdjustFormProps) {
  const { inventoryItems, adjustStock, workOrders, showToast } = useStore() as any;
  const item = inventoryItems.find((i: any) => i.id === itemId);
  const [type, setType] = useState<StockAdjustInput['type']>('in');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState('');
  const [workOrderId, setWorkOrderId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const preview = (() => {
    switch (type) {
      case 'in':         return item.stockCurrent + quantity;
      case 'out':        return Math.max(0, item.stockCurrent - quantity);
      case 'return':     return item.stockCurrent + quantity;
      case 'adjustment': return quantity;
    }
  })();

  const openWos = workOrders?.filter((w: any) => !['completed', 'cancelled'].includes(w.status)) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    setLoading(true);
    try {
      await adjustStock(itemId, {
        type,
        quantity: type === 'adjustment' ? quantity : Math.abs(quantity),
        workOrderId: workOrderId || null,
        reason: reason || null,
      });
      showToast({
        type: 'success',
        title: 'Stock actualizado',
        message: `${item.name}: ${item.stockCurrent} → ${preview} ${item.unit}`,
      });
      onClose();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Ajustar stock — ${item.name}`}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={quantity <= 0}>
            Registrar movimiento
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current stock indicator */}
        <div className="flex items-center justify-between bg-bg-3 border border-border rounded-2xl px-4 py-3">
          <div>
            <p className="text-xs text-tx-4">Stock actual</p>
            <p className="text-2xl font-display font-bold text-tx">{item.stockCurrent} <span className="text-sm font-sans text-tx-4">{item.unit}</span></p>
          </div>
          <div className="text-xl text-tx-4">→</div>
          <div className="text-right">
            <p className="text-xs text-tx-4">Nuevo stock</p>
            <p className={`text-2xl font-display font-bold ${preview < item.stockMin ? 'text-danger' : 'text-ok'}`}>
              {preview} <span className="text-sm font-sans text-tx-4">{item.unit}</span>
            </p>
          </div>
        </div>

        {/* Type */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ADJUST_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value as any)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm ${
                type === t.value
                  ? `border-brand bg-brand-light ${t.color}`
                  : 'border-border text-tx-3 hover:border-brand/30'
              }`}
            >
              <span className={type === t.value ? t.color : 'text-tx-4'}>{t.icon}</span>
              <span className="font-semibold text-xs">{t.label}</span>
              <span className="text-[10px] text-tx-4 text-center">{t.desc}</span>
            </button>
          ))}
        </div>

        {/* Quantity */}
        <FormField label={type === 'adjustment' ? 'Nuevo valor de stock' : 'Cantidad'}>
          <Input
            type="number"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            min={1}
            step={1}
            autoFocus
          />
        </FormField>

        {/* Linked WO (for out) */}
        {type === 'out' && (
          <FormField label="Orden de trabajo vinculada (opcional)">
            <Select value={workOrderId} onChange={e => setWorkOrderId(e.target.value)}>
              <option value="">Sin OT</option>
              {openWos.map((w: any) => (
                <option key={w.id} value={w.id}>{w.woNumber} — {w.title}</option>
              ))}
            </Select>
          </FormField>
        )}

        {/* Reason */}
        <FormField label="Motivo (opcional)">
          <Input
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder={type === 'adjustment' ? 'Ej. Conteo físico' : 'Ej. Compra proveedor XYZ'}
          />
        </FormField>
      </form>
    </Modal>
  );
}
