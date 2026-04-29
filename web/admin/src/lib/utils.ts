import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(value: string | Date | undefined | null): string {
  if (!value) return '-';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString('pt-BR');
}
