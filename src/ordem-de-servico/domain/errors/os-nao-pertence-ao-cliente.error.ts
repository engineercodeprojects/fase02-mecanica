export class OsNaoPertenceAoClienteError extends Error {
  constructor(ordemId: string) {
    super(
      `Ordem de Servico '${ordemId}' nao pertence ao cliente autenticado`,
    );
    this.name = 'OsNaoPertenceAoClienteError';
  }
}
