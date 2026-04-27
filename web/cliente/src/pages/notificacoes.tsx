import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { formatDate } from '@/lib/utils';

interface NotificacaoResponse {
  id: string;
  clienteId: string;
  ordemDeServicoId: string | null;
  tipo: string;
  canal: string;
  destinatario: string;
  assunto: string;
  mensagem: string;
  status: 'PENDENTE' | 'ENVIADA' | 'FALHOU';
  erro: string | null;
  enviadaEm: string | null;
  createdAt: string;
}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const TIPO_LABEL: Record<string, string> = {
  ORCAMENTO_PRONTO: 'Orçamento pronto para aprovação',
  OS_FINALIZADA: 'OS finalizada — veículo pronto',
};

const TIPO_TONE: Record<string, string> = {
  ORCAMENTO_PRONTO: 'bg-amber-100 text-amber-700',
  OS_FINALIZADA: 'bg-green-100 text-green-700',
};

export function NotificacoesPage() {
  const cpfCnpj = useAuthStore((s) => s.cpfCnpj) ?? '';
  const [selected, setSelected] = useState<NotificacaoResponse | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['minhas-notificacoes', cpfCnpj],
    queryFn: () =>
      apiRequest<Paginated<NotificacaoResponse>>(
        `/clientes/${cpfCnpj}/notificacoes`,
        { query: { page: 1, limit: 50 } },
      ),
    enabled: !!cpfCnpj,
    retry: false,
    refetchInterval: 30_000,
  });

  if (!cpfCnpj) {
    return (
      <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-700">
        Voce precisa informar seu CPF/CNPJ para ver suas notificacoes. Volte
        para "Minhas ordens" e preencha o campo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minhas notificacoes</h1>
        <p className="text-sm text-slate-500">
          Mensagens enviadas pela oficina sobre suas ordens de servico
        </p>
      </div>

      {isLoading ? (
        <div className="text-slate-500">Carregando...</div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error instanceof ApiError && error.status === 403
            ? 'Voce so pode consultar notificacoes vinculadas ao seu proprio email cadastrado.'
            : (error as Error).message}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-slate-500">
          Voce ainda nao tem notificacoes.
        </div>
      ) : (
        <div className="space-y-3">
          {data?.data.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelected(n)}
              className="block w-full rounded-md border border-slate-200 bg-white p-4 text-left hover:border-brand-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_TONE[n.tipo] ?? 'bg-slate-100 text-slate-700'}`}
                    >
                      {TIPO_LABEL[n.tipo] ?? n.tipo}
                    </span>
                    {n.status === 'FALHOU' && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        falha no envio
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-medium text-slate-900">{n.assunto}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {n.mensagem}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-slate-400">
                  {formatDate(n.createdAt)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
        >
          <button
            type="button"
            aria-label="Fechar"
            className="fixed inset-0 bg-black/40"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_TONE[selected.tipo] ?? 'bg-slate-100 text-slate-700'}`}
                >
                  {TIPO_LABEL[selected.tipo] ?? selected.tipo}
                </span>
                <h3 className="mt-2 text-lg font-semibold">
                  {selected.assunto}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Recebida em {formatDate(selected.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-slate-900"
                aria-label="Fechar dialogo"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4">
              <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 font-sans text-sm">
                {selected.mensagem}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
