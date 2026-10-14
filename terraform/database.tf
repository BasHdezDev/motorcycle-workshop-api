resource "google_sql_database" "app" {
  name     = var.db_name
  instance = google_sql_database_instance.postgres.name

  # Postgres refuses to drop a database that has open connections. The database
  # disappears with the instance, so Terraform does not drop it separately.
  deletion_policy = "ABANDON"
}

resource "random_password" "db_password" {
  length  = 32
  special = false # avoids URL-encoding problems inside DATABASE_URL
}

resource "google_sql_user" "app" {
  name     = var.db_user
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result

  # Postgres refuses to drop a database that has open connections. The database
  # disappears with the instance, so Terraform does not drop it separately.
  deletion_policy = "ABANDON"
}