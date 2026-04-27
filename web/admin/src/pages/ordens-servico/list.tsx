import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiRequest } from '@/lib/api-client';
import type {
  Cliente,
  OrdemDeServico,
  Paginated,
  Veiculo,
} from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

export function OrdensServicoListPage() {
  const qc = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [descricao, setDescricao] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['ordens-servico'],
    queryFn: () =>
      apiRequest<Paginated<OrdemDeServico>>('/ordens-servico', {
        query: { page: 1, limit: 50 },
      }),
  });

  const { data: clientes } = useQuery({
    queryKey: ['clientes', 'all'],
    queryFn: () =>
      apiRequest<Paginated<Cliente>>('/clientes', {
        query: { page: 1, limit: 100 },
      }),
  });

  const { data: veiculos } = useQuery({
    queryKey: ['veiculos', 'all'],
    queryFn: () =>
      apiRequest<Paginated<Veiculo>>('/veiculos', {
        query: { page: 1, limit: 200 },
      }),
  });

  const veiculosCliente =
    veiculos?.data.filter((v) => v.clienteId === clienteId) ?? [];

  const createMut = useMutation({
    mutationFn: () =>
      apiRequest<OrdemDeServico>('/ordens-servico', {
        method: 'POST',
        body: {
          clienteId,
          veiculoId,
          descricaoInicial: descricao,
        },
      }),
    onSuccess: () => {
      toast('OS criada', 'success');
      qc.invalidateQueries({ queryKey: ['ordens-servico'] });
      setOpenCreate(false);
      setClienteId('');
      setVeiculoId('');
      setDescricao('');
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ordens de Servico</h1>
          <p className="text-sm text-slate-500">{data?.total ?? 0} OS(s)</p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>+ Nova OS</Button>
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div>Carregando...</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Numero</TH>
                  <TH>Status</TH>
                  <TH>Descricao inicial</TH>
                  <TH>Atualizada</TH>
                  <TH className="text-right">Acoes</TH>
                </TR>
              </THead>
              <TBody>
                {data?.data.map((os) => (
                  <TR key={os.id}>
                    <TD className="font-mono text-xs">{os.numero}</TD>
                    <TD>
                      <StatusBadge status={os.status} />
                    </TD>
                    <TD className="max-w-md truncate">
                      {os.descricaoInicial}
                    </TD>
                    <TD>{formatDate(os.updatedAt)}</TD>
                    <TD className="text-right">
                      <Link to={`/ordens-servico/${os.id}`}>
                        <Button size="sm" variant="outline">
                          Detalhes
                        </Button>
                      </Link>
                    </TD>
                  </TR>
                ))}
                {data?.data.length === 0 && (
                  <TR>
                    <TD colSpan={5} className="py-8 text-center text-slate-500">
                      Nenhuma OS aberta
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Nova ordem de servico"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <Label>Cliente *</Label>
            <Select
              value={clienteId}
              onChange={(e) => {
                setClienteId(e.target.value);
                setVeiculoId('');
              }}
              required
            >
              <option value="">Selecione</option>
              {clientes?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.cpfCnpj})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Veiculo *</Label>
            <Select
              value={veiculoId}
              onChange={(e) => setVeiculoId(e.target.value)}
              required
              disabled={!clienteId}
            >
              <option value="">
                {clienteId ? 'Selecione' : 'Escolha um cliente primeiro'}
              </option>
              {veiculosCliente.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.marca} {v.modelo}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Descricao inicial *</Label>
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              minLength={5}
              placeholder="Cliente relata barulho ao frenar..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpenCreate(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              Criar
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
