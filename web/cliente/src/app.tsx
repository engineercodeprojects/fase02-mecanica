import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/pages/login';
import { MinhasOsPage } from '@/pages/minhas-os';
import { OsDetalhePage } from '@/pages/os-detalhe';
import { NotificacoesPage } from '@/pages/notificacoes';
import { Toaster } from '@/components/toast';
import { useAuthStore } from '@/lib/auth-store';
import { ClienteShell } from '@/components/shell';

function RequireCliente({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'CLIENTE') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-md bg-red-50 p-6 text-red-700">
          Este portal e exclusivo de clientes. Use o painel administrativo.
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireCliente>
              <ClienteShell />
            </RequireCliente>
          }
        >
          <Route index element={<MinhasOsPage />} />
          <Route path="ordens/:numero" element={<OsDetalhePage />} />
          <Route path="notificacoes" element={<NotificacoesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
