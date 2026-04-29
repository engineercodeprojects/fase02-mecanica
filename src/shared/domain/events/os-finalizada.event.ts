import { DomainEvent } from '../domain-event';

/**
 * Evento publicado pelo BC Atendimento quando uma OS eh
 * finalizada (todos os servicos concluidos).
 *
 * Consumido pelo BC Notificacao para alertar o cliente que
 * o veiculo esta pronto para retirada.
 */
export class OsFinalizadaEvent extends DomainEvent {
  static readonly EVENT_NAME = 'os.finalizada';

  constructor(
    public readonly ordemDeServicoId: string,
    public readonly numero: string,
    public readonly clienteId: string,
  ) {
    super();
  }
}
