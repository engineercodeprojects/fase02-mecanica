import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Table({
  className,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table
        className={cn('w-full text-sm', className)}
        {...props}
      />
    </div>
  );
}

export function THead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-slate-50 text-slate-600" {...props} />;
}

export function TBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y divide-slate-200 bg-white" {...props} />;
}

export function TR(props: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className="hover:bg-slate-50" {...props} />;
}

export function TH({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide',
        className,
      )}
      {...props}
    />
  );
}

export function TD({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-2 align-middle', className)} {...props} />;
}
