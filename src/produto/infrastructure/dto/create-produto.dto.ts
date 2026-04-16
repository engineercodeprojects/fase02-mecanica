import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateProdutoDto {
  @ApiProperty({ description: 'Nome do produto', example: 'Filtro de oleo' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({ description: 'Descricao do produto', example: 'Filtro de oleo para motor' })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ description: 'Preco unitario', example: 29.9 })
  @IsNumber()
  @IsPositive()
  precoUnitario: number;

  @ApiProperty({ description: 'Quantidade em estoque', example: 50 })
  @IsInt()
  @Min(0)
  quantidadeEstoque: number;

  @ApiProperty({ description: 'Estoque minimo para alerta', example: 10 })
  @IsInt()
  @Min(0)
  estoqueMinimo: number;
}
