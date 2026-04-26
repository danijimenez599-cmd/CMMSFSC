import React, { useState, useMemo } from 'react';
import { Search, X, History } from 'lucide-react';
import { useStore } from '../../../store';
import { Badge, cn } from '../../../shared/components';
import { WO_STATUS_LABELS, WO_PRIORITY_CONFIG, WO_TYPE_LABELS } from '../../workorders/utils/statusHelpers';
import { WoStatus } from '../../workorders/types';
import { formatDate } from '../../../shared/utils/utils';

type StatusFilter = 'all' | 'completed' | 'cancelled';

export default function AuditListPanel() {
  const { assetHistory, selectedWoId, selectWo } = useStore() as any;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    let result = [...(assetHistory || [])];
    if (statusFilter !== 'all') result = result.filter((wo: any) => wo.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((wo: any) =>
        wo.woNumber.toLowerCase().includes(q) || wo.title.toLowerCase().includes(q)
      );
    }
    return result;
  }, [assetHistory, statusFilter, search]);

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-200/60 bg-white shrink-0 space-y-4">
        <div>
          <h2 className="font-display font-bold text-slate-900 tracking-tight text-base flex items-center gap-2">
            <History size={16} className="text-brand animate-pulse" />
            Historial de Intervenciones
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {filtered.length} registros encontrados
          </p>
        </div>

        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por ID o título..."
            className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all placeholder:text-slate-400 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors">
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 shadow-inner">
          {(['all', 'completed', 'cancelled'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'flex-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all',
                statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              {s === 'all' ? 'Todas' : s === 'completed' ? 'Cerradas' : 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="pt-16 text-center">
            <History size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin registros históricos</p>
          </div>
        ) : (
          filtered.map((wo: any) => {
            const isSelected = selectedWoId === wo.id;
            const prioConfig = WO_PRIORITY_CONFIG[wo.priority] as any;
            const bgClass = prioConfig?.textColor?.replace('text-', 'bg-') || 'bg-slate-300';

            return (
              <div
                key={wo.id}
                onClick={() => selectWo(isSelected ? null : wo.id)}
                className={cn(
                  'relative bg-white rounded-xl border p-4 cursor-pointer transition-all shadow-sm hover:shadow-md pl-5',
                  isSelected
                    ? 'ring-[3px] ring-brand/10 border-brand/40 bg-brand/[0.02]'
                    : 'border-slate-200 hover:border-brand/20'
                )}
              >
                {/* Priority bar */}
                <div className={cn('absolute left-0 top-4 bottom-4 w-1 rounded-r-full', bgClass)} />

                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                    #{wo.woNumber}
                  </span>
                  <Badge variant={wo.status as any} className="text-[9px] font-bold uppercase px-1.5 py-0.5">
                    {WO_STATUS_LABELS[wo.status as WoStatus]}
                  </Badge>
                </div>

                <h4 className={cn(
                  'text-[13px] font-bold tracking-tight line-clamp-2 mb-1 leading-snug transition-colors',
                  isSelected ? 'text-brand' : 'text-slate-900'
                )}>
                  {wo.title}
                </h4>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  {WO_TYPE_LABELS[wo.woType] || wo.woType}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 truncate max-w-[55%]">
                    {wo.vendorNameSnapshot || wo.assignedToNameSnapshot || 'S/A'}
                  </span>
                  {wo.completedAt && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                      {formatDate(wo.completedAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
