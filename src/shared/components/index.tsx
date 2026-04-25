import React, { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, AlertTriangle, Info, CheckCircle2, ChevronRight, Bell } from 'lucide-react';
import { cn } from '../utils/generateId';
import { ToastPayload } from '../types';

export { cn } from '../utils/generateId';

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

// ─── MODAL ───────────────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const sizeMap: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              'bg-white w-full flex flex-col relative z-10',
              'rounded-[14px] shadow-floating border border-slate-100',
              'max-h-[90vh]',
              sizeMap[size]
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h2 className="font-display text-base font-bold text-slate-900 tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 shrink-0 bg-slate-50/50">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// ─── FORM ELEMENTS ────────────────────────────────────────────────────────────
const inputBase = [
  'flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm',
  'placeholder:text-slate-400 outline-none transition-all duration-150',
  'focus:border-brand focus:ring-[3px] focus:ring-brand/10',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
  'text-slate-900',
].join(' ');

interface InputWithLabelProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ className, label, prefix, suffix, id, ...props }, ref) => {
    const inputEl = (
      <div className={cn('relative flex items-center')}>
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(inputBase, prefix ? 'pl-9' : '', suffix ? 'pr-9' : '', className)}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    );

    if (!label) return inputEl;
    return (
      <div className="space-y-1">
        <label htmlFor={id} className="block text-[10px] uppercase tracking-wide font-bold text-slate-500 ml-0.5">{label}</label>
        {inputEl}
      </div>
    );
  }
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(inputBase, 'appearance-none cursor-pointer pr-8 bg-[right_12px_center] bg-no-repeat', className)}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
      }}
      {...props}
    />
  )
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(inputBase, 'min-h-[80px] resize-y', className)}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

interface FormFieldProps {
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  id?: string;
  required?: boolean;
  className?: string;
}

