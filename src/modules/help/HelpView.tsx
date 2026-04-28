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
  LayoutGrid,
  Bell,
  Settings,
  TrendingUp,
  ListChecks,
  Truck,
  Users,
  RotateCcw,
  Shield,
  ShieldCheck as ShieldCheckIcon,
  Clock,
  Activity,
  AlertCircle,
  AlertTriangle
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
    { 
      title: 'KPIs Operativos en Tiempo Real', 
      description: 'El dashboard calcula OTs abiertas, vencidas, completadas este mes y el nivel de cumplimiento PM automáticamente desde tus datos. No requiere configuración — se actualiza cada vez que cierras una orden.', 
      icon: <LayoutDashboard size={20} />, 
      color: 'bg-indigo-600' 
    },
    { 
      title: 'Backlog Preventivo', 
      description: 'El indicador de backlog muestra planes PM cuya fecha de vencimiento ya pasó y no tienen una OT abierta. Un backlog en cero significa que tu programa preventivo está al día. Haz click para ir al módulo de planes.', 
      icon: <ClipboardList size={20} />, 
      color: 'bg-slate-800' 
    },
    { 
      title: 'Gráfica de Tendencia Semanal', 
      description: 'Compara OTs creadas vs completadas en las últimas 8 semanas. Si la línea de creadas está sistemáticamente por encima de completadas, tu equipo tiene capacidad insuficiente o las prioridades no están bien asignadas.', 
      icon: <TrendingUp size={20} />, 
      color: 'bg-brand' 
    },
    { 
      title: 'Activos de Alta Demanda', 
      description: 'Lista los 5 equipos con más órdenes de trabajo en los últimos 90 días. Un activo que aparece consistentemente aquí es candidato para revisión de su estrategia de mantenimiento o para una mejora de confiabilidad (RCFA).', 
      icon: <Zap size={20} />, 
      color: 'bg-amber-600' 
    },
  ],
  assets: [
    { 
      title: 'Construir la Jerarquía Técnica', 
      description: 'Crea primero la Planta, luego las Áreas, luego los Equipos dentro de cada área. Esta estructura permite filtrar órdenes de trabajo por ubicación y calcular métricas de confiabilidad por zona de planta.', 
      icon: <Factory size={20} />, 
      color: 'bg-blue-600' 
    },
    { 
      title: 'Criticidad y su Impacto en el Sistema', 
      description: 'La criticidad Alta activa prioridad alta automáticamente en las OTs generadas por el scheduler. Equipos críticos también aparecen destacados en el dashboard. Asigna criticidad Alta solo a equipos cuya falla detiene producción o representa riesgo de seguridad.', 
      icon: <Cpu size={20} />, 
      color: 'bg-indigo-600' 
    },
    { 
      title: 'Puntos de Medición CBM', 
      description: 'Desde la pestaña Medidores de un activo, crea instrumentos para monitorear temperatura, vibración, presión o contadores de horas. Los sensores con umbrales configurados generan OTs predictivas automáticamente cuando una lectura sale del rango aceptable.', 
      icon: <Zap size={20} />, 
      color: 'bg-amber-500' 
    },
    { 
      title: 'Baja Técnica vs Eliminación', 
      description: 'Nunca elimines un activo que tenga historial. Usa el estado "Dado de baja" para desactivarlo — el equipo desaparece de las vistas operativas pero todo su historial de OTs, consumos y mediciones se preserva para auditoría y análisis de confiabilidad histórica.', 
      icon: <ShieldCheckIcon size={20} />, 
      color: 'bg-slate-900' 
    },
  ],
  workorders: [
    { 
      title: 'Tipos de Orden y Cuándo Usar Cada Uno', 
      description: 'Correctiva: falla ocurrida, atender ya. Preventiva: generada por el scheduler según calendario o medidor. Predictiva: disparada automáticamente por un sensor CBM fuera de rango. Inspección: verificación planificada sin intervención mecánica. El tipo afecta las métricas de cumplimiento PM.', 
      icon: <ClipboardList size={20} />, 
      color: 'bg-emerald-500' 
    },
    { 
      title: 'Flujo de Estados', 
      description: 'Abierta → Asignada → En Progreso → Completada. Solo admins y supervisores pueden asignar y reasignar. Los técnicos solo pueden mover sus propias órdenes a En Progreso, En Espera o Completada. Una orden completada es inmutable — no puede editarse ni reabrirse sin rol de admin.', 
      icon: <PlayCircle size={20} />, 
      color: 'bg-blue-500' 
    },
    { 
      title: 'Cierre Técnico Correcto', 
      description: 'Al completar una OT, el sistema captura automáticamente quién hizo el trabajo y en qué activo. Este snapshot es permanente. Si el técnico abandona la empresa o el equipo es dado de baja, el registro histórico sigue mostrando los datos correctos. Por eso el reporte de resolución debe ser descriptivo y técnicamente útil.', 
      icon: <CheckCircle2 size={20} />, 
      color: 'bg-slate-900' 
    },
    { 
      title: 'Repuestos y Costo Real', 
      description: 'Vincula ítems del inventario desde la pestaña Suministros. El stock se descuenta automáticamente. Si hubo servicio externo, registra el proveedor y el monto de la factura. El costo total de la OT (repuestos + servicio externo) aparece en el resumen financiero del dashboard.', 
      icon: <Package size={20} />, 
      color: 'bg-orange-500' 
    },
  ],
  inventory: [
    { 
      title: 'Números de Parte y Trazabilidad', 
      description: 'El número de parte (N/P) es el identificador único del repuesto. Úsalo para búsqueda rápida. Si un proveedor cambia el N/P en una nueva versión del repuesto, crea un ítem nuevo en lugar de modificar el existente para preservar el historial de consumos del ítem original.', 
      icon: <Package size={20} />, 
      color: 'bg-blue-600' 
    },
    { 
      title: 'Stock Mínimo y Alertas', 
      description: 'Cuando el stock actual cae al nivel mínimo o por debajo, el ítem aparece destacado en el inventario y se cuenta en el indicador de alertas del dashboard. El stock mínimo debe representar el consumo durante el tiempo de reposición con tu proveedor, no el consumo mensual promedio.', 
      icon: <TrendingUp size={20} />, 
      color: 'bg-emerald-600' 
    },
    { 
      title: 'Movimientos y Trazabilidad Completa', 
      description: 'Cada entrada, salida, devolución o ajuste queda registrado con fecha y cantidad. Las salidas vinculadas a OTs se registran automáticamente cuando agregas repuestos desde el módulo de Órdenes. Los ajustes manuales deben incluir siempre un motivo (ej: conteo físico, merma, vencimiento).', 
      icon: <ArrowRight size={20} />, 
      color: 'bg-indigo-500' 
    },
    { 
      title: 'Desactivar en Lugar de Eliminar', 
      description: 'Si un repuesto queda obsoleto, usa Borrar desde la tabla — esto lo desactiva (active=false) y desaparece de las búsquedas operativas. Su historial de movimientos y consumos permanece intacto para análisis de costos históricos. No puedes eliminar físicamente un ítem con historial.', 
      icon: <ShieldCheckIcon size={20} />, 
      color: 'bg-slate-900' 
    },
  ],
  pm: [
    { 
      title: 'Planes Maestros Genéricos', 
      description: 'Un plan maestro describe el QUÉ y CUÁNDO del mantenimiento, no el DÓNDE. Un mismo plan "Lubricación de Rodamientos cada 3 meses" puede asignarse a 20 compresores distintos. Cada asignación tiene su propio contador de ciclo independiente — si un equipo se atrasa, no afecta a los demás.', 
      icon: <BookOpen size={20} />, 
      color: 'bg-purple-600' 
    },
    { 
      title: 'Disparadores: Calendario, Medidor e Híbrido', 
      description: 'Calendario: genera OTs por fecha (ej: cada 30 días). Medidor: genera OTs por uso acumulado (ej: cada 500 horas de operación). Híbrido: el que se cumpla primero entre fecha y medidor. Para equipos con uso variable usa Medidor o Híbrido para mayor precisión técnica.', 
      icon: <CalendarClock size={20} />, 
      color: 'bg-indigo-500' 
    },
    { 
      title: 'Frecuencia Múltiple en Tareas (x1, x2, x4...)', 
      description: 'Cada tarea del checklist tiene un multiplicador de frecuencia. Una tarea con x1 se ejecuta en cada ciclo. Con x2 solo en ciclos pares (2, 4, 6...). Con x4 solo en ciclos 4, 8, 12... Esto permite definir dentro del mismo plan rutinas mensuales, trimestrales y anuales sin crear planes separados.', 
      icon: <ListChecks size={20} />, 
      color: 'bg-emerald-500' 
    },
    { 
      title: 'Ciclos y Snapshots al Cerrar', 
      description: 'Cuando cierras una OT preventiva, el sistema incrementa el contador de ciclo del plan en ese activo y recalcula automáticamente la próxima fecha o umbral de medidor. Si el plan usa medidor, registra la lectura actual al cierre para calcular el siguiente umbral correctamente.', 
      icon: <Sparkles size={20} />, 
      color: 'bg-brand' 
    },
  ],
  scheduler: [
    { 
      title: 'Cómo Decide el Motor Qué Generar', 
      description: 'El scheduler evalúa cada plan activo. Para generarlo necesita: 1) Que la fecha de vencimiento esté dentro del horizonte configurado o que el medidor haya alcanzado el umbral. 2) Que no exista ya una OT abierta para ese plan en ese activo. Si ambas condiciones se cumplen, genera la OT automáticamente.', 
      icon: <Cpu size={20} />, 
      color: 'bg-indigo-600' 
    },
    { 
      title: 'Horizonte y Lead Time', 
      description: 'El horizonte define cuántos días hacia adelante mira el motor. El lead time de cada plan define con cuántos días de anticipación se genera la OT antes del vencimiento. Ejemplo: vencimiento en 20 días, lead time 7 días → la OT se genera hoy. Ajusta el lead time según cuánto tiempo necesita tu equipo para preparar el mantenimiento.', 
      icon: <Compass size={20} />, 
      color: 'bg-slate-700' 
    },
    { 
      title: 'Backlog Vencido', 
      description: 'La sección de backlog muestra planes cuya fecha ya pasó y no tienen OT abierta. Esto ocurre si el scheduler no se ejecutó durante ese período o si la OT fue cancelada sin generar una nueva. Ejecuta el scheduler con un horizonte amplio (60-90 días) para regularizar el backlog completo.', 
      icon: <ClipboardList size={20} />, 
      color: 'bg-brand' 
    },
    { 
      title: 'Proyecciones en el Kanban', 
      description: 'Las tarjetas violáceas (PLAN) en la Agenda Kanban son simulaciones. Muestran cuándo se generarían las próximas OTs. Para mantenimientos basados en medidor, el sistema proyecta una fecha en el calendario analizando el histórico de consumo (tendencia de uso diario).', 
      icon: <LayoutGrid size={20} />, 
      color: 'bg-indigo-600' 
    },
  ],
  settings: [
    { 
      title: 'Catálogo de Magnitudes', 
      description: 'Las magnitudes son los tipos de medición disponibles para tus instrumentos CBM. Acumulativas (horas, km, ciclos) disparan PM por uso. De límite (temperatura, presión, vibración) generan alertas cuando una lectura sale del rango. Crea las magnitudes antes de configurar los puntos de medición en los activos.', 
      icon: <TrendingUp size={20} />, 
      color: 'bg-indigo-500' 
    },
    { 
      title: 'Proveedores Externos', 
      description: 'Registra empresas de servicio, contratistas especializados y distribuidores OEM. Al cerrar una OT con servicio externo, seleccionas el proveedor y el monto. El nombre del proveedor queda capturado en el historial permanente de la OT — aunque elimines el proveedor del catálogo, las OTs históricas seguirán mostrando su nombre correctamente.', 
      icon: <Truck size={20} />, 
      color: 'bg-slate-800' 
    },
    { 
      title: 'Horizonte de Proyección', 
      description: 'Controla cuántos meses hacia el futuro se calculan las proyecciones en el Kanban y en la pestaña de Proyección de cada activo. Un horizonte de 3-6 meses es útil para operación diaria. 12-24 meses sirve para planificación de presupuesto y recursos.', 
      icon: <CalendarClock size={20} />, 
      color: 'bg-brand' 
    },
    { 
      title: 'Roles y Acceso', 
      description: 'Admin: acceso total, puede reasignar OTs y reabrir órdenes cerradas. Supervisor: puede asignar técnicos y aprobar cierres. Técnico: solo ve y mueve sus propias órdenes asignadas. Viewer: solo lectura, no puede crear ni modificar nada. Asigna el rol mínimo necesario para cada usuario.', 
      icon: <Users size={20} />, 
      color: 'bg-slate-600' 
    },
  ],
};

