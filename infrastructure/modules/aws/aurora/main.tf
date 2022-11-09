resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = "!$%&*?"
}

resource "aws_rds_cluster" "default" {
  cluster_identifier      = "${var.name}-${var.env}"
  engine                  = "aurora-postgresql"
  engine_version          = "13.7"
  availability_zones      = data.aws_availability_zones.current.names.*
  db_subnet_group_name    = var.env
  database_name           = var.env
  master_username         = "root"
  master_password         = random_password.password.result
  backup_retention_period = 5
  preferred_backup_window = "07:00-09:00"
}

resource "aws_ssm_parameter" "rds_url" {
  name      = "/rds/${var.name}/${var.env}/PG_DATABASE_URL"
  type      = "SecureString"
  value     = "postgresql://${aws_rds_cluster.default.master_username}:${random_password.password.result}@${aws_rds_cluster.default.endpoint}:${aws_rds_cluster.default.port}/${var.env}?schema=public"
  overwrite = true
}
