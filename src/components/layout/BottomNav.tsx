import { useStore, useActiveWOCount } from '@/store'
import { clsx } from 'clsx'
import { Home, Layers, Settings, FileText, Plus } from 'lucide-react'
import type { AppView } from '@/types'

const NAV_ITEMS: Array<{ view: AppView; label: string; icon: JSX.Element; badge?: boolean }> = [
  { view: 'dashboard', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
  { view: 'assets', label: 'Activos', icon: <Layers className="w-5 h-5" /> },
  { view: 'workorders', label: 'Órdenes', icon: <FileText className="w-5 h-5" />, badge: true },
  { view: 'schedule', label: 'Progam.', icon: <Settings className="w-5 h-5" /> },
]

export function BottomNav() {
  const { view, navigate } = useStore()
  const activeWOs = useActiveWOCount()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/10 z-30 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = view === item.view
          return (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className={clsx(
                'flex flex-col items-center justify-center w-full h-full space-y-1 relative',
                isActive ? 'text-brand' : 'text-tx-3 hover:text-tx-2'
              )}
            >
              <div className={clsx("relative transition-transform duration-200", isActive && "-translate-y-1")}>
                {item.icon}
                {item.badge && activeWOs > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-brand text-white text-[9px] font-bold px-1 rounded-full whitespace-nowrap min-w-[16px] text-center">
                    {activeWOs > 9 ? '9+' : activeWOs}
                  </span>
                )}
              </div>
              <span className={clsx(
                "text-[10px] font-medium transition-all duration-200",
                isActive ? "opacity-100" : "opacity-0 absolute bottom-1"
              )}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand rounded-b-full shadow-[0_2px_8px_rgba(99,102,241,0.5)]" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function FabMenu() {
  const openWOEditor = useStore((s) => s.openWOEditor)
  
  return (
    <button
      onClick={() => openWOEditor(null)}
      className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-brand hover:bg-brand-hover text-white rounded-full shadow-cardHov flex items-center justify-center z-40 transition-transform hover:scale-105 active:scale-95"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}
