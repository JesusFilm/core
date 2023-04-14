resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = "!$%&*?"
}

resource "aws_rds_cluster" "default" {
  apply_immediately       = true
  cluster_identifier      = "${var.name}-${var.env}"
  engine                  = "aurora-postgresql"
  engine_mode             = "serverless"
  engine_version          = null
  availability_zones      = data.aws_availability_zones.current.names.*
  db_subnet_group_name    = var.subnet_group_name
  database_name           = var.env
  master_username         = "root"
  master_password         = random_password.password.result
  backup_retention_period = 5
  preferred_backup_window = "07:00-09:00"
  vpc_security_group_ids  = [var.vpc_security_group_id]
  scaling_configuration {
    min_capacity = 2
  }
}

resource "doppler_secret" "rds_password" {
  name    = "PG_PASSWORD"
  config  = var.env == "prod" ? "prd" : "stg"
  project = var.doppler_project
  value   = random_password.password.result
}

resource "doppler_secret" "rds_url" {
  name    = "PG_DATABASE_URL"
  config  = var.env == "prod" ? "prd" : "stg"
  project = var.doppler_project
  value   = "postgresql://${aws_rds_cluster.default.master_username}:${random_password.password.result}@${aws_rds_cluster.default.endpoint}:${aws_rds_cluster.default.port}/${var.env}?schema=public"
}
