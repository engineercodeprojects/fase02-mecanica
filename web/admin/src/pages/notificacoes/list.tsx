import { useQuery } from '@tanstack/react-query';
import { apiRequest, ApiError } from '@/lib/api-client';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

export function NotificacoesListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: () =>
      apiRequest<Paginated<NotificacaoResponse>>('/notificacoes', {
        query: { page: 1, limit: 50 },
      }),
    retry: false,
  });

  const notFound =
    error instanceof ApiError && (error.status === 404 || error.status === 400);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notificacoes</h1>
        <p className="text-sm text-slate-500">
          Historico de notificacoes enviadas aos clientes
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ultimas notificacoes</CardTitle>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div>Carregando...</div>
          ) : notFound ? (
            <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-700">
              Modulo de notificacoes ainda nao esta ativo nesta API. Quando a
              US-20 for mergeada, o historico aparece aqui.
            </div>
          ) : error ? (
            <div className="text-red-600 text-sm">
              {(error as Error).message}
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Quando</TH>
                  <TH>Tipo</TH>
                  <TH>Canal</TH>
                  <TH>Destinatario</TH>
                  <TH>Assunto</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {data?.data.map((n) => (
                  <TR key={n.id}>
                    <TD>{formatDate(n.createdAt)}</TD>
                    <TD>
                      <Badge tone="info">{n.tipo}</Badge>
                    </TD>
                    <TD>{n.canal}</TD>
                    <TD className="font-mono text-xs">{n.destinatario}</TD>
                    <TD className="max-w-md truncate">{n.assunto}</TD>
                    <TD>
                      <Badge
                        tone={
                          n.status === 'ENVIADA'
                            ? 'success'
                            : n.status === 'FALHOU'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {n.status}
                      </Badge>
                    </TD>
                  </TR>
                ))}
                {data?.data.length === 0 && (
                  <TR>
                    <TD colSpan={6} className="py-8 text-center text-slate-500">
                      Nenhuma notificacao registrada
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
