import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LayoutDashboard, Wrench, Package, Settings,
  CalendarClock, Factory, Bell, ChevronDown, LogOut, User,
  Mail, ShieldCheck, Cpu, FileText
} from 'lucide-react';
import { useStore } from './store';
import { AppModule } from './shared/types';
import { Button, ToastRack, Avatar, cn, Badge, NotificationDot, AlertBanner } from './shared/components';
import AssetRegistryView from './modules/assets';
import WorkOrdersView from './modules/workorders';
import InventoryView from './modules/inventory';
import DashboardView from './modules/dashboard';
import PmEngineView from './modules/pm';
import SettingsView from './modules/settings';

const MODULES: { id: AppModule; label: string; icon: React.ReactNode; shortLabel: string }[] = [
  { id: 'dashboard',   label: 'Dashboard',        shortLabel: 'Inicio',    icon: <LayoutDashboard size={18} /> },
  { id: 'assets',      label: 'Activos',           shortLabel: 'Activos',   icon: <Factory size={18} /> },
  { id: 'workorders',  label: 'Órdenes de Trabajo',shortLabel: 'OTs',       icon: <Wrench size={18} /> },
  { id: 'inventory',   label: 'Inventario',         shortLabel: 'Stock',     icon: <Package size={18} /> },
  { id: 'pm',          label: 'Planes PM',          shortLabel: 'Planes',    icon: <FileText size={18} /> },
  { id: 'scheduler',   label: 'Programador',        shortLabel: 'Agenda',    icon: <CalendarClock size={18} /> },
  { id: 'settings',    label: 'Configuración',      shortLabel: 'Config',    icon: <Settings size={18} /> },
];

