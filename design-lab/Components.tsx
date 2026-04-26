import React, { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, AlertTriangle, Info, CheckCircle2, ChevronRight } from 'lucide-react';

// Utility for joining classes (copied from generateId.ts)
export function cn(...classes: (string | undefined | null | false | 0)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── BUTTON ──────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className, variant = 'primary', size = 'md', loading, icon, iconRight, children, disabled, ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none';
  
  const variants: Record<string, string> = {
    primary:   'bg-brand text-white hover:bg-brand-dark shadow-sm border border-brand/20',
    secondary: 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50',
    danger:    'bg-danger text-white hover:opacity-90 border border-danger/20',
    success:   'bg-ok text-white hover:opacity-90 border border-ok/20',
    warning:   'bg-warn text-white hover:opacity-90 border border-warn/20',
    outline:   'bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50',
    ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent',
  };

  const sizes: Record<string, string> = {
    xs: 'h-7 px-2.5 text-[11px] rounded-md gap-1',
    sm: 'h-8 px-3 text-xs rounded-md',
    md: 'h-10 px-4 text-sm rounded-lg',
    lg: 'h-12 px-5 text-sm rounded-lg',
  };

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant] || variants.primary, sizes[size], className)}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {!loading && icon && <span className="shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
});
Button.displayName = 'Button';

// ─── BADGE ───────────────────────────────────────────────────────────────────
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: string;
  dot?: boolean;
}

export const Badge = ({ variant = 'neutral', dot, className, children, ...props }: BadgeProps) => {
  const colorMap: Record<string, string> = {
    brand:       'bg-brand/10 text-brand border-brand/20',
    ocre:        'bg-amber-100 text-amber-800',
    ok:          'bg-green-100 text-green-800',
    success:     'bg-green-100 text-green-800',
    warn:        'bg-amber-100 text-amber-800',
    warning:     'bg-amber-100 text-amber-800',
    danger:      'bg-red-100 text-red-800',
    err:         'bg-red-100 text-red-800',
    info:        'bg-blue-100 text-blue-800',
    neutral:     'bg-slate-100 text-slate-700',
    open:        'bg-blue-100 text-blue-800',
    assigned:    'bg-purple-100 text-purple-800',
    in_progress: 'bg-amber-100 text-amber-800',
    on_hold:     'bg-slate-100 text-slate-600',
    completed:   'bg-green-100 text-green-800',
    default:     'bg-slate-100 text-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-transparent',
        colorMap[variant] || colorMap.neutral,
        className
      )}
      {...props}
    >
      {dot && <span className="w-1 h-1 rounded-full bg-current" />}
      {children}
    </span>
  );
};

// ─── CARD (New for redesign) ──────────────────────────────────────────────────
export const Card = ({ children, className, onClick }: { children: ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      'bg-white rounded-[16px] border border-slate-100 shadow-sm overflow-hidden transition-all',
      onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-200' : '',
      className
    )}
  >
    {children}
  </div>
);

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export const Avatar = ({
  name = '?', size = 'md', src, className
}: {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  src?: string;
  className?: string;
}) => {
  const safeName = name || '?';
  const initials = safeName.split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase();
  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm'
  };
  const hash = safeName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const colors = [
    'bg-brand', 'bg-slate-700', 'bg-slate-900',
    'bg-brand-dark', 'bg-slate-800', 'bg-slate-600'
  ];
  const color = colors[hash % colors.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover shrink-0 ring-1 ring-slate-100', sizes[size], className)}
      />
    );
  }

  return (
    <div className={cn('rounded-full flex items-center justify-center text-white font-bold shrink-0', sizes[size], color, className)}>
      {initials}
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export const StatCard = ({
  title, value, icon, description, variant = 'default'
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  variant?: 'default' | 'danger' | 'warn' | 'ok' | 'info';
}) => {
  const iconVariants: Record<string, string> = {
    default: 'text-slate-600 bg-slate-100',
    danger:  'text-brand bg-brand/10',
    warn:    'text-amber-600 bg-amber-50',
    ok:      'text-green-600 bg-green-50',
    info:    'text-blue-600 bg-blue-50',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        {icon && (
          <div className={cn('p-2.5 rounded-xl', iconVariants[variant])}>
            {React.cloneElement(icon as React.ReactElement, { size: 18 })}
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-display font-bold text-slate-900 tracking-tight">{value}</div>
        {description && <p className="text-xs text-slate-500 font-medium mt-1">{description}</p>}
      </div>
    </Card>
  );
};
