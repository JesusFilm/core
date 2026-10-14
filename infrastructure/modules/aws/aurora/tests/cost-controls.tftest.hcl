mock_provider "aws" {
  mock_resource "aws_iam_role" {
    defaults = {
      arn = "arn:aws:iam::410965620680:role/test-rds-monitoring"
    }
  }

  mock_data "aws_iam_policy_document" {
    defaults = {
      json = "{\"Version\":\"2012-10-17\",\"Statement\":[]}"
    }
  }
}

mock_provider "random" {}
mock_provider "doppler" {}

variables {
  env                     = "stage"
  name                    = "test-core"
  doppler_token           = "test-token"
  doppler_project         = "test"
  subnet_group_name       = "test-subnets"
  vpc_security_group_id   = "sg-00000000000000000"
  PG_DATABASE_URL_ENV_VAR = "PRIVATE_DATABASE_URL"
}

run "preserve_existing_database_defaults" {
  command = plan

  assert {
    condition = (
      aws_rds_cluster.default.engine_version == "13.23" &&
      aws_rds_cluster.default.db_cluster_parameter_group_name == "aurora-postgresql13-cluster-replication" &&
      aws_rds_cluster.default.serverlessv2_scaling_configuration[0].min_capacity == 0.5 &&
      aws_rds_cluster.default.serverlessv2_scaling_configuration[0].max_capacity == 16 &&
      aws_rds_cluster.default.backup_retention_period == 5 &&
      aws_rds_cluster.default.apply_immediately &&
      var.storage_type == null
    )
    error_message = "Adding cost controls must preserve existing engine, replication group, capacity, backup and apply defaults."
  }
}

run "select_io_optimized_without_upgrading_or_reducing_capacity" {
  command = plan

  variables {
    storage_type = "aurora-iopt1"
  }

  assert {
    condition = (
      aws_rds_cluster.default.storage_type == "aurora-iopt1" &&
      aws_rds_cluster.default.engine_version == "13.23" &&
      aws_rds_cluster.default.backup_retention_period == 5 &&
      aws_rds_cluster.default.serverlessv2_scaling_configuration[0].min_capacity == 0.5 &&
      aws_rds_cluster.default.serverlessv2_scaling_configuration[0].max_capacity == 16
    )
    error_message = "The I/O-Optimized rollout must not also change engine version, backups or capacity."
  }
}

run "configure_a_separate_engine_rollout" {
  command = plan

  variables {
    engine_version                  = "17.11"
    db_cluster_parameter_group_name = "test-postgresql17-replication"
    apply_immediately               = false
  }

  assert {
    condition = (
      aws_rds_cluster.default.engine_version == "17.11" &&
      aws_rds_cluster_instance.default.engine_version == "17.11" &&
      aws_rds_cluster.default.db_cluster_parameter_group_name == "test-postgresql17-replication" &&
      !aws_rds_cluster.default.apply_immediately
    )
    error_message = "Engine, instance version, parameter group and apply timing must follow the selected environment inputs."
  }
}

run "reject_non_aurora_storage" {
  command = plan

  variables {
    storage_type = "gp3"
  }

  expect_failures = [var.storage_type]
}

run "reject_reversed_capacity_bounds" {
  command = plan

  variables {
    serverlessv2_capacity = {
      min_capacity = 16
      max_capacity = 0.5
    }
  }

  expect_failures = [var.serverlessv2_capacity]
}
