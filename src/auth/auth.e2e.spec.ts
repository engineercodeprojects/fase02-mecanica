import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Controller, Get, UseGuards } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from './domain/role.enum';
import { Roles } from './infrastructure/decorators/roles.decorator';
import { Public } from './infrastructure/decorators/public.decorator';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { startTestDatabase, stopTestDatabase } from '../test/database.container';

jest.setTimeout(120000);

// Test-only controller with routes protected by different roles
@Controller('test')
class TestProtectedController {
  @Get('public')
  @Public()
  publicRoute() {
    return { message: 'public' };
  }

  @Get('authenticated')
  authenticatedRoute() {
    return { message: 'authenticated' };
  }

  @Get('admin-only')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  adminRoute() {
    return { message: 'admin' };
  }

  @Get('atendente-or-admin')
  @Roles(Role.ATENDENTE, Role.ADMIN)
  @UseGuards(RolesGuard)
  atendenteRoute() {
    return { message: 'atendente-or-admin' };
  }

  @Get('staff')
  @Roles(Role.ADMIN, Role.ATENDENTE, Role.MECANICO, Role.ESTOQUISTA)
  @UseGuards(RolesGuard)
  staffRoute() {
    return { message: 'staff' };
  }
}

interface TestUser {
  nome: string;
  email: string;
  senha: string;
  role: Role;
}

const USERS: Record<string, TestUser> = {
  admin:      { nome: 'Admin',      email: 'admin@oficina.com',      senha: 'admin123',      role: Role.ADMIN },
  atendente:  { nome: 'Atendente',  email: 'atendente@oficina.com',  senha: 'atendente123',  role: Role.ATENDENTE },
  mecanico:   { nome: 'Mecanico',   email: 'mecanico@oficina.com',   senha: 'mecanico123',   role: Role.MECANICO },
  estoquista: { nome: 'Estoquista', email: 'estoquista@oficina.com', senha: 'estoquista123', role: Role.ESTOQUISTA },
  cliente:    { nome: 'Cliente',    email: 'cliente@oficina.com',    senha: 'cliente123',    role: Role.CLIENTE },
};

describe('Auth (e2e - role-based access control)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const tokens: Record<string, string> = {};

  beforeAll(async () => {
    const databaseUrl = await startTestDatabase();
    process.env.DATABASE_URL = databaseUrl;
    process.env.JWT_SECRET = 'test-secret';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestProtectedController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleRef.get<PrismaService>(PrismaService);

    // Seed test users
    await prisma.usuario.deleteMany();
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

    // Login all users and cache tokens
    for (const [key, user] of Object.entries(USERS)) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, senha: user.senha });
      tokens[key] = res.body.accessToken;
    }
  });

  afterAll(async () => {
    await app.close();
    await stopTestDatabase();
  });

  describe('POST /auth/login', () => {
    it('should return a JWT for valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: USERS.admin.email, senha: USERS.admin.senha });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.usuario.email).toBe(USERS.admin.email);
      expect(res.body.usuario.role).toBe(Role.ADMIN);
    });

    it('should return 401 for invalid password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: USERS.admin.email, senha: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ghost@oficina.com', senha: 'anything' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', senha: 'anything' });

      expect(res.status).toBe(400);
    });

    it('should return 400 when body is missing fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('Public routes', () => {
    it('should allow access without token', async () => {
      const res = await request(app.getHttpServer()).get('/test/public');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('public');
    });

    it('should allow access with any token', async () => {
      const res = await request(app.getHttpServer())
        .get('/test/public')
        .set('Authorization', `Bearer ${tokens.cliente}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Authenticated routes (no specific role)', () => {
    it('should deny access without token', async () => {
      const res = await request(app.getHttpServer()).get('/test/authenticated');
      expect(res.status).toBe(401);
    });

    it('should allow access with any valid token', async () => {
      for (const key of Object.keys(USERS)) {
        const res = await request(app.getHttpServer())
          .get('/test/authenticated')
          .set('Authorization', `Bearer ${tokens[key]}`);
        expect(res.status).toBe(200);
      }
    });

    it('should deny access with invalid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/test/authenticated')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });
  });

  describe('Role-restricted routes', () => {
    describe('ADMIN only', () => {
      it('should allow admin', async () => {
        const res = await request(app.getHttpServer())
          .get('/test/admin-only')
          .set('Authorization', `Bearer ${tokens.admin}`);
        expect(res.status).toBe(200);
      });

      it.each(['atendente', 'mecanico', 'estoquista', 'cliente'])(
        'should deny %s',
        async (role) => {
          const res = await request(app.getHttpServer())
            .get('/test/admin-only')
            .set('Authorization', `Bearer ${tokens[role]}`);
          expect(res.status).toBe(403);
        },
      );
    });

    describe('ATENDENTE or ADMIN', () => {
      it.each(['admin', 'atendente'])('should allow %s', async (role) => {
        const res = await request(app.getHttpServer())
          .get('/test/atendente-or-admin')
          .set('Authorization', `Bearer ${tokens[role]}`);
        expect(res.status).toBe(200);
      });

      it.each(['mecanico', 'estoquista', 'cliente'])(
        'should deny %s',
        async (role) => {
          const res = await request(app.getHttpServer())
            .get('/test/atendente-or-admin')
            .set('Authorization', `Bearer ${tokens[role]}`);
          expect(res.status).toBe(403);
        },
      );
    });

    describe('Staff routes (all except CLIENTE)', () => {
      it.each(['admin', 'atendente', 'mecanico', 'estoquista'])(
        'should allow %s',
        async (role) => {
          const res = await request(app.getHttpServer())
            .get('/test/staff')
            .set('Authorization', `Bearer ${tokens[role]}`);
          expect(res.status).toBe(200);
        },
      );

      it('should deny cliente', async () => {
        const res = await request(app.getHttpServer())
          .get('/test/staff')
          .set('Authorization', `Bearer ${tokens.cliente}`);
        expect(res.status).toBe(403);
      });
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user info with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${tokens.admin}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(USERS.admin.email);
      expect(res.body.role).toBe(Role.ADMIN);
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).get('/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 when user is deactivated after login', async () => {
      // Deactivate cliente
      await prisma.usuario.update({
        where: { email: USERS.cliente.email },
        data: { ativo: false },
      });

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${tokens.cliente}`);

      expect(res.status).toBe(401);

      // Restore for other tests
      await prisma.usuario.update({
        where: { email: USERS.cliente.email },
        data: { ativo: true },
      });
    });
  });
});
