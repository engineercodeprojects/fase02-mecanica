import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
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

const STATUS_TONES = {
  ENVIADA: 'success' as const,
  PENDENTE: 'warning' as const,
  FALHOU: 'danger' as const,
};

export function NotificacoesListPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [selected, setSelected] = useState<NotificacaoResponse | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: () =>
      apiRequest<Paginated<NotificacaoResponse>>('/notificacoes', {
        query: { page: 1, limit: 100 },
      }),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.data.filter(
      (n) =>
        (!statusFilter || n.status === statusFilter) &&
        (!tipoFilter || n.tipo === tipoFilter),
    );
  }, [data, statusFilter, tipoFilter]);

  const counts = useMemo(() => {
    const c = { ENVIADA: 0, PENDENTE: 0, FALHOU: 0 };
    data?.data.forEach((n) => {
      c[n.status] = (c[n.status] ?? 0) + 1;
    });
    return c;
  }, [data]);

  const tiposUnicos = useMemo(() => {
    const set = new Set(data?.data.map((n) => n.tipo) ?? []);
    return Array.from(set);
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notificacoes</h1>
        <p className="text-sm text-slate-500">
          Historico de notificacoes enviadas aos clientes
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <div className="text-3xl font-bold text-green-600">
              {counts.ENVIADA}
            </div>
            <Badge tone="success" className="mt-2">
              ENVIADA
            </Badge>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-3xl font-bold text-amber-600">
              {counts.PENDENTE}
            </div>
            <Badge tone="warning" className="mt-2">
              PENDENTE
            </Badge>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-3xl font-bold text-red-600">
              {counts.FALHOU}
            </div>
            <Badge tone="danger" className="mt-2">
              FALHOU
            </Badge>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historico ({filtered.length})</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Status
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-48"
              >
                <option value="">Todos</option>
                <option value="ENVIADA">ENVIADA</option>
                <option value="PENDENTE">PENDENTE</option>
                <option value="FALHOU">FALHOU</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Tipo
              </label>
              <Select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="w-64"
              >
                <option value="">Todos</option>
                {tiposUnicos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-slate-500">Carregando...</div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
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
                {filtered.map((n) => (
                  <TR
                    key={n.id}
                    onClick={() => setSelected(n)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <TD>{formatDate(n.createdAt)}</TD>
                    <TD>
                      <Badge tone="info">{n.tipo}</Badge>
                    </TD>
                    <TD>{n.canal}</TD>
                    <TD className="font-mono text-xs">{n.destinatario}</TD>
                    <TD className="max-w-md truncate">{n.assunto}</TD>
                    <TD>
                      <Badge tone={STATUS_TONES[n.status]}>{n.status}</Badge>
                    </TD>
                  </TR>
                ))}
                {filtered.length === 0 && (
                  <TR>
                    <TD colSpan={6} className="py-8 text-center text-slate-500">
                      {data?.data.length === 0
                        ? 'Nenhuma notificacao registrada'
                        : 'Nenhuma notificacao corresponde aos filtros'}
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Detalhes da notificacao"
        size="lg"
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-medium text-slate-500">Tipo</div>
                <Badge tone="info">{selected.tipo}</Badge>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">Status</div>
                <Badge tone={STATUS_TONES[selected.status]}>
                  {selected.status}
                </Badge>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">Canal</div>
                <div>{selected.canal}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Destinatario
                </div>
                <div className="font-mono text-xs">{selected.destinatario}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Criada em
                </div>
                <div>{formatDate(selected.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Enviada em
                </div>
                <div>{formatDate(selected.enviadaEm)}</div>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Assunto</div>
              <div className="font-medium">{selected.assunto}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Mensagem</div>
              <pre className="mt-1 whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-sans text-xs">
                {selected.mensagem}
              </pre>
            </div>
            {selected.erro && (
              <div>
                <div className="text-xs font-medium text-red-600">Erro</div>
                <pre className="mt-1 whitespace-pre-wrap rounded-md bg-red-50 p-3 font-mono text-xs text-red-700">
                  {selected.erro}
                </pre>
              </div>
            )}
            {selected.ordemDeServicoId && (
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Ordem de servico
                </div>
                <div className="font-mono text-xs">
                  {selected.ordemDeServicoId}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
