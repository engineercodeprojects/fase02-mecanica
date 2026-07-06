import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { startTestDatabase, stopTestDatabase } from '../test/database.container';

jest.setTimeout(120000);

describe('Health (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
    await stopTestDatabase();
  });

  describe('GET /health', () => {
    it('returns 200 with status ok and timestamp without authentication', async () => {
      const res = await request(app.getHttpServer()).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(typeof res.body.timestamp).toBe('string');
      expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
    });

    it('returns 200 without Authorization header', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .set('Authorization', '');

      expect(res.status).toBe(200);
    });
  });

  describe('GET /health/ready', () => {
    it('returns 200 with status ready when database is reachable', async () => {
      const res = await request(app.getHttpServer()).get('/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
    });

    it('returns 200 without authentication', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/ready');

      expect(res.status).toBe(200);
    });
  });
});
