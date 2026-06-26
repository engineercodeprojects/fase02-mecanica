import { StatusOS } from '../value-objects/status-os.vo';

export class OsStatusAlteradoEvent {
  static readonly EVENT_NAME = 'os.status-alterado';

  constructor(
    public readonly ordemDeServicoId: string,
    public readonly numero: string,
    public readonly clienteId: string,
    public readonly statusAnterior: StatusOS,
    public readonly statusAtual: StatusOS,
    public readonly timestamp: Date = new Date(),
  ) {}
}
