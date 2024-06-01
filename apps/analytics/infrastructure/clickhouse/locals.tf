locals {
  port = 8123

  environment_variables = [
  ]
  service_config = {
    name           = "clickhouse"
    is_public      = false
    container_port = local.port
    host_port      = local.port
    cpu            = 2048
    memory         = 4096
    desired_count  = 1
    alb_dns_name   = var.ecs_config.alb_dns_name
    zone_id        = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
    })
    alb_listener = merge(var.ecs_config.alb_listener, {
      port = local.port
    })
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

