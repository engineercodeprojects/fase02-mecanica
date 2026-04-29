import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrdemDeServico } from '../domain/ordem-de-servico.entity';
import {
  OrdemDeServicoRepository,
  ORDEM_DE_SERVICO_REPOSITORY,
  FindAllParams,
  PaginatedResult,
} from '../domain/ordem-de-servico.repository';
import { OsNotOwnedByClienteError } from '../domain/errors/os-not-owned-by-cliente.error';
import { OrdemDeServicoNotFoundError } from '../domain/errors/ordem-de-servico-not-found.error';
import { ClienteNotFoundError } from '../domain/errors/cliente-not-found.error';
import { ClienteNotOwnedByUsuarioError } from '../domain/errors/cliente-not-owned-by-usuario.error';
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
import {
  UsuarioRepository,
  USUARIO_REPOSITORY,
} from '../../usuario/domain/usuario.repository';
import {
  OsDetalhesView,
  OsHistoryItem,
  OsStatusView,
} from './ordem-de-servico.types';

/**
 * Servico de leitura (queries) da OrdemDeServico.
 *
 * Responsabilidades:
 * - Buscar OS por id, numero
 * - Compor views ricas (detalhes, status para cliente, historico)
 * - Validar ownership (cliente -> OS)
 *
 * Sem mutacao de estado, sem eventos. Toda leitura passa por aqui.
 */
@Injectable()
export class OrdemDeServicoQueryService {
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
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async findAll(
    params: FindAllParams,
  ): Promise<PaginatedResult<OrdemDeServico>> {
    return this.repository.findAll(params);
  }

  async findById(id: string): Promise<OrdemDeServico> {
    const os = await this.repository.findById(id);
    if (!os) {
      throw new NotFoundException(
        `Ordem de Servico com id '${id}' nao encontrada`,
      );
    }
    return os;
  }

  async findByIdDetalhado(id: string): Promise<OsDetalhesView> {
    const os = await this.findById(id);

    const [cliente, veiculo, usuario] = await Promise.all([
      this.clienteRepository.findById(os.clienteId),
      this.veiculoRepository.findById(os.veiculoId),
      os.usuarioId
        ? this.usuarioRepository.findById(os.usuarioId)
        : Promise.resolve(null),
    ]);

    const servicoIds = os.itensServico.map((i) => i.servicoId);
    const produtoIds = os.itensProduto.map((i) => i.produtoId);
    const [servicoNomeById, produtoNomeById] = await Promise.all([
      this.loadServicoNomes(servicoIds),
      this.loadProdutoNomes(produtoIds),
    ]);

    const servicos = os.itensServico.map((i) => ({
      servicoId: i.servicoId,
      descricaoServico:
        servicoNomeById.get(i.servicoId) ?? 'Servico removido do catalogo',
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
      valorTotalDesseServico: i.subtotal(),
    }));

    const produtos = os.itensProduto.map((i) => ({
      produtoId: i.produtoId,
      descricaoProduto:
        produtoNomeById.get(i.produtoId) ?? 'Produto removido do catalogo',
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
      valorTotalDesseProduto: i.subtotal(),
    }));

    const valorTotalServicos = os.valorTotalServicos();
    const valorTotalProdutos = os.valorTotalProdutos();

    return {
      cabecalho: {
        dadosCliente: {
          id: cliente?.id ?? os.clienteId,
          nome: cliente?.nome ?? 'Cliente removido',
          cpfCnpj: cliente?.cpfCnpj?.value ?? '',
          email: cliente?.email ?? null,
          telefone: cliente?.telefone ?? '',
        },
        dadosVeiculo: {
          id: veiculo?.id ?? os.veiculoId,
          placa: veiculo?.placa?.value ?? '',
          marca: veiculo?.marca ?? '',
          modelo: veiculo?.modelo ?? '',
          ano: veiculo?.ano ?? 0,
        },
        status: os.status,
        mecanicoAtribuido: usuario?.nome ?? null,
        dataHoraAbertura: this.formatDateTime(os.createdAt),
        dataHoraUltimaAtualizacao: this.formatDateTime(os.updatedAt),
      },
      corpo: {
        diagnostico: os.diagnostico,
        servicos,
        produtos,
      },
      rodape: {
        valorTotalServicos,
        valorTotalProdutos,
        valorTotalOrdemServico: valorTotalServicos + valorTotalProdutos,
      },
    };
  }

  async findStatusByNumero(numero: string): Promise<OsStatusView> {
    const os = await this.repository.findByNumero(numero);
    if (!os) {
      throw new OrdemDeServicoNotFoundError(numero);
    }

    const [servicoNomeById, produtoNomeById] = await Promise.all([
      this.loadServicoNomes(os.itensServico.map((i) => i.servicoId)),
      this.loadProdutoNomes(os.itensProduto.map((i) => i.produtoId)),
    ]);

    const servicos = os.itensServico.map((i) => ({
      servicoId: i.servicoId,
      nome:
        servicoNomeById.get(i.servicoId) ?? 'Servico removido do catalogo',
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
      subtotal: i.subtotal(),
    }));

    const produtos = os.itensProduto.map((i) => ({
      produtoId: i.produtoId,
      nome:
        produtoNomeById.get(i.produtoId) ?? 'Produto removido do catalogo',
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
      subtotal: i.subtotal(),
    }));

    const valorTotalServicos = os.valorTotalServicos();
    const valorTotalProdutos = os.valorTotalProdutos();

    return {
      id: os.id!,
      numero: os.numero,
      status: os.status,
      descricaoInicial: os.descricaoInicial,
      diagnostico: os.diagnostico,
      servicos,
      produtos,
      valorTotalServicos,
      valorTotalProdutos,
      valorTotal: valorTotalServicos + valorTotalProdutos,
      createdAt: os.createdAt,
      updatedAt: os.updatedAt,
    };
  }

  async findByCpfCnpj(
    cpfCnpj: string,
    emailCliente: string,
    params: { page?: number; limit?: number } = {},
  ): Promise<PaginatedResult<OsHistoryItem>> {
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
    const result = await this.repository.findAll({
      clienteId: cliente.id,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    });
    return {
      data: result.data.map((os) => ({
        numero: os.numero,
        status: os.status,
        descricaoInicial: os.descricaoInicial,
        createdAt: os.createdAt,
        updatedAt: os.updatedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  async assertOsPertenceAoCliente(
    ordemId: string,
    emailCliente: string,
  ): Promise<void> {
    const os = await this.findById(ordemId);
    const cliente = await this.clienteRepository.findById(os.clienteId);
    if (
      !cliente ||
      !cliente.email ||
      cliente.email.toLowerCase() !== emailCliente.toLowerCase()
    ) {
      throw new OsNotOwnedByClienteError(ordemId);
    }
  }

  private async loadServicoNomes(
    servicoIds: string[],
  ): Promise<Map<string, string>> {
    const unique = Array.from(new Set(servicoIds));
    const map = new Map<string, string>();
    await Promise.all(
      unique.map(async (id) => {
        const s = await this.servicoRepository.findById(id);
        if (s) map.set(id, s.nome);
      }),
    );
    return map;
  }

  private async loadProdutoNomes(
    produtoIds: string[],
  ): Promise<Map<string, string>> {
    const unique = Array.from(new Set(produtoIds));
    const map = new Map<string, string>();
    await Promise.all(
      unique.map(async (id) => {
        const p = await this.produtoRepository.findById(id);
        if (p) map.set(id, p.nome);
      }),
    );
    return map;
  }

  private formatDateTime(date: Date | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }
}
