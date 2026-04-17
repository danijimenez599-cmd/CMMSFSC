import { useState } from 'react'
import { clsx } from 'clsx'
import { useStore } from '@/store'
import type { WorkOrder } from '@/types'
import {
  Badge, Button, Modal, FormField, Input, Select,
  Textarea, NoSelection, EmptyState,
} from '@/components/ui'
import { format, isPast } from 'date-fns'

// ── helpers de presentación ───────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  OPEN:'Abierta', ASSIGNED:'Asignada', IN_PROGRESS:'En Progreso',
  COMPLETED:'Completada', CANCELLED:'Cancelada',
}
const STATUS_BADGE: Record<string, 'open'|'scheduled'|'ok'|'paused'> = {
  OPEN:'open', ASSIGNED:'scheduled', IN_PROGRESS:'open',
  COMPLETED:'ok', CANCELLED:'paused',
}
const PRIORITY_LABEL: Record<string, string> = {
  URGENT:'Urgente', HIGH:'Alta', NORMAL:'Normal', LOW:'Baja',
}
const PRIORITY_BADGE: Record<string, 'err'|'warn'|'ok'|'neutral'> = {
  URGENT:'err', HIGH:'err', NORMAL:'warn', LOW:'ok',
}
const TYPE_ICON: Record<string, string> = { PREVENTIVE:'🛡️', CORRECTIVE:'🔧' }

// Acciones disponibles por estado
const ACTIONS: Record<string, string[]> = {
  OPEN:        ['asignar','iniciar','cancelar'],
  ASSIGNED:    ['iniciar','reasignar','cancelar'],
  IN_PROGRESS: ['completar','cancelar'],
  COMPLETED:   ['reabrir'],
  CANCELLED:   ['reabrir'],
}

// ── WO Form (crear / editar) ──────────────────────────────────────
export function WOForm({ woId, onClose }: { woId: string | null; onClose: () => void }) {
  const { db, saveWO, deleteWO, woEditorInitial } = useStore()
  const existing = woId ? db.workOrders.find((w) => w.id === woId) : null
  const equipos  = db.assets.filter((a) => a.category === 'equip')
  const users    = db.users.filter((u) => u.active)

  const [form, setForm] = useState({
    title:        existing?.title        ?? woEditorInitial?.title        ?? '',
    description:  existing?.description  ?? woEditorInitial?.description  ?? '',
    type:         existing?.type         ?? woEditorInitial?.type         ?? 'CORRECTIVE',
    priority:     existing?.priority     ?? woEditorInitial?.priority     ?? 'NORMAL',
    status:       existing?.status       ?? woEditorInitial?.status       ?? 'OPEN',
    assetId:      existing?.assetId      ?? woEditorInitial?.assetId      ?? '',
    assignedToId: existing?.assignedToId ?? woEditorInitial?.assignedToId ?? '',
    dueDate:      existing?.dueDate      ? existing.dueDate.split('T')[0] : (woEditorInitial?.dueDate ? woEditorInitial.dueDate.split('T')[0] : ''),
    pmPlanId:     existing?.pmPlanId     ?? woEditorInitial?.pmPlanId     ?? null,
  })
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim()) return
    saveWO({
      id: woId ?? undefined,
      ...form,
      assetId:      form.assetId      || null,
      assignedToId: form.assignedToId || null,
      dueDate:      form.dueDate      ? new Date(form.dueDate).toISOString() : null,
    })
    onClose()
  }

  return (
    <Modal
      open
      title={woId ? 'Editar Orden' : 'Nueva Orden de Trabajo'}
      onClose={onClose}
      large
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          {woId && (
            <Button variant="danger"
              onClick={() => { if (confirm('¿Eliminar esta orden?')) { deleteWO(woId); onClose() } }}>
              Eliminar
            </Button>
          )}
          <Button onClick={handleSave} className="ml-auto">Guardar</Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <FormField label="Título *">
            <Input value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="Descripción breve de la orden" />
          </FormField>
        </div>
        <FormField label="Tipo">
          <Select value={form.type} onChange={(e) => set('type', e.target.value)}>
            <option value="CORRECTIVE">🔧 Correctivo</option>
            <option value="PREVENTIVE">🛡️ Preventivo</option>
          </Select>
        </FormField>
        <FormField label="Prioridad">
          <Select value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            {Object.entries(PRIORITY_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Activo">
          <Select value={form.assetId} onChange={(e) => set('assetId', e.target.value)}>
            <option value="">Sin activo</option>
            {equipos.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Asignado a">
          <Select value={form.assignedToId} onChange={(e) => set('assignedToId', e.target.value)}>
            <option value="">Sin asignar</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </Select>
        </FormField>
        <FormField label="Estado">
          <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Fecha límite">
          <Input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
        </FormField>
        <div className="col-span-2">
          <FormField label="Descripción">
            <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Detalle de la orden..." />
          </FormField>
        </div>
      </div>
    </Modal>
  )
}

// ── Modal: asignar técnico ────────────────────────────────────────
function AssignModal({ woId, onClose }: { woId: string; onClose: () => void }) {
  const { db, updateWOStatus } = useStore()
  const [userId, setUserId] = useState('')
  const users = db.users.filter((u) => u.active)

  const handleAssign = () => {
    if (!userId) return
    updateWOStatus(woId, 'ASSIGNED', { assignedToId: userId })
    onClose()
  }

  return (
    <Modal open title="Asignar Técnico" onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAssign} disabled={!userId}>Asignar</Button>
        </>
      }>
      <FormField label="Seleccionar técnico">
        <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Seleccionar...</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
        </Select>
      </FormField>
    </Modal>
  )
}

