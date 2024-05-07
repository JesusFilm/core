locals {
  service_config_name_env    = "${var.service_config.name}-${var.env}"
  ecs_task_definition_family = "jfp-${local.service_config_name_env}"


  plausible = {
    environment_variables = [
      "BASE_URL",
      "SECRET_KEY_BASE",
    ]
    port         = 4000
    docker_image = "plausible/analytics@v2"
    service_config = {
      name           = local.service_config_name_env
      is_public      = true
      container_port = local.plausible.port
      host_port      = local.plausible.port
      cpu            = 512
      memory         = 1024
      desired_count  = 1
      alb_dns_name   = var.external_ecs_config.alb_dns_name
      zone_id        = var.external_ecs_config.zone_id
      alb_target_group = merge(var.external_ecs_config.alb_target_group, {
        port = local.plausible.port
      })
      alb_listener = var.external_ecs_config.alb_listener
      auto_scaling = {
        max_capacity = 2
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
      "BASE_URL",
      "SECRET_KEY_BASE",
    ]
    port         = 4000
    docker_image = "clickhouse/clickhouse-server:23.3.7.5-alpine"
    service_config = {
      name           = "clickhouse-${local.service_config_name_env}"
      is_public      = false
      container_port = local.plausible.port
      host_port      = local.plausible.port
      cpu            = 512
      memory         = 1024
      desired_count  = 1
      alb_dns_name   = var.internal_ecs_config.alb_dns_name
      zone_id        = var.internal_ecs_config.zone_id
      alb_target_group = merge(var.internal_ecs_config.alb_target_group, {
        port = local.plausible.port
      })
      alb_listener = var.internal_ecs_config.alb_listener
      auto_scaling = {
        max_capacity = 1
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
}

