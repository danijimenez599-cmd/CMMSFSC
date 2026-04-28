import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, FileBarChart2, LayoutDashboard, Wrench,
  CalendarClock, DollarSign, Package, Filter, ChevronDown,
} from 'lucide-react';
import { useStore } from '../../store';
import { cn } from '../../shared/utils/utils';
import { Period } from './hooks/useKpiData';
import { PeriodSelector } from './components/ChartComponents';
import KpiOverview from './KpiOverview';
import WoAnalytics from './WoAnalytics';
import PmCompliance from './PmCompliance';
import CostAnalysis from './CostAnalysis';
import InventoryKpis from './InventoryKpis';
import ReportsHub from './reports/ReportsHub';

type MainTab = 'kpis' | 'reports';
type KpiView = 'overview' | 'workorders' | 'pm' | 'costs' | 'inventory';

const KPI_VIEWS: { id: KpiView; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',   label: 'Overview',   icon: <LayoutDashboard size={13} /> },
  { id: 'workorders', label: 'OTs',        icon: <Wrench size={13} /> },
  { id: 'pm',         label: 'PM',         icon: <CalendarClock size={13} /> },
  { id: 'costs',      label: 'Costos',     icon: <DollarSign size={13} /> },
  { id: 'inventory',  label: 'Inventario', icon: <Package size={13} /> },
];

export default function AnalyticsModule() {
  const store = useStore() as any;
  const { assets = [] } = store;

  const [mainTab, setMainTab]   = useState<MainTab>('kpis');
  const [kpiView, setKpiView]   = useState<KpiView>('overview');
  const [period, setPeriod]     = useState<Period>('30d');
  const [custom, setCustom]     = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [filterPlant, setFilterPlant] = useState('');
  const [filterArea,  setFilterArea]  = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const plants = useMemo(
    () => assets.filter((a: any) => a.assetType === 'plant'),
    [assets]
  );
  const areas = useMemo(
    () => filterPlant
      ? assets.filter((a: any) => a.assetType === 'area' && a.parentId === filterPlant)
      : assets.filter((a: any) => a.assetType === 'area'),
    [assets, filterPlant]
  );

  const hasFilters = !!filterPlant || !!filterArea;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">

      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 pt-4 pb-3 shrink-0 space-y-3">

        {/* Row 1: Title + Main Tabs */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0">
              <BarChart3 size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-black text-slate-900 text-lg sm:text-xl tracking-tight">Analytics</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Inteligencia operacional</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Filter toggle */}
            {mainTab === 'kpis' && (
              <button
                onClick={() => setShowFilters(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border',
                  showFilters || hasFilters
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                )}
              >
                <Filter size={12} />
                <span className="hidden sm:inline">Filtrar</span>
                {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
              </button>
            )}

            {/* Main tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {[
                { id: 'kpis'    as MainTab, label: 'KPIs',     icon: <BarChart3 size={12} /> },
                { id: 'reports' as MainTab, label: 'Reportes', icon: <FileBarChart2 size={12} /> },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setMainTab(t.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                    mainTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: KPI sub-nav (mobile: scrollable) */}
        {mainTab === 'kpis' && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
            {KPI_VIEWS.map(v => (
              <button
                key={v.id}
                onClick={() => setKpiView(v.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border',
                  kpiView === v.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                )}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Row 3: Filters panel (animated) */}
        <AnimatePresence>
          {mainTab === 'kpis' && showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center flex-wrap">
                {/* Period */}
                <PeriodSelector
                  value={period}
                  onChange={setPeriod}
                  custom={custom}
                  onCustomChange={setCustom}
                />

                {/* Plant */}
                {plants.length > 0 && (
                  <select
                    value={filterPlant}
                    onChange={e => { setFilterPlant(e.target.value); setFilterArea(''); }}
                    className="h-8 px-3 text-[11px] font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 text-slate-700"
                  >
                    <option value="">Todas las plantas</option>
                    {plants.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}

                {/* Area */}
                {plants.length > 0 && (
                  <select
                    value={filterArea}
                    onChange={e => setFilterArea(e.target.value)}
                    disabled={!filterPlant && areas.length === 0}
                    className={cn(
                      'h-8 px-3 text-[11px] font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 text-slate-700',
                      !filterPlant && areas.length === 0 && 'opacity-40'
                    )}
                  >
                    <option value="">Todas las áreas</option>
                    {areas.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                )}

                {/* Clear */}
                {hasFilters && (
                  <button
                    onClick={() => { setFilterPlant(''); setFilterArea(''); }}
                    className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                  >
                    ✕ Limpiar
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Period row when filters hidden */}
        {mainTab === 'kpis' && !showFilters && (
          <div className="flex items-center">
            <PeriodSelector
              value={period}
              onChange={setPeriod}
              custom={custom}
              onCustomChange={setCustom}
            />
          </div>
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={mainTab === 'reports' ? 'reports' : kpiView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {mainTab === 'reports'                          && <ReportsHub />}
            {mainTab === 'kpis' && kpiView === 'overview'   && <KpiOverview   period={period} custom={custom} filterPlant={filterPlant} filterArea={filterArea} onNavigate={(v) => setKpiView(v as KpiView)} />}
            {mainTab === 'kpis' && kpiView === 'workorders'  && <WoAnalytics   period={period} custom={custom} filterPlant={filterPlant} filterArea={filterArea} />}
            {mainTab === 'kpis' && kpiView === 'pm'          && <PmCompliance  period={period} custom={custom} filterPlant={filterPlant} filterArea={filterArea} />}
            {mainTab === 'kpis' && kpiView === 'costs'       && <CostAnalysis  period={period} custom={custom} filterPlant={filterPlant} filterArea={filterArea} />}
            {mainTab === 'kpis' && kpiView === 'inventory'   && <InventoryKpis period={period} custom={custom} filterPlant={filterPlant} filterArea={filterArea} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