export const FormField = ({ label, error, hint, children, id, required, className }: FormFieldProps) => (
  <div className={cn('space-y-1 w-full', className)}>
    <label htmlFor={id} className="block text-[10px] uppercase tracking-wide font-bold text-slate-500 ml-0.5">
      {label}
      {required && <span className="text-brand ml-1">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    {error && <p className="text-[10px] text-brand font-medium flex items-center gap-1 mt-1"><AlertTriangle size={10} />{error}</p>}
  </div>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export const StatCard = ({
  title, value, icon, description, trend, variant = 'default', onClick
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: { value: number; label: string };
  variant?: 'default' | 'danger' | 'warn' | 'ok' | 'info';
  onClick?: () => void;
}) => {
  const iconVariants: Record<string, string> = {
    default: 'text-slate-600 bg-slate-100',
    danger:  'text-brand bg-brand/10',
    warn:    'text-amber-600 bg-amber-50',
    ok:      'text-green-600 bg-green-50',
    info:    'text-blue-600 bg-blue-50',
  };

  return (
    <motion.div
      whileHover={onClick ? { y: -4 } : {}}
      className={cn(
        'bg-white rounded-[14px] border border-slate-100 shadow-card p-6 flex flex-col gap-4',
        onClick ? 'cursor-pointer' : ''
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        {icon && (
          <div className={cn('p-2.5 rounded-lg', iconVariants[variant])}>
            {React.cloneElement(icon as React.ReactElement, { size: 18 })}
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-display font-bold text-slate-900 tracking-tight">{value}</div>
        {(description || trend) && (
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
            {description && <p className="text-xs text-slate-500 font-medium">{description}</p>}
            {trend && (
              <span className={cn('text-[10px] font-bold uppercase tracking-wide', trend.value >= 0 ? 'text-green-600' : 'text-brand')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export const EmptyState = ({
  title, description, action, icon
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[14px] border border-dashed border-slate-200">
    {icon && <div className="text-slate-300 mb-4">{React.cloneElement(icon as React.ReactElement, { size: 40 })}</div>}
    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{title}</h3>
    {description && <p className="mt-1 text-xs text-slate-500 max-w-[240px] leading-relaxed">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// ─── NO SELECTION ─────────────────────────────────────────────────────────────
export const NoSelection = ({ message = 'Selecciona un elemento para ver sus detalles.' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50/30">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
      <Info size={24} />
    </div>
    <p className="text-xs font-medium text-slate-400 max-w-[180px] leading-relaxed italic">{message}</p>
  </div>
);

// ─── SPINNER ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return <Loader2 className={cn('animate-spin text-brand', sizes[size])} />;
};

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
export const ConfirmDialog = ({
  isOpen, onClose, onConfirm, title, description, confirmText = 'Confirmar', danger = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  danger?: boolean;
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" footer={
    <>
      <Button variant="ghost" onClick={onClose}>Cancelar</Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>
        {confirmText}
      </Button>
    </>
  }>
    <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
  </Modal>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
export const ToastRack = ({ toast, onDismiss }: { toast: ToastPayload | null; onDismiss: () => void }) => {
  if (!toast) return null;

  const config: Record<string, { icon: ReactNode; accent: string; bg: string }> = {
    success: { icon: <CheckCircle2 size={18} />, accent: 'bg-green-500', bg: 'text-green-600' },
    error:   { icon: <AlertTriangle size={18} />, accent: 'bg-brand', bg: 'text-brand' },
    warning: { icon: <AlertTriangle size={18} />, accent: 'bg-amber-500', bg: 'text-amber-600' },
    info:    { icon: <Info size={18} />, accent: 'bg-blue-500', bg: 'text-blue-600' },
  };

  const c = config[toast.type] || config.info;

  return createPortal(
    <AnimatePresence>
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm w-full px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white border border-slate-100 shadow-floating rounded-[14px] overflow-hidden flex"
          >
            <div className={cn('w-1 shrink-0', c.accent)} />
            <div className="flex items-start gap-3 p-4 flex-1">
              <span className={c.bg}>{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 tracking-tight">{toast.title}</p>
                {toast.message && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">{toast.message}</p>}
              </div>
              <button
                onClick={onDismiss}
                className="text-slate-400 hover:text-slate-900 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

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

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
export const Breadcrumb = ({ items }: { items: { label: string; onClick?: () => void }[] }) => (
  <nav className="flex items-center gap-1.5 flex-wrap">
    {items.map((item, i) => (
      <React.Fragment key={item.label}>
        {item.onClick ? (
          <button
            onClick={item.onClick}
            className="text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-brand transition-colors"
          >
            {item.label}
          </button>
        ) : (
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-900">{item.label}</span>
        )}
        {i < items.length - 1 && (
          <ChevronRight size={10} className="text-slate-300 shrink-0" />
        )}
      </React.Fragment>
    ))}
  </nav>
);

// ─── STAT PILL ────────────────────────────────────────────────────────────────
export const StatPill = ({ label, value, variant = 'neutral' }: { label: string; value: string | number; variant?: string }) => (
  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
    <Badge variant={variant}>{value}</Badge>
  </div>
);

// ─── ALERT BANNER ─────────────────────────────────────────────────────────────
export const AlertBanner = ({
  type = 'info', title, message, onDismiss, action
}: {
  type?: 'info' | 'warn' | 'danger' | 'ok';
  title: string;
  message?: string;
  onDismiss?: () => void;
  action?: ReactNode;
}) => {
  const cfg: Record<string, { icon: ReactNode; bg: string; border: string; text: string }> = {
    info:   { icon: <Info size={16} />, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-800' },
    warn:   { icon: <AlertTriangle size={16} />, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800' },
    danger: { icon: <AlertTriangle size={16} />, bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-800' },
    ok:     { icon: <CheckCircle2 size={16} />, bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-800' },
  };
  const c = cfg[type];

  return (
    <div className={cn('flex items-start gap-3 px-4 py-3 rounded-lg border shadow-sm', c.bg, c.border)}>
      <span className={cn('shrink-0 mt-0.5', c.text)}>{c.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-bold tracking-tight', c.text)}>{title}</p>
        {message && <p className="text-xs font-medium text-slate-700 mt-0.5 leading-relaxed">{message}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className={cn('shrink-0', c.text, 'opacity-40 hover:opacity-100 transition-opacity')}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};

// ─── NOTIFICATION BADGE ───────────────────────────────────────────────────────
export const NotificationDot = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
      {count > 99 ? '99+' : count}
    </span>
  );
};