export default function App() {
  const {
    activeModule, setModule,
    sidebarOpen, toggleSidebar,
    toast, dismissToast,
    currentUser, users,
    initializeAuth, authLoading,
    signIn, loginAsDev,
    workOrders,
    meterAlerts, dismissMeterAlert,
  } = useStore() as any;

  const [emailInput, setEmailInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => { initializeAuth(); }, []);

  // Compute effective sidebar state
  const isExpanded = sidebarOpen || isHovered;

  // Count open WOs for badge
  const openWoCount = (workOrders || []).filter((w: any) =>
    ['open', 'assigned'].includes(w.status)
  ).length;

  // Meter alerts count
  const alertCount = (meterAlerts || []).filter((a: any) => !a.dismissed).length;
  const totalAlerts = openWoCount + alertCount;

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-[14px] bg-white shadow-floating border border-slate-100 flex items-center justify-center relative">
            <span className="font-display font-bold text-brand text-2xl relative z-10">A</span>
            <div className="absolute inset-0 bg-brand/5 rounded-[14px] animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-1 bg-slate-200 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute inset-0 bg-brand"
                animate={{ x: [-32, 32] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Cargando Sistema</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f9fafb] p-4 font-sans">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-[24px] bg-white flex items-center justify-center mx-auto mb-6 shadow-floating border border-slate-100 relative overflow-hidden group">
              <span className="font-display font-black text-brand text-4xl relative z-10 tracking-tighter">A</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight italic">APEX <span className="text-brand not-italic">CMMS</span></h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-2 opacity-50">Industrial Grade Maintenance</p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-[20px] border border-slate-100 shadow-floating p-8 relative">
            {!sent ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide ml-0.5">Acceso Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="usuario@empresa.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand focus:ring-[4px] focus:ring-brand/5 transition-all placeholder:text-slate-400 font-medium"
                      onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                    />
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  className="w-full h-12 rounded-xl shadow-lg shadow-brand/20 font-bold uppercase tracking-widest text-[11px]"
                  loading={sending}
                  onClick={handleSignIn}
                >
                  Enviar enlace de acceso
                </Button>

                <div className="relative flex items-center gap-4 py-2">
                  <div className="flex-1 border-t border-slate-100" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">o</span>
                  <div className="flex-1 border-t border-slate-100" />
                </div>

                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-slate-200 border-dashed hover:bg-slate-50 font-bold uppercase tracking-widest text-[11px]"
                  onClick={loginAsDev}
                  icon={<Cpu size={16} />}
                >
                  Acceso de desarrollador
                </Button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                  <ShieldCheck className="text-emerald-600" size={32} />
                </div>
                <p className="font-display font-bold text-slate-900 text-xl tracking-tight">Enlace Enviado</p>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed px-4">
                  Hemos enviado un enlace de acceso seguro a <br />
                  <span className="font-bold text-slate-900">{emailInput}</span>
                </p>
                <button 
                  onClick={() => setSent(false)}
                  className="mt-8 text-xs font-bold text-brand uppercase tracking-wider hover:underline"
                >
                  Volver a intentar
                </button>
              </motion.div>
            )}
          </div>
          
          <p className="text-center mt-12 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
            v2.5.0 • PREMIUM ENTERPRISE
          </p>
        </div>
      </div>
    );

    async function handleSignIn() {
      if (!emailInput) return;
      setSending(true);
      try {
        await signIn(emailInput);
        setSent(true);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setSending(false);
      }
    }
  }

  const activeAlerts = (meterAlerts || []).filter((a: any) => !a.dismissed);

  return (
    <div className="flex h-[100dvh] bg-[#f9fafb] overflow-hidden font-sans">
      {/* ── MOBILE BACKDROP ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <motion.aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setShowUserMenu(false); }}
        animate={{ width: isExpanded ? 256 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 shadow-xl lg:shadow-none overflow-hidden',
          'lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Logo */}
        <div className={cn(
          'h-16 flex items-center shrink-0 border-b border-slate-100',
          isExpanded ? 'px-6 gap-3' : 'justify-center px-0'
        )}>
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <span className="font-display font-black text-brand text-3xl tracking-tighter">A</span>
          </div>
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display font-bold text-slate-900 text-lg tracking-tight italic"
            >
              APEX <span className="text-brand not-italic text-sm align-top ml-0.5 opacity-60">CMMS</span>
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-none">
          {isExpanded && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4"
            >
              Mantenimiento
            </motion.p>
          )}
          {MODULES.map(mod => {
            const isActive = activeModule === mod.id;
            const badge = mod.id === 'workorders' && openWoCount > 0 ? openWoCount : null;
            return (
              <button
                key={mod.id}
                onClick={() => { setModule(mod.id); if (window.innerWidth < 1024) toggleSidebar(); }}
                className={cn(
                  'w-full flex items-center rounded-xl transition-all duration-200 relative group',
                  isExpanded ? 'px-4 py-3 gap-4' : 'justify-center h-12 w-12 mx-auto',
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 w-1 h-6 bg-brand rounded-r-full"
                  />
                )}
                <span className={cn('shrink-0 transition-transform duration-200', isActive ? 'scale-110' : 'group-hover:scale-110')}>
                  {mod.icon}
                </span>
                {isExpanded && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-bold tracking-wide flex-1 text-left"
                  >
                    {mod.label.toUpperCase()}
                  </motion.span>
                )}
                {isExpanded && badge && (
                  <Badge variant="brand" className="px-1.5 py-0.5 min-w-[20px] justify-center bg-brand text-white border-none shadow-sm">
                    {badge}
                  </Badge>
                )}
                {!isExpanded && badge && (
                  <NotificationDot count={badge} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-slate-100">
          {isExpanded ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent transition-all group"
              >
                <Avatar name={currentUser?.fullName || '?'} size="sm" className="ring-2 ring-slate-100 group-hover:ring-brand/20 transition-all" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{currentUser?.fullName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">{currentUser?.role}</p>
                </div>
                <ChevronDown size={14} className={cn('text-slate-300 transition-transform', showUserMenu ? 'rotate-180' : '')} />
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 w-full mb-3 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                  >
                    <div className="p-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 opacity-50">Cambiar Identidad</p>
                      {users?.slice(0, 5).map((u: any) => (
                        <button
                          key={u.id}
                          onClick={() => { useStore.getState().setCurrentUser(u); setShowUserMenu(false); }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-colors',
                            currentUser?.id === u.id ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          )}
                        >
                          <Avatar name={u.fullName} size="xs" />
                          <span className="truncate font-bold uppercase tracking-tight">{u.fullName}</span>
                          {currentUser?.id === u.id && <div className="ml-auto w-1 h-1 rounded-full bg-brand" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <Avatar name={currentUser?.fullName || '?'} size="sm" />
            </div>
          )}
        </div>
      </motion.aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center px-6 gap-4 bg-white/80 backdrop-blur-md border-b border-slate-100 shrink-0 z-40">
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all border border-slate-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-slate-900 text-lg tracking-tight truncate">
              {MODULES.find(m => m.id === activeModule)?.label}
            </h2>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all relative border border-transparent hover:border-slate-200"
            >
              <Bell size={20} />
              {totalAlerts > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full ring-2 ring-white" />
              )}
            </button>

            <AnimatePresence>
              {showAlerts && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-80 bg-white border border-slate-200 rounded-[14px] shadow-floating z-50 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Centro de Notificaciones</p>
                    <button onClick={() => setShowAlerts(false)}>
                      <X size={16} className="text-slate-400 hover:text-slate-900" />
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                    {activeAlerts.length === 0 && openWoCount === 0 && (
                      <div className="py-10 text-center">
                        <Bell className="mx-auto text-slate-200 mb-2" size={32} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin alertas nuevas</p>
                      </div>
                    )}
                    {openWoCount > 0 && (
                      <AlertBanner
                        type="warn"
                        title="Atención Requerida"
                        message={`${openWoCount} órdenes de trabajo pendientes de inicio.`}
                        action={
                          <button
                            className="text-[10px] font-bold text-brand uppercase tracking-wider hover:underline"
                            onClick={() => { setModule('workorders'); setShowAlerts(false); }}
                          >
                            Ir a Módulo →
                          </button>
                        }
                      />
                    )}
                    {activeAlerts.map((alert: any) => (
                      <AlertBanner
                        key={alert.id}
                        type="info"
                        title={alert.title}
                        message={alert.message}
                        onDismiss={() => dismissMeterAlert(alert.id)}
                        action={
                          <button
                            className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:underline"
                            onClick={() => { setModule('workorders'); setShowAlerts(false); }}
                          >
                            Programar →
                          </button>
                        }
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Critical Alerts Banner Section */}
        <div className="overflow-y-auto flex-1 bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {activeModule === 'dashboard'  && <DashboardView />}
              {activeModule === 'assets'     && <AssetRegistryView />}
              {activeModule === 'workorders' && <WorkOrdersView />}
              {activeModule === 'inventory'  && <InventoryView />}
              {activeModule === 'pm'         && <PmEngineView mode="plans" />}
              {activeModule === 'scheduler'  && <PmEngineView mode="scheduler" />}
              {activeModule === 'settings'   && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      <ToastRack toast={toast} onDismiss={dismissToast} />
    </div>
  );
}

