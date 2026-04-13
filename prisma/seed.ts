import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient, Role } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TEST_USERS = [
  { nome: 'Admin Oficina', email: 'admin@oficina.com', role: Role.ADMIN, senha: 'admin123' },
  { nome: 'Atendente Teste', email: 'atendente@oficina.com', role: Role.ATENDENTE, senha: 'atendente123' },
  { nome: 'Mecanico Teste', email: 'mecanico@oficina.com', role: Role.MECANICO, senha: 'mecanico123' },
  { nome: 'Estoquista Teste', email: 'estoquista@oficina.com', role: Role.ESTOQUISTA, senha: 'estoquista123' },
  { nome: 'Cliente Teste', email: 'cliente@oficina.com', role: Role.CLIENTE, senha: 'cliente123' },
];

async function main() {
  console.log('Seeding database...');

  for (const user of TEST_USERS) {
    const senhaHash = await bcrypt.hash(user.senha, 10);

    await prisma.usuario.upsert({
      where: { email: user.email },
      update: {},
      create: {
        nome: user.nome,
        email: user.email,
        senhaHash,
        role: user.role,
        ativo: true,
      },
    });

    console.log(`  ✓ ${user.role.padEnd(12)} ${user.email}  (senha: ${user.senha})`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
