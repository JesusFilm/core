locals {
  port = 3000
  environment_variables = [
    "NEXT_PUBLIC_GATEWAY_URL"
  ]
  service_config = {
    name           = "arclight"
    is_public      = true
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 2048
    desired_count  = 1
    zone_id        = var.ecs_config.zone_id
    alb = {
      arn      = var.ecs_config.alb.arn
      dns_name = var.ecs_config.alb.dns_name
    }
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
    })
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
