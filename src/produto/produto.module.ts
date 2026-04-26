import { Module } from '@nestjs/common';
import { ProdutoService } from './application/produto.service';
import { ProdutoController } from './infrastructure/produto.controller';
import { PrismaProdutoRepository } from './infrastructure/prisma-produto.repository';
import { PRODUTO_REPOSITORY } from './domain/produto.repository';

@Module({
  controllers: [ProdutoController],
  providers: [
    ProdutoService,
    {
      provide: PRODUTO_REPOSITORY,
      useClass: PrismaProdutoRepository,
    },
  ],
  exports: [ProdutoService, PRODUTO_REPOSITORY],
})
export class ProdutoModule {}
