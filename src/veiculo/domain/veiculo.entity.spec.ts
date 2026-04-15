import { InvalidPlacaError } from "./errors/invalid-placa.error";
import { MarcaRequiredError } from "./errors/marca-required.error";
import { ModeloRequiredError } from "./errors/modelo-required.error";
import { InvalidAnoError } from "./errors/invalid-ano.error";
import { Veiculo } from "./veiculo.entity";

describe("Veiculo (Entity)", () => {
  const validProps = {
    placa: "ABC1D23",
    marca: "Toyota",
    modelo: "Corolla",
    ano: 2024,
    clienteId: "cliente-uuid-123",
  };

  // ==================== create ====================

  describe("create", () => {
    it("deve criar um Veiculo valido com todos os campos", () => {
      const veiculo = Veiculo.create(validProps);

      expect(veiculo.placa.value).toBe("ABC1D23");
      expect(veiculo.marca).toBe("Toyota");
      expect(veiculo.modelo).toBe("Corolla");
      expect(veiculo.ano).toBe(2024);
      expect(veiculo.clienteId).toBe("cliente-uuid-123");
      expect(veiculo.ativo).toBe(true);
    });

    it("deve criar um Veiculo com placa no formato antigo", () => {
      const veiculo = Veiculo.create({ ...validProps, placa: "ABC-1234" });
      expect(veiculo.placa.value).toBe("ABC1234");
    });

    it("deve criar um Veiculo com placa no formato Mercosul", () => {
      const veiculo = Veiculo.create({ ...validProps, placa: "ABC1D23" });
      expect(veiculo.placa.value).toBe("ABC1D23");
    });

    it("deve lancar InvalidPlacaError quando placa e invalida", () => {
      expect(() => Veiculo.create({ ...validProps, placa: "INVALID" })).toThrow(
        InvalidPlacaError,
      );
    });

    it("deve lancar MarcaRequiredError quando marca e vazia", () => {
      expect(() => Veiculo.create({ ...validProps, marca: "" })).toThrow(
        MarcaRequiredError,
      );
    });

    it("deve lancar MarcaRequiredError quando marca e apenas espacos", () => {
      expect(() => Veiculo.create({ ...validProps, marca: "   " })).toThrow(
        MarcaRequiredError,
      );
    });

    it("deve lancar ModeloRequiredError quando modelo e vazio", () => {
      expect(() => Veiculo.create({ ...validProps, modelo: "" })).toThrow(
        ModeloRequiredError,
      );
    });

    it("deve lancar ModeloRequiredError quando modelo e apenas espacos", () => {
      expect(() => Veiculo.create({ ...validProps, modelo: "   " })).toThrow(
        ModeloRequiredError,
      );
    });

    it("deve lancar InvalidAnoError quando ano e menor que 1886", () => {
      expect(() => Veiculo.create({ ...validProps, ano: 1885 })).toThrow(
        InvalidAnoError,
      );
    });

    it("deve lancar InvalidAnoError quando ano e maior que ano atual + 1", () => {
      const anoFuturo = new Date().getFullYear() + 2;
      expect(() => Veiculo.create({ ...validProps, ano: anoFuturo })).toThrow(
        InvalidAnoError,
      );
    });

    it("deve aceitar ano igual a 1886 (limite inferior)", () => {
      const veiculo = Veiculo.create({ ...validProps, ano: 1886 });
      expect(veiculo.ano).toBe(1886);
    });

    it("deve aceitar ano igual ao ano atual + 1 (limite superior)", () => {
      const anoProximo = new Date().getFullYear() + 1;
      const veiculo = Veiculo.create({ ...validProps, ano: anoProximo });
      expect(veiculo.ano).toBe(anoProximo);
    });
  });

  // ==================== reconstitute ====================

  describe("reconstitute", () => {
    it("deve reconstituir um Veiculo a partir de dados de persistencia", () => {
      const veiculo = Veiculo.reconstitute({
        id: "abc-123",
        placa: "ABC1234",
        marca: "Honda",
        modelo: "Civic",
        ano: 2020,
        clienteId: "cliente-456",
        ativo: false,
      });

      expect(veiculo.id).toBe("abc-123");
      expect(veiculo.placa.value).toBe("ABC1234");
      expect(veiculo.marca).toBe("Honda");
      expect(veiculo.modelo).toBe("Civic");
      expect(veiculo.ano).toBe(2020);
      expect(veiculo.clienteId).toBe("cliente-456");
      expect(veiculo.ativo).toBe(false);
    });

    it("deve reconstituir um Veiculo ativo", () => {
      const veiculo = Veiculo.reconstitute({
        id: "abc-123",
        placa: "ABC1234",
        marca: "Honda",
        modelo: "Civic",
        ano: 2020,
        clienteId: "cliente-456",
        ativo: true,
      });

      expect(veiculo.ativo).toBe(true);
    });
  });

  // ==================== update ====================

  describe("update", () => {
    it("deve atualizar a placa", () => {
      const veiculo = Veiculo.create(validProps);
      veiculo.update({ placa: "XYZ-9876" });
      expect(veiculo.placa.value).toBe("XYZ9876");
    });

    it("deve atualizar a marca", () => {
      const veiculo = Veiculo.create(validProps);
      veiculo.update({ marca: "Honda" });
      expect(veiculo.marca).toBe("Honda");
    });

    it("deve atualizar o modelo", () => {
      const veiculo = Veiculo.create(validProps);
      veiculo.update({ modelo: "Civic" });
      expect(veiculo.modelo).toBe("Civic");
    });

    it("deve atualizar o ano", () => {
      const veiculo = Veiculo.create(validProps);
      veiculo.update({ ano: 2025 });
      expect(veiculo.ano).toBe(2025);
    });

    it("deve atualizar multiplos campos ao mesmo tempo", () => {
      const veiculo = Veiculo.create(validProps);
      veiculo.update({ marca: "Honda", modelo: "Fit", ano: 2023 });

      expect(veiculo.marca).toBe("Honda");
      expect(veiculo.modelo).toBe("Fit");
      expect(veiculo.ano).toBe(2023);
    });

    it("deve lancar InvalidPlacaError ao atualizar com placa invalida", () => {
      const veiculo = Veiculo.create(validProps);
      expect(() => veiculo.update({ placa: "INVALIDA" })).toThrow(
        InvalidPlacaError,
      );
    });

    it("deve lancar MarcaRequiredError ao atualizar com marca vazia", () => {
      const veiculo = Veiculo.create(validProps);
      expect(() => veiculo.update({ marca: "" })).toThrow(MarcaRequiredError);
    });

    it("deve lancar ModeloRequiredError ao atualizar com modelo vazio", () => {
      const veiculo = Veiculo.create(validProps);
      expect(() => veiculo.update({ modelo: "" })).toThrow(ModeloRequiredError);
    });

    it("deve lancar InvalidAnoError ao atualizar com ano invalido", () => {
      const veiculo = Veiculo.create(validProps);
      expect(() => veiculo.update({ ano: 1800 })).toThrow(InvalidAnoError);
    });

    it("nao deve alterar campos nao informados", () => {
      const veiculo = Veiculo.create(validProps);
      veiculo.update({ marca: "Honda" });

      expect(veiculo.placa.value).toBe("ABC1D23");
      expect(veiculo.modelo).toBe("Corolla");
      expect(veiculo.ano).toBe(2024);
    });
  });

  // ==================== deactivate / activate ====================

  describe("deactivate / activate", () => {
    it("deve desativar um veiculo", () => {
      const veiculo = Veiculo.create(validProps);
      veiculo.deactivate();
      expect(veiculo.ativo).toBe(false);
    });

    it("deve ativar um veiculo desativado", () => {
      const veiculo = Veiculo.create(validProps);
      veiculo.deactivate();
      veiculo.activate();
      expect(veiculo.ativo).toBe(true);
    });
  });
});
