import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class AtribuirMecanicoDto {
  @ApiProperty({
    description: 'ID do usuário (mecânico) a ser atribuído',
    example: 'uuid-do-mecanico',
  })
  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;
}
