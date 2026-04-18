import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsuarioService, UsuarioOutput } from './usuario.service';
import { UsuarioRepository, USUARIO_REPOSITORY } from '../domain/usuario.repository';
import { Usuario } from '../../auth/domain/usuario.entity';
import { Role } from '../../auth/domain/role.enum';
import { UsuarioNotFoundError } from '../domain/errors/usuario-not-found.error';
import { EmailAlreadyExistsError } from '../domain/errors/email-already-exists.error';
import { InvalidRoleError } from '../domain/errors/invalid-role.error';

jest.mock('bcrypt');

describe('UsuarioService', () => {
  let service: UsuarioService;
  let mockRepository: jest.Mocked<UsuarioRepository>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: USUARIO_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a usuario successfully', async () => {
      const createProps = {
        nome: 'João Mecânico',
        email: 'joao@mecanica.com',
        senha: 'senha123',
        role: 'MECANICO',
      };

      const mockHash = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const mockUsuario = Usuario.create({
        nome: createProps.nome,
        email: createProps.email,
        senhaHash: mockHash,
        role: createProps.role as Role,
      });

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockUsuario);

      const result = await service.create(createProps);

      expect(result).toMatchObject({
        nome: createProps.nome,
        email: createProps.email,
        role: createProps.role,
        ativo: true,
      });
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(createProps.email);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should throw InvalidRoleError for invalid role', async () => {
      const createProps = {
        nome: 'João',
        email: 'joao@test.com',
        senha: 'senha123',
        role: 'ROLE_INVALIDO',
      };

      await expect(service.create(createProps)).rejects.toThrow(InvalidRoleError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw EmailAlreadyExistsError if email is already registered', async () => {
      const createProps = {
        nome: 'João',
        email: 'joao@test.com',
        senha: 'senha123',
        role: 'MECANICO',
      };

      const existingUsuario = Usuario.create({
        nome: 'Outro',
        email: createProps.email,
        senhaHash: 'hash',
        role: 'ADMIN' as Role,
      });

      mockRepository.findByEmail.mockResolvedValue(existingUsuario);

      await expect(service.create(createProps)).rejects.toThrow(
        EmailAlreadyExistsError,
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should hash password with bcrypt', async () => {
      const createProps = {
        nome: 'João',
        email: 'joao@test.com',
        senha: 'senha123',
        role: 'MECANICO',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(
        Usuario.create({
          nome: createProps.nome,
          email: createProps.email,
          senhaHash: 'hashed',
          role: 'MECANICO' as Role,
        }),
      );

      await service.create(createProps);

      expect(bcrypt.hash).toHaveBeenCalledWith(createProps.senha, 10);
    });
  });

  describe('findById', () => {
    it('should return usuario when found', async () => {
      const usuarioId = 'uuid-123';
      const mockUsuario = Usuario.reconstitute({
        id: usuarioId,
        nome: 'João',
        email: 'joao@test.com',
        senhaHash: 'hash',
        role: 'MECANICO' as Role,
        ativo: true,
      });

      mockRepository.findById.mockResolvedValue(mockUsuario);

      const result = await service.findById(usuarioId);

      expect(result).toMatchObject({
        id: usuarioId,
        nome: 'João',
        email: 'joao@test.com',
        role: 'MECANICO',
        ativo: true,
      });
      expect(mockRepository.findById).toHaveBeenCalledWith(usuarioId);
    });

    it('should throw UsuarioNotFoundError when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        UsuarioNotFoundError,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return usuario when email found', async () => {
      const email = 'joao@test.com';
      const mockUsuario = Usuario.reconstitute({
        id: 'uuid-123',
        nome: 'João',
        email,
        senhaHash: 'hash',
        role: 'MECANICO' as Role,
        ativo: true,
      });

      mockRepository.findByEmail.mockResolvedValue(mockUsuario);

      const result = await service.findByEmail(email);

      expect(result.email).toBe(email);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw UsuarioNotFoundError when email not found', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('nonexistent@test.com')).rejects.toThrow(
        UsuarioNotFoundError,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated usuarios', async () => {
      const params = { page: 1, limit: 10, role: 'MECANICO' };
      const mockUsuarios = [
        Usuario.reconstitute({
          id: 'uuid-1',
          nome: 'João',
          email: 'joao@test.com',
          senhaHash: 'hash',
          role: 'MECANICO' as Role,
          ativo: true,
        }),
      ];

      mockRepository.findAll.mockResolvedValue({
        data: mockUsuarios,
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll(params);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockRepository.findAll).toHaveBeenCalledWith(params);
    });

    it('should handle empty results', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('update', () => {
    it('should update usuario successfully', async () => {
      const usuarioId = 'uuid-123';
      const updateProps = {
        nome: 'João Atualizado',
        email: 'joao.novo@test.com',
        role: 'ATENDENTE',
        ativo: false,
      };

      const mockUsuario = Usuario.reconstitute({
        id: usuarioId,
        nome: 'João',
        email: 'joao@test.com',
        senhaHash: 'hash',
        role: 'MECANICO' as Role,
        ativo: true,
      });

      mockRepository.findById.mockResolvedValue(mockUsuario);
      mockRepository.findByEmail.mockResolvedValue(null);

      const updatedUsuario = Usuario.reconstitute({
        id: usuarioId,
        ...updateProps,
        senhaHash: 'hash',
        role: updateProps.role as Role,
      });

      mockRepository.update.mockResolvedValue(updatedUsuario);

      const result = await service.update(usuarioId, updateProps);

      expect(result.nome).toBe(updateProps.nome);
      expect(result.email).toBe(updateProps.email);
      expect(result.role).toBe(updateProps.role);
      expect(result.ativo).toBe(updateProps.ativo);
    });

    it('should throw UsuarioNotFoundError when usuario not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', { nome: 'Novo' }),
      ).rejects.toThrow(UsuarioNotFoundError);
    });

    it('should throw InvalidRoleError for invalid role update', async () => {
      const mockUsuario = Usuario.reconstitute({
        id: 'uuid-123',
        nome: 'João',
        email: 'joao@test.com',
        senhaHash: 'hash',
        role: 'MECANICO' as Role,
        ativo: true,
      });

      mockRepository.findById.mockResolvedValue(mockUsuario);

      await expect(
        service.update('uuid-123', { role: 'ROLE_INVALIDO' }),
      ).rejects.toThrow(InvalidRoleError);
    });

    it('should throw EmailAlreadyExistsError when updating to existing email', async () => {
      const mockUsuario = Usuario.reconstitute({
        id: 'uuid-123',
        nome: 'João',
        email: 'joao@test.com',
        senhaHash: 'hash',
        role: 'MECANICO' as Role,
        ativo: true,
      });

      const anotherUsuario = Usuario.reconstitute({
        id: 'uuid-456',
        nome: 'Maria',
        email: 'maria@test.com',
        senhaHash: 'hash',
        role: 'ATENDENTE' as Role,
        ativo: true,
      });

      mockRepository.findById.mockResolvedValue(mockUsuario);
      mockRepository.findByEmail.mockResolvedValue(anotherUsuario);

      await expect(
        service.update('uuid-123', { email: 'maria@test.com' }),
      ).rejects.toThrow(EmailAlreadyExistsError);
    });

    it('should allow updating to same email', async () => {
      const usuarioId = 'uuid-123';
      const email = 'joao@test.com';

      const mockUsuario = Usuario.reconstitute({
        id: usuarioId,
        nome: 'João',
        email,
        senhaHash: 'hash',
        role: 'MECANICO' as Role,
        ativo: true,
      });

      mockRepository.findById.mockResolvedValue(mockUsuario);
      mockRepository.update.mockResolvedValue(mockUsuario);

      const result = await service.update(usuarioId, { email, nome: 'João Silva' });

      expect(result.email).toBe(email);
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete usuario successfully', async () => {
      const usuarioId = 'uuid-123';
      const mockUsuario = Usuario.reconstitute({
        id: usuarioId,
        nome: 'João',
        email: 'joao@test.com',
        senhaHash: 'hash',
        role: 'MECANICO' as Role,
        ativo: true,
      });

      mockRepository.findById.mockResolvedValue(mockUsuario);
      mockRepository.delete.mockResolvedValue(undefined);

      await service.delete(usuarioId);

      expect(mockRepository.delete).toHaveBeenCalledWith(usuarioId);
    });

    it('should throw UsuarioNotFoundError when usuario not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('nonexistent-id')).rejects.toThrow(
        UsuarioNotFoundError,
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
