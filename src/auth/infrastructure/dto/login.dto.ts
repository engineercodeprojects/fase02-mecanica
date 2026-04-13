import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email do usuario', example: 'admin@oficina.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Senha do usuario', example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha: string;
}
