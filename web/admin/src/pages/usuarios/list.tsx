import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import type { Paginated, Usuario } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardBody } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';

interface FormState {
  nome: string;
  email: string;
  senha: string;
  role: Usuario['role'];
}
const empty: FormState = { nome: '', email: '', senha: '', role: 'ATENDENTE' };

export function UsuariosListPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const res = await apiRequest<Usuario[] | Paginated<Usuario>>(
        '/usuario',
      );
      return Array.isArray(res) ? res : res.data;
    },
  });

  const createMut = useMutation({
    mutationFn: (input: FormState) =>
      apiRequest('/usuario', { method: 'POST', body: input }),
    onSuccess: () => {
      toast('Usuario criado', 'success');
      qc.invalidateQueries({ queryKey: ['usuarios'] });
      setForm(null);
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/usuario/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('Usuario removido', 'success');
      qc.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (e: Error) => toast(e.message, 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-slate-500">
            {data?.length ?? 0} usuario(s)
          </p>
        </div>
        <Button onClick={() => setForm({ ...empty })}>+ Novo Usuario</Button>
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
                  <TH>Email</TH>
                  <TH>Role</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Acoes</TH>
                </TR>
              </THead>
              <TBody>
                {data?.map((u) => (
                  <TR key={u.id}>
                    <TD className="font-medium">{u.nome}</TD>
                    <TD>{u.email}</TD>
                    <TD>
                      <Badge tone="purple">{u.role}</Badge>
                    </TD>
                    <TD>
                      <Badge tone={u.ativo ? 'success' : 'neutral'}>
                        {u.ativo ? 'ativo' : 'inativo'}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Remover ${u.nome}?`))
                            deleteMut.mutate(u.id);
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
        title="Novo usuario"
      >
        {form && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate(form);
            }}
            className="space-y-4"
          >
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Senha (min. 6 chars) *</Label>
              <Input
                type="password"
                value={form.senha}
                minLength={6}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Role *</Label>
              <Select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as Usuario['role'] })
                }
              >
                <option value="ADMIN">ADMIN</option>
                <option value="ATENDENTE">ATENDENTE</option>
                <option value="MECANICO">MECANICO</option>
                <option value="ESTOQUISTA">ESTOQUISTA</option>
                <option value="CLIENTE">CLIENTE</option>
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
              <Button type="submit" disabled={createMut.isPending}>
                Criar
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
