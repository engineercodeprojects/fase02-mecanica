import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ServicoController } from './servico.controller';
import { ServicoService } from '../application/servico.service';
import { Servico } from '../domain/servico.entity';
import { DuplicateNameError } from '../domain/errors/duplicate-name.error';

const mockServico = Servico.reconstitute({
  id: 'abc-123',
  nome: 'Troca de oleo',
  descricao: 'Troca de oleo com filtro',
  precoBase: 149.9,
  tempoEstimadoHoras: 1.5,
  ativo: true,
});

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ServicoController', () => {
  let controller: ServicoController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicoController],
      providers: [{ provide: ServicoService, useValue: mockService }],
    }).compile();

    controller = module.get<ServicoController>(ServicoController);
  });

  describe('POST /servicos', () => {
    const dto = {
      nome: 'Troca de oleo',
      descricao: 'Troca de oleo com filtro',
      precoBase: 149.9,
      tempoEstimadoHoras: 1.5,
    };

    it('should create and return a servico response', async () => {
      mockService.create.mockResolvedValue(mockServico);

      const result = await controller.create(dto);

      expect(result).toEqual({
        id: 'abc-123',
        nome: 'Troca de oleo',
        descricao: 'Troca de oleo com filtro',
        precoBase: 149.9,
        tempoEstimadoHoras: 1.5,
        ativo: true,
      });
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException on duplicate name', async () => {
      mockService.create.mockRejectedValue(new DuplicateNameError('Troca de oleo'));

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should rethrow non-DuplicateNameError errors', async () => {
      mockService.create.mockRejectedValue(new Error('unexpected'));

      await expect(controller.create(dto)).rejects.toThrow('unexpected');
    });
  });

  describe('GET /servicos', () => {
    it('should return paginated response', async () => {
      mockService.findAll.mockResolvedValue({
        data: [mockServico],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].precoBase).toBe(149.9);
      expect(result.total).toBe(1);
      expect(mockService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        nome: undefined,
      });
    });

    it('should pass nome filter', async () => {
      mockService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await controller.findAll({ page: 1, limit: 10, nome: 'oleo' });

      expect(mockService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        nome: 'oleo',
      });
    });
  });

  describe('GET /servicos/:id', () => {
    it('should return a servico response', async () => {
      mockService.findById.mockResolvedValue(mockServico);

      const result = await controller.findById('abc-123');

      expect(result.id).toBe('abc-123');
      expect(result.nome).toBe('Troca de oleo');
    });

    it('should propagate NotFoundException', async () => {
      mockService.findById.mockRejectedValue(new NotFoundException());

      await expect(controller.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('PATCH /servicos/:id', () => {
    it('should update and return a servico response', async () => {
      const updated = Servico.reconstitute({
        id: 'abc-123',
        nome: 'Troca de oleo sintetico',
        descricao: 'Troca de oleo com filtro',
        precoBase: 199.9,
        tempoEstimadoHoras: 1.5,
        ativo: true,
      });
      mockService.update.mockResolvedValue(updated);

      const result = await controller.update('abc-123', {
        nome: 'Troca de oleo sintetico',
        precoBase: 199.9,
      });

      expect(result.nome).toBe('Troca de oleo sintetico');
      expect(result.precoBase).toBe(199.9);
    });

    it('should throw ConflictException on duplicate name', async () => {
      mockService.update.mockRejectedValue(new DuplicateNameError('Alinhamento'));

      await expect(
        controller.update('abc-123', { nome: 'Alinhamento' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should propagate NotFoundException', async () => {
      mockService.update.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('999', { nome: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /servicos/:id', () => {
    it('should delete a servico', async () => {
      mockService.delete.mockResolvedValue(undefined);

      await controller.delete('abc-123');

      expect(mockService.delete).toHaveBeenCalledWith('abc-123');
    });

    it('should propagate NotFoundException', async () => {
      mockService.delete.mockRejectedValue(new NotFoundException());

      await expect(controller.delete('999')).rejects.toThrow(NotFoundException);
    });
  });
});
