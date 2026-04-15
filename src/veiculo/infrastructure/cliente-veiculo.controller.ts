import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { VeiculoService } from "../application/veiculo.service";
import { ClienteNotFoundError } from "../domain/errors/cliente-not-found.error";

@ApiTags("Clientes")
@Controller("clientes")
export class ClienteVeiculoController {
  constructor(private readonly veiculoService: VeiculoService) {}

  @Get(":clienteId/veiculos")
  @ApiOperation({ summary: "Listar veiculos de um cliente" })
  @ApiOkResponse({ description: "Lista de veiculos do cliente" })
  @ApiNotFoundResponse({ description: "Cliente nao encontrado" })
  async findByCliente(@Param("clienteId", ParseUUIDPipe) clienteId: string) {
    try {
      const veiculos = await this.veiculoService.findByClienteId(clienteId);

      return veiculos.map((v) => ({
        id: v.id,
        placa: v.placa.value,
        marca: v.marca,
        modelo: v.modelo,
        ano: v.ano,
        clienteId: v.clienteId,
        ativo: v.ativo,
      }));
    } catch (error) {
      if (error instanceof ClienteNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
