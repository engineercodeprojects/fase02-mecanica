# Stage 02 — App: Postgres no cluster (PVC + Deployment + Service), imagem
# oficial postgres:16-alpine.

resource "kubernetes_persistent_volume_claim" "postgres" {
  metadata {
    name      = "${var.project_name}-postgres-data"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  spec {
    access_modes       = ["ReadWriteOnce"]
    storage_class_name = var.pg_storage_class
    resources {
      requests = {
        storage = var.pg_storage_size
      }
    }
  }

  # kind usa StorageClass 'standard' com WaitForFirstConsumer: o PVC so liga
  # quando um pod o consome. Sem isto o apply travaria esperando o bind.
  wait_until_bound = false
}

resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = local.pg_service_name
    namespace = kubernetes_namespace.app.metadata[0].name
    labels    = { "app.kubernetes.io/name" = local.pg_service_name }
  }

  spec {
    replicas = 1

    strategy {
      type = "Recreate" # volume RWO: nunca dois pods montando ao mesmo tempo
    }

    selector {
      match_labels = { "app.kubernetes.io/name" = local.pg_service_name }
    }

    template {
      metadata {
        labels = { "app.kubernetes.io/name" = local.pg_service_name }
      }

      spec {
        container {
          name  = "postgres"
          image = var.postgres_image

          port {
            name           = "postgres"
            container_port = 5432
          }

          env {
            name = "POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.db.metadata[0].name
                key  = "DB_USER"
              }
            }
          }
          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.db.metadata[0].name
                key  = "DB_PASSWORD"
              }
            }
          }
          env {
            name = "POSTGRES_DB"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.db.metadata[0].name
                key  = "DB_NAME"
              }
            }
          }
          env {
            name  = "PGDATA"
            value = "/var/lib/postgresql/data/pgdata"
          }

          volume_mount {
            name       = "data"
            mount_path = "/var/lib/postgresql/data"
          }

          readiness_probe {
            exec {
              command = ["pg_isready", "-U", var.db_username, "-d", var.db_name]
            }
            initial_delay_seconds = 5
            period_seconds        = 10
          }

          liveness_probe {
            exec {
              command = ["pg_isready", "-U", var.db_username, "-d", var.db_name]
            }
            initial_delay_seconds = 30
            period_seconds        = 15
            # Single-instance: tolerante a stalls (checkpoint/initdb) para nao
            # reiniciar um DB saudavel. ~30s + 6*15s antes de matar o container.
            failure_threshold = 6
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "256Mi"
            }
          }
        }

        volume {
          name = "data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "postgres" {
  metadata {
    name      = local.pg_service_name
    namespace = kubernetes_namespace.app.metadata[0].name
    labels    = { "app.kubernetes.io/name" = local.pg_service_name }
  }

  spec {
    type     = "ClusterIP"
    selector = { "app.kubernetes.io/name" = local.pg_service_name }
    port {
      port        = 5432
      target_port = 5432
    }
  }
}