// ── Modal: completar OT ───────────────────────────────────────────
function CompleteModal({ woId, onClose }: { woId: string; onClose: () => void }) {
  const { updateWOStatus } = useStore()
  const [notes, setNotes]  = useState('')
  const [time,  setTime]   = useState('0')

  const handleComplete = () => {
    updateWOStatus(woId, 'COMPLETED', {
      completedAt:     new Date().toISOString(),
      resolutionNotes: notes.trim() || null,
      timeSpentMin:    parseInt(time) || 0,
    })
    onClose()
  }

  return (
    <Modal open title="Completar Orden" onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleComplete}>Completar</Button>
        </>
      }>
      <FormField label="Notas de resolución">
        <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe el trabajo realizado..." />
      </FormField>
      <FormField label="Tiempo invertido (minutos)">
        <Input type="number" min="0" value={time} onChange={(e) => setTime(e.target.value)} />
      </FormField>
    </Modal>
  )
}

// ── Modal: agregar parte ──────────────────────────────────────────
function AddPartModal({ woId, onClose }: { woId: string; onClose: () => void }) {
  const { db, addPartUsage } = useStore()
  const [itemId, setItemId] = useState('')
  const [qty, setQty]       = useState('1')
  const items = db.inventoryItems.filter((i) => i.currentStock > 0)

  const handleAdd = () => {
    if (!itemId || parseInt(qty) <= 0) return
    addPartUsage(woId, itemId, parseInt(qty))
    onClose()
  }

  return (
    <Modal open title="Agregar Parte Utilizada" onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAdd} disabled={!itemId}>Agregar</Button>
        </>
      }>
      {items.length === 0 ? (
        <p className="text-sm text-tx-3">No hay ítems disponibles en stock.</p>
      ) : (
        <>
          <FormField label="Ítem de inventario">
            <Select value={itemId} onChange={(e) => setItemId(e.target.value)}>
              <option value="">Seleccionar...</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} (Stock: {i.currentStock} {i.unit})
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Cantidad">
            <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
          </FormField>
        </>
      )}
    </Modal>
  )
}

