import { ServicoService } from './servico.service';
import { ServicoRepository, SERVICO_REPOSITORY } from '../domain/servico.repository';
import { Servico } from '../domain/servico.entity';
import { DuplicateNameError } from '../domain/errors/duplicate-name.error';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

const mockRepository: jest.Mocked<ServicoRepository> = {
  existsByNome: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ServicoService', () => {
  let service: ServicoService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicoService,
        { provide: SERVICO_REPOSITORY, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ServicoService>(ServicoService);
  });

  describe('create', () => {
    const input = {
      nome: 'Troca de oleo',
      descricao: 'Troca de oleo com filtro',
      precoBase: 149.9,
      tempoEstimadoHoras: 1.5,
    };

    it('should create a Servico', async () => {
      mockRepository.existsByNome.mockResolvedValue(false);
      mockRepository.create.mockImplementation(async (s) =>
        Servico.reconstitute({
          id: 'generated-id',
          nome: s.nome,
          descricao: s.descricao ?? null,
          precoBase: s.precoBase.value,
          tempoEstimadoHoras: s.tempoEstimadoHoras,
          ativo: s.ativo,
        }),
      );

      const result = await service.create(input);

      expect(result.id).toBe('generated-id');
      expect(result.nome).toBe('Troca de oleo');
      expect(mockRepository.existsByNome).toHaveBeenCalledWith('Troca de oleo');
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw DuplicateNameError when nome already exists', async () => {
      mockRepository.existsByNome.mockResolvedValue(true);

      await expect(service.create(input)).rejects.toThrow(DuplicateNameError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const servico = Servico.reconstitute({
        id: '1',
        nome: 'Alinhamento',
        descricao: null,
        precoBase: 80,
        tempoEstimadoHoras: 0.5,
        ativo: true,
      });

      mockRepository.findAll.mockResolvedValue({
        data: [servico],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should pass nome filter to repository', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await service.findAll({ page: 1, limit: 10, nome: 'troca' });

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        nome: 'troca',
      });
    });
  });

  describe('findById', () => {
    it('should return a Servico', async () => {
      const servico = Servico.reconstitute({
        id: '1',
        nome: 'Alinhamento',
        descricao: null,
        precoBase: 80,
        tempoEstimadoHoras: 0.5,
        ativo: true,
      });

      mockRepository.findById.mockResolvedValue(servico);

      const result = await service.findById('1');
      expect(result.nome).toBe('Alinhamento');
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const existing = Servico.reconstitute({
      id: '1',
      nome: 'Alinhamento',
      descricao: null,
      precoBase: 80,
      tempoEstimadoHoras: 0.5,
      ativo: true,
    });

    it('should update a Servico', async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.existsByNome.mockResolvedValue(false);
      mockRepository.update.mockImplementation(async (s) => s);

      const result = await service.update('1', {
        nome: 'Alinhamento e balanceamento',
        precoBase: 120,
      });

      expect(result.nome).toBe('Alinhamento e balanceamento');
      expect(result.precoBase.value).toBe(120);
    });

    it('should throw NotFoundException when servico not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('999', { nome: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw DuplicateNameError when new nome already exists', async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.existsByNome.mockResolvedValue(true);

      await expect(
        service.update('1', { nome: 'Troca de oleo' }),
      ).rejects.toThrow(DuplicateNameError);
    });

    it('should skip duplicate check when nome is not being changed', async () => {
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.update.mockImplementation(async (s) => s);

      await service.update('1', { precoBase: 100 });

      expect(mockRepository.existsByNome).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a Servico', async () => {
      mockRepository.findById.mockResolvedValue(
        Servico.reconstitute({
          id: '1',
          nome: 'Alinhamento',
          descricao: null,
          precoBase: 80,
          tempoEstimadoHoras: 0.5,
          ativo: true,
        }),
      );
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when servico not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
    });
  });
});
