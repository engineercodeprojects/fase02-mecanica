-- CreateTable
CREATE TABLE "ordem_de_servico_audit_log" (
    "id" TEXT NOT NULL,
    "ordem_de_servico_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "status_anterior" TEXT,
    "status_novo" TEXT,
    "usuario_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordem_de_servico_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ordem_de_servico_audit_log_ordem_de_servico_id_created_at_idx"
  ON "ordem_de_servico_audit_log"("ordem_de_servico_id", "created_at");

-- AddForeignKey
ALTER TABLE "ordem_de_servico_audit_log"
  ADD CONSTRAINT "ordem_de_servico_audit_log_ordem_de_servico_id_fkey"
  FOREIGN KEY ("ordem_de_servico_id") REFERENCES "ordem_de_servico"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
