import { useState } from 'react'
import { clsx } from 'clsx'
import { useStore } from '@/store'
import type { Asset } from '@/types'
import { Badge, Button, Modal, FormField, Input, Select, Textarea, NoSelection, EmptyState } from '@/components/ui'
import { format } from 'date-fns'

const CATEGORY_ICON: Record<string, string> = { plant:'🏭', area:'🏢', equip:'⚙️' }
const CATEGORY_LABEL: Record<string, string> = { plant:'Planta', area:'Área', equip:'Equipo' }
const STATUS_COLOR: Record<string, string> = {
  OPERATIONAL: 'bg-green-500', IN_REPAIR: 'bg-amber-500', OUT_OF_SERVICE: 'bg-gray-400'
}
const STATUS_LABEL: Record<string, string> = {
  OPERATIONAL:'Operacional', IN_REPAIR:'En Reparación', OUT_OF_SERVICE:'Fuera de Servicio'
}
const STATUS_BADGE: Record<string, 'ok'|'warn'|'neutral'> = {
  OPERATIONAL:'ok', IN_REPAIR:'warn', OUT_OF_SERVICE:'neutral'
}
const CRIT_BADGE: Record<string, 'err'|'warn'|'ok'> = { HIGH:'err', MEDIUM:'warn', LOW:'ok' }
const CRIT_LABEL: Record<string, string> = { HIGH:'Alta', MEDIUM:'Media', LOW:'Baja' }
const WO_BADGE: Record<string, 'open'|'scheduled'|'open'|'ok'|'paused'> = {
  OPEN:'open', ASSIGNED:'scheduled', IN_PROGRESS:'open', COMPLETED:'ok', CANCELLED:'paused'
}
const WO_LABEL: Record<string, string> = {
  OPEN:'Abierta', ASSIGNED:'Asignada', IN_PROGRESS:'En Progreso', COMPLETED:'Completada', CANCELLED:'Cancelada'
}

