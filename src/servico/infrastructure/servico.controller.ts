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
import { ServicoService } from '../application/servico.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';
import { QueryServicoDto } from './dto/query-servico.dto';
import { DuplicateNameError } from '../domain/errors/duplicate-name.error';

@ApiTags('Servicos')
@Controller('servicos')
export class ServicoController {
  constructor(private readonly service: ServicoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo servico' })
  @ApiCreatedResponse({ description: 'Servico criado com sucesso' })
  @ApiConflictResponse({ description: 'Ja existe um servico com esse nome' })
  async create(@Body() dto: CreateServicoDto) {
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
  @ApiOperation({ summary: 'Listar servicos com paginacao e filtro' })
  @ApiOkResponse({ description: 'Lista de servicos paginada' })
  async findAll(@Query() query: QueryServicoDto) {
    const result = await this.service.findAll({
      page: query.page!,
      limit: query.limit!,
      nome: query.nome,
    });

    return {
      data: result.data.map((s) => this.toResponse(s)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar servico por ID' })
  @ApiOkResponse({ description: 'Servico encontrado' })
  @ApiNotFoundResponse({ description: 'Servico nao encontrado' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.toResponse(await this.service.findById(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um servico' })
  @ApiOkResponse({ description: 'Servico atualizado com sucesso' })
  @ApiNotFoundResponse({ description: 'Servico nao encontrado' })
  @ApiConflictResponse({ description: 'Ja existe um servico com esse nome' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServicoDto,
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um servico' })
  @ApiOkResponse({ description: 'Servico removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Servico nao encontrado' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.delete(id);
  }

  private toResponse(servico: { id?: string; nome: string; descricao?: string | null; precoBase: { value: number }; tempoEstimadoHoras: number; ativo: boolean }) {
    return {
      id: servico.id,
      nome: servico.nome,
      descricao: servico.descricao,
      precoBase: servico.precoBase.value,
      tempoEstimadoHoras: servico.tempoEstimadoHoras,
      ativo: servico.ativo,
    };
  }
}
