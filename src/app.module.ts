import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ClienteModule } from "./cliente/cliente.module";
import { VeiculoModule } from "./veiculo/veiculo.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClienteModule,
    VeiculoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
