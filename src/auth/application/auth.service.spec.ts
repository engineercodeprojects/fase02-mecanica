import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { USUARIO_REPOSITORY, UsuarioRepository } from '../domain/usuario.repository';
import { Usuario } from '../domain/usuario.entity';
import { Role } from '../domain/role.enum';
import { InvalidCredentialsError } from '../domain/errors/invalid-credentials.error';

const mockRepository: jest.Mocked<UsuarioRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USUARIO_REPOSITORY, useValue: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    const email = 'admin@oficina.com';
    const senha = 'admin123';
    let senhaHash: string;

    beforeAll(async () => {
      senhaHash = await bcrypt.hash(senha, 10);
    });

    it('should return token and user info on valid credentials', async () => {
      const usuario = Usuario.reconstitute({
        id: 'user-id',
        nome: 'Admin',
        email,
        senhaHash,
        role: Role.ADMIN,
        ativo: true,
      });

      mockRepository.findByEmail.mockResolvedValue(usuario);
      mockJwtService.signAsync.mockResolvedValue('fake-jwt-token');

      const result = await service.login(email, senha);

      expect(result.accessToken).toBe('fake-jwt-token');
      expect(result.usuario.email).toBe(email);
      expect(result.usuario.role).toBe(Role.ADMIN);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-id',
        email,
        role: Role.ADMIN,
      });
    });

    it('should throw InvalidCredentialsError when user not found', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(email, senha)).rejects.toThrow(InvalidCredentialsError);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError when password is wrong', async () => {
      const usuario = Usuario.reconstitute({
        id: 'user-id',
        nome: 'Admin',
        email,
        senhaHash,
        role: Role.ADMIN,
        ativo: true,
      });
      mockRepository.findByEmail.mockResolvedValue(usuario);

      await expect(service.login(email, 'wrongpassword')).rejects.toThrow(InvalidCredentialsError);
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError when user is inactive', async () => {
      const usuario = Usuario.reconstitute({
        id: 'user-id',
        nome: 'Admin',
        email,
        senhaHash,
        role: Role.ADMIN,
        ativo: false,
      });
      mockRepository.findByEmail.mockResolvedValue(usuario);

      await expect(service.login(email, senha)).rejects.toThrow(InvalidCredentialsError);
    });
  });

  describe('validateUserById', () => {
    it('should return user when found and active', async () => {
      const usuario = Usuario.reconstitute({
        id: 'user-id',
        nome: 'Admin',
        email: 'admin@oficina.com',
        senhaHash: 'hash',
        role: Role.ADMIN,
        ativo: true,
      });
      mockRepository.findById.mockResolvedValue(usuario);

      const result = await service.validateUserById('user-id');
      expect(result).toBe(usuario);
    });

    it('should return null when user is inactive', async () => {
      const usuario = Usuario.reconstitute({
        id: 'user-id',
        nome: 'Admin',
        email: 'admin@oficina.com',
        senhaHash: 'hash',
        role: Role.ADMIN,
        ativo: false,
      });
      mockRepository.findById.mockResolvedValue(usuario);

      const result = await service.validateUserById('user-id');
      expect(result).toBeNull();
    });

    it('should return null when user not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      const result = await service.validateUserById('user-id');
      expect(result).toBeNull();
    });
  });
});
