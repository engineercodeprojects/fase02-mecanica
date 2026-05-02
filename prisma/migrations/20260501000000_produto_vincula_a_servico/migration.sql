-- Repagina o vinculo de produto na OS:
-- Antes: ItemOrdemDeServicoProduto -> OrdemDeServico (produto avulso na OS)
-- Depois: ItemOrdemDeServicoProduto -> ItemOrdemDeServicoServico (produto consumido por um servico especifico)
--
-- Como acordado no contexto MVP, dados existentes em item_ordem_de_servico_produto
-- sao descartados. Reseed cobre o ambiente de demo.

DROP TABLE IF EXISTS "item_ordem_de_servico_produto";

CREATE TABLE "item_ordem_de_servico_produto" (
    "id" TEXT NOT NULL,
    "item_ordem_de_servico_servico_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_ordem_de_servico_produto_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "item_ordem_de_servico_produto_item_servico_id_produto_id_key"
  ON "item_ordem_de_servico_produto"("item_ordem_de_servico_servico_id", "produto_id");

ALTER TABLE "item_ordem_de_servico_produto"
  ADD CONSTRAINT "item_ordem_de_servico_produto_item_servico_id_fkey"
  FOREIGN KEY ("item_ordem_de_servico_servico_id")
  REFERENCES "item_ordem_de_servico_servico"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "item_ordem_de_servico_produto"
  ADD CONSTRAINT "item_ordem_de_servico_produto_produto_id_fkey"
  FOREIGN KEY ("produto_id")
  REFERENCES "produto"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
