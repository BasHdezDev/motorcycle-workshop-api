locals {
  required_apis = [
    "run.googleapis.com",              # Cloud Run
    "sqladmin.googleapis.com",         # Cloud SQL
    "artifactregistry.googleapis.com", # Artifact Registry
    "secretmanager.googleapis.com",    # Secret Manager
    "iam.googleapis.com",              # Cuentas de servicio y roles
    "iamcredentials.googleapis.com",   # Tokens de corta duración (GitHub Actions)
    "sts.googleapis.com",              # Workload Identity Federation
  ]
}

resource "google_project_service" "apis" {
  for_each = toset(local.required_apis)

  service = each.value

  disable_on_destroy = false
}