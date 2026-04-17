import { useState } from 'react'
import { clsx } from 'clsx'
import { useStore } from '@/store'
import { Button, StatPill } from '@/components/ui'
import {
  format, startOfWeek, addDays, startOfMonth, getDaysInMonth,
  isPast, differenceInDays, isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'

type Mode = 'week' | 'month'

// ── helpers ───────────────────────────────────────────────────────
function isoDate(d: Date) { return format(d, 'yyyy-MM-dd') }

function getEventClass(dueDate: string, status?: string): string {
  if (status === 'COMPLETED') return 'ev-done'
  const d = new Date(dueDate)
  if (isPast(d))                          return 'ev-over'
  if (differenceInDays(d, new Date()) <= 3) return 'ev-soon'
  return 'ev-plan'
}

const evClasses: Record<string, string> = {
  'ev-plan': 'bg-blue-100 text-blue-700 border border-blue-200',
  'ev-soon': 'bg-amber-100 text-amber-700 border border-amber-200',
  'ev-over': 'bg-red-100 text-red-700 border border-red-200',
  'ev-done': 'bg-green-100 text-green-700 border border-green-200',
}

const WO_STATUS_CLS: Record<string, string> = {
  OPEN:'bg-amber-100 text-amber-700', ASSIGNED:'bg-blue-100 text-blue-700',
  IN_PROGRESS:'bg-amber-100 text-amber-700', COMPLETED:'bg-green-100 text-green-700',
  CANCELLED:'bg-gray-100 text-gray-500',
}
const WO_STATUS_LABEL: Record<string, string> = {
  OPEN:'Abierta', ASSIGNED:'Asignada', IN_PROGRESS:'En Progreso',
  COMPLETED:'Completada', CANCELLED:'Cancelada',
}

// ── Schedule component ────────────────────────────────────────────
export function Schedule() {
  const { db, navigate, openWOEditor } = useStore()
  const [mode,   setMode]   = useState<Mode>('week')
  const [offset, setOffset] = useState(0)

  // Calcular días del período
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const days: Date[] = (() => {
    if (mode === 'week') {
      const base = startOfWeek(today, { weekStartsOn: 0 })
      base.setDate(base.getDate() + offset * 7)
      return Array.from({ length: 7 }, (_, i) => addDays(base, i))
    } else {
      const base = startOfMonth(addDays(today, offset * 30))
      const n    = getDaysInMonth(base)
      return Array.from({ length: n }, (_, i) => addDays(base, i))
    }
  })()

  const startStr = isoDate(days[0])
  const endStr   = isoDate(days[days.length - 1])

  const periodLabel = mode === 'week'
    ? `${format(days[0], "d 'de' MMM", { locale: es })} — ${format(days[6], "d 'de' MMM yyyy", { locale: es })}`
    : format(days[0], 'MMMM yyyy', { locale: es })

  // Filas: solo assetPlans activos
  const activeAPs = db.assetPlans.filter((ap) => ap.active)

  // Eventos por celda
  function getEventsForCell(apId: string, day: Date) {
    const ds = isoDate(day)
    // OTs reales con este apId y esa fecha
    const wos = db.workOrders.filter(
      (wo) => wo.pmPlanId === apId && wo.dueDate && isoDate(new Date(wo.dueDate)) === ds
    )
    if (wos.length) {
      return wos.map((wo) => ({
        cls:   getEventClass(wo.dueDate!, wo.status),
        label: wo.status === 'COMPLETED' ? 'Hecho' : 'OT',
        woId:  wo.id,
      }))
    }
    // nextDueDate del plan
    const ap = db.assetPlans.find((a) => a.id === apId)
    if (ap?.nextDueDate && isoDate(new Date(ap.nextDueDate)) === ds) {
      return [{ cls: getEventClass(ap.nextDueDate), label: 'Plan', woId: null }]
    }
    return []
  }

  // Vencimientos en el período
  const upcoming = activeAPs
    .map((ap) => {
      if (!ap.nextDueDate) return null
      const d = isoDate(new Date(ap.nextDueDate))
      if (d < startStr || d > endStr) return null
      const plan  = db.pmPlans.find((p) => p.id === ap.pmPlanId)
      const asset = db.assets.find((a) => a.id === ap.assetId)
      return plan && asset ? { ap, plan, asset, dueDate: d } : null
    })
    .filter(Boolean)
    .sort((a, b) => a!.dueDate.localeCompare(b!.dueDate)) as Array<{
      ap: typeof activeAPs[0]; plan: typeof db.pmPlans[0]; asset: typeof db.assets[0]; dueDate: string
    }>

  // OTs en el período
  const periodWOs = db.workOrders
    .filter((wo) => wo.dueDate && isoDate(new Date(wo.dueDate)) >= startStr && isoDate(new Date(wo.dueDate)) <= endStr)
    .sort((a, b) => isoDate(new Date(a.dueDate!)).localeCompare(isoDate(new Date(b.dueDate!))))

  const overdueCount = periodWOs.filter(
    (wo) => wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED' && wo.dueDate && isPast(new Date(wo.dueDate))
  ).length

  // Ancho columna del plan
  const planColW = mode === 'week' ? '180px' : '140px'
  const gridCols = `${planColW} repeat(${days.length}, ${mode === 'week' ? '1fr' : 'minmax(26px,1fr)'})`

  return (
    <div className="flex flex-col gap-4">

      {/* Topbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display font-bold text-xl text-tx">Programación de Mantenimiento</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle semana/mes */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            {(['week','month'] as Mode[]).map((m) => (
              <button key={m}
                onClick={() => { setMode(m); setOffset(0) }}
                className={clsx(
                  'px-3 py-1.5 text-xs font-semibold transition-colors',
                  mode === m ? 'bg-brand text-white' : 'bg-white text-tx-2 hover:bg-bg'
                )}>
                {m === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          {/* Navegación */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset((o) => o - 1)}
              className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-tx-2 hover:border-brand hover:text-brand transition-colors text-lg">
              ‹
            </button>
            <span className="font-display font-bold text-sm text-tx min-w-[160px] text-center capitalize">
              {periodLabel}
            </span>
            <button
              onClick={() => setOffset((o) => o + 1)}
              className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-tx-2 hover:border-brand hover:text-brand transition-colors text-lg">
              ›
            </button>
            <Button size="sm" variant="secondary" onClick={() => setOffset(0)}>Hoy</Button>
          </div>
          <Button size="sm" onClick={() => navigate('plans')}>+ Nuevo Plan</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="flex gap-2 flex-wrap">
        <StatPill>{upcoming.length} vencimiento{upcoming.length !== 1 ? 's' : ''} en el período</StatPill>
        <StatPill variant={periodWOs.length > 0 ? 'warn' : 'ok'}>
          {periodWOs.length} OT{periodWOs.length !== 1 ? 's' : ''} programada{periodWOs.length !== 1 ? 's' : ''}
        </StatPill>
        {overdueCount > 0 && (
          <StatPill variant="err">⚠ {overdueCount} vencida{overdueCount !== 1 ? 's' : ''}</StatPill>
        )}
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 flex-wrap text-xs">
        {[
          { cls:'ev-plan', label:'Programado' },
          { cls:'ev-soon', label:'Próximo (≤3 días)' },
          { cls:'ev-over', label:'Vencido' },
          { cls:'ev-done', label:'Completado' },
        ].map(({ cls, label }) => (
          <div key={cls} className="flex items-center gap-1.5 text-tx-2">
            <div className={clsx('w-3 h-3 rounded', evClasses[cls])} />
            {label}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="overflow-x-auto border border-gray-100 rounded-cmms bg-white shadow-card">
        <div style={{ minWidth: '700px' }}>

          {/* Cabecera días */}
          <div className="grid border-b-2 border-gray-100 bg-bg" style={{ gridTemplateColumns: gridCols }}>
            <div className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-tx border-r border-gray-100">
              Equipo / Plan
            </div>
            {days.map((d) => {
              const it = isToday(d)
              return (
                <div key={isoDate(d)}
                  className={clsx('text-center py-2 border-r border-gray-100 last:border-0 text-[10px] font-bold', it ? 'text-brand' : 'text-tx-3')}>
                  {format(d, 'EEE', { locale: es })}
                  <div className={clsx(
                    'text-sm font-black mt-0.5 w-6 h-6 mx-auto flex items-center justify-center rounded-full',
                    it ? 'bg-brand text-white' : ''
                  )}>
                    {d.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Filas */}
          {activeAPs.length === 0 ? (
            <div className="py-10 text-center text-sm text-tx-3">
              Sin planes asignados a equipos.{' '}
              <button className="text-brand underline" onClick={() => navigate('assets')}>
                Ir al Árbol de Activos
              </button>{' '}
              para asignar planes a equipos.
            </div>
          ) : (
            activeAPs.map((ap) => {
              const plan  = db.pmPlans.find((p) => p.id === ap.pmPlanId)
              const asset = db.assets.find((a) => a.id === ap.assetId)
              if (!plan || !asset) return null

              return (
                <div key={ap.id}
                  className="grid border-b border-gray-50 last:border-0 hover:bg-bg-2/40 transition-colors"
                  style={{ gridTemplateColumns: gridCols, minHeight: '52px' }}>

                  {/* Info del plan */}
                  <div className="px-3 py-2 border-r border-gray-100 flex flex-col justify-center bg-bg">
                    <div className="text-[12px] font-semibold text-tx-2 truncate" title={asset.name}>
                      {asset.name}
                    </div>
                    <div className="text-[10px] text-tx-3 truncate mt-0.5" title={plan.name}>
                      {plan.name}
                    </div>
                  </div>

                  {/* Celdas de días */}
                  {days.map((d) => {
                    const events  = getEventsForCell(ap.id, d)
                    const todayCol = isToday(d)

                    return (
                      <div key={isoDate(d)}
                        className={clsx(
                          'border-r border-gray-50 last:border-0 relative flex items-center justify-center',
                          todayCol && 'bg-brand/[0.025]'
                        )}>
                        {events.map((ev, i) => (
                          <div key={i}
                            title={`${asset.name} — ${ev.label}`}
                            onClick={() => {
                              if (ev.woId) {
                                openWOEditor(ev.woId)
                              } else if (ev.label === 'Plan') {
                                openWOEditor(null, {
                                  assetId: asset.id,
                                  pmPlanId: plan.id,
                                  title: `[PM] ${plan.name}`,
                                  type: 'PREVENTIVE',
                                  dueDate: isoDate(d) + 'T00:00:00.000Z',
                                  assignedToId: plan.defaultAssignId || ''
                                })
                              }
                            }}
                            className={clsx(
                              'absolute inset-[3px] rounded-md flex items-center justify-center',
                              'text-[9px] font-bold uppercase tracking-wide transition-transform',
                              (ev.woId || ev.label === 'Plan') && 'cursor-pointer hover:scale-105',
                              evClasses[ev.cls]
                            )}>
                            {ev.label}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Resumen inferior */}
      <div className="grid grid-cols-3 gap-4">

        {/* Vencimientos */}
        <div className="bg-white border border-gray-100 rounded-cmms p-4 shadow-card">
          <h3 className="font-display font-bold text-sm text-tx mb-3">📋 Vencimientos en el período</h3>
          {upcoming.length === 0 ? (
            <p className="text-xs text-tx-3">Sin vencimientos en este período.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {upcoming.slice(0, 8).map(({ plan, asset, dueDate, ap }) => {
                const tdStr   = isoDate(today)
                const dueCls  = dueDate < tdStr ? 'err' : differenceInDays(new Date(dueDate), today) <= 3 ? 'warn' : 'ok'
                return (
                  <div key={ap.id} className="flex items-center justify-between py-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-tx truncate">{asset.name}</div>
                      <div className="text-[10px] text-tx-3 truncate">{plan.name}</div>
                    </div>
                    <span className={clsx(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                      dueCls === 'err' ? 'bg-red-100 text-red-700'
                      : dueCls === 'warn' ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                    )}>
                      {format(new Date(dueDate), 'd MMM')}
                    </span>
                  </div>
                )
              })}
              {upcoming.length > 8 && (
                <p className="text-[11px] text-tx-3 pt-2">+{upcoming.length - 8} más...</p>
              )}
            </div>
          )}
        </div>

        {/* OTs en el período */}
        <div className="bg-white border border-gray-100 rounded-cmms p-4 shadow-card">
          <h3 className="font-display font-bold text-sm text-tx mb-3">🔧 Órdenes en el período</h3>
          {periodWOs.length === 0 ? (
            <p className="text-xs text-tx-3">Sin órdenes en este período.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {periodWOs.slice(0, 8).map((wo) => (
                <div key={wo.id}
                  className="flex items-center justify-between py-2 gap-2 cursor-pointer hover:bg-bg rounded"
                  onClick={() => navigate('workorders')}>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-tx truncate">{wo.title}</div>
                  </div>
                  <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0', WO_STATUS_CLS[wo.status])}>
                    {WO_STATUS_LABEL[wo.status]}
                  </span>
                </div>
              ))}
              {periodWOs.length > 8 && (
                <p className="text-[11px] text-tx-3 pt-2">+{periodWOs.length - 8} más...</p>
              )}
            </div>
          )}
        </div>

        {/* Planes activos */}
        <div className="bg-white border border-gray-100 rounded-cmms p-4 shadow-card">
          <h3 className="font-display font-bold text-sm text-tx mb-3">🛡️ Planes activos</h3>
          {db.pmPlans.filter((p) => p.active).length === 0 ? (
            <p className="text-xs text-tx-3">Sin planes activos.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {db.pmPlans.filter((p) => p.active).slice(0, 8).map((plan) => {
                const eqs = db.assetPlans.filter((ap) => ap.pmPlanId === plan.id && ap.active).length
                return (
                  <div key={plan.id} className="flex items-center justify-between py-2 gap-2">
                    <div className="text-xs text-tx truncate flex-1">{plan.name}</div>
                    <div className="text-[10px] text-tx-3 flex-shrink-0">
                      {eqs} equipo{eqs !== 1 ? 's' : ''} · c/{plan.frequencyDays}d
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
