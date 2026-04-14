export class InsufficientStockError extends Error {
  constructor(nome: string, requested: number, available: number) {
    super(`Estoque insuficiente para '${nome}': solicitado ${requested}, disponivel ${available}`);
    this.name = 'InsufficientStockError';
  }
}
