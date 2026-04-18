export class UsuarioNotFoundError extends Error {
  constructor(id: string) {
    super(`Usuario com ID ${id} não encontrado`);
    this.name = 'UsuarioNotFoundError';
  }
}
