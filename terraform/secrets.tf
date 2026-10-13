resource "google_secret_manager_secret" "database_url" {
  secret_id = "${var.app_name}-database-url"

  replication {
    auto {}
  }

  labels = {
    app = var.app_name
  }

  depends_on = [google_project_service.apis]
}