const TRAINER_TIPS = [
  { title: 'Cierre Seguro', text: 'Nunca elimines un activo con historial. Usa estado Dado de Baja. El historial de OTs, mediciones y consumos se preserva para siempre.', icon: <ShieldCheckIcon size={16} /> },
  { title: 'Filtro por Ubicación', text: 'En Órdenes de Trabajo puedes filtrar por Planta o Área completa. El filtro incluye automáticamente todos los equipos hijos de esa ubicación.', icon: <Compass size={16} /> },
  { title: 'Horizonte Visual', text: 'Ajuste los meses de proyección en Configuración → Motor PM. 3-6 meses para operación diaria. 12-24 para planificación de presupuesto.', icon: <CalendarClock size={16} /> },
  { title: 'Lead Time Inteligente', text: 'Configura el lead time de cada plan PM según cuánto tarda tu equipo en preparar ese mantenimiento. Un overhaul mayor necesita más anticipación que una lubricación rutinaria.', icon: <Clock size={16} /> },
  { title: 'Lecturas CBM al Cierre', text: 'Cuando cierras una OT de plan basado en medidor, registra la lectura actual del horómetro. El sistema usa ese valor para calcular el próximo umbral automáticamente — no el valor al momento de abrir la OT.', icon: <Activity size={16} /> },
  { title: 'Multiplicadores para Programas Anuales', text: 'Usa multiplicadores x12 en tareas de overhaul anual dentro de planes mensuales. Así tienes un solo plan que maneja rutinas mensuales y el overhaul anual, con un único contador de ciclo por activo.', icon: <RotateCcw size={16} /> },
];

