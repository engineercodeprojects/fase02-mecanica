import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from "class-validator";

export class CreateVeiculoDto {
  @ApiProperty({
    description:
      "Placa do veiculo (formato antigo ABC-1234 ou Mercosul ABC1D23)",
    example: "ABC1D23",
  })
  @IsString()
  @IsNotEmpty()
  placa: string;

  @ApiProperty({ description: "Marca do veiculo", example: "Toyota" })
  @IsString()
  @IsNotEmpty()
  marca: string;

  @ApiProperty({ description: "Modelo do veiculo", example: "Corolla" })
  @IsString()
  @IsNotEmpty()
  modelo: string;

  @ApiProperty({ description: "Ano de fabricacao do veiculo", example: 2024 })
  @IsInt()
  @Min(1886)
  @Max(new Date().getFullYear() + 1)
  ano: number;

  @ApiProperty({
    description: "ID do cliente proprietario",
    example: "uuid-do-cliente",
  })
  @IsUUID()
  @IsNotEmpty()
  clienteId: string;
}
