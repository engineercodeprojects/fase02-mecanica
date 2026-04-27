import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import type { Cliente, Paginated, Veiculo } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';

interface FormState {
  id?: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  clienteId: string;
}

const empty: FormState = {
  placa: '',
  marca: '',
  modelo: '',
  ano: new Date().getFullYear(),
  clienteId: '',
};

export function VeiculosListPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);

  const { data: veiculos, isLoading } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () =>
      apiRequest<Paginated<Veiculo>>('/veiculos', {
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

  const clienteNome = (id: string) =>
    clientes?.data.find((c) => c.id === id)?.nome ?? '-';

  const createMut = useMutation({
    mutationFn: (input: FormState) =>
      apiRequest('/veiculos', {
        method: 'POST',
        body: {
          placa: input.placa.toUpperCase(),
          marca: input.marca,
          modelo: input.modelo,
          ano: Number(input.ano),
          clienteId: input.clienteId,
        },
      }),
    onSuccess: () => {
      toast('Veiculo cadastrado', 'success');
      qc.invalidateQueries({ queryKey: ['veiculos'] });
      setForm(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const updateMut = useMutation({
    mutationFn: (input: FormState) =>
      apiRequest(`/veiculos/${input.id}`, {
        method: 'PATCH',
        body: {
          marca: input.marca,
          modelo: input.modelo,
          ano: Number(input.ano),
        },
      }),
    onSuccess: () => {
      toast('Veiculo atualizado', 'success');
      qc.invalidateQueries({ queryKey: ['veiculos'] });
      setForm(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/veiculos/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('Veiculo removido', 'success');
      qc.invalidateQueries({ queryKey: ['veiculos'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (form.id) updateMut.mutate(form);
    else createMut.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Veiculos</h1>
          <p className="text-sm text-slate-500">
            {veiculos?.total ?? 0} veiculo(s)
          </p>
        </div>
        <Button onClick={() => setForm({ ...empty })}>+ Novo Veiculo</Button>
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="text-slate-500">Carregando...</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Placa</TH>
                  <TH>Marca / Modelo</TH>
                  <TH>Ano</TH>
                  <TH>Cliente</TH>
                  <TH className="text-right">Acoes</TH>
                </TR>
              </THead>
              <TBody>
                {veiculos?.data.map((v) => (
                  <TR key={v.id}>
                    <TD className="font-mono">{v.placa}</TD>
                    <TD>
                      {v.marca} {v.modelo}
                    </TD>
                    <TD>{v.ano}</TD>
                    <TD>{clienteNome(v.clienteId)}</TD>
                    <TD className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setForm({
                            id: v.id,
                            placa: v.placa,
                            marca: v.marca,
                            modelo: v.modelo,
                            ano: v.ano,
                            clienteId: v.clienteId,
                          })
                        }
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-2 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Remover veiculo ${v.placa}?`))
                            deleteMut.mutate(v.id);
                        }}
                      >
                        Remover
                      </Button>
                    </TD>
                  </TR>
                ))}
                {veiculos?.data.length === 0 && (
                  <TR>
                    <TD colSpan={5} className="py-8 text-center text-slate-500">
                      Nenhum veiculo cadastrado
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? 'Editar veiculo' : 'Novo veiculo'}
      >
        {form && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Placa *</Label>
              <Input
                value={form.placa}
                onChange={(e) => setForm({ ...form, placa: e.target.value })}
                disabled={!!form.id}
                required
                placeholder="ABC1D23"
              />
            </div>
            <div>
              <Label>Marca *</Label>
              <Input
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Modelo *</Label>
              <Input
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Ano *</Label>
              <Input
                type="number"
                value={form.ano}
                onChange={(e) =>
                  setForm({ ...form, ano: Number(e.target.value) })
                }
                required
              />
            </div>
            <div>
              <Label>Cliente *</Label>
              <Select
                value={form.clienteId}
                disabled={!!form.id}
                onChange={(e) =>
                  setForm({ ...form, clienteId: e.target.value })
                }
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
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setForm(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMut.isPending || updateMut.isPending}
              >
                Salvar
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
