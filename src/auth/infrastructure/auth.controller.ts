import { Body, Controller, Get, HttpCode, HttpStatus, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { LoginDto } from './dto/login.dto';
import { InvalidCredentialsError } from '../domain/errors/invalid-credentials.error';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Usuario } from '../domain/usuario.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuario e retornar JWT' })
  @ApiUnauthorizedResponse({ description: 'Credenciais invalidas' })
  async login(@Body() dto: LoginDto) {
    try {
      return await this.service.login(dto.email, dto.senha);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna informacoes do usuario autenticado' })
  async me(@CurrentUser() user: Usuario) {
    return {
      id: user.id,
      nome: user.nome,
      email: user.email.value,
      role: user.role,
    };
  }
}
