import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class WebhookAprovacaoDto {
  @ApiProperty({
    description: 'true para aprovar, false para reprovar',
    example: true,
  })
  @IsBoolean()
  aprovado: boolean;

  @ApiPropertyOptional({
    description: 'Motivo da reprovacao (obrigatorio quando aprovado=false)',
    example: 'Valor acima do esperado',
  })
  @IsOptional()
  @IsString()
  motivo?: string;
}
