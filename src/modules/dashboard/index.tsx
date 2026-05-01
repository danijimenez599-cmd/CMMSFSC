import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import PmGauge from './components/PmGauge';
import WoTrendChart from './components/WoTrendChart';
import CriticalWoTable from './components/CriticalWoTable';
import {
  RefreshCw, Activity, AlertTriangle, AlertCircle,
  TrendingUp, PackageMinus, DollarSign, CheckCircle2, Clock,
  Calendar, Layers, BarChart3
} from 'lucide-react';
import { Button, Badge, cn, StatCard } from '../../shared/components';
import { useStore } from '../../store';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── ANIMATION VARIANTS ──────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

// Module-level timestamp so the guard survives re-mounts within the same session
let _lastDashboardFetch = 0;
const DASHBOARD_STALE_MS = 30_000;

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function DashboardView() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const metrics = useDashboardMetrics();
  const store = useStore() as any;
  const { fetchAssets, fetchWorkOrders, fetchInventory, fetchPmData, setModule, setPendingWoFilter } = store;
  const workOrders = store.workOrders || [];

  useEffect(() => {
    const now = Date.now();
    if (now - _lastDashboardFetch < DASHBOARD_STALE_MS) return;
    _lastDashboardFetch = now;
    fetchAssets();
    fetchWorkOrders();
    fetchInventory();
    fetchPmData();
  }, []);

  const pieData = (() => {
    const counts: Record<string, number> = {};
    workOrders.forEach((w: any) => { counts[w.woType] = (counts[w.woType] || 0) + 1; });
    return [
      { name: 'Preventivo', value: counts['preventive'] || 0, color: '#991b1b' },
      { name: 'Correctivo', value: counts['corrective'] || 0, color: '#475569' },
      { name: 'Predictivo', value: counts['predictive'] || 0, color: '#f59e0b' },
      { name: 'Inspección', value: counts['inspection'] || 0, color: '#94a3b8' },
    ].filter(d => d.value > 0);
  })();

  return (
    <div className="h-full overflow-y-auto bg-slate-50/30">
      {/* Page header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
            <Activity size={18} />
          </div>
          <h1 className="font-display font-bold text-slate-900 tracking-tight text-base">Dashboard Operativo</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
            Última Sincronización: {formatDistanceToNow(lastUpdate, { locale: es, addSuffix: true })}
          </span>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={() => {
              setLastUpdate(new Date());
              fetchWorkOrders();
              fetchPmData();
              fetchInventory();
            }}
          >
            Actualizar
          </Button>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="p-6 space-y-6 max-w-[1600px] mx-auto"
      >
        {/* KPI Row 1: Operations */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="OTs Abiertas"
            value={metrics.wos_open}
            description={`${metrics.wos_in_progress} en ejecución`}
            icon={<AlertCircle />}
            variant="info"
            onClick={() => { setPendingWoFilter('active'); setModule('workorders'); }}
          />
          <StatCard
            title="OTs Vencidas"
            value={metrics.wos_overdue}
            description="Atención inmediata"
            icon={<AlertTriangle />}
            variant={metrics.wos_overdue > 0 ? 'danger' : 'default'}
            onClick={() => { setPendingWoFilter('overdue'); setModule('workorders'); }}
          />
          <StatCard
            title="Completadas (Mes)"
            value={metrics.wos_completed_month}
            description="Órdenes cerradas"
            icon={<CheckCircle2 />}
            variant="ok"
          />
          <StatCard
            title="Alertas de Stock"
            value={metrics.inventory_low}
            description="ítems bajo mínimo"
            icon={<PackageMinus />}
            variant={metrics.inventory_low > 0 ? 'warn' : 'default'}
            onClick={() => setModule('inventory')}
          />
        </motion.div>

        {/* KPI Row 2: Performance */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">PM Compliance</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">{Math.round(metrics.pm_compliance)}%</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 hidden sm:block">Mantenimiento Preventivo</p>
            </div>
            <div className="shrink-0">
              <PmGauge value={metrics.pm_compliance} size={isDesktop ? 72 : 56} />
            </div>
          </div>
          <StatCard
            title="Backlog Preventivo"
            value={metrics.pm_backlog}
            description="Pendientes de generar"
            icon={<Clock />}
            variant={metrics.pm_backlog > 0 ? 'danger' : 'ok'}
            onClick={() => { setPendingWoFilter('active'); setModule('workorders'); }}
          />
          <StatCard
            title="Carga de Trabajo"
            value={metrics.wos_in_progress}
            description="Técnicos en campo"
            icon={<TrendingUp />}
            variant="info"
          />
          <StatCard
            title="Valor en Stock"
            value={`$${metrics.inventory_value.toLocaleString('es-SV', { maximumFractionDigits: 0 })}`}
            description="Capital en repuestos"
            icon={<DollarSign />}
          />
        </motion.div>

        {/* Charts & Analytical Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Trend Chart */}
          <motion.div variants={item} className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-slate-900 tracking-tight text-base flex items-center gap-2">
                  <BarChart3 size={18} className="text-brand" />
                  Tendencia de Órdenes
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Análisis de las últimas 8 semanas</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Creadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Cerradas</span>
                </div>
              </div>
            </div>
            <div className="h-[300px]">
              <WoTrendChart data={metrics.weeklyTrend} />
            </div>
          </motion.div>

          {/* Distribution Pie */}
          <motion.div variants={item} className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col">
            <h3 className="font-display font-bold text-slate-900 tracking-tight text-base mb-1 flex items-center gap-2">
              <Layers size={18} className="text-brand" />
              Distribución por Tipo
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Proporción de carga laboral</p>
            
            {pieData.length > 0 ? (
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 11, fontWeight: 'bold' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-2">
                <Layers size={32} className="opacity-20" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sin datos disponibles</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Operational Intelligence Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Critical WOs Table */}
          <motion.div variants={item} className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-display font-bold text-slate-900 tracking-tight text-base flex items-center gap-2">
                <AlertTriangle size={18} className="text-brand" />
                OTs Críticas en Espera
              </h3>
              <Badge variant="danger" dot>{metrics.wos_overdue} Críticas</Badge>
            </div>
            <div className="p-0">
              <CriticalWoTable />
            </div>
          </motion.div>

          {/* Top Assets Activity */}
          <motion.div variants={item} className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-slate-900 tracking-tight text-base flex items-center gap-2">
                  <Calendar size={18} className="text-brand" />
                  Activos de Alta Demanda
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Últimos 90 días de actividad</p>
              </div>
            </div>
            
            {metrics.topAssets.length > 0 ? (
              <div className="space-y-3">
                {metrics.topAssets.map((a: any, i: number) => (
                  <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                    <span className="text-xs font-bold text-slate-300 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{a.name}</p>
                      {a.code && (
                        <p className="text-[10px] font-mono text-slate-400 uppercase font-bold mt-0.5">{a.code}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="brand" className="text-[9px]">{a.woCount} OTs</Badge>
                      <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand" 
                          style={{ width: `${Math.min(100, (a.woCount / (metrics.topAssets[0].woCount || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-300 gap-2">
                <Calendar size={32} className="opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Sin registros de actividad</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

