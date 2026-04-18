import { Usuario } from '../../auth/domain/usuario.entity';

export interface FindAllParams {
  page?: number;
  limit?: number;
  role?: string;
  ativo?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface UsuarioRepository {
  findByEmail(email: string): Promise<Usuario | null>;
  findById(id: string): Promise<Usuario | null>;
  create(usuario: Usuario): Promise<Usuario>;
  findAll(params: FindAllParams): Promise<PaginatedResult<Usuario>>;
  update(usuario: Usuario): Promise<Usuario>;
  delete(id: string): Promise<void>;
}

export const USUARIO_REPOSITORY = Symbol('UsuarioRepository');
