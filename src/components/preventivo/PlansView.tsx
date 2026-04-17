import { useState } from 'react'
import { useStore } from '@/store'
import type { PmPlan } from '@/types'
import { Badge, Button, Modal, FormField, Input, Select, Textarea, EmptyState } from '@/components/ui'

// ── PlanForm con checklist editable ──────────────────────────────
function PlanForm({ planId, onClose }: { planId: string | null; onClose: () => void }) {
  const { db, savePlan, deletePlan } = useStore()
  const existing = planId ? db.pmPlans.find((p) => p.id === planId) : null
  const existingTasks = planId
    ? db.pmTasks.filter((t) => t.pmPlanId === planId).sort((a, b) => a.order - b.order).map((t) => t.description)
    : ['']

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    frequencyDays: existing?.frequencyDays ?? 30,
    defaultAssignId: existing?.defaultAssignId ?? '',
    notes: existing?.notes ?? '',
    active: existing?.active ?? true,
  })
  const [tasks, setTasks] = useState<string[]>(existingTasks)
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }))

  const addTask = () => setTasks((t) => [...t, ''])
  const removeTask = (i: number) => setTasks((t) => t.filter((_, idx) => idx !== i))
  const updateTask = (i: number, v: string) => setTasks((t) => t.map((x, idx) => idx === i ? v : x))

  const handleSave = () => {
    if (!form.name.trim()) return
    savePlan(
      { id: planId ?? undefined, ...form, defaultAssignId: form.defaultAssignId || null },
      tasks
    )
    onClose()
  }

  const users = db.users.filter((u) => u.active)

  return (
    <Modal open title={planId ? 'Editar Plan' : 'Nuevo Plan de Mantenimiento'} onClose={onClose} large
      footer={
        <div className="flex gap-2 w-full">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          {planId && (
            <Button variant="danger" onClick={() => { if (confirm('¿Eliminar plan?')) { deletePlan(planId); onClose() } }}>
              Eliminar
            </Button>
          )}
          <Button onClick={handleSave} className="ml-auto">Guardar</Button>
        </div>
      }>

      <FormField label="Nombre del plan *">
        <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej. Lubricación mensual compresor" />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Frecuencia (días)" hint="30 = mensual · 90 = trimestral · 365 = anual">
          <Input type="number" min={1} value={form.frequencyDays}
            onChange={(e) => set('frequencyDays', parseInt(e.target.value) || 30)} />
        </FormField>
        <FormField label="Técnico por defecto">
          <Select value={form.defaultAssignId} onChange={(e) => set('defaultAssignId', e.target.value)}>
            <option value="">Sin asignar</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
        </FormField>
      </div>

      <FormField label="Notas">
        <Textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)}
          placeholder="Especificaciones, materiales, advertencias..." />
      </FormField>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)}
          className="accent-brand w-4 h-4" />
        <span className="text-sm">Plan activo</span>
      </label>

      {/* Checklist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-tx-2">Checklist de actividades</label>
          <Button size="xs" variant="secondary" onClick={addTask}>+ Agregar tarea</Button>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {tasks.map((desc, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 last:border-0">
              <span className="text-[11px] text-tx-3 w-5 text-center flex-shrink-0">{i + 1}</span>
              <input
                className="flex-1 border-0 outline-none text-sm text-tx bg-transparent"
                placeholder="Descripción de la tarea..."
                value={desc}
                onChange={(e) => updateTask(i, e.target.value)}
              />
              <button onClick={() => removeTask(i)}
                className="w-6 h-6 flex items-center justify-center text-tx-3 hover:bg-red-50 hover:text-red-600 rounded transition-colors text-xs">
                ✕
              </button>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-tx-3 mt-1.5">
          Estas tareas aparecerán como checklist al generar una OT desde este plan.
        </p>
      </div>
    </Modal>
  )
}

// ── PlanCard ──────────────────────────────────────────────────────
function PlanCard({ plan, onEdit }: { plan: PmPlan; onEdit: () => void }) {
  const db = useStore((s) => s.db)
  const tasks      = db.pmTasks.filter((t) => t.pmPlanId === plan.id).sort((a, b) => a.order - b.order)
  const assignee   = db.users.find((u) => u.id === plan.defaultAssignId)
  const equipCount = db.assetPlans.filter((ap) => ap.pmPlanId === plan.id && ap.active).length
  const woCount    = db.workOrders.filter((wo) => {
    const ap = db.assetPlans.find((a) => a.id === wo.pmPlanId)
    return ap?.pmPlanId === plan.id
  }).length

  return (
    <div className={`border border-gray-100 rounded-cmms overflow-hidden shadow-card hover:-translate-y-0.5 transition-transform flex flex-col bg-white ${!plan.active ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3 p-4 bg-bg border-b border-gray-100">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-tx-3">⏰ Cada {plan.frequencyDays} días · {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}</div>
          <div className="font-display font-bold text-sm text-tx mt-1 leading-snug">{plan.name}</div>
        </div>
        <Badge variant={plan.active ? 'ok' : 'neutral'}>{plan.active ? 'Activo' : 'Inactivo'}</Badge>
      </div>

      <div className="p-4 flex-1">
        {/* Checklist preview */}
        {tasks.length > 0 && (
          <div className="mb-3">
            {tasks.slice(0, 4).map((t, i) => (
              <div key={t.id} className="flex items-start gap-2 py-0.5 text-xs text-tx-2">
                <span className="w-4 h-4 rounded-full bg-brand-pale text-brand text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {t.description}
              </div>
            ))}
            {tasks.length > 4 && <div className="text-[11px] text-tx-3 pl-6">+{tasks.length - 4} más...</div>}
          </div>
        )}

        <div className="flex gap-4 text-xs text-tx-2">
          <span>👨‍🔧 {assignee?.name ?? 'Sin asignar'}</span>
          <span>🏭 {equipCount} equipo{equipCount !== 1 ? 's' : ''}</span>
          <span>📋 {woCount} OT{woCount !== 1 ? 's' : ''}</span>
        </div>
        {plan.notes && <p className="text-[11px] text-tx-3 mt-2 italic">{plan.notes}</p>}
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-bg">
        <div className="text-[11px] text-tx-3">{equipCount} equipo{equipCount !== 1 ? 's asignados' : ' asignado'}</div>
        <Button size="xs" variant="secondary" onClick={onEdit}>Editar</Button>
      </div>
    </div>
  )
}

// ── Vista principal de planes ─────────────────────────────────────
export function PlansView() {
  const db = useStore((s) => s.db)
  const [editId, setEditId] = useState<string | null | false>(false)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-tx">Planes de Mantenimiento Preventivo</h1>
          <p className="text-sm text-tx-3 mt-0.5">Planes genéricos — asígnalos a equipos desde el Árbol de Activos</p>
        </div>
        <Button onClick={() => setEditId(null)}>+ Nuevo Plan</Button>
      </div>

      {db.pmPlans.length === 0 ? (
        <EmptyState
          icon={<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>}
          title="No hay planes preventivos"
          description="Crea un plan genérico y luego asígnalo a los equipos desde el Árbol de Activos."
          action={<Button onClick={() => setEditId(null)}>+ Crear primer plan</Button>}
        />
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {db.pmPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onEdit={() => setEditId(plan.id)} />
          ))}
        </div>
      )}

      {editId !== false && <PlanForm planId={editId} onClose={() => setEditId(false)} />}
    </div>
  )
}
