import { useStore } from '@/store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard', assets: 'Árbol de Activos',
  plans: 'Programas de Mantenimiento', schedule: 'Programación',
  workorders: 'Órdenes de Trabajo', inventory: 'Inventario & Repuestos',
}
const CRUMBS: Record<string, string> = {
  dashboard: 'Inicio / Dashboard', assets: 'Inicio / Árbol de Activos',
  plans: 'Inicio / Programas de Mantenimiento', schedule: 'Inicio / Programación',
  workorders: 'Inicio / Órdenes de Trabajo', inventory: 'Inicio / Inventario',
}

export function Topbar() {
  const view = useStore((s) => s.view)
  const today = format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })

  return (
    <header className="h-[58px] bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div>
        <h1 className="font-display font-bold text-lg text-tx leading-none">
          {TITLES[view] ?? view}
        </h1>
        <div className="text-[11px] text-tx-3 mt-0.5">{CRUMBS[view]}</div>
      </div>
      <div className="text-xs text-tx-3 font-medium capitalize">{today}</div>
    </header>
  )
}
