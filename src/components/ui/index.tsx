import { clsx } from 'clsx'
import { type ReactNode, useEffect } from 'react'
import type { ToastType } from '@/hooks/useToast'

// ── Badge ─────────────────────────────────────────────────────────
type BadgeVariant = 'ok' | 'warn' | 'err' | 'info' | 'neutral' | 'open' | 'closed' | 'scheduled' | 'paused'

const badgeClasses: Record<BadgeVariant, string> = {
  ok:        'bg-green-100 text-green-700',
  warn:      'bg-amber-100 text-amber-700',
  err:       'bg-red-100 text-red-700',
  info:      'bg-red-100 text-red-700',
  neutral:   'bg-bg-3 text-tx-2',
  open:      'bg-amber-100 text-amber-700',
  closed:    'bg-green-100 text-green-700',
  scheduled: 'bg-red-100 text-red-700',
  paused:    'bg-red-100 text-red-700',
}

export function Badge({ variant = 'neutral', children, className }: {
  variant?: BadgeVariant; children: ReactNode; className?: string
}) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
      badgeClasses[variant], className
    )}>
      {children}
    </span>
  )
}

// ── Button ────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type BtnSize = 'sm' | 'md' | 'xs'

const btnBase = 'inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all cursor-pointer border-0 whitespace-nowrap'
const btnVariants: Record<BtnVariant, string> = {
  primary:   'bg-brand text-white hover:bg-brand-hover active:scale-95',
  secondary: 'bg-transparent border border-gray-300 text-tx-2 hover:border-brand hover:text-brand hover:bg-brand-pale',
  danger:    'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
  ghost:     'bg-transparent text-tx-3 hover:bg-bg-2',
}
const btnSizes: Record<BtnSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: {
  variant?: BtnVariant; size?: BtnSize; className?: string; children: ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(btnBase, btnVariants[variant], btnSizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

// ── Modal ─────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, large }: {
  open: boolean; onClose: () => void; title: string
  children: ReactNode; footer?: ReactNode; large?: boolean
}) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={clsx(
        'bg-white rounded-cmms flex flex-col shadow-2xl w-full max-h-[90vh] overflow-hidden animate-[fadeIn_0.18s_ease]',
        large ? 'max-w-3xl' : 'max-w-lg'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-display font-bold text-base text-tx">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-tx-3 hover:bg-bg-2 hover:text-brand transition-colors"
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-bg">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Form helpers ──────────────────────────────────────────────────
export function FormField({ label, children, hint }: {
  label: string; children: ReactNode; hint?: string
}) {
  return (
    <div className="mb-3.5">
      <label className="block text-xs font-semibold text-tx-2 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-tx-3 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-tx bg-white outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(inputCls, props.className)} {...props} />
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx(inputCls, 'cursor-pointer', props.className)} {...props} />
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(inputCls, 'resize-y min-h-[72px]', props.className)} {...props} />
}

// ── Stat pill ─────────────────────────────────────────────────────
export function StatPill({ children, variant = 'ok' }: {
  children: ReactNode; variant?: 'ok' | 'warn' | 'err'
}) {
  const cls = { ok: 'bg-green-100 text-green-700 border-green-200', warn: 'bg-amber-100 text-amber-700 border-amber-200', err: 'bg-red-100 text-red-700 border-red-200' }[variant]
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', cls)}>
      {children}
    </span>
  )
}

// ── Toast rack ────────────────────────────────────────────────────
const toastColors: Record<ToastType, string> = {
  success: 'bg-green-700',
  error:   'bg-red-700',
  warn:    'bg-amber-600',
  info:    'bg-tx',
}
const toastIcons: Record<ToastType, string> = {
  success: '✓', error: '✕', warn: '⚠', info: 'i'
}

export function ToastRack({ toasts, dismiss }: {
  toasts: Array<{ id: string; message: string; type: ToastType }>
  dismiss: (id: string) => void
}) {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-[1000]">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={clsx(
            'flex items-center gap-2.5 px-4 py-2.5 rounded-cmms text-white text-sm font-medium shadow-card2 cursor-pointer min-w-[220px] max-w-sm',
            toastColors[t.type]
          )}
        >
          <span className="font-black text-base">{toastIcons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description?: string; action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-tx-3 text-center px-6">
      {icon && <div className="opacity-20">{icon}</div>}
      <h4 className="text-sm font-semibold text-tx-2">{title}</h4>
      {description && <p className="text-sm">{description}</p>}
      {action}
    </div>
  )
}

// ── No selection placeholder ──────────────────────────────────────
export function NoSelection({ icon, title, description }: {
  icon: ReactNode; title: string; description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-tx-3 text-center p-10">
      <div className="opacity-20">{icon}</div>
      <h4 className="text-sm font-semibold text-tx-2">{title}</h4>
      <p className="text-sm">{description}</p>
    </div>
  )
}
