import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, ChevronDown, MoreVertical, MoreHorizontal, Plus, Edit2, Trash2, Database, Box } from 'lucide-react';
import { useStore } from '../../../store';
import { Button, Badge, EmptyState, cn } from '../../../shared/components';
import { AssetTreeNode } from '../types';
import { searchTree } from '../utils/buildTree';
import { ASSET_TYPE_ICONS, CRITICALITY_CONFIG } from '../utils/assetHelpers';

interface AssetTreePanelProps {
  onNewAsset: (parentId?: string) => void;
  onEditAsset: (id: string) => void;
  onDeleteAsset: (id: string) => void;
}

const countNodes = (nodes: AssetTreeNode[]): number =>
  nodes.reduce((acc, n) => acc + 1 + countNodes(n.children), 0);

// ─── TREE ITEM ────────────────────────────────────────────────────────────────
interface TreeItemProps {
  node: AssetTreeNode;
  expanded: Set<string>;
  forceExpand: boolean;
  toggleExpand: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewChild: (parentId: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
}

const AssetTreeItem: React.FC<TreeItemProps> = ({
  node, expanded, forceExpand, toggleExpand, selectedId,
  onSelect, onNewChild, onEdit, onDelete, activeMenuId, setActiveMenuId,
}) => {
  const isExpanded = forceExpand || expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children.length > 0;
  const showMenu = activeMenuId === node.id;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu, setActiveMenuId]);

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center group py-1.5 pr-2 rounded-lg mx-2 transition-all duration-200 cursor-pointer relative',
          isSelected
            ? 'bg-brand/10 text-brand'
            : 'hover:bg-slate-200/50 text-slate-600 hover:text-slate-900',
          showMenu && 'z-50',
          node.status === 'decommissioned' && 'opacity-50 grayscale contrast-75'
        )}
        style={{ paddingLeft: `${node.depth * 14 + 6}px` }}
        onClick={() => onSelect(node.id)}
      >
        {isSelected && (
          <motion.div 
            layoutId="active-asset-indicator"
            className="absolute left-0 w-0.5 h-4 bg-brand rounded-r-full"
          />
        )}

        {/* Chevron */}
        <div
          className="w-5 h-5 flex items-center justify-center shrink-0"
          onClick={e => { e.stopPropagation(); if (hasChildren) toggleExpand(node.id); }}
        >
          {hasChildren ? (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={12} className={cn(isSelected ? 'text-brand' : 'text-slate-400')} />
            </motion.div>
          ) : (
            <div className="w-1 h-1 rounded-full bg-slate-200" />
          )}
        </div>

        {/* Icon */}
        <span className="w-5 text-center text-sm shrink-0 mr-1.5 grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100">
          {ASSET_TYPE_ICONS[node.assetType]}
        </span>

        {/* Label */}
        <div className="flex-1 min-w-0 flex items-center gap-2 truncate">
          <span className={cn('truncate text-xs font-bold tracking-tight', isSelected ? 'text-brand' : 'text-slate-700')}>
            {node.name}
          </span>
          {node.code && (
            <span className={cn('text-[9px] font-mono font-bold px-1 rounded bg-slate-100 uppercase shrink-0', isSelected ? 'bg-brand/10 text-brand' : 'text-slate-400')}>
              {node.code}
            </span>
          )}
        </div>

        {/* Criticality indicator */}
        {!['plant', 'area'].includes(node.assetType) && node.criticality === 'high' && (
          <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 ml-1 shadow-[0_0_8px_rgba(153,27,27,0.4)]" />
        )}

        {/* Context menu */}
        <div className="relative ml-1 shrink-0" ref={menuRef}>
          <button
            className={cn(
              'w-6 h-6 flex items-center justify-center rounded-md transition-all',
              showMenu ? 'opacity-100 bg-white shadow-sm border border-slate-100' : 'opacity-0 group-hover:opacity-100',
              isSelected ? 'text-brand hover:bg-brand/20' : 'text-slate-400 hover:bg-white hover:shadow-sm'
            )}
            onClick={e => { e.stopPropagation(); setActiveMenuId(showMenu ? null : node.id); }}
          >
            <MoreHorizontal size={12} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                className="absolute top-full right-0 mt-1 w-44 bg-white border border-slate-200 shadow-floating rounded-xl py-1.5 z-50 overflow-hidden"
              >
                {[
                  { icon: <Edit2 size={12} />, label: 'Editar Propiedades', action: () => onEdit(node.id) },
                  { icon: <Plus size={12} />, label: 'Agregar Sub-activo', action: () => onNewChild(node.id) },
                  { icon: <Trash2 size={12} />, label: 'Eliminar / Baja', danger: true, action: () => onDelete(node.id) },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      'w-full text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors',
                      item.danger
                        ? 'text-brand hover:bg-brand/5'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                    onClick={e => { e.stopPropagation(); setActiveMenuId(null); item.action(); }}
                  >
                    <span className="opacity-70">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-visible"
          >
            {node.children.map(child => (
              <AssetTreeItem
                key={child.id} node={child}
                expanded={expanded} forceExpand={forceExpand}
                toggleExpand={toggleExpand} selectedId={selectedId}
                onSelect={onSelect} onNewChild={onNewChild}
                onEdit={onEdit} onDelete={onDelete}
                activeMenuId={activeMenuId} setActiveMenuId={setActiveMenuId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── MAIN PANEL ───────────────────────────────────────────────────────────────
export default function AssetTreePanel({ onNewAsset, onEditAsset, onDeleteAsset }: AssetTreePanelProps) {
  const { assets, assetTree, selectedAssetId, selectAsset, assetsLoading, currentUser } = useStore() as any;

  const [query, setQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const initDone = useRef(false);

  const getInitialExpanded = (): Set<string> => {
    try {
      const stored = sessionStorage.getItem('apex-asset-expanded');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (err) {
      console.warn('Error reading asset expansion state:', err);
    }
    return new Set();
  };

  const [expanded, setExpanded] = useState<Set<string>>(getInitialExpanded);

  useEffect(() => {
    if (!initDone.current && assetTree.length > 0) {
      if (expanded.size === 0) {
        const next = new Set<string>();
        const expandDepth = (nodes: AssetTreeNode[], max: number) => {
          nodes.forEach(n => {
            if (n.depth <= max) next.add(n.id);
            expandDepth(n.children, max);
          });
        };
        expandDepth(assetTree, 1);
        setExpanded(next);
      }
      initDone.current = true;
    }
  }, [assetTree]);

  useEffect(() => {
    if (initDone.current) {
      sessionStorage.setItem('apex-asset-expanded', JSON.stringify([...expanded]));
    }
  }, [expanded]);

  const isSearching = query.trim().length > 0;
  
  // Recursively filter out decommissioned assets if not showInactive
  const filterInactive = useCallback((nodes: AssetTreeNode[]): AssetTreeNode[] => {
    return nodes
      .filter(n => showInactive || n.status !== 'decommissioned')
      .map(n => ({ ...n, children: filterInactive(n.children) }));
  }, [showInactive]);

  const processedTree = useMemo(() => filterInactive(assetTree), [assetTree, filterInactive]);
  const filteredTree = useMemo(() => searchTree(processedTree, query), [processedTree, query]);
  
  const inactiveCount = useMemo(() => {
    const countInactive = (nodes: AssetTreeNode[]): number => {
      return nodes.reduce((acc, n) => {
        const self = n.status === 'decommissioned' ? 1 : 0;
        return acc + self + countInactive(n.children);
      }, 0);
    };
    return countInactive(assetTree);
  }, [assetTree]);

  const resultCount = useMemo(() => isSearching ? countNodes(filteredTree) : null, [filteredTree, isSearching]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const canModify = currentUser?.role !== 'viewer';

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-full lg:w-72 xl:w-80 shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-200/60 bg-white shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-slate-900 tracking-tight text-base flex items-center gap-2">
              <Database size={16} className="text-brand" />
              Jerarquía
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{assets.length} activos registrados</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={cn(
                "h-9 px-2.5 rounded-lg transition-all shadow-sm group border flex items-center gap-2",
                showInactive ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-400 border-slate-200 hover:text-slate-600"
              )}
              title={showInactive ? "Ocultar equipos de baja" : "Ver equipos de baja"}
            >
              <div className="relative">
                <Database size={16} className={cn(showInactive ? "opacity-100" : "opacity-40")} />
                {!showInactive && <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-brand rounded-full ring-2 ring-white" />}
              </div>
              {!showInactive && inactiveCount > 0 && (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                  {inactiveCount}
                </span>
              )}
            </button>
            {canModify && (
              <button 
                onClick={() => onNewAsset()}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-brand hover:text-white transition-all shadow-sm group"
              >
                <Plus size={16} className="group-hover:rotate-90 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por TAG o Nombre..."
            className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all placeholder:text-slate-400 outline-none"
          />
          {isSearching && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Tree body */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {assetsLoading ? (
          <div className="px-5 space-y-4">
            {[80, 65, 70, 55, 75].map((w, i) => (
              <div key={i} className="flex items-center gap-3" style={{ paddingLeft: `${(i % 3) * 14}px` }}>
                <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 bg-slate-200 rounded-full animate-pulse" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        ) : assets.length === 0 ? (
          <EmptyState
            title="Inventario Vacío"
            description="No hay activos registrados en el sistema."
            action={canModify ? (
              <Button size="sm" variant="outline" onClick={() => onNewAsset()}>
                Agregar Primer Activo
              </Button>
            ) : undefined}
          />
        ) : filteredTree.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Box size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin coincidencias</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredTree.map(node => (
              <AssetTreeItem
                key={node.id} node={node}
                expanded={expanded} forceExpand={isSearching}
                toggleExpand={toggleExpand} selectedId={selectedAssetId}
                onSelect={selectAsset} onNewChild={onNewAsset}
                onEdit={onEditAsset} onDelete={onDeleteAsset}
                activeMenuId={activeMenuId} setActiveMenuId={setActiveMenuId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      {isSearching && resultCount !== null && (
        <div className="p-3 bg-white border-t border-slate-200 text-center">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {resultCount} {resultCount === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </p>
        </div>
      )}
    </div>
  );
}

