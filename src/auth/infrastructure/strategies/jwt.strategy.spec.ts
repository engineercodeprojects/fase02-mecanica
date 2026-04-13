import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { AuthService, JwtPayload } from '../../application/auth.service';
import { Usuario } from '../../domain/usuario.entity';
import { Role } from '../../domain/role.enum';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<Pick<AuthService, 'validateUserById'>>;

  beforeEach(() => {
    authService = {
      validateUserById: jest.fn(),
    };

    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(authService as unknown as AuthService, configService);
  });

  describe('validate', () => {
    const payload: JwtPayload = {
      sub: 'user-id',
      email: 'admin@oficina.com',
      role: Role.ADMIN,
    };

    it('should return the usuario when valid', async () => {
      const usuario = Usuario.reconstitute({
        id: 'user-id',
        nome: 'Admin',
        email: 'admin@oficina.com',
        senhaHash: 'hash',
        role: Role.ADMIN,
        ativo: true,
      });
      authService.validateUserById.mockResolvedValue(usuario);

      const result = await strategy.validate(payload);
      expect(result).toBe(usuario);
      expect(authService.validateUserById).toHaveBeenCalledWith('user-id');
    });

    it('should throw UnauthorizedException when user is not found or inactive', async () => {
      authService.validateUserById.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
