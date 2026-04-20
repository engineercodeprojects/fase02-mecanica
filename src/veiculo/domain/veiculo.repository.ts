import { Veiculo } from "./veiculo.entity";

export interface FindAllParams {
  page: number;
  limit: number;
  clienteId?: string;
  marca?: string;
  placa?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface VeiculoRepository {
  existsByPlaca(placa: string, excludeId?: string): Promise<boolean>;
  create(veiculo: Veiculo): Promise<Veiculo>;
  findById(id: string): Promise<Veiculo | null>;
  findAll(params: FindAllParams): Promise<PaginatedResult<Veiculo>>;
  findByClienteId(clienteId: string): Promise<Veiculo[]>;
  update(veiculo: Veiculo): Promise<Veiculo>;
  delete(id: string): Promise<void>;
}

export const VEICULO_REPOSITORY = Symbol("VeiculoRepository");
