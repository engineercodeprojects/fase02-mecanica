import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  Cliente,
  CreateClienteProps,
  UpdateClienteProps,
} from "../domain/cliente.entity";
import {
  ClienteRepository,
  CLIENTE_REPOSITORY,
  FindAllParams,
  PaginatedResult,
} from "../domain/cliente.repository";
import { DuplicateCpfCnpjError } from "../domain/errors/duplicate-cpf-cnpj.error";

@Injectable()
export class ClienteService {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly repository: ClienteRepository,
  ) {}

  async create(props: CreateClienteProps): Promise<Cliente> {
    const cpfCnpjClean = props.cpfCnpj.replace(/\D/g, "");
    const exists = await this.repository.existsByCpfCnpj(cpfCnpjClean);
    if (exists) {
      throw new DuplicateCpfCnpjError(props.cpfCnpj);
    }

    const cliente = Cliente.create(props);
    return this.repository.create(cliente);
  }

  async findAll(params: FindAllParams): Promise<PaginatedResult<Cliente>> {
    return this.repository.findAll(params);
  }

  async findById(id: string): Promise<Cliente> {
    const cliente = await this.repository.findById(id);
    if (!cliente) {
      throw new NotFoundException(`Cliente com id '${id}' nao encontrado`);
    }
    return cliente;
  }

  async update(id: string, props: UpdateClienteProps): Promise<Cliente> {
    const cliente = await this.repository.findById(id);
    if (!cliente) {
      throw new NotFoundException(`Cliente com id '${id}' nao encontrado`);
    }

    cliente.update(props);
    return this.repository.update(cliente);
  }

  async delete(id: string): Promise<void> {
    const cliente = await this.repository.findById(id);
    if (!cliente) {
      throw new NotFoundException(`Cliente com id '${id}' nao encontrado`);
    }
    await this.repository.delete(id);
  }
}
