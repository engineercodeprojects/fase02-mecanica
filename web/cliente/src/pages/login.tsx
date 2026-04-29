import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, ApiError } from '@/lib/api-client';
import { useAuthStore, type AuthUser } from '@/lib/auth-store';

interface LoginResponse {
  accessToken: string;
  usuario: AuthUser;
}

export function LoginPage() {
  const [email, setEmail] = useState('cliente@oficina.com');
  const [senha, setSenha] = useState('cliente123');
  const [cpfCnpj, setCpfCnpj] = useState('39053344705');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setCpf = useAuthStore((s) => s.setCpfCnpj);
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, senha },
        skipAuth: true,
      });
      if (data.usuario.role !== 'CLIENTE') {
        setError('Esta conta nao e de cliente. Use o painel administrativo.');
        return;
      }
      setAuth({ token: data.accessToken, user: data.usuario });
      setCpf(cpfCnpj.replace(/\D/g, ''));
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Portal do Cliente
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Acompanhe suas ordens de servico
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              CPF/CNPJ (apenas digitos)
            </label>
            <input
              type="text"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              Necessario para listar suas ordens de servico
            </p>
          </div>
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-brand-600/50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">
          Equipe da oficina? Acesse o{' '}
          <a className="text-brand-600 underline" href="http://localhost:5173">
            painel administrativo
          </a>
        </p>
      </div>
    </div>
  );
}
