import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple';

const tones: Record<Tone, string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-slate-100 text-slate-600',
  purple: 'bg-violet-100 text-violet-700',
};

export function Badge({
  tone = 'default',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const STATUS_TONES: Record<string, Tone> = {
  RECEBIDA: 'info',
  EM_DIAGNOSTICO: 'purple',
  AGUARDANDO_APROVACAO: 'warning',
  EM_EXECUCAO: 'info',
  FINALIZADA: 'success',
  ENTREGUE: 'success',
  CANCELADA: 'danger',
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONES[status] ?? 'default'}>{status}</Badge>;
}
