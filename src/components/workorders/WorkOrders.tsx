import { useState } from 'react'
import { clsx } from 'clsx'
import { useStore } from '@/store'
import { usePermissions, useRole } from '@/hooks/usePermissions'
import type { WorkOrder } from '@/types'
import {
  Badge, Button, Modal, FormField, Input, Select,
  Textarea, NoSelection, EmptyState,
} from '@/components/ui'
import { format, isPast } from 'date-fns'
import { KanbanBoard } from './KanbanBoard'
import { STATUS_LABEL, STATUS_BADGE, PRIORITY_LABEL, PRIORITY_BADGE, TYPE_ICON, ACTIONS } from './constants'

// ── WOForm ────────────────────────────────────────────────────────
export function WOForm({ woId, onClose }: { woId: string | null; onClose: () => void }) {
  const { db, saveWO, deleteWO, woEditorInitial } = useStore()
  const perms    = usePermissions()
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
    dueDate:      existing?.dueDate ? existing.dueDate.split('T')[0] : (woEditorInitial?.dueDate ? woEditorInitial.dueDate.split('T')[0] : ''),
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
      dueDate:      form.dueDate ? new Date(form.dueDate).toISOString() : null,
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
          {woId && perms.canDeleteWO && (
            <Button variant="danger"
              onClick={() => { if (confirm('¿Eliminar esta orden?')) { deleteWO(woId); onClose() } }}>
              Eliminar
            </Button>
          )}
          <Button onClick={handleSave} className="ml-auto">Guardar</Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <FormField label="Título *">
            <Input value={form.title} onChange={(e) => set('title', e.target.value)}
              placeholder="Descripción breve de la orden" />
          </FormField>
        </div>
        <FormField label="Tipo">
          {form.pmPlanId ? (
            // OT vinculada a un plan preventivo — tipo bloqueado para no romper la cadena PM
            <div className="flex items-center gap-2 px-3 py-2 bg-bg border border-gray-200 rounded-lg text-sm text-tx-2">
              <span>🛡️ Preventivo</span>
              <span className="text-[10px] text-tx-3 ml-auto">Vinculado a plan PM</span>
            </div>
          ) : (
            <Select value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="CORRECTIVE">🔧 Correctivo</option>
              <option value="PREVENTIVE">🛡️ Preventivo</option>
            </Select>
          )}
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
        {perms.canAssignWO && (
          <FormField label="Asignado a">
            <Select value={form.assignedToId} onChange={(e) => set('assignedToId', e.target.value)}>
              <option value="">Sin asignar</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </Select>
          </FormField>
        )}
        {perms.canEditWO && (
          <FormField label="Estado">
            <Select value={form.status} onChange={(e) => set('status', e.target.value)}>
              {Object.entries(STATUS_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </FormField>
        )}
        <FormField label="Fecha límite">
          <Input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Descripción">
            <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Detalle de la orden..." />
          </FormField>
        </div>
      </div>
    </Modal>
  )
}

// ── AssignModal ───────────────────────────────────────────────────
function AssignModal({ woId, onClose }: { woId: string; onClose: () => void }) {
  const { db, updateWOStatus } = useStore()
  const [userId, setUserId] = useState('')
  const users = db.users.filter((u) => u.active)

  return (
    <Modal open title="Asignar Técnico" onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { if (!userId) return; updateWOStatus(woId, 'ASSIGNED', { assignedToId: userId }); onClose() }} disabled={!userId}>Asignar</Button>
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

// ── CompleteModal — optimizado para móvil ─────────────────────────
function CompleteModal({ woId, onClose }: { woId: string; onClose: () => void }) {
  const { db, updateWOStatus } = useStore()
  const [notes, setNotes]  = useState('')
  const [time,  setTime]   = useState('0')

  const wo         = db.workOrders.find((w) => w.id === woId)
  const isPM       = wo?.type === 'PREVENTIVE'
  const timeVal    = parseInt(time) || 0
  const timeInvalid = timeVal < 1  // al menos 1 minuto — 0 contamina el MTTR

  const handleComplete = () => {
    if (timeInvalid) {
      ;(window as any)._toast?.('Ingresa el tiempo real invertido (mínimo 1 minuto) para un MTTR preciso.', 'warn')
      return
    }
    if (isPM && !notes.trim()) {
      if (!confirm('No escribiste notas de resolución. En un preventivo es recomendable documentar qué se hizo. ¿Continuar de todas formas?')) return
    }
    updateWOStatus(woId, 'COMPLETED', {
      completedAt:     new Date().toISOString(),
      resolutionNotes: notes.trim() || null,
      timeSpentMin:    timeVal,
    })
    onClose()
  }

  return (
    <Modal open title="✅ Completar Orden" onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700" disabled={timeInvalid}>
            Marcar Completada
          </Button>
        </>
      }>
      {/* Campos grandes y táctiles */}
      <div className="flex flex-col gap-4">
        {isPM && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-medium">
            Al completar, se generará la próxima fecha de mantenimiento automáticamente.
          </div>
        )}
        <FormField label="Notas de resolución (qué se hizo)">
          <Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe el trabajo realizado, materiales usados, observaciones..."
            className="text-base"
          />
        </FormField>
        <FormField label="Tiempo invertido (minutos) *">
          <div className="flex items-center gap-3">
            <Input type="number" min="1" value={time} onChange={(e) => setTime(e.target.value)}
              className={clsx('text-base text-center font-bold w-28', timeInvalid && 'border-red-300 bg-red-50')} />
            <div className="flex gap-2">
              {[30, 60, 90, 120].map((t) => (
                <button key={t} onClick={() => setTime(String(t))}
                  className={clsx('px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                    time === String(t) ? 'bg-brand text-white border-brand' : 'border-gray-200 text-tx-2 hover:bg-bg')}>
                  {t}m
                </button>
              ))}
            </div>
          </div>
          {timeInvalid && <p className="text-xs text-red-600 mt-1">Requerido para un MTTR preciso.</p>}
        </FormField>
      </div>
    </Modal>
  )
}

// ── AddPartModal ──────────────────────────────────────────────────
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
            <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="text-base" />
          </FormField>
        </>
      )}
    </Modal>
  )
}

