locals {
  port = 8000

  environment_variables = [
    "BASE_URL",
    "SECRET_KEY_BASE",
  ]
  service_config = {
    name           = "plausible"
    is_public      = true
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 2048
    desired_count  = 1
    alb_dns_name   = var.public_ecs_config.alb_dns_name
    zone_id        = var.public_ecs_config.zone_id
    alb_target_group = merge(var.public_ecs_config.alb_target_group, {
      port = local.port
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


  service_config_name_env    = "${var.service_config.name}-${var.env}"
  ecs_task_definition_family = "jfp-${local.service_config_name_env}"
}

