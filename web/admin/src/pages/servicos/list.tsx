import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import type { Paginated, Servico } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { formatCurrency } from '@/lib/utils';

interface FormState {
  id?: string;
  nome: string;
  descricao: string;
  precoBase: number;
  tempoEstimadoHoras: number;
}
const empty: FormState = {
  nome: '',
  descricao: '',
  precoBase: 0,
  tempoEstimadoHoras: 1,
};

export function ServicosListPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['servicos'],
    queryFn: () =>
      apiRequest<Paginated<Servico>>('/servicos', {
        query: { page: 1, limit: 100 },
      }),
  });

  const createMut = useMutation({
    mutationFn: (input: FormState) =>
      apiRequest('/servicos', {
        method: 'POST',
        body: {
          nome: input.nome,
          descricao: input.descricao || undefined,
          precoBase: Number(input.precoBase),
          tempoEstimadoHoras: Number(input.tempoEstimadoHoras),
        },
      }),
    onSuccess: () => {
      toast('Servico cadastrado', 'success');
      qc.invalidateQueries({ queryKey: ['servicos'] });
      setForm(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const updateMut = useMutation({
    mutationFn: (input: FormState) =>
      apiRequest(`/servicos/${input.id}`, {
        method: 'PATCH',
        body: {
          nome: input.nome,
          descricao: input.descricao || undefined,
          precoBase: Number(input.precoBase),
          tempoEstimadoHoras: Number(input.tempoEstimadoHoras),
        },
      }),
    onSuccess: () => {
      toast('Servico atualizado', 'success');
      qc.invalidateQueries({ queryKey: ['servicos'] });
      setForm(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/servicos/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('Servico removido', 'success');
      qc.invalidateQueries({ queryKey: ['servicos'] });
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
          <h1 className="text-2xl font-bold">Servicos</h1>
          <p className="text-sm text-slate-500">
            {data?.total ?? 0} servico(s)
          </p>
        </div>
        <Button onClick={() => setForm({ ...empty })}>+ Novo Servico</Button>
      </div>
      <Card>
        <CardBody>
          {isLoading ? (
            <div>Carregando...</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Nome</TH>
                  <TH>Descricao</TH>
                  <TH className="text-right">Preco</TH>
                  <TH className="text-right">Tempo (h)</TH>
                  <TH className="text-right">Acoes</TH>
                </TR>
              </THead>
              <TBody>
                {data?.data.map((s) => (
                  <TR key={s.id}>
                    <TD className="font-medium">{s.nome}</TD>
                    <TD>{s.descricao ?? '-'}</TD>
                    <TD className="text-right">
                      {formatCurrency(Number(s.precoBase))}
                    </TD>
                    <TD className="text-right">{s.tempoEstimadoHoras}</TD>
                    <TD className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setForm({
                            id: s.id,
                            nome: s.nome,
                            descricao: s.descricao ?? '',
                            precoBase: Number(s.precoBase),
                            tempoEstimadoHoras: s.tempoEstimadoHoras,
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
                          if (confirm(`Remover ${s.nome}?`))
                            deleteMut.mutate(s.id);
                        }}
                      >
                        Remover
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? 'Editar servico' : 'Novo servico'}
      >
        {form && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Descricao</Label>
              <Input
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preco base (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.precoBase}
                  onChange={(e) =>
                    setForm({ ...form, precoBase: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label>Tempo (h) *</Label>
                <Input
                  type="number"
                  step="0.25"
                  value={form.tempoEstimadoHoras}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tempoEstimadoHoras: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
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
