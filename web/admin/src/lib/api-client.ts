import { useAuthStore } from './auth-store';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  skipAuth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const url = new URL(path, API_URL);
  if (opts.query) {
    for (const [key, value] of Object.entries(opts.query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (!opts.skipAuth) {
    const token = useAuthStore.getState().token;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 401 && !opts.skipAuth) {
    useAuthStore.getState().logout();
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (payload &&
        (Array.isArray(payload.message)
          ? payload.message.join(', ')
          : payload.message)) ||
      `Erro HTTP ${res.status}`;
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}
