import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  Veiculo,
  CreateVeiculoProps,
  UpdateVeiculoProps,
} from "../domain/veiculo.entity";
import {
  VeiculoRepository,
  VEICULO_REPOSITORY,
  FindAllParams,
  PaginatedResult,
} from "../domain/veiculo.repository";
import { DuplicatePlacaError } from "../domain/errors/duplicate-placa.error";
import { ClienteNotFoundError } from "../domain/errors/cliente-not-found.error";
import { ClienteService } from "../../cliente/application/cliente.service";

@Injectable()
export class VeiculoService {
  constructor(
    @Inject(VEICULO_REPOSITORY)
    private readonly repository: VeiculoRepository,
    private readonly clienteService: ClienteService,
  ) {}

  async create(props: CreateVeiculoProps): Promise<Veiculo> {
    // Verifica se o cliente existe
    try {
      await this.clienteService.findById(props.clienteId);
    } catch {
      throw new ClienteNotFoundError(props.clienteId);
    }

    // Verifica duplicidade de placa
    const exists = await this.repository.existsByPlaca(props.placa);
    if (exists) {
      throw new DuplicatePlacaError(props.placa);
    }

    const veiculo = Veiculo.create(props);
    return this.repository.create(veiculo);
  }

  async findAll(params: FindAllParams): Promise<PaginatedResult<Veiculo>> {
    return this.repository.findAll(params);
  }

  async findById(id: string): Promise<Veiculo> {
    const veiculo = await this.repository.findById(id);
    if (!veiculo) {
      throw new NotFoundException(`Veiculo com id '${id}' nao encontrado`);
    }
    return veiculo;
  }

  async findByClienteId(clienteId: string): Promise<Veiculo[]> {
    // Verifica se o cliente existe
    try {
      await this.clienteService.findById(clienteId);
    } catch {
      throw new ClienteNotFoundError(clienteId);
    }

    return this.repository.findByClienteId(clienteId);
  }

  async update(id: string, props: UpdateVeiculoProps): Promise<Veiculo> {
    const veiculo = await this.repository.findById(id);
    if (!veiculo) {
      throw new NotFoundException(`Veiculo com id '${id}' nao encontrado`);
    }

    if (props.placa !== undefined) {
      const exists = await this.repository.existsByPlaca(props.placa, id);
      if (exists) {
        throw new DuplicatePlacaError(props.placa);
      }
    }

    veiculo.update(props);
    return this.repository.update(veiculo);
  }

  async delete(id: string): Promise<void> {
    const veiculo = await this.repository.findById(id);
    if (!veiculo) {
      throw new NotFoundException(`Veiculo com id '${id}' nao encontrado`);
    }
    await this.repository.delete(id);
  }
}
