mock_provider "aws" {
  mock_data "aws_rds_cluster" {
    defaults = { engine_version = "13.23" }
  }

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
  enforce_major_upgrade_approval = true
  env                            = "stage"
  name                           = "test-core"
  doppler_token                  = "test-token"
  doppler_project                = "test"
  subnet_group_name              = "test-subnets"
  vpc_security_group_id          = "sg-00000000000000000"
  PG_DATABASE_URL_ENV_VAR        = "PRIVATE_DATABASE_URL"
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
    allow_major_version_upgrade     = true
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

run "upgrade_with_a_new_compatible_parameter_group" {
  command = plan
  variables {
    allow_major_version_upgrade     = true
    engine_version                  = "17.11"
    db_cluster_parameter_group_name = null
    managed_parameter_group_family  = "aurora-postgresql17"
    db_parameter_group_name         = "default.aurora-postgresql17"
    apply_immediately               = true
    managed_cluster_parameters = {
      "rds.logical_replication"    = { value = "1", apply_method = "pending-reboot" }
      "log_min_duration_statement" = { value = "5000", apply_method = "immediate" }
      "rds.force_ssl"              = { value = "0", apply_method = "immediate" }
    }
  }
  assert {
    condition = (
      aws_rds_cluster_parameter_group.upgrade[0].family == "aurora-postgresql17" &&
      aws_rds_cluster_parameter_group.upgrade[0].name == "test-core-stage-aurora-postgresql17" &&
      aws_rds_cluster.default.engine_version == "17.11" &&
      aws_rds_cluster_instance.default.db_parameter_group_name == "default.aurora-postgresql17" &&
      aws_rds_cluster.default.apply_immediately &&
      aws_rds_cluster_instance.default.apply_immediately &&
      aws_rds_cluster.default.backup_retention_period == 5 &&
      length(aws_rds_cluster_parameter_group.upgrade[0].parameter) == 3
    )
    error_message = "The major upgrade must use a new matching group, preserve settings and backups, and complete cluster changes before instance changes in the approved rollout window."
  }
}

run "reject_parameter_group_for_a_different_major" {
  command = plan
  variables {
    allow_major_version_upgrade    = true
    engine_version                 = "17.11"
    managed_parameter_group_family = "aurora-postgresql16"
  }
  expect_failures = [aws_rds_cluster.default]
}

run "reject_implicit_major_upgrade" {
  command = plan
  variables {
    engine_version                  = "17.11"
    db_cluster_parameter_group_name = "test-postgresql17-replication"
  }
  expect_failures = [aws_rds_cluster.default]
}

run "allow_ordinary_plan_after_major_upgrade_without_approval" {
  command = plan
  variables {
    engine_version                  = "17.11"
    db_cluster_parameter_group_name = "test-postgresql17-replication"
  }
  override_data {
    target = data.aws_rds_cluster.live
    values = { engine_version = "17.11" }
  }
  assert {
    condition     = !aws_rds_cluster.default.allow_major_version_upgrade
    error_message = "A completed major upgrade must not require permanent approval for ordinary plans."
  }
}

run "reject_production_major_upgrade_without_its_own_approval" {
  command = plan
  variables {
    env                             = "prod"
    engine_version                  = "17.11"
    db_cluster_parameter_group_name = "test-postgresql17-replication"
  }
  expect_failures = [aws_rds_cluster.default]
}
