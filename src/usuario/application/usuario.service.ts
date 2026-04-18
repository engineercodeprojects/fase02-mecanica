import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../auth/domain/usuario.entity';
import { Role } from '../../auth/domain/role.enum';
import { UsuarioRepository, FindAllParams, PaginatedResult, USUARIO_REPOSITORY } from '../domain/usuario.repository';
import { UsuarioNotFoundError } from '../domain/errors/usuario-not-found.error';
import { EmailAlreadyExistsError } from '../domain/errors/email-already-exists.error';
import { InvalidRoleError } from '../domain/errors/invalid-role.error';

export interface UsuarioOutput {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UsuarioService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly repository: UsuarioRepository,
  ) {}

  async create(props: {
    nome: string;
    email: string;
    senha: string;
    role: string;
  }): Promise<UsuarioOutput> {
    // Validar role
    if (!Object.values(Role).includes(props.role as Role)) {
      throw new InvalidRoleError(props.role);
    }

    // Verificar se email já existe
    const usuarioExistente = await this.repository.findByEmail(props.email);
    if (usuarioExistente) {
      throw new EmailAlreadyExistsError(props.email);
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(props.senha, 10);

    // Criar usuário
    const usuario = Usuario.create({
      nome: props.nome,
      email: props.email,
      senhaHash,
      role: props.role as Role,
    });

    const created = await this.repository.create(usuario);
    return this.toOutput(created);
  }

  async findById(id: string): Promise<UsuarioOutput> {
    const usuario = await this.repository.findById(id);
    if (!usuario) {
      throw new UsuarioNotFoundError(id);
    }
    return this.toOutput(usuario);
  }

  async findByEmail(email: string): Promise<UsuarioOutput> {
    const usuario = await this.repository.findByEmail(email);
    if (!usuario) {
      throw new UsuarioNotFoundError(email);
    }
    return this.toOutput(usuario);
  }

  async findAll(params: FindAllParams): Promise<PaginatedResult<UsuarioOutput>> {
    const result = await this.repository.findAll(params);
    return {
      ...result,
      data: result.data.map((u) => this.toOutput(u)),
    };
  }

  async update(
    id: string,
    props: {
      nome?: string;
      email?: string;
      role?: string;
      ativo?: boolean;
    },
  ): Promise<UsuarioOutput> {
    const usuario = await this.repository.findById(id);
    if (!usuario) {
      throw new UsuarioNotFoundError(id);
    }

    // Se role foi alterado, validar
    if (props.role && !Object.values(Role).includes(props.role as Role)) {
      throw new InvalidRoleError(props.role);
    }

    // Se email foi alterado, verificar duplicação
    if (props.email && props.email !== usuario.email.value) {
      const usuarioComEmail = await this.repository.findByEmail(props.email);
      if (usuarioComEmail) {
        throw new EmailAlreadyExistsError(props.email);
      }
    }

    // Reconstruir usuário com as alterações
    const usuarioAtualizado = Usuario.reconstitute({
      id: usuario.id,
      nome: props.nome || usuario.nome,
      email: props.email || usuario.email.value,
      senhaHash: usuario.senhaHash,
      role: (props.role as Role) || usuario.role,
      ativo: props.ativo !== undefined ? props.ativo : usuario.ativo,
    });

    const updated = await this.repository.update(usuarioAtualizado);
    return this.toOutput(updated);
  }

  async delete(id: string): Promise<void> {
    const usuario = await this.repository.findById(id);
    if (!usuario) {
      throw new UsuarioNotFoundError(id);
    }
    await this.repository.delete(id);
  }

  private toOutput(usuario: Usuario): UsuarioOutput {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email.value,
      role: usuario.role,
      ativo: usuario.ativo,
    };
  }
}
