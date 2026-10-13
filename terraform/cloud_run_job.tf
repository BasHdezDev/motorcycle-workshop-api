resource "google_cloud_run_v2_job" "migrate" {
  name     = "${var.app_name}-migrate"
  location = var.region

  # Provider default is true; it must be false so terraform destroy works.
  deletion_protection = false

  template {
    template {
      service_account = google_service_account.runtime.email
      max_retries     = 0
      timeout         = "300s"

      volumes {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [google_sql_database_instance.postgres.connection_name]
        }
      }

      containers {
        # Placeholder image. GitHub Actions sets the real one before executing the job.
        image   = "us-docker.pkg.dev/cloudrun/container/hello"
        command = ["npx"]
        args    = ["prisma", "migrate", "deploy"]

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }

        volume_mounts {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }

        env {
          name = "DATABASE_URL"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.database_url.secret_id
              version = "latest"
            }
          }
        }
      }
    }
  }

  # Terraform owns the job definition; the pipeline owns the image version.
  lifecycle {
    ignore_changes = [
      template[0].template[0].containers[0].image,
      client,
      client_version,
    ]
  }

  depends_on = [
    google_secret_manager_secret_version.database_url,
    google_secret_manager_secret_iam_member.runtime_database_url,
    google_project_iam_member.runtime_cloudsql_client,
  ]
}