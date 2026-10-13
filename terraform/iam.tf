resource "google_service_account" "runtime" {
  account_id   = "${var.app_name}-runtime"
  display_name = "Cloud Run runtime (Motorcycle Workshop V3)"

  depends_on = [google_project_service.apis]
}

# Lets the API open connections to Cloud SQL through the Cloud Run integration.
resource "google_project_iam_member" "runtime_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.runtime.email}"
}

# Lets the API read only the DATABASE_URL secret, not every secret in the project.
resource "google_secret_manager_secret_iam_member" "runtime_database_url" {
  secret_id = google_secret_manager_secret.database_url.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}