import React, { useState, useMemo } from 'react';
import { Search, Plus, ArrowUpDown, X, Filter } from 'lucide-react';
import { useStore } from '../../../store';
import { Button, Badge, cn, ConfirmDialog } from '../../../shared/components';
import { formatCurrency } from '../../../shared/utils/utils';

interface InventoryTableProps {
  onNew: () => void;
  onEdit: (id: string) => void;
  onAdjust: (id: string) => void;
}

type SortCol = 'name' | 'partNumber' | 'category' | 'stockCurrent' | 'unitCost';

export default function InventoryTable({ onNew, onEdit, onAdjust }: InventoryTableProps) {
  const { inventoryItems, selectedItemId, selectItem, deleteItem } = useStore() as any;

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortCol, setSortCol] = useState<SortCol>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const ITEMS_PER_PAGE = 25;

  const categories = useMemo(() => {
    const cats = new Set(
      (inventoryItems || []).map((i: any) => i.category).filter(Boolean) as string[]
    );
    return Array.from(cats).sort();
  }, [inventoryItems]);

  const filteredData = useMemo(() => {
    let res = [...inventoryItems];

    if (search) {
      const q = search.toLowerCase();
      res = res.filter((i: any) =>
        i.name.toLowerCase().includes(q) ||
        (i.partNumber && i.partNumber.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== 'all') {
      res = res.filter((i: any) => i.category === categoryFilter);
    }

    if (lowStockOnly) {
      res = res.filter((i: any) => i.stockCurrent <= i.stockMin);
    }

    res.sort((a: any, b: any) => {
      let va = a[sortCol];
      let vb = b[sortCol];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va == null) return sortAsc ? 1 : -1;
      if (vb == null) return sortAsc ? -1 : 1;
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

    return res;
  }, [inventoryItems, search, categoryFilter, lowStockOnly, sortCol, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  const getStockBadge = (current: number, min: number) => {
    if (current <= 0) return <Badge variant="danger">{current}</Badge>;
    if (current <= min) return <Badge variant="warn">{current}</Badge>;
    if (current <= min * 1.5) return <Badge variant="info">{current}</Badge>;
    return <Badge variant="ok">{current}</Badge>;
  };

  const totalValue = filteredData.reduce(
    (acc: number, i: any) => acc + (i.stockCurrent * (i.unitCost || 0)), 0
  );

  const activeFilters = (categoryFilter !== 'all' ? 1 : 0) + (lowStockOnly ? 1 : 0) + (search ? 1 : 0);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="p-4 border-b border-border space-y-3 bg-white sticky top-0 z-10">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tx-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar nombre o N/P..."
                className="w-full pl-8 pr-8 text-sm h-9 border border-border rounded-xl bg-bg-3 focus:bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-tx-4 hover:text-tx">
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                showFilters || activeFilters > 0
                  ? 'bg-brand text-white border-brand'
                  : 'bg-bg-3 text-tx-3 border-border hover:border-brand/40'
              )}
            >
              <Filter size={12} />
              Filtros
              {activeFilters > 0 && (
                <span className="bg-white/30 text-white px-1 rounded text-[10px]">{activeFilters}</span>
              )}
            </button>

            {lowStockOnly && (
              <Badge variant="warn" dot>Solo bajo mínimo</Badge>
            )}
          </div>

          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onNew}>
            Nuevo artículo
          </Button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 animate-slide-up">
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              className="text-xs h-9 border border-border rounded-lg px-2 bg-white focus:outline-none focus:border-brand"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>

            <label className="flex items-center gap-2 text-xs text-tx-2 cursor-pointer bg-white px-3 py-1.5 border border-border rounded-lg hover:bg-bg-3 transition-colors">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={e => { setLowStockOnly(e.target.checked); setPage(1); }}
                className="rounded text-brand focus:ring-brand"
              />
              Solo bajo mínimo
            </label>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-bg-3 text-[10px] text-tx-4 uppercase font-bold tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:text-tx select-none whitespace-nowrap" onClick={() => handleSort('partNumber')}>
                N/P {sortCol === 'partNumber' && <ArrowUpDown size={10} className="inline ml-0.5" />}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-tx select-none" onClick={() => handleSort('name')}>
                Nombre {sortCol === 'name' && <ArrowUpDown size={10} className="inline ml-0.5" />}
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-tx select-none hidden md:table-cell" onClick={() => handleSort('category')}>
                Categoría
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-tx select-none" onClick={() => handleSort('stockCurrent')}>
                Stock {sortCol === 'stockCurrent' && <ArrowUpDown size={10} className="inline ml-0.5" />}
              </th>
              <th className="px-4 py-3 hidden lg:table-cell">Ubicación</th>
              <th className="px-4 py-3 cursor-pointer hover:text-tx select-none hidden sm:table-cell" onClick={() => handleSort('unitCost')}>
                Costo
              </th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.map((item: any) => (
              <tr
                key={item.id}
                onClick={() => selectItem(item.id)}
                className={cn(
                  'hover:bg-bg-3/40 cursor-pointer transition-colors group',
                  selectedItemId === item.id ? 'bg-brand/5 border-l-2 border-l-brand' : ''
                )}
              >
                <td className="px-4 py-3 font-mono text-[10px] uppercase font-bold text-tx-4">
                  {item.partNumber || '—'}
                </td>
                <td className="px-4 py-3 font-medium text-tx max-w-[160px] truncate">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-tx-3 hidden md:table-cell">
                  {item.category || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStockBadge(item.stockCurrent, item.stockMin)}
                    <span className="text-[10px] text-tx-4 hidden sm:inline whitespace-nowrap">
                      / {item.stockMin} mín
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-tx-3 hidden lg:table-cell truncate max-w-[100px]">
                  {item.locationBin || '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-tx-3 hidden sm:table-cell whitespace-nowrap">
                  {item.unitCost ? formatCurrency(item.unitCost) : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="xs" onClick={e => { e.stopPropagation(); onAdjust(item.id); }}>
                      Ajustar
                    </Button>
                    <Button variant="ghost" size="xs" onClick={e => { e.stopPropagation(); onEdit(item.id); }}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-danger hover:bg-danger-bg"
                      onClick={e => { e.stopPropagation(); setDeletingId(item.id); }}
                    >
                      Borrar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-tx-4 italic text-sm">
                  Sin artículos con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>

          {/* Footer totals */}
          <tfoot className="bg-bg-3 border-t-2 border-border sticky bottom-0 z-10">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-right text-[10px] font-bold text-tx-4 uppercase tracking-wider">
                Valor total (filtrado):
              </td>
              <td colSpan={3} className="px-4 py-3 font-display font-semibold text-brand text-base">
                {formatCurrency(totalValue)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-border flex items-center justify-between bg-white text-sm shrink-0">
          <span className="text-xs text-tx-4">
            Página {page} de {totalPages} · {filteredData.length} artículos
          </span>
          <div className="flex gap-1">
            <Button variant="secondary" size="xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              ← Ant
            </Button>
            <Button variant="secondary" size="xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Sig →
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId && (
        <ConfirmDialog
          isOpen
          title="Eliminar artículo"
          description="¿Seguro que deseas eliminar este artículo del inventario? Esta acción no se puede deshacer."
          onConfirm={() => { deleteItem(deletingId); setDeletingId(null); }}
          onClose={() => setDeletingId(null)}
          confirmText="Eliminar"
          danger
        />
      )}
    </div>
  );
}
