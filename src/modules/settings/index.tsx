import React from 'react';
import PmSettingsView from '../pm/components/PmSettingsView';
import { Settings, Gauge, Database, Bell, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn, MobilePanelTransition } from '../../shared/components';

const TABS = [
  { id: 'magnitudes', label: 'Catálogos', icon: <Database size={18} />, desc: 'Medidores, magnitudes y proveedores' },
  { id: 'general', label: 'Datos de Empresa', icon: <Database size={18} />, desc: 'Configuración general' },
  { id: 'notifications', label: 'Notificaciones', icon: <Bell size={18} />, desc: 'Alertas y recordatorios' },
];

export default function SettingsModule() {
  const [activeTab, setActiveTab] = React.useState('magnitudes');
  const [mobileView, setMobileView] = React.useState<'menu' | 'content'>('menu');

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileView('content');
  };

  return (
    <div className="flex flex-col h-full bg-bg-app">
      {/* Page header — visible on desktop or mobile menu */}
      <div className={cn(
        "bg-white border-b border-border px-4 sm:px-6 py-4 flex items-center gap-3 sticky top-0 z-10",
        mobileView === 'content' ? 'hidden lg:flex' : 'flex'
      )}>
        <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
          <Settings size={18} className="text-brand" />
        </div>
        <div>
          <h1 className="font-display font-bold text-tx">Configuración</h1>
          <p className="text-xs text-tx-4">Sistema y preferencias</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav / Menu */}
        <MobilePanelTransition 
          activePanel={mobileView} 
          panelKey="menu" 
          className="lg:w-72 lg:border-r lg:border-border bg-white"
        >
          <div className="p-3 space-y-1 flex-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={cn(
                  'w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all',
                  activeTab === tab.id
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-tx-2 hover:bg-bg-3 hover:text-tx'
                )}
              >
                <span className={cn('mt-0.5 shrink-0', activeTab === tab.id ? 'text-white' : 'text-tx-3')}>
                  {tab.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{tab.label}</p>
                  <p className={cn('text-xs mt-0.5', activeTab === tab.id ? 'text-white/70' : 'text-tx-4')}>
                    {tab.desc}
                  </p>
                </div>
                <ChevronRight size={14} className={cn('shrink-0 mt-0.5', activeTab === tab.id ? 'text-white/70' : 'text-tx-4')} />
              </button>
            ))}
          </div>

          {/* Version */}
          <div className="p-4 border-t border-border">
            <div className="bg-bg-3 rounded-xl p-3">
              <p className="text-[10px] font-bold text-tx-4 uppercase tracking-wider mb-1">Versión</p>
              <p className="text-xs text-tx font-mono">v1.3.0-beta</p>
              <p className="text-[10px] text-tx-4 mt-0.5">Premium Enterprise</p>
            </div>
          </div>
        </MobilePanelTransition>

        {/* Content */}
        <MobilePanelTransition 
          activePanel={mobileView} 
          panelKey="content" 
          className="flex-1 overflow-y-auto"
        >
          {/* Mobile Back Button */}
          <div className="lg:hidden flex items-center px-4 py-3 bg-white border-b border-border shrink-0">
            <button
              onClick={() => setMobileView('menu')}
              className="flex items-center gap-1 text-sm font-bold text-brand"
            >
              <ChevronLeft size={18} /> Volver a Ajustes
            </button>
          </div>

          <div className="h-full overflow-y-auto">
            {activeTab === 'magnitudes' ? (
              <PmSettingsView />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-tx-4 p-12">
                <div className="w-20 h-20 rounded-2xl bg-bg-3 flex items-center justify-center mb-4">
                  <Settings size={36} className="opacity-20" />
                </div>
                <h3 className="text-base font-semibold text-tx-2">En desarrollo</h3>
                <p className="text-sm text-center mt-2 max-w-xs">
                  Esta sección estará disponible en la próxima actualización.
                </p>
              </div>
            )}
          </div>
        </MobilePanelTransition>
      </div>
    </div>
  );
}
