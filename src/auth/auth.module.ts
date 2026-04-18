import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './application/auth.service';
import { AuthController } from './infrastructure/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { PrismaUsuarioRepository } from './infrastructure/prisma-usuario.repository';
import { USUARIO_REPOSITORY } from './domain/usuario.repository';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_SECRET is required. Set it in your environment before starting the app.',
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ?? '1h') as any,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: USUARIO_REPOSITORY, useClass: PrismaUsuarioRepository },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService, USUARIO_REPOSITORY],
})
export class AuthModule {}
