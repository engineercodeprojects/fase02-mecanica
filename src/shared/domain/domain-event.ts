/**
 * Base class para eventos de dominio que cruzam bounded contexts.
 *
 * Eventos cross-BC vivem em `src/shared/events/` para evitar
 * que o BC consumidor dependa em compile-time do BC produtor.
 * Ambos dependem do contrato compartilhado (este modulo).
 */
export abstract class DomainEvent {
  /** Identificador unico do tipo do evento (ex: 'os.finalizada') */
  static readonly EVENT_NAME: string;

  /** Timestamp em que o evento foi disparado (UTC) */
  readonly occurredAt: Date;

  constructor() {
    this.occurredAt = new Date();
  }
}
