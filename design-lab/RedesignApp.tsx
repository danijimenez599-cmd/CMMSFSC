import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Wrench, Package, Settings, 
  Factory, Bell, Search, Menu, X, ChevronRight,
  User, LogOut, HelpCircle, FileText, Calendar
} from 'lucide-react';
import { Button, Badge, Avatar, cn, StatCard, Card } from './Components';
import { MOCK_USER, MOCK_STATS, MOCK_WORK_ORDERS } from './MockData';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'assets', label: 'Activos', icon: <Factory size={20} /> },
  { id: 'workorders', label: 'Órdenes', icon: <Wrench size={20} /> },
  { id: 'inventory', label: 'Stock', icon: <Package size={20} /> },
  { id: 'pm', label: 'Planes PM', icon: <FileText size={20} /> },
  { id: 'scheduler', label: 'Agenda', icon: <Calendar size={20} /> },
];

export default function RedesignApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* ── SIDEBAR ── */}
      <aside 
        className={cn(
          "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-50">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand/20">
            <span className="text-white font-black text-2xl tracking-tighter">A</span>
          </div>
          {sidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-display font-bold text-xl tracking-tight italic"
            >
              APEX <span className="text-brand not-italic">CMMS</span>
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl transition-all group",
                sidebarOpen ? "px-4 py-3" : "justify-center h-12",
                activeTab === item.id 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span className={cn("shrink-0", activeTab === item.id ? "scale-110" : "group-hover:scale-110")}>
                {item.id === 'workorders' ? (
                  <div className="relative">
                    {item.icon}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full ring-2 ring-white" />
                  </div>
                ) : item.icon}
              </span>
              {sidebarOpen && (
                <span className="text-sm font-bold tracking-tight uppercase">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100">
          <div className={cn("flex items-center gap-3 p-2 rounded-xl bg-slate-50", !sidebarOpen && "justify-center")}>
            <Avatar name={MOCK_USER.fullName} size="sm" />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{MOCK_USER.fullName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{MOCK_USER.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar activos, OTs..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </div>
            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <Button variant="primary" size="sm" className="rounded-xl shadow-md">
              Nueva OT
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {MOCK_STATS.map((stat, i) => (
                <StatCard 
                  key={i}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  variant={stat.variant as any}
                  icon={i === 0 ? <Wrench /> : i === 1 ? <Factory /> : i === 2 ? <Package /> : <Bell />}
                />
              ))}
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Recent Activity */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Actividad Reciente</h2>
                  <Button variant="ghost" size="xs">Ver todo <ChevronRight size={14} /></Button>
                </div>
                
                <div className="space-y-3">
                  {MOCK_WORK_ORDERS.map((wo) => (
                    <Card key={wo.id} className="p-4 flex items-center gap-4 group">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        wo.status === 'open' ? "bg-red-50 text-brand" : "bg-blue-50 text-blue-600"
                      )}>
                        <Wrench size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{wo.id}</span>
                          <Badge variant={wo.priority}>{wo.priority}</Badge>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-brand transition-colors">{wo.title}</h3>
                        <p className="text-xs text-slate-500">{wo.asset}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={wo.status}>{wo.status}</Badge>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">Hace 2 horas</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right Column: Quick Info */}
              <div className="space-y-6">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Resumen del Turno</h2>
                <Card className="p-6 bg-slate-900 text-white border-none shadow-xl shadow-slate-900/20">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Eficiencia Operativa</p>
                  <div className="text-4xl font-display font-black tracking-tighter mb-2">94.2%</div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: '94.2%' }}
                      className="h-full bg-brand"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                    El rendimiento es <span className="text-white font-bold">2.4% mayor</span> que el promedio semanal.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xs font-bold text-slate-900 uppercase mb-4">Próximos Preventivos</h3>
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="flex gap-3">
                        <div className="w-1 bg-brand/20 rounded-full" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Inspección de Seguridad</p>
                          <p className="text-[10px] text-slate-500">Mañana • 08:00 AM</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
