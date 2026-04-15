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
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { VeiculoService } from "../application/veiculo.service";
import { CreateVeiculoDto } from "./dto/create-veiculo.dto";
import { UpdateVeiculoDto } from "./dto/update-veiculo.dto";
import { QueryVeiculoDto } from "./dto/query-veiculo.dto";
import { DuplicatePlacaError } from "../domain/errors/duplicate-placa.error";
import { InvalidPlacaError } from "../domain/errors/invalid-placa.error";
import { ClienteNotFoundError } from "../domain/errors/cliente-not-found.error";

@ApiTags("Veiculos")
@Controller("veiculos")
export class VeiculoController {
  constructor(private readonly service: VeiculoService) {}

  @Post()
  @ApiOperation({ summary: "Cadastrar um novo veiculo" })
  @ApiCreatedResponse({ description: "Veiculo criado com sucesso" })
  @ApiConflictResponse({ description: "Ja existe um veiculo com essa placa" })
  @ApiNotFoundResponse({ description: "Cliente nao encontrado" })
  async create(@Body() dto: CreateVeiculoDto) {
    try {
      return this.toResponse(await this.service.create(dto));
    } catch (error) {
      if (error instanceof DuplicatePlacaError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof InvalidPlacaError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof ClienteNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: "Listar veiculos com paginacao e filtro" })
  @ApiOkResponse({ description: "Lista de veiculos paginada" })
  async findAll(@Query() query: QueryVeiculoDto) {
    const result = await this.service.findAll({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      marca: query.marca,
    });

    return {
      data: result.data.map((v) => this.toResponse(v)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar veiculo por ID" })
  @ApiOkResponse({ description: "Veiculo encontrado" })
  @ApiNotFoundResponse({ description: "Veiculo nao encontrado" })
  async findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.toResponse(await this.service.findById(id));
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar um veiculo" })
  @ApiOkResponse({ description: "Veiculo atualizado com sucesso" })
  @ApiNotFoundResponse({ description: "Veiculo nao encontrado" })
  @ApiConflictResponse({ description: "Ja existe um veiculo com essa placa" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateVeiculoDto,
  ) {
    try {
      return this.toResponse(await this.service.update(id, dto));
    } catch (error) {
      if (error instanceof DuplicatePlacaError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof InvalidPlacaError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remover um veiculo" })
  @ApiOkResponse({ description: "Veiculo removido com sucesso" })
  @ApiNotFoundResponse({ description: "Veiculo nao encontrado" })
  async delete(@Param("id", ParseUUIDPipe) id: string) {
    await this.service.delete(id);
  }

  private toResponse(veiculo: {
    id?: string;
    placa: { value: string };
    marca: string;
    modelo: string;
    ano: number;
    clienteId: string;
    ativo: boolean;
  }) {
    return {
      id: veiculo.id,
      placa: veiculo.placa.value,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
      clienteId: veiculo.clienteId,
      ativo: veiculo.ativo,
    };
  }
}
