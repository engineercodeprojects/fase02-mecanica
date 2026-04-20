import { Module } from '@nestjs/common';
import { UsuarioService } from './application/usuario.service';
import { UsuarioController } from './infrastructure/usuario.controller';
import { PrismaUsuarioRepository } from './infrastructure/prisma-usuario.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { USUARIO_REPOSITORY } from './domain/usuario.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    UsuarioService,
    {
      provide: USUARIO_REPOSITORY,
      useClass: PrismaUsuarioRepository,
    },
  ],
  controllers: [UsuarioController],
  exports: [USUARIO_REPOSITORY],
})
export class UsuarioModule {}
