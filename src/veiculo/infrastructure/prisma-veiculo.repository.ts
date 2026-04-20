import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Veiculo } from "../domain/veiculo.entity";
import {
  VeiculoRepository,
  FindAllParams,
  PaginatedResult,
} from "../domain/veiculo.repository";

@Injectable()
export class PrismaVeiculoRepository implements VeiculoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsByPlaca(placa: string, excludeId?: string): Promise<boolean> {
    const normalized = placa.toUpperCase().replace(/-/g, "");
    const record = await this.prisma.veiculo.findFirst({
      where: {
        placa: { equals: normalized, mode: "insensitive" },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return record !== null;
  }

  async create(veiculo: Veiculo): Promise<Veiculo> {
    const record = await this.prisma.veiculo.create({
      data: {
        placa: veiculo.placa.value,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        clienteId: veiculo.clienteId,
        ativo: veiculo.ativo,
      },
    });

    return this.toDomain(record);
  }

  async findById(id: string): Promise<Veiculo | null> {
    const record = await this.prisma.veiculo.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(params: FindAllParams): Promise<PaginatedResult<Veiculo>> {
    const { page, limit, clienteId, marca, placa } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (clienteId) {
      where.clienteId = clienteId;
    }
    if (marca) {
      where.marca = { contains: marca, mode: "insensitive" };
    }
    if (placa) {
      where.placa = { contains: placa.toUpperCase().replace(/-/g, ""), mode: "insensitive" };
    }

    const [records, total] = await Promise.all([
      this.prisma.veiculo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { placa: "asc" },
      }),
      this.prisma.veiculo.count({ where }),
    ]);

    return {
      data: records.map((r) => this.toDomain(r)),
      total,
      page,
      limit,
    };
  }

  async findByClienteId(clienteId: string): Promise<Veiculo[]> {
    const records = await this.prisma.veiculo.findMany({
      where: { clienteId },
      orderBy: { placa: "asc" },
    });

    return records.map((r) => this.toDomain(r));
  }

  async update(veiculo: Veiculo): Promise<Veiculo> {
    const record = await this.prisma.veiculo.update({
      where: { id: veiculo.id },
      data: {
        placa: veiculo.placa.value,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        ativo: veiculo.ativo,
      },
    });

    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.veiculo.delete({ where: { id } });
  }

  private toDomain(record: {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    ano: number;
    clienteId: string;
    ativo: boolean;
  }): Veiculo {
    return Veiculo.reconstitute({
      id: record.id,
      placa: record.placa,
      marca: record.marca,
      modelo: record.modelo,
      ano: record.ano,
      clienteId: record.clienteId,
      ativo: record.ativo,
    });
  }
}
