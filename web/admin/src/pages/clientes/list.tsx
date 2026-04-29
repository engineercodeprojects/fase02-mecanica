import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import type { Cliente, Paginated } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';

interface FormState {
  id?: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
}

const empty: FormState = {
  nome: '',
  cpfCnpj: '',
  telefone: '',
  email: '',
};

export function ClientesListPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () =>
      apiRequest<Paginated<Cliente>>('/clientes', {
        query: { page: 1, limit: 50 },
      }),
  });

  const createMut = useMutation({
    mutationFn: (input: FormState) =>
      apiRequest('/clientes', {
        method: 'POST',
        body: {
          nome: input.nome,
          cpfCnpj: input.cpfCnpj.replace(/\D/g, ''),
          telefone: input.telefone,
          email: input.email || undefined,
        },
      }),
    onSuccess: () => {
      toast('Cliente cadastrado', 'success');
      qc.invalidateQueries({ queryKey: ['clientes'] });
      setForm(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const updateMut = useMutation({
    mutationFn: (input: FormState) =>
      apiRequest(`/clientes/${input.id}`, {
        method: 'PATCH',
        body: {
          nome: input.nome,
          telefone: input.telefone,
          email: input.email || undefined,
        },
      }),
    onSuccess: () => {
      toast('Cliente atualizado', 'success');
      qc.invalidateQueries({ queryKey: ['clientes'] });
      setForm(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/clientes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('Cliente removido', 'success');
      qc.invalidateQueries({ queryKey: ['clientes'] });
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
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-slate-500">
            {data?.total ?? 0} cliente(s)
          </p>
        </div>
        <Button onClick={() => setForm({ ...empty })}>+ Novo Cliente</Button>
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <div className="text-slate-500">Carregando...</div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Nome</TH>
                  <TH>CPF/CNPJ</TH>
                  <TH>Email</TH>
                  <TH>Telefone</TH>
                  <TH className="text-right">Acoes</TH>
                </TR>
              </THead>
              <TBody>
                {data?.data.map((c) => (
                  <TR key={c.id}>
                    <TD className="font-medium">{c.nome}</TD>
                    <TD>{c.cpfCnpj}</TD>
                    <TD>{c.email ?? '-'}</TD>
                    <TD>{c.telefone}</TD>
                    <TD className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setForm({
                            id: c.id,
                            nome: c.nome,
                            cpfCnpj: c.cpfCnpj,
                            telefone: c.telefone,
                            email: c.email ?? '',
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
                          if (confirm(`Remover ${c.nome}?`))
                            deleteMut.mutate(c.id);
                        }}
                      >
                        Remover
                      </Button>
                    </TD>
                  </TR>
                ))}
                {data?.data.length === 0 && (
                  <TR>
                    <TD colSpan={5} className="py-8 text-center text-slate-500">
                      Nenhum cliente cadastrado
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
        title={form?.id ? 'Editar cliente' : 'Novo cliente'}
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
              <Label>CPF/CNPJ *</Label>
              <Input
                value={form.cpfCnpj}
                onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
                disabled={!!form.id}
                required
                placeholder="apenas digitos"
              />
            </div>
            <div>
              <Label>Telefone *</Label>
              <Input
                value={form.telefone}
                onChange={(e) =>
                  setForm({ ...form, telefone: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
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
