import { type ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore, type Role } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MenuItem {
  to: string;
  label: string;
  roles: Role[];
}

const items: MenuItem[] = [
  { to: '/', label: 'Dashboard', roles: ['ADMIN', 'ATENDENTE', 'MECANICO', 'ESTOQUISTA'] },
  { to: '/ordens-servico', label: 'Ordens de Servico', roles: ['ADMIN', 'ATENDENTE', 'MECANICO'] },
  { to: '/ordens-servico/metricas', label: 'Metricas (tempo medio)', roles: ['ADMIN', 'ATENDENTE'] },
  { to: '/clientes', label: 'Clientes', roles: ['ADMIN', 'ATENDENTE'] },
  { to: '/veiculos', label: 'Veiculos', roles: ['ADMIN', 'ATENDENTE'] },
  { to: '/servicos', label: 'Servicos', roles: ['ADMIN'] },
  { to: '/produtos', label: 'Produtos / Estoque', roles: ['ADMIN', 'ESTOQUISTA'] },
  { to: '/notificacoes', label: 'Notificacoes', roles: ['ADMIN', 'ATENDENTE'] },
  { to: '/usuarios', label: 'Usuarios', roles: ['ADMIN'] },
];

export function AppShell({ children }: { children?: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  const visible = items.filter((i) => i.roles.includes(user.role));

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4">
          <Link to="/" className="text-lg font-bold text-brand-700">
            Oficina · Admin
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {visible.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-700 hover:bg-slate-100',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="text-sm text-slate-500">
            Painel administrativo
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-medium text-slate-900">{user.nome}</div>
              <div className="text-xs text-slate-500">{user.role}</div>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Sair
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
