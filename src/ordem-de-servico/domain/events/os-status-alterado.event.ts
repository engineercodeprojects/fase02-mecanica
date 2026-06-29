import { DomainEvent } from '../../../shared/domain/domain-event';
import { StatusOS } from '../value-objects/status-os.vo';

export class OsStatusAlteradoEvent implements DomainEvent {
  static readonly EVENT_NAME = 'os.status-alterado';
  readonly eventName = OsStatusAlteradoEvent.EVENT_NAME;

  constructor(
    public readonly ordemDeServicoId: string,
    public readonly numero: string,
    public readonly clienteId: string,
    public readonly statusAnterior: StatusOS,
    public readonly statusAtual: StatusOS,
    public readonly timestamp: Date = new Date(),
  ) {}
}
