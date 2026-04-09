import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Servico } from '../domain/servico.entity';
import {
  ServicoRepository,
  FindAllParams,
  PaginatedResult,
} from '../domain/servico.repository';

@Injectable()
export class PrismaServicoRepository implements ServicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsByNome(nome: string, excludeId?: string): Promise<boolean> {
    const record = await this.prisma.servico.findFirst({
      where: {
        nome: { equals: nome, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return record !== null;
  }

  async create(servico: Servico): Promise<Servico> {
    const record = await this.prisma.servico.create({
      data: {
        nome: servico.nome,
        descricao: servico.descricao ?? null,
        precoBase: servico.precoBase.value,
        tempoEstimadoHoras: servico.tempoEstimadoHoras,
        ativo: servico.ativo,
      },
    });

    return this.toDomain(record);
  }

  async findById(id: string): Promise<Servico | null> {
    const record = await this.prisma.servico.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(params: FindAllParams): Promise<PaginatedResult<Servico>> {
    const { page, limit, nome } = params;
    const skip = (page - 1) * limit;

    const where = nome
      ? { nome: { contains: nome, mode: 'insensitive' as const } }
      : {};

    const [records, total] = await Promise.all([
      this.prisma.servico.findMany({ where, skip, take: limit, orderBy: { nome: 'asc' } }),
      this.prisma.servico.count({ where }),
    ]);

    return {
      data: records.map((r) => this.toDomain(r)),
      total,
      page,
      limit,
    };
  }

  async update(servico: Servico): Promise<Servico> {
    const record = await this.prisma.servico.update({
      where: { id: servico.id },
      data: {
        nome: servico.nome,
        descricao: servico.descricao ?? null,
        precoBase: servico.precoBase.value,
        tempoEstimadoHoras: servico.tempoEstimadoHoras,
        ativo: servico.ativo,
      },
    });

    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.servico.delete({ where: { id } });
  }

  private toDomain(record: {
    id: string;
    nome: string;
    descricao: string | null;
    precoBase: unknown;
    tempoEstimadoHoras: number;
    ativo: boolean;
  }): Servico {
    return Servico.reconstitute({
      id: record.id,
      nome: record.nome,
      descricao: record.descricao,
      precoBase: Number(record.precoBase),
      tempoEstimadoHoras: record.tempoEstimadoHoras,
      ativo: record.ativo,
    });
  }
}
