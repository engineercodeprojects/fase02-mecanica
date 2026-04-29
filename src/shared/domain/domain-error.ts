/**
 * Base class para erros de dominio.
 *
 * Erros de dominio sao tipados (tem `name` proprio) para permitir
 * tratamento especifico no controller (mapeamento HTTP) e em testes
 * (`expect(...).rejects.toThrow(DomainError)`).
 *
 * Distinguem-se de erros de infra (banco fora do ar, timeout, etc.)
 * porque carregam significado de negocio.
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
