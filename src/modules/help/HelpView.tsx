import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Compass, 
  Zap, 
  ShieldCheck, 
  Factory, 
  Cpu, 
  ClipboardList, 
  Package, 
  CalendarClock, 
  ChevronRight,
  Sparkles,
  HelpCircle,
  PlayCircle,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Info,
  LayoutDashboard,
  Bell,
  Settings,
  TrendingUp,
  ListChecks,
  Truck,
  Users
} from 'lucide-react';
import { Button, Badge, cn } from '../../shared/components';

interface GuideStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const MODULE_GUIDES: Record<string, GuideStep[]> = {
  dashboard: [
    { title: 'Monitor de KPIs', description: 'Observe la disponibilidad de planta, el MTTR (Tiempo Medio de Reparación) y el cumplimiento de preventivos en tiempo real.', icon: <LayoutDashboard size={20} />, color: 'bg-indigo-600' },
    { title: 'Control de Backlog', description: 'Identifique cuellos de botella visualizando cuántas OTs están vencidas o en espera de repuestos.', icon: <ClipboardList size={20} />, color: 'bg-slate-800' },
    { title: 'Gestión de Alertas', description: 'Atienda disparos inmediatos provenientes de sensores de condición (CBM) antes de que ocurra una falla.', icon: <Bell size={20} />, color: 'bg-brand' },
    { title: 'Resumen Financiero', description: 'Visualice la distribución de costos entre mantenimiento correctivo, preventivo y predictivo.', icon: <Zap size={20} />, color: 'bg-amber-600' },
  ],
  assets: [
    { title: '1. Estructura Jerárquica', description: 'Navegue por el árbol de activos. Use "Nuevo Activo" para construir la jerarquía: Planta > Área > Proceso > Equipo.', icon: <Factory size={20} />, color: 'bg-blue-600' },
    { title: '2. Ficha Técnica e Ingeniería', description: 'Complete los metadatos críticos (Marca, Modelo, Serial) y defina el nivel de criticidad para priorizar el mantenimiento.', icon: <Cpu size={20} />, color: 'bg-indigo-600' },
    { title: '3. Configuración de Sensores', description: 'Vincule medidores (CBM) desde la pestaña "Instrumentación" para monitorear vibración, temperatura o medidores de horas.', icon: <Zap size={20} />, color: 'bg-amber-500' },
    { title: '4. Ciclo de Vida y Soft-Delete', description: 'Cambie el estado a "Decommissioned" para equipos fuera de servicio, preservando siempre su historial de mantenimiento.', icon: <ShieldCheck size={20} />, color: 'bg-slate-900' },
  ],
  workorders: [
    { title: '1. Creación y Asignación', description: 'Genere OTs correctivas manualmente o reciba preventivas automáticas. Asigne un técnico y defina la prioridad (Baja, Media, Alta, Crítica).', icon: <ClipboardList size={20} />, color: 'bg-emerald-500' },
    { title: '2. Ejecución y Reporte', description: 'Cambie el estado a "In Progress" para iniciar el conteo de tiempo. Registre hallazgos, diagnóstico y la resolución técnica detallada.', icon: <PlayCircle size={20} />, color: 'bg-blue-500' },
    { title: '3. Repuestos y Mano de Obra', description: 'Vincule ítems del inventario utilizados en la reparación y registre las horas reales del técnico para calcular el costo operativo.', icon: <Package size={20} />, color: 'bg-orange-500' },
    { title: '4. Cierre y Snapshot', description: 'Al finalizar ("Complete"), el sistema captura una fotografía inmutable del activo, técnico y proveedor para auditorías históricas.', icon: <ShieldCheck size={20} />, color: 'bg-slate-900' },
  ],
  inventory: [
    { title: '1. Catálogo de Repuestos', description: 'Registre cada componente con su Número de Parte, Categoría y Proveedor preferencial para facilitar la búsqueda técnica.', icon: <Package size={20} />, color: 'bg-blue-600' },
    { title: '2. Niveles y Almacenes', description: 'Defina Stock Mínimo y Punto de Reorden. El sistema resaltará automáticamente los ítems que requieran compra urgente.', icon: <TrendingUp size={20} />, color: 'bg-emerald-600' },
    { title: '3. Entradas y Salidas', description: 'Registre ingresos por compra o salidas manuales. Las salidas vinculadas a OTs se descuentan automáticamente del stock real.', icon: <ArrowRight size={20} />, color: 'bg-indigo-500' },
    { title: '4. Valorización', description: 'Monitoree el valor total de su almacén y el consumo histórico por activo para optimizar su presupuesto anual.', icon: <Zap size={20} />, color: 'bg-amber-600' },
  ],
  pm: [
    { title: '1. Definición de Protocolos', description: 'Cree planes maestros genéricos definiendo frecuencias fijas (ej. Mensual) o basadas en medidores de uso (ej. cada 500 hrs).', icon: <BookOpen size={20} />, color: 'bg-purple-600' },
    { title: '2. Secuencia de Tareas (SOP)', description: 'Establezca el paso a paso técnico detallado que el técnico deberá seguir. Estas tareas se heredarán a cada OT generada.', icon: <ListChecks size={20} />, color: 'bg-indigo-500' },
    { title: '3. Vinculación de Activos', description: 'Asigne el protocolo a múltiples activos similares. Cada vinculación mantiene su propio contador de ciclo independiente.', icon: <ArrowRight size={20} />, color: 'bg-emerald-500' },
    { title: '4. Sincronización Predictiva', description: 'El sistema calcula automáticamente la próxima fecha de vencimiento basada en el último mantenimiento realizado.', icon: <Sparkles size={20} />, color: 'bg-brand' },
  ],
  scheduler: [
    { title: '1. Calendario 360°', description: 'Visualice OTs reales (negro) y proyecciones sugeridas (azul ghost). Use este tablero para balancear la carga de trabajo semanal.', icon: <CalendarClock size={20} />, color: 'bg-indigo-600' },
    { title: '2. Horizonte de Planificación', description: 'Defina cuántos días hacia el futuro debe mirar el motor. Un horizonte de 30 días es ideal para la operación mensual.', icon: <Compass size={20} />, color: 'bg-slate-700' },
    { title: '3. Ejecución del Motor', description: 'Pulse "Ejecutar Scheduler" para que el sistema cree automáticamente las OTs preventivas que están por vencer.', icon: <PlayCircle size={20} />, color: 'bg-brand' },
    { title: '4. Backlog Preventivo', description: 'Identifique planes vencidos que no tienen OT abierta. El sistema le alertará para regularizar el plan de mantenimiento.', icon: <ClipboardList size={20} />, color: 'bg-danger' },
  ],
  settings: [
    { title: '1. Parámetros del Motor', description: 'Ajuste el horizonte de proyección visual (hasta 24 meses) para controlar qué tanto futuro muestra el calendario.', icon: <CalendarClock size={20} />, color: 'bg-brand' },
    { title: '2. Catálogo de Magnitudes', description: 'Defina las variables de medición (presión, temperatura, etc.) y si son acumulativas (odómetros) o instantáneas.', icon: <TrendingUp size={20} />, color: 'bg-indigo-500' },
    { title: '3. Panel de Proveedores', description: 'Gestione la base de datos de contratistas externos y servicios especializados vinculados a sus OTs.', icon: <Truck size={20} />, color: 'bg-slate-800' },
    { title: '4. Seguridad y Roles', description: 'Administre los niveles de acceso (Admin, Supervisor, Técnico) para proteger la integridad de la configuración maestra.', icon: <Users size={20} />, color: 'bg-slate-600' },
  ],
};

