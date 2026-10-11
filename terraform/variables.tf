variable "project_id" {
  description = "V3 Project ID from Google Cloud."
  type        = string
}

variable "region" {
  description = "Unique region for Cloud Run, Cloud SQL and Artifact Registry."
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "Prefix of V3 resourse names."
  type        = string
  default     = "workshop-v3"
}