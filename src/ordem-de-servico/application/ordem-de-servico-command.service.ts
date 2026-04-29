import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OrdemDeServico,
  CreateOrdemDeServicoProps,
} from '../domain/ordem-de-servico.entity';
import {
  OrdemDeServicoRepository,
  ORDEM_DE_SERVICO_REPOSITORY,
} from '../domain/ordem-de-servico.repository';
import { ClienteNotFoundError } from '../domain/errors/cliente-not-found.error';
import { VeiculoNotFoundError } from '../domain/errors/veiculo-not-found.error';
import { VeiculoClienteMismatchError } from '../domain/errors/veiculo-cliente-mismatch.error';
import { ServicoNotFoundInCatalogError } from '../domain/errors/servico-not-found-in-catalog.error';
import { ProdutoNotFoundInCatalogError } from '../domain/errors/produto-not-found-in-catalog.error';
import { ItemServicoOS } from '../domain/value-objects/item-servico-os.vo';
import { ItemProdutoOS } from '../domain/value-objects/item-produto-os.vo';
import { OrcamentoProntoEvent } from '../../shared/domain/events/orcamento-pronto.event';
import { OsFinalizadaEvent } from '../../shared/domain/events/os-finalizada.event';
import { OsAcaoEvent } from '../../shared/domain/events/os-acao.event';
import {
  ClienteRepository,
  CLIENTE_REPOSITORY,
} from '../../cliente/domain/cliente.repository';
import {
  VeiculoRepository,
  VEICULO_REPOSITORY,
} from '../../veiculo/domain/veiculo.repository';
import {
  ServicoRepository,
  SERVICO_REPOSITORY,
} from '../../servico/domain/servico.repository';
import {
  ProdutoRepository,
  PRODUTO_REPOSITORY,
} from '../../produto/domain/produto.repository';

export interface CommandContext {
  /** Usuario que executou o comando (vem do JWT, pode ser nulo em fluxos publicos) */
  usuarioId?: string | null;
}

/**
 * Servico de mutacoes (commands) da OrdemDeServico.
 *
 * Cada metodo:
 * 1. Valida (carrega entity, dispara DomainErrors se invalido)
 * 2. Aplica regras de negocio (entity faz a transicao)
 * 3. Persiste
 * 4. Emite eventos (negocio: OrcamentoProntoEvent/OsFinalizadaEvent;
 *    auditoria: sempre OsAcaoEvent)
 */
