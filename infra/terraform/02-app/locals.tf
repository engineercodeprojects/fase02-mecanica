# Stage 02 — App: locals derivados.
locals {
  # Senha: override explicito ou gerada pelo Terraform.
  db_password = var.db_password != "" ? var.db_password : one(random_password.db[*].result)

  # Service DNS interno do Postgres.
  pg_service_name = "${var.project_name}-postgres"
  pg_host         = "${local.pg_service_name}.${var.app_namespace}.svc.cluster.local"

  database_endpoint = "${local.pg_host}:${var.db_port}"

  # ?schema=public alinhado ao .env.example para o Prisma se comportar igual.
  database_url = "postgresql://${var.db_username}:${local.db_password}@${local.pg_host}:${var.db_port}/${var.db_name}?schema=public"
}
