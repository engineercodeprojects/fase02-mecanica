import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateServicoDto {
  @ApiProperty({ description: 'Nome do servico', example: 'Troca de oleo' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({ description: 'Descricao do servico', example: 'Troca de oleo do motor com filtro' })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ description: 'Preco base do servico', example: 149.9 })
  @IsNumber()
  @IsPositive()
  precoBase: number;

  @ApiProperty({ description: 'Tempo estimado em horas', example: 1.5 })
  @IsNumber()
  @IsPositive()
  tempoEstimadoHoras: number;
}
