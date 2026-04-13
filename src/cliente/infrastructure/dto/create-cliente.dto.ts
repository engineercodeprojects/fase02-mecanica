import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateClienteDto {
  @ApiProperty({ description: "Nome do cliente", example: "Joao da Silva" })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: "CPF ou CNPJ do cliente (com ou sem formatacao)",
    example: "123.456.789-09",
  })
  @IsString()
  @IsNotEmpty()
  cpfCnpj: string;

  @ApiProperty({
    description: "Telefone do cliente",
    example: "(11) 99999-8888",
  })
  @IsString()
  @IsNotEmpty()
  telefone: string;

  @ApiPropertyOptional({
    description: "Email do cliente (opcional)",
    example: "joao@email.com",
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
