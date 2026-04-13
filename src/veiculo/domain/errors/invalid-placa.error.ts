export class InvalidPlacaError extends Error {
  constructor(placa: string) {
    super(
      `Placa '${placa}' possui formato invalido. Use o formato brasileiro antigo (ABC-1234) ou Mercosul (ABC1D23)`,
    );
    this.name = "InvalidPlacaError";
  }
}
