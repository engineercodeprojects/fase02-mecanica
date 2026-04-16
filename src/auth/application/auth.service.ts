import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../domain/usuario.entity';
import { USUARIO_REPOSITORY, UsuarioRepository } from '../domain/usuario.repository';
import { InvalidCredentialsError } from '../domain/errors/invalid-credentials.error';
import { Role } from '../domain/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface LoginResult {
  accessToken: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    role: Role;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly repository: UsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, senha: string): Promise<LoginResult> {
    const usuario = await this.repository.findByEmail(email);
    if (!usuario || !usuario.ativo) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await bcrypt.compare(senha, usuario.senhaHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const payload: JwtPayload = {
      sub: usuario.id!,
      email: usuario.email.value,
      role: usuario.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      usuario: {
        id: usuario.id!,
        nome: usuario.nome,
        email: usuario.email.value,
        role: usuario.role,
      },
    };
  }

  async validateUserById(id: string): Promise<Usuario | null> {
    const usuario = await this.repository.findById(id);
    if (!usuario || !usuario.ativo) {
      return null;
    }
    return usuario;
  }
}
