import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiConflictResponse,
} from "@nestjs/swagger";
import { UsuarioService, UsuarioOutput } from "../application/usuario.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { QueryUsuarioDto } from "./dto/query-usuario.dto";
import { JwtAuthGuard } from "../../auth/infrastructure/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/infrastructure/guards/roles.guard";
import { Roles } from "../../auth/infrastructure/decorators/roles.decorator";
import { Role } from "../../auth/domain/role.enum";
import { UsuarioNotFoundError } from "../domain/errors/usuario-not-found.error";
import { EmailAlreadyExistsError } from "../domain/errors/email-already-exists.error";
import { InvalidRoleError } from "../domain/errors/invalid-role.error";

@ApiTags("Usuario")
@Controller("usuario")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioController {
  constructor(private readonly service: UsuarioService) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Criar novo usuário" })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: "Usuário criado com sucesso",
    schema: {
      example: {
        id: "uuid-123",
        nome: "João Mecânico",
        email: "joao@mecanica.com",
        role: "MECANICO",
        ativo: true,
      },
    },
  })
  @ApiBadRequestResponse({ description: "Dados inválidos" })
  @ApiConflictResponse({ description: "Email já registrado" })
  async create(@Body() dto: CreateUsuarioDto): Promise<UsuarioOutput> {
    try {
      return await this.service.create(dto);
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        throw new Error(error.message);
      }
      if (error instanceof InvalidRoleError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Listar usuários com paginação" })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: "Lista de usuários",
    schema: {
      example: {
        data: [
          {
            id: "uuid-123",
            nome: "João",
            email: "joao@test.com",
            role: "MECANICO",
            ativo: true,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
    },
  })
  async findAll(@Query() query: QueryUsuarioDto) {
    return await this.service.findAll(query);
  }

  @Get(":id")
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Buscar usuário por ID" })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: "Usuário encontrado",
    schema: {
      example: {
        id: "uuid-123",
        nome: "João",
        email: "joao@test.com",
        role: "MECANICO",
        ativo: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  async findById(@Param("id") id: string): Promise<UsuarioOutput> {
    try {
      return await this.service.findById(id);
    } catch (error) {
      if (error instanceof UsuarioNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Put(":id")
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Atualizar usuário" })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: "Usuário atualizado com sucesso",
    schema: {
      example: {
        id: "uuid-123",
        nome: "João Atualizado",
        email: "joao.novo@test.com",
        role: "ATENDENTE",
        ativo: false,
      },
    },
  })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  @ApiConflictResponse({ description: "Email já registrado" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<UsuarioOutput> {
    try {
      return await this.service.update(id, dto);
    } catch (error) {
      if (error instanceof UsuarioNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof EmailAlreadyExistsError) {
        throw new Error(error.message);
      }
      if (error instanceof InvalidRoleError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Deletar usuário" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Usuário deletado com sucesso" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  async delete(@Param("id") id: string): Promise<void> {
    try {
      await this.service.delete(id);
    } catch (error) {
      if (error instanceof UsuarioNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