const ADVANCED_TOPICS = [
  {
    id: 'cycles',
    title: 'Ciclos PM y Multiplicadores',
    icon: <RotateCcw size={20} />,
    summary: 'Cómo funcionan los contadores de ciclo y las tareas con frecuencia múltiple',
    detail: 'Cada asignación de plan a activo tiene un contador current_cycle_index que empieza en 1 y se incrementa cada vez que se cierra una OT de ese plan.\n\nLas tareas con multiplicador x2 solo aparecen en ciclos 2, 4, 6, 8...\nLas de x4 solo en ciclos 4, 8, 12...\nLas de x1 aparecen en todos los ciclos.\n\nEsto permite definir en un solo plan:\n- Inspección visual mensual (x1)\n- Cambio de filtros trimestral (x3)\n- Overhaul anual (x12)\n\nSin crear tres planes separados ni programar tres órdenes distintas.'
  },
  {
    id: 'cbm',
    title: 'CBM: Condición Basada en Mantenimiento',
    icon: <Activity size={20} />,
    summary: 'Cómo los sensores generan OTs automáticamente sin intervención humana',
    detail: 'Cuando registras una lectura en un punto de medición de tipo Límite (no acumulativo), el sistema verifica si el valor está dentro del rango configurado (mínimo y máximo).\n\nSi la lectura viola el rango y no existe ya una OT abierta para ese sensor:\n1. Se crea automáticamente una OT de tipo Predictiva\n2. Se asigna prioridad según la configurada en el punto de medición\n3. Se establece fecha de vencimiento a 3 días (SLA por defecto)\n4. Se agrega un comentario automático con el valor detectado\n5. Aparece una alerta en el centro de notificaciones\n\nEl sensor no vuelve a generar otra OT mientras la primera siga abierta, evitando duplicados. Solo cuando se cierra puede dispararse de nuevo.'
  },
  {
    id: 'snapshots',
    title: 'Snapshots: Por Qué el Historial es Inmutable',
    icon: <ShieldCheckIcon size={20} />,
    summary: 'Por qué los registros históricos sobreviven cambios en el sistema',
    detail: 'Al cerrar una OT, el sistema captura en texto plano:\n- Nombre del técnico que ejecutó el trabajo\n- Nombre del activo intervenido\n- Nombre del proveedor externo (si aplica)\n- Nombre del plan PM de origen (si aplica)\n\nEstos datos quedan congelados permanentemente en la base de datos.\n\nPor qué importa: si seis meses después el técnico renuncia y se elimina su perfil, o si el activo es dado de baja, o si el plan PM se elimina, los reportes históricos siguen mostrando exactamente quién hizo qué, cuándo y en qué equipo.\n\nAdicionalmente, una OT completada no puede modificarse bajo ninguna circunstancia — existe un trigger en la base de datos que rechaza cualquier intento de edición sobre órdenes cerradas.'
  }
];

