import { WebhookAprovacaoController } from './webhook-aprovacao.controller';
import { AprovarOrcamentoUseCase } from '../application/use-cases/aprovar-orcamento.use-case';
import { RejeitarOrcamentoUseCase } from '../application/use-cases/rejeitar-orcamento.use-case';
import { OrdemDeServico } from '../domain/ordem-de-servico.entity';
import { StatusOS } from '../domain/value-objects/status-os.vo';

describe('WebhookAprovacaoController', () => {
  let controller: WebhookAprovacaoController;
  let aprovarUseCase: jest.Mocked<AprovarOrcamentoUseCase>;
  let rejeitarUseCase: jest.Mocked<RejeitarOrcamentoUseCase>;

  const makeOs = (status: StatusOS): OrdemDeServico => {
    const os = OrdemDeServico.create({
      clienteId: 'cliente-id',
      veiculoId: 'veiculo-id',
      descricaoInicial: 'Barulho ao frear',
    });
    // Force status for testing via reflection
    (os as any)._status = status;
    return os;
  };

  beforeEach(() => {
    aprovarUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<AprovarOrcamentoUseCase>;

    rejeitarUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RejeitarOrcamentoUseCase>;

    controller = new WebhookAprovacaoController(aprovarUseCase, rejeitarUseCase);
  });

  it('should call aprovarOrcamentoUseCase when aprovado=true', async () => {
    const os = makeOs(StatusOS.EM_EXECUCAO);
    aprovarUseCase.execute.mockResolvedValue(os);

    const result = await controller.aprovacao('os-id', {
      aprovado: true,
    });

    expect(aprovarUseCase.execute).toHaveBeenCalledWith({ id: 'os-id' });
    expect(rejeitarUseCase.execute).not.toHaveBeenCalled();
    expect(result.id).toBe(os.id);
  });

  it('should call rejeitarOrcamentoUseCase when aprovado=false', async () => {
    const os = makeOs(StatusOS.CANCELADA);
    rejeitarUseCase.execute.mockResolvedValue(os);

    const result = await controller.aprovacao('os-id', {
      aprovado: false,
      motivo: 'Muito caro',
    });

    expect(rejeitarUseCase.execute).toHaveBeenCalledWith({ id: 'os-id' });
    expect(aprovarUseCase.execute).not.toHaveBeenCalled();
    expect(result.id).toBe(os.id);
  });
});
