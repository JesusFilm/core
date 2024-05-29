locals {
  plausible_port  = 8000
  clickhouse_port = 1000
  plausible = {
    environment_variables = [
      "BASE_URL",
      "SECRET_KEY_BASE",
    ]
    service_config = {
      name           = "plausible"
      is_public      = true
      container_port = local.plausible_port
      host_port      = local.plausible_port
      cpu            = 1024
      memory         = 2048
      desired_count  = 1
      alb_dns_name   = var.public_ecs_config.alb_dns_name
      zone_id        = var.public_ecs_config.zone_id
      alb_target_group = merge(var.public_ecs_config.alb_target_group, {
        port = local.plausible_port
      })
      alb_listener = var.public_ecs_config.alb_listener
      auto_scaling = {
        max_capacity = 4
        min_capacity = 1
        cpu = {
          target_value = 75
        }
        memory = {
          target_value = 75
        }
      }
    }
  }
  clickhouse = {
    environment_variables = [
    ]
    service_config = {
      name           = "plausible-clickhouse"
      is_public      = true
      container_port = local.clickhouse_port
      host_port      = local.clickhouse_port
      cpu            = 1024
      memory         = 2048
      desired_count  = 1
      alb_dns_name   = var.internal_ecs_config.alb_dns_name
      zone_id        = var.internal_ecs_config.zone_id
      alb_target_group = merge(var.internal_ecs_config.alb_target_group, {
        port = local.clickhouse_port
      })
      alb_listener = var.internal_ecs_config.alb_listener
      auto_scaling = {
        max_capacity = 4
        min_capacity = 1
        cpu = {
          target_value = 75
        }
        memory = {
          target_value = 75
        }
      }
    }
  }
  # service_config_name_env    = "${var.service_config.name}-${var.env}"
  # ecs_task_definition_family = "jfp-${local.service_config_name_env}"
}

