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

resource "google_secret_manager_secret_iam_member" "runtime_api_key" {
  secret_id = google_secret_manager_secret.api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_service_account" "deployer" {
  account_id   = "${var.app_name}-deployer"
  display_name = "GitHub Actions deployer (Motorcycle Workshop V3)"

  depends_on = [google_project_service.apis]
}

# Allows deploying Cloud Run revisions that run as the runtime account.
resource "google_service_account_iam_member" "deployer_acts_as_runtime" {
  service_account_id = google_service_account.runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deployer.email}"
}

locals {
  # Roles the deployer needs so the pipeline can run `terraform apply`.
  # Broader than a deploy-only account, so trust is limited to this repository
  # and infrastructure applies only run when triggered manually.
  deployer_roles = [
    "roles/serviceusage.serviceUsageAdmin",
    "roles/artifactregistry.admin",
    "roles/cloudsql.admin",
    "roles/secretmanager.admin",
    "roles/run.admin",
    "roles/iam.serviceAccountAdmin",
    "roles/iam.workloadIdentityPoolAdmin",
    "roles/resourcemanager.projectIamAdmin",
  ]
}

resource "google_project_iam_member" "deployer" {
  for_each = toset(local.deployer_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.deployer.email}"
}

# The state bucket is created by hand (outside this state), so Terraform only
# manages the access binding, never the bucket itself.
resource "google_storage_bucket_iam_member" "deployer_state" {
  bucket = var.state_bucket
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.deployer.email}"
}