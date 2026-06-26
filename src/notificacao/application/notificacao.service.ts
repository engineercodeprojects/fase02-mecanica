import { Inject, Injectable, Logger } from '@nestjs/common';
import { Notificacao } from '../domain/notificacao.entity';
import {
  FindAllParams,
  NOTIFICACAO_REPOSITORY,
  NotificacaoRepository,
  PaginatedResult,
} from '../domain/notificacao.repository';
import { CanalNotificacao } from '../domain/value-objects/canal-notificacao.vo';
import { TipoNotificacao } from '../domain/value-objects/tipo-notificacao.vo';
import { NOTIFICADOR, Notificador } from './ports/notificador.port';
import {
  CLIENTE_REPOSITORY,
  ClienteRepository,
} from '../../cliente/domain/cliente.repository';
import { ClienteNotFoundError } from '../../ordem-de-servico/domain/errors/cliente-not-found.error';
import { ClienteNotOwnedByUsuarioError } from '../../ordem-de-servico/domain/errors/cliente-not-owned-by-usuario.error';

export interface EnviarNotificacaoInput {
  clienteId: string;
  ordemDeServicoId?: string;
  tipo: TipoNotificacao;
  canal: CanalNotificacao;
  destinatario: string;
  assunto: string;
  mensagem: string;
  statusAnterior?: string;
  statusAtual?: string;
  timestamp?: Date | string;
}

@Injectable()
export class NotificacaoService {
  private readonly logger = new Logger(NotificacaoService.name);
  private readonly notificadoresPorCanal: Map<CanalNotificacao, Notificador>;

  constructor(
    @Inject(NOTIFICACAO_REPOSITORY)
    private readonly repository: NotificacaoRepository,
    @Inject(NOTIFICADOR)
    notificadores: Notificador[],
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {
    this.notificadoresPorCanal = new Map(
      notificadores.map((n) => [n.canal, n]),
    );
    if (this.notificadoresPorCanal.size !== notificadores.length) {
      const canais = notificadores.map((n) => n.canal);
      throw new Error(
        `Notificadores duplicados para o mesmo canal: ${canais.join(', ')}`,
      );
    }
  }

  async enviar(input: EnviarNotificacaoInput): Promise<Notificacao> {
    const notificacao = Notificacao.create({
      clienteId: input.clienteId,
      ordemDeServicoId: input.ordemDeServicoId,
      tipo: input.tipo,
      canal: input.canal,
      destinatario: input.destinatario,
      assunto: input.assunto,
      mensagem: input.mensagem,
    });

    const notificador = this.notificadoresPorCanal.get(input.canal);
    if (!notificador) {
      notificacao.marcarComoFalha(
        `Nenhum notificador registrado para o canal ${input.canal}`,
      );
      return this.repository.create(notificacao);
    }

    try {
      await notificador.enviar({
        destinatario: input.destinatario,
        assunto: input.assunto,
        corpo: input.mensagem,
        contexto: {
          ordemId: input.ordemDeServicoId,
          clienteId: input.clienteId,
          statusAnterior: input.statusAnterior,
          statusAtual: input.statusAtual,
          timestamp: input.timestamp,
          tipoNotificacao: input.tipo,
        },
      });
      notificacao.marcarComoEnviada();
    } catch (err) {
      const motivo = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Falha ao enviar notificacao tipo=${input.tipo} canal=${input.canal}: ${motivo}`,
      );
      notificacao.marcarComoFalha(motivo);
    }

    return this.repository.create(notificacao);
  }

  async findAll(params: FindAllParams): Promise<PaginatedResult<Notificacao>> {
    return this.repository.findAll(params);
  }

  async findByCpfCnpj(
    cpfCnpj: string,
    emailCliente: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<PaginatedResult<Notificacao>> {
    const cliente = await this.clienteRepository.findByCpfCnpj(cpfCnpj);
    if (!cliente) {
      throw new ClienteNotFoundError(cpfCnpj);
    }
    if (
      !cliente.email ||
      cliente.email.toLowerCase() !== emailCliente.toLowerCase()
    ) {
      throw new ClienteNotOwnedByUsuarioError(cpfCnpj);
    }
    return this.repository.findAll({
      clienteId: cliente.id,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  }
}
