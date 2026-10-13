output "project_id" {
  description = "Google Cloud project ID."
  value       = var.project_id
}

output "region" {
  description = "Deployment region."
  value       = var.region
}

output "artifact_registry_url" {
  description = "Docker repository URL for the API image."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.api.repository_id}"
}

output "workload_identity_provider" {
  description = "Value for the GitHub Actions auth step."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deployer_service_account" {
  description = "Service account that GitHub Actions impersonates."
  value       = google_service_account.deployer.email
}

output "cloud_sql_connection_name" {
  description = "Cloud SQL connection name used by Cloud Run."
  value       = google_sql_database_instance.postgres.connection_name
}

output "cloud_run_service_name" {
  description = "Cloud Run service name used by the deploy step."
  value       = google_cloud_run_v2_service.api.name
}

output "cloud_run_url" {
  description = "Public URL of the API."
  value       = google_cloud_run_v2_service.api.uri
}

output "migration_job_name" {
  description = "Cloud Run job that runs Prisma migrations."
  value       = google_cloud_run_v2_job.migrate.name
}