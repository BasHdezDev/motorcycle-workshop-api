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

variable "db_tier" {
  description = "Machine type for the Cloud SQL instance (shared-core is the cheapest)."
  type        = string
  default     = "db-f1-micro"
}

variable "db_deletion_protection" {
  description = "Protects Cloud SQL from deletion. Keep false for the V3 so terraform destroy works."
  type        = bool
  default     = false
}

variable "db_name" {
  description = "Name of the application database inside the Cloud SQL instance."
  type        = string
  default     = "motorcycle_workshop"
}

variable "db_user" {
  description = "Application database user."
  type        = string
  default     = "workshop_user"
}