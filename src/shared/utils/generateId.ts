import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd MMM yyyy', { locale: es });
  } catch {
    return iso;
  }
}

export function formatRelative(iso: string): string {
  if (!iso) return '';
  try {
    return formatDistanceToNow(parseISO(iso), { locale: es, addSuffix: true });
  } catch {
    return iso;
  }
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n);
}

export function cn(...classes: (string | undefined | null | false | 0)[]): string {
  return classes.filter(Boolean).join(' ');
}
