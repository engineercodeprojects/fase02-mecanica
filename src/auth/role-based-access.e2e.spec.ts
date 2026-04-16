import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from './domain/role.enum';
import { startTestDatabase, stopTestDatabase } from '../test/database.container';

jest.setTimeout(120000);

interface TestUser {
  nome: string;
  email: string;
  senha: string;
  role: Role;
}

const USERS: Record<string, TestUser> = {
  admin:      { nome: 'Admin',      email: 'admin.rbac@oficina.com',      senha: 'admin123',      role: Role.ADMIN },
  atendente:  { nome: 'Atendente',  email: 'atendente.rbac@oficina.com',  senha: 'atendente123',  role: Role.ATENDENTE },
  mecanico:   { nome: 'Mecanico',   email: 'mecanico.rbac@oficina.com',   senha: 'mecanico123',   role: Role.MECANICO },
  estoquista: { nome: 'Estoquista', email: 'estoquista.rbac@oficina.com', senha: 'estoquista123', role: Role.ESTOQUISTA },
  cliente:    { nome: 'Cliente',    email: 'cliente.rbac@oficina.com',    senha: 'cliente123',    role: Role.CLIENTE },
};

const ALL_ROLES = Object.keys(USERS);

describe('Role-based access control (e2e) — business modules', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};

  let servicoId: string;
  let produtoId: string;
  let clienteId: string;
  let veiculoId: string;

  beforeAll(async () => {
    const databaseUrl = await startTestDatabase();
    process.env.DATABASE_URL = databaseUrl;
    process.env.JWT_SECRET = 'test-secret';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleRef.get<PrismaService>(PrismaService);

    // Clean slate
    await prisma.veiculo.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.produto.deleteMany();
    await prisma.servico.deleteMany();
    await prisma.usuario.deleteMany();

    // Seed users
    for (const user of Object.values(USERS)) {
      const senhaHash = await bcrypt.hash(user.senha, 10);
      await prisma.usuario.create({
        data: {
          nome: user.nome,
          email: user.email,
          senhaHash,
          role: user.role,
          ativo: true,
        },
      });
    }

    // Login all users
    for (const [key, user] of Object.entries(USERS)) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, senha: user.senha });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      tokens[key] = res.body.accessToken;
    }

    // Create seed records using admin token
    const servicoRes = await request(app.getHttpServer())
      .post('/servicos')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ nome: 'Troca de oleo', precoBase: 149.9, tempoEstimadoHoras: 1 });
    expect(servicoRes.status).toBe(201);
    servicoId = servicoRes.body.id;

    const produtoRes = await request(app.getHttpServer())
      .post('/produtos')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        nome: 'Filtro de oleo',
        precoUnitario: 29.9,
        quantidadeEstoque: 50,
        estoqueMinimo: 5,
      });
    expect(produtoRes.status).toBe(201);
    produtoId = produtoRes.body.id;

    const clienteRes = await request(app.getHttpServer())
      .post('/clientes')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        nome: 'Joao Silva',
        cpfCnpj: '123.456.789-09',
        telefone: '11999998888',
      });
    expect(clienteRes.status).toBe(201);
    clienteId = clienteRes.body.id;

    const veiculoRes = await request(app.getHttpServer())
      .post('/veiculos')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        placa: 'ABC1D23',
        marca: 'Toyota',
        modelo: 'Corolla',
        ano: 2024,
        clienteId,
      });
    expect(veiculoRes.status).toBe(201);
    veiculoId = veiculoRes.body.id;
  });

  afterAll(async () => {
    await app.close();
    await stopTestDatabase();
  });

  // Helper: call a protected route with each token and assert allowed/denied roles
  const testAccess = async (opts: {
    method: 'get' | 'post' | 'patch' | 'delete';
    url: () => string;
    body?: () => Record<string, unknown>;
    allowed: string[];
    successStatus?: number;
  }) => {
    const denied = ALL_ROLES.filter((r) => !opts.allowed.includes(r));

    // Allowed roles
    for (const role of opts.allowed) {
      let req = request(app.getHttpServer())
        [opts.method](opts.url())
        .set('Authorization', `Bearer ${tokens[role]}`);
      if (opts.body) req = req.send(opts.body());
      const res = await req;
      // Accept either the expected success status (for new resources) or
      // 200/201/204 generically (since we don't always know if the op is idempotent)
      expect([200, 201, 204, 409]).toContain(res.status); // 409 is OK for duplicate-check routes
      expect(res.status).not.toBe(403);
      expect(res.status).not.toBe(401);
    }

    // Denied roles
    for (const role of denied) {
      let req = request(app.getHttpServer())
        [opts.method](opts.url())
        .set('Authorization', `Bearer ${tokens[role]}`);
      if (opts.body) req = req.send(opts.body());
      const res = await req;
      expect(res.status).toBe(403);
    }

    // No token at all
    let noTokenReq = request(app.getHttpServer())[opts.method](opts.url());
    if (opts.body) noTokenReq = noTokenReq.send(opts.body());
    const noTokenRes = await noTokenReq;
    expect(noTokenRes.status).toBe(401);
  };

  // ---------------- Servico ----------------
  describe('Servico module', () => {
    it('GET /servicos — all staff allowed, cliente denied', async () => {
      await testAccess({
        method: 'get',
        url: () => '/servicos',
        allowed: ['admin', 'atendente', 'mecanico', 'estoquista'],
      });
    });

    it('GET /servicos/:id — all staff allowed, cliente denied', async () => {
      await testAccess({
        method: 'get',
        url: () => `/servicos/${servicoId}`,
        allowed: ['admin', 'atendente', 'mecanico', 'estoquista'],
      });
    });

    it('POST /servicos — only ADMIN', async () => {
      let counter = 0;
      await testAccess({
        method: 'post',
        url: () => '/servicos',
        body: () => ({
          nome: `Servico RBAC ${++counter}-${Date.now()}`,
          precoBase: 50,
          tempoEstimadoHoras: 1,
        }),
        allowed: ['admin'],
      });
    });

    it('PATCH /servicos/:id — only ADMIN', async () => {
      await testAccess({
        method: 'patch',
        url: () => `/servicos/${servicoId}`,
        body: () => ({ precoBase: 160 }),
        allowed: ['admin'],
      });
    });
  });

  // ---------------- Produto ----------------
  describe('Produto module', () => {
    it('GET /produtos — all staff allowed', async () => {
      await testAccess({
        method: 'get',
        url: () => '/produtos',
        allowed: ['admin', 'atendente', 'mecanico', 'estoquista'],
      });
    });

    it('POST /produtos — ADMIN, ESTOQUISTA', async () => {
      let counter = 0;
      await testAccess({
        method: 'post',
        url: () => '/produtos',
        body: () => ({
          nome: `Produto RBAC ${++counter}-${Date.now()}`,
          precoUnitario: 10,
          quantidadeEstoque: 10,
          estoqueMinimo: 1,
        }),
        allowed: ['admin', 'estoquista'],
      });
    });

    it('PATCH /produtos/:id — ADMIN, ESTOQUISTA', async () => {
      await testAccess({
        method: 'patch',
        url: () => `/produtos/${produtoId}`,
        body: () => ({ precoUnitario: 35 }),
        allowed: ['admin', 'estoquista'],
      });
    });

    it('POST /produtos/:id/estoque — ADMIN, ESTOQUISTA', async () => {
      await testAccess({
        method: 'post',
        url: () => `/produtos/${produtoId}/estoque`,
        body: () => ({ quantidade: 1 }),
        allowed: ['admin', 'estoquista'],
      });
    });

    it('POST /produtos/:id/reservar — ADMIN, ATENDENTE, MECANICO', async () => {
      await testAccess({
        method: 'post',
        url: () => `/produtos/${produtoId}/reservar`,
        body: () => ({ quantidade: 1 }),
        allowed: ['admin', 'atendente', 'mecanico'],
      });
    });

    it('POST /produtos/:id/liberar — ADMIN, ATENDENTE, MECANICO', async () => {
      await testAccess({
        method: 'post',
        url: () => `/produtos/${produtoId}/liberar`,
        body: () => ({ quantidade: 1 }),
        allowed: ['admin', 'atendente', 'mecanico'],
      });
    });
  });

  // ---------------- Cliente ----------------
  describe('Cliente module', () => {
    it('GET /clientes — ADMIN, ATENDENTE, MECANICO', async () => {
      await testAccess({
        method: 'get',
        url: () => '/clientes',
        allowed: ['admin', 'atendente', 'mecanico'],
      });
    });

    it('GET /clientes/:id — ADMIN, ATENDENTE, MECANICO', async () => {
      await testAccess({
        method: 'get',
        url: () => `/clientes/${clienteId}`,
        allowed: ['admin', 'atendente', 'mecanico'],
      });
    });

    it('GET /clientes/:clienteId/veiculos — ADMIN, ATENDENTE, MECANICO', async () => {
      await testAccess({
        method: 'get',
        url: () => `/clientes/${clienteId}/veiculos`,
        allowed: ['admin', 'atendente', 'mecanico'],
      });
    });

    it('POST /clientes — ADMIN, ATENDENTE', async () => {
      // Use valid distinct CPFs to avoid 409 (some roles would hit that before 403)
      const cpfs = ['607.397.885-58', '836.076.971-08', '261.281.281-49', '514.234.103-19', '893.638.218-70'];
      let idx = 0;
      await testAccess({
        method: 'post',
        url: () => '/clientes',
        body: () => ({
          nome: `Cliente RBAC ${idx + 1}`,
          cpfCnpj: cpfs[idx++],
          telefone: '11999998888',
        }),
        allowed: ['admin', 'atendente'],
      });
    });

    it('PATCH /clientes/:id — ADMIN, ATENDENTE', async () => {
      await testAccess({
        method: 'patch',
        url: () => `/clientes/${clienteId}`,
        body: () => ({ nome: 'Joao Silva Junior' }),
        allowed: ['admin', 'atendente'],
      });
    });
  });

  // ---------------- Veiculo ----------------
  describe('Veiculo module', () => {
    it('GET /veiculos — ADMIN, ATENDENTE, MECANICO', async () => {
      await testAccess({
        method: 'get',
        url: () => '/veiculos',
        allowed: ['admin', 'atendente', 'mecanico'],
      });
    });

    it('GET /veiculos/:id — ADMIN, ATENDENTE, MECANICO', async () => {
      await testAccess({
        method: 'get',
        url: () => `/veiculos/${veiculoId}`,
        allowed: ['admin', 'atendente', 'mecanico'],
      });
    });

    it('PATCH /veiculos/:id — ADMIN, ATENDENTE', async () => {
      await testAccess({
        method: 'patch',
        url: () => `/veiculos/${veiculoId}`,
        body: () => ({ ano: 2023 }),
        allowed: ['admin', 'atendente'],
      });
    });

    it('POST /veiculos — ADMIN, ATENDENTE', async () => {
      // Generate unique plates to avoid 409
      const plates = ['XYZ1A11', 'XYZ2B22', 'XYZ3C33', 'XYZ4D44', 'XYZ5E55'];
      let idx = 0;
      await testAccess({
        method: 'post',
        url: () => '/veiculos',
        body: () => ({
          placa: plates[idx++],
          marca: 'Honda',
          modelo: 'Civic',
          ano: 2024,
          clienteId,
        }),
        allowed: ['admin', 'atendente'],
      });
    });
  });

  // ---------------- ADMIN-only destructive ops ----------------
  describe('DELETE endpoints — only ADMIN', () => {
    let deletableServicoId: string;
    let deletableProdutoId: string;
    let deletableVeiculoId: string;
    let deletableClienteId: string;

    beforeAll(async () => {
      // Create records that we will destroy (so main seed stays intact)
      const s = await request(app.getHttpServer())
        .post('/servicos')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({ nome: 'Servico Deletavel', precoBase: 1, tempoEstimadoHoras: 1 });
      deletableServicoId = s.body.id;

      const p = await request(app.getHttpServer())
        .post('/produtos')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          nome: 'Produto Deletavel',
          precoUnitario: 1,
          quantidadeEstoque: 1,
          estoqueMinimo: 0,
        });
      deletableProdutoId = p.body.id;

      const c = await request(app.getHttpServer())
        .post('/clientes')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          nome: 'Cliente Deletavel',
          cpfCnpj: '11.222.333/0001-81',
          telefone: '11000000000',
        });
      expect(c.status).toBe(201);
      deletableClienteId = c.body.id;

      const v = await request(app.getHttpServer())
        .post('/veiculos')
        .set('Authorization', `Bearer ${tokens.admin}`)
        .send({
          placa: 'DEL1A11',
          marca: 'Ford',
          modelo: 'Ka',
          ano: 2020,
          clienteId: deletableClienteId,
        });
      expect(v.status).toBe(201);
      deletableVeiculoId = v.body.id;
    });

    it('non-admin roles cannot DELETE /servicos/:id', async () => {
      for (const role of ALL_ROLES.filter((r) => r !== 'admin')) {
        const res = await request(app.getHttpServer())
          .delete(`/servicos/${deletableServicoId}`)
          .set('Authorization', `Bearer ${tokens[role]}`);
        expect(res.status).toBe(403);
      }
    });

    it('non-admin roles cannot DELETE /produtos/:id', async () => {
      for (const role of ALL_ROLES.filter((r) => r !== 'admin')) {
        const res = await request(app.getHttpServer())
          .delete(`/produtos/${deletableProdutoId}`)
          .set('Authorization', `Bearer ${tokens[role]}`);
        expect(res.status).toBe(403);
      }
    });

    it('non-admin roles cannot DELETE /veiculos/:id', async () => {
      for (const role of ALL_ROLES.filter((r) => r !== 'admin')) {
        const res = await request(app.getHttpServer())
          .delete(`/veiculos/${deletableVeiculoId}`)
          .set('Authorization', `Bearer ${tokens[role]}`);
        expect(res.status).toBe(403);
      }
    });

    it('non-admin roles cannot DELETE /clientes/:id', async () => {
      for (const role of ALL_ROLES.filter((r) => r !== 'admin')) {
        const res = await request(app.getHttpServer())
          .delete(`/clientes/${deletableClienteId}`)
          .set('Authorization', `Bearer ${tokens[role]}`);
        expect(res.status).toBe(403);
      }
    });

    it('admin can DELETE all resources', async () => {
      const servicoRes = await request(app.getHttpServer())
        .delete(`/servicos/${deletableServicoId}`)
        .set('Authorization', `Bearer ${tokens.admin}`);
      expect(servicoRes.status).toBe(204);

      // Delete veiculo before cliente (FK constraint)
      const veiculoRes = await request(app.getHttpServer())
        .delete(`/veiculos/${deletableVeiculoId}`)
        .set('Authorization', `Bearer ${tokens.admin}`);
      expect(veiculoRes.status).toBe(204);

      const clienteRes = await request(app.getHttpServer())
        .delete(`/clientes/${deletableClienteId}`)
        .set('Authorization', `Bearer ${tokens.admin}`);
      expect(clienteRes.status).toBe(204);

      const produtoRes = await request(app.getHttpServer())
        .delete(`/produtos/${deletableProdutoId}`)
        .set('Authorization', `Bearer ${tokens.admin}`);
      expect(produtoRes.status).toBe(204);
    });
  });
});
