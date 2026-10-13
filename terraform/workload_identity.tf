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