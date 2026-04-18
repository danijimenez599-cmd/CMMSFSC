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
        "bg-surface dark:bg-bg-2 border-r border-gray-200/50 dark:border-white/10 fixed top-0 left-0 bottom-0 z-30 flex flex-col overflow-y-auto overflow-x-hidden transition-[width,transform] duration-300",
        // Mobile
        "w-64",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop
        "lg:translate-x-0 lg:w-[72px] xl:w-56 hover:lg:w-56 group"
      )}>
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-[18px] border-b border-gray-100 dark:border-white/5 flex-shrink-0 h-[64px]">
          <div className="flex items-baseline gap-1 overflow-hidden whitespace-nowrap">
            <span className="font-display font-bold text-xl text-brand tracking-wide transition-all duration-300">
               <span className="lg:hidden xl:inline group-hover:lg:inline">APEX</span>
               <span className="hidden lg:inline xl:hidden group-hover:lg:hidden text-2xl ml-1">A</span>
            </span>
            <span className={clsx(
              "font-display font-semibold text-[10px] text-tx-3 tracking-widest transition-all duration-300",
              "lg:hidden xl:inline group-hover:lg:inline"
            )}>CMMS</span>
          </div>
        </div>

        {/* Nav — filtrado por rol */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5">
          {nav.map((item) => (
            <div key={item.view}>
              {item.group && nav.find((n) => n.group === item.group)?.view === item.view && (
                <div className={clsx(
                  "text-[9px] font-bold tracking-widest uppercase text-tx-3 px-2 pt-4 pb-1 transition-all duration-300 whitespace-nowrap overflow-hidden",
                  "lg:h-0 lg:p-0 lg:opacity-0 xl:h-auto xl:pt-4 xl:pb-1 xl:opacity-100 group-hover:lg:h-auto group-hover:lg:pt-4 group-hover:lg:pb-1 group-hover:lg:opacity-100"
                )}>
                  {item.group}
                </div>
              )}
              <button
                onClick={() => navTo(item.view)}
                className={clsx(
                  'flex items-center gap-3 px-2 xl:px-3 rounded-xl w-full text-left text-sm font-medium transition-all relative whitespace-nowrap overflow-hidden h-10',
                  view === item.view
                    ? 'bg-brand/10 text-brand'
                    : 'text-tx-2 hover:bg-gray-100 dark:hover:bg-white/5',
                  "lg:justify-center xl:justify-start group-hover:lg:justify-start"
                )}
              >
              <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">{item.icon}</div>
              <span className={clsx(
                "flex-1 transition-all duration-300",
                "lg:hidden xl:block group-hover:lg:block"
              )}>{item.label}</span>
              {item.view === 'workorders' && activeWOs > 0 && (
                <span className={clsx(
                  "bg-brand text-white text-[10px] font-bold px-1.5 py-px rounded-full flex-shrink-0",
                  "lg:hidden xl:inline-block group-hover:lg:inline-block absolute right-2"
                )}>
                  {activeWOs}
                </span>
              )}
              {item.view === 'inventory' && lowStock > 0 && (
                <span className={clsx(
                  "bg-ocre/20 text-ocre text-[10px] font-bold px-1.5 py-px rounded-full flex-shrink-0",
                  "lg:hidden xl:inline-block group-hover:lg:inline-block absolute right-2"
                )}>
                  {lowStock}
                </span>
              )}
            </button>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-3 px-4 py-4 border-t border-gray-100 dark:border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center font-bold text-sm text-brand flex-shrink-0">
            {currentUser?.name.charAt(0) ?? 'A'}
          </div>
          <div className={clsx(
            "flex-1 min-w-0 transition-all duration-300",
            "lg:hidden xl:block group-hover:lg:block"
          )}>
            <div className="text-sm font-semibold text-tx truncate leading-tight">{currentUser?.name}</div>
            <div className="text-[11px] text-tx-3 truncate mt-0.5">APEX Consulting</div>
          </div>
        </div>
        {perms.canResetDemo && (
          <button
            onClick={() => { if (confirm('¿Estás seguro? Esto borrará TODA la base de datos actual y restaurará la información de demostración.')) seedSupabase() }}
            className={clsx(
              "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-lg text-xs py-2 font-bold tracking-wide transition-colors uppercase flex items-center justify-center gap-2 overflow-hidden",
              "lg:w-9 lg:h-9 lg:p-0 xl:w-full xl:h-auto xl:px-3 hover:lg:w-full hover:lg:h-auto hover:lg:p-2"
            )}
            title="Resetear base de datos y cargar demo"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            <span className={clsx(
              "whitespace-nowrap transition-opacity duration-300",
              "lg:opacity-0 lg:w-0 xl:opacity-100 xl:w-auto group-hover:lg:opacity-100 group-hover:lg:w-auto"
            )}>Reset Demo</span>
          </button>
        )}
      </div>
    </aside>
    </>
  )
}
