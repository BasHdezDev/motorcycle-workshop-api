# Copies Terraform outputs into GitHub Actions variables.
# Run from the repository root after every `terraform apply`.
$vars = @{
  GCP_PROJECT_ID                 = "project_id"
  GCP_REGION                     = "region"
  GCP_WORKLOAD_IDENTITY_PROVIDER = "workload_identity_provider"
  GCP_SERVICE_ACCOUNT            = "deployer_service_account"
  GCP_ARTIFACT_REGISTRY_URL      = "artifact_registry_url"
  GCP_CLOUD_RUN_SERVICE          = "cloud_run_service_name"
  GCP_MIGRATION_JOB              = "migration_job_name"
}

foreach ($name in $vars.Keys) {
  $value = terraform -chdir=terraform output -raw $vars[$name]
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Host "EMPTY: $name (output $($vars[$name]))" -ForegroundColor Red
    continue
  }
  gh variable set $name --body $value
}

gh variable list