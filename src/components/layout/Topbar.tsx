import { useState } from 'react'
import { useStore } from '@/store'
import { usePermissions } from '@/hooks/usePermissions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Role } from '@/types'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard', assets: 'Árbol de Activos', indicators: 'Indicadores KPI',
  plans: 'Programas de Mantenimiento', schedule: 'Programación',
  workorders: 'Órdenes de Trabajo', inventory: 'Inventario & Repuestos',
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador', SUPERVISOR: 'Supervisor', TECHNICIAN: 'Técnico',
}
const ROLE_COLOR: Record<Role, string> = {
  ADMIN:      'bg-purple-100 text-purple-700',
  SUPERVISOR: 'bg-red-100    text-red-700',
  TECHNICIAN: 'bg-green-100  text-green-700',
}

export function Topbar() {
  const { view, db, currentUser, setCurrentUser, setMobileMenuOpen } = useStore()
  const perms  = usePermissions()
  const [open,  setOpen]  = useState(false)
  const today  = format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })

  const activeUsers = db.users.filter((u) => u.active)

  return (
    <header className="h-[64px] bg-surface/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-1.5 -ml-1.5 text-tx-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6"  x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div>
          <h1 className="font-display font-bold text-lg text-tx leading-none">
            {TITLES[view] ?? view}
          </h1>
          <div className="text-[11px] text-tx-3 mt-0.5 hidden sm:block capitalize">{today}</div>
        </div>
      </div>

      {/* User switcher */}
      {perms.canSwitchUser && currentUser && (
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-bg transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-tx leading-none">{currentUser.name}</div>
              <div className={`text-[10px] font-bold px-1.5 mt-0.5 py-px rounded-full inline-block ${ROLE_COLOR[currentUser.role]}`}>
                {ROLE_LABEL[currentUser.role]}
              </div>
            </div>
            <svg className="w-3.5 h-3.5 text-tx-3 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9" /></svg>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-tx-3">Cambiar usuario (demo)</p>
                </div>
                {activeUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { setCurrentUser(u); setOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-bg ${currentUser.id === u.id ? 'bg-bg-2' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center font-bold text-sm text-brand flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-tx truncate">{u.name}</div>
                      <div className={`text-[10px] font-bold px-1.5 py-px rounded-full inline-block ${ROLE_COLOR[u.role]}`}>
                        {ROLE_LABEL[u.role]}
                      </div>
                    </div>
                    {currentUser.id === u.id && (
                      <svg className="w-4 h-4 text-brand flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </header>
  )
}
