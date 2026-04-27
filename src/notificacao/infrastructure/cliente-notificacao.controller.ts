import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '../../auth/domain/role.enum';
import { CurrentUser } from '../../auth/infrastructure/decorators/current-user.decorator';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { Usuario } from '../../auth/domain/usuario.entity';
import { ClienteNotFoundError } from '../../ordem-de-servico/domain/errors/cliente-not-found.error';
import { ClienteNotOwnedByUsuarioError } from '../../ordem-de-servico/domain/errors/cliente-not-owned-by-usuario.error';
import { NotificacaoService } from '../application/notificacao.service';
import { Notificacao } from '../domain/notificacao.entity';
import { NotificacaoResponseDto } from './dto/notificacao-response.dto';
import { QueryNotificacaoDto } from './dto/query-notificacao.dto';

const CPF_CNPJ_DIGITS_REGEX = /^\d{11}(\d{3})?$/;

@ApiTags('Notificacoes')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token JWT ausente ou invalido' })
@ApiForbiddenResponse({
  description: 'Role insuficiente ou CPF/CNPJ nao pertence ao usuario',
})
@Controller('clientes')
export class ClienteNotificacaoController {
  constructor(private readonly service: NotificacaoService) {}

  @Get(':cpfCnpj/notificacoes')
  @Roles(Role.CLIENTE)
  @ApiOperation({
    summary: 'Historico de notificacoes do cliente autenticado',
  })
  @ApiOkResponse({
    description: 'Notificacoes paginadas',
    type: NotificacaoResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Cliente nao encontrado pelo CPF/CNPJ' })
  async findByCpfCnpj(
    @Param('cpfCnpj') cpfCnpj: string,
    @Query() query: QueryNotificacaoDto,
    @CurrentUser() usuario: Usuario,
  ) {
    if (!CPF_CNPJ_DIGITS_REGEX.test(cpfCnpj)) {
      throw new BadRequestException(
        'CPF/CNPJ deve conter apenas digitos (11 para CPF ou 14 para CNPJ)',
      );
    }
    try {
      const result = await this.service.findByCpfCnpj(
        cpfCnpj,
        usuario.email.value,
        { page: query.page ?? 1, limit: query.limit ?? 20 },
      );
      return {
        data: result.data.map((n) => this.toResponse(n)),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      if (error instanceof ClienteNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ClienteNotOwnedByUsuarioError) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  private toResponse(n: Notificacao): NotificacaoResponseDto {
    return {
      id: n.id!,
      clienteId: n.clienteId,
      ordemDeServicoId: n.ordemDeServicoId,
      tipo: n.tipo,
      canal: n.canal,
      destinatario: n.destinatario,
      assunto: n.assunto,
      mensagem: n.mensagem,
      status: n.status,
      erro: n.erro,
      enviadaEm: n.enviadaEm,
      createdAt: n.createdAt!,
    };
  }
}
