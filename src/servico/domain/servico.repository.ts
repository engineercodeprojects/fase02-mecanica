import { Servico } from './servico.entity';

export interface FindAllParams {
  page: number;
  limit: number;
  nome?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ServicoRepository {
  create(servico: Servico): Promise<Servico>;
  findById(id: string): Promise<Servico | null>;
  findAll(params: FindAllParams): Promise<PaginatedResult<Servico>>;
  update(servico: Servico): Promise<Servico>;
  delete(id: string): Promise<void>;
}

export const SERVICO_REPOSITORY = Symbol('ServicoRepository');
