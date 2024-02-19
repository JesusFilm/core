locals {
  port = 4004
  environment_variables = [
    "PG_DATABASE_URL_VIDEOS",
    "ARCLIGHT_API_KEY",
    "ARCLIGHT_V3_URL",
    "CROWDIN_API_KEY"
  ]
  service_config = {
    name           = "api-videos"
    is_public      = false
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 4096
    desired_count  = 1
    alb_dns_name   = var.ecs_config.alb_dns_name
    zone_id        = var.ecs_config.zone_id
    alb_listener = merge(var.ecs_config.alb_listener, {
      port = local.port
    })
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
    })
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