export default function HelpView() {
  const [selectedModule, setSelectedModule] = useState<keyof typeof MODULE_GUIDES>('dashboard');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [showAllTips, setShowAllTips] = useState(false);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50/50 scrollbar-thin">
      {/* Hero Section */}
      <div className="relative bg-slate-900 py-12 sm:py-20 px-5 sm:px-10 overflow-hidden">
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
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tight mb-6"
          >
            Domine la Gestión de <br />
            <span className="text-brand">Activos Industriales</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Bienvenido al módulo de ayuda. Aquí aprenderá a utilizar todas las capacidades 
            de APEX CMMS para maximizar la confiabilidad de su planta.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 -mt-6 sm:-mt-10 pb-12 sm:pb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Main Content: Guided Modules */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-1.5 flex overflow-x-auto gap-1 bg-slate-50 border-b border-slate-100 no-scrollbar">
                {(['dashboard', 'assets', 'workorders', 'inventory', 'pm', 'scheduler', 'settings'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedModule(m)}
                    className={cn(
                      "shrink-0 py-2 px-3 rounded-[14px] text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                      selectedModule === m
                        ? "bg-white text-slate-900 shadow-md border border-slate-200 font-bold"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    )}
                  >
                    {m === 'dashboard' ? 'Dash' : m === 'assets' ? 'Activos' : m === 'workorders' ? 'Órdenes' : m === 'inventory' ? 'Stock' : m === 'pm' ? 'Planes' : m === 'scheduler' ? 'Agenda' : 'Config'}
                  </button>
                ))}
              </div>

              <div className="p-5 sm:p-10">
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
                        <p className="text-sm text-slate-600 font-medium">Conceptos clave y flujo de trabajo sugerido.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {MODULE_GUIDES[selectedModule].map((step, idx) => (
                        <div key={idx} className="group flex gap-6 p-6 rounded-[24px] border border-slate-100 hover:border-brand/20 hover:bg-slate-50/50 transition-all cursor-default">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform duration-200", step.color)}>
                            {step.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                              {step.title}
                              <CheckCircle2 size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Advanced Topics Section */}
            <div className="bg-slate-900 rounded-[32px] border border-slate-800 p-5 sm:p-10 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] pointer-events-none" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <Zap size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-black text-white tracking-tight">Conceptos Avanzados</h2>
                  <p className="text-xs text-slate-300 font-medium">Potencia tu conocimiento técnico de la plataforma.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {ADVANCED_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                    className={cn(
                      "flex flex-col items-start text-left p-6 rounded-[24px] border transition-all h-full min-h-[48px]",
                      expandedTopic === topic.id 
                        ? "bg-slate-800 border-brand/50 shadow-lg shadow-brand/5" 
                        : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                      expandedTopic === topic.id ? "bg-brand text-white" : "bg-white/5 text-slate-400"
                    )}>
                      {topic.icon}
                    </div>
                    <h4 className="font-bold text-white text-sm mb-2 leading-tight">{topic.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">{topic.summary}</p>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {expandedTopic && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 p-8 bg-slate-800/80 rounded-[24px] border border-slate-700">
                      <div className="flex items-start gap-4">
                        <Info className="text-brand shrink-0 mt-1" size={16} />
                        <div className="space-y-4">
                          <h4 className="font-display font-black text-white text-lg tracking-tight">
                            {ADVANCED_TOPICS.find(t => t.id === expandedTopic)?.title}
                          </h4>
                          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                            {ADVANCED_TOPICS.find(t => t.id === expandedTopic)?.detail}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Emergency Flows Section */}
            <div className="bg-white border border-red-100 rounded-[32px] p-5 sm:p-10 shadow-lg shadow-red-50 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-50 rounded-full blur-3xl opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">Flujos de Emergencia</h2>
                    <p className="text-sm text-slate-600 font-medium">Protocolos críticos para paradas de planta no programadas.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="p-8 bg-slate-50 rounded-[24px] border border-slate-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/20 blur-2xl group-hover:bg-red-100/40 transition-colors" />
                    <h4 className="font-display font-black text-red-700 text-lg mb-3 flex items-center gap-2">
                      <AlertCircle size={20} />
                      Falla de Criticidad Alta
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium max-w-2xl">
                      Ante una falla que detiene la producción, cree una OT de tipo <strong>Correctiva</strong> con prioridad <strong>Crítica</strong>. El sistema notificará automáticamente a supervisores y técnicos mediante el dashboard para una respuesta inmediata.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Guide Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-xl shadow-indigo-200">
                <PlayCircle className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
                <div className="relative z-10">
                  <Badge variant="brand" className="bg-white/20 text-white border-white/20 mb-4">Tutorial Pro</Badge>
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
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">Acceda a la base de conocimientos detallada con especificaciones de ingeniería.</p>
                  <Button variant="outline" className="border-slate-200 hover:bg-slate-50 shadow-sm" icon={<ArrowRight size={16} />}>Explorar Wiki</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Tips & Stats */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-slate-900 rounded-[32px] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-[60px]" />
              <h3 className="text-lg font-display font-black mb-6 flex items-center gap-2">
                <Lightbulb size={20} className="text-red-400" />
                Tips del Entrenador
              </h3>
              <div className="space-y-6">
                {(showAllTips ? TRAINER_TIPS : TRAINER_TIPS.slice(0, 3)).map((tip, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                      {tip.icon}
                      {tip.title}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {tip.text}
                    </p>
                  </motion.div>
                ))}
              </div>
              <button 
                onClick={() => setShowAllTips(!showAllTips)}
                className="mt-6 w-full py-2 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
              >
                {showAllTips ? 'Ver menos tips' : 'Ver más tips'}
              </button>
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

            {/* Roles & Permissions Card */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                  <Shield size={16} />
                </div>
                <h4 className="text-sm font-display font-black text-slate-900 tracking-tight">Permisos por Rol</h4>
              </div>
              
              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase">
                      <th className="py-2 px-3 border-b border-slate-100">Acción</th>
                      <th className="py-2 px-1 border-b border-slate-100 text-center">Téc</th>
                      <th className="py-2 px-1 border-b border-slate-100 text-center">Sup</th>
                      <th className="py-2 px-1 border-b border-slate-100 text-center">Adm</th>
                    </tr>
                  </thead>
                  <tbody className="text-[10px] font-bold uppercase">
                    {[
                      { action: 'Ver OTs', tech: true, sup: true, admin: true },
                      { action: 'Mover mis OTs', tech: true, sup: true, admin: true },
                      { action: 'Asignar técnicos', tech: false, sup: true, admin: true },
                      { action: 'Cerrar cualquier OT', tech: false, sup: true, admin: true },
                      { action: 'Reabrir OT cerrada', tech: false, sup: false, admin: true },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-1.5 px-3 text-slate-600 border-b border-slate-50">{row.action}</td>
                        <td className={cn("py-1.5 px-1 text-center border-b border-slate-50", row.tech ? "text-emerald-600" : "text-slate-300")}>{row.tech ? '✓' : '✗'}</td>
                        <td className={cn("py-1.5 px-1 text-center border-b border-slate-50", row.sup ? "text-emerald-600" : "text-slate-300")}>{row.sup ? '✓' : '✗'}</td>
                        <td className={cn("py-1.5 px-1 text-center border-b border-slate-50", row.admin ? "text-emerald-600" : "text-slate-300")}>{row.admin ? '✓' : '✗'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8">
              <h4 className="font-display font-black text-emerald-900 mb-4 flex items-center gap-2">
                <HelpCircle size={18} className="text-emerald-600" />
                ¿Necesita Soporte?
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed mb-6 font-bold">
                Si tiene problemas técnicos con la plataforma, contacte directamente al administrador del sistema o al departamento de TI.
              </p>
              <button className="w-full py-4 bg-white border border-emerald-200 rounded-2xl text-[10px] font-black text-emerald-800 uppercase tracking-widest hover:bg-emerald-100 transition-all">
                Abrir Ticket de Soporte
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
