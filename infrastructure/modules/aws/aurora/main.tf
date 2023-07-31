resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = "!$%&*?"
}

resource "aws_rds_cluster" "default" {
  apply_immediately               = true
  cluster_identifier              = "${var.name}-${var.env}"
  engine                          = "aurora-postgresql"
  engine_mode                     = "provisioned"
  engine_version                  = "13.9"
  availability_zones              = data.aws_availability_zones.current.names.*
  db_subnet_group_name            = var.subnet_group_name
  database_name                   = var.env
  master_username                 = "root"
  master_password                 = random_password.password.result
  backup_retention_period         = 5
  preferred_backup_window         = "07:00-09:00"
  vpc_security_group_ids          = [var.vpc_security_group_id]
  allow_major_version_upgrade     = true
  final_snapshot_identifier       = "${var.name}-${var.env}-final-snapshot"
  db_cluster_parameter_group_name = "aurora-postgresql13-cluster-replication"
  serverlessv2_scaling_configuration {
    max_capacity = 16
    min_capacity = 0.5
  }
}

resource "aws_rds_cluster_instance" "default" {
  cluster_identifier = aws_rds_cluster.default.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.default.engine
  engine_version     = aws_rds_cluster.default.engine_version
  promotion_tier     = 1
}

resource "aws_ssm_parameter" "parameter" {
  name      = "/ecs/${var.name}/${var.env}/PG_DATABASE_URL"
  type      = "SecureString"
  value     = "postgresql://${aws_rds_cluster.default.master_username}:${urlencode(random_password.password.result)}@${aws_rds_cluster.default.endpoint}:${aws_rds_cluster.default.port}/${var.env}?schema=public"
  overwrite = true
  tags = {
    name = "PG_DATABASE_URL"
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
  value   = "postgresql://${aws_rds_cluster.default.master_username}:${urlencode(random_password.password.result)}@${aws_rds_cluster.default.endpoint}:${aws_rds_cluster.default.port}/${var.env}?schema=public"
}
