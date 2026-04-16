import { Usuario } from './usuario.entity';

export interface UsuarioRepository {
  findByEmail(email: string): Promise<Usuario | null>;
  findById(id: string): Promise<Usuario | null>;
  create(usuario: Usuario): Promise<Usuario>;
}

export const USUARIO_REPOSITORY = Symbol('UsuarioRepository');
