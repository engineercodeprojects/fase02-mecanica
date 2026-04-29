import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClienteModule } from '../cliente/cliente.module';
import { VeiculoModule } from '../veiculo/veiculo.module';
import { ServicoModule } from '../servico/servico.module';
import { ProdutoModule } from '../produto/produto.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { OrdemDeServicoService } from './application/ordem-de-servico.service';
import { OrdemDeServicoCommandService } from './application/ordem-de-servico-command.service';
import { OrdemDeServicoQueryService } from './application/ordem-de-servico-query.service';
import { AuditLogService } from './application/audit-log.service';
import { OsAuditListener } from './application/listeners/os-audit.listener';
import { OrdemDeServicoController } from './infrastructure/ordem-de-servico.controller';
import { ClienteOrdemDeServicoController } from './infrastructure/cliente-ordem-de-servico.controller';
import { PrismaOrdemDeServicoRepository } from './infrastructure/prisma-ordem-de-servico.repository';
import { PrismaAuditLogRepository } from './infrastructure/prisma-audit-log.repository';
import { ORDEM_DE_SERVICO_REPOSITORY } from './domain/ordem-de-servico.repository';
import { AUDIT_LOG_REPOSITORY } from './domain/audit-log.repository';

@Module({
  imports: [
    PrismaModule,
    ClienteModule,
    VeiculoModule,
    ServicoModule,
    ProdutoModule,
    UsuarioModule,
  ],
  controllers: [OrdemDeServicoController, ClienteOrdemDeServicoController],
  providers: [
    OrdemDeServicoService,
    OrdemDeServicoCommandService,
    OrdemDeServicoQueryService,
    AuditLogService,
    OsAuditListener,
    {
      provide: ORDEM_DE_SERVICO_REPOSITORY,
      useClass: PrismaOrdemDeServicoRepository,
    },
    {
      provide: AUDIT_LOG_REPOSITORY,
      useClass: PrismaAuditLogRepository,
    },
  ],
  exports: [
    OrdemDeServicoService,
    OrdemDeServicoCommandService,
    OrdemDeServicoQueryService,
    AuditLogService,
    ORDEM_DE_SERVICO_REPOSITORY,
  ],
})
export class OrdemDeServicoModule {}
