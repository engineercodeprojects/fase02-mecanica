import { InvalidCpfCnpjError } from "../errors/invalid-cpf-cnpj.error";
import { CpfCnpj } from "./cpf-cnpj.vo";

describe("CpfCnpj (Value Object)", () => {
  // ==================== CPF ====================

  describe("CPF valido", () => {
    it("deve criar um CpfCnpj com CPF valido (somente digitos)", () => {
      const cpfCnpj = new CpfCnpj("52998224725");
      expect(cpfCnpj.value).toBe("52998224725");
    });

    it("deve aceitar CPF formatado e armazenar somente digitos", () => {
      const cpfCnpj = new CpfCnpj("529.982.247-25");
      expect(cpfCnpj.value).toBe("52998224725");
    });

    it("deve identificar como CPF", () => {
      const cpfCnpj = new CpfCnpj("52998224725");
      expect(cpfCnpj.isCpf).toBe(true);
      expect(cpfCnpj.isCnpj).toBe(false);
    });
  });

  describe("CPF invalido", () => {
    it("deve rejeitar CPF com digitos verificadores incorretos (segundo digito errado)", () => {
      expect(() => new CpfCnpj("52998224720")).toThrow(InvalidCpfCnpjError);
    });

    it("deve rejeitar CPF com primeiro digito verificador incorreto", () => {
      // CPF 52998224725 com o primeiro dígito (pos 10) trocado de 2 para 0
      expect(() => new CpfCnpj("52998224705")).toThrow(InvalidCpfCnpjError);
    });

    it("deve aceitar CPF onde resto do primeiro digito eh 10 (vira 0)", () => {
      // CPF 00000000604: primeiros 9 digitos 000000006, soma ponderada=12,
      // resto=(12*10)%11=10 -> vira 0; segundo digito=4
      expect(() => new CpfCnpj("00000000604")).not.toThrow();
      expect(new CpfCnpj("00000000604").value).toBe("00000000604");
    });

    it("deve aceitar CPF onde resto do segundo digito eh 10 (vira 0)", () => {
      // CPF 60000000060: d1=6, demais=0; primeiro digito=6, segundo digito=0
      expect(() => new CpfCnpj("60000000060")).not.toThrow();
      expect(new CpfCnpj("60000000060").value).toBe("60000000060");
    });

    it("deve rejeitar CPF com todos os digitos iguais", () => {
      expect(() => new CpfCnpj("11111111111")).toThrow(InvalidCpfCnpjError);
      expect(() => new CpfCnpj("00000000000")).toThrow(InvalidCpfCnpjError);
      expect(() => new CpfCnpj("99999999999")).toThrow(InvalidCpfCnpjError);
    });

    it("deve rejeitar CPF com tamanho incorreto (menos de 11 digitos)", () => {
      expect(() => new CpfCnpj("1234567")).toThrow(InvalidCpfCnpjError);
    });
  });

  // ==================== CNPJ ====================

  describe("CNPJ valido", () => {
    it("deve criar um CpfCnpj com CNPJ valido (somente digitos)", () => {
      const cpfCnpj = new CpfCnpj("11222333000181");
      expect(cpfCnpj.value).toBe("11222333000181");
    });

    it("deve aceitar CNPJ formatado e armazenar somente digitos", () => {
      const cpfCnpj = new CpfCnpj("11.222.333/0001-81");
      expect(cpfCnpj.value).toBe("11222333000181");
    });

    it("deve identificar como CNPJ", () => {
      const cpfCnpj = new CpfCnpj("11222333000181");
      expect(cpfCnpj.isCpf).toBe(false);
      expect(cpfCnpj.isCnpj).toBe(true);
    });
  });

  describe("CNPJ invalido", () => {
    it("deve rejeitar CNPJ com digitos verificadores incorretos", () => {
      expect(() => new CpfCnpj("11222333000199")).toThrow(InvalidCpfCnpjError);
    });

    it("deve rejeitar CNPJ com primeiro digito verificador incorreto", () => {
      // CNPJ 11222333000181 com pos 13 trocado de 8 para 0
      expect(() => new CpfCnpj("11222333000101")).toThrow(InvalidCpfCnpjError);
    });

    it("deve rejeitar CNPJ com segundo digito verificador incorreto", () => {
      // CNPJ 11222333000181 com pos 14 trocado de 1 para 0
      expect(() => new CpfCnpj("11222333000180")).toThrow(InvalidCpfCnpjError);
    });

    it("deve aceitar CNPJ onde resto do primeiro digito eh menor que 2 (primeiro digito=0)", () => {
      // CNPJ 10000000000307: soma1=11, 11%11=0<2 → dig1=0; dig2=7
      expect(() => new CpfCnpj("10000000000307")).not.toThrow();
      expect(new CpfCnpj("10000000000307").value).toBe("10000000000307");
    });

    it("deve aceitar CNPJ onde resto do segundo digito eh menor que 2 (segundo digito=0)", () => {
      // CNPJ 80000000000040: d1=8, demais base=0; dig1=4, dig2=0 (resto=1<2)
      expect(() => new CpfCnpj("80000000000040")).not.toThrow();
      expect(new CpfCnpj("80000000000040").value).toBe("80000000000040");
    });

    it("deve rejeitar CNPJ com todos os digitos iguais", () => {
      expect(() => new CpfCnpj("11111111111111")).toThrow(InvalidCpfCnpjError);
    });
  });

  // ==================== Geral ====================

  describe("Valores invalidos gerais", () => {
    it("deve rejeitar string vazia", () => {
      expect(() => new CpfCnpj("")).toThrow(InvalidCpfCnpjError);
    });

    it("deve rejeitar valor com tamanho diferente de 11 ou 14", () => {
      expect(() => new CpfCnpj("123")).toThrow(InvalidCpfCnpjError);
      expect(() => new CpfCnpj("123456789012")).toThrow(InvalidCpfCnpjError);
    });
  });

  // ==================== equals ====================

  describe("equals", () => {
    it("deve retornar true para CpfCnpj iguais", () => {
      const a = new CpfCnpj("52998224725");
      const b = new CpfCnpj("529.982.247-25");
      expect(a.equals(b)).toBe(true);
    });

    it("deve retornar false para CpfCnpj diferentes", () => {
      const a = new CpfCnpj("52998224725");
      const b = new CpfCnpj("11222333000181");
      expect(a.equals(b)).toBe(false);
    });
  });
});
