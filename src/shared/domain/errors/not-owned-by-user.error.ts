import { DomainError } from '../domain-error';

/**
 * Lancado quando um recurso e acessado por um usuario que nao
 * eh o "dono" (cliente cujo email bate com o do JWT, etc.).
 *
 * Mapeado para HTTP 403.
 */
export class NotOwnedByUserError extends DomainError {
  constructor(
    public readonly resource: string,
    public readonly identifier: string,
  ) {
    super(
      `Voce nao tem permissao para acessar este(a) ${resource} (${identifier})`,
    );
  }
}
