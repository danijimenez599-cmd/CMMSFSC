import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend as RechartsLegend, LineChart, Line,
} from 'recharts';
import { Period } from '../hooks/useKpiData';
import { cn } from '../../../shared/utils/utils';

// ── Custom Tooltip ────────────────────────────────────────────────────────────

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-2xl border border-slate-700 min-w-[140px]">
      {label && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs font-bold">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill || p.color || p.stroke }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white">{typeof p.value === 'number' && p.value % 1 !== 0 ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Period Selector ───────────────────────────────────────────────────────────

const PERIODS: { id: Period; label: string }[] = [
  { id: '7d',    label: '7 días' },
  { id: '30d',   label: '30 días' },
  { id: '90d',   label: '3 meses' },
  { id: 'month', label: 'Este mes' },
  { id: 'custom', label: 'Personalizado' },
];

interface PeriodSelectorProps {
  value: Period;
  onChange: (p: Period) => void;
  custom?: { from: string; to: string };
  onCustomChange?: (c: { from: string; to: string }) => void;
}

export function PeriodSelector({ value, onChange, custom, onCustomChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
        {PERIODS.map(p => (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              value === p.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {value === 'custom' && onCustomChange && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={custom?.from || ''}
            onChange={e => onCustomChange({ from: e.target.value, to: custom?.to || '' })}
            className="h-8 px-3 text-[11px] font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-400 text-xs">—</span>
          <input
            type="date"
            value={custom?.to || ''}
            onChange={e => onCustomChange({ from: custom?.from || '', to: e.target.value })}
            className="h-8 px-3 text-[11px] font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
}

// ── KPI Hero Card ─────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
  accent?: string;
  trend?: number; // percentage vs previous period
  onClick?: () => void;
}

export function KpiCard({ label, value, sub, icon, color = 'bg-blue-500', accent = 'text-blue-600', trend, onClick }: KpiCardProps) {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white border border-slate-100 rounded-3xl p-6 text-left shadow-sm hover:shadow-md transition-all group w-full cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm', color)}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest',
            trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          )}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className={cn('text-4xl font-black tracking-tighter', accent)}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 font-bold mt-1">{sub}</p>}
    </motion.button>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

export function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-display font-black text-slate-900 text-lg tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  total?: number;
  label?: string;
  onSliceClick?: (entry: any) => void;
}

export function DonutChart({ data, total, label, onSliceClick }: DonutChartProps) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              onClick={(entry) => onSliceClick?.(entry)}
              onMouseEnter={(_, index) => setActive(data[index]?.name)}
              onMouseLeave={() => setActive(null)}
            >
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color}
                  opacity={active && active !== entry.name ? 0.4 : 1}
                  className="cursor-pointer transition-all"
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {total !== undefined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-3xl font-black text-slate-900">{total}</p>
            {label && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>}
          </div>
        )}
      </div>
      <div className="space-y-2 flex-1 min-w-0">
        {data.map(d => (
          <button
            key={d.name}
            onClick={() => onSliceClick?.(d)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group"
            onMouseEnter={() => setActive(d.name)}
            onMouseLeave={() => setActive(null)}
          >
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-xs font-bold text-slate-700 flex-1 truncate">{d.name}</span>
            <span className="text-xs font-black text-slate-900 shrink-0">{d.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Stacked Bar Chart ─────────────────────────────────────────────────────────

interface StackedBarProps {
  data: any[];
  bars: { key: string; name: string; color: string }[];
  xKey: string;
  onBarClick?: (data: any) => void;
}

export function StackedBarChart({ data, bars, xKey, onBarClick }: StackedBarProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} onClick={onBarClick ? (d) => onBarClick(d) : undefined}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        {bars.map(b => (
          <Bar key={b.key} dataKey={b.key} name={b.name} stackId="a" fill={b.color} radius={b.key === bars[bars.length - 1].key ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Horizontal Bar (ranking) ──────────────────────────────────────────────────

export function HorizontalBar({ name, value, max, color, sub }: { name: string; value: number; max: number; color: string; sub?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-700 truncate flex-1 mr-2">{name}</span>
        <div className="flex items-center gap-2 shrink-0">
          {sub && <span className="text-[10px] font-bold text-slate-400">{sub}</span>}
          <span className="text-sm font-black text-slate-900">{value}</span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ── Status Pill ───────────────────────────────────────────────────────────────

export function StatePill({ state }: { state: 'ok' | 'soon' | 'overdue' }) {
  const map = {
    ok: { label: 'Al Día', cls: 'bg-emerald-50 text-emerald-700' },
    soon: { label: 'Próximo', cls: 'bg-amber-50 text-amber-700' },
    overdue: { label: 'Vencido', cls: 'bg-red-50 text-red-700' },
  };
  const { label, cls } = map[state];
  return (
    <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0', cls)}>
      {label}
    </span>
  );
}
