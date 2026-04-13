import { VeiculoService } from "./veiculo.service";
import {
  VeiculoRepository,
  VEICULO_REPOSITORY,
} from "../domain/veiculo.repository";
import { Veiculo } from "../domain/veiculo.entity";
import { DuplicatePlacaError } from "../domain/errors/duplicate-placa.error";
import { ClienteNotFoundError } from "../domain/errors/cliente-not-found.error";
import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ClienteService } from "../../cliente/application/cliente.service";

const mockRepository: jest.Mocked<VeiculoRepository> = {
  existsByPlaca: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByClienteId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockClienteService = {
  findById: jest.fn(),
};

describe("VeiculoService", () => {
  let service: VeiculoService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VeiculoService,
        { provide: VEICULO_REPOSITORY, useValue: mockRepository },
        { provide: ClienteService, useValue: mockClienteService },
      ],
    }).compile();

    service = module.get<VeiculoService>(VeiculoService);
  });

  // ==================== create ====================

  describe("create", () => {
    const input = {
      placa: "ABC1D23",
      marca: "Toyota",
      modelo: "Corolla",
      ano: 2024,
      clienteId: "cliente-uuid-123",
    };

    it("deve criar um Veiculo com sucesso", async () => {
      mockClienteService.findById.mockResolvedValue({});
      mockRepository.existsByPlaca.mockResolvedValue(false);
      mockRepository.create.mockImplementation(async (v) =>
        Veiculo.reconstitute({
          id: "generated-id",
          placa: v.placa.value,
          marca: v.marca,
          modelo: v.modelo,
          ano: v.ano,
          clienteId: v.clienteId,
          ativo: v.ativo,
        }),
      );

      const result = await service.create(input);

      expect(result.id).toBe("generated-id");
      expect(result.placa.value).toBe("ABC1D23");
      expect(result.marca).toBe("Toyota");
      expect(mockClienteService.findById).toHaveBeenCalledWith(
        "cliente-uuid-123",
      );
      expect(mockRepository.existsByPlaca).toHaveBeenCalledWith("ABC1D23");
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it("deve lancar ClienteNotFoundError quando cliente nao existe", async () => {
      mockClienteService.findById.mockRejectedValue(
        new NotFoundException("Cliente nao encontrado"),
      );

      await expect(service.create(input)).rejects.toThrow(
        ClienteNotFoundError,
      );
      expect(mockRepository.existsByPlaca).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("deve lancar DuplicatePlacaError quando placa ja existe", async () => {
      mockClienteService.findById.mockResolvedValue({});
      mockRepository.existsByPlaca.mockResolvedValue(true);

      await expect(service.create(input)).rejects.toThrow(DuplicatePlacaError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  // ==================== findAll ====================

  describe("findAll", () => {
    it("deve retornar resultados paginados", async () => {
      const veiculo = Veiculo.reconstitute({
        id: "1",
        placa: "ABC1234",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2024,
        clienteId: "cliente-1",
        ativo: true,
      });

      mockRepository.findAll.mockResolvedValue({
        data: [veiculo],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });

    it("deve passar filtro de marca para o repository", async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await service.findAll({ page: 1, limit: 10, marca: "Toyota" });

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        marca: "Toyota",
      });
    });

    it("deve passar filtro de clienteId para o repository", async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await service.findAll({
        page: 1,
        limit: 10,
        clienteId: "cliente-1",
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        clienteId: "cliente-1",
      });
    });
  });

  // ==================== findById ====================

  describe("findById", () => {
    it("deve retornar um Veiculo", async () => {
      const veiculo = Veiculo.reconstitute({
        id: "1",
        placa: "ABC1234",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2024,
        clienteId: "cliente-1",
        ativo: true,
      });

      mockRepository.findById.mockResolvedValue(veiculo);

      const result = await service.findById("1");
      expect(result.marca).toBe("Toyota");
    });

    it("deve lancar NotFoundException quando nao encontrado", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById("999")).rejects.toThrow(NotFoundException);
    });
  });

  // ==================== findByClienteId ====================

  describe("findByClienteId", () => {
    it("deve retornar veiculos de um cliente", async () => {
      mockClienteService.findById.mockResolvedValue({});

      const veiculo = Veiculo.reconstitute({
        id: "1",
        placa: "ABC1234",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2024,
        clienteId: "cliente-1",
        ativo: true,
      });

      mockRepository.findByClienteId.mockResolvedValue([veiculo]);

      const result = await service.findByClienteId("cliente-1");

      expect(result).toHaveLength(1);
      expect(result[0].placa.value).toBe("ABC1234");
      expect(mockClienteService.findById).toHaveBeenCalledWith("cliente-1");
      expect(mockRepository.findByClienteId).toHaveBeenCalledWith("cliente-1");
    });

    it("deve retornar array vazio quando cliente nao tem veiculos", async () => {
      mockClienteService.findById.mockResolvedValue({});
      mockRepository.findByClienteId.mockResolvedValue([]);

      const result = await service.findByClienteId("cliente-1");

      expect(result).toEqual([]);
    });

    it("deve lancar ClienteNotFoundError quando cliente nao existe", async () => {
      mockClienteService.findById.mockRejectedValue(
        new NotFoundException("Cliente nao encontrado"),
      );

      await expect(service.findByClienteId("cliente-999")).rejects.toThrow(
        ClienteNotFoundError,
      );
      expect(mockRepository.findByClienteId).not.toHaveBeenCalled();
    });
  });

  // ==================== update ====================

  describe("update", () => {
    const existing = Veiculo.reconstitute({
      id: "1",
      placa: "ABC1234",
      marca: "Toyota",
      modelo: "Corolla",
      ano: 2024,
      clienteId: "cliente-1",
      ativo: true,
    });

    it("deve atualizar um Veiculo", async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.existsByPlaca.mockResolvedValue(false);
      mockRepository.update.mockImplementation(async (v) => v);

      const result = await service.update("1", {
        placa: "XYZ-9876",
        marca: "Honda",
      });

      expect(result.placa.value).toBe("XYZ9876");
      expect(result.marca).toBe("Honda");
    });

    it("deve lancar NotFoundException quando veiculo nao encontrado", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update("999", { marca: "X" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("deve lancar DuplicatePlacaError quando nova placa ja existe", async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.existsByPlaca.mockResolvedValue(true);

      await expect(
        service.update("1", { placa: "DEF-5678" }),
      ).rejects.toThrow(DuplicatePlacaError);
    });

    it("deve pular verificacao de duplicidade quando placa nao e alterada", async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.update.mockImplementation(async (v) => v);

      await service.update("1", { marca: "Honda" });

      expect(mockRepository.existsByPlaca).not.toHaveBeenCalled();
    });
  });

  // ==================== delete ====================

  describe("delete", () => {
    it("deve deletar um Veiculo", async () => {
      mockRepository.findById.mockResolvedValue(
        Veiculo.reconstitute({
          id: "1",
          placa: "ABC1234",
          marca: "Toyota",
          modelo: "Corolla",
          ano: 2024,
          clienteId: "cliente-1",
          ativo: true,
        }),
      );
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete("1");

      expect(mockRepository.delete).toHaveBeenCalledWith("1");
    });

    it("deve lancar NotFoundException quando veiculo nao encontrado", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete("999")).rejects.toThrow(NotFoundException);
    });
  });
});
