# Stage 02 — App: recursos base (namespace, senha, Secret do banco).
# O Secret 'oficina-db' e o CONTRATO com a US-F2-05: a app e o Job de
# migrations consomem DATABASE_URL daqui via secretKeyRef.

resource "random_password" "db" {
  count = var.db_password == "" ? 1 : 0

  length  = 24
  special = false # alfanumerico: evita escaping na DATABASE_URL
}

resource "kubernetes_namespace" "app" {
  metadata {
    name = var.app_namespace
    labels = {
      "app.kubernetes.io/part-of"    = var.project_name
      "app.kubernetes.io/managed-by" = "terraform"
    }
  }
}

resource "kubernetes_secret" "db" {
  metadata {
    name      = "oficina-db"
    namespace = kubernetes_namespace.app.metadata[0].name
    labels = {
      "app.kubernetes.io/part-of"    = var.project_name
      "app.kubernetes.io/managed-by" = "terraform"
      "app.kubernetes.io/component"  = "database"
    }
  }

  type = "Opaque"

  # DATABASE_URL e a chave autoritativa; as demais sao conveniencia e
  # alimentam o proprio container Postgres via secretKeyRef.
  data = {
    DATABASE_URL = local.database_url
    DB_HOST      = local.pg_host
    DB_PORT      = tostring(var.db_port)
    DB_NAME      = var.db_name
    DB_USER      = var.db_username
    DB_PASSWORD  = local.db_password
  }
}
