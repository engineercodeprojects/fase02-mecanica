import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '@/lib/api-client';
import type {
  Cliente,
  OrdemDeServico,
  Paginated,
  Servico,
  Usuario,
  Veiculo,
} from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { formatCurrency, formatDate } from '@/lib/utils';

export function OrdemServicoDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: os, isLoading } = useQuery({
    queryKey: ['ordens-servico', id],
    queryFn: () =>
      apiRequest<OrdemDeServico>(`/ordens-servico/${id}`),
    enabled: !!id,
  });

  const { data: cliente } = useQuery({
    queryKey: ['cliente', os?.clienteId],
    queryFn: () =>
      apiRequest<Cliente>(`/clientes/${os!.clienteId}`),
    enabled: !!os?.clienteId,
  });

  const { data: veiculos } = useQuery({
    queryKey: ['veiculos', 'all'],
    queryFn: () =>
      apiRequest<Paginated<Veiculo>>('/veiculos', {
        query: { page: 1, limit: 200 },
      }),
  });

  const { data: servicos } = useQuery({
    queryKey: ['servicos'],
    queryFn: () =>
      apiRequest<Paginated<Servico>>('/servicos', {
        query: { page: 1, limit: 100 },
      }),
  });

  const { data: usuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => apiRequest<Usuario[] | Paginated<Usuario>>('/usuario'),
  });

  const veiculo = veiculos?.data.find((v) => v.id === os?.veiculoId);
  const servicoNome = (sid: string) =>
    servicos?.data.find((s) => s.id === sid)?.nome ?? sid;

  const mecanicos: Usuario[] = (() => {
    if (!usuarios) return [];
    const arr = Array.isArray(usuarios) ? usuarios : usuarios.data;
    return arr.filter((u) => u.role === 'MECANICO' && u.ativo);
  })();

  const callMutation = (path: string, body?: unknown) =>
    apiRequest<OrdemDeServico>(`/ordens-servico/${id}/${path}`, {
      method: 'POST',
      body,
    });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['ordens-servico', id] });

  const atribuirMut = useMutation({
    mutationFn: (usuarioId: string) =>
      callMutation('atribuir-mecanico', { usuarioId }),
    onSuccess: () => {
      toast('Mecanico atribuido', 'success');
      invalidate();
      qc.invalidateQueries({ queryKey: ['ordens-servico'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const adicionarServicoMut = useMutation({
    mutationFn: (input: { servicoId: string; quantidade: number }) =>
      callMutation('servicos', input),
    onSuccess: () => {
      toast('Servico adicionado', 'success');
      invalidate();
      setShowAddServico(false);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const removerServicoMut = useMutation({
    mutationFn: (servicoId: string) =>
      apiRequest(`/ordens-servico/${id}/servicos/${servicoId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast('Servico removido', 'success');
      invalidate();
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const completarMut = useMutation({
    mutationFn: (diagnostico: string) =>
      callMutation('completar-diagnostico', { diagnostico }),
    onSuccess: () => {
      toast('Diagnostico concluido — orcamento enviado', 'success');
      invalidate();
      qc.invalidateQueries({ queryKey: ['ordens-servico'] });
      setShowDiag(false);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const aprovarMut = useMutation({
    mutationFn: () => callMutation('aprovar-orcamento'),
    onSuccess: () => {
      toast('Orcamento aprovado', 'success');
      invalidate();
      qc.invalidateQueries({ queryKey: ['ordens-servico'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const rejeitarMut = useMutation({
    mutationFn: () => callMutation('rejeitar-orcamento'),
    onSuccess: () => {
      toast('Orcamento rejeitado', 'success');
      invalidate();
      qc.invalidateQueries({ queryKey: ['ordens-servico'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const finalizarMut = useMutation({
    mutationFn: () => callMutation('finalizar-execucao'),
    onSuccess: () => {
      toast('Execucao finalizada', 'success');
      invalidate();
      qc.invalidateQueries({ queryKey: ['ordens-servico'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const entregarMut = useMutation({
    mutationFn: () => callMutation('entregar'),
    onSuccess: () => {
      toast('OS entregue ao cliente', 'success');
      invalidate();
      qc.invalidateQueries({ queryKey: ['ordens-servico'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const [showAddServico, setShowAddServico] = useState(false);
  const [showDiag, setShowDiag] = useState(false);
  const [diagText, setDiagText] = useState('');
  const [novoServicoId, setNovoServicoId] = useState('');
  const [novoServicoQtd, setNovoServicoQtd] = useState(1);

  if (isLoading || !os) {
    return <div className="text-slate-500">Carregando...</div>;
  }

  const total =
    os.itensServico?.reduce(
      (sum, i) => sum + i.quantidade * Number(i.precoUnitario),
      0,
    ) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/ordens-servico"
          className="text-sm text-brand-700 hover:underline"
        >
          ← Voltar
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{os.numero}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
            <StatusBadge status={os.status} />
            <span>Atualizada em {formatDate(os.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardBody className="text-sm">
            <p className="font-medium">{cliente?.nome ?? '-'}</p>
            <p className="text-slate-500">CPF/CNPJ: {cliente?.cpfCnpj}</p>
            <p className="text-slate-500">Email: {cliente?.email ?? '-'}</p>
            <p className="text-slate-500">Telefone: {cliente?.telefone}</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Veiculo</CardTitle>
          </CardHeader>
          <CardBody className="text-sm">
            {veiculo ? (
              <>
                <p className="font-mono text-base">{veiculo.placa}</p>
                <p>
                  {veiculo.marca} {veiculo.modelo} ({veiculo.ano})
                </p>
              </>
            ) : (
              '-'
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descricao inicial</CardTitle>
        </CardHeader>
        <CardBody className="text-sm whitespace-pre-wrap">
          {os.descricaoInicial}
        </CardBody>
      </Card>

      {os.diagnostico && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostico</CardTitle>
          </CardHeader>
          <CardBody className="text-sm whitespace-pre-wrap">
            {os.diagnostico}
          </CardBody>
        </Card>
      )}

      {/* Acoes por status */}
      <Card>
        <CardHeader>
          <CardTitle>Acoes</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-2">
          {os.status === 'RECEBIDA' && (
            <Select
              className="max-w-xs"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) atribuirMut.mutate(e.target.value);
              }}
            >
              <option value="">Atribuir mecanico…</option>
              {mecanicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </Select>
          )}

          {os.status === 'EM_DIAGNOSTICO' && (
            <>
              <Button onClick={() => setShowAddServico(true)}>
                + Servico
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowDiag(true)}
                disabled={(os.itensServico?.length ?? 0) === 0}
                title={
                  (os.itensServico?.length ?? 0) === 0
                    ? 'Adicione pelo menos um servico antes'
                    : ''
                }
              >
                Concluir diagnostico
              </Button>
            </>
          )}

          {os.status === 'AGUARDANDO_APROVACAO' && (
            <>
              <Button
                onClick={() => aprovarMut.mutate()}
                disabled={aprovarMut.isPending}
              >
                Aprovar (em nome do cliente)
              </Button>
              <Button
                variant="danger"
                onClick={() => rejeitarMut.mutate()}
                disabled={rejeitarMut.isPending}
              >
                Rejeitar
              </Button>
            </>
          )}

          {os.status === 'EM_EXECUCAO' && (
            <Button
              onClick={() => finalizarMut.mutate()}
              disabled={finalizarMut.isPending}
            >
              Finalizar execucao
            </Button>
          )}

          {os.status === 'FINALIZADA' && (
            <Button
              onClick={() => entregarMut.mutate()}
              disabled={entregarMut.isPending}
            >
              Confirmar entrega ao cliente
            </Button>
          )}

          {(os.status === 'ENTREGUE' || os.status === 'CANCELADA') && (
            <p className="text-sm text-slate-500">
              OS finalizada — sem acoes disponiveis.
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Servicos</CardTitle>
        </CardHeader>
        <CardBody>
          <Table>
            <THead>
              <TR>
                <TH>Servico</TH>
                <TH className="text-right">Qtd</TH>
                <TH className="text-right">Preco unit.</TH>
                <TH className="text-right">Subtotal</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {(os.itensServico ?? []).map((i) => (
                <TR key={i.servicoId}>
                  <TD>{servicoNome(i.servicoId)}</TD>
                  <TD className="text-right">{i.quantidade}</TD>
                  <TD className="text-right">
                    {formatCurrency(Number(i.precoUnitario))}
                  </TD>
                  <TD className="text-right">
                    {formatCurrency(i.quantidade * Number(i.precoUnitario))}
                  </TD>
                  <TD className="text-right">
                    {os.status === 'EM_DIAGNOSTICO' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => removerServicoMut.mutate(i.servicoId)}
                      >
                        Remover
                      </Button>
                    )}
                  </TD>
                </TR>
              ))}
              {os.itensServico?.length === 0 && (
                <TR>
                  <TD colSpan={5} className="py-6 text-center text-slate-500">
                    Sem servicos adicionados
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
          <div className="mt-4 text-right text-lg font-semibold">
            Total: {formatCurrency(total)}
          </div>
        </CardBody>
      </Card>

      <Dialog
        open={showAddServico}
        onClose={() => setShowAddServico(false)}
        title="Adicionar servico"
        size="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            adicionarServicoMut.mutate({
              servicoId: novoServicoId,
              quantidade: novoServicoQtd,
            });
          }}
          className="space-y-4"
        >
          <div>
            <Label>Servico *</Label>
            <Select
              value={novoServicoId}
              onChange={(e) => setNovoServicoId(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {servicos?.data.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — {formatCurrency(Number(s.precoBase))}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Quantidade *</Label>
            <Input
              type="number"
              min={1}
              value={novoServicoQtd}
              onChange={(e) => setNovoServicoQtd(Number(e.target.value))}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowAddServico(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={adicionarServicoMut.isPending}>
              Adicionar
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={showDiag}
        onClose={() => setShowDiag(false)}
        title="Concluir diagnostico"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            completarMut.mutate(diagText);
          }}
          className="space-y-4"
        >
          <div>
            <Label>Diagnostico *</Label>
            <textarea
              value={diagText}
              onChange={(e) => setDiagText(e.target.value)}
              minLength={5}
              maxLength={1000}
              rows={6}
              required
              className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Descreva o problema diagnosticado..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowDiag(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={completarMut.isPending}>
              Concluir
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
