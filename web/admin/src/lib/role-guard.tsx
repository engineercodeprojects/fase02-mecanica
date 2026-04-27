import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, type Role } from './auth-store';

export function RequireAuth({
  roles,
  children,
}: {
  roles?: Role[];
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === 'CLIENTE') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-md bg-red-50 p-6 text-red-700">
          Este painel e exclusivo da equipe da oficina. Use o portal do cliente.
        </div>
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-md bg-amber-50 p-6 text-amber-700">
          Voce nao tem permissao para acessar esta pagina (role: {user.role}).
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
