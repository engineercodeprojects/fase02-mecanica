import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  ConflictException,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProdutoService } from '../application/produto.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { QueryProdutoDto } from './dto/query-produto.dto';
import { AddStockDto } from './dto/add-stock.dto';
import { DuplicateNameError } from '../domain/errors/duplicate-name.error';

@ApiTags('Produtos')
@Controller('produtos')
export class ProdutoController {
  constructor(private readonly service: ProdutoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo produto' })
  @ApiCreatedResponse({ description: 'Produto criado com sucesso' })
  @ApiConflictResponse({ description: 'Ja existe um produto com esse nome' })
  async create(@Body() dto: CreateProdutoDto) {
    try {
      return this.toResponse(await this.service.create(dto));
    } catch (error) {
      if (error instanceof DuplicateNameError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar produtos com paginacao e filtro' })
  @ApiOkResponse({ description: 'Lista de produtos paginada' })
  async findAll(@Query() query: QueryProdutoDto) {
    const result = await this.service.findAll({
      page: query.page!,
      limit: query.limit!,
      nome: query.nome,
    });

    return {
      data: result.data.map((p) => this.toResponse(p)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiOkResponse({ description: 'Produto encontrado' })
  @ApiNotFoundResponse({ description: 'Produto nao encontrado' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.toResponse(await this.service.findById(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um produto' })
  @ApiOkResponse({ description: 'Produto atualizado com sucesso' })
  @ApiNotFoundResponse({ description: 'Produto nao encontrado' })
  @ApiConflictResponse({ description: 'Ja existe um produto com esse nome' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProdutoDto,
  ) {
    try {
      return this.toResponse(await this.service.update(id, dto));
    } catch (error) {
      if (error instanceof DuplicateNameError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Post(':id/estoque')
  @ApiOperation({ summary: 'Adicionar quantidade ao estoque' })
  @ApiOkResponse({ description: 'Estoque atualizado com sucesso' })
  @ApiNotFoundResponse({ description: 'Produto nao encontrado' })
  async addStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddStockDto,
  ) {
    return this.toResponse(await this.service.addStock(id, dto.quantidade));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um produto' })
  @ApiOkResponse({ description: 'Produto removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Produto nao encontrado' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.delete(id);
  }

  private toResponse(produto: {
    id?: string;
    nome: string;
    descricao?: string | null;
    precoUnitario: { value: number };
    quantidadeEstoque: number;
    quantidadeReservada: number;
    quantidadeDisponivel: number;
    estoqueMinimo: number;
    ativo: boolean;
    isLowStock: () => boolean;
  }) {
    return {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      precoUnitario: produto.precoUnitario.value,
      quantidadeEstoque: produto.quantidadeEstoque,
      quantidadeReservada: produto.quantidadeReservada,
      quantidadeDisponivel: produto.quantidadeDisponivel,
      estoqueMinimo: produto.estoqueMinimo,
      ativo: produto.ativo,
      alertaEstoqueBaixo: produto.isLowStock(),
    };
  }
}
