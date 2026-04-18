import { clsx } from 'clsx'
import { useStore, useActiveWOCount, useLowStockCount } from '@/store'
import { usePermissions } from '@/hooks/usePermissions'
import type { AppView } from '@/types'

const ALL_NAV: Array<{ view: AppView; label: string; group?: string; icon: JSX.Element }> = [
  {
    view: 'dashboard', label: 'Dashboard',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  },
  {
    view: 'indicators', label: 'Indicadores KPI',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
  },
  {
    view: 'assets', label: 'Árbol de Activos', group: 'ACTIVOS',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="5" r="2" /><path d="M12 7v3" /><path d="M7 15H4a2 2 0 01-2-2v-1a2 2 0 012-2h16a2 2 0 012 2v1a2 2 0 01-2 2h-3" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
  },
  {
    view: 'plans', label: 'Programas de Mtto', group: 'MANTENIMIENTO',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>
  },
  {
    view: 'schedule', label: 'Programación',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
  },
  {
    view: 'workorders', label: 'Órdenes de Trabajo',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>
  },
  {
    view: 'inventory', label: 'Inventario & Repuestos', group: 'ALMACÉN',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
  },
]

// Mapa de qué permiso se necesita para ver cada vista
const VIEW_PERMISSION_KEY: Partial<Record<AppView, keyof ReturnType<typeof usePermissions>['canView']>> = {
  dashboard: 'dashboard', indicators: 'indicators', assets: 'assets',
  plans: 'plans', schedule: 'schedule', workorders: 'workorders', inventory: 'inventory',
}

export function Sidebar() {
  const { view, navigate, currentUser, seedSupabase, isMobileMenuOpen, setMobileMenuOpen } = useStore()
  const perms    = usePermissions()
  const activeWOs = useActiveWOCount()
  const lowStock = useLowStockCount()

  // Filtrar nav según permisos del rol actual
  const nav = ALL_NAV.filter((item) => {
    const key = VIEW_PERMISSION_KEY[item.view]
    return key ? perms.canView[key] : true
  })

  const navTo = (v: AppView) => {
    navigate(v)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden",
           isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className={clsx(
        "w-64 lg:w-56 bg-brand fixed top-0 left-0 bottom-0 z-30 flex flex-col overflow-y-auto overflow-x-hidden transition-transform duration-300 lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="font-display font-bold text-xl text-white tracking-wide">APEX</span>
            <span className="font-display font-semibold text-[10px] text-white/65 tracking-widest">CMMS</span>
          </div>
          <span className="text-[10px] text-white/35">v2.3</span>
        </div>

        {/* Nav — filtrado por rol */}
        <nav className="flex-1 px-2 py-2.5 flex flex-col gap-px">
          {nav.map((item) => (
            <div key={item.view}>
              {item.group && nav.find((n) => n.group === item.group)?.view === item.view && (
                <div className="text-[9px] font-bold tracking-widest uppercase text-white/35 px-2.5 pt-3 pb-1">
                  {item.group}
                </div>
              )}
              <button
                onClick={() => navTo(item.view)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left text-sm font-medium transition-all relative',
                  view === item.view
                    ? 'bg-white/16 text-white'
                    : 'text-white hover:bg-white/10 hover:text-white'
                )}
              >
              {view === item.view && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-white rounded-r" />
              )}
              {item.icon}
              <span className="flex-1 truncate">{item.label}</span>
              {item.view === 'workorders' && activeWOs > 0 && (
                <span className="bg-white text-brand text-[10px] font-bold px-1.5 py-px rounded-full">
                  {activeWOs}
                </span>
              )}
              {item.view === 'inventory' && lowStock > 0 && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-px rounded-full">
                  {lowStock}
                </span>
              )}
            </button>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-2 px-3.5 py-3 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
            {currentUser?.name.charAt(0) ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{currentUser?.name}</div>
            <div className="text-[10px] text-white/50">APEX Consulting SV</div>
          </div>
        </div>
        {perms.canResetDemo && (
          <button
            onClick={() => { if (confirm('¿Estás seguro? Esto borrará TODA la base de datos actual y restaurará la información de demostración.')) seedSupabase() }}
            className="bg-white/10 hover:bg-white/20 text-white rounded text-[10px] py-1.5 font-bold tracking-wide transition-colors uppercase w-full mt-1 flex items-center justify-center gap-1"
            title="Resetear base de datos y cargar demo"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reset Demo
          </button>
        )}
      </div>
    </aside>
    </>
  )
}
