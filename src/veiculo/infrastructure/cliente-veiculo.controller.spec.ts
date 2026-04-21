import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ClienteVeiculoController } from "./cliente-veiculo.controller";
import { VeiculoService } from "../application/veiculo.service";
import { Veiculo } from "../domain/veiculo.entity";
import { ClienteNotFoundError } from "../domain/errors/cliente-not-found.error";

const mockService = {
  findByClienteId: jest.fn(),
};

describe("ClienteVeiculoController", () => {
  let controller: ClienteVeiculoController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClienteVeiculoController],
      providers: [{ provide: VeiculoService, useValue: mockService }],
    }).compile();

    controller = module.get<ClienteVeiculoController>(ClienteVeiculoController);
  });

  describe("GET /clientes/:clienteId/veiculos", () => {
    it("should return veiculos for a valid cliente", async () => {
      const veiculo = Veiculo.reconstitute({
        id: "veiculo-1",
        placa: "ABC1234",
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2024,
        clienteId: "cliente-1",
        ativo: true,
      });

      mockService.findByClienteId.mockResolvedValue([veiculo]);

      const result = await controller.findByCliente("cliente-1");

      expect(result).toEqual([
        {
          id: "veiculo-1",
          placa: "ABC1234",
          marca: "Toyota",
          modelo: "Corolla",
          ano: 2024,
          clienteId: "cliente-1",
          ativo: true,
        },
      ]);
      expect(mockService.findByClienteId).toHaveBeenCalledWith("cliente-1");
    });

    it("should return empty array when cliente has no veiculos", async () => {
      mockService.findByClienteId.mockResolvedValue([]);

      const result = await controller.findByCliente("cliente-1");

      expect(result).toEqual([]);
    });

    it("should throw NotFoundException when cliente does not exist", async () => {
      mockService.findByClienteId.mockRejectedValue(
        new ClienteNotFoundError("cliente-999"),
      );

      await expect(controller.findByCliente("cliente-999")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should rethrow unknown errors", async () => {
      mockService.findByClienteId.mockRejectedValue(new Error("unexpected"));

      await expect(controller.findByCliente("cliente-1")).rejects.toThrow(
        "unexpected",
      );
    });
  });
});
