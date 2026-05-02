import { OrdemDeServico } from './ordem-de-servico.entity';

export const ORDEM_DE_SERVICO_REPOSITORY = 'ORDEM_DE_SERVICO_REPOSITORY';

export interface FindAllParams {
  page?: number;
  limit?: number;
  clienteId?: string;
  status?: string;
  numero?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface TempoMedioFilters {
  servicoId?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface TempoMedioPorServico {
  servicoId: string;
  servicoNome: string;
  totalConcluidos: number;
  tempoMedioMinutos: number;
  tempoMedioHoras: number;
}

export interface TempoMedioExecucaoResult {
  totalServicosConcluidos: number;
  tempoMedioGeralMinutos: number;
  tempoMedioGeralHoras: number;
  porServico: TempoMedioPorServico[];
}

export interface OrdemDeServicoRepository {
  create(os: OrdemDeServico): Promise<OrdemDeServico>;
  findById(id: string): Promise<OrdemDeServico | null>;
  findAll(params: FindAllParams): Promise<PaginatedResult<OrdemDeServico>>;
  findByNumero(numero: string): Promise<OrdemDeServico | null>;
  update(os: OrdemDeServico): Promise<OrdemDeServico>;
  delete(id: string): Promise<void>;
  existsByNumero(numero: string): Promise<boolean>;
  getTempoMedioExecucao(
    filters: TempoMedioFilters,
  ): Promise<TempoMedioExecucaoResult>;
}
