resource "random_id" "db_suffix" {
  byte_length = 2
}

resource "google_sql_database_instance" "postgres" {
  name             = "${var.app_name}-db-${random_id.db_suffix.hex}"
  region           = var.region
  database_version = "POSTGRES_17"

  deletion_protection = var.db_deletion_protection

  settings {
    tier              = var.db_tier
    edition           = "ENTERPRISE"
    availability_type = "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = 10
    disk_autoresize   = false

    deletion_protection_enabled = var.db_deletion_protection

    backup_configuration {
      enabled = false
    }

    ip_configuration {
      ipv4_enabled = true
      # No authorized_networks: Cloud Run connects through the Cloud SQL integration.
    }

    user_labels = {
      app = var.app_name
    }
  }

  depends_on = [google_project_service.apis]
}