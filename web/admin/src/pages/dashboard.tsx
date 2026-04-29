import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import type { OrdemDeServico, Paginated, StatusOS } from '@/lib/api/types';
import { Card, CardBody } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';

const STATUS_LIST: StatusOS[] = [
  'RECEBIDA',
  'EM_DIAGNOSTICO',
  'AGUARDANDO_APROVACAO',
  'EM_EXECUCAO',
  'FINALIZADA',
  'ENTREGUE',
  'CANCELADA',
];

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['ordens-servico', 'dashboard'],
    queryFn: () =>
      apiRequest<Paginated<OrdemDeServico>>('/ordens-servico', {
        query: { page: 1, limit: 100 },
      }),
  });

  const counts = STATUS_LIST.reduce<Record<string, number>>((acc, s) => {
    acc[s] = data?.data.filter((o) => o.status === s).length ?? 0;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Visao geral das ordens de servico ativas
        </p>
      </div>
      {isLoading ? (
        <div className="text-slate-500">Carregando...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATUS_LIST.map((status) => (
            <Card key={status}>
              <CardBody>
                <div className="text-3xl font-bold text-slate-900">
                  {counts[status]}
                </div>
                <div className="mt-2">
                  <StatusBadge status={status} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
