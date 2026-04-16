import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../application/auth.service';
import { InvalidCredentialsError } from '../domain/errors/invalid-credentials.error';
import { Usuario } from '../domain/usuario.entity';
import { Role } from '../domain/role.enum';

const mockService = {
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/login', () => {
    it('should return token and user on success', async () => {
      mockService.login.mockResolvedValue({
        accessToken: 'jwt-token',
        usuario: {
          id: 'user-id',
          nome: 'Admin',
          email: 'admin@oficina.com',
          role: Role.ADMIN,
        },
      });

      const result = await controller.login({
        email: 'admin@oficina.com',
        senha: 'admin123',
      });

      expect(result.accessToken).toBe('jwt-token');
      expect(result.usuario.role).toBe(Role.ADMIN);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockService.login.mockRejectedValue(new InvalidCredentialsError());

      await expect(
        controller.login({ email: 'x@x.com', senha: 'xxxxxx' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should rethrow unexpected errors', async () => {
      mockService.login.mockRejectedValue(new Error('unexpected'));

      await expect(
        controller.login({ email: 'x@x.com', senha: 'xxxxxx' }),
      ).rejects.toThrow('unexpected');
    });
  });

  describe('GET /auth/me', () => {
    it('should return the current user info', async () => {
      const usuario = Usuario.reconstitute({
        id: 'user-id',
        nome: 'Admin',
        email: 'admin@oficina.com',
        senhaHash: 'hash',
        role: Role.ADMIN,
        ativo: true,
      });

      const result = await controller.me(usuario);
      expect(result).toEqual({
        id: 'user-id',
        nome: 'Admin',
        email: 'admin@oficina.com',
        role: Role.ADMIN,
      });
    });
  });
});
