import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsUUID } from 'class-validator';

export class QueryTempoMedioDto {
  @ApiPropertyOptional({
    description: 'Filtrar pelo ID do servico (catalogo)',
    example: 'a3b1c2d4-...',
  })
  @IsOptional()
  @IsUUID()
  servicoId?: string;

  @ApiPropertyOptional({
    description: 'Considerar apenas servicos concluidos a partir desta data (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataInicio?: Date;

  @ApiPropertyOptional({
    description: 'Considerar apenas servicos concluidos ate esta data (ISO 8601)',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataFim?: Date;
}
