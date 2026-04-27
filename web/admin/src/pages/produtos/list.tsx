import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import type { Paginated, Produto } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { formatCurrency } from '@/lib/utils';

interface FormState {
  id?: string;
  nome: string;
  descricao: string;
  precoUnitario: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
}

const empty: FormState = {
  nome: '',
  descricao: '',
  precoUnitario: 0,
  quantidadeEstoque: 0,
  estoqueMinimo: 0,
};

export function ProdutosListPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [estoqueModal, setEstoqueModal] = useState<{
    produto: Produto;
    quantidade: number;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: () =>
      apiRequest<Paginated<Produto>>('/produtos', {
        query: { page: 1, limit: 100 },
      }),
  });

  const createMut = useMutation({
    mutationFn: (input: FormState) =>
      apiRequest('/produtos', {
        method: 'POST',
        body: {
          nome: input.nome,
          descricao: input.descricao || undefined,
          precoUnitario: Number(input.precoUnitario),
          quantidadeEstoque: Number(input.quantidadeEstoque),
          estoqueMinimo: Number(input.estoqueMinimo),
        },
      }),
    onSuccess: () => {
      toast('Produto cadastrado', 'success');
      qc.invalidateQueries({ queryKey: ['produtos'] });
      setForm(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const updateMut = useMutation({
    mutationFn: (input: FormState) =>
      apiRequest(`/produtos/${input.id}`, {
        method: 'PATCH',
        body: {
          nome: input.nome,
          descricao: input.descricao || undefined,
          precoUnitario: Number(input.precoUnitario),
          estoqueMinimo: Number(input.estoqueMinimo),
        },
      }),
    onSuccess: () => {
      toast('Produto atualizado', 'success');
      qc.invalidateQueries({ queryKey: ['produtos'] });
      setForm(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const addStockMut = useMutation({
    mutationFn: ({ id, quantidade }: { id: string; quantidade: number }) =>
      apiRequest(`/produtos/${id}/estoque`, {
        method: 'POST',
        body: { quantidade },
      }),
    onSuccess: () => {
      toast('Estoque atualizado', 'success');
      qc.invalidateQueries({ queryKey: ['produtos'] });
      setEstoqueModal(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/produtos/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('Produto removido', 'success');
      qc.invalidateQueries({ queryKey: ['produtos'] });
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
          <h1 className="text-2xl font-bold">Produtos / Estoque</h1>
          <p className="text-sm text-slate-500">
            {data?.total ?? 0} produto(s)
          </p>
        </div>
        <Button onClick={() => setForm({ ...empty })}>+ Novo Produto</Button>
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
                  <TH className="text-right">Preco</TH>
                  <TH className="text-right">Estoque</TH>
                  <TH className="text-right">Reservado</TH>
                  <TH className="text-right">Min.</TH>
                  <TH className="text-right">Acoes</TH>
                </TR>
              </THead>
              <TBody>
                {data?.data.map((p) => {
                  const baixo = p.quantidadeEstoque <= p.estoqueMinimo;
                  return (
                    <TR key={p.id}>
                      <TD className="font-medium">
                        {p.nome}{' '}
                        {baixo && (
                          <Badge tone="warning" className="ml-2">
                            estoque baixo
                          </Badge>
                        )}
                      </TD>
                      <TD className="text-right">
                        {formatCurrency(Number(p.precoUnitario))}
                      </TD>
                      <TD className="text-right">{p.quantidadeEstoque}</TD>
                      <TD className="text-right">{p.quantidadeReservada}</TD>
                      <TD className="text-right">{p.estoqueMinimo}</TD>
                      <TD className="text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEstoqueModal({ produto: p, quantidade: 0 })
                          }
                        >
                          + Estoque
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2"
                          onClick={() =>
                            setForm({
                              id: p.id,
                              nome: p.nome,
                              descricao: p.descricao ?? '',
                              precoUnitario: Number(p.precoUnitario),
                              quantidadeEstoque: p.quantidadeEstoque,
                              estoqueMinimo: p.estoqueMinimo,
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
                            if (confirm(`Remover ${p.nome}?`))
                              deleteMut.mutate(p.id);
                          }}
                        >
                          Remover
                        </Button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Dialog
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? 'Editar produto' : 'Novo produto'}
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Preco *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.precoUnitario}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      precoUnitario: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label>Estoque inicial *</Label>
                <Input
                  type="number"
                  value={form.quantidadeEstoque}
                  disabled={!!form.id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantidadeEstoque: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label>Estoque min. *</Label>
                <Input
                  type="number"
                  value={form.estoqueMinimo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estoqueMinimo: Number(e.target.value),
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

      <Dialog
        open={estoqueModal !== null}
        onClose={() => setEstoqueModal(null)}
        title="Adicionar ao estoque"
        size="sm"
      >
        {estoqueModal && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addStockMut.mutate({
                id: estoqueModal.produto.id,
                quantidade: estoqueModal.quantidade,
              });
            }}
            className="space-y-4"
          >
            <div className="text-sm text-slate-700">
              <span className="font-medium">{estoqueModal.produto.nome}</span>
              <br />
              Estoque atual: {estoqueModal.produto.quantidadeEstoque}
            </div>
            <div>
              <Label>Quantidade a adicionar *</Label>
              <Input
                type="number"
                min={1}
                value={estoqueModal.quantidade || ''}
                onChange={(e) =>
                  setEstoqueModal({
                    ...estoqueModal,
                    quantidade: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setEstoqueModal(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={addStockMut.isPending}>
                Adicionar
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