// ── WOCard ────────────────────────────────────────────────────────
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
        'px-3.5 py-3 border-b border-gray-100 cursor-pointer transition-colors border-l-[3px] min-w-0 flex flex-col',
        isSelected
          ? 'bg-brand-pale border-l-brand'
          : 'border-l-transparent hover:bg-bg'
      )}
    >
      <div className="flex flex-col gap-1.5 mb-2 w-full min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs">{TYPE_ICON[wo.type]}</span>
          <Badge variant={STATUS_BADGE[wo.status] ?? 'neutral'}>{STATUS_LABEL[wo.status]}</Badge>
          <Badge variant={PRIORITY_BADGE[wo.priority] ?? 'neutral'}>{PRIORITY_LABEL[wo.priority]}</Badge>
          {overdue && <Badge variant="err">Vencida</Badge>}
        </div>
        <div className="flex flex-col w-full min-w-0 mt-0.5">
          <span className="text-sm font-semibold text-tx leading-snug break-words whitespace-normal text-wrap" style={{wordBreak: 'break-word'}} title={wo.title}>{wo.title}</span>
        </div>
      </div>
      <div className="text-[11px] text-tx-3 mb-2 font-medium">{asset?.name ?? 'Sin activo'}</div>
      <div className="flex items-center justify-between text-[11px] text-tx-3 border-t border-gray-100 pt-2">
        <span>{assignee ? `👤 ${assignee.name}` : 'Sin asignar'}</span>
        <div className="flex gap-2">
          <span className="flex-shrink-0">{format(new Date(wo.createdAt), 'd MMM')}</span>
          {wo.dueDate && (
            <span className={clsx(overdue ? 'text-red-600 font-semibold' : '', "border-l border-gray-200 pl-2")}>
              📅 {format(new Date(wo.dueDate), 'd MMM yyyy')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── TechnicianMobileView — Vista móvil optimizada para técnicos ───
function TechnicianMobileView() {
  const { db, currentUser, updateWOStatus, addComment, toggleWoTask } = useStore()
  const [selectedWO, setSelectedWO] = useState<string | null>(null)
  const [completeModal, setCompleteModal] = useState(false)
  const [partModal,     setPartModal]     = useState(false)
  const [comment,       setComment]       = useState('')

  // Solo OTs asignadas al técnico actual, ordenadas por criterio industrial:
  // 1. Correctivos urgentes/altos siempre antes que cualquier preventivo
  //    (un equipo fallando tiene precedencia sobre mantenimiento programado)
  // 2. Dentro del mismo tipo, por prioridad descendente
  // 3. Empate: OTs vencidas primero, luego por fecha de vencimiento ascendente
  const myWOs = db.workOrders
    .filter((w) => w.assignedToId === currentUser?.id && w.status !== 'COMPLETED' && w.status !== 'CANCELLED')
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 }
      const pa = priorityOrder[a.priority] ?? 2
      const pb = priorityOrder[b.priority] ?? 2

      // Un correctivo con prioridad URGENT o HIGH supera a cualquier preventivo
      const aIsCriticalCorrective = a.type === 'CORRECTIVE' && pa <= 1
      const bIsCriticalCorrective = b.type === 'CORRECTIVE' && pb <= 1
      if (aIsCriticalCorrective && !bIsCriticalCorrective) return -1
      if (!aIsCriticalCorrective && bIsCriticalCorrective) return 1

      // Mismo tipo o ninguno es correctivo crítico → comparar por prioridad
      if (pa !== pb) return pa - pb

      // Mismo prioridad → vencidas primero
      const aOverdue = a.dueDate && isPast(new Date(a.dueDate)) ? 0 : 1
      const bOverdue = b.dueDate && isPast(new Date(b.dueDate)) ? 0 : 1
      if (aOverdue !== bOverdue) return aOverdue - bOverdue

      // Mismo estado de vencimiento → más próxima primero
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      return 0
    })

  const wo = selectedWO ? db.workOrders.find((w) => w.id === selectedWO) : null
  const asset = wo ? db.assets.find((a) => a.id === wo.assetId) : null
  const tasks = wo ? db.woTasks.filter((t) => t.woId === wo.id).sort((a, b) => a.order - b.order) : []
  const completedTasks = tasks.filter((t) => t.completed).length
  const allDone = tasks.length > 0 && completedTasks === tasks.length
  const overdue = wo?.dueDate && wo.status !== 'COMPLETED' && isPast(new Date(wo.dueDate))

  const handleComment = () => {
    if (!comment.trim() || !selectedWO) return
    addComment(selectedWO, comment.trim())
    setComment('')
  }

  // ── Panel de lista de OTs del técnico ──
  if (!selectedWO || !wo) {
    return (
      <div className="flex flex-col gap-3 pb-24">
        {/* Saludo */}
        <div className="bg-brand text-white rounded-2xl px-5 py-4">
          <div className="text-white/70 text-sm">Bienvenido,</div>
          <div className="font-display font-bold text-xl">{currentUser?.name}</div>
          <div className="text-white/70 text-sm mt-1">
            {myWOs.length === 0 ? 'No tienes órdenes pendientes 🎉' : `${myWOs.length} orden${myWOs.length !== 1 ? 'es' : ''} pendiente${myWOs.length !== 1 ? 's' : ''}`}
          </div>
        </div>

        {myWOs.length === 0 ? (
          <div className="text-center py-16 text-tx-3">
            <div className="text-5xl mb-3">✅</div>
            <div className="font-semibold text-tx-2">Todo al día</div>
            <div className="text-sm mt-1">No hay órdenes asignadas</div>
          </div>
        ) : (
          myWOs.map((w) => {
            const a = db.assets.find((ast) => ast.id === w.assetId)
            const od = w.dueDate && isPast(new Date(w.dueDate))
            const myTasks = db.woTasks.filter((t) => t.woId === w.id)
            const done    = myTasks.filter((t) => t.completed).length
            return (
              <button
                key={w.id}
                onClick={() => setSelectedWO(w.id)}
                className={clsx(
                  'w-full text-left bg-white rounded-2xl p-4 shadow-sm border-l-4 active:scale-[0.98] transition-transform',
                  od ? 'border-red-500' : w.priority === 'URGENT' ? 'border-red-400' : w.priority === 'HIGH' ? 'border-amber-400' : 'border-brand/40'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge variant={PRIORITY_BADGE[w.priority] ?? 'neutral'}>{PRIORITY_LABEL[w.priority]}</Badge>
                    <Badge variant={STATUS_BADGE[w.status] ?? 'neutral'}>{STATUS_LABEL[w.status]}</Badge>
                    {od && <Badge variant="err">Vencida</Badge>}
                    {w.type === 'CORRECTIVE' && (w.priority === 'URGENT' || w.priority === 'HIGH') && (
                      <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        ⚡ Atender primero
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-tx-3">{TYPE_ICON[w.type]}</span>
                </div>
                <div className="font-semibold text-tx text-sm leading-snug mb-1">{w.title}</div>
                {a && <div className="text-xs text-tx-3 mb-2">🏭 {a.name}</div>}
                <div className="flex items-center justify-between text-xs text-tx-3">
                  {myTasks.length > 0
                    ? <span className={clsx('font-medium', done === myTasks.length ? 'text-green-600' : 'text-amber-600')}>
                        ✓ {done}/{myTasks.length} actividades
                      </span>
                    : <span />
                  }
                  {w.dueDate && <span className={od ? 'text-red-600 font-semibold' : ''}>📅 {format(new Date(w.dueDate), 'd MMM')}</span>}
                </div>
                {/* Progress bar */}
                {myTasks.length > 0 && (
                  <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all', done === myTasks.length ? 'bg-green-500' : 'bg-brand')}
                      style={{ width: `${Math.round((done / myTasks.length) * 100)}%` }}
                    />
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>
    )
  }

  // ── Panel detalle de una OT (móvil técnico) ──
  return (
    <div className="flex flex-col gap-4 pb-32">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => setSelectedWO(null)}
          className="flex items-center gap-1.5 text-brand text-sm font-semibold mb-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="15 18 9 12 15 6" /></svg>
          Mis órdenes
        </button>

        <div className={clsx('bg-white rounded-2xl p-4 shadow-sm border-l-4', overdue ? 'border-red-500' : 'border-brand')}>
          <div className="flex gap-1.5 flex-wrap mb-2">
            <Badge variant={STATUS_BADGE[wo.status] ?? 'neutral'}>{STATUS_LABEL[wo.status]}</Badge>
            <Badge variant={PRIORITY_BADGE[wo.priority] ?? 'neutral'}>{PRIORITY_LABEL[wo.priority]}</Badge>
            {overdue && <Badge variant="err">VENCIDA</Badge>}
          </div>
          <h2 className="font-display font-bold text-lg text-tx leading-snug mb-2">{wo.title}</h2>
          {asset && <div className="text-sm text-tx-3 mb-2">🏭 {asset.name}</div>}
          {wo.dueDate && (
            <div className={clsx('text-sm font-medium', overdue ? 'text-red-600' : 'text-tx-2')}>
              📅 Vence: {format(new Date(wo.dueDate), "d 'de' MMMM yyyy")}
            </div>
          )}
          {wo.description && (
            <p className="text-sm text-tx-2 mt-3 leading-relaxed border-t border-gray-100 pt-3">{wo.description}</p>
          )}
        </div>
      </div>

      {/* Acciones principales — CTA grande */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3 mb-3">Acción</h3>
        <div className="flex flex-col gap-2">
          {wo.status === 'ASSIGNED' && (
            <button
              onClick={() => updateWOStatus(wo.id, 'IN_PROGRESS', { startedAt: new Date().toISOString() })}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2"
            >
              ▶ Iniciar orden de trabajo
            </button>
          )}
          {wo.status === 'IN_PROGRESS' && (
            <button
              onClick={() => {
                const pendingTasks = db.woTasks?.filter((t) => t.woId === wo.id && !t.completed) || []
                if (pendingTasks.length > 0) {
                  ;(window as any)._toast?.(`Aún hay ${pendingTasks.length} actividad${pendingTasks.length !== 1 ? 'es' : ''} pendiente${pendingTasks.length !== 1 ? 's' : ''}`, 'error')
                  return
                }
                setCompleteModal(true)
              }}
              disabled={tasks.length > 0 && !allDone}
              className={clsx(
                'w-full py-4 font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]',
                tasks.length > 0 && !allDone
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              )}
            >
              ✅ Completar orden de trabajo
              {tasks.length > 0 && !allDone && <span className="text-sm font-normal">({completedTasks}/{tasks.length})</span>}
            </button>
          )}
          {wo.status === 'OPEN' && (
            <div className="py-3 text-center text-sm text-tx-3 bg-bg rounded-xl">
              Esta orden aún no está asignada a ti
            </div>
          )}
        </div>
      </div>

      {/* Checklist */}
      {tasks.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3">
              Checklist de actividades
            </h3>
            <span className={clsx(
              'text-xs font-bold px-2 py-0.5 rounded-full',
              allDone ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            )}>
              {completedTasks}/{tasks.length}
            </span>
          </div>
          <div className="flex flex-col divide-y divide-gray-50">
            {tasks.map((t) => (
              <label
                key={t.id}
                className={clsx(
                  'flex items-start gap-3 py-3 cursor-pointer transition-colors',
                  t.completed ? 'opacity-60' : ''
                )}
              >
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => {
                    if (wo.status === 'COMPLETED' || wo.status === 'CANCELLED') return
                    toggleWoTask(t.id)
                  }}
                  disabled={wo.status === 'COMPLETED' || wo.status === 'CANCELLED'}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-brand focus:ring-brand flex-shrink-0"
                />
                <span className={clsx('text-sm leading-snug', t.completed ? 'line-through text-tx-3' : 'text-tx-2')}>
                  {t.description}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Partes utilizadas */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3">Partes utilizadas</h3>
          <button
            onClick={() => setPartModal(true)}
            className="text-xs font-bold text-brand border border-brand/30 px-2.5 py-1 rounded-lg hover:bg-brand/5 transition-colors"
          >
            + Agregar
          </button>
        </div>
        {db.partUsages.filter((p) => p.workOrderId === wo.id).length === 0 ? (
          <p className="text-sm text-tx-3">Sin partes registradas</p>
        ) : (
          <div className="flex flex-col gap-2">
            {db.partUsages.filter((p) => p.workOrderId === wo.id).map((pu) => {
              const item = db.inventoryItems.find((i) => i.id === pu.inventoryItemId)
              return (
                <div key={pu.id} className="flex items-center justify-between bg-bg rounded-lg px-3 py-2">
                  <span className="text-sm text-tx-2 flex-1">{item?.name ?? '—'}</span>
                  <span className="text-sm font-bold text-tx ml-2">{pu.quantity} {item?.unit ?? ''}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Comentarios */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3 mb-3">Comentarios</h3>
        {db.woComments.filter((c) => c.workOrderId === wo.id).map((c) => {
          const user = db.users.find((u) => u.id === c.userId)
          return (
            <div key={c.id} className="mb-3 pb-3 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-bold text-tx">{user?.name ?? 'Usuario'}</span>
                <span className="text-[11px] text-tx-3">{format(new Date(c.createdAt), 'd MMM HH:mm')}</span>
              </div>
              <p className="text-sm text-tx-2 leading-relaxed">{c.text}</p>
            </div>
          )
        })}
        <div className="mt-3 flex flex-col gap-2">
          <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Agregar un comentario..." className="text-base" />
          <Button onClick={handleComment} disabled={!comment.trim()} className="w-full py-3">
            Enviar comentario
          </Button>
        </div>
      </div>

      {/* Modales */}
      {completeModal && <CompleteModal woId={wo.id} onClose={() => setCompleteModal(false)} />}
      {partModal     && <AddPartModal  woId={wo.id} onClose={() => setPartModal(false)} />}
    </div>
  )
}

// ── WODetail (desktop full) ───────────────────────────────────────
function WODetail({ woId, onEdit }: { woId: string; onEdit: () => void }) {
  const { db, updateWOStatus, addComment, removePartUsage } = useStore()
  const perms    = usePermissions()
  const [assignModal,   setAssignModal]   = useState(false)
  const [completeModal, setCompleteModal] = useState(false)
  const [partModal,     setPartModal]     = useState(false)
  const [comment,       setComment]       = useState('')

  const wo = db.workOrders.find((w) => w.id === woId)
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
    const pendingTasks = db.woTasks?.filter((t) => t.woId === woId && !t.completed) || []
    if (pendingTasks.length > 0) {
      ;(window as any)._toast?.(`Bloqueado: debes marcar todas las actividades del checklist (${pendingTasks.length} pendiente${pendingTasks.length !== 1 ? 's' : ''})`, 'error')
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
            <div className="text-[11px] text-tx-3 mb-1 flex items-center gap-2">
              <button
                onClick={() => useStore.getState().setSelectedWO(null)}
                className="lg:hidden text-brand font-semibold hover:underline flex items-center pr-2 border-r border-gray-200"
              >
                ← Volver
              </button>
              <span>{TYPE_ICON[wo.type]} {wo.type === 'PREVENTIVE' ? 'Preventivo' : 'Correctivo'} · {wo.id}</span>
            </div>
            <h2 className="font-display font-bold text-lg text-tx leading-snug">{wo.title}</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end flex-shrink-0">
            <Badge variant={STATUS_BADGE[wo.status] ?? 'neutral'}>{STATUS_LABEL[wo.status]}</Badge>
            <Badge variant={PRIORITY_BADGE[wo.priority] ?? 'neutral'}>{PRIORITY_LABEL[wo.priority]}</Badge>
            {perms.canEditWO && <Button size="sm" variant="secondary" onClick={onEdit}>Editar</Button>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {asset    && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">🏭 {asset.name}</span>}
          {reporter && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">👤 Reportado: {reporter.name}</span>}
          {assignee && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">👨‍🔧 Asignado: {assignee.name}</span>}
          {wo.dueDate && (
            <span className={clsx('text-xs px-2.5 py-1 rounded-full', overdue ? 'bg-red-100 text-red-700' : 'bg-bg-2 text-tx-2')}>
              📅 Vence: {format(new Date(wo.dueDate), 'd MMM yyyy')}
            </span>
          )}
          {wo.startedAt   && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">⏱ Iniciada: {format(new Date(wo.startedAt), 'd MMM HH:mm')}</span>}
          {wo.completedAt && <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full">✅ Completada: {format(new Date(wo.completedAt), 'd MMM HH:mm')}</span>}
          {pmPlan         && <span className="bg-bg-2 text-tx-2 text-xs px-2.5 py-1 rounded-full">📋 Plan: {pmPlan.name}</span>}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-5 flex-1">
        {wo.description && (
          <p className="text-sm text-tx-2 leading-relaxed">{wo.description}</p>
        )}

        {/* Checklist */}
        {(db.woTasks?.filter((t) => t.woId === woId).length ?? 0) > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3 mb-2">
              Actividades Requeridas ({db.woTasks!.filter((t) => t.woId === woId && t.completed).length}/{db.woTasks!.filter((t) => t.woId === woId).length})
            </h3>
            <div className="flex flex-col border border-gray-100 rounded-lg overflow-hidden bg-white">
              {db.woTasks!.filter((t) => t.woId === woId).sort((a, b) => a.order - b.order).map((t) => (
                <label key={t.id} className={clsx(
                  'flex items-start gap-3 p-3 border-b border-gray-50 last:border-0 cursor-pointer transition-colors',
                  t.completed ? 'bg-bg opacity-75' : 'hover:bg-bg'
                )}>
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => useStore.getState().toggleWoTask(t.id)}
                    disabled={wo.status === 'COMPLETED' || wo.status === 'CANCELLED'}
                    className="mt-0.5 rounded border-gray-200 text-brand focus:ring-brand"
                  />
                  <span className={clsx('text-sm', t.completed ? 'line-through text-tx-3' : 'text-tx-2')}>
                    {t.description}
                  </span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Acciones */}
        {perms.canChangeWOStatus && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3 mb-2">Acciones</h3>
            <div className="flex gap-2 flex-wrap">
              {actions.includes('asignar')   && perms.canAssignWO    && <Button size="sm" onClick={() => setAssignModal(true)}>Asignar</Button>}
              {actions.includes('reasignar') && perms.canAssignWO    && <Button size="sm" variant="secondary" onClick={() => setAssignModal(true)}>Reasignar</Button>}
              {actions.includes('iniciar')                           && <Button size="sm" onClick={() => updateWOStatus(woId, 'IN_PROGRESS', { startedAt: new Date().toISOString() })}>Iniciar</Button>}
              {actions.includes('completar')                         && <Button size="sm" onClick={handleCompleteClicked}>Completar</Button>}
              {actions.includes('cancelar')                          && <Button size="sm" variant="danger" onClick={() => { if (confirm('¿Cancelar esta orden?')) updateWOStatus(woId, 'CANCELLED') }}>Cancelar</Button>}
              {actions.includes('reabrir')   && perms.canReopenWO   && (
                <Button size="sm" variant="secondary" onClick={() => {
                  if (wo.type === 'PREVENTIVE' && wo.status === 'COMPLETED' && wo.pmPlanId) {
                    if (!confirm(
                      'Esta es una OT preventiva completada. Al reabrirla, el ciclo del plan ya avanzó — ' +
                      'la fecha de próximo mantenimiento NO se revertirá. ¿Continuar de todas formas?'
                    )) return
                  }
                  updateWOStatus(woId, 'OPEN')
                }}>Reabrir</Button>
              )}
            </div>
          </section>
        )}

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

        {/* Partes */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-tx-3">Partes Utilizadas ({parts.length})</h3>
            {perms.canAddParts && <Button size="xs" variant="secondary" onClick={() => setPartModal(true)}>+ Agregar</Button>}
          </div>
          {parts.length === 0 ? (
            <p className="text-sm text-tx-3">Sin partes registradas.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Ítem', 'Cantidad', 'Fecha', ''].map((h) => (
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
                        {perms.canRemoveParts && (
                          <Button size="xs" variant="secondary"
                            onClick={() => { if (confirm('¿Eliminar?')) removePartUsage(pu.id) }}>✕</Button>
                        )}
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
          {perms.canAddComments && (
            <div className="flex flex-col gap-2">
              <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Agregar comentario..." />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleComment} disabled={!comment.trim()}>Comentar</Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {assignModal   && <AssignModal   woId={woId} onClose={() => setAssignModal(false)} />}
      {completeModal && <CompleteModal woId={woId} onClose={() => setCompleteModal(false)} />}
      {partModal     && <AddPartModal  woId={woId} onClose={() => setPartModal(false)} />}
    </div>
  )
}

// ── Vista principal ───────────────────────────────────────────────
export function WorkOrders() {
  const { db, selectedWOId, setSelectedWO, woFilter, setWOFilter, openWOEditor } = useStore()
  const perms = usePermissions()
  const role  = useRole()
  const [displayCount, setDisplayCount] = useState(15)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list') // default lists but they can switch

  // Técnicos en móvil → vista especial
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024

  if (role === 'TECHNICIAN' && isMobile) {
    return <TechnicianMobileView />
  }

  const currentUser = useStore((s) => s.currentUser)
  const plants = db.assets.filter(a => a.category === 'plant')
  const areas = db.assets.filter(a => a.category === 'area' && (woFilter.plantId === 'all' ? true : a.parentId === woFilter.plantId))

  // Función recursiva para obtener root (planta) y padre (área)
  const getAssetHierarchy = (assetId: string | null) => {
    let curr = assetId ? db.assets.find(a => a.id === assetId) : null
    let plantId = 'all'
    let areaId = 'all'
    while (curr) {
      if (curr.category === 'plant') plantId = curr.id
      if (curr.category === 'area') areaId = curr.id
      curr = db.assets.find(a => a.id === curr?.parentId)
    }
    return { plantId, areaId }
  }

  // Filtrar: técnicos solo ven sus OTs (en desktop también)
  const baseWOs = role === 'TECHNICIAN'
    ? db.workOrders.filter((w) => w.assignedToId === currentUser?.id)
    : db.workOrders

  const filtered = baseWOs
    .filter((wo) => {
      if (woFilter.status   !== 'all' && wo.status   !== woFilter.status)   return false
      if (woFilter.type     !== 'all' && wo.type     !== woFilter.type)     return false
      if (woFilter.priority !== 'all' && wo.priority !== woFilter.priority) return false
      
      const { plantId, areaId } = getAssetHierarchy(wo.assetId)
      if (woFilter.plantId !== 'all' && plantId !== woFilter.plantId) return false
      if (woFilter.areaId !== 'all' && areaId !== woFilter.areaId) return false
      
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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
    <div className="flex flex-col flex-1 border border-gray-100 rounded-cmms overflow-hidden shadow-card bg-white min-h-[500px]">
      {/* Filter Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-bg flex-shrink-0 hide-scrollbar overflow-x-auto">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-tx hidden sm:inline">Filtros:</span>
          <div className="flex items-center gap-2">
            {[
              { key:'status',   opts:[['all','Todo Estado'],['OPEN','Abiertas'],['ASSIGNED','Asignadas'],['IN_PROGRESS','En Progreso'],['COMPLETED','Completadas'],['CANCELLED','Canceladas']] },
              { key:'type',     opts:[['all','Todo Tipo'],['CORRECTIVE','Correctivo'],['PREVENTIVE','Preventivo']] },
              { key:'priority', opts:[['all','Toda Prioridad'],['URGENT','Urgente'],['HIGH','Alta'],['NORMAL','Normal'],['LOW','Baja']] },
            ].map(({ key, opts }) => (
              <Select
                key={key}
                className="text-xs py-1.5 w-auto pr-8 bg-white border-gray-200"
                value={(woFilter as Record<string, string>)[key]}
                onChange={(e) => setWOFilter({ [key]: e.target.value })}
              >
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            ))}
            
            <Select
              className="text-xs py-1.5 w-auto pr-8 bg-white border-gray-200"
              value={woFilter.plantId || 'all'}
              onChange={(e) => setWOFilter({ plantId: e.target.value, areaId: 'all' })}
            >
              <option value="all">Toda Planta</option>
              {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>

            <Select
              className="text-xs py-1.5 w-auto pr-8 bg-white border-gray-200"
              value={woFilter.areaId || 'all'}
              onChange={(e) => setWOFilter({ areaId: e.target.value })}
            >
              <option value="all">Toda Área</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-4 shrink-0">
          <div className="hidden lg:flex items-center border border-gray-200 bg-white rounded-lg overflow-hidden">
            <button 
              onClick={() => setViewMode('list')} 
              className={clsx("px-3 py-1.5 text-xs font-bold transition-colors", viewMode === 'list' ? 'bg-brand text-white' : 'text-tx-2 hover:bg-gray-50')}
            >📋 Lista</button>
            <button 
              onClick={() => setViewMode('kanban')} 
              className={clsx("px-3 py-1.5 text-xs font-bold transition-colors", viewMode === 'kanban' ? 'bg-brand text-white' : 'text-tx-2 hover:bg-gray-50')}
            >🗂️ Kanban</button>
          </div>
          <div className="hidden xl:flex items-center gap-4 text-xs font-medium text-tx-3 border-r border-gray-200 pr-4">
            <span>Tot: <strong className="text-tx">{stats.total}</strong></span>
            <span>Ab: <strong className="text-green-600">{stats.open}</strong></span>
            <span>Prog: <strong className="text-amber-600">{stats.inProgress}</strong></span>
            <span>Venc: <strong className="text-red-600">{stats.overdue}</strong></span>
          </div>
          {perms.canCreateWO && (
            <Button size="sm" onClick={() => openWOEditor(null)}>+ Nueva OT</Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
           <div className="flex-1 w-full bg-gray-50/50">
             <KanbanBoard workOrders={filtered} onSelect={setSelectedWO} />
           </div>
        ) : (
          <div className={clsx(
            'flex-shrink-0 border-r border-gray-100 overflow-y-auto flex-col pb-4 bg-gray-50/50 transition-all duration-300',
            selectedWOId ? 'hidden lg:flex w-80' : 'flex flex-1 lg:flex-none lg:w-80'
          )}>
            {filtered.length === 0 ? (
              <EmptyState
                title="Sin órdenes"
                description="No hay órdenes que coincidan con los filtros."
                action={perms.canCreateWO ? <Button size="sm" onClick={() => openWOEditor(null)}>+ Crear OT</Button> : undefined}
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
                      onClick={() => setDisplayCount((c) => c + 15)}
                    >
                      Cargar más... ({filtered.length - displayCount} restantes)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Detalle */}
        {(selectedWOId && viewMode === 'kanban') && (
           <div className="hidden xl:block w-[400px] border-l border-gray-200 overflow-hidden bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] relative z-10 transition-all">
             <WODetail woId={selectedWOId} onEdit={() => openWOEditor(selectedWOId)} />
           </div>
        )}

        {(!selectedWOId && viewMode === 'kanban') && null}

        {viewMode === 'list' && (
          <div className={clsx(
            'flex-1 overflow-hidden bg-white',
            !selectedWOId ? 'hidden lg:block' : 'block w-full'
          )}>
            {selectedWOId ? (
              <WODetail woId={selectedWOId} onEdit={() => openWOEditor(selectedWOId)} />
            ) : (
              <NoSelection
                icon={<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>}
                title="Selecciona una orden"
                description="Haz clic en cualquier orden para ver sus detalles."
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

