import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService, UsuarioOutput } from '../application/usuario.service';
import { UsuarioNotFoundError } from '../domain/errors/usuario-not-found.error';
import { EmailAlreadyExistsError } from '../domain/errors/email-already-exists.error';
import { InvalidRoleError } from '../domain/errors/invalid-role.error';

describe('UsuarioController', () => {
  let controller: UsuarioController;
  let service: jest.Mocked<UsuarioService>;

  const mockUsuarioOutput: UsuarioOutput = {
    id: 'uuid-123',
    nome: 'João Mecânico',
    email: 'joao@mecanica.com',
    role: 'MECANICO',
    ativo: true,
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
    service = module.get(UsuarioService) as jest.Mocked<UsuarioService>;
  });

  describe('create', () => {
    it('should create a usuario', async () => {
      const createDto = {
        nome: 'João Mecânico',
        email: 'joao@mecanica.com',
        senha: 'senha123',
        role: 'MECANICO',
      };

      service.create.mockResolvedValue(mockUsuarioOutput);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockUsuarioOutput);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw error when email already exists', async () => {
      const createDto = {
        nome: 'João',
        email: 'existing@test.com',
        senha: 'senha123',
        role: 'MECANICO',
      };

      service.create.mockRejectedValue(
        new EmailAlreadyExistsError('existing@test.com'),
      );

      await expect(controller.create(createDto)).rejects.toThrow();
    });

    it('should throw error for invalid role', async () => {
      const createDto = {
        nome: 'João',
        email: 'joao@test.com',
        senha: 'senha123',
        role: 'INVALID_ROLE',
      };

      service.create.mockRejectedValue(new InvalidRoleError('INVALID_ROLE'));

      await expect(controller.create(createDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return paginated usuarios', async () => {
      const query = { page: 1, limit: 10, role: 'MECANICO' };
      const paginatedResult = {
        data: [mockUsuarioOutput],
        total: 1,
        page: 1,
        limit: 10,
      };

      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle empty results', async () => {
      const query = { page: 1, limit: 10 };
      const emptyResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      service.findAll.mockResolvedValue(emptyResult);

      const result = await controller.findAll(query);

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return usuario when found', async () => {
      service.findById.mockResolvedValue(mockUsuarioOutput);

      const result = await controller.findById('uuid-123');

      expect(result).toEqual(mockUsuarioOutput);
      expect(service.findById).toHaveBeenCalledWith('uuid-123');
    });

    it('should throw NotFoundException when usuario not found', async () => {
      service.findById.mockRejectedValue(
        new UsuarioNotFoundError('uuid-123'),
      );

      await expect(controller.findById('uuid-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update usuario successfully', async () => {
      const updateDto = {
        nome: 'João Atualizado',
        ativo: false,
      };

      const updatedOutput: UsuarioOutput = {
        ...mockUsuarioOutput,
        nome: updateDto.nome,
        ativo: updateDto.ativo,
      };

      service.update.mockResolvedValue(updatedOutput);

      const result = await controller.update('uuid-123', updateDto);

      expect(result).toEqual(updatedOutput);
      expect(service.update).toHaveBeenCalledWith('uuid-123', updateDto);
    });

    it('should throw NotFoundException when usuario not found', async () => {
      const updateDto = { nome: 'João' };

      service.update.mockRejectedValue(
        new UsuarioNotFoundError('uuid-123'),
      );

      await expect(
        controller.update('uuid-123', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when email already exists', async () => {
      const updateDto = { email: 'existing@test.com' };

      service.update.mockRejectedValue(
        new EmailAlreadyExistsError('existing@test.com'),
      );

      await expect(
        controller.update('uuid-123', updateDto),
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete usuario successfully', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('uuid-123');

      expect(service.delete).toHaveBeenCalledWith('uuid-123');
    });

    it('should throw NotFoundException when usuario not found', async () => {
      service.delete.mockRejectedValue(
        new UsuarioNotFoundError('uuid-123'),
      );

      await expect(controller.delete('uuid-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
