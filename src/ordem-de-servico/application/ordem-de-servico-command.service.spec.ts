import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdemDeServicoCommandService } from './ordem-de-servico-command.service';
import {
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import {
  CLIENTE_REPOSITORY,
  ClienteRepository,
} from '../../cliente/domain/cliente.repository';
import {
  VEICULO_REPOSITORY,
  VeiculoRepository,
} from '../../veiculo/domain/veiculo.repository';
import {
  SERVICO_REPOSITORY,
  ServicoRepository,
} from '../../servico/domain/servico.repository';
import {
  PRODUTO_REPOSITORY,
  ProdutoRepository,
} from '../../produto/domain/produto.repository';
import { OrdemDeServico } from '../domain/ordem-de-servico.entity';
import { StatusOS } from '../domain/value-objects/status-os.vo';
import { OsAcaoEvent } from '../../shared/domain/events/os-acao.event';
import { OrcamentoProntoEvent } from '../../shared/domain/events/orcamento-pronto.event';
import { OsFinalizadaEvent } from '../../shared/domain/events/os-finalizada.event';

const fazerOs = (status: StatusOS = StatusOS.RECEBIDA) =>
  OrdemDeServico.reconstitute({
    id: 'os-1',
    numero: 'OS-2026-0001',
    clienteId: 'c-1',
    veiculoId: 'v-1',
    usuarioId: status === StatusOS.RECEBIDA ? null : 'u-mec',
    descricaoInicial: 'descricao inicial qualquer',
    diagnostico: status >= StatusOS.AGUARDANDO_APROVACAO ? 'diagnostico ok' : null,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('OrdemDeServicoCommandService — emite OsAcaoEvent', () => {
  let service: OrdemDeServicoCommandService;
  let repository: jest.Mocked<OrdemDeServicoRepository>;
  let eventEmitter: { emit: jest.Mock };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockImplementation(async (o) => o),
      findById: jest.fn(),
      findByNumero: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn().mockImplementation(async (o) => o),
      delete: jest.fn(),
      existsByNumero: jest.fn(),
    };

    const cliente: jest.Mocked<ClienteRepository> = {
      existsByCpfCnpj: jest.fn(),
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue({ id: 'c-1' } as any),
      findByCpfCnpj: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const veiculo: jest.Mocked<VeiculoRepository> = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue({ id: 'v-1', clienteId: 'c-1' } as any),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByPlaca: jest.fn(),
      findByClienteId: jest.fn(),
    };

    const servico: jest.Mocked<ServicoRepository> = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue({
        nome: 'X',
        precoBase: { value: 100 },
      } as any),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByNome: jest.fn(),
    };

    const produto: jest.Mocked<ProdutoRepository> = {
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue({
        nome: 'P',
        precoUnitario: { value: 50 },
      } as any),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByNome: jest.fn(),
    };

    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdemDeServicoCommandService,
        { provide: ORDEM_DE_SERVICO_REPOSITORY, useValue: repository },
        { provide: CLIENTE_REPOSITORY, useValue: cliente },
        { provide: VEICULO_REPOSITORY, useValue: veiculo },
        { provide: SERVICO_REPOSITORY, useValue: servico },
        { provide: PRODUTO_REPOSITORY, useValue: produto },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get(OrdemDeServicoCommandService);
  });

  it('create emite OsAcaoEvent com acao CRIAR', async () => {
    repository.create.mockImplementation(async (o) =>
      OrdemDeServico.reconstitute({
        id: 'os-1',
        numero: o.numero,
        clienteId: o.clienteId,
        veiculoId: o.veiculoId,
        usuarioId: null,
        descricaoInicial: o.descricaoInicial,
        diagnostico: null,
        status: StatusOS.RECEBIDA,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await service.create(
      {
        clienteId: 'c-1',
        veiculoId: 'v-1',
        descricaoInicial: 'cliente reclama de barulho',
      },
      { usuarioId: 'u-1' },
    );

    const acaoCalls = eventEmitter.emit.mock.calls.filter(
      (c) => c[0] === OsAcaoEvent.EVENT_NAME,
    );
    expect(acaoCalls).toHaveLength(1);
    const event = acaoCalls[0][1] as OsAcaoEvent;
    expect(event.acao).toBe('CRIAR');
    expect(event.statusAnterior).toBeNull();
    expect(event.statusNovo).toBe('RECEBIDA');
    expect(event.usuarioId).toBe('u-1');
  });

  it('atribuirMecanico emite ATRIBUIR_MECANICO com mecanicoId no metadata', async () => {
    repository.findById.mockResolvedValue(fazerOs(StatusOS.RECEBIDA));

    await service.atribuirMecanico('os-1', 'mec-9', { usuarioId: 'admin-1' });

    const acao = eventEmitter.emit.mock.calls.find(
      (c) => c[0] === OsAcaoEvent.EVENT_NAME,
    )![1] as OsAcaoEvent;
    expect(acao.acao).toBe('ATRIBUIR_MECANICO');
    expect(acao.statusAnterior).toBe('RECEBIDA');
    expect(acao.statusNovo).toBe('EM_DIAGNOSTICO');
    expect(acao.metadata).toEqual({ mecanicoId: 'mec-9' });
  });

  it('completarDiagnostico emite OsAcaoEvent E OrcamentoProntoEvent', async () => {
    repository.findById.mockResolvedValue(fazerOs(StatusOS.EM_DIAGNOSTICO));

    await service.completarDiagnostico('os-1', 'pastilhas desgastadas demais', {
      usuarioId: 'mec-1',
    });

    const tipos = eventEmitter.emit.mock.calls.map((c) => c[0]);
    expect(tipos).toContain(OsAcaoEvent.EVENT_NAME);
    expect(tipos).toContain(OrcamentoProntoEvent.EVENT_NAME);
  });

  it('aprovarOrcamento emite OsAcaoEvent com transicao correta', async () => {
    repository.findById.mockResolvedValue(
      fazerOs(StatusOS.AGUARDANDO_APROVACAO),
    );

    await service.aprovarOrcamento('os-1', { usuarioId: 'cli-1' });

    const acao = eventEmitter.emit.mock.calls.find(
      (c) => c[0] === OsAcaoEvent.EVENT_NAME,
    )![1] as OsAcaoEvent;
    expect(acao.acao).toBe('APROVAR_ORCAMENTO');
    expect(acao.statusAnterior).toBe('AGUARDANDO_APROVACAO');
    expect(acao.statusNovo).toBe('EM_EXECUCAO');
  });

  it('finalizarExecucao emite OsAcaoEvent E OsFinalizadaEvent', async () => {
    repository.findById.mockResolvedValue(fazerOs(StatusOS.EM_EXECUCAO));

    await service.finalizarExecucao('os-1', { usuarioId: 'mec-1' });

    const tipos = eventEmitter.emit.mock.calls.map((c) => c[0]);
    expect(tipos).toContain(OsAcaoEvent.EVENT_NAME);
    expect(tipos).toContain(OsFinalizadaEvent.EVENT_NAME);
  });

  it('delete emite DELETAR mesmo apagando a OS', async () => {
    repository.findById.mockResolvedValue(fazerOs(StatusOS.CANCELADA));

    await service.delete('os-1', { usuarioId: 'admin-1' });

    const acao = eventEmitter.emit.mock.calls.find(
      (c) => c[0] === OsAcaoEvent.EVENT_NAME,
    )![1] as OsAcaoEvent;
    expect(acao.acao).toBe('DELETAR');
    expect(acao.statusNovo).toBeNull();
  });

  it('comandos sem ctx tratam usuarioId como null', async () => {
    repository.findById.mockResolvedValue(fazerOs(StatusOS.AGUARDANDO_APROVACAO));

    await service.aprovarOrcamento('os-1');

    const acao = eventEmitter.emit.mock.calls.find(
      (c) => c[0] === OsAcaoEvent.EVENT_NAME,
    )![1] as OsAcaoEvent;
    expect(acao.usuarioId).toBeNull();
  });
});
