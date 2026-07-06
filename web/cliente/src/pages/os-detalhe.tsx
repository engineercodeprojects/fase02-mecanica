import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '@/lib/api-client';
import { toast } from '@/components/toast';
import { formatCurrency, formatDate } from '@/lib/utils';

interface OsStatusServico {
  servicoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  produtos?: OsStatusProduto[];
}

interface OsStatusProduto {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface OsStatusView {
  id: string;
  numero: string;
  status: string;
  descricaoInicial: string;
  diagnostico: string | null;
  servicos: OsStatusServico[];
  valorTotalServicos: number;
  valorTotalProdutos: number;
  valorTotal: number;
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_TONE: Record<string, string> = {
  RECEBIDA: 'bg-blue-100 text-blue-700',
  EM_DIAGNOSTICO: 'bg-violet-100 text-violet-700',
  AGUARDANDO_APROVACAO: 'bg-amber-100 text-amber-700',
  EM_EXECUCAO: 'bg-blue-100 text-blue-700',
  FINALIZADA: 'bg-green-100 text-green-700',
  ENTREGUE: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-red-100 text-red-700',
};

export function OsDetalhePage() {
  const { numero = '' } = useParams<{ numero: string }>();
  const qc = useQueryClient();

  const { data: os, isLoading } = useQuery({
    queryKey: ['os-detalhe', numero],
    queryFn: () =>
      apiRequest<OsStatusView>(
        `/ordens-servico/numero/${numero}/status`,
      ),
    enabled: !!numero,
  });

  const aprovarMut = useMutation({
    mutationFn: () =>
      apiRequest(`/ordens-servico/${os!.id}/aprovar-orcamento`, {
        method: 'POST',
      }),
    onSuccess: () => {
      toast('Orcamento aprovado!', 'success');
      qc.invalidateQueries({ queryKey: ['os-detalhe', numero] });
      qc.invalidateQueries({ queryKey: ['minhas-os'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const rejeitarMut = useMutation({
    mutationFn: () =>
      apiRequest(`/ordens-servico/${os!.id}/rejeitar-orcamento`, {
        method: 'POST',
      }),
    onSuccess: () => {
      toast('Orcamento rejeitado.', 'info');
      qc.invalidateQueries({ queryKey: ['os-detalhe', numero] });
      qc.invalidateQueries({ queryKey: ['minhas-os'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  if (isLoading || !os)
    return <div className="text-slate-500">Carregando...</div>;

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-brand-700 hover:underline">
        ← Voltar
      </Link>

      <div className="rounded-md border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-mono">{os.numero}</p>
            <h1 className="text-xl font-bold">Ordem de servico</h1>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_TONE[os.status] ?? 'bg-slate-100 text-slate-700'}`}
          >
            {os.status}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Atualizada em {formatDate(os.updatedAt)}
        </p>
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Descricao inicial</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
          {os.descricaoInicial}
        </p>
      </section>

      {os.diagnostico && (
        <section className="rounded-md border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Diagnostico do mecanico</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
            {os.diagnostico}
          </p>
        </section>
      )}

      <section className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Servicos e produtos / Orcamento</h2>
        <div className="mt-4 space-y-3">
          {os.servicos.map((s) => (
            <div
              key={s.servicoId}
              className="rounded border border-slate-200 p-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{s.nome}</span>
                <span className="text-slate-700">
                  {s.quantidade} × {formatCurrency(Number(s.precoUnitario))} ={' '}
                  {formatCurrency(s.subtotal)}
                </span>
              </div>
              {(s.produtos ?? []).length > 0 && (
                <table className="mt-3 w-full text-xs text-slate-600">
                  <thead className="text-left uppercase text-slate-400">
                    <tr>
                      <th className="pb-1">Produto</th>
                      <th className="pb-1 text-right">Qtd</th>
                      <th className="pb-1 text-right">Unit.</th>
                      <th className="pb-1 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(s.produtos ?? []).map((p) => (
                      <tr key={p.produtoId}>
                        <td className="py-1">{p.nome}</td>
                        <td className="py-1 text-right">{p.quantidade}</td>
                        <td className="py-1 text-right">
                          {formatCurrency(Number(p.precoUnitario))}
                        </td>
                        <td className="py-1 text-right">
                          {formatCurrency(p.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 text-right text-sm">
          <div>Servicos: {formatCurrency(os.valorTotalServicos)}</div>
          <div>Produtos: {formatCurrency(os.valorTotalProdutos)}</div>
          <div className="text-lg font-semibold">
            Total: {formatCurrency(os.valorTotal)}
          </div>
        </div>
      </section>

      {os.status === 'AGUARDANDO_APROVACAO' && (
        <section className="rounded-md border-2 border-amber-300 bg-amber-50 p-6">
          <h2 className="font-semibold text-amber-900">
            Decida: aprovar ou rejeitar este orcamento
          </h2>
          <p className="mt-2 text-sm text-amber-800">
            Ao aprovar, autorizamos a oficina a iniciar a execucao dos servicos.
            Ao rejeitar, a OS sera cancelada.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={aprovarMut.isPending}
              onClick={() => aprovarMut.mutate()}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {aprovarMut.isPending ? 'Aprovando...' : 'Aprovar orcamento'}
            </button>
            <button
              type="button"
              disabled={rejeitarMut.isPending}
              onClick={() => rejeitarMut.mutate()}
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {rejeitarMut.isPending ? 'Rejeitando...' : 'Rejeitar'}
            </button>
          </div>
        </section>
      )}

      {os.status === 'FINALIZADA' && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
          Seu veiculo esta pronto para retirada!
        </div>
      )}
    </div>
  );
}
