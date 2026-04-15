import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateVeiculoDto } from "./create-veiculo.dto";

// Exclui clienteId do update (nao pode trocar o dono via update)
export class UpdateVeiculoDto extends PartialType(
  OmitType(CreateVeiculoDto, ["clienteId"] as const),
) {}
