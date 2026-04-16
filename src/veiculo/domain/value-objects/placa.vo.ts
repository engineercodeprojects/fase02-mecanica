import { InvalidPlacaError } from "../errors/invalid-placa.error";

export class Placa {
  readonly value: string;

  // Formato antigo: ABC-1234
  private static readonly PATTERN_ANTIGO = /^[A-Z]{3}-?\d{4}$/;
  // Formato Mercosul: ABC1D23
  private static readonly PATTERN_MERCOSUL = /^[A-Z]{3}\d[A-Z]\d{2}$/;

  constructor(value: string) {
    const normalized = value.toUpperCase().trim();

    if (!Placa.isValid(normalized)) {
      throw new InvalidPlacaError(value);
    }

    // Armazena sem hifen
    this.value = normalized.replace(/-/g, "");
  }

  static isValid(value: string): boolean {
    const normalized = value.toUpperCase().trim();
    return (
      Placa.PATTERN_ANTIGO.test(normalized) ||
      Placa.PATTERN_MERCOSUL.test(normalized)
    );
  }

  equals(other: Placa): boolean {
    return this.value === other.value;
  }
}