const TRAINER_TIPS = [
  { title: 'Cierre Seguro', text: 'Nunca elimine un activo que tenga historial. Use "Decommissioned" para mantener la integridad.', icon: <ShieldCheck size={16} /> },
  { title: 'Filtros Avanzados', text: 'Puede filtrar OTs por jerarquía técnica completa seleccionando una Planta o Área.', icon: <Compass size={16} /> },
  { title: 'Horizonte Visual', text: 'Ajuste los meses de proyección en Configuración para ver más o menos futuro en el calendario.', icon: <CalendarClock size={16} /> },
];

export default function HelpView() {
  const [selectedModule, setSelectedModule] = useState<keyof typeof MODULE_GUIDES>('dashboard');

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50/50 scrollbar-thin">
      {/* Hero Section */}
      <div className="relative bg-slate-900 py-20 px-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6"
          >
            <Sparkles size={14} className="text-brand" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Centro de Entrenamiento APEX</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-black text-white tracking-tight mb-6"
          >
            Domine la Gestión de <br />
            <span className="text-brand">Activos Industriales</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Bienvenido al módulo de ayuda. Aquí aprenderá a utilizar todas las capacidades 
            de APEX CMMS para maximizar la confiabilidad de su planta.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 -mt-10 pb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Guided Modules */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-1.5 flex flex-wrap gap-1 bg-slate-50 border-b border-slate-100">
                {(['dashboard', 'assets', 'workorders', 'inventory', 'pm', 'scheduler', 'settings'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedModule(m)}
                    className={cn(
                      "flex-1 min-w-[80px] py-2 px-3 rounded-[14px] text-[9px] font-black uppercase tracking-wider transition-all",
                      selectedModule === m 
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {m === 'dashboard' ? 'Dash' : m === 'assets' ? 'Activos' : m === 'workorders' ? 'Órdenes' : m === 'inventory' ? 'Stock' : m === 'pm' ? 'Planes' : m === 'scheduler' ? 'Agenda' : 'Config'}
                  </button>
                ))}
              </div>

              <div className="p-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedModule}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                        selectedModule === 'dashboard' ? 'bg-indigo-600' :
                        selectedModule === 'assets' ? 'bg-blue-600' : 
                        selectedModule === 'workorders' ? 'bg-emerald-600' : 
                        selectedModule === 'inventory' ? 'bg-orange-600' :
                        selectedModule === 'pm' ? 'bg-brand' :
                        selectedModule === 'scheduler' ? 'bg-purple-600' :
                        'bg-slate-700'
                      )}>
                        {selectedModule === 'dashboard' ? <LayoutDashboard size={24} /> :
                         selectedModule === 'assets' ? <Factory size={24} /> : 
                         selectedModule === 'workorders' ? <ClipboardList size={24} /> : 
                         selectedModule === 'inventory' ? <Package size={24} /> :
                         selectedModule === 'pm' ? <BookOpen size={24} /> :
                         selectedModule === 'scheduler' ? <CalendarClock size={24} /> :
                         <Settings size={24} />}
                      </div>
                      <div>
                        <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight capitalize">
                          {selectedModule === 'dashboard' ? 'Dashboard Operativo' :
                           selectedModule === 'assets' ? 'Gestión de Activos' : 
                           selectedModule === 'workorders' ? 'Ciclo de Órdenes' : 
                           selectedModule === 'inventory' ? 'Control de Inventario' :
                           selectedModule === 'pm' ? 'Planes Maestros' :
                           selectedModule === 'scheduler' ? 'Programador Automático' :
                           'Configuración del Sistema'}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">Conceptos clave y flujo de trabajo sugerido.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      {MODULE_GUIDES[selectedModule].map((step, idx) => (
                        <div key={idx} className="group flex gap-6 p-6 rounded-[24px] border border-slate-100 hover:border-brand/20 hover:bg-slate-50/50 transition-all cursor-default">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform", step.color)}>
                            {step.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                              {step.title}
                              <CheckCircle2 size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h4>
                            <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Visual Guide Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-xl shadow-indigo-200">
                <PlayCircle className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
                <div className="relative z-10">
                  <Badge variant="brand" className="bg-white/10 text-white border-white/20 mb-4">Tutorial Pro</Badge>
                  <h3 className="text-xl font-display font-black mb-2">Video de Inducción</h3>
                  <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Vea un recorrido rápido por todas las funcionalidades en menos de 5 minutos.</p>
                  <Button variant="primary" className="bg-white text-indigo-900 hover:bg-indigo-50 border-none shadow-lg">Ver Tutorial</Button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                <BookOpen className="absolute -bottom-4 -right-4 w-32 h-32 text-slate-50 group-hover:scale-110 transition-transform" />
                <div className="relative z-10">
                  <Badge variant="neutral" className="mb-4">Documentación</Badge>
                  <h3 className="text-xl font-display font-black text-slate-900 mb-2">Manual Técnico</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">Acceda a la base de conocimientos detallada con especificaciones de ingeniería.</p>
                  <Button variant="outline" className="border-slate-200 hover:bg-slate-50 shadow-sm" icon={<ArrowRight size={16} />}>Explorar Wiki</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Tips & Stats */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-[60px]" />
              <h3 className="text-lg font-display font-black mb-6 flex items-center gap-2">
                <Lightbulb size={20} className="text-brand" />
                Tips del Entrenador
              </h3>
              <div className="space-y-6">
                {TRAINER_TIPS.map((tip, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2">
                      {tip.icon}
                      {tip.title}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nivel de Usuario</p>
                    <p className="text-sm font-bold text-white">Power User</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand">
                    <Sparkles size={20} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8">
              <h4 className="font-display font-black text-emerald-900 mb-4 flex items-center gap-2">
                <HelpCircle size={18} className="text-emerald-600" />
                ¿Necesita Soporte?
              </h4>
              <p className="text-xs text-emerald-700 leading-relaxed mb-6 font-medium">
                Si tiene problemas técnicos con la plataforma, contacte directamente al administrador del sistema o al departamento de TI.
              </p>
              <button className="w-full py-4 bg-white border border-emerald-200 rounded-2xl text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:bg-emerald-100 transition-all">
                Abrir Ticket de Soporte
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
