import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

enum RoleEnum {
  ADMIN = 'ADMIN',
  ATENDENTE = 'ATENDENTE',
  MECANICO = 'MECANICO',
  ESTOQUISTA = 'ESTOQUISTA',
  CLIENTE = 'CLIENTE',
}

export class UpdateUsuarioDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva Atualizado',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  nome?: string;

  @ApiProperty({
    description: 'Email único do usuário',
    example: 'joao.novo@mecanica.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Papel do usuário no sistema',
    enum: RoleEnum,
    example: 'ATENDENTE',
    required: false,
  })
  @IsEnum(RoleEnum)
  @IsOptional()
  role?: string;

  @ApiProperty({
    description: 'Status ativo/inativo do usuário',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