// ── Nodo del árbol ────────────────────────────────────────────────
function TreeNode({ asset, level, selectedId, onSelect }: {
  asset: Asset; level: number; selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { db, expandedAssets, toggleAssetNode } = useStore()
  const isExpanded = expandedAssets.includes(asset.id)
  const isSelected = selectedId === asset.id
  const children   = db.assets.filter((a) => a.parentId === asset.id)

  return (
    <div>
      <div
        onClick={() => onSelect(asset.id)}
        className={clsx(
          'flex items-center gap-1.5 py-1.5 pr-3 cursor-pointer transition-colors border-l-2',
          isSelected
            ? 'bg-brand-pale text-brand border-brand font-semibold'
            : 'text-tx-2 border-transparent hover:bg-bg'
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        <span
          className={clsx(
            'w-4 h-4 flex items-center justify-center text-tx-3 text-xs transition-transform flex-shrink-0',
            children.length === 0 && 'invisible',
            isExpanded && 'rotate-90'
          )}
          onClick={(e) => { e.stopPropagation(); toggleAssetNode(asset.id) }}
        >›</span>
        <span className="text-base flex-shrink-0">{CATEGORY_ICON[asset.category] ?? '📦'}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] truncate">{asset.name}</div>
          {asset.serialNumber && (
            <div className="text-[10px] text-tx-3">{asset.serialNumber}</div>
          )}
        </div>
        <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', STATUS_COLOR[asset.status] ?? 'bg-gray-300')} />
      </div>
      {isExpanded && children.length > 0 && (
        <div>
          {children.map((c) => (
            <TreeNode key={c.id} asset={c} level={level + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Panel detalle activo ──────────────────────────────────────────
function AssetDetail({ assetId, onEdit, onAssignPlans }: {
  assetId: string
  onEdit: (id: string) => void
  onAssignPlans: (id: string) => void
}) {
  const { db, generateWO, toggleAssetPlan, removeAssetPlan, navigate, openWOEditor } = useStore()
  const asset = db.assets.find((a) => a.id === assetId)
  if (!asset) return null

  const location   = db.locations.find((l) => l.id === asset.locationId)
  const workOrders = db.workOrders.filter((wo) => wo.assetId === assetId)
  const assetPlans = db.assetPlans.filter((ap) => ap.assetId === assetId)

  // OTs correctivas activas que justifican el estado IN_REPAIR
  const activeCorrectiveWOs = workOrders.filter(
    (wo) => wo.type === 'CORRECTIVE' && ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(wo.status)
  )

  const handleGenerateWO = async (apId: string) => {
    const wo = await generateWO(apId)
    if (wo) {
      ;(window as any)._toast?.(`OT Preventiva generada: ${wo.title}`, 'success')
      openWOEditor(wo.id)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-5 md:px-6 py-5 border-b border-gray-100 bg-bg sticky top-0 z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] text-tx-3 font-semibold mb-1 flex items-center gap-2">
              <button 
                onClick={() => useStore.getState().setSelectedAsset(null)}
                className="md:hidden text-brand hover:underline border-r border-gray-200 pr-2"
              >
                ← Volver
              </button>
              <span>{asset.serialNumber || 'Sin serie'} · {CATEGORY_LABEL[asset.category]}</span>
            </div>
            <h2 className="font-display font-bold text-xl text-tx">{asset.name}</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Badge variant={STATUS_BADGE[asset.status] ?? 'neutral'}>{STATUS_LABEL[asset.status]}</Badge>
            <Badge variant={CRIT_BADGE[asset.criticality] ?? 'neutral'}>
              Criticidad: {CRIT_LABEL[asset.criticality]}
            </Badge>
            <Button size="sm" variant="secondary" onClick={() => onEdit(assetId)}>Editar</Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap mt-3">
          {location && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">📍 {location.name}</span>}
          {asset.brand && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">🏷 {asset.brand} {asset.model}</span>}
          {asset.serialNumber && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">🔢 S/N: {asset.serialNumber}</span>}
          {asset.installDate && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">📅 {format(new Date(asset.installDate), 'd MMM yyyy')}</span>}
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-5">
        {/* Banner de activo en reparación */}
        {asset.status === 'IN_REPAIR' && activeCorrectiveWOs.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            <div className="font-semibold mb-1">⚠️ Equipo en reparación — planes PM pausados automáticamente</div>
            <div className="text-xs text-amber-700">
              {activeCorrectiveWOs.length} OT{activeCorrectiveWOs.length !== 1 ? 's' : ''} correctiva{activeCorrectiveWOs.length !== 1 ? 's' : ''} activa{activeCorrectiveWOs.length !== 1 ? 's' : ''}:{' '}
              {activeCorrectiveWOs.map((wo) => wo.title).join(' · ')}
            </div>
          </div>
        )}
        {asset.status === 'OUT_OF_SERVICE' && (
          <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
            <div className="font-semibold">🚫 Equipo fuera de servicio</div>
            <div className="text-xs text-gray-500 mt-0.5">No se generarán OTs preventivas para este activo.</div>
          </div>
        )}

        {asset.notes && (
          <p className="text-sm text-tx-2 leading-relaxed">{asset.notes}</p>
        )}

        {/* Planes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3">
              Planes de Mantenimiento ({assetPlans.length})
            </h3>
            <Button size="xs" variant="secondary" onClick={() => onAssignPlans(assetId)}>
              ＋ Asignar / gestionar
            </Button>
          </div>
          {assetPlans.length === 0 ? (
            <p className="text-sm text-tx-3">
              Sin planes asignados.{' '}
              <button className="text-brand underline text-sm" onClick={() => onAssignPlans(assetId)}>Asignar plan</button>
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {assetPlans.map((ap) => {
                const plan  = db.pmPlans.find((p) => p.id === ap.pmPlanId)
                if (!plan) return null
                const tasks = db.pmTasks.filter((t) => t.pmPlanId === plan.id).sort((a, b) => a.order - b.order)
                const due   = ap.nextDueDate ? ap.nextDueDate.split('T')[0] : null
                const dueCls = !due ? 'neutral' : due < today ? 'err' : 'ok'

                const activeWO = db.workOrders.find(w => 
                  w.pmPlanId === ap.id && 
                  ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(w.status)
                )

                return (
                  <div key={ap.id} className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="flex items-start gap-3 px-4 py-3 bg-bg">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-tx">{plan.name}</div>
                        <div className="text-[11px] text-tx-3 mt-0.5 flex items-center gap-2 flex-wrap">
                          ⏰ Cada {plan.frequencyDays} días
                          {due && !activeWO && (
                            <Badge variant={dueCls as 'ok'|'err'|'neutral'} className="text-[10px]">
                              Próx: {format(new Date(ap.nextDueDate!), 'd MMM yyyy')}
                            </Badge>
                          )}
                          {activeWO && activeWO.dueDate && (
                            <Badge variant="open" className="text-[10px]">
                              📝 Cubierto por OT #{activeWO.id.split('-').pop()?.slice(0, 4)} (Vence: {format(new Date(activeWO.dueDate), 'd MMM')})
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Badge variant={ap.active ? 'open' : 'neutral'}>{ap.active ? 'Activo' : 'Inactivo'}</Badge>
                        {activeWO ? (
                          <Button size="xs" variant="secondary" onClick={() => openWOEditor(activeWO.id)}>
                            Ver OT Preventiva
                          </Button>
                        ) : (
                          <Button size="xs" variant="primary" onClick={() => handleGenerateWO(ap.id)}>Generar OT</Button>
                        )}
                        <Button size="xs" variant="secondary" onClick={() => toggleAssetPlan(ap.id)}>{ap.active ? 'Pausar' : 'Activar'}</Button>
                        <Button size="xs" variant="danger" onClick={() => { if (confirm('¿Quitar plan?')) removeAssetPlan(ap.id) }}>✕</Button>
                      </div>
                    </div>
                    {tasks.length > 0 && (
                      <div className="px-4 py-2.5">
                        {tasks.slice(0, 4).map((t, i) => (
                          <div key={t.id} className="flex items-start gap-2 py-1 text-xs text-tx-2">
                            <span className="w-4 h-4 rounded-full bg-brand-pale text-brand text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                            {t.description}
                          </div>
                        ))}
                        {tasks.length > 4 && (
                          <div className="text-[11px] text-tx-3 pl-6">+{tasks.length - 4} tareas más...</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Historial OTs */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3 mb-3">
            Historial de Órdenes ({workOrders.length})
          </h3>
          {workOrders.length === 0 ? (
            <p className="text-sm text-tx-3">Sin órdenes de trabajo.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {workOrders.slice(0, 5).map((wo) => (
                <div
                  key={wo.id}
                  className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-bg rounded px-2 -mx-2"
                  onClick={() => navigate('workorders')}
                >
                  <div>
                    <div className="text-[11px] text-tx-3">{format(new Date(wo.createdAt), 'd MMM yyyy')}</div>
                    <div className="text-sm font-semibold text-tx">{wo.title}</div>
                  </div>
                  <Badge variant={WO_BADGE[wo.status] ?? 'neutral'}>{WO_LABEL[wo.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// ── Modal: asignar planes ─────────────────────────────────────────
function AssignPlansModal({ assetId, onClose }: { assetId: string; onClose: () => void }) {
  const { db, assignPlan, unassignPlan } = useStore()
  const asset      = db.assets.find((a) => a.id === assetId)
  const assigned   = new Set(db.assetPlans.filter((ap) => ap.assetId === assetId).map((ap) => ap.pmPlanId))

  const isBlocked = asset && asset.status !== 'OPERATIONAL'
  const statusMsg: Record<string, string> = {
    IN_REPAIR:       'En Reparación',
    OUT_OF_SERVICE:  'Fuera de Servicio',
  }

  return (
    <Modal open title={`Planes — ${asset?.name ?? ''}`} onClose={onClose}
      footer={<Button onClick={onClose}>Listo</Button>} large>

      {/* Advertencia si el activo no está operacional */}
      {isBlocked && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
          <span className="text-base flex-shrink-0">⚠️</span>
          <div>
            <strong>Este equipo está {statusMsg[asset.status] ?? asset.status}.</strong>
            {' '}No se pueden asignar planes preventivos a equipos fuera de servicio o en reparación.
            Cambia el estado del activo a <em>Operacional</em> primero para habilitar esta función.
          </div>
        </div>
      )}

      <p className="text-sm text-tx-2 mb-4">
        Marca los planes que aplican a este equipo. El mismo plan puede asignarse a múltiples equipos con fechas independientes.
      </p>

      {db.pmPlans.length === 0 ? (
        <p className="text-sm text-tx-3">No hay planes creados. Ve a <em>Programas de Mtto</em> para crear uno.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {db.pmPlans.map((plan) => {
            const isChecked = assigned.has(plan.id)
            const tasks     = db.pmTasks.filter((t) => t.pmPlanId === plan.id)
            return (
              <label
                key={plan.id}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 border rounded-lg transition-colors',
                  isBlocked
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : isChecked
                      ? 'border-brand bg-brand-pale cursor-pointer'
                      : 'border-gray-200 hover:bg-bg cursor-pointer'
                )}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={!!isBlocked}
                  className="accent-brand w-4 h-4 flex-shrink-0"
                  onChange={(e) => {
                    if (isBlocked) return
                    if (e.target.checked) assignPlan(assetId, plan.id)
                    else unassignPlan(assetId, plan.id)
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-tx">{plan.name}</div>
                  <div className="text-[11px] text-tx-3 mt-0.5">
                    Cada {plan.frequencyDays} días · ±{plan.toleranceDays} días tolerancia · {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <Badge variant={plan.active ? 'ok' : 'neutral'}>{plan.active ? 'Activo' : 'Inactivo'}</Badge>
              </label>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

// ── Modal: formulario activo ──────────────────────────────────────
function AssetForm({ assetId, onClose }: { assetId: string | null; onClose: () => void }) {
  const { db, saveAsset, deleteAsset } = useStore()
  const existing = assetId ? db.assets.find((a) => a.id === assetId) : null
  const [form, setForm] = useState({
    parentId: existing?.parentId ?? '',
    name: existing?.name ?? '',
    category: existing?.category ?? 'equip',
    locationId: existing?.locationId ?? '',
    status: existing?.status ?? 'OPERATIONAL',
    brand: existing?.brand ?? '',
    model: existing?.model ?? '',
    serialNumber: existing?.serialNumber ?? '',
    criticality: existing?.criticality ?? 'MEDIUM',
    installDate: existing?.installDate ? existing.installDate.split('T')[0] : '',
    notes: existing?.notes ?? '',
  })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) return
    saveAsset({
      id: assetId ?? undefined,
      ...form,
      parentId: form.parentId || null,
      locationId: form.locationId || null,
      installDate: form.installDate ? new Date(form.installDate).toISOString() : null,
    })
    onClose()
  }

  // Filtrar para evitar referencias circulares: "a" no puede ser hijo/descendiente de "assetId" (si existe)
  const availableParents = db.assets.filter((a) => {
    if (!assetId) return true
    if (a.id === assetId) return false
    let curr = a.parentId
    while (curr) {
      if (curr === assetId) return false
      curr = db.assets.find((as) => as.id === curr)?.parentId || null
    }
    return true
  })

  return (
    <Modal open title={assetId ? 'Editar Activo' : 'Nuevo Activo'} onClose={onClose} large
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          {assetId && (
            <Button variant="danger" onClick={() => { if (confirm('¿Eliminar activo?')) { deleteAsset(assetId); onClose() } }}>
              Eliminar
            </Button>
          )}
          <Button onClick={handleSave} className="ml-auto">Guardar</Button>
        </div>
      }>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nombre *"><Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nombre del activo" /></FormField>
        <FormField label="Equipo Padre / Superior">
          <Select value={form.parentId} onChange={(e) => set('parentId', e.target.value)}>
            <option value="">-- Ninguno (Raíz) --</option>
            {availableParents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Categoría *">
          <Select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {['plant','area','equip'].map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </Select>
        </FormField>
        <FormField label="Ubicación">
          <Select value={form.locationId} onChange={(e) => set('locationId', e.target.value)}>
            <option value="">Seleccionar...</option>
            {db.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Estado">
          <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
            {Object.entries(STATUS_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </FormField>
        <FormField label="Criticidad">
          <Select value={form.criticality} onChange={(e) => set('criticality', e.target.value)}>
            {Object.entries(CRIT_LABEL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
        </FormField>
        <FormField label="Marca"><Input value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Marca" /></FormField>
        <FormField label="Modelo"><Input value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="Modelo" /></FormField>
        <FormField label="Número de Serie"><Input value={form.serialNumber} onChange={(e) => set('serialNumber', e.target.value)} placeholder="S/N" /></FormField>
        <FormField label="Fecha Instalación"><Input type="date" value={form.installDate} onChange={(e) => set('installDate', e.target.value)} /></FormField>
      </div>
      <FormField label="Notas"><Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} /></FormField>
    </Modal>
  )
}

// ── Vista principal ───────────────────────────────────────────────
export function AssetTree() {
  const { db, selectedAssetId, setSelectedAsset } = useStore()
  const [editId, setEditId]           = useState<string | null | false>(false) // false=closed, null=new, string=edit
  const [assignAssetId, setAssignAssetId] = useState<string | null>(null)

  const roots = db.assets.filter((a) => a.parentId === null)

  return (
    <div className="flex border border-gray-100 rounded-cmms overflow-hidden shadow-card bg-white"
      style={{ height: 'calc(100vh - 58px - 44px)' }}>

      {/* Sidebar árbol */}
      <div className={clsx(
        "flex-shrink-0 flex flex-col border-r border-gray-100 transition-all duration-300 bg-white",
        selectedAssetId ? "hidden md:flex md:w-72" : "w-full md:w-72"
      )}>
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-gray-100 bg-bg flex-shrink-0">
          <span className="text-sm font-bold text-tx">Árbol de Activos</span>
          <Button size="xs" onClick={() => setEditId(null)}>+ Nuevo</Button>
        </div>
        <div className="flex-1 overflow-y-auto py-1.5">
          {roots.length === 0 ? (
            <EmptyState title="Sin activos" description="Crea el primer activo." />
          ) : (
            roots.map((a) => (
              <TreeNode key={a.id} asset={a} level={0}
                selectedId={selectedAssetId}
                onSelect={setSelectedAsset} />
            ))
          )}
        </div>
      </div>

      {/* Panel detalle */}
      <div className={clsx(
        "flex-1 overflow-hidden bg-white",
        !selectedAssetId ? "hidden md:block" : "block w-full"
      )}>
        {selectedAssetId ? (
          <AssetDetail
            assetId={selectedAssetId}
            onEdit={(id) => setEditId(id)}
            onAssignPlans={(id) => setAssignAssetId(id)}
          />
        ) : (
          <NoSelection
            icon={<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="5" r="2"/><path d="M12 7v3"/><path d="M7 15H4a2 2 0 01-2-2v-1a2 2 0 012-2h16a2 2 0 012 2v1a2 2 0 01-2 2h-3"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>}
            title="Selecciona un activo"
            description="Haz clic en cualquier elemento del árbol para ver sus detalles."
          />
        )}
      </div>

      {/* Modales */}
      {editId !== false && <AssetForm assetId={editId} onClose={() => setEditId(false)} />}
      {assignAssetId && <AssignPlansModal assetId={assignAssetId} onClose={() => setAssignAssetId(null)} />}
    </div>
  )
}
