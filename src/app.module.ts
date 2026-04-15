import { ServicoModule } from './servico/servico.module';
import { ProdutoModule } from './produto/produto.module';
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { ClienteModule } from "./cliente/cliente.module";
import { VeiculoModule } from "./veiculo/veiculo.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ServicoModule,
    ProdutoModule,
    ClienteModule,
    VeiculoModule,
  ],
})
export class AppModule {}
