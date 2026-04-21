import { Test, TestingModule } from "@nestjs/testing";
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { VeiculoController } from "./veiculo.controller";
import { VeiculoService } from "../application/veiculo.service";
import { Veiculo } from "../domain/veiculo.entity";
import { DuplicatePlacaError } from "../domain/errors/duplicate-placa.error";
import { InvalidPlacaError } from "../domain/errors/invalid-placa.error";
import { ClienteNotFoundError } from "../domain/errors/cliente-not-found.error";

const mockVeiculo = Veiculo.reconstitute({
  id: "abc-123",
  placa: "ABC1D23",
  marca: "Toyota",
  modelo: "Corolla",
  ano: 2024,
  clienteId: "cliente-uuid-123",
  ativo: true,
});

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe("VeiculoController", () => {
  let controller: VeiculoController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeiculoController],
      providers: [{ provide: VeiculoService, useValue: mockService }],
    }).compile();

    controller = module.get<VeiculoController>(VeiculoController);
  });

  // ==================== POST /veiculos ====================

  describe("POST /veiculos", () => {
    const dto = {
      placa: "ABC1D23",
      marca: "Toyota",
      modelo: "Corolla",
      ano: 2024,
      clienteId: "cliente-uuid-123",
    };

    it("deve criar e retornar o response do veiculo", async () => {
      mockService.create.mockResolvedValue(mockVeiculo);

      const result = await controller.create(dto);

      expect(result).toEqual({
        id: "abc-123",
        placa: "ABC1D23",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2024,
        clienteId: "cliente-uuid-123",
        ativo: true,
      });
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it("deve lancar ConflictException para placa duplicada", async () => {
      mockService.create.mockRejectedValue(
        new DuplicatePlacaError("ABC1D23"),
      );

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });

    it("deve lancar BadRequestException para placa invalida", async () => {
      mockService.create.mockRejectedValue(new InvalidPlacaError("INVALID"));

      await expect(controller.create(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("deve lancar NotFoundException quando cliente nao existe", async () => {
      mockService.create.mockRejectedValue(
        new ClienteNotFoundError("cliente-uuid-123"),
      );

      await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
    });

    it("deve relancar erros nao tratados", async () => {
      mockService.create.mockRejectedValue(new Error("erro inesperado"));

      await expect(controller.create(dto)).rejects.toThrow("erro inesperado");
    });
  });

  // ==================== GET /veiculos ====================

  describe("GET /veiculos", () => {
    it("deve retornar lista paginada", async () => {
      mockService.findAll.mockResolvedValue({
        data: [mockVeiculo],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].placa).toBe("ABC1D23");
      expect(result.total).toBe(1);
      expect(mockService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        marca: undefined,
      });
    });

    it("deve passar filtro de marca", async () => {
      mockService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll({ page: 1, limit: 10, marca: "Toyota" });

      expect(mockService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        marca: "Toyota",
      });
    });

    it("deve usar paginacao padrao quando page e limit sao undefined", async () => {
      mockService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll({});

      expect(mockService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10 }),
      );
    });
  });

  // ==================== GET /veiculos/:id ====================

  describe("GET /veiculos/:id", () => {
    it("deve retornar o response do veiculo", async () => {
      mockService.findById.mockResolvedValue(mockVeiculo);

      const result = await controller.findById("abc-123");

      expect(result.id).toBe("abc-123");
      expect(result.placa).toBe("ABC1D23");
      expect(result.marca).toBe("Toyota");
    });

    it("deve propagar NotFoundException", async () => {
      mockService.findById.mockRejectedValue(new NotFoundException());

      await expect(controller.findById("999")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ==================== PATCH /veiculos/:id ====================

  describe("PATCH /veiculos/:id", () => {
    it("deve atualizar e retornar o response do veiculo", async () => {
      const updated = Veiculo.reconstitute({
        id: "abc-123",
        placa: "XYZ9876",
        marca: "Honda",
        modelo: "Civic",
        ano: 2025,
        clienteId: "cliente-uuid-123",
        ativo: true,
      });
      mockService.update.mockResolvedValue(updated);

      const result = await controller.update("abc-123", {
        placa: "XYZ-9876",
        marca: "Honda",
        modelo: "Civic",
        ano: 2025,
      });

      expect(result.placa).toBe("XYZ9876");
      expect(result.marca).toBe("Honda");
      expect(result.modelo).toBe("Civic");
      expect(result.ano).toBe(2025);
    });

    it("deve lancar ConflictException para placa duplicada", async () => {
      mockService.update.mockRejectedValue(
        new DuplicatePlacaError("XYZ-9876"),
      );

      await expect(
        controller.update("abc-123", { placa: "XYZ-9876" }),
      ).rejects.toThrow(ConflictException);
    });

    it("deve lancar BadRequestException para placa invalida", async () => {
      mockService.update.mockRejectedValue(new InvalidPlacaError("INVALIDA"));

      await expect(
        controller.update("abc-123", { placa: "INVALIDA" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("deve propagar NotFoundException", async () => {
      mockService.update.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update("999", { marca: "X" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== DELETE /veiculos/:id ====================

  describe("DELETE /veiculos/:id", () => {
    it("deve deletar um veiculo", async () => {
      mockService.delete.mockResolvedValue(undefined);

      await controller.delete("abc-123");

      expect(mockService.delete).toHaveBeenCalledWith("abc-123");
    });

    it("deve propagar NotFoundException", async () => {
      mockService.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.delete("999")).rejects.toThrow(NotFoundException);
    });
  });
});
