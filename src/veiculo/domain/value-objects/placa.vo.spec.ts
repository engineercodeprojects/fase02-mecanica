import { InvalidPlacaError } from "../errors/invalid-placa.error";
import { Placa } from "./placa.vo";

describe("Placa (Value Object)", () => {
  // ==================== Formato antigo ====================

  describe("Formato antigo (ABC-1234)", () => {
    it("deve criar uma Placa valida com hifen", () => {
      const placa = new Placa("ABC-1234");
      expect(placa.value).toBe("ABC1234");
    });

    it("deve criar uma Placa valida sem hifen", () => {
      const placa = new Placa("ABC1234");
      expect(placa.value).toBe("ABC1234");
    });

    it("deve aceitar letras minusculas e normalizar para maiusculas", () => {
      const placa = new Placa("abc-1234");
      expect(placa.value).toBe("ABC1234");
    });

    it("deve aceitar placa minuscula sem hifen", () => {
      const placa = new Placa("abc1234");
      expect(placa.value).toBe("ABC1234");
    });
  });

  // ==================== Formato Mercosul ====================

  describe("Formato Mercosul (ABC1D23)", () => {
    it("deve criar uma Placa valida no formato Mercosul", () => {
      const placa = new Placa("ABC1D23");
      expect(placa.value).toBe("ABC1D23");
    });

    it("deve aceitar Mercosul em minusculas e normalizar", () => {
      const placa = new Placa("abc1d23");
      expect(placa.value).toBe("ABC1D23");
    });
  });

  // ==================== Placas invalidas ====================

  describe("Placas invalidas", () => {
    it("deve rejeitar placa com menos caracteres", () => {
      expect(() => new Placa("ABC")).toThrow(InvalidPlacaError);
    });

    it("deve rejeitar placa somente com numeros", () => {
      expect(() => new Placa("1234567")).toThrow(InvalidPlacaError);
    });

    it("deve rejeitar placa somente com letras", () => {
      expect(() => new Placa("ABCDEFG")).toThrow(InvalidPlacaError);
    });

    it("deve rejeitar placa com formato antigo com digitos extras", () => {
      expect(() => new Placa("ABC-12345")).toThrow(InvalidPlacaError);
    });

    it("deve rejeitar placa vazia", () => {
      expect(() => new Placa("")).toThrow(InvalidPlacaError);
    });

    it("deve rejeitar placa com caracteres especiais", () => {
      expect(() => new Placa("AB@-1234")).toThrow(InvalidPlacaError);
    });

    it("deve rejeitar placa com espacos", () => {
      expect(() => new Placa("ABC 1234")).toThrow(InvalidPlacaError);
    });
  });

  // ==================== isValid (metodo estatico) ====================

  describe("isValid", () => {
    it("deve retornar true para formato antigo com hifen", () => {
      expect(Placa.isValid("ABC-1234")).toBe(true);
    });

    it("deve retornar true para formato antigo sem hifen", () => {
      expect(Placa.isValid("ABC1234")).toBe(true);
    });

    it("deve retornar true para formato Mercosul", () => {
      expect(Placa.isValid("ABC1D23")).toBe(true);
    });

    it("deve retornar false para formato invalido", () => {
      expect(Placa.isValid("123")).toBe(false);
    });
  });

  // ==================== equals ====================

  describe("equals", () => {
    it("deve retornar true para placas iguais", () => {
      const a = new Placa("ABC-1234");
      const b = new Placa("ABC1234");
      expect(a.equals(b)).toBe(true);
    });

    it("deve retornar true para placas iguais case-insensitive", () => {
      const a = new Placa("abc-1234");
      const b = new Placa("ABC-1234");
      expect(a.equals(b)).toBe(true);
    });

    it("deve retornar false para placas diferentes", () => {
      const a = new Placa("ABC-1234");
      const b = new Placa("XYZ-9876");
      expect(a.equals(b)).toBe(false);
    });
  });
});
