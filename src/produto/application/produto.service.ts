import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Produto, CreateProdutoProps, UpdateProdutoProps } from '../domain/produto.entity';
import {
  ProdutoRepository,
  PRODUTO_REPOSITORY,
  FindAllParams,
  PaginatedResult,
} from '../domain/produto.repository';
import { DuplicateNameError } from '../domain/errors/duplicate-name.error';
import { InsufficientStockError } from '../domain/errors/insufficient-stock.error';

@Injectable()
export class ProdutoService {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly repository: ProdutoRepository,
  ) {}

  async create(props: CreateProdutoProps): Promise<Produto> {
    const exists = await this.repository.existsByNome(props.nome);
    if (exists) {
      throw new DuplicateNameError(props.nome);
    }

    const produto = Produto.create(props);
    return this.repository.create(produto);
  }

  async findAll(params: FindAllParams): Promise<PaginatedResult<Produto>> {
    return this.repository.findAll(params);
  }

  async findById(id: string): Promise<Produto> {
    const produto = await this.repository.findById(id);
    if (!produto) {
      throw new NotFoundException(`Produto com id '${id}' nao encontrado`);
    }
    return produto;
  }

  async update(id: string, props: UpdateProdutoProps): Promise<Produto> {
    const produto = await this.repository.findById(id);
    if (!produto) {
      throw new NotFoundException(`Produto com id '${id}' nao encontrado`);
    }

    if (props.nome !== undefined) {
      const exists = await this.repository.existsByNome(props.nome, id);
      if (exists) {
        throw new DuplicateNameError(props.nome);
      }
    }

    produto.update(props);
    return this.repository.update(produto);
  }

  async delete(id: string): Promise<void> {
    const produto = await this.repository.findById(id);
    if (!produto) {
      throw new NotFoundException(`Produto com id '${id}' nao encontrado`);
    }
    await this.repository.delete(id);
  }

  async reserveStock(id: string, quantity: number): Promise<Produto> {
    const produto = await this.repository.findById(id);
    if (!produto) {
      throw new NotFoundException(`Produto com id '${id}' nao encontrado`);
    }

    produto.reserve(quantity);
    return this.repository.update(produto);
  }

  async releaseStock(id: string, quantity: number): Promise<Produto> {
    const produto = await this.repository.findById(id);
    if (!produto) {
      throw new NotFoundException(`Produto com id '${id}' nao encontrado`);
    }

    produto.release(quantity);
    return this.repository.update(produto);
  }

  async addStock(id: string, quantity: number): Promise<Produto> {
    const produto = await this.repository.findById(id);
    if (!produto) {
      throw new NotFoundException(`Produto com id '${id}' nao encontrado`);
    }

    produto.addStock(quantity);
    return this.repository.update(produto);
  }
}
