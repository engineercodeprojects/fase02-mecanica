export class DuplicatePlacaError extends Error {
  constructor(placa: string) {
    super(`Ja existe um veiculo com a placa '${placa}'`);
    this.name = "DuplicatePlacaError";
  }
}
