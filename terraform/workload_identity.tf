# Pool and provider IDs stay reserved for 30 days after deletion, so a random
# suffix lets us destroy and recreate the V3 without name collisions.
resource "random_id" "wif_suffix" {
  byte_length = 2
}

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "${var.app_name}-gh-${random_id.wif_suffix.hex}"
  display_name              = "GitHub Actions"
  description               = "Lets GitHub Actions authenticate without service account keys"

  depends_on = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub OIDC"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Only tokens issued for this exact repository are accepted.
  attribute_condition = join(" && ", [
    "assertion.repository == \"${var.github_repository}\"",
    "assertion.ref in [${join(", ", formatlist("\"refs/heads/%s\"", var.allowed_branches))}]",
  ])

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "deployer_workload_identity" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repository}"
}