import { useEffect } from 'react'
import { useStore } from '@/store'
import { useToast } from '@/hooks/useToast'
import { Sidebar }   from '@/components/layout/Sidebar'
import { Topbar }    from '@/components/layout/Topbar'
import { ToastRack } from '@/components/ui'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { Indicators } from '@/components/dashboard/Indicators'
import { AssetTree } from '@/components/assets/AssetTree'
import { PlansView } from '@/components/preventivo/PlansView'
import { Schedule }  from '@/components/schedule/Schedule'
import { WorkOrders, WOForm } from '@/components/workorders/WorkOrders'
import { Inventory } from '@/components/inventory/Inventory'

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-tx-3">
      <div className="text-center">
        <div className="text-4xl mb-3">🚧</div>
        <h3 className="font-display font-bold text-lg text-tx-2">{title}</h3>
        <p className="text-sm mt-1">Vista en construcción</p>
      </div>
    </div>
  )
}

function ViewRouter() {
  const view = useStore((s) => s.view)
  switch (view) {
    case 'dashboard':  return <Dashboard />
    case 'indicators': return <Indicators />
    case 'assets':     return <AssetTree />
    case 'plans':      return <PlansView />
    case 'schedule':   return <Schedule />
    case 'workorders': return <WorkOrders />
    case 'inventory':  return <Inventory />
    default:           return <ComingSoon title="Vista no implementada" />
  }
}

export default function App() {
  const { toasts, toast, dismiss } = useToast()
  const editingWOId     = useStore((s) => s.editingWOId)
  const closeWOEditor   = useStore((s) => s.closeWOEditor)
  const loadFromSupabase = useStore((s) => s.loadFromSupabase)
  const autoGeneratePMs  = useStore((s) => s.autoGeneratePMs)

  // FIX Bug 1: autoGeneratePMs debe correr DESPUÉS de que los datos carguen.
  // Se encadena la carga con la generación en lugar de correr en paralelo.
  useEffect(() => {
    const init = async () => {
      await loadFromSupabase()
      await autoGeneratePMs()
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  ;(window as unknown as Record<string, unknown>)._toast = toast

  return (
    <div className="flex min-h-screen bg-bg font-sans">
      <Sidebar />
      <div className="lg:ml-56 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 px-4 lg:px-6 py-5 overflow-y-auto">
          <ViewRouter />
        </main>
      </div>
      {editingWOId !== false && (
        <WOForm woId={editingWOId as string | null} onClose={closeWOEditor} />
      )}
      <ToastRack toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
