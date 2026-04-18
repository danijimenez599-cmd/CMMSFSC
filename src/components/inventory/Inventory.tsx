import { useState } from 'react'
import { useStore, useStockStatus } from '@/store'
import type { InventoryItem } from '@/types'
import {
  Badge, Button, Modal, FormField, Input, Select,
  Textarea, StatPill, EmptyState,
} from '@/components/ui'

const CATEGORIES: Record<string, string> = {
  consumable: 'Consumible',
  lubricant:  'Lubricante',
  mechanical: 'Mecánico',
  electrical: 'Eléctrico',
}

// ── Formulario ítem ───────────────────────────────────────────────
function ItemForm({ itemId, onClose }: { itemId: string | null; onClose: () => void }) {
  const { db, saveInventoryItem, deleteInventoryItem } = useStore()
  const existing = itemId ? db.inventoryItems.find((i) => i.id === itemId) : null

  const [form, setForm] = useState({
    name:         existing?.name         ?? '',
    sku:          existing?.sku          ?? '',
    category:     existing?.category     ?? 'consumable',
    unit:         existing?.unit         ?? 'pcs',
    currentStock: existing?.currentStock ?? 0,
    minStock:     existing?.minStock     ?? 0,
    unitCost:     existing?.unitCost     ?? 0,
    location:     existing?.location     ?? '',
    supplier:     existing?.supplier     ?? '',
    notes:        existing?.notes        ?? '',
  })
  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) return
    saveInventoryItem({ id: itemId ?? undefined, ...form })
    onClose()
  }

  return (
    <Modal
      open
      title={itemId ? 'Editar Ítem' : 'Nuevo Ítem de Inventario'}
      onClose={onClose}
      large
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          {itemId && (
            <Button variant="danger"
              onClick={() => { if (confirm('¿Eliminar ítem?')) { deleteInventoryItem(itemId); onClose() } }}>
              Eliminar
            </Button>
          )}
          <Button onClick={handleSave} className="ml-auto">Guardar</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="col-span-1 md:col-span-2">
          <FormField label="Nombre *">
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nombre del ítem" />
          </FormField>
        </div>
        <FormField label="SKU / Código">
          <Input value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="Ej. FLT-AIR-01" />
        </FormField>
        <FormField label="Categoría">
          <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {Object.entries(CATEGORIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </FormField>
        <FormField label="Unidad">
          <Input value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="pcs, litros, metros..." />
        </FormField>
        <FormField label="Costo unitario ($)">
          <Input type="number" min="0" step="0.01"
            value={form.unitCost} onChange={(e) => set('unitCost', parseFloat(e.target.value) || 0)} />
        </FormField>
        <FormField label="Stock actual">
          <Input type="number" min="0"
            value={form.currentStock} onChange={(e) => set('currentStock', parseFloat(e.target.value) || 0)} />
        </FormField>
        <FormField label="Punto de reorden" hint="Alerta cuando el stock llega a este nivel. Debe quedar stock suficiente para operar mientras llega el pedido.">
          <Input type="number" min="0"
            value={form.minStock} onChange={(e) => set('minStock', parseFloat(e.target.value) || 0)} />
        </FormField>
        <FormField label="Ubicación en almacén">
          <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Ej. Rack A-1" />
        </FormField>
        <FormField label="Proveedor">
          <Input value={form.supplier} onChange={(e) => set('supplier', e.target.value)} placeholder="Nombre del proveedor" />
        </FormField>
        <div className="col-span-1 md:col-span-2">
          <FormField label="Notas">
            <Textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </FormField>
        </div>
      </div>
    </Modal>
  )
}

// ── Modal ajuste de stock ─────────────────────────────────────────
function AdjustModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { adjustStock } = useStore()
  const [stock, setStock] = useState(String(item.currentStock))

  const handleAdjust = () => {
    const v = parseFloat(stock)
    if (isNaN(v) || v < 0) return
    adjustStock(item.id, v)
    onClose()
  }

  return (
    <Modal open title={`Ajustar Stock — ${item.name}`} onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAdjust}>Confirmar</Button>
        </>
      }>
      <p className="text-sm text-tx-2 mb-4">
        Stock actual: <strong>{item.currentStock} {item.unit}</strong>
      </p>
      <FormField label="Nuevo valor de stock">
        <Input type="number" min="0" value={stock}
          onChange={(e) => setStock(e.target.value)} />
      </FormField>
    </Modal>
  )
}

