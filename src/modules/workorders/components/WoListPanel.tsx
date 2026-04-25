import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Filter, ListChecks, Calendar, User, LayoutGrid, Building2 } from 'lucide-react';
import { useStore } from '../../../store';
import { Badge, Button, Avatar, EmptyState, cn } from '../../../shared/components';
import { WO_STATUS_LABELS, WO_STATUS_BADGE, WO_PRIORITY_CONFIG, WO_TYPE_LABELS, isOverdue } from '../utils/statusHelpers';
import { WoStatus } from '../types';
import { formatDate } from '../../../shared/utils/utils';

interface WoListPanelProps {
  onNewWo: () => void;
}

export default function WoListPanel({ onNewWo }: WoListPanelProps) {
  const { workOrders, selectedWoId, selectWo, assets, users, pmPlans, assetPlans } = useStore() as any;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // ── Derive plant/area options from loaded assets ───────────────────────────
  const locationOptions = useMemo(() => {
    return assets
      .filter((a: any) => ['plant', 'area'].includes(a.assetType))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [assets]);

  // ── Recursive helper: collect all asset IDs under a given root asset ───────
  const getDescendantIds = useMemo(() => {
    const childrenMap = new Map<string, string[]>();
    assets.forEach((a: any) => {
      if (a.parentId) {
        if (!childrenMap.has(a.parentId)) childrenMap.set(a.parentId, []);
        childrenMap.get(a.parentId)!.push(a.id);
      }
    });
    const collect = (id: string): string[] => {
      const children = childrenMap.get(id) || [];
      return [id, ...children.flatMap(collect)];
    };
    return collect;
  }, [assets]);

  const filteredOrders = useMemo(() => {
    let result = [...workOrders];

    if (statusFilter === 'active') {
      result = result.filter(wo => !['completed', 'cancelled'].includes(wo.status));
    } else if (statusFilter !== 'all') {
      result = result.filter(wo => wo.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter(wo => wo.priority === priorityFilter);
    }

    // ── Plant/Area filter ── match WOs whose asset lives under selected node ──
    if (locationFilter !== 'all') {
      const subtreeIds = new Set(getDescendantIds(locationFilter));
      result = result.filter(wo => subtreeIds.has(wo.assetId));
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(wo => {
        const assetName = assets.find((a: any) => a.id === wo.assetId)?.name?.toLowerCase() || '';
        return (
          wo.woNumber.toLowerCase().includes(q) ||
          wo.title.toLowerCase().includes(q) ||
          assetName.includes(q)
        );
      });
    }

    const pw: Record<string, number> = { critical: 1, high: 2, medium: 3, low: 4 };
    result.sort((a, b) => {
      if (pw[a.priority] !== pw[b.priority]) return pw[a.priority] - pw[b.priority];
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return da - db;
    });

    return result;
  }, [workOrders, statusFilter, priorityFilter, locationFilter, search, assets, getDescendantIds]);

  const activeFilterCount =
    (statusFilter !== 'active' ? 1 : 0) +
    (priorityFilter !== 'all' ? 1 : 0) +
    (locationFilter !== 'all' ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-full sm:w-80 lg:w-96 shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-200/60 bg-white sticky top-0 z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-slate-900 tracking-tight text-base flex items-center gap-2">
              <ListChecks size={18} className="text-brand" />
              Gestión de OTs
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {filteredOrders.length} órdenes filtradas
            </p>
          </div>
          <button 
            onClick={onNewWo}
            className="p-2.5 rounded-xl bg-brand text-white shadow-lg shadow-brand/20 hover:scale-105 transition-all"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" />
          <input
            type="text"
            placeholder="Buscar por ID, Título o Activo..."
            className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all placeholder:text-slate-400 outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border',
              showFilters || activeFilterCount > 0
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:border-brand/40 shadow-sm'
            )}
          >
            <Filter size={12} />
            Filtros Avanzados
            {activeFilterCount > 0 && (
              <span className="bg-brand text-white w-4 h-4 flex items-center justify-center rounded-full text-[9px] animate-pulse">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick status pills */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-inner">
            {['active', 'completed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                className={cn(
                  'px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all',
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {s === 'active' ? 'Abiertas' : 'Cerradas'}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden pt-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Estado</p>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full text-[11px] font-bold h-8 border border-slate-200 rounded-lg px-2 bg-white focus:outline-none focus:border-brand transition-all"
                  >
                    <option value="all">TODOS</option>
                    <option value="active">SOLO ACTIVAS</option>
                    {Object.entries(WO_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Prioridad</p>
                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="w-full text-[11px] font-bold h-8 border border-slate-200 rounded-lg px-2 bg-white focus:outline-none focus:border-brand transition-all"
                  >
                    <option value="all">TODAS</option>
                    {Object.entries(WO_PRIORITY_CONFIG).map(([k, v]: any) => (
                      <option key={k} value={k}>{v.label.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Plant / Area filter */}
              {locationOptions.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                    <Building2 size={10} />
                    Filtrar por Planta / Área
                  </p>
                  <select
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                    className="w-full text-[11px] font-bold h-8 border border-slate-200 rounded-lg px-2 bg-white focus:outline-none focus:border-brand transition-all"
                  >
                    <option value="all">TODAS LAS UBICACIONES</option>
                    {locationOptions.map((loc: any) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.assetType === 'plant' ? '🏭' : '📂'} {loc.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {locationFilter !== 'all' && (
                    <button
                      onClick={() => setLocationFilter('all')}
                      className="flex items-center gap-1 text-[9px] font-bold text-brand hover:underline pl-1 mt-0.5"
                    >
                      <X size={9} /> Limpiar filtro de ubicación
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {filteredOrders.map((wo: any, idx: number) => {
          const isSelected = selectedWoId === wo.id;
          const overdue = isOverdue(wo);
          const assetName = assets.find((a: any) => a.id === wo.assetId)?.name || '—';
          const assignee = users.find((u: any) => u.id === wo.assignedTo);
          const prioConfig = WO_PRIORITY_CONFIG[wo.priority] as any;

          return (
            <motion.div
              key={wo.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.5) }}
              onClick={() => selectWo(wo.id)}
              className={cn(
                'group relative bg-white rounded-xl border border-slate-200 p-4 cursor-pointer transition-all shadow-sm hover:shadow-md hover:border-brand/20',
                isSelected ? 'ring-[3px] ring-brand/10 border-brand/40 bg-brand/[0.02]' : '',
                overdue && !isSelected ? 'bg-brand/5' : ''
              )}
            >
              {/* Priority Indicator */}
              <div 
                className={cn(
                  'absolute left-0 top-4 bottom-4 w-1 rounded-r-full', 
                  prioConfig?.textColor ? prioConfig.textColor.replace('text', 'bg') : 'bg-slate-300'
                )} 
              />

              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    #{wo.woNumber}
                  </span>
                  {wo.woType === 'preventive' && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={10} className="text-brand" />
                      {wo.pmCycleIndex && (
                        <span className="text-[9px] font-black text-brand bg-brand/5 px-1.5 py-0.5 rounded border border-brand/10">
                          C{wo.pmCycleIndex} 
                          {(() => {
                            const ap = assetPlans.find((p: any) => p.id === wo.assetPlanId);
                            const plan = pmPlans.find((p: any) => p.id === (ap?.pmPlanId || wo.generatedFromPlanId));
                            if (!plan) return '';
                            
                            const val = plan.triggerType === 'meter' 
                              ? (plan.meterIntervalValue || 0) * wo.pmCycleIndex
                              : (plan.intervalValue || 0) * wo.pmCycleIndex;
                            const unit = plan.triggerType === 'meter' 
                              ? plan.meterIntervalUnit?.toUpperCase() 
                              : (plan.intervalUnit === 'months' ? 'M' : plan.intervalUnit === 'days' ? 'D' : 'W');
                            
                            return ` • ${val.toLocaleString()}${unit}`;
                          })()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Badge variant={wo.status as any} className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5">
                  {WO_STATUS_LABELS[wo.status as WoStatus]}
                </Badge>
              </div>

              {/* Title */}
              <h4 className={cn(
                'text-[13px] font-bold tracking-tight line-clamp-2 mb-1.5 transition-colors leading-snug',
                isSelected ? 'text-brand' : 'text-slate-900 group-hover:text-brand'
              )}>
                {wo.title}
              </h4>

              {/* Asset name */}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mb-4 flex items-center gap-1.5">
                <LayoutGrid size={10} />
                {assetName}
              </p>

              {/* Bottom row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 max-w-[50%]">
                  <Avatar name={assignee?.fullName || '?'} size="xs" />
                  <span className="text-[10px] font-bold text-slate-500 truncate tracking-tight">
                    {assignee?.fullName || 'S/A'}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {wo.dueDate && (
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
                      overdue && wo.status !== 'completed' ? 'bg-brand text-white shadow-sm' : 'text-slate-400'
                    )}>
                      Vence: {formatDate(wo.dueDate)}
                    </span>
                  )}
                  {wo.status === 'completed' && wo.completedAt && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                      Ejecución: {formatDate(wo.completedAt)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="pt-10">
            <EmptyState
              title={search || activeFilterCount > 0 ? 'Búsqueda Estéril' : 'Sin Tareas'}
              description={
                search || activeFilterCount > 0
                  ? 'No hay órdenes que coincidan con los parámetros establecidos.'
                  : 'El sistema no registra órdenes de trabajo activas en este momento.'
              }
              action={
                !search && activeFilterCount === 0 ? (
                  <Button size="sm" onClick={onNewWo} icon={<Plus size={16} />}>
                    Generar Primera OT
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

