import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { AppService } from './app.service';
import { AppController } from './app.controller';

const mockPrismaService = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
};

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide PrismaService via PrismaModule', () => {
    const prisma = module.get<PrismaService>(PrismaService);
    expect(prisma).toBeDefined();
  });

  it('should provide AppService', () => {
    const service = module.get<AppService>(AppService);
    expect(service).toBeDefined();
  });

  it('should provide AppController', () => {
    const controller = module.get<AppController>(AppController);
    expect(controller).toBeDefined();
  });
});