// ── Fila de tabla ─────────────────────────────────────────────────
function ItemRow({ item, onEdit, onAdjust }: {
  item: InventoryItem
  onEdit:   () => void
  onAdjust: () => void
}) {
  const status = useStockStatus(item)
  const stockBadge = status === 'ok'
    ? <Badge variant="ok">OK</Badge>
    : status === 'wn'
    ? <Badge variant="warn">Mínimo</Badge>
    : item.currentStock === 0
    ? <Badge variant="err">Sin stock</Badge>
    : <Badge variant="err">Bajo</Badge>

  const stockColor = status === 'ok'
    ? 'text-green-600' : status === 'wn'
    ? 'text-amber-600' : 'text-red-600'

  return (
    <tr className="border-b border-gray-50 hover:bg-bg transition-colors">
      <td className="py-2.5 px-3 font-mono text-xs text-tx-3">{item.sku}</td>
      <td className="py-2.5 px-3 font-medium text-tx">{item.name}</td>
      <td className="py-2.5 px-3 text-tx-2 text-xs">{CATEGORIES[item.category] ?? item.category}</td>
      <td className={`py-2.5 px-3 font-bold text-right ${stockColor}`}>
        {item.currentStock} <span className="font-normal text-tx-3 text-xs">{item.unit}</span>
      </td>
      <td className="py-2.5 px-3 text-right text-tx-3 text-xs">{item.minStock}</td>
      <td className="py-2.5 px-3">{stockBadge}</td>
      <td className="py-2.5 px-3 text-xs text-tx-2">{item.location || '—'}</td>
      <td className="py-2.5 px-3 text-right text-xs text-tx-2">${item.unitCost.toFixed(2)}</td>
      <td className="py-2.5 px-3">
        <div className="flex gap-1.5">
          <Button size="xs" variant="secondary" onClick={onEdit}>Editar</Button>
          <Button size="xs" variant="ghost"     onClick={onAdjust}>Ajustar</Button>
        </div>
      </td>
    </tr>
  )
}

// ── Vista principal ───────────────────────────────────────────────
export function Inventory() {
  const db = useStore((s) => s.db)
  const [editId,     setEditId]     = useState<string | null | false>(false)
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)
  const [search,     setSearch]     = useState('')
  const [catFilter,  setCatFilter]  = useState('all')
  const [displayCount, setDisplayCount] = useState(15)

  const filtered = db.inventoryItems
    .filter((i) => {
      const term = search.toLowerCase()
      const matchSearch = !term || i.name.toLowerCase().includes(term) || i.sku.toLowerCase().includes(term)
      const matchCat    = catFilter === 'all' || i.category === catFilter
      return matchSearch && matchCat
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  // KPIs
  const totalItems = db.inventoryItems.length
  const lowStock   = db.inventoryItems.filter((i) => i.currentStock > 0 && i.currentStock <= i.minStock).length
  const zeroStock  = db.inventoryItems.filter((i) => i.currentStock === 0).length
  const totalValue = db.inventoryItems.reduce((sum, i) => sum + i.currentStock * i.unitCost, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-tx">Inventario & Repuestos</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            <StatPill variant="ok">{totalItems} ítems</StatPill>
            {lowStock > 0  && <StatPill variant="warn">⚠ {lowStock} stock bajo</StatPill>}
            {zeroStock > 0 && <StatPill variant="err">✕ {zeroStock} sin stock</StatPill>}
            <StatPill variant="ok">Valor: ${totalValue.toFixed(2)}</StatPill>
          </div>
        </div>
        <Button onClick={() => setEditId(null)}>+ Nuevo Ítem</Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap items-center">
        <Input
          placeholder="Buscar por nombre o SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="max-w-[180px]"
        >
          <option value="all">Todas las categorías</option>
          {Object.entries(CATEGORIES).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </Select>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No se encontraron ítems"
          description="Ajusta los filtros o agrega nuevos ítems al inventario."
          action={<Button onClick={() => setEditId(null)}>+ Nuevo ítem</Button>}
        />
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-cmms bg-white shadow-card">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-bg">
                {['SKU','Nombre','Categoría','Stock','Reorden','Estado','Ubicación','Costo Unit.',''].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-[11px] font-bold text-tx-3 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, displayCount).map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onEdit={()   => setEditId(item.id)}
                  onAdjust={() => setAdjustItem(item)}
                />
              ))}
            </tbody>
          </table>
          {displayCount < filtered.length && (
            <div className="p-4 border-t border-gray-100 flex justify-center">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setDisplayCount(c => c + 15)}
              >
                Cargar más... ({filtered.length - displayCount} restantes)
              </Button>
            </div>
          )}
        </div>
      )}

      {editId !== false && <ItemForm itemId={editId} onClose={() => setEditId(false)} />}
      {adjustItem        && <AdjustModal item={adjustItem} onClose={() => setAdjustItem(null)} />}
    </div>
  )
}