// ── Tarjeta de OT (columna central) ──────────────────────────────
function WOCard({ wo, isSelected, onClick }: {
  wo: WorkOrder; isSelected: boolean; onClick: () => void
}) {
  const db    = useStore((s) => s.db)
  const asset = db.assets.find((a) => a.id === wo.assetId)
  const assignee = db.users.find((u) => u.id === wo.assignedToId)
  const overdue = wo.dueDate && wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED'
    && isPast(new Date(wo.dueDate))

  return (
    <div
      onClick={onClick}
      className={clsx(
        'px-3.5 py-3 border-b border-gray-100 cursor-pointer transition-colors border-l-[3px]',
        isSelected
          ? 'bg-brand-pale border-l-brand'
          : 'border-l-transparent hover:bg-bg'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs">{TYPE_ICON[wo.type]}</span>
          <Badge variant={STATUS_BADGE[wo.status] ?? 'neutral'}>{STATUS_LABEL[wo.status]}</Badge>
          <Badge variant={PRIORITY_BADGE[wo.priority] ?? 'neutral'}>{PRIORITY_LABEL[wo.priority]}</Badge>
          {overdue && <Badge variant="err">Vencida</Badge>}
        </div>
        <span className="text-[11px] text-tx-3 flex-shrink-0">
          {format(new Date(wo.createdAt), 'd MMM')}
        </span>
      </div>
      <div className="text-sm font-semibold text-tx leading-snug mb-1">{wo.title}</div>
      <div className="text-[11px] text-tx-3 mb-2">{asset?.name ?? 'Sin activo'}</div>
      <div className="flex items-center justify-between text-[11px] text-tx-3 border-t border-gray-100 pt-1.5">
        <span>{assignee ? `👤 ${assignee.name}` : 'Sin asignar'}</span>
        {wo.dueDate && (
          <span className={overdue ? 'text-red-600 font-semibold' : ''}>
            📅 {format(new Date(wo.dueDate), 'd MMM yyyy')}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Panel detalle OT ──────────────────────────────────────────────
function WODetail({ woId, onEdit }: { woId: string; onEdit: () => void }) {
  const { db, updateWOStatus, addComment, removePartUsage } = useStore()
  const [assignModal,   setAssignModal]   = useState(false)
  const [completeModal, setCompleteModal] = useState(false)
  const [partModal,     setPartModal]     = useState(false)
  const [comment,       setComment]       = useState('')

  const wo       = db.workOrders.find((w) => w.id === woId)
  if (!wo) return null

  const asset    = db.assets.find((a) => a.id === wo.assetId)
  const reporter = db.users.find((u) => u.id === wo.reportedById)
  const assignee = db.users.find((u) => u.id === wo.assignedToId)
  const pmAp     = wo.pmPlanId ? db.assetPlans.find((ap) => ap.id === wo.pmPlanId) : null
  const pmPlan   = pmAp ? db.pmPlans.find((p) => p.id === pmAp.pmPlanId) : null
  const comments = db.woComments.filter((c) => c.workOrderId === woId)
  const parts    = db.partUsages.filter((p) => p.workOrderId === woId)
  const actions  = ACTIONS[wo.status] ?? []
  const overdue  = wo.dueDate && wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED'
    && isPast(new Date(wo.dueDate))

  const handleCompleteClicked = () => {
    // Si la OT es de plan (tiene tareas de checklist) y no todas están marcadas
    const pendingTasks = db.woTasks?.filter(t => t.woId === woId && !t.completed) || []
    if (pendingTasks.length > 0) {
      ;(window as any)._toast?.('Bloqueado', `Debes marcar todas las actividades del checklist (${pendingTasks.length} pendientes)`, 'err')
      return
    }
    setCompleteModal(true)
  }

  const handleComment = () => {
    if (!comment.trim()) return
    addComment(woId, comment.trim())
    setComment('')
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-bg flex-shrink-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-tx-3 mb-1">
              {TYPE_ICON[wo.type]} {wo.type === 'PREVENTIVE' ? 'Preventivo' : 'Correctivo'} · {wo.id}
            </div>
            <h2 className="font-display font-bold text-lg text-tx leading-snug">{wo.title}</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end flex-shrink-0">
            <Badge variant={STATUS_BADGE[wo.status] ?? 'neutral'}>{STATUS_LABEL[wo.status]}</Badge>
            <Badge variant={PRIORITY_BADGE[wo.priority] ?? 'neutral'}>{PRIORITY_LABEL[wo.priority]}</Badge>
            <Button size="sm" variant="secondary" onClick={onEdit}>Editar</Button>
          </div>
        </div>
        {/* Meta pills */}
        <div className="flex gap-2 flex-wrap">
          {asset    && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">🏭 {asset.name}</span>}
          {reporter && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">👤 Reportado: {reporter.name}</span>}
          {assignee && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">👨‍🔧 Asignado: {assignee.name}</span>}
          {wo.dueDate && (
            <span className={clsx(
              'text-xs px-2.5 py-1 rounded-full',
              overdue ? 'bg-red-100 text-red-700' : 'bg-bg-2 text-tx-2'
            )}>
              📅 Vence: {format(new Date(wo.dueDate), 'd MMM yyyy')}
            </span>
          )}
          {wo.startedAt  && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">⏱ Iniciada: {format(new Date(wo.startedAt), 'd MMM HH:mm')}</span>}
          {wo.completedAt&& <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full">✅ Completada: {format(new Date(wo.completedAt), 'd MMM HH:mm')}</span>}
          {pmPlan        && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">📋 Plan: {pmPlan.name}</span>}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-5 flex-1">

        {/* Descripción */}
        {wo.description && (
          <p className="text-sm text-tx-2 leading-relaxed">{wo.description}</p>
        )}

        {/* Tareas (Checklist Snapshot) */}
        {(db.woTasks?.filter(t => t.woId === woId).length ?? 0) > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3 mb-2">Actividades Requeridas ({db.woTasks!.filter(t => t.woId === woId && t.completed).length}/{db.woTasks!.filter(t => t.woId === woId).length})</h3>
            <div className="flex flex-col border border-gray-100 rounded-lg overflow-hidden bg-white">
              {db.woTasks!.filter(t => t.woId === woId).sort((a,b) => a.order - b.order).map(t => (
                <label key={t.id} className={clsx(
                  "flex items-start gap-3 p-3 border-b border-gray-50 last:border-0 cursor-pointer transition-colors",
                  t.completed ? "bg-bg opacity-75" : "hover:bg-bg"
                )}>
                  <input 
                    type="checkbox" 
                    checked={t.completed} 
                    onChange={() => useStore.getState().toggleWoTask(t.id)}
                    disabled={wo.status === 'COMPLETED' || wo.status === 'CANCELLED'}
                    className="mt-0.5 rounded border-gray-200 text-brand focus:ring-brand"
                  />
                  <span className={clsx(
                    "text-sm", 
                    t.completed ? "line-through text-tx-3" : "text-tx-2"
                  )}>
                    {t.description}
                  </span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Acciones */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3 mb-2">Acciones</h3>
          <div className="flex gap-2 flex-wrap">
            {actions.includes('asignar')   && <Button size="sm" onClick={() => setAssignModal(true)}>Asignar</Button>}
            {actions.includes('reasignar') && <Button size="sm" variant="secondary" onClick={() => setAssignModal(true)}>Reasignar</Button>}
            {actions.includes('iniciar')   && <Button size="sm" onClick={() => updateWOStatus(woId, 'IN_PROGRESS', { startedAt: new Date().toISOString() })}>Iniciar</Button>}
            {actions.includes('completar') && <Button size="sm" onClick={handleCompleteClicked}>Completar</Button>}
            {actions.includes('cancelar')  && <Button size="sm" variant="danger" onClick={() => { if (confirm('¿Cancelar esta orden?')) updateWOStatus(woId, 'CANCELLED') }}>Cancelar</Button>}
            {actions.includes('reabrir')   && <Button size="sm" variant="secondary" onClick={() => updateWOStatus(woId, 'OPEN')}>Reabrir</Button>}
          </div>
        </section>

        {/* Notas resolución */}
        {wo.resolutionNotes && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3 mb-2">Notas de Resolución</h3>
            <div className="bg-bg border border-gray-100 rounded-lg px-4 py-3 text-sm text-tx-2 leading-relaxed">
              {wo.resolutionNotes}
            </div>
            {wo.timeSpentMin != null && wo.timeSpentMin > 0 && (
              <p className="text-xs text-tx-3 mt-1.5">⏱ Tiempo: {wo.timeSpentMin} min</p>
            )}
          </section>
        )}

        {/* Partes utilizadas */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3">Partes Utilizadas ({parts.length})</h3>
            <Button size="xs" variant="secondary" onClick={() => setPartModal(true)}>+ Agregar</Button>
          </div>
          {parts.length === 0 ? (
            <p className="text-sm text-tx-3">Sin partes registradas.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Ítem','Cantidad','Fecha',''].map((h) => (
                    <th key={h} className="text-left py-1.5 px-2 text-[11px] font-bold text-tx-3 uppercase bg-bg">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parts.map((pu) => {
                  const item = db.inventoryItems.find((i) => i.id === pu.inventoryItemId)
                  return (
                    <tr key={pu.id} className="border-b border-gray-50">
                      <td className="py-2 px-2 text-tx-2">{item?.name ?? '—'}</td>
                      <td className="py-2 px-2 text-tx-2">{pu.quantity} {item?.unit ?? ''}</td>
                      <td className="py-2 px-2 text-tx-3 text-xs">{format(new Date(pu.usedAt), 'd MMM')}</td>
                      <td className="py-2 px-2">
                        <Button size="xs" variant="secondary"
                          onClick={() => { if (confirm('¿Eliminar?')) removePartUsage(pu.id) }}>✕</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* Comentarios */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3 mb-2">Comentarios ({comments.length})</h3>
          <div className="flex flex-col divide-y divide-gray-100 mb-3">
            {comments.map((c) => {
              const user = db.users.find((u) => u.id === c.userId)
              return (
                <div key={c.id} className="py-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold text-tx">{user?.name ?? 'Usuario'}</span>
                    <span className="text-[11px] text-tx-3">{format(new Date(c.createdAt), 'd MMM HH:mm')}</span>
                  </div>
                  <p className="text-sm text-tx-2 leading-relaxed">{c.text}</p>
                </div>
              )
            })}
          </div>
          <div className="flex flex-col gap-2">
            <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Agregar comentario..." />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleComment} disabled={!comment.trim()}>Comentar</Button>
            </div>
          </div>
        </section>
      </div>

      {/* Modales */}
      {assignModal   && <AssignModal   woId={woId} onClose={() => setAssignModal(false)} />}
      {completeModal && <CompleteModal woId={woId} onClose={() => setCompleteModal(false)} />}
      {partModal     && <AddPartModal  woId={woId} onClose={() => setPartModal(false)} />}
    </div>
  )
}

// ── Vista principal ───────────────────────────────────────────────
export function WorkOrders() {
  const { db, selectedWOId, setSelectedWO, woFilter, setWOFilter, openWOEditor } = useStore()

  const [displayCount, setDisplayCount] = useState(15)

  // Filtrar órdenes
  const filtered = db.workOrders
    .filter((wo) => {
      if (woFilter.status   !== 'all' && wo.status   !== woFilter.status)   return false
      if (woFilter.type     !== 'all' && wo.type     !== woFilter.type)     return false
      if (woFilter.priority !== 'all' && wo.priority !== woFilter.priority) return false
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Stats
  const stats = {
    total:      db.workOrders.length,
    open:       db.workOrders.filter((w) => w.status === 'OPEN').length,
    inProgress: db.workOrders.filter((w) => w.status === 'IN_PROGRESS').length,
    overdue:    db.workOrders.filter((w) =>
      w.status !== 'COMPLETED' && w.status !== 'CANCELLED' &&
      w.dueDate && isPast(new Date(w.dueDate))
    ).length,
  }

  return (
    <div
      className="flex flex-col border border-gray-100 rounded-cmms overflow-hidden shadow-card bg-white"
      style={{ height: 'calc(100vh - 58px - 44px)' }}
    >
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-bg flex-shrink-0 hide-scrollbar overflow-x-auto">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-tx hidden sm:inline">Filtros:</span>
          <div className="flex items-center gap-2">
            {[
              { key:'status', opts:[['all','Todo Estado'],['OPEN','Abiertas'],['ASSIGNED','Asignadas'],['IN_PROGRESS','En Progreso'],['COMPLETED','Completadas'],['CANCELLED','Canceladas']] },
              { key:'type',   opts:[['all','Todo Tipo'],['CORRECTIVE','Correctivo'],['PREVENTIVE','Preventivo']] },
              { key:'priority',opts:[['all','Toda Prioridad'],['URGENT','Urgente'],['HIGH','Alta'],['NORMAL','Normal'],['LOW','Baja']] },
            ].map(({ key, opts }) => (
              <Select
                key={key}
                className="text-xs py-1.5 w-auto pr-8"
                value={(woFilter as Record<string,string>)[key]}
                onChange={(e) => setWOFilter({ [key]: e.target.value })}
              >
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pl-4 shrink-0">
          <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-tx-3 border-r border-gray-200 pr-4">
            <span title="Total">Tot: <strong className="text-tx">{stats.total}</strong></span>
            <span title="Abiertas">Ab: <strong className="text-green-600">{stats.open}</strong></span>
            <span title="En Progreso">Prog: <strong className="text-amber-600">{stats.inProgress}</strong></span>
            <span title="Vencidas">Venc: <strong className="text-red-600">{stats.overdue}</strong></span>
          </div>
          <Button size="sm" onClick={() => openWOEditor(null)}>+ Nueva OT</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Columna lista */}
        <div className="w-80 flex-shrink-0 border-r border-gray-100 overflow-y-auto flex flex-col pb-4 bg-gray-50/50">
          {filtered.length === 0 ? (
            <EmptyState
              title="Sin órdenes"
              description="No hay órdenes que coincidan con los filtros."
              action={<Button size="sm" onClick={() => openWOEditor(null)}>+ Crear OT</Button>}
            />
          ) : (
            <>
              {filtered.slice(0, displayCount).map((wo) => (
                <WOCard
                  key={wo.id}
                  wo={wo}
                  isSelected={selectedWOId === wo.id}
                  onClick={() => setSelectedWO(wo.id)}
                />
              ))}
              {displayCount < filtered.length && (
                <div className="p-3">
                  <Button 
                    variant="secondary" 
                    className="w-full text-xs" 
                    onClick={() => setDisplayCount(c => c + 15)}
                  >
                    Cargar más... ({filtered.length - displayCount} restantes)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Columna detalle */}
        <div className="flex-1 overflow-hidden bg-white">
          {selectedWOId ? (
            <WODetail woId={selectedWOId} onEdit={() => openWOEditor(selectedWOId)} />
          ) : (
            <NoSelection
              icon={<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>}
              title="Selecciona una orden"
              description="Haz clic en cualquier orden para ver sus detalles."
            />
          )}
        </div>
      </div>
    </div>
  )
}
