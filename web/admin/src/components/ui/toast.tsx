import { create } from 'zustand';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  tone: Tone;
  message: string;
}
interface ToastStore {
  items: Toast[];
  push: (tone: Tone, message: string) => void;
  remove: (id: number) => void;
}

export const useToast = create<ToastStore>((set) => ({
  items: [],
  push: (tone, message) =>
    set((s) => ({
      items: [...s.items, { id: Date.now() + Math.random(), tone, message }],
    })),
  remove: (id) =>
    set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

export function toast(message: string, tone: Tone = 'info') {
  useToast.getState().push(tone, message);
}

const toneStyles: Record<Tone, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-slate-800 text-white',
};

export function Toaster() {
  const items = useToast((s) => s.items);
  const remove = useToast((s) => s.remove);

  useEffect(() => {
    const timers = items.map((t) =>
      window.setTimeout(() => remove(t.id), 4000),
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [items, remove]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            'min-w-[240px] rounded-md px-4 py-3 text-sm shadow-lg',
            toneStyles[t.tone],
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
