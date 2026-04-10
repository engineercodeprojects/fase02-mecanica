import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddStockDto {
  @ApiProperty({ description: 'Quantidade a adicionar ao estoque', example: 20 })
  @IsInt()
  @IsPositive()
  quantidade: number;
}
