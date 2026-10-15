terraform {
  backend "gcs" {
    bucket = "motorcycle-workshop-v3-tfstate"
    prefix = "terraform/state"
  }
}