@Injectable()
export class OrdemDeServicoCommandService {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY)
    private readonly repository: OrdemDeServicoRepository,
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
    @Inject(VEICULO_REPOSITORY)
    private readonly veiculoRepository: VeiculoRepository,
    @Inject(SERVICO_REPOSITORY)
    private readonly servicoRepository: ServicoRepository,
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: ProdutoRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    props: CreateOrdemDeServicoProps,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const cliente = await this.clienteRepository.findById(props.clienteId);
    if (!cliente) throw new ClienteNotFoundError(props.clienteId);

    const veiculo = await this.veiculoRepository.findById(props.veiculoId);
    if (!veiculo) throw new VeiculoNotFoundError(props.veiculoId);

    if (veiculo.clienteId !== props.clienteId) {
      throw new VeiculoClienteMismatchError(props.veiculoId, props.clienteId);
    }

    const os = OrdemDeServico.create(props);
    const created = await this.repository.create(os);
    this.emitirAcao(created, 'CRIAR', null, created.status, ctx);
    return created;
  }

  async atribuirMecanico(
    id: string,
    usuarioId: string,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(id);
    const statusAnterior = os.status;
    os.atribuirMecanico(usuarioId);
    const updated = await this.repository.update(os);
    this.emitirAcao(updated, 'ATRIBUIR_MECANICO', statusAnterior, updated.status, ctx, {
      mecanicoId: usuarioId,
    });
    return updated;
  }

  async completarDiagnostico(
    id: string,
    diagnostico: string,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(id);
    const statusAnterior = os.status;
    os.completarDiagnostico(diagnostico);
    const updated = await this.repository.update(os);
    this.emitirAcao(updated, 'COMPLETAR_DIAGNOSTICO', statusAnterior, updated.status, ctx);
    this.eventEmitter.emit(
      OrcamentoProntoEvent.EVENT_NAME,
      new OrcamentoProntoEvent(
        updated.id!,
        updated.numero,
        updated.clienteId,
        updated.diagnostico ?? '',
        updated.valorTotalServicos(),
      ),
    );
    return updated;
  }

  async aprovarOrcamento(
    id: string,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(id);
    const statusAnterior = os.status;
    os.aprovar();
    const updated = await this.repository.update(os);
    this.emitirAcao(updated, 'APROVAR_ORCAMENTO', statusAnterior, updated.status, ctx);
    return updated;
  }

  async rejeitarOrcamento(
    id: string,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(id);
    const statusAnterior = os.status;
    os.rejeitar();
    const updated = await this.repository.update(os);
    this.emitirAcao(updated, 'REJEITAR_ORCAMENTO', statusAnterior, updated.status, ctx);
    return updated;
  }

  async iniciarServico(
    osId: string,
    servicoId: string,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(osId);
    os.iniciarServico(servicoId);
    const updated = await this.repository.update(os);
    this.emitirAcao(updated, 'INICIAR_SERVICO', updated.status, updated.status, ctx, {
      servicoId,
    });
    return updated;
  }

  async concluirServico(
    osId: string,
    servicoId: string,
    horasTrabalhadas: number,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(osId);
    const statusAnterior = os.status;
    os.concluirServico(servicoId, horasTrabalhadas);
    const updated = await this.repository.update(os);
    this.emitirAcao(
      updated,
      'CONCLUIR_SERVICO',
      statusAnterior,
      updated.status,
      ctx,
      { servicoId, horasTrabalhadas },
    );
    if (updated.status === 'FINALIZADA') {
      this.eventEmitter.emit(
        OsFinalizadaEvent.EVENT_NAME,
        new OsFinalizadaEvent(updated.id!, updated.numero, updated.clienteId),
      );
    }
    return updated;
  }

  async finalizarExecucao(
    id: string,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(id);
    const statusAnterior = os.status;
    os.finalizarExecucao();
    const updated = await this.repository.update(os);
    this.emitirAcao(updated, 'FINALIZAR_EXECUCAO', statusAnterior, updated.status, ctx);
    this.eventEmitter.emit(
      OsFinalizadaEvent.EVENT_NAME,
      new OsFinalizadaEvent(updated.id!, updated.numero, updated.clienteId),
    );
    return updated;
  }

  async entregar(
    id: string,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(id);
    const statusAnterior = os.status;
    os.entregar();
    const updated = await this.repository.update(os);
    this.emitirAcao(updated, 'ENTREGAR', statusAnterior, updated.status, ctx);
    return updated;
  }

  async delete(id: string, ctx: CommandContext = {}): Promise<void> {
    const os = await this.loadOrThrow(id);
    await this.repository.delete(os.id!);
    this.emitirAcao(os, 'DELETAR', os.status, null, ctx);
  }

  async adicionarServico(
    id: string,
    servicoId: string,
    quantidade: number,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(id);
    const servico = await this.servicoRepository.findById(servicoId);
    if (!servico) throw new ServicoNotFoundInCatalogError(servicoId);

    const item = new ItemServicoOS(
      servicoId,
      quantidade,
      servico.precoBase.value,
    );
    os.adicionarServico(item);
    const updated = await this.repository.update(os);
    this.emitirAcao(updated, 'ADICIONAR_SERVICO', updated.status, updated.status, ctx, {
      servicoId,
      quantidade,
    });
    return updated;
  }

  async removerServico(
    id: string,
    servicoId: string,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(id);
    os.removerServico(servicoId);
    const updated = await this.repository.update(os);
    this.emitirAcao(updated, 'REMOVER_SERVICO', updated.status, updated.status, ctx, {
      servicoId,
    });
    return updated;
  }

  async adicionarProduto(
    id: string,
    produtoId: string,
    quantidade: number,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(id);
    const produto = await this.produtoRepository.findById(produtoId);
    if (!produto) throw new ProdutoNotFoundInCatalogError(produtoId);

    const item = new ItemProdutoOS(
      produtoId,
      quantidade,
      produto.precoUnitario.value,
    );
    os.adicionarProduto(item);
    const updated = await this.repository.update(os);
    this.emitirAcao(updated, 'ADICIONAR_PRODUTO', updated.status, updated.status, ctx, {
      produtoId,
      quantidade,
    });
    return updated;
  }

  async removerProduto(
    id: string,
    produtoId: string,
    ctx: CommandContext = {},
  ): Promise<OrdemDeServico> {
    const os = await this.loadOrThrow(id);
    os.removerProduto(produtoId);
    const updated = await this.repository.update(os);
    this.emitirAcao(updated, 'REMOVER_PRODUTO', updated.status, updated.status, ctx, {
      produtoId,
    });
    return updated;
  }

  private async loadOrThrow(id: string): Promise<OrdemDeServico> {
    const os = await this.repository.findById(id);
    if (!os) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(
        `Ordem de Servico com id '${id}' nao encontrada`,
      );
    }
    return os;
  }

  private emitirAcao(
    os: OrdemDeServico,
    acao: string,
    statusAnterior: string | null,
    statusNovo: string | null,
    ctx: CommandContext,
    metadata: Record<string, unknown> | null = null,
  ): void {
    this.eventEmitter.emit(
      OsAcaoEvent.EVENT_NAME,
      new OsAcaoEvent(
        os.id!,
        os.numero,
        acao,
        statusAnterior,
        statusNovo,
        ctx.usuarioId ?? null,
        metadata,
      ),
    );
  }
}
