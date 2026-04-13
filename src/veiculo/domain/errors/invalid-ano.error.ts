export class InvalidAnoError extends Error {
  constructor() {
    super("Ano do veiculo deve estar entre 1886 e o ano seguinte ao atual");
    this.name = "InvalidAnoError";
  }
}
