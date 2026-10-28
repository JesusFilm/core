resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = "!$%&*?"
}

resource "aws_rds_cluster" "default" {
  apply_immediately               = var.apply_immediately
  cluster_identifier              = "${var.name}-${var.env}"
  engine                          = "aurora-postgresql"
  engine_mode                     = "provisioned"
  engine_version                  = var.engine_version
  storage_type                    = var.storage_type
  availability_zones              = data.aws_availability_zones.current.names.*
  db_subnet_group_name            = var.subnet_group_name
  database_name                   = var.env
  master_username                 = "root"
  master_password                 = random_password.password.result
  backup_retention_period         = 5
  preferred_backup_window         = "07:00-09:00"
  vpc_security_group_ids          = [var.vpc_security_group_id]
  allow_major_version_upgrade     = var.allow_major_version_upgrade
  final_snapshot_identifier       = "${var.name}-${var.env}-final-snapshot"
  db_cluster_parameter_group_name = var.managed_parameter_group_family == null ? var.db_cluster_parameter_group_name : aws_rds_cluster_parameter_group.upgrade[0].name
  enabled_cloudwatch_logs_exports = ["postgresql"]
  serverlessv2_scaling_configuration {
    max_capacity = var.serverlessv2_capacity.max_capacity
    min_capacity = var.serverlessv2_capacity.min_capacity
  }

  lifecycle {
    precondition {
      condition = var.enforce_major_upgrade_approval ? (
        split(".", var.engine_version)[0] == split(".", data.aws_rds_cluster.live[0].engine_version)[0] ||
        var.allow_major_version_upgrade
      ) : true
      error_message = "Changing the live Aurora major version requires explicit per-environment approval in the reviewed plan. Complete the UPGRADES.md preflight first."
    }
    precondition {
      condition     = var.managed_parameter_group_family == null ? var.db_cluster_parameter_group_name != null : var.managed_parameter_group_family == "aurora-postgresql${split(".", var.engine_version)[0]}"
      error_message = "A managed parameter group must match the Aurora PostgreSQL engine major version."
    }
  }
}

resource "aws_rds_cluster_parameter_group" "upgrade" {
  count       = var.managed_parameter_group_family == null ? 0 : 1
  name        = "${var.name}-${var.env}-${var.managed_parameter_group_family}"
  family      = var.managed_parameter_group_family
  description = "${var.name} ${var.env} version-compatible cluster parameters"

  dynamic "parameter" {
    for_each = var.managed_cluster_parameters
    content {
      name         = parameter.key
      value        = parameter.value.value
      apply_method = parameter.value.apply_method
    }
  }

  tags = {
    Name        = "${var.name}-${var.env}-${var.managed_parameter_group_family}"
    Environment = var.env
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_rds_cluster_instance" "default" {
  cluster_identifier      = aws_rds_cluster.default.id
  instance_class          = "db.serverless"
  engine                  = aws_rds_cluster.default.engine
  engine_version          = aws_rds_cluster.default.engine_version
  db_parameter_group_name = var.db_parameter_group_name
  apply_immediately       = var.apply_immediately
  promotion_tier          = 1

  performance_insights_enabled = true
  monitoring_interval          = 15
  monitoring_role_arn          = aws_iam_role.rds_enhanced_monitoring.arn
}

resource "aws_ssm_parameter" "new_parameter" {
  name      = "/ecs/${var.name}/${var.env}/${var.PG_DATABASE_URL_ENV_VAR}"
  type      = "SecureString"
  value     = "postgresql://${aws_rds_cluster.default.master_username}:${urlencode(random_password.password.result)}@${aws_rds_cluster.default.endpoint}:${aws_rds_cluster.default.port}/${var.env}?schema=public"
  overwrite = true
  tags = {
    name = var.PG_DATABASE_URL_ENV_VAR
  }
}

resource "doppler_secret" "rds_password" {
  name    = "PG_PASSWORD"
  config  = var.env == "prod" ? "prd" : "stg"
  project = var.doppler_project
  value   = random_password.password.result
}


resource "doppler_secret" "new_rds_url" {
  name    = var.PG_DATABASE_URL_ENV_VAR
  config  = var.env == "prod" ? "prd" : "stg"
  project = var.doppler_project
  value   = "postgresql://${aws_rds_cluster.default.master_username}:${urlencode(random_password.password.result)}@${aws_rds_cluster.default.endpoint}:${aws_rds_cluster.default.port}/${var.env}?schema=public"
}

resource "aws_iam_role" "rds_enhanced_monitoring" {
  name_prefix        = "rds-enhanced-monitoring-"
  assume_role_policy = data.aws_iam_policy_document.rds_enhanced_monitoring.json
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  role       = aws_iam_role.rds_enhanced_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

data "aws_iam_policy_document" "rds_enhanced_monitoring" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["monitoring.rds.amazonaws.com"]
    }
  }
}
