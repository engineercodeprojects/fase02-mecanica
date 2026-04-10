import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaProdutoRepository } from './prisma-produto.repository';
import { Produto } from '../domain/produto.entity';
import { startTestDatabase, stopTestDatabase } from '../../test/database.container';

jest.setTimeout(60000);

describe('PrismaProdutoRepository (integration)', () => {
  let repository: PrismaProdutoRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const databaseUrl = await startTestDatabase();
    process.env.DATABASE_URL = databaseUrl;

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, PrismaProdutoRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    repository = module.get<PrismaProdutoRepository>(PrismaProdutoRepository);

    await prisma.onModuleInit();
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await prisma.produto.deleteMany();
  });

  describe('create', () => {
    it('should persist and return a Produto with generated id', async () => {
      const produto = Produto.create({
        nome: 'Filtro de oleo',
        descricao: 'Filtro para motor',
        precoUnitario: 29.9,
        quantidadeEstoque: 50,
        estoqueMinimo: 10,
      });

      const result = await repository.create(produto);

      expect(result.id).toBeDefined();
      expect(result.nome).toBe('Filtro de oleo');
      expect(result.precoUnitario.value).toBe(29.9);
      expect(result.quantidadeEstoque).toBe(50);
      expect(result.quantidadeReservada).toBe(0);
      expect(result.estoqueMinimo).toBe(10);
      expect(result.ativo).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return a Produto by id', async () => {
      const created = await repository.create(
        Produto.create({ nome: 'Pastilha de freio', precoUnitario: 89.9, quantidadeEstoque: 20, estoqueMinimo: 5 }),
      );

      const found = await repository.findById(created.id!);
      expect(found).not.toBeNull();
      expect(found!.nome).toBe('Pastilha de freio');
    });

    it('should return null when not found', async () => {
      const found = await repository.findById('00000000-0000-0000-0000-000000000000');
      expect(found).toBeNull();
    });
  });

  describe('existsByNome', () => {
    it('should return true when nome exists (case-insensitive)', async () => {
      await repository.create(
        Produto.create({ nome: 'Filtro de oleo', precoUnitario: 30, quantidadeEstoque: 50, estoqueMinimo: 10 }),
      );

      expect(await repository.existsByNome('filtro de oleo')).toBe(true);
    });

    it('should return false when nome does not exist', async () => {
      expect(await repository.existsByNome('Inexistente')).toBe(false);
    });

    it('should exclude a specific id', async () => {
      const created = await repository.create(
        Produto.create({ nome: 'Filtro de ar', precoUnitario: 25, quantidadeEstoque: 30, estoqueMinimo: 5 }),
      );

      expect(await repository.existsByNome('Filtro de ar', created.id!)).toBe(false);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      const items = [
        { nome: 'Filtro de oleo', precoUnitario: 30, quantidadeEstoque: 50, estoqueMinimo: 10 },
        { nome: 'Filtro de ar', precoUnitario: 25, quantidadeEstoque: 30, estoqueMinimo: 5 },
        { nome: 'Pastilha de freio', precoUnitario: 90, quantidadeEstoque: 20, estoqueMinimo: 5 },
        { nome: 'Oleo 5W30', precoUnitario: 45, quantidadeEstoque: 100, estoqueMinimo: 20 },
        { nome: 'Correia dentada', precoUnitario: 120, quantidadeEstoque: 15, estoqueMinimo: 3 },
      ];
      for (const item of items) {
        await repository.create(Produto.create(item));
      }
    });

    it('should return paginated results', async () => {
      const result = await repository.findAll({ page: 1, limit: 2 });
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(5);
    });

    it('should return second page', async () => {
      const result = await repository.findAll({ page: 2, limit: 2 });
      expect(result.data).toHaveLength(2);
      expect(result.page).toBe(2);
    });

    it('should filter by nome (case-insensitive)', async () => {
      const result = await repository.findAll({ page: 1, limit: 10, nome: 'filtro' });
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should return empty when no match', async () => {
      const result = await repository.findAll({ page: 1, limit: 10, nome: 'xyz' });
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should order by nome ascending', async () => {
      const result = await repository.findAll({ page: 1, limit: 10 });
      const names = result.data.map((p) => p.nome);
      expect(names).toEqual([...names].sort());
    });
  });

  describe('update', () => {
    it('should persist updated fields including stock', async () => {
      const created = await repository.create(
        Produto.create({ nome: 'Filtro', precoUnitario: 30, quantidadeEstoque: 50, estoqueMinimo: 10 }),
      );

      created.update({ nome: 'Filtro premium' });
      created.reserve(5);
      const updated = await repository.update(created);

      expect(updated.nome).toBe('Filtro premium');
      expect(updated.quantidadeReservada).toBe(5);
      expect(updated.quantidadeDisponivel).toBe(45);
    });
  });

  describe('delete', () => {
    it('should delete a Produto', async () => {
      const created = await repository.create(
        Produto.create({ nome: 'Temporario', precoUnitario: 10, quantidadeEstoque: 1, estoqueMinimo: 0 }),
      );

      await repository.delete(created.id!);
      expect(await repository.findById(created.id!)).toBeNull();
    });
  });
});
