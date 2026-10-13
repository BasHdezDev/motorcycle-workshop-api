resource "google_artifact_registry_repository" "api" {
  repository_id = "${var.app_name}-repo"
  location      = var.region
  format        = "DOCKER"
  description   = "Imágenes Docker de la API Motorcycle Workshop V3"

  labels = {
    app = var.app_name
  }

  depends_on = [google_project_service.apis]
}