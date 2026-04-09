import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Servico, CreateServicoProps, UpdateServicoProps } from '../domain/servico.entity';
import {
  ServicoRepository,
  SERVICO_REPOSITORY,
  FindAllParams,
  PaginatedResult,
} from '../domain/servico.repository';
import { DuplicateNameError } from '../domain/errors/duplicate-name.error';

@Injectable()
export class ServicoService {
  constructor(
    @Inject(SERVICO_REPOSITORY)
    private readonly repository: ServicoRepository,
  ) {}

  async create(props: CreateServicoProps): Promise<Servico> {
    const exists = await this.repository.existsByNome(props.nome);
    if (exists) {
      throw new DuplicateNameError(props.nome);
    }

    const servico = Servico.create(props);
    return this.repository.create(servico);
  }

  async findAll(params: FindAllParams): Promise<PaginatedResult<Servico>> {
    return this.repository.findAll(params);
  }

  async findById(id: string): Promise<Servico> {
    const servico = await this.repository.findById(id);
    if (!servico) {
      throw new NotFoundException(`Servico com id '${id}' nao encontrado`);
    }
    return servico;
  }

  async update(id: string, props: UpdateServicoProps): Promise<Servico> {
    const servico = await this.repository.findById(id);
    if (!servico) {
      throw new NotFoundException(`Servico com id '${id}' nao encontrado`);
    }

    if (props.nome !== undefined) {
      const exists = await this.repository.existsByNome(props.nome, id);
      if (exists) {
        throw new DuplicateNameError(props.nome);
      }
    }

    servico.update(props);
    return this.repository.update(servico);
  }

  async delete(id: string): Promise<void> {
    const servico = await this.repository.findById(id);
    if (!servico) {
      throw new NotFoundException(`Servico com id '${id}' nao encontrado`);
    }
    await this.repository.delete(id);
  }
}
