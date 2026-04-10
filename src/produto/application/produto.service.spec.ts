import { ProdutoService } from './produto.service';
import { ProdutoRepository, PRODUTO_REPOSITORY } from '../domain/produto.repository';
import { Produto } from '../domain/produto.entity';
import { DuplicateNameError } from '../domain/errors/duplicate-name.error';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

const mockRepository: jest.Mocked<ProdutoRepository> = {
  existsByNome: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ProdutoService', () => {
  let service: ProdutoService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutoService,
        { provide: PRODUTO_REPOSITORY, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ProdutoService>(ProdutoService);
  });

  describe('create', () => {
    const input = {
      nome: 'Filtro de oleo',
      descricao: 'Filtro para motor',
      precoUnitario: 29.9,
      quantidadeEstoque: 50,
      estoqueMinimo: 10,
    };

    it('should create a Produto', async () => {
      mockRepository.existsByNome.mockResolvedValue(false);
      mockRepository.create.mockImplementation(async (p) =>
        Produto.reconstitute({
          id: 'generated-id',
          nome: p.nome,
          descricao: p.descricao ?? null,
          precoUnitario: p.precoUnitario.value,
          quantidadeEstoque: p.quantidadeEstoque,
          quantidadeReservada: p.quantidadeReservada,
          estoqueMinimo: p.estoqueMinimo,
          ativo: p.ativo,
        }),
      );

      const result = await service.create(input);

      expect(result.id).toBe('generated-id');
      expect(result.nome).toBe('Filtro de oleo');
      expect(mockRepository.existsByNome).toHaveBeenCalledWith('Filtro de oleo');
    });

    it('should throw DuplicateNameError when nome already exists', async () => {
      mockRepository.existsByNome.mockResolvedValue(true);
      await expect(service.create(input)).rejects.toThrow(DuplicateNameError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockRepository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.total).toBe(0);
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should pass nome filter', async () => {
      mockRepository.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });
      await service.findAll({ page: 1, limit: 10, nome: 'filtro' });
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, nome: 'filtro' });
    });
  });

  describe('findById', () => {
    it('should return a Produto', async () => {
      const produto = Produto.reconstitute({
        id: '1', nome: 'Filtro', descricao: null, precoUnitario: 30,
        quantidadeEstoque: 50, quantidadeReservada: 0, estoqueMinimo: 10, ativo: true,
      });
      mockRepository.findById.mockResolvedValue(produto);

      const result = await service.findById('1');
      expect(result.nome).toBe('Filtro');
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const existing = Produto.reconstitute({
      id: '1', nome: 'Filtro', descricao: null, precoUnitario: 30,
      quantidadeEstoque: 50, quantidadeReservada: 0, estoqueMinimo: 10, ativo: true,
    });

    it('should update a Produto', async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.existsByNome.mockResolvedValue(false);
      mockRepository.update.mockImplementation(async (p) => p);

      const result = await service.update('1', { nome: 'Filtro premium', precoUnitario: 49.9 });
      expect(result.nome).toBe('Filtro premium');
      expect(result.precoUnitario.value).toBe(49.9);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.update('999', { nome: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should throw DuplicateNameError when new nome exists', async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.existsByNome.mockResolvedValue(true);
      await expect(service.update('1', { nome: 'Outro' })).rejects.toThrow(DuplicateNameError);
    });

    it('should skip duplicate check when nome is not changed', async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.update.mockImplementation(async (p) => p);
      await service.update('1', { precoUnitario: 50 });
      expect(mockRepository.existsByNome).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a Produto', async () => {
      const produto = Produto.reconstitute({
        id: '1', nome: 'Filtro', descricao: null, precoUnitario: 30,
        quantidadeEstoque: 50, quantidadeReservada: 0, estoqueMinimo: 10, ativo: true,
      });
      mockRepository.findById.mockResolvedValue(produto);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete('1');
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addStock', () => {
    it('should add stock to a Produto', async () => {
      const produto = Produto.reconstitute({
        id: '1', nome: 'Filtro', descricao: null, precoUnitario: 30,
        quantidadeEstoque: 50, quantidadeReservada: 0, estoqueMinimo: 10, ativo: true,
      });
      mockRepository.findById.mockResolvedValue(produto);
      mockRepository.update.mockImplementation(async (p) => p);

      const result = await service.addStock('1', 20);
      expect(result.quantidadeEstoque).toBe(70);
    });
  });
